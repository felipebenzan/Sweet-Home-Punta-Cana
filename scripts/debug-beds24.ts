import { Beds24 } from '../src/lib/beds24';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly since this is a script
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runDebug() {
    console.log("🛠️ Starting Beds24 Isolated Debug");
    console.log("-----------------------------------");
    console.log(`API Key Present: ${!!process.env.BEDS24_API_KEY}`);
    console.log(`Prop Key Present: ${!!(process.env.BEDS24_PROP_KEY || process.env.BEDS24_PROP_ID)}`);

    // Test with the keys currently in play
    const TEST_API_KEY = process.env.BEDS24_API_KEY; // Must be provided by Env
    const TEST_PROP_KEY = "SweetHomeSecretKey2025!"; // Confirmed User Key

    console.log(`Using API Key: ${TEST_API_KEY}`);
    console.log(`Using Prop Key: ${TEST_PROP_KEY}`);

    // Choose a valid room ID from the DB check (King Room: 632028)
    const TEST_ROOM_ID = "632028"; // King Room
    const TEST_ARRIVAL = new Date();
    TEST_ARRIVAL.setDate(TEST_ARRIVAL.getDate() + 120); // 120 days from now to avoid conflicts

    // Format YYYY-MM-DD
    const arrivalStr = TEST_ARRIVAL.toISOString().split('T')[0];
    const departureStr = new Date(TEST_ARRIVAL.getTime() + 86400000).toISOString().split('T')[0];

    console.log(`Testing Booking for Room: ${TEST_ROOM_ID}`);
    console.log(`Date: ${arrivalStr} to ${departureStr}`);

    process.env.BEDS24_API_KEY = TEST_API_KEY;
    process.env.BEDS24_PROP_KEY = TEST_PROP_KEY;

    // 🔍 Step 1: Check Availability (Read Access)
    console.log("\n🔍 Testing Read Access (getAvailability)...");
    try {
        const availResult = await Beds24.getAvailability({
            arrival: arrivalStr,
            departure: departureStr,
            numAdults: 1,
            roomIds: [TEST_ROOM_ID]
        });

        console.log("Read Result:", JSON.stringify(availResult, null, 2));
        if (availResult.debug.error && availResult.debug.source === 'mock') {
            console.log("⚠️ Read fell back to MOCK. Auth likely failed.");
        } else if (availResult.debug.error) {
            console.log("❌ Read Failed with API Error:", availResult.debug.error);
        } else {
            console.log("✅ Read Access SUCCESS!");
        }

    } catch (e) {
        console.log("❌ Read Access Exception:", e);
    }

    console.log("\n✍️ Testing Write Access (setBooking)...");
    try {
        const result = await Beds24.setBooking({
            roomId: TEST_ROOM_ID,
            arrival: arrivalStr,
            departure: departureStr,
            status: "new", // "new" is standard for new bookings
            numAdult: 1,
            guestFirstName: "Debug",
            guestName: "Bot",
            guestEmail: "debug@example.com",
            guestPhone: "+15550000000",
            price: 1.00,
            comments: "DEBUG_TEST_BOOKING_IGNORE"
        });

        console.log("\n✅ Result:");
        console.log(JSON.stringify(result, null, 2));

        if (!result.success) {
            console.error("\n❌ FAILED. Check payload and error above.");
        } else {
            console.log("\n✅ SUCCESS. Check Beds24 dashboard for 'Debug Bot'.");
        }

    } catch (error) {
        console.error("\n💥 CRITICAL EXCEPTION:", error);
    }
}

runDebug();
