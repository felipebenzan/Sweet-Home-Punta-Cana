'use client';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function SimpleTestPage() {
    const CLIENT_ID = "AdcvZIs6aDhOuAfazd6S-6BQJYWY_o0_RqXiVfVeluirgbUj1lrC-Vc6kDBDDOH5IqpgGlTrGhf6kyFN";

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
