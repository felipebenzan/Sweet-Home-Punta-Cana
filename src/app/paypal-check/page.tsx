'use client';
import { useEffect, useState } from 'react';
import { debugEnvVars } from '../actions/debug-env';

export default function PayPalCheck() {
    const [clientVar, setClientVar] = useState<string>('');
    const [serverVars, setServerVars] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Client-side check
        setClientVar(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'undefined');

        // Server-side check
        debugEnvVars().then((data) => {
            setServerVars(data.serverSide);
            setLoading(false);
        });
    }, []);

    return (
        <div className="p-8 font-mono bg-white min-h-screen text-black">
            <h1 className="text-xl font-bold mb-4">PayPal Deep Diagnostic</h1>

            <div className="space-y-6">
                <div className="p-4 border border-blue-200 rounded bg-blue-50">
                    <h2 className="font-bold text-blue-800 mb-2">Browser (Client) Perspective</h2>
                    <p>NEXT_PUBLIC_PAYPAL_CLIENT_ID: <strong>{clientVar}</strong></p>
                </div>

                <div className="p-4 border border-green-200 rounded bg-green-50">
                    <h2 className="font-bold text-green-800 mb-2">Server (Runtime) Perspective</h2>
                    {loading ? (
                        <p>Asking server...</p>
                    ) : (
                        <ul className="space-y-2">
                            <li>NEXT_PUBLIC_PAYPAL_CLIENT_ID: <strong>{serverVars.NEXT_PUBLIC_PAYPAL_CLIENT_ID}</strong></li>
                            <li>PAYPAL_CLIENT_ID: <strong>{serverVars.PAYPAL_CLIENT_ID}</strong></li>
                            <li>PAYPAL_CLIENT_SECRET: <strong>{serverVars.PAYPAL_CLIENT_SECRET}</strong></li>
                        </ul>
                    )}
                </div>

                <div className="bg-gray-100 p-4 rounded text-sm">
                    <p><strong>Analysis:</strong></p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>If <strong>Client</strong> is undefined but <strong>Server</strong> has values: The build is ignoring the vars, but the server has them. We can fix this by passing props from server.</li>
                        <li>If <strong>Server</strong> is also undefined: Vercel is NOT injecting variables at all. You definitely need to check Vercel Project Settings.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
