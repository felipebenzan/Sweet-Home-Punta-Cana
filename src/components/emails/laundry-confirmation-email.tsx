
import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Tailwind,
} from '@react-email/components';
import { format, parseISO } from 'date-fns';

interface LaundryConfirmationEmailProps {
  bookingId?: string;
  guestName?: string;
  pickupDate?: string;
  pickupTime?: string;
  loadCount?: number;
  totalPrice?: number;
  accommodation?: string;
}

export default function LaundryConfirmationEmail({
  bookingId = 'N/A',
  guestName = 'Guest',
  pickupDate,
  pickupTime,
  loadCount = 1,
  totalPrice = 0,
  accommodation = 'N/A',
}: LaundryConfirmationEmailProps) {

  const formattedDate = pickupDate ? format(parseISO(pickupDate), "EEEE, MMMM do, yyyy") : "Not specified";
  const formattedTime = pickupTime ? new Date(`1970-01-01T${pickupTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : "Not specified";

  return (
    <Html lang="en">
      <Head />
      <Preview>Your Laundry Service is Confirmed!</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white my-8 mx-auto p-8 rounded-lg shadow-md max-w-xl">
            
            <Section className="text-center mb-6">
              <Heading className="text-3xl font-bold text-gray-800">Laundry Service Confirmed!</Heading>
              <Text className="text-gray-500 text-base">Thank you for your booking, {guestName}.</Text>
            </Section>

            <Section className="border border-solid border-gray-200 rounded-lg p-6">
              <Heading as="h2" className="text-xl font-semibold text-gray-700 mt-0 mb-4">Pickup Details</Heading>
              <Text className="text-base text-gray-600 leading-relaxed">
                <strong className="font-semibold text-gray-800">Accommodation:</strong> {accommodation}
              </Text>
              <Text className="text-base text-gray-600 leading-relaxed">
                <strong className="font-semibold text-gray-800">Scheduled for:</strong> {formattedDate} at {formattedTime}
              </Text>
            </Section>

            <Section className="mt-6 border border-solid border-gray-200 rounded-lg p-6">
              <Heading as="h2" className="text-xl font-semibold text-gray-700 mt-0 mb-4">Booking Summary</Heading>
              <Text className="text-base text-gray-600 leading-relaxed">
                <strong className="font-semibold text-gray-800">Service:</strong> On-Demand Laundry
              </Text>
              <Text className="text-base text-gray-600 leading-relaxed">
                <strong className="font-semibold text-gray-800">Number of Loads:</strong> {loadCount}
              </Text>
              <Hr className="border-gray-300 my-4"/>
              <Text className="text-lg font-bold text-gray-800 text-right">
                Total Paid: ${totalPrice.toFixed(2)}
              </Text>
            </Section>

            <Section className="mt-8 text-center">
              <Text className="text-sm text-gray-500">
                Booking ID: {bookingId}
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                Sweet Home Punta Cana | Your comfort is our priority.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
