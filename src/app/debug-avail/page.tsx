
import { prisma } from '@/lib/prisma';
import { Beds24 } from '@/lib/beds24';
import { format, addDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function DebugAvailabilityPage() {
    // Test dates: Tomorrow - 2 days stay
    const checkIn = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const checkOut = format(addDays(new Date(), 3), 'yyyy-MM-dd');

    // 1. Fetch DB Rooms
    const dbRooms = await prisma.room.findMany();

    // 2. Fetch API Data
    const { data: b24Data, debug } = await Beds24.getAvailability({
        arrival: checkIn,
        departure: checkOut,
        numAdults: 2,
        roomIds: dbRooms.map(r => r.beds24_room_id).filter(Boolean) as string[],
        // Force auth just in case env vars are flickering, using confirmed user keys
        auth: {
            apiKey: process.env.BEDS24_API_KEY,
            propKey: process.env.BEDS24_PROP_KEY || process.env.BEDS24_PROP_ID
        }
    });

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Availability Diagnostic</h1>
            <div className="mb-4 bg-gray-100 p-4 rounded">
                <p><strong>Check In:</strong> {checkIn}</p>
                <p><strong>Check Out:</strong> {checkOut}</p>
                <p><strong>API Source:</strong> {debug.source}</p>
                <p><strong>Env Keys Visible:</strong> {JSON.stringify(debug.envKeys || [])}</p>
            </div>

            <table className="w-full border-collapse border border-gray-300 mb-8">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Room Name</th>
                        <th className="border p-2">DB ID (Slug)</th>
                        <th className="border p-2">Beds24 ID (DB)</th>
                        <th className="border p-2">Found in API?</th>
                        <th className="border p-2">Raw 'roomsavail'</th>
                        <th className="border p-2">Parsed Available</th>
                        <th className="border p-2">Final Logic</th>
                    </tr>
                </thead>
                <tbody>
                    {dbRooms.map(r => {
                        const b24Id = r.beds24_room_id;
                        const apiRecord = b24Id ? b24Data[b24Id] : null;
                        // Hack to find raw roomsavail from rawResponse if possible, 
                        // since Beds24Availability interface parses it to boolean.
                        // We'll trust our "Parsed" column for now or inspect rawResponse below.

                        return (
                            <tr key={r.id}>
                                <td className="border p-2">{r.name}</td>
                                <td className="border p-2">{r.slug}</td>
                                <td className="border p-2 text-blue-600 font-bold">{b24Id || 'NULL'}</td>
                                <td className="border p-2">{apiRecord ? 'YES' : 'NO'}</td>
                                <td className="border p-2">{apiRecord ? (apiRecord.available ? '> 0' : '0/Undefined') : 'N/A'}</td>
                                <td className="border p-2 font-bold" style={{ color: apiRecord?.available ? 'green' : 'red' }}>
                                    {apiRecord ? String(apiRecord.available) : 'N/A'}
                                </td>
                                <td className="border p-2">
                                    {!b24Id ? 'OPEN (Dev Mode)' : (apiRecord ? (apiRecord.available ? 'AVAILABLE' : 'BLOCKED') : 'BLOCKED (Fallback)')}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <h2 className="text-xl font-bold mb-2">Raw API Response</h2>
            <pre className="bg-slate-900 text-green-400 p-4 rounded overflow-auto max-h-[500px]">
                {JSON.stringify(debug.rawResponse, null, 2)}
            </pre>

            <h2 className="text-xl font-bold mb-2 mt-8">Debug Info</h2>
            <pre className="bg-gray-100 p-4 rounded">
                {JSON.stringify(debug, null, 2)}
            </pre>
        </div>
    );
}
