
import { Beds24 } from "@/lib/beds24";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function DebugBeds24Page() {
    const arrival = "2025-12-15";
    const departure = "2025-12-16";

    // Fetch Local Rooms
    const rooms = await prisma.room.findMany();
    const roomIds = rooms.map(r => r.beds24_room_id).filter(Boolean) as string[];

    // Fetch Beds24 Data
    const { data, debug } = await Beds24.getAvailability({
        arrival,
        departure,
        numAdults: 2,
        roomIds
    });

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Beds24 Diagnostic</h1>

            <div className="grid grid-cols-2 gap-4">
                <div className="border p-4">
                    <h2 className="font-bold">Environment</h2>
                    <pre className="bg-gray-100 p-2 overflow-auto">
                        {JSON.stringify({
                            HAS_API_KEY: !!process.env.BEDS24_API_KEY,
                            HAS_PROP_KEY: !!process.env.BEDS24_PROP_KEY,
                            PROP_ID: process.env.BEDS24_PROP_ID
                        }, null, 2)}
                    </pre>
                </div>

                <div className="border p-4">
                    <h2 className="font-bold">Local Database Rooms</h2>
                    <pre className="bg-gray-100 p-2 overflow-auto">
                        {JSON.stringify(rooms.map(r => ({ name: r.name, b24_id: r.beds24_room_id })), null, 2)}
                    </pre>
                </div>
            </div>

            <h2 className="font-bold mt-8">Parsed Availability (Internal)</h2>
            <pre className="bg-green-50 p-4 border overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>

            <h2 className="font-bold mt-8">RAW API RESPONSE (From Beds24)</h2>
            <pre className="bg-yellow-50 p-4 border overflow-auto">
                {JSON.stringify(debug.rawResponse, null, 2)}
            </pre>

            <h2 className="font-bold mt-8">Error Logs</h2>
            <pre className="bg-red-50 p-4 border overflow-auto">
                {debug.error || "None"}
            </pre>
        </div>
    );
}
