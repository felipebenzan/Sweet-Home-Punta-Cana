
import { Beds24 } from '@/lib/beds24';
import dotenv from 'dotenv';
import path from 'path';

// Load envs
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Force use the USER's keys (since .env.local might be missing in this context)
process.env.BEDS24_API_KEY = "SweetHome2025SecretKeyX99";
process.env.BEDS24_PROP_KEY = "SweetHomeSecretKey2025!";
process.env.BEDS24_PROP_ID = "303042";

// Dates from Screenshot: Dec 15 2025 - Dec 16 2025
const ARRIVAL = "2025-12-15";
const DEPARTURE = "2025-12-16";

async function debugAvailability() {
    console.log(`\n🔍 Checking Availability for ${ARRIVAL} to ${DEPARTURE}`);

    // Check ALL known rooms
    const ROOM_IDS = ["632028", "632029", "632030", "632031"];

    try {
        const result = await Beds24.getAvailability({
            arrival: ARRIVAL,
            departure: DEPARTURE,
            numAdults: 2, // User had 2 guests
            roomIds: ROOM_IDS
        });

        console.log("---------------------------------------------------");
        console.log("RAW API RESPONSE (Partial):");
        console.log(JSON.stringify(result.debug.rawResponse, null, 2));
        console.log("---------------------------------------------------");

        console.log("PARSED RESULT:");
        console.log(JSON.stringify(result.data, null, 2));

    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
    }
}

debugAvailability();
