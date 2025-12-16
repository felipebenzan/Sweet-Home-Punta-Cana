
'use client';
import { useEffect, useState } from 'react';

export default function PayPalCheck() {
    const [clientId, setClientId] = useState<string>('');
    const [time, setTime] = useState<string>('');

    useEffect(() => {
        // Read the env var available to the client
        setClientId(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'undefined');
        setTime(new Date().toISOString());
    }, []);

    return (
        <div className="p-8 font-mono bg-white min-h-screen text-black">
            <h1 className="text-xl font-bold mb-4">PayPal Configuration Check</h1>
            <div className="space-y-4">
                <div className="p-4 border rounded bg-gray-50">
                    <p className="text-sm font-semibold text-gray-500">NEXT_PUBLIC_PAYPAL_CLIENT_ID</p>
                    <p className="break-all font-mono text-lg">{clientId}</p>
                </div>

                <div className="p-4 border rounded bg-gray-50">
                    <p className="text-sm font-semibold text-gray-500">Check Timestamp</p>
                    <p>{time}</p>
                </div>

                <div className="bg-yellow-100 p-4 rounded text-sm">
                    <p><strong>Diagnosis:</strong></p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>If Client ID says "test" or "undefined" &rarr; Build did not pick up Env Vars.</li>
                        <li>If Client ID starts with "A" or similar &rarr; Compare with Live Dashboard.</li>
                        <li>If this page is 404 &rarr; Deployment failed completely.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
