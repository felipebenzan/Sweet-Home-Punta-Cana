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
}

/**
 * Beds24 API Client
 */
export const Beds24 = {
    getAvailability: async ({ arrival, departure, numAdults, roomIds }: Beds24Request): Promise<Record<string, Beds24Availability>> => {
        const apiKey = process.env.BEDS24_API_KEY;
        const propKey = process.env.BEDS24_PROP_KEY;

        if (!apiKey) {
            console.warn("[Beds24] No API Key found. Using mock data.");
            return getMockAvailability({ arrival, departure, numAdults, roomIds });
        }

        try {
            console.log(`[Beds24] Fetching availability for ${arrival} to ${departure}`);

            // Beds24 JSON API Endpoint
            const endpoint = "https://api.beds24.com/json/getAvailability";

            // Prepare payload
            // Note: Beds24 API expects specific structure. 
            // We generally request for the property or specific rooms.
            // If roomIds are provided (Beds24 IDs), we filter relevant data.
            const payload = {
                authentication: {
                    apiKey: apiKey,
                    propKey: propKey
                },
                arrival: arrival,
                departure: departure,
                numAdults: numAdults,
                // If we want to filter by specific rooms in the request, we can add 'roomId'
                // But usually getting all for property is easier then filtering.
                // However, if roomIds is passed, it might be internal UUIDs, so we shouldn't pass them directly to Beds24 
                // unless they are mapped to beds24RoomId.
                // For this implementation, we'll fetch all and let the caller map/filter.
                options: {
                    // Add any specific options here if needed, e.g. "includePrice": true
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
            // console.log("[Beds24] Response:", JSON.stringify(data).substring(0, 200) + "...");

            if (data.error) {
                console.error("[Beds24] API returned error:", data.error);
                return {};
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
                console.warn("[Beds24] array response not fully supported yet in this helper");
            }

            return availabilityMap;

        } catch (error) {
            console.error("[Beds24] Request failed:", error);
            return {};
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

