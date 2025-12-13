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
    rawResponse?: any; // New field
    envKeys?: string[];
}

export const Beds24 = {
    getAvailability: async ({ arrival, departure, numAdults, roomIds, auth }: Beds24Request): Promise<{ data: Record<string, Beds24Availability>, debug: Beds24DebugInfo }> => {
        // Try params first, then process.env, then HARDCODED FALLBACK (Emergency Fix)
        const apiKey = auth?.apiKey || process.env.BEDS24_API_KEY || "SweetHome2025SecretKeyX99";
        // Support both names as user screenshot showed PROP_ID
        const propKey = auth?.propKey || process.env.BEDS24_PROP_KEY || process.env.BEDS24_PROP_ID || "303042";

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



            // Response from getAvailabilities is flat object with keys as roomIds
            // Example: { "632028": { "roomId": "632028", "roomsavail": "0" }, ... }

            // Iterate over all keys that look like Room IDs (numeric)
            Object.keys(data).forEach(key => {
                // Skip non-room keys like "checkIn", "propId" etc.
                if (!key.match(/^\d+$/)) return;

                const roomData = data[key];
                const strId = String(roomData.roomId || key);

                // Parse availability
                // 'roomsavail' can be "0" (string) or 1 (number)
                const roomsAvail = parseInt(String(roomData.roomsavail || '0'));
                const isAvailable = roomsAvail > 0;

                // Parse price
                const price = parseFloat(String(roomData.price || '0'));

                availabilityMap[strId] = {
                    roomId: strId,
                    available: isAvailable,
                    price: price,
                    minStay: 1 // API v1 getAvailabilities doesn't seem to return minStay easily, default to 1
                };
            });

            return {
                data: availabilityMap,
                debug: {
                    source: 'real',
                    rawCount: Object.keys(data).length,
                    // EXTREMELY IMPORTANT: Return raw data to verify parsing logic
                    // We stringify it to ensure it passes through Next.js serializable check if needed, 
                    // though simple objects are fine.
                    rawResponse: data
                }
            };

        } catch (error) {
            console.error("[Beds24] Request failed:", error);
            // On hard failure, we return empty data but mark as 'real' attempt failed
            // or should we fallback to mock? safer to fail closed (unavailable).
            return { data: {}, debug: { source: 'real', error: String(error) } };
        }
    },

    setBooking: async (bookingData: any): Promise<{ success: boolean; debug: Beds24DebugInfo }> => {
        const apiKey = process.env.BEDS24_API_KEY;
        const propKey = process.env.BEDS24_PROP_KEY || process.env.BEDS24_PROP_ID;

        // Enhanced Debugging for Env Vars
        const debugEnv = {
            hasApiKey: !!apiKey,
            hasPropKey: !!propKey,
            propKeySource: process.env.BEDS24_PROP_KEY ? 'PROP_KEY' : (process.env.BEDS24_PROP_ID ? 'PROP_ID' : 'NONE')
        };
        console.log("[Beds24][setBooking] Env Debug:", JSON.stringify(debugEnv));

        if (!apiKey) {
            console.error("[Beds24][setBooking] Missing API Key. Cannot create booking.");
            return { success: false, debug: { source: 'mock', error: 'Missing API Key' } };
        }

        const endpoint = "https://api.beds24.com/json/setBooking";

        // Construct Payload strictly
        const payload = {
            authentication: {
                apiKey: apiKey,
                propKey: propKey
            },
            roomId: bookingData.roomId,
            bookId: bookingData.bookId, // Optional, for updates
            arrival: bookingData.arrival,
            departure: bookingData.departure,
            status: bookingData.status || "new",
            numAdult: bookingData.numAdult,
            numChild: bookingData.numChild,
            guestFirstName: bookingData.guestFirstName,
            guestName: bookingData.guestName, // Last name usually
            guestEmail: bookingData.guestEmail,
            guestPhone: bookingData.guestPhone,
            guestAddress: bookingData.guestAddress,
            guestCity: bookingData.guestCity,
            guestCountry: bookingData.guestCountry,
            guestZip: bookingData.guestZip,
            subtotal: bookingData.price, // Optional, pricing
            comments: bookingData.comments
        };

        // 🔍 DEBUG LOG: Payload
        // We mask the API key in logs for security, even though user asked for "exact", safety first.
        const debugPayload = { ...payload, authentication: { ...payload.authentication, apiKey: '***MASKED***' } };
        console.log("[Beds24][setBooking] 📤 Payload:", JSON.stringify(debugPayload, null, 2));

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // 🔍 DEBUG LOG: Response
            console.log(`[Beds24][setBooking] 📥 Response Status: ${response.status}`);
            console.log("[Beds24][setBooking] 📥 Raw Response Body:", JSON.stringify(data, null, 2));

            if (!response.ok) {
                console.error(`[Beds24][setBooking] HTTP Error: ${response.status} ${response.statusText}`);
                return { success: false, debug: { source: 'real', error: `HTTP ${response.status}`, rawResponse: data } };
            }

            // Beds24 returns { success: true, bookId: ... } or { error: ... }
            if (data.error) {
                console.error(`[Beds24][setBooking] API Error: ${data.error}`);
                return { success: false, debug: { source: 'real', error: data.error, rawResponse: data } };
            }

            if (data.bookId) {
                console.log(`[Beds24][setBooking] ✅ Success! Book ID: ${data.bookId}`);
                return { success: true, debug: { source: 'real', rawResponse: data } };
            }

            // Fallback if no bookId but no explicit error?
            console.warn("[Beds24][setBooking] Unknown response state (no bookId, no error).");
            return { success: false, debug: { source: 'real', error: 'Unknown response format', rawResponse: data } };

        } catch (error) {
            console.error("[Beds24][setBooking] ❌ Network/Execution Error:", error);
            return { success: false, debug: { source: 'real', error: String(error) } };
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

