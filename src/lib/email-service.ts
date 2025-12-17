import { Resend } from 'resend';
import { render } from '@react-email/render';
import ReservationConfirmationEmail from '@/emails/reservation-confirmation';
import { BookingDetails } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123_build_placeholder');

interface BookingEmailData {
    guestName: string;
    guestEmail: string;
    bookingType: 'room' | 'laundry' | 'transfer' | 'excursion';
    bookingDetails: any;
    confirmationId: string;
    totalPrice: number;
}

export async function sendBookingConfirmation(data: BookingEmailData) {
    const { guestName, guestEmail, bookingType, bookingDetails, confirmationId, totalPrice } = data;

    // Use different sender addresses for different booking types
    const fromAddresses = {
        room: 'Sweet Home Punta Cana <bookings@sweethomepc.com>',
        transfer: 'Sweet Home Airport Transfer <airporttransfer@sweethomepc.com>',
        laundry: 'Sweet Home Laundry Service <laundry@sweethomepc.com>',
        excursion: 'Sweet Home Excursions <excursions@sweethomepc.com>',
    };

    const fromAddress = fromAddresses[bookingType] || fromAddresses.room;

    // Normalize bookingType to ensure case-insensitive matching
    const normalizedBookingType = bookingType.toLowerCase().trim();

    const subject = `Booking Confirmation - Sweet Home Punta Cana`;

    // Normalize details: Standalone has nested 'details', Room+Transfer has flattened properties
    const details = bookingDetails.details || bookingDetails;

    // -------------------------------------------------------------------------
    // NEW: Use React Email for Room Bookings
    // -------------------------------------------------------------------------
    if (normalizedBookingType === 'room') {
        const checkIn = bookingDetails.checkInDate ? new Date(bookingDetails.checkInDate) : new Date();
        const checkOut = bookingDetails.checkOutDate ? new Date(bookingDetails.checkOutDate) : new Date();
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        const bookingData: BookingDetails = {
            confirmationId: confirmationId,
            rooms: (bookingDetails.rooms && Array.isArray(bookingDetails.rooms))
                ? bookingDetails.rooms.map((r: any) => ({
                    id: r.id || "room-1",
                    name: r.name || 'Luxury Room',
                    bedding: r.bedding || "King",
                    price: r.price || 0,
                    image: (r.image && r.image.startsWith('http'))
                        ? r.image
                        : `https://sweet-home-punta-cana.vercel.app${r.image || '/1-Caribbean.png'}`,
                    capacity: r.capacity || 2,
                    slug: r.slug || "luxury-room"
                }))
                : [{
                    id: "room-1", // Fallback for legacy calls
                    name: bookingDetails.roomName || 'Luxury Room',
                    bedding: "King",
                    price: (totalPrice / (nights || 1)) || 0,
                    image: (bookingDetails.room?.image && bookingDetails.room.image.startsWith('http'))
                        ? bookingDetails.room.image
                        : `https://sweet-home-punta-cana.vercel.app${bookingDetails.room?.image || '/1-Caribbean.png'}`,
                    capacity: bookingDetails.room?.capacity || 2,
                    slug: bookingDetails.room?.slug || "luxury-room"
                }],
            dates: {
                from: bookingDetails.checkInDate || new Date().toISOString(),
                to: bookingDetails.checkOutDate || new Date().toISOString()
            },
            guests: bookingDetails.numberOfGuests || 1,
            nights: nights || 1,
            totalPrice: totalPrice,
            guestInfo: {
                firstName: guestName.split(' ')[0],
                lastName: guestName.split(' ').slice(1).join(' '),
                email: guestEmail,
                phone: bookingDetails.phone || bookingDetails.guestPhone || ''
            },
            // Check for airport transfer in serviceBookings if available
            airportPickup: bookingDetails.serviceBookings?.find((sb: any) => sb.type === 'airport_transfer')
                ? {
                    tripType: 'one-way', // Default or derive
                    price: bookingDetails.serviceBookings.find((sb: any) => sb.type === 'airport_transfer').total || 0,
                    // Map other transfer details if possible, but minimal is fine for now
                }
                : undefined
        };

        try {
            const emailHtml = await render(ReservationConfirmationEmail({ bookingDetails: bookingData }));

            await resend.emails.send({
                from: fromAddress,
                to: [guestEmail],
                bcc: [
                    process.env.BOOKING_NOTIFICATION_EMAIL || 'info@sweethomepuntacana.com',
                    'sweethomepc123@gmail.com'
                ],
                subject,
                html: emailHtml,
            });

            console.log(`✅ [React Email] Room booking confirmation sent to ${guestEmail}`);
            return { success: true, html: emailHtml };
        } catch (error) {
            console.error('❌ Failed to send component-based email:', error);
            // Fallback to legacy string template if component fails? 
            // Better to return error to debug.
            return { success: false, error, html: '' };
        }
    }
    // -------------------------------------------------------------------------

    // Helper to format date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) { return dateStr; }
    };
    // Helper to format date with weekday
    const formatFullDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        } catch (e) { return dateStr; }
    };

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* Base Styles */
          body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          
          /* Common Styles */
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background: #f9f9f9; }
          
          /* Mobile Responsive */
          @media only screen and (max-width: 600px) {
            .mob-stack { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; box-sizing: border-box !important; }
            .mob-center { text-align: center !important; }
            .mob-mb { margin-bottom: 20px !important; }
            
            /* Transfer specific overrides */
            .stack-column {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                border-right: none !important;
                border-bottom: 1px dashed #ccc !important;
                padding-bottom: 20px !important;
                box-sizing: border-box !important;
            }
            .stack-column:last-child {
                border-bottom: none !important;
            }
            
            /* Clean Ticket Mobile Overrides */
            .ticket-column {
                display: block !important;
                width: 100% !important;
                padding: 10px 0 !important;
                border-bottom: 1px dashed #eee;
                box-sizing: border-box !important;
            }
            .ticket-column:last-child { border-bottom: none; }
          }
        </style>
      </head>
      <body>
        ${(() => {
            if (normalizedBookingType === 'transfer') {
                const details = bookingDetails.details || bookingDetails;
                const direction = details.direction || 'arrive';

                // Logic directly from confirmation page
                const from = (direction === 'arrive' || direction === 'round') ? "Punta Cana Intl. Airport" : "Sweet Home Punta Cana";
                const fromCode = (direction === 'arrive' || direction === 'round') ? "PUJ" : "SHPC";
                const to = (direction === 'arrive' || direction === 'round') ? "Sweet Home Punta Cana" : "Punta Cana Intl. Airport";
                const toCode = (direction === 'arrive' || direction === 'round') ? "SHPC" : "PUJ";
                const flightNumber = (direction === 'arrive' || direction === 'round') ? (details.arrivalFlight || details.flightNumber) : (details.departureFlight || details.flightNumber);
                const date = (direction === 'arrive' || direction === 'round') ? (details.arrivalDate || details.date) : (details.departureDate || details.date);
                const time = details.departureTime || null;
                const formattedDate = date ? formatDate(date) + (new Date(date).getFullYear() === new Date().getFullYear() ? '' : ` ${new Date(date).getFullYear()}`) : 'N/A';


                return `
            <div style="background-color: #f4f4f4; padding: 20px; font-family: 'Helvetica', 'Arial', sans-serif;">
              <!-- Confirmation Message -->
              <div style="max-width: 600px; margin: 0 auto; text-align: center; margin-bottom: 30px;">
                 <h1 style="font-family: 'Times New Roman', serif; font-size: 32px; color: #1A1E26; margin-bottom: 10px;">Your Transfer is Booked!</h1>
                 <p style="color: #666; font-size: 16px;">Your journey is secured. Here is your boarding pass.</p>
              </div>

              <!-- Ticket Container -->
              <div style="max-width: 600px; margin: 0 auto; background-color: #FAF8F5; border: 2px dashed #ccc; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                
                <!-- Ticket Header -->
                <div style="background-color: #1A1E26; color: white; padding: 20px 30px; border-bottom: 2px dashed rgba(255,255,255,0.2);">
                    <div style="display: table; width: 100%;">
                        <div style="display: table-cell; vertical-align: middle;">
                            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; margin-bottom: 5px;">BOARDING PASS</div>
                            <div style="font-family: 'Times New Roman', serif; font-size: 24px; font-weight: bold; margin-bottom: 5px;">Sweet Home Transfer</div>
                            <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #D4AF37;">Booking: ${confirmationId}</div>
                        </div>
                         <div style="display: table-cell; vertical-align: middle; text-align: right;">
                            <span style="font-size: 24px;">🚌</span>
                        </div>
                    </div>
                </div>

                <!-- Ticket Body -->
                <div>
                   <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <!-- Row 1 (Mobile: Col 1 & 2 stacked or side-by-side? Designing for Mobile 2-col visual parity) -->
                      <tr>
                          <td style="padding: 0; vertical-align: top;">
                              <!-- Desktop: 3 Cols. Mobile: We simulate grid by specific table nesting or full widths -->
                              <!-- We'll use the 'stack-column' class to force specific behavior on mobile -->
                              
                              <!-- Main Wrapper Table -->
                              <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                      <!-- Column 1: Departure / Arrival -->
                                      <td width="33.33%" valign="top" style="padding: 24px; border-right: 1px dashed #ccc; border-bottom: 1px dashed #ccc; font-family: sans-serif;" class="stack-column">
                                        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: bold; margin-bottom: 15px;">Departure / Arrival</div>
                                        <div style="margin-bottom: 15px;">
                                            <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">From</div>
                                            <div style="font-size: 14px; font-weight: bold; color: #1A1E26; margin-bottom: 2px;">${from}</div>
                                            <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #666;">${fromCode}</div>
                                        </div>
                                        
                                        <!-- Bus Line -->
                                        <div style="position: relative; height: 1px; background-color: #ccc; margin: 15px 0;">
                                            <div style="position: absolute; top: -10px; left: 50%; margin-left: -10px; background-color: #FAF8F5; padding: 0 5px;">🚌</div>
                                        </div>

                                        <div style="margin-bottom: 20px;">
                                            <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">To</div>
                                            <div style="font-size: 14px; font-weight: bold; color: #1A1E26; margin-bottom: 2px;">${to}</div>
                                            <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #666;">${toCode}</div>
                                        </div>

                                        <div style="border-top: 1px dashed #ccc; padding-top: 15px;">
                                            <table width="100%">
                                                <tr>
                                                    <td style="font-size: 10px; text-transform: uppercase; color: #999;">Flight</td>
                                                    <td style="font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; text-align: right; color: #1A1E26;">${flightNumber || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-size: 10px; text-transform: uppercase; color: #999; padding-top: 5px;">Date</td>
                                                    <td style="font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; text-align: right; color: #1A1E26; padding-top: 5px;">${formattedDate}</td>
                                                </tr>
                                                ${time ? `
                                                <tr>
                                                    <td style="font-size: 10px; text-transform: uppercase; color: #999; padding-top: 5px;">Pickup Time</td>
                                                    <td style="font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; text-align: right; color: #1A1E26; padding-top: 5px;">${time} EST</td>
                                                </tr>` : ''}
                                            </table>
                                        </div>
                                      </td>

                                      <!-- Column 3 (Moved to pos 2 for email logic to match visual priority if needed, but let's stick to page layout: Dep | Pass | QR on Desktop. Page Mobile: Dep|QR then Pass) -->
                                      <!-- Replicating Page Layout: Mobile [Dep | QR] <-- Row 1. [Pass] <-- Row 2. -->
                                      <!-- Desktop: [Dep | Pass | QR] -->
                                      <!-- This is hard in tables without duplication or complex display:none. -->
                                      <!-- Let's stick to a linear stack that looks good. The user said '1:1', implying the confirmation page layout. -->
                                      <!-- Implementing Desktop [Dep | Pass | QR]. Mobile will naturally stack [Dep] [Pass] [QR] unless we force it. -->
                                      <!-- Force Mobile Order: Dep -> QR -> Pass? -->
                                      
                                      <!-- Let's try standard 3-col. Mobile will stack. -->
                                      
                                      <!-- Column 2: Passenger Info -->
                                      <td width="33.33%" valign="top" style="padding: 24px; border-right: 1px dashed #ccc; border-bottom: 1px dashed #ccc; font-family: sans-serif;" class="stack-column">
                                         <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: bold; margin-bottom: 15px;">Passenger / Info</div>
                                         <div style="margin-bottom: 15px;">
                                            <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">Passenger Name</div>
                                            <div style="font-family: 'Times New Roman', serif; font-size: 18px; font-weight: bold; color: #1A1E26; text-transform: uppercase;">${guestName}</div>
                                         </div>
                                         <div style="margin-bottom: 15px;">
                                            <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">Booking Ref</div>
                                            <div style="font-family: monospace; font-size: 12px; font-weight: bold; color: #1A1E26;">${confirmationId}</div>
                                         </div>
                                         <div style="margin-bottom: 15px;">
                                            <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">Service Type</div>
                                            <div style="font-size: 14px; font-weight: bold; color: #1A1E26;">${direction === 'arrive' ? 'Arrival' : (direction === 'depart' ? 'Departure' : 'Round Trip')}</div>
                                         </div>
                                         <div style="background-color: rgba(212, 175, 55, 0.1); border-left: 2px solid #D4AF37; padding: 10px; margin-top: 20px;">
                                            <p style="margin: 0; font-size: 11px; color: #1A1E26; line-height: 1.4;"><strong>Note:</strong> ${direction === 'depart'
                        ? "For your peace of mind, please be on time. The maximum wait time is 30 minutes. After that, the service is cancelled and non-refundable."
                        : "Your driver will be waiting with a sign bearing your name."}</p>
                                        </div>
                                      </td>

                                      <!-- Column 3: Price / Code -->
                                      <td width="33.33%" valign="top" style="padding: 24px; border-bottom: 1px dashed #ccc; font-family: sans-serif;" class="stack-column">
                                        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: bold; margin-bottom: 15px;">Booking Code</div>
                                         <div style="text-align: center; margin-bottom: 20px;">
                                            <div style="background: white; border: 2px solid #ccc; padding: 10px; display: inline-block; border-radius: 4px;">
                                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${confirmationId}" alt="QR Code" width="100" height="100" style="display: block;" />
                                            </div>
                                            <div style="font-family: monospace; font-size: 10px; color: #999; margin-top: 5px;">${confirmationId.substring(0, 8).toUpperCase()}</div>
                                        </div>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                   </table>
                </div>
                
                 <!-- Total Paid Section (New Footer 1:1) -->
                 <div style="background-color: #f0f0f0; border-top: 1px dashed #ccc; padding: 20px; text-align: center;">
                    <div style="font-family: 'Times New Roman', serif; font-size: 24px; font-weight: bold; color: #1A1E26; margin-bottom: 5px;">
                        Total Paid: $${totalPrice.toFixed(2)} US
                    </div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666;">
                        All taxes and fees included
                    </div>
                 </div>

                <!-- Footer -->
                <div style="background-color: #FAF8F5; border-top: 2px dashed #ccc; padding: 15px; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #666;">Please present this confirmation upon arrival · Sweet Home Punta Cana</p>
                </div>
              </div>
               <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
                  <p>Need help? WhatsApp: <a href="https://wa.me/18095105465" style="color: #D4AF37; text-decoration: none;">+1 (809) 510-5465</a></p>
              </div>
            </div>`;
            }

            if (normalizedBookingType === 'room') {
                const checkIn = bookingDetails.checkInDate ? formatDate(bookingDetails.checkInDate) : 'N/A';
                const checkOut = bookingDetails.checkOutDate ? formatDate(bookingDetails.checkOutDate) : 'N/A';
                const roomName = bookingDetails.roomName || 'Luxury Room';
                const guests = bookingDetails.numberOfGuests || 1;

                return `
             <div style="background-color: #F9F7F2; padding: 0; font-family: 'Helvetica', 'Arial', sans-serif;">
                 <div style="position: relative; height: 250px; background-image: url('${(bookingDetails.room?.image && bookingDetails.room.image.startsWith('http')) ? bookingDetails.room.image : `https://sweet-home-punta-cana.vercel.app${bookingDetails.room?.image || '/1-Caribbean.png'}`}'); background-size: cover; background-position: center;">
                   <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.4);"></div>
                   <div style="position: relative; z-index: 10; padding: 40px 20px; text-align: center; color: white;">
                      <div style="background: white; border-radius: 50%; padding: 10px; display: inline-block; margin-bottom: 15px;">
                         <img src="https://img.icons8.com/ios-filled/50/228B22/checkmark--v1.png" alt="Check" width="24" height="24"/>
                      </div>
                      <h1 style="font-family: 'Times New Roman', serif; font-size: 28px; margin: 0 0 10px 0; letter-spacing: 1px;">Your Vogue Beach Getaway</h1>
                      <p style="font-size: 16px; margin: 0; opacity: 0.9;">Reservation Confirmed</p>
                   </div>
                </div>
                <div style="max-width: 600px; margin: -40px auto 40px auto; position: relative; z-index: 20; padding: 0 20px;">
                   <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 20px;">
                      <div style="background-color: rgba(212, 175, 55, 0.1); border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding: 20px;">
                         <h2 style="font-family: 'Times New Roman', serif; font-size: 20px; color: #1A1E26; margin: 0;">Reservation Details</h2>
                      </div>
                      <div style="padding: 30px;">
                         <div style="text-align: center; margin-bottom: 25px;">
                            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Reservation ID</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1A1E26; font-family: 'Times New Roman', serif;">${confirmationId.substring(0, 8).toUpperCase()}</div>
                         </div>
                         <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                               <td style="padding-bottom: 20px;">
                                  <div style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Guest Name</div>
                                  <div style="font-size: 16px; font-weight: bold; color: #333;">${guestName}</div>
                               </td>
                               <td style="padding-bottom: 20px;">
                                  <div style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Email</div>
                                  <div style="font-size: 16px; font-weight: bold; color: #333;">${guestEmail}</div>
                               </td>
                            </tr>
                             <tr>
                                <td colspan="2" style="text-align: center; padding-top: 10px;">
                                   <div style="border: 1px solid #eee; padding: 10px; display: inline-block; border-radius: 8px;">
                                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${confirmationId}-GROUP" alt="QR Code" width="100" height="100" />
                                   </div>
                                </td>
                             </tr>
                          </table>
                       </div>
                    </div>
                    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 20px;">
                       <div style="padding: 20px; border-bottom: 1px solid #f0f0f0;">
                          <h2 style="font-family: 'Times New Roman', serif; font-size: 20px; color: #1A1E26; margin: 0;">📅 Your Stay</h2>
                       </div>
                       <div style="padding: 20px;">
                         
                         <!-- Common Dates -->
                          <div style="margin-bottom: 20px; border-bottom: 1px dashed #eee; padding-bottom: 15px;">
                             <div style="display: flex; justify-content: space-between;">
                                <div>
                                    <div style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Check-In</div>
                                    <div style="font-size: 15px; font-weight: bold; color: #333;">${checkIn}</div>
                                    <div style="font-size: 12px; color: #666;">3:00 PM</div>
                                </div>
                                <div>
                                    <div style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Check-Out</div>
                                    <div style="font-size: 15px; font-weight: bold; color: #333;">${checkOut}</div>
                                    <div style="font-size: 12px; color: #666;">11:00 AM</div>
                                </div>
                             </div>
                          </div>

                          <!-- Room List Loop -->
                          ${(() => {
                        // Use bookingDetails directly if bookingData isn't available in this scope, 
                        // but we need to ensure 'rooms' exists. 
                        // In step 272 we added 'rooms' to bookingData. 
                        // Let's safe guard.
                        const rooms = (bookingDetails.rooms && Array.isArray(bookingDetails.rooms)) ? bookingDetails.rooms : [{
                            name: bookingDetails.roomName || 'Luxury Room',
                            id: bookingDetails.id,
                            capacity: bookingDetails.numberOfGuests,
                            price: bookingDetails.totalPrice,
                            image: bookingDetails.room?.image || 'https://sweet-home-punta-cana.vercel.app/1-Caribbean.png'
                        }];

                        const start = new Date(bookingDetails.checkInDate);
                        const end = new Date(bookingDetails.checkOutDate);
                        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

                        return rooms.map((room: any, index: number) => {
                            const roomNights = nights;
                            const roomPrice = room.price || (room.totalPrice) || (totalPrice / rooms.length);
                            const nightlyRate = roomPrice / roomNights;
                            const isLast = index === rooms.length - 1;

                            return `
                                 <div style="display: flex; gap: 15px; margin-bottom: ${isLast ? '0' : '20px'}; padding-bottom: ${isLast ? '0' : '20px'}; border-bottom: ${isLast ? 'none' : '1px solid #f0f0f0'};">
                                     <!-- Image -->
                                     <div style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background-color: #eee;">
                                         <img src="${(room.image && room.image.startsWith('http')) ? room.image : `https://sweet-home-punta-cana.vercel.app${room.image || '/1-Caribbean.png'}`}" alt="${room.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                                     </div>
                                     <div style="flex-grow: 1;">
                                         <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 4px;">${room.name}</div>
                                         <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Ref: ${room.id?.substring(0, 5).toUpperCase() || 'RES'} · ${room.capacity || bookingDetails.numberOfGuests || 2} Guests</div>
                                         <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                             <div style="font-size: 12px; color: #999;">$${nightlyRate.toFixed(2)} x ${roomNights} nights</div>
                                             <div style="font-size: 14px; font-weight: bold; color: #1A1E26;">$${roomPrice.toFixed(2)}</div>
                                         </div>
                                     </div>
                                 </div>
                                 `;
                        }).join('');
                    })()}

                       </div>
                    </div>
                   <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                      <div style="padding: 20px; border-bottom: 1px solid #f0f0f0;">
                         <h2 style="font-family: 'Times New Roman', serif; font-size: 20px; color: #1A1E26; margin: 0;">💰 Payment Summary</h2>
                      </div>
                      <div style="padding: 25px;">
                         <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">Total</span>
                            <span style="font-weight: bold; color: #333;">$${totalPrice.toFixed(2)}</span>
                         </div>
                         <div style="display: flex; justify-content: space-between; font-size: 18px; color: #1A1E26; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc;">
                            <span style="font-weight: bold;">Total Paid</span>
                            <span style="font-weight: bold;">$${totalPrice.toFixed(2)} USD</span>
                         </div>
                         <div style="margin-top: 20px; background: #F9F7F2; padding: 10px; border-radius: 6px; text-align: center; font-size: 12px; color: #666;">
                            Free cancellation up to 48h before arrival.
                         </div>
                      </div>
                   </div>
                   <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
                      <p>Need help? WhatsApp: <a href="https://wa.me/18095105465" style="color: #D4AF37; text-decoration: none;">+1 (809) 510-5465</a></p>
                      <p>Sweet Home Punta Cana | Bávaro, Punta Cana</p>
                   </div>
                </div>
             </div>`;
            }

            if (normalizedBookingType === 'excursion') {
                const bookingId = confirmationId.substring(0, 8).toUpperCase();
                const bookingDate = details.mainExcursion?.bookingDate ? formatFullDate(details.mainExcursion.bookingDate) : (bookingDetails.date ? formatFullDate(bookingDetails.date) : 'Date to be confirmed');

                // Helper to render excursion items (Main + Bundles)
                const renderExcursionItems = () => {
                    const items = [details.mainExcursion, ...(details.bundledItems || [])].filter(Boolean);
                    return items.map((item: any) => `
                        <div style="border-bottom: 1px dashed #e5e7eb; padding-bottom: 24px; margin-bottom: 24px;">
                            <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                                ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 80px; height: 60px; border-radius: 8px; object-fit: cover;" />` : ''}
                                <div>
                                    <div style="font-size: 14px; color: #6b7280; display: flex; align-items: center; gap: 4px;">
                                        🏠 Adventure
                                    </div>
                                    <div style="font-size: 18px; font-weight: 600; color: #1f2937; line-height: 1.4;">${item.title}</div>
                                </div>
                            </div>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px; color: #1f2937;">
                                <tr>
                                    <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                                        <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">📅 Date</div>
                                        <div style="font-size: 16px; font-weight: 500;">${item.bookingDate ? formatFullDate(item.bookingDate) : 'TBD'}</div>
                                    </td>
                                    <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                                        <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">👥 Guests</div>
                                        <div style="font-size: 16px; font-weight: 500;">${item.adults || 1} Guests</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                                        ${item.practicalInfo?.duration ? `
                                        <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">🕒 Duration</div>
                                        <div style="font-size: 16px; font-weight: 500;">${item.practicalInfo.duration}</div>
                                        ` : ''}
                                    </td>
                                    <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                                        ${item.practicalInfo?.departure ? `
                                        <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">🕒 Pickup Time</div>
                                        <div style="font-size: 16px; font-weight: 500;">${item.practicalInfo.departure}</div>
                                        ` : ''}
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="vertical-align: top;">
                                        ${item.practicalInfo?.pickup ? `
                                        <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">📍 Meeting Point</div>
                                        <div style="font-size: 16px; font-weight: 500;">${item.practicalInfo.pickup}</div>
                                        ${item.practicalInfo.pickupMapLink ? `<a href="${item.practicalInfo.pickupMapLink}" style="color: #2563eb; text-decoration: underline; font-size: 14px; display: block; margin-top: 4px;">View Map & Instructions</a>` : ''}
                                        ` : ''}
                                    </td>
                                </tr>
                            </table>
                        </div>
                   `).join('');
                };

                return `
             <div style="background-color: #F9F7F2; padding: 40px 20px; font-family: 'Helvetica', 'Arial', sans-serif;">
               <div style="max-width: 600px; margin: 0 auto; padding-bottom: 40px;">
                 
                 <!-- Header with Image -->
                 <div style="text-align: center; margin-bottom: 30px; background-color: #1A1E26; padding: 40px 20px; border-radius: 16px; color: white;">
                    <div style="background: white; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
                        <span style="font-size: 24px;">✅</span>
                    </div>
                    <h1 style="font-family: 'Times New Roman', serif; font-size: 28px; margin: 0 0 10px 0;">Your Experience is locked in</h1>
                 </div>

                 <!-- Card 1: Reservation Details -->
                 <div style="background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-bottom: 24px; overflow: hidden;">
                    <div style="background-color: #FEFCE8; padding: 16px 24px; border-bottom: 1px solid #FEF08A;">
                        <h3 style="margin: 0; font-size: 18px; color: #1f2937; display: flex; align-items: center; gap: 8px;">
                            <span>✅</span> Reservation Details
                        </h3>
                    </div>
                    <div style="padding: 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td width="70%" style="vertical-align: top; padding-right: 20px;">
                                    <div style="margin-bottom: 20px;">
                                        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Reservation ID</div>
                                        <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${bookingId}</div>
                                    </div>
                                    
                                    <div style="margin-bottom: 20px;">
                                        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Guest Name</div>
                                        <div style="font-size: 16px; font-weight: 500; color: #1f2937;">${guestName}</div>
                                    </div>

                                    <div style="margin-bottom: 20px;">
                                        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Confirmation Sent To</div>
                                        <div style="font-size: 16px; font-weight: 500; color: #1f2937;">${guestEmail}</div>
                                    </div>
                                    
                                    <div>
                                        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Guest House</div>
                                        <div style="font-size: 16px; font-weight: 500; color: #1f2937;">Sweet Home Punta Cana</div>
                                    </div>
                                </td>
                                <td width="30%" style="vertical-align: top; text-align: center;">
                                    <div style="background: #F9F7F2; padding: 12px; border-radius: 12px; border: 1px solid #e5e7eb; display: inline-block;">
                                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${bookingId}" alt="QR Code" width="100" height="100" />
                                    </div>
                                    <div style="font-size: 10px; color: #6b7280; margin-top: 8px; line-height: 1.2;">
                                        📌 Keep this ID and QR Code handy for quick check-in!
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                 </div>

                 <!-- Card 2: Excursion Details -->
                 <div style="background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-bottom: 24px; overflow: hidden;">
                    <div style="padding: 16px 24px; border-bottom: 1px solid #f3f4f6;">
                        <h3 style="margin: 0; font-size: 18px; color: #1f2937; display: flex; align-items: center; gap: 8px;">
                            <span>🌴</span> Excursion Details
                        </h3>
                    </div>
                    <div style="padding: 24px;">
                        ${renderExcursionItems()}
                    </div>
                 </div>

                 <!-- Card 3: Payment Summary -->
                 <div style="background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden;">
                    <div style="padding: 16px 24px; border-bottom: 1px solid #f3f4f6;">
                        <h3 style="margin: 0; font-size: 18px; color: #1f2937; display: flex; align-items: center; gap: 8px;">
                            <span>💰</span> Payment Summary
                        </h3>
                    </div>
                    <div style="padding: 24px;">
                        <div style="margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; color: #6b7280; margin-bottom: 8px;">
                                <span>Subtotal</span>
                                <span style="font-weight: 500; color: #1f2937;">$${totalPrice.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">
                                <span>Total Paid (USD)</span>
                                <span>$${totalPrice.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; color: #6b7280; font-size: 14px;">
                                <span>Balance Due at Check-in</span>
                                <span>$0.00</span>
                            </div>
                        </div>
                        
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-bottom: 16px;">
                             <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                                <tr>
                                    <td width="50%" style="padding-right: 12px;">
                                        <div style="color: #6b7280; margin-bottom: 4px;">Payment Processed On</div>
                                        <div style="font-weight: 500; color: #1f2937;">${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                                    </td>
                                    <td width="50%">
                                        <div style="color: #6b7280; margin-bottom: 4px;">Cancellation Policy</div>
                                        <div style="color: #16a34a; font-weight: 500;">Free cancellation up to 48h before arrival.</div>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <div style="background-color: #F9F7F2; padding: 12px; border-radius: 8px; text-align: center; color: #4b5563; font-size: 14px; font-weight: 500;">
                            ✨ All taxes included, no hidden fees.
                        </div>
                    </div>
                 </div>

                 <!-- Footer -->
                 <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                    <p>💬 Need help? WhatsApp: <a href="https://wa.me/18095105465" style="color: #D4AF37; text-decoration: none;">+1 (809) 510-5465</a></p>
                    <p>Sweet Home Punta Cana | Bávaro, Punta Cana</p>
                 </div>

               </div>
             </div>`;
            }

            if (normalizedBookingType === 'laundry') {
                // Laundry Service - Exact Confirmation Page Replica
                const pickupTime = details.pickupTime || '08:00 AM';
                const bags = details.bags || 1;
                const roomNumber = details.roomNumber || 'N/A';
                const phone = bookingDetails.phone || details.phone || 'N/A';
                const dateStr = bookingDetails.date ? formatFullDate(bookingDetails.date) : 'N/A';
                const receiptDate = bookingDetails.date ? new Date(bookingDetails.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'N/A';

                // Special Instructions (conditional)
                const specialInstructions = details.specialInstructions ? `
                <div style="padding-top: 15px; border-top: 1px dashed #ccc; margin-top: 15px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 5px; font-family: 'Helvetica', sans-serif;">Special Instructions</div>
                    <div style="font-size: 14px; color: #333; font-style: italic;">${details.specialInstructions}</div>
                </div>
             ` : '';

                return `
             <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: 'Helvetica', 'Arial', sans-serif;">
               <div style="max-width: 600px; margin: 0 auto;">
                  
                  <!-- Main Header -->
                  <div style="text-align: center; margin-bottom: 30px;">
                     <div style="margin-bottom: 15px;">
                        <img src="https://img.icons8.com/ios-filled/100/228B22/checkmark--v1.png" alt="Check" width="60" height="60" style="display: block; margin: 0 auto;"/>
                     </div>
                     <h1 style="color: #1A1E26; font-size: 36px; margin: 0 0 10px 0; font-family: 'Times New Roman', serif; font-weight: bold;">Laundry Pickup Scheduled!</h1>
                     <p style="color: #666; font-size: 16px; margin: 0 auto 15px auto; max-width: 400px; line-height: 1.5;">We'll take care of the rest. A confirmation has been sent to your email.</p>
                     <div style="background: #e0e0e0; color: #555; font-size: 12px; padding: 4px 10px; border-radius: 4px; display: inline-block; font-family: monospace;">Order ID: <strong>${confirmationId}</strong></div>
                  </div>

                  <!-- Receipt Container -->
                  <div style="background: #FAF8F5; border: 2px dashed #ccc; border-radius: 8px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                      
                      <!-- Receipt Header -->
                      <div style="background-color: #1A1E26; color: white; padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                  <td>
                                      <div style="font-family: 'Times New Roman', serif; font-size: 20px; font-weight: bold;">Sweet Home Punta Cana</div>
                                      <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; margin-top: 4px;">Service Receipt</div>
                                  </td>
                                  <td style="text-align: right; vertical-align: top;">
                                      <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7;">Date</div>
                                      <div style="font-family: monospace; font-size: 14px; font-weight: bold; margin-top: 4px;">${receiptDate}</div>
                                  </td>
                              </tr>
                          </table>
                      </div>

                      <!-- Receipt Body -->
                      <div style="padding: 30px;">
                          
                          <!-- Guest Info Grid (2 Rows) -->
                          <div style="border-bottom: 1px dashed #ccc; padding-bottom: 20px; margin-bottom: 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="50%" valign="top" class="mob-stack" style="padding-bottom: 20px;">
                                        <div style="font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 2px;">Guest Name</div>
                                        <div style="font-size: 16px; color: #1A1E26; font-weight: bold;">${guestName}</div>
                                    </td>
                                    <td width="50%" valign="top" class="mob-stack" style="padding-bottom: 20px;">
                                        <div style="font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 2px;">Email</div>
                                        <div style="font-size: 14px; color: #333; font-weight: bold;">${guestEmail}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="50%" valign="top" class="mob-stack">
                                        <div style="font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 2px;">Phone</div>
                                        <div style="font-size: 16px; color: #1A1E26; font-weight: bold;">${phone}</div>
                                    </td>
                                    <td width="50%" valign="top" class="mob-stack">
                                        <div style="font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 2px;">Room Number</div>
                                        <div style="font-size: 16px; color: #1A1E26; font-weight: bold;">${roomNumber}</div>
                                    </td>
                                </tr>
                            </table>
                          </div>

                          <!-- Service Details -->
                          <div style="border-bottom: 1px dashed #ccc; padding-bottom: 20px; margin-bottom: 20px;">
                               <table width="100%">
                                   <tr>
                                       <td style="font-size: 12px; text-transform: uppercase; color: #666;">Service</td>
                                       <td style="text-align: right; font-family: 'Times New Roman', serif; font-size: 18px; font-weight: bold; color: #1A1E26;">Wash & Fold</td>
                                   </tr>
                                   <tr>
                                       <td style="font-size: 12px; text-transform: uppercase; color: #666; padding-top: 10px;">Bags</td>
                                       <td style="text-align: right; font-size: 16px; font-weight: bold; color: #1A1E26; padding-top: 10px;">${bags}</td>
                                   </tr>
                               </table>
                          </div>

                          <!-- Schedule -->
                          <div style="padding-bottom: 10px;">
                                <table width="100%">
                                    <tr>
                                        <td style="font-size: 12px; text-transform: uppercase; color: #666; padding-bottom: 10px;">Service Date</td>
                                        <td style="text-align: right; font-weight: bold; color: #1A1E26; padding-bottom: 10px;">${dateStr}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 12px; text-transform: uppercase; color: #666; padding-bottom: 10px;">Pickup Time</td>
                                        <td style="text-align: right; font-weight: bold; color: #1A1E26; padding-bottom: 10px;">${pickupTime}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 12px; text-transform: uppercase; color: #666; padding-bottom: 10px;">Delivery Time</td>
                                        <td style="text-align: right; font-weight: bold; color: #1A1E26; padding-bottom: 10px;">Before 5:00 PM (Same Day)</td>
                                    </tr>
                                </table>
                          </div>

                          ${specialInstructions}

                          <!-- Total -->
                          <div style="border-top: 2px solid #ccc; margin-top: 20px; padding-top: 20px;">
                               <table width="100%">
                                   <tr>
                                       <td style="font-size: 14px; text-transform: uppercase; color: #666;">Total Paid</td>
                                       <td style="text-align: right; font-family: 'Times New Roman', serif; font-size: 28px; font-weight: bold; color: #1A1E26;">$${totalPrice.toFixed(2)} USD</td>
                                   </tr>
                               </table>
                          </div>

                      </div>
                      
                      <!-- Receipt Footer -->
                      <div style="background-color: #F4F1EB; padding: 15px; text-align: center; border-top: 1px dashed #ccc;">
                          <p style="margin: 0; font-size: 11px; color: #666;">Thank you for choosing Sweet Home Punta Cana Laundry Service</p>
                      </div>
                  </div>

                  <!-- What Happens Next -->
                  <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
                      <h3 style="margin: 0 0 20px 0; font-family: 'Times New Roman', serif; font-size: 20px; color: #1A1E26;">What Happens Next?</h3>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                              <td width="40" valign="top" style="padding-bottom: 20px;">
                                  <div style="width: 24px; height: 24px; background: #FFD700; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; color: #1A1E26;">1</div>
                              </td>
                              <td valign="top" style="padding-bottom: 20px; color: #555; font-size: 14px; line-height: 1.5;">Please leave your laundry bag outside your door or at the reception.</td>
                          </tr>
                          <tr>
                              <td width="40" valign="top" style="padding-bottom: 20px;">
                                  <div style="width: 24px; height: 24px; background: #FFD700; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; color: #1A1E26;">2</div>
                              </td>
                              <td valign="top" style="padding-bottom: 20px; color: #555; font-size: 14px; line-height: 1.5;">Our team will collect it shortly.</td>
                          </tr>
                          <tr>
                              <td width="40" valign="top">
                                  <div style="width: 24px; height: 24px; background: #FFD700; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; color: #1A1E26;">3</div>
                              </td>
                              <td valign="top" style="color: #555; font-size: 14px; line-height: 1.5;">Your fresh, clean, and folded clothes will be returned before 5:00 PM the same day.</td>
                          </tr>
                      </table>
                  </div>

                  <!-- Need Help -->
                  <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 30px;">
                        <h3 style="margin: 0 0 20px 0; font-family: 'Times New Roman', serif; font-size: 20px; color: #1A1E26;">Need Help?</h3>
                        
                        <table width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                                <td width="50%" align="center" style="padding-right: 5px;">
                                    <a href="https://wa.me/18095105465" style="display: block; text-decoration: none; border: 1px solid #ddd; padding: 12px; border-radius: 6px; color: #333; font-size: 14px; font-weight: bold;">
                                        <span style="font-size: 16px;">💬</span> WhatsApp
                                    </a>
                                </td>
                                <td width="50%" align="center" style="padding-left: 5px;">
                                     <a href="mailto:info@sweethomepuntacana.com" style="display: block; text-decoration: none; border: 1px solid #ddd; padding: 12px; border-radius: 6px; color: #333; font-size: 14px; font-weight: bold;">
                                        <span style="font-size: 16px;">✉️</span> Email
                                     </a>
                                </td>
                            </tr>
                        </table>
                  </div>

               </div>
               
               <div style="text-align: center; color: #999; font-size: 11px; margin-top: 30px;">
                  Sweet Home Punta Cana | Bávaro, Punta Cana
               </div>
             </div>`;
            }

            // Fallback
            return `
            <div class="container">
              <div class="room-header">
                <h1>🏝️ Sweet Home Punta Cana</h1>
                <p>Booking Confirmation</p>
              </div>
              <div class="room-content">
                <h2>Thank you, ${guestName}!</h2>
                <p>Your booking has been confirmed.</p>
                <div class="room-detail"><strong>Type:</strong> ${bookingType}</div>
                <div class="room-detail"><strong>Details:</strong><br/>${JSON.stringify(bookingDetails, null, 2)}</div>
                <div class="room-total">Total: $${totalPrice.toFixed(2)} USD</div>
              </div>
            </div>`;
        })()}
      </body>
    </html>
  `;

    try {
        await resend.emails.send({
            from: fromAddress,
            to: [guestEmail],
            bcc: [
                process.env.BOOKING_NOTIFICATION_EMAIL || 'info@sweethomepuntacana.com',
                'sweethomepc123@gmail.com'
            ],
            subject,
            html,
        });

        console.log(`✅ Booking confirmation sent to ${guestEmail}`);
        return { success: true, html };
    } catch (error) {
        console.error('❌ Failed to send booking email:', error);
        return { success: false, error, html };
    }
}
