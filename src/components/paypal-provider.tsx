'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

export function PayPalProvider({ children, clientId }: { children: ReactNode; clientId?: string }) {
    // EMERGENCY HARDCODE: Ensure Client ID is always present regardless of props or env
    const FINAL_CLIENT_ID = "AdcvZIs6aDhOuAfazd6S-6BQJYWY_o0_RqXiVfVeluirgbUj1lrC-Vc6kDBDDOH5IqpgGlTrGhf6kyFN";

    const initialOptions = {
        clientId: FINAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            {children}
        </PayPalScriptProvider>
    );
}
