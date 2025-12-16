'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

export function PayPalProvider({ children, clientId }: { children: ReactNode; clientId?: string }) {
    // Runtime Injection: Use the prop passed from Server Layout, or fallback to simple test key if needed locally
    const FINAL_CLIENT_ID = clientId || "";

    // Minimal configuration to avoid 400 errors from SDK
    const initialOptions = {
        clientId: FINAL_CLIENT_ID,
        // Removed currency/intent to use defaults and avoid conflicts
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            {children}
        </PayPalScriptProvider>
    );
}
