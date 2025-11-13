
import { render } from '@react-email/render';
import { Resend } from 'resend';
import ReservationConfirmationEmail from '../../src/emails/reservation-confirmation';
import LaundryConfirmationEmail from '../../src/emails/laundry-confirmation';
import TransferConfirmationEmail from '../../src/emails/transfer-confirmation';
import ExcursionConfirmationEmail from '../../src/emails/excursion-confirmation';
import type { Reservation, Room, ServiceBooking, Excursion, BookingDetails } from '../../src/lib/types';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from "firebase-functions/logger";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const db = getFirestore();

async function sendEmail(to: string, subject: string, html: string) {
    if (!resend) {
        logger.warn("RESEND_API_KEY not set, skipping email.");
        logger.info("Email to:", to);
        logger.info("Email subject:", subject);
        return;
    }
    try {
        const { data, error } = await resend.emails.send({
            from: 'Sweet Home Punta Cana <reservations@sweethomepc.com>',
            to,
            subject,
            html,
        });
        if (error) {
           throw error;
        }
        logger.info("Email sent successfully:", data);
    } catch (error) {
        logger.error("Failed to send email:", error);
    }
}

export async function sendAllConfirmationEmails(bookingId: string) {
    const bookingSnap = await db.collection('bookings').doc(bookingId).get();
    if (!bookingSnap.exists) {
        logger.error(`Booking ${bookingId} not found for sending confirmation email.`);
        return;
    }
    const booking = bookingSnap.data() as any;

    if (!booking.customer?.email) {
        logger.error(`Booking ${bookingId} has no customer email.`);
        return;
    }

    const subject = `Your Sweet Home Punta Cana Booking is Confirmed! (ID: ${bookingId.substring(0,7).toUpperCase()})`;
    let emailHtml = '';

    try {
        switch (booking.type) {
            case 'room': {
                const customer = booking.customer || {};
                const pricing = booking.pricing || {};
                const roomDetails = booking.room || {};
                const dates = booking.dates || {};
                const transfer = booking.transfer || {};

                const bookingDetails: BookingDetails = {
                    confirmationId: bookingId,
                    rooms: (roomDetails.ids || []).map((id:string, i:number) => ({
                        id: id,
                        name: (roomDetails.name || '').split(', ')[i] || roomDetails.name,
                        price: (pricing.totalUSD || 0) / (roomDetails.ids?.length || 1), 
                        bedding: "King",
                        image: "",
                        capacity: 2,
                        slug: ""
                    })),
                    dates: { from: dates.checkIn, to: dates.checkOut },
                    guests: booking.guests || 2,
                    nights: 0, // This should be calculated or stored
                    totalPrice: pricing.totalUSD || 0,
                    guestInfo: {
                        firstName: (customer.name || '').split(' ')[0],
                        lastName: (customer.name || '').split(' ').slice(1).join(' '),
                        email: customer.email,
                        phone: customer.phone,
                    },
                    airportPickup: transfer,
                };
                emailHtml = render(ReservationConfirmationEmail({ bookingDetails }));
                break;
            }
            case 'laundry': {
                const customer = booking.customer || {};
                const pricing = booking.pricing || {};
                const laundryBooking: ServiceBooking = {
                    id: bookingId,
                    guestName: String(customer.name || ''),
                    email: String(customer.email || ''),
                    phone: String(customer.phone || ''),
                    total: Number(pricing.totalUSD || 0),
                    serviceType: 'Laundry Service',
                    accommodation: String(booking.accommodation || ''),
                    qty: Number(booking.qty || 0),
                    date: String(booking.date || ''),
                    time: String(booking.time || ''),
                    createdAt: new Date().toISOString(),
                    details: {},
                };
                emailHtml = render(LaundryConfirmationEmail({ booking: laundryBooking }));
                break;
            }
            case 'airportTransfer': {
                const customer = booking.customer || {};
                const pricing = booking.pricing || {};
                const transferBookingData: ServiceBooking = {
                    id: bookingId,
                    guestName: String(customer.name ?? ''),
                    email: String(customer.email ?? ''),
                    phone: String(customer.phone ?? ''),
                    total: Number(pricing.totalUSD ?? 0),
                    serviceType: 'Airport Transfer',
                    direction: String(booking.direction || ''),
                    arrivalDate: String(booking.arrivalDate || ''),
                    departureDate: String(booking.departureDate || ''),
                    arrivalFlight: String(booking.arrivalFlight || ''),
                    departureFlight: String(booking.departureFlight || ''),
                    departureTime: String(booking.departureTime || ''),
                    details: {},
                    createdAt: new Date().toISOString(),
                };
                emailHtml = render(TransferConfirmationEmail({ booking: transferBookingData }));
                break;
            }
            case 'excursion': {
                const customer = booking.customer || {};
                const pricing = booking.pricing || {};
                const excursion = booking.excursion || {};

                const excursionEmailDetails = {
                    mainExcursion: { 
                        ...excursion, 
                        adults: parseInt(excursion.pax) || 1,
                        price: { adult: (pricing.totalUSD || 0) / (parseInt(excursion.pax) || 1) },
                        practicalInfo: {},
                        inclusions: [],
                        gallery: [],
                    },
                    bundledItems: [],
                    totalPrice: pricing.totalUSD || 0,
                    bundleDiscount: 0,
                    bookingId: bookingId,
                    guestInfo: {
                        firstName: (customer.name || '').split(' ')[0],
                        lastName: (customer.name || '').split(' ').slice(1).join(' '),
                        email: customer.email
                    }
                };
                emailHtml = render(ExcursionConfirmationEmail({ bookingDetails: excursionEmailDetails as any }));
                break;
            }
            default:
                logger.error(`Unknown booking type for email: ${booking.type}`);
                return;
        }

        if (emailHtml) {
            await sendEmail(booking.customer.email, subject, emailHtml);
        } else {
            logger.error(`Could not generate email HTML for booking ${bookingId}`);
        }
    } catch (e: any) {
        logger.error(`Error rendering or sending email for booking ${bookingId}:`, e);
    }
}
