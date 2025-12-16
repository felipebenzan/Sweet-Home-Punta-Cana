'use client';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function SimplePayPalClient({ clientId }: { clientId: string }) {
    return (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold mb-4">Isolated PayPal Test (Runtime Config)</h1>
            <p className="mb-4">Client ID from Server: {clientId ? (clientId.substring(0, 10) + "...") : "MISSING"}</p>

            <div className="border p-4 max-w-md mx-auto">
                {clientId ? (
                    <PayPalScriptProvider options={{ clientId }}>
                        <PayPalButtons
                            style={{ layout: "vertical" }}
                            onError={(err) => alert("ERROR: " + JSON.stringify(err))}
                        />
                    </PayPalScriptProvider>
                ) : (
                    <p className="text-red-500">Error: No Client ID passed from server.</p>
                )}
            </div>
        </div>
    );
}
