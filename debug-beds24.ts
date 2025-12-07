
import fetch from 'node-fetch';

const endpoint = "https://api.beds24.com/json/getAvailabilities";
const payload = {
    checkIn: "2025-12-07",
    checkOut: "2025-12-13",
    propId: "303042",
    numAdult: 2,
    options: {
        // includePrice: true
    }
};

// Add authentication via header if needed, but docs say payload propId is key?
// Actually docs say authentication is not required for public availability?
// But OTA endpoint requires it.
// Let's try passing keys in payload again just in case, or relying on propId being enough public.
// If not working, we'll try V1 authentication structure.

// V1 Auth structure for some endpoints:
// authentication: { apiKey: ..., propKey: ... }

// Let's try the payload I committed.
const payloadWithAuth = {
    ...payload,
    // authentication: { apiKey: 'SweetHome2025SecretKeyX99', propKey: '303042' } 
    // Actually the previous script worked without auth block inside payload because API V1 getAvailabilities 
    // might be public OR the previous run output showed keys were missing in env but script worked?
    // Wait, step 1075 output showed success. 
    // "Payload: { ... options: {} }" -> NO Auth in payload.
    // "Response Body: { ... roomsavail: ... }"
    // So getAvailabilities IS public for this property? 
    // If so, why did we need keys?
    // Maybe the user's property 303042 is public?
    // Let's stick to what worked in step 1075.
};

async function run() {
    console.log("Fetching from:", endpoint);
    console.log("Payload:", JSON.stringify(payloadWithAuth, null, 2));

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadWithAuth)
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response Body:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
