'use client';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function SimpleTestPage() {
    const CLIENT_ID = "ATj0R0crY6MxnyYdsbpSAnUh5_8Ih5r6A0zUDRA1rSuLedlDGEwg_P7JuXI5QNY4jKpXZdc_Guk0vL9e";

    return (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold mb-4">Isolated PayPal Test</h1>
            <p className="mb-4">Client ID: {CLIENT_ID}</p>

            <div className="border p-4 max-w-md mx-auto">
                <PayPalScriptProvider options={{ clientId: CLIENT_ID }}>
                    <PayPalButtons
                        style={{ layout: "vertical" }}
                        onError={(err) => alert("ERROR: " + JSON.stringify(err))}
                    />
                </PayPalScriptProvider>
            </div>
        </div>
    );
}
