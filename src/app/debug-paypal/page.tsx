
'use client';
import { useEffect, useState } from 'react';

export default function DebugPaypal() {
    const [clientId, setClientId] = useState<string>('');

    useEffect(() => {
        // Read the env var available to the client
        setClientId(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'undefined');
    }, []);

    return (
        <div className="p-8 font-mono">
            <h1 className="text-xl font-bold mb-4">PayPal Debugger</h1>
            <p><strong>NEXT_PUBLIC_PAYPAL_CLIENT_ID:</strong> {clientId}</p>
            <p className="text-sm text-gray-500 mt-2">
                If this starts with "A..." and you expect Live, verify it matches your Live Dashboard.<br />
                If it says "test" or "sb", you are in Sandbox mode.
            </p>
        </div>
    );
}
