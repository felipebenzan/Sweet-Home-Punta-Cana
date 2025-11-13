"use client";

import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Toast } from '@/components/ui/toast';
import { createPaypalOrder, capturePaypalOrder } from '@/server-actions';

interface PayPalButtonsWrapperProps {
  amount: string;
  currency: string;
  onPaymentSuccess: (orderId: string, transactionId: string) => Promise<void>;
  onPaymentError: (error: any) => void;
}

export function PayPalButtonsWrapper({
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
}: PayPalButtonsWrapperProps) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // IMPORTANT: Get your merchant ID from your PayPal Developer Account
  // The error message provided it: "CH3EFATV58J5S" or "sb-mqlmr46875371@business.example.com"
  // You should store this in an environment variable like NEXT_PUBLIC_PAYPAL_MERCHANT_ID
  const paypalMerchantId = process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID || "CH3EFATV58J5S"; // Use the ID from your error or env var

  if (!paypalClientId) {
    console.error("PayPal Client ID is not defined. Check NEXT_PUBLIC_PAYPAL_CLIENT_ID.");
    return (
      <div className="text-red-500">
        PayPal payment is not available. Missing configuration (Client ID).
      </div>
    );
  }

  // Define the initial options for the PayPalScriptProvider
  const initialOptions = {
    clientId: paypalClientId,
    currency: currency,
    intent: "capture",
    // ADD THIS LINE: Explicitly tell the SDK which merchant ID to expect
    'data-merchant-id': paypalMerchantId, // Or use the email if you prefer: 'data-merchant-id': 'sb-mqlmr46875371@business.example.com'
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={async (data, actions) => {
          try {
            const orderId = await createPaypalOrder(amount, currency);
            if (!orderId) {
              throw new Error("Failed to create PayPal order on server.");
            }
            return orderId;
          } catch (error: any) {
            console.error("Error creating PayPal order:", error);
            Toast({
              title: "Payment Error",
              // description: `Could not start PayPal payment: ${error.message}`,
              variant: "destructive",
            });
            onPaymentError(error);
            return '';
          }
        }}
        onApprove={async (data, actions) => {
          try {
            const transactionId = await capturePaypalOrder(data.orderID);
            if (!transactionId) {
              throw new Error("Failed to capture PayPal payment on server.");
            }
            await onPaymentSuccess(data.orderID, transactionId);
          } catch (error: any) {
            console.error("Error capturing PayPal payment:", error);
            Toast({
              title: "Payment Failed",
              // description: `Your payment could not be processed: ${error.message}`,
              variant: "destructive",
            });
            onPaymentError(error);
          }
        }}
        onCancel={(data) => {
          console.log("PayPal payment cancelled:", data);
          Toast({
            title: "Payment Cancelled",
            // description: "You have cancelled the PayPal payment.",
          });
          onPaymentError(new Error("Payment cancelled"));
        }}
        onError={(err) => {
          console.error("PayPal Buttons Error:", err);
          Toast({
            title: "PayPal Error",
            // description: "An error occurred with PayPal. Please try again.",
            variant: "destructive",
          });
          onPaymentError(err);
        }}
      />
    </PayPalScriptProvider>
  );
}