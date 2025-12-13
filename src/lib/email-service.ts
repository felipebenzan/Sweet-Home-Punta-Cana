import { Resend } from 'resend';

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
          @media only screen and (max-width: 480px) {
            .boarding-grid, .grid-row, .grid-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .grid-col { border-right: none !important; border-bottom: 1px dashed #ccc !important; padding: 20px !important; }
            .grid-col:last-child { border-bottom: none !important; }
            .value { font-size: 20px !important; }
            .value-large { font-size: 24px !important; }

            /* New responsive styles for the table layout */
            .stack-column {
                display: block !important;
                width: 100% !important;
                border-right: none !important;
                border-bottom: 1px dashed #ccc !important;
                padding-bottom: 20px !important;
            }
            .stack-column:last-child {
                border-bottom: none !important;
            }
            
            /* Clean Ticket Mobile Overrides */
            .ticket-column {
                display: block !important;
                width: 100% !important;
                padding: 10px 0 !important;
            }
            .ticket-val {
                font-size: 16px !important;
            }
            .ticket-header-title {
                font-size: 24px !important;
            }
          }
        </style>
      </head>
      <body>
        ${(() => {
         if (normalizedBookingType === 'transfer') {
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

                <!-- Ticket Body (3 Columns) -->
                <div>
                   <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <tr>
                        <!-- Column 1: Departure / Arrival -->
                        <td width="33.33%" valign="top" style="padding: 24px; border-right: 1px dashed #ccc; font-family: sans-serif;" class="stack-column">
                            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: bold; margin-bottom: 15px;">Departure / Arrival</div>
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">From</div>
                                <div style="font-size: 14px; font-weight: bold; color: #1A1E26; margin-bottom: 2px;">${details.direction === 'arrive' ? 'Punta Cana Intl. Airport' : 'Sweet Home Punta Cana'}</div>
                                <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #666;">${details.direction === 'arrive' ? 'PUJ' : 'SHPC'}</div>
                            </div>
                            <div style="position: relative; height: 1px; background-color: #ccc; margin: 15px 0;">
                                <div style="position: absolute; top: -10px; left: 50%; margin-left: -10px; background-color: #FAF8F5; padding: 0 5px;">🚌</div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">To</div>
                                <div style="font-size: 14px; font-weight: bold; color: #1A1E26; margin-bottom: 2px;">${details.direction === 'arrive' ? 'Sweet Home Punta Cana' : 'Punta Cana Intl. Airport'}</div>
                                <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #666;">${details.direction === 'arrive' ? 'SHPC' : 'PUJ'}</div>
                            </div>
                            <div style="border-top: 1px dashed #ccc; padding-top: 15px;">
                                <table width="100%">
                                    <tr>
                                        <td style="font-size: 10px; text-transform: uppercase; color: #999;">Flight</td>
                                        <td style="font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; text-align: right; color: #1A1E26;">${details.direction === 'arrive' ? (details.arrivalFlight || details.flightNumber || 'N/A') : (details.departureFlight || details.flightNumber || 'N/A')}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 10px; text-transform: uppercase; color: #999; padding-top: 5px;">Date</td>
                                        <td style="font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; text-align: right; color: #1A1E26; padding-top: 5px;">${details.arrivalDate || details.departureDate || details.date || 'N/A'}</td>
                                    </tr>
                                    ${details.direction === 'depart' && details.departureTime ? `
                                    <tr>
                                        <td style="font-size: 10px; text-transform: uppercase; color: #999; padding-top: 5px;">Time</td>
                                        <td style="font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; text-align: right; color: #1A1E26; padding-top: 5px;">${details.departureTime}</td>
                                    </tr>` : ''}
                                </table>
                            </div>
                        </td>

                        <!-- Column 2: Passenger / Booking Info -->
                        <td width="33.33%" valign="top" style="padding: 24px; border-right: 1px dashed #ccc; font-family: sans-serif;" class="stack-column">
                            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: bold; margin-bottom: 15px;">Passenger / Info</div>
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">Passenger Name</div>
                                <div style="font-family: 'Times New Roman', serif; font-size: 18px; font-weight: bold; color: #1A1E26; text-transform: uppercase;">${guestName}</div>
                            </div>
                             <div style="margin-bottom: 15px;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">Service Type</div>
                                <div style="font-size: 14px; font-weight: bold; color: #1A1E26;">${details.direction === 'arrive' ? 'Arrival' : (details.direction === 'depart' ? 'Departure' : 'Round Trip')}</div>
                            </div>
                             <div style="margin-bottom: 15px;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">Guests</div>
                                <div style="font-size: 14px; font-weight: bold; color: #1A1E26;">
                                     ${(details.pax || details.guests || '1').toString().replace(/[^0-9]/g, '') || '1'} 
                                     <span style="font-size: 12px; font-weight: normal; color: #666;">(Max 2)</span>
                                </div>
                            </div>
                            <div style="background-color: rgba(212, 175, 55, 0.1); border-left: 2px solid #D4AF37; padding: 10px; margin-top: 20px;">
                                <p style="margin: 0; font-size: 11px; color: #1A1E26; line-height: 1.4;"><strong>Note:</strong> Your driver will be waiting with a sign bearing your name.</p>
                            </div>
                        </td>

                        <!-- Column 3: Price / Code -->
                        <td width="33.33%" valign="top" style="padding: 24px; font-family: sans-serif;" class="stack-column">
                            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: bold; margin-bottom: 15px;">Price / Code</div>
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="background: white; border: 2px solid #ccc; padding: 10px; display: inline-block; border-radius: 4px;">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${confirmationId}" alt="QR Code" width="100" height="100" style="display: block;" />
                                </div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 5px;">Total</div>
                                <div style="font-family: 'Times New Roman', serif; font-size: 28px; font-weight: bold; color: #1A1E26;">$${totalPrice.toFixed(2)} USD</div>
                            </div>
                        </td>
                      </tr>
                   </table>
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
                <div style="position: relative; height: 250px; background-image: url('https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop'); background-size: cover; background-position: center;">
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
                                     <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${confirmationId}-${roomName}" alt="QR Code" width="100" height="100" />
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
                         <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                               <td width="50%" style="padding: 10px; border-right: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;">
                                  <div style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Check-In</div>
                                  <div style="font-size: 15px; font-weight: bold; color: #333;">${checkIn}</div>
                                  <div style="font-size: 12px; color: #666;">3:00 PM</div>
                               </td>
                               <td width="50%" style="padding: 10px; padding-left: 20px; border-bottom: 1px solid #f0f0f0;">
                                  <div style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Check-Out</div>
                                  <div style="font-size: 15px; font-weight: bold; color: #333;">${checkOut}</div>
                                  <div style="font-size: 12px; color: #666;">11:00 AM</div>
                               </td>
                            </tr>
                            <tr>
                               <td width="50%" style="padding: 10px; border-right: 1px solid #f0f0f0;">
                                  <div style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Room Type</div>
                                  <div style="font-size: 15px; color: #333;">${roomName}</div>
                               </td>
                               <td width="50%" style="padding: 10px; padding-left: 20px;">
                                  <div style="font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Guests</div>
                                  <div style="font-size: 15px; color: #333;">${guests} Guest${guests > 1 ? 's' : ''}</div>
                               </td>
                            </tr>
                         </table>
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
            const excursionTitle = details.mainExcursion?.title || 'Excursion Adventure';
            const excursionDate = details.mainExcursion?.bookingDate ? formatFullDate(details.mainExcursion.bookingDate) : (bookingDetails.date ? formatFullDate(bookingDetails.date) : 'Date to be confirmed');
            const pax = details.pax || bookingDetails.pax || '1 Adult';

            return `
             <div style="background-color: #F9F7F2; padding: 40px 20px; font-family: 'Helvetica', 'Arial', sans-serif;">
               <div style="max-width: 600px; margin: 0 auto;">
                 <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; background: white; padding: 15px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-bottom: 20px;">
                        <img src="https://img.icons8.com/ios-filled/50/228B22/checkmark--v1.png" alt="Success" width="32" height="32" />
                    </div>
                    <h1 style="font-family: 'Times New Roman', serif; font-size: 32px; color: #1A1E26; margin: 0 0 10px 0;">Adventure Locked In!</h1>
                    <p style="color: #666; margin: 0;">Pack your sunscreen, ${guestName}!</p>
                    <div style="margin-top: 10px; font-family: monospace; color: #999; font-size: 14px;">
                        Booking ID: ${confirmationId.substring(0, 8).toUpperCase()}
                    </div>
                 </div>
                 <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 25px;">
                    <div style="padding: 25px;">
                       <h3 style="margin: 0 0 15px 0; font-family: 'Times New Roman', serif; text-align: center; font-size: 20px; color: #1A1E26;">Your Booked Excursion</h3>
                       <div style="text-align: center; font-size: 22px; font-weight: bold; color: #333; margin-bottom: 15px;">${excursionTitle}</div>
                       <div style="background: #F9F7F2; padding: 15px; border-radius: 8px; font-size: 14px; color: #555;">
                          <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                             <div style="display: flex; align-items: center; gap: 5px;">
                                <img src="https://img.icons8.com/ios-filled/50/000000/calendar.png" width="16" height="16" style="opacity: 0.6;">
                                ${excursionDate}
                             </div>
                             <div style="display: flex; align-items: center; gap: 5px;">
                                <img src="https://img.icons8.com/ios-filled/50/000000/user-group-man-man.png" width="16" height="16" style="opacity: 0.6;">
                                ${pax}
                             </div>
                          </div>
                       </div>
                    </div>
                    <div style="border-top: 1px dashed #eee; padding: 25px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1A1E26;">Payment Summary</h3>
                        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #333;">
                            <span>Total Paid (USD)</span>
                            <span style="font-family: monospace;">$${totalPrice.toFixed(2)}</span>
                        </div>
                        <div style="margin-top: 10px; font-size: 12px; color: #228B22;">
                            ✔ All taxes & fees included.
                        </div>
                    </div>
                 </div>
                 <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                    <p>Need help? WhatsApp: <a href="https://wa.me/18095105465" style="color: #D4AF37; text-decoration: none;">+1 (809) 510-5465</a></p>
                    <p>Sweet Home Punta Cana</p>
                 </div>
               </div>
             </div>`;
         }

         if (normalizedBookingType === 'laundry') {
            // Laundry Service - Clean Service Ticket Design
            const pickupTime = details.pickupTime || '08:00 AM';
            const bags = details.bags || 1;
            const roomNumber = details.roomNumber || 'N/A';
            const dateStr = bookingDetails.date ? formatFullDate(bookingDetails.date) : 'N/A';

            return `
             <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: 'Helvetica', 'Arial', sans-serif;">
               <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <div style="background-color: #FFFFFF; padding: 40px 20px 20px; text-align: center; border-bottom: 1px solid #eee;">
                     <div style="font-size: 24px; margin-bottom: 10px;">🏝️</div>
                     <h2 style="font-family: 'Times New Roman', serif; font-size: 20px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">Sweet Home Punta Cana</h2>
                     <h1 style="color: #2C3E50; font-size: 28px; margin: 0; font-family: 'Helvetica', sans-serif; font-weight: bold;">Laundry Request Confirmed</h1>
                     <div style="margin-top: 15px;">
                        <span style="background: #f0f0f0; color: #666; font-size: 12px; padding: 5px 10px; border-radius: 20px; font-family: monospace;">ID: ${confirmationId.substring(0, 12)}</span>
                     </div>
                  </div>

                  <!-- Summary Grid -->
                  <div style="padding: 30px;">
                     <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <!-- Customer Details -->
                            <td width="50%" valign="top" class="ticket-column" style="padding-bottom: 20px;">
                                <div style="font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 5px; font-weight: bold;">Customer</div>
                                <div class="ticket-val" style="font-size: 18px; color: #333; font-weight: bold;">${guestName}</div>
                                <div style="font-size: 14px; color: #666; margin-top: 2px;">${guestEmail}</div>
                                <div style="font-size: 14px; color: #666; margin-top: 2px;">Room: ${roomNumber}</div>
                            </td>
                            <!-- Service Type -->
                            <td width="50%" valign="top" class="ticket-column" style="padding-bottom: 20px;">
                                <div style="font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 5px; font-weight: bold;">Service Type</div>
                                <div class="ticket-val" style="font-size: 18px; color: #333; font-weight: bold;">Laundry Service</div>
                                <div style="font-size: 14px; color: #666; margin-top: 2px;">${bags} Bag(s) • Wash & Fold</div>
                            </td>
                        </tr>
                        <tr>
                             <!-- Price -->
                             <td width="100%" colspan="2" style="border-top: 1px dashed #ddd; padding-top: 20px; text-align: right;">
                                <div style="font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 5px; font-weight: bold;">Total Price</div>
                                <div style="font-size: 32px; color: #2C3E50; font-weight: bold;">$${totalPrice.toFixed(2)} USD</div>
                             </td>
                        </tr>
                     </table>
                  </div>

                  <!-- Call to Action -->
                  <div style="background-color: #eef2f5; padding: 25px; text-align: center;">
                      <h3 style="margin: 0 0 10px 0; color: #2C3E50; font-size: 18px;">What's Next?</h3>
                      <p style="margin: 0; color: #666; font-size: 15px;">We will contact you shortly to coordinate the pickup.</p>
                  </div>

                  <!-- Footer -->
                  <div style="background-color: #2C3E50; padding: 20px; text-align: center; color: rgba(255,255,255,0.7);">
                     <p style="margin: 0; font-size: 12px;">Sweet Home Punta Cana | Laundry Service Team</p>
                     <p style="margin: 5px 0 0 0; font-size: 12px;">Questions? +1 (809) 510-5465</p>
                  </div>

               </div>
               <div style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">
                  Sent with ♥ to ${guestEmail}
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
