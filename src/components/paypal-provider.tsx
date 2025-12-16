'use client';

import React from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PayPalProviderProps {
    children: React.ReactNode;
    clientId: string;
}

export function PayPalProvider({ children, clientId }: PayPalProviderProps) {
    // Defensive check: If clientId is missing, don't crash, but script won't load.
    // We trim whitespace just in case the env var has it.
    const cleanId = clientId?.trim();

    // If no ID is provided, we can either render children without provider (and feature fails gracefully)
    // or render provider with empty ID (which throws error). Both are bad, but expected if config is missing.

    const initialOptions = {
        clientId: cleanId,
        components: "buttons",
        currency: "USD",
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            {children}
        </PayPalScriptProvider>
    );
}
