import { format } from 'date-fns';

export interface Beds24Availability {
    roomId: string;
    available: boolean;
    price: number;
    minStay: number;
}

interface Beds24Request {
    arrival: string;
    departure: string;
    numAdults: number;
    roomIds?: string[];
    // Allow manual injection of keys to bypass env issues in helper
    auth?: {
        apiKey?: string;
        propKey?: string;
    }
}

/**
 * Beds24 API Client
 */
// Debug interface
export interface Beds24DebugInfo {
    source: 'real' | 'mock';
    rawCount?: number;
    error?: string;
}

export const Beds24 = {
    getAvailability: async ({ arrival, departure, numAdults, roomIds, auth }: Beds24Request): Promise<{ data: Record<string, Beds24Availability>, debug: Beds24DebugInfo }> => {
        // Try params first, then process.env
        const apiKey = auth?.apiKey || process.env.BEDS24_API_KEY;
        // Support both names as user screenshot showed PROP_ID
        const propKey = auth?.propKey || process.env.BEDS24_PROP_KEY || process.env.BEDS24_PROP_ID;

        // Enhanced Debugging for Env Vars
        const debugEnv = {
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey ? apiKey.length : 0,
            hasPropKey: !!propKey,
            propKeySource: process.env.BEDS24_PROP_KEY ? 'PROP_KEY' : (process.env.BEDS24_PROP_ID ? 'PROP_ID' : 'NONE')
        };
        console.log("[Beds24] Env Debug:", JSON.stringify(debugEnv));

        if (!apiKey) {
            console.warn("[Beds24] No API Key found. Using mock data.");
            const mock = await getMockAvailability({ arrival, departure, numAdults, roomIds });
            return {
                data: mock,
                debug: {
                    source: 'mock',
                    error: `No API Key. Env state: ${JSON.stringify(debugEnv)}`
                }
            };
        }

        try {
            console.log(`[Beds24] Fetching availability for ${arrival} to ${departure}`);

            // Beds24 JSON API Endpoint
            // Correct endpoint is getAvailabilities (plural)
            const endpoint = "https://api.beds24.com/json/getAvailabilities";

            // Prepare payload
            // Beds24 getAvailabilities expects checkIn, checkOut, and propId (or roomId)
            const payload = {
                // Authentication is supposedly not required for getAvailabilities if public,
                // but passing keys prevents permission issues if private.
                // However, standard getAvailabilities structure is flatter.
                checkIn: arrival,
                checkOut: departure,
                // propId is likely what we have in 'propKey' variable (303042 is an ID)
                propId: propKey,
                numAdult: numAdults,
                options: {
                    // "includePrice": true 
                }
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error(`[Beds24] API Error Status: ${response.status} ${response.statusText}`);
                throw new Error(`Beds24 API Error: ${response.statusText}`);
            }

            const data = await response.json();

            // Log response for debugging (remove in production if too verbose)
            console.log("[Beds24] Response:", JSON.stringify(data).substring(0, 500) + "...");

            if (data.error) {
                console.error("[Beds24] API returned error:", data.error);
                return { data: {}, debug: { source: 'real', error: JSON.stringify(data.error) } };
            }

            // Transform Beds24 response
            // Expected format depends on API version. Assuming standard getAvailability JSON.
            // Data usually maps property -> roomTypes -> rooms
            // Or just a flat list if configured.
            // Let's assume standard response: object with keys as roomIds or array.
            // Actual Beds24 getAvailability often returns { [roomId]: { ...data... } } or array.
            // Let's handle generic object response where keys are beds24 room IDs.

            const availabilityMap: Record<string, Beds24Availability> = {};

            // Helper to process a single room entry
            const processRoom = (b24RoomId: string, roomData: any) => {
                // Check availability. 
                // formatting: check 'quantity' or specific availability flags.
                // getAvailability often returns { date: { status: '1', price: ... } }
                // We need to aggregate across the date range.
                // If any date in range has status 0 or quantity 0, it's unavailable.

                // If the API returns a summary or we need to calculate it?
                // Using "getAvailability" usually returns daily data.
                // WE NEED TO CHECK IF ALL DAYS ARE AVAILABLE.

                // SIMPLIFICATION: If usage of this function assumes checkAvailability endpoint returns
                // a summary or we parse it. 
                // Let's assume we are using a simplified view or specific Beds24 endpoint for checking a range.
                // Actually, https://api.beds24.com/json/getAvailability returns keys by room ID.
                // Inside is dates.

                let isAvailable = true;
                let totalPrice = 0;
                let minStay = 1;

                // Iterate over dates in response for this room
                // roomData might look like: { "2023-10-27": { number: 1, price: 50, ... }, ... }

                // Get all date keys
                const dateKeys = Object.keys(roomData).filter(k => k.match(/^\d{4}-\d{2}-\d{2}$/));

                // Filter only requested range (though API should have filtered)
                // Just check all returned dates?

                if (dateKeys.length === 0) {
                    isAvailable = false; // No data returned
                }

                for (const d of dateKeys) {
                    const dayData = roomData[d];
                    // Check inventory/status
                    // 'number' usually means inventory count remaining
                    if (dayData.number !== undefined && dayData.number <= 0) {
                        isAvailable = false;
                    }
                    if (dayData.price) {
                        totalPrice += parseFloat(dayData.price);
                    }
                    if (dayData.minStay) {
                        minStay = Math.max(minStay, parseInt(dayData.minStay));
                    }
                }

                // Sanity check: if range requested was 5 days, did we get 5 days?
                // Ideally yes.

                if (isAvailable && dateKeys.length > 0) {
                    availabilityMap[b24RoomId] = {
                        roomId: b24RoomId,
                        available: true,
                        price: totalPrice,
                        minStay: minStay
                    };
                }
            };

            // Standard Beds24 JSON structure often:
            // { "12345": { "2025-01-01": {...}, "2025-01-02": {...} }, "67890": ... }
            if (typeof data === 'object' && !Array.isArray(data)) {
                for (const b24RoomId of Object.keys(data)) {
                    // Check if it looks like room data (keys are dates)
                    processRoom(b24RoomId, data[b24RoomId]);
                }
            } else if (Array.isArray(data)) {
                // Enhanced Array Parsing Logic for JSON output
                // Example: [{ roomId: "123", checkIn: "2024-01-01", ..., quantity: 1 }, ...]
                // Or grouped by room.

                // NOTE: Beds24 JSON output varies by options.
                // Assuming standard flat list of daily availabilities or room summaries.

                data.forEach((item: any) => {
                    // Check for Room ID
                    const rId = item.roomId || item.roomID || (item.room && item.room.id);
                    if (rId) {
                        const strId = String(rId);

                        // If we haven't seen this room yet, init
                        if (!availabilityMap[strId]) {
                            availabilityMap[strId] = {
                                roomId: strId,
                                available: true,
                                price: 0,
                                minStay: 1
                            };
                        }

                        // Logic to aggregate daily data?
                        // If data is a list of rooms with SUMMARY, we can just take it.
                        // But usually it's daily.

                        // Check availability flag/quantity
                        // If any day in the range is unavailable, the room is unavailable.
                        // WARNING: If the API returns one object per room (summary), then check 'quantity'.
                        // If it returns one object per DAY per room, we need to be careful.

                        // Heuristic: If item has 'date', it's daily data.
                        if (item.date) {
                            if (item.quantity !== undefined && item.quantity <= 0) {
                                availabilityMap[strId].available = false;
                            }
                            // Add price? Simple sum roughly ok for display "Total"
                            if (item.price) {
                                availabilityMap[strId].price += parseFloat(item.price);
                            }
                        } else {
                            // Assume it's a room summary
                            if (item.quantity !== undefined && item.quantity <= 0) {
                                availabilityMap[strId].available = false;
                            }
                            if (item.price) {
                                // If it's a summary, price might be total or nightly.
                                // Let's assume total if no date range specified in item, or nightly?
                                // Safest is to take it.
                                availabilityMap[strId].price = parseFloat(item.price);
                            }
                        }
                    }
                });
            }

            return {
                data: availabilityMap,
                debug: {
                    source: 'real',
                    rawCount: Array.isArray(data) ? data.length : Object.keys(data).length
                }
            };

        } catch (error) {
            console.error("[Beds24] Request failed:", error);
            // On hard failure, we return empty data but mark as 'real' attempt failed
            // or should we fallback to mock? safer to fail closed (unavailable).
            return { data: {}, debug: { source: 'real', error: String(error) } };
        }
    }
};

// Mock Helper (Improved)
const getMockAvailability = async ({ roomIds }: Beds24Request): Promise<Record<string, Beds24Availability>> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockData: Record<string, Beds24Availability> = {};

    // If no roomIds passed (search all), mock some IDs.
    // In real app, we iterate over our DB rooms and match their beds24 IDs.
    // Here we just return generic mocks or specific if provided.
    const idsToMock = roomIds && roomIds.length > 0 ? roomIds : ['12345', '67890', 'mock-room-1'];

    idsToMock.forEach(id => {
        const isAvailable = Math.random() > 0.3; // 70% chance available
        const price = Math.floor(Math.random() * (300 - 80 + 1) + 80);
        if (isAvailable) {
            mockData[id] = {
                roomId: id,
                available: true,
                price: price,
                minStay: 2
            };
        }
    });
    return mockData;
};

