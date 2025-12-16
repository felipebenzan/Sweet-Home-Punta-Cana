'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

export function PayPalProvider({ children, clientId }: { children: ReactNode; clientId?: string }) {
    const FINAL_CLIENT_ID = "ATj0R0crY6MxnyYdsbpSAnUh5_8Ih5r6A0zUDRA1rSuLedlDGEwg_P7JuXI5QNY4jKpXZdc_Guk0vL9e".trim();

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
