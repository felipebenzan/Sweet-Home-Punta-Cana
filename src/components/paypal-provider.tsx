'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

export function PayPalProvider({ children, clientId }: { children: ReactNode; clientId: string }) {
    const initialOptions = {
        clientId: clientId,
        currency: "USD",
        intent: "capture",
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            {children}
        </PayPalScriptProvider>
    );
}
