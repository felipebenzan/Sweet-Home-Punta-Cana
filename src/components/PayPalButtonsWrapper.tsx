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
        console.log("Creating PayPal order on client-side...");
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
            application_context: {
                // Note: return_url and cancel_url are not typically used with this client-side flow
                // as the onApprove, onCancel, onError callbacks handle the result.
            },
        });
    };

    const onApprove = async (_data: any, actions: any) => {
        console.log("Payment approved. Capturing payment...");
        try {
            // The actions.order.capture() function communicates with PayPal to finalize the transaction.
            const details = await actions.order.capture();
            console.log("Payment captured successfully:", details);

            // Extract the necessary IDs from the successful transaction details
            const orderID = details.id;
            const transactionId = details.purchase_units[0].payments.captures[0].id;
            
            // This function (passed as a prop from checkout/page.tsx) will now be called.
            // It is responsible for saving the finalized booking to your database (Firestore).
            onPaymentSuccess(orderID, transactionId);

        } catch (error) {
            console.error("Error capturing payment:", error);
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
