'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

export function PayPalProvider({ children, clientId }: { children: ReactNode; clientId?: string }) {
    // EMERGENCY HARDCODE: Ensure Client ID is always present regardless of props or env
    const FINAL_CLIENT_ID = "AdcvZIs6aDhOuAfazd6S-6BQJYWY_o0_RqXiVfVeluirgbUj1lrC-Vc6kDBDDOH5IqpgGlTrGhf6kyFN";

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
