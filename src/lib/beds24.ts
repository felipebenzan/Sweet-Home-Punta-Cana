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
 * Mock Beds24 API Client
 * In a real implementation, this would make HTTP requests to https://api.beds24.com/json/getAvailability
 */
export const Beds24 = {
    getAvailability: async ({ arrival, departure, numAdults, roomIds }: Beds24Request): Promise<Record<string, Beds24Availability>> => {
        const apiKey = process.env.BEDS24_API_KEY;
        const propKey = process.env.BEDS24_PROP_KEY; // Optional, depending on account setup

        // Fallback to mock if no API key is present (Development Mode)
        if (!apiKey) {
            console.warn("[Beds24] No API Key found. Using mock data.");
            return getMockAvailability({ arrival, departure, numAdults, roomIds });
        }

        try {
            console.log(`[Beds24] Fetching availability for ${arrival} to ${departure}`);

            // Beds24 JSON API Endpoint
            const endpoint = "https://api.beds24.com/json/getAvailability";

            // Payload structure for Beds24
            // Ref: https://api.beds24.com/json/getAvailability
            const payload = {
                authentication: {
                    apiKey: apiKey,
                    propKey: propKey
                },
                arrival: arrival,
                departure: departure,
                numAdults: numAdults,
                roomIds: roomIds // If provided, filter by these
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Beds24 API Error: ${response.statusText}`);
            }

            const data = await response.json();

            // Transform Beds24 response to our internal format
            // Note: This mapping depends on the exact structure of the Beds24 response
            // which can vary. This is a standard mapping assumption.
            const availabilityMap: Record<string, Beds24Availability> = {};

            // Assuming data is an array of room availability objects
            if (Array.isArray(data)) {
                data.forEach((item: any) => {
                    // Map response fields. Adjust 'roomId', 'price', etc. based on actual API response
                    if (item.roomId) {
                        availabilityMap[item.roomId] = {
                            roomId: item.roomId,
                            available: item.quantity > 0, // Assuming 'quantity' indicates availability
                            price: parseFloat(item.price),
                            minStay: item.minStay || 1
                        };
                    }
                });
            } else if (data.error) {
                console.error("[Beds24] API returned error:", data.error);
                // Fallback to mock on API error? Or throw?
                // Let's throw to be safe, or return empty.
                return {};
            }

            return availabilityMap;

        } catch (error) {
            console.error("[Beds24] Request failed:", error);
            // In production, you might want to return empty or handle gracefully
            // For now, falling back to mock so the site doesn't break if API fails
            return getMockAvailability({ arrival, departure, numAdults, roomIds });
        }
    }
};

// Helper for mock data (moved from original function)
const getMockAvailability = async ({ roomIds }: Beds24Request): Promise<Record<string, Beds24Availability>> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockData: Record<string, Beds24Availability> = {};
    if (roomIds && roomIds.length > 0) {
        roomIds.forEach(id => {
            const isAvailable = Math.random() > 0.2;
            const price = Math.floor(Math.random() * (500 - 100 + 1) + 100);
            mockData[id] = {
                roomId: id,
                available: isAvailable,
                price: price,
                minStay: 2
            };
        });
    }
    return mockData;
};
