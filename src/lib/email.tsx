
import { render } from '@react-email/render';
import { Resend } from 'resend';
import ReservationConfirmationEmail from '@/emails/reservation-confirmation';
import LaundryConfirmationEmail from '@/emails/laundry-confirmation';
import TransferConfirmationEmail from '@/emails/transfer-confirmation';
import ExcursionConfirmationEmail from '@/emails/excursion-confirmation';
import type { Reservation, Room, ServiceBooking, Excursion, BookingDetails } from '@/lib/types';
import { adminDb } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';


const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendEmail(to: string, subject: string, html: string) {
    if (!resend) {
        console.log("RESEND_API_KEY not set, skipping email.");
        console.log("Email to:", to);
        console.log("Email subject:", subject);
        // console.log("Email body that would have been sent:", html);
        return;
    }
    try {
        await resend.emails.send({
            from: 'Sweet Home Punta Cana <reservations@sweethomepc.com>',
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error("Failed to send email:", error);
    }
}

export async function sendAllConfirmationEmails(bookingId: string) {
    // Determine the collection based on some logic, or check both.
    // For now, let's assume we know which collection to check or we check both.
    let bookingSnap = await adminDb.collection('serviceBookings').doc(bookingId).get();
    let bookingType = bookingSnap.data()?.type || bookingSnap.data()?.serviceType;

    if (!bookingSnap.exists) {
        bookingSnap = await adminDb.collection('reservations').doc(bookingId).get();
        if (bookingSnap.exists) {
            bookingType = 'room'; // If found in reservations, it's a room.
        }
    }

    if (!bookingSnap.exists) {
        console.error(`Booking ${bookingId} not found in any collection for sending confirmation email.`);
        return;
    }
    
    const booking = bookingSnap.data() as any;

    const customerEmail = booking.customer?.email || booking.guestEmail || booking.email;
    const customerName = booking.customer?.name || booking.guestName;

    if (!customerEmail) {
        console.error(`Booking ${bookingId} has no customer email.`);
        return;
    }

    const subject = `Your Sweet Home Punta Cana Booking is Confirmed! (ID: ${bookingId.substring(0,7).toUpperCase()})`;
    let emailHtml = '';

    // Handle Timestamps correctly - they might be Firestore Timestamps on the server
    const getSafeDate = (timestamp: any): string => {
        if (!timestamp) return new Date().toISOString();
        if (timestamp instanceof Timestamp) {
            return timestamp.toDate().toISOString();
        }
        if (typeof timestamp === 'string') {
            return timestamp;
        }
        if (typeof timestamp === 'object' && timestamp._seconds) {
            return new Timestamp(timestamp._seconds, timestamp._nanoseconds).toDate().toISOString();
        }
        return new Date().toISOString();
    };

    try {
        switch (bookingType) {
            case 'room': {
                const bookingDetails: BookingDetails = {
                    confirmationId: bookingId,
                    rooms: (booking.room?.ids || [booking.roomId]).map((id:string, i:number) => ({
                        id: id,
                        name: booking.roomName || 'Room',
                        price: (booking.totalPrice || 0),
                        bedding: "King", 
                        image: booking.room?.image || '', 
                        capacity: booking.numberOfGuests, 
                        slug: booking.room?.slug || ''
                    })),
                    dates: { from: booking.checkInDate, to: booking.checkOutDate },
                    guests: booking.numberOfGuests || 2,
                    nights: 0,
                    totalPrice: booking.totalPrice,
                    guestInfo: {
                        firstName: (customerName || '').split(' ')[0],
                        lastName: (customerName || '').split(' ').slice(1).join(' '),
                        email: customerEmail,
                        phone: booking.customer?.phone || '',
                    },
                    airportPickup: booking.transfer,
                };
                emailHtml = render(<ReservationConfirmationEmail bookingDetails={bookingDetails} />);
                break;
            }
            case 'laundry':
            case 'laundry-service-wash-dry': {
                const laundryBooking: ServiceBooking = {
                    id: bookingId,
                    guestName: customerName,
                    email: customerEmail,
                    total: booking.pricing?.totalUSD,
                    serviceType: 'Laundry Service',
                    accommodation: booking.details?.accommodation,
                    qty: booking.details?.qty,
                    date: booking.details?.date,
                    time: booking.details?.time,
                    createdAt: getSafeDate(booking.createdAt),
                    details: booking.details,
                };
                emailHtml = render(<LaundryConfirmationEmail booking={laundryBooking} />);
                break;
            }
            case 'airportTransfer': {
                 const transferBooking: ServiceBooking = {
                    id: bookingId,
                    guestName: customerName,
                    email: customerEmail,
                    total: booking.pricing?.totalUSD,
                    direction: booking.details?.direction,
                    arrivalDate: booking.details?.arrivalDate,
                    departureDate: booking.details?.departureDate,
                    arrivalFlight: booking.details?.arrivalFlight,
                    departureFlight: booking.details?.departureFlight,
                    departureTime: booking.details?.departureTime,
                    createdAt: getSafeDate(booking.createdAt),
                    serviceType: 'Airport Transfer',
                    details: booking.details,
                };
                emailHtml = render(<TransferConfirmationEmail booking={transferBooking} />);
                break;
            }
            case 'excursion': {
                const excursionDetails = {
                    mainExcursion: { 
                        ...(booking.details?.excursion || {}),
                        id: booking.excursionId,
                        slug: '',
                        title: booking.details?.excursion?.name || 'Excursion',
                        tagline: '',
                        description: '',
                        image: '',
                        price: { adult: (booking.pricing.totalUSD || 0) / (parseInt(booking.details?.pax) || 1) },
                        inclusions: [],
                        practicalInfo: { departure: '', duration: '', pickup: '', notes: []},
                        gallery: [],
                        bookingDate: booking.details?.excursion?.date,
                        adults: parseInt(booking.details?.pax) || 1,
                    },
                    bundledItems: [],
                    totalPrice: booking.pricing.totalUSD,
                    bundleDiscount: 0,
                    bookingId: bookingId,
                    guestInfo: {
                        firstName: (customerName || '').split(' ')[0],
                        lastName: (customerName || '').split(' ').slice(1).join(' '),
                        email: customerEmail
                    }
                };
                emailHtml = render(<ExcursionConfirmationEmail bookingDetails={excursionDetails as any} />);
                break;
            }
            default:
                console.error(`Unknown booking type for email: ${bookingType}`);
                return;
        }

        if (emailHtml) {
            await sendEmail(customerEmail, subject, emailHtml);
        } else {
            console.error(`Could not generate email HTML for booking ${bookingId}`);
        }
    } catch (e: any) {
        console.error(`Error rendering or sending email for booking ${bookingId}:`, e);
    }
}
