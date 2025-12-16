'use client';

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";

type PayPalButtonsWrapperProps = {
    amount: string;
    currency: string;
    onPaymentSuccess: (paypalOrderId: string, paypalTransactionId: string) => void;
    onPaymentError: (error: any) => void;
    onPaymentCancel: () => void;
};

export function PayPalButtonsWrapper({
    amount,
    currency,
    onPaymentSuccess,
    onPaymentError,
    onPaymentCancel
}: PayPalButtonsWrapperProps) {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    if (isPending) {
        return <div className="flex justify-center items-center py-4"><Loader2 className="h-8 w-8 animate-spin text-shpc-yellow" /></div>;
    }

    if (isRejected) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm font-mono break-all">
                <p><strong>PayPal Connection Failed</strong></p>
                <p>The payment system could not be loaded. This usually means the API credentials are invalid or the account is restricted.</p>
                <button onClick={() => window.location.reload()} className="underline mt-2">Retry</button>
            </div>
        );
    }

    const createOrder = (_data: any, actions: any) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: amount, // The final amount for the transaction
                        currency_code: currency, // The currency of the transaction
                    },
                    description: 'Sweet Home Punta Cana Booking',
                },
            ],
            application_context: {},
        });
    };

    const onApprove = async (_data: any, actions: any) => {
        try {
            const details = await actions.order.capture();
            const orderID = details.id;
            const transactionId = details.purchase_units[0].payments.captures[0].id;
            onPaymentSuccess(orderID, transactionId);
        } catch (error) {
            onPaymentError(error);
        }
    };

    return (
        <div style={{ minHeight: "150px", width: "100%", zIndex: 1, position: "relative" }}>
            <PayPalButtons
                key={amount} // Add key to ensure re-render on amount change
                style={{ layout: "vertical", shape: "rect", label: "pay" }}
                createOrder={createOrder} // Called when the button is clicked
                onApprove={onApprove}     // Called when the user approves the payment in the popup
                onError={(err) => {
                    console.error("PayPal Button Error:", err);
                    onPaymentError(err);
                }}  // Called if an error occurs during the transaction
                onCancel={onPaymentCancel} // Called if the user cancels the payment
            />
        </div>
    );
}
