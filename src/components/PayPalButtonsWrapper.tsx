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
    const [{ isPending }] = usePayPalScriptReducer();

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

    if (isPending) {
        return <div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <PayPalButtons
            key={amount} // Add key to ensure re-render on amount change
            style={{ layout: "vertical" }}
            createOrder={createOrder} // Called when the button is clicked
            onApprove={onApprove}     // Called when the user approves the payment in the popup
            onError={onPaymentError}  // Called if an error occurs during the transaction
            onCancel={onPaymentCancel} // Called if the user cancels the payment
        />
    );
}
