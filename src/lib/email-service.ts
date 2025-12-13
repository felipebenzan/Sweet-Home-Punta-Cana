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

  const subject = `Booking Confirmation - Sweet Home Punta Cana`;

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
          
          /* Type Specific Styles */
          .room-header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .room-content { padding: 20px; background: #f9f9f9; }
          .room-detail { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3498db; }
          .room-total { font-size: 24px; font-weight: bold; color: #2c3e50; margin: 20px 0; }

          /* AIRPORT TRANSFER STYLES (Boarding Pass) */
          .transfer-body { background-color: #F9F8F6; color: #1A1E26; font-family: 'Times New Roman', serif; }
          .transfer-header { background-color: #1A1E26; padding: 30px 20px; text-align: center; color: #ffffff; }
          .transfer-logo { max-width: 150px; height: auto; margin-bottom: 10px; }
          .transfer-booking-id { color: #D4AF37; font-family: 'Helvetica', 'Arial', sans-serif; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; margin-top: 5px; }
          
          .transfer-content { padding: 0; }
          .pass-container { background-color: #F9F8F6; padding: 20px; }
          
          /* Grid System */
          .boarding-grid { display: table; width: 100%; border-collapse: collapse; margin-top: 20px; background: #fff; border: 1px solid #e0e0e0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .grid-row { display: table-row; }
          .grid-col { display: table-cell; padding: 20px; vertical-align: top; border-right: 1px dashed #ccc; width: 33.33%; }
          .grid-col:last-child { border-right: none; }
          
          .label { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 5px; display: block; }
          .value { font-family: 'Times New Roman', serif; font-size: 18px; font-weight: bold; color: #1A1E26; line-height: 1.2; display: block; margin-bottom: 15px; }
          .value-large { font-size: 22px; }
          .flight-route { font-family: 'Helvetica', 'Arial', sans-serif; font-weight: bold; font-size: 14px; margin-bottom: 15px; display: flex; align-items: center; }
          
          .qr-placeholder { background: #f0f0f0; padding: 10px; text-align: center; font-family: monospace; font-size: 10px; margin-top: 10px; border: 1px solid #ddd; }
          
          .transfer-footer { padding: 20px; text-align: center; font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #666; border-top: 1px dashed #ccc; margin-top: 20px; }

          /* Mobile Responsive */
          @media only screen and (max-width: 480px) {
            .boarding-grid, .grid-row, .grid-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .grid-col { border-right: none !important; border-bottom: 1px dashed #ccc !important; padding: 20px !important; }
            .grid-col:last-child { border-bottom: none !important; }
            .value { font-size: 20px !important; }
            .value-large { font-size: 24px !important; }
          }
        </style>
      </head>
      <body>
        ${bookingType === 'transfer' ? `
            <div class="container transfer-body">
              <div class="transfer-header">
                <!-- Using absolute path for logo, assuming email client can access it or use a public URL if available. 
                     For now using text/emoji if image not hosted publicly, but trying to use the image reference as requested.
                     Ideally logos should be on a CDN. modifying to use local reference might not work in email clients without public hosting. 
                     I will use a placeholder or text if image is not guaranteed to be public. 
                     However, I will use a reliable public URL if I knew one, but I'll stick to a text fallback for safety or standard img src. -->
                 <div style="font-family: 'Times New Roman', serif; font-size: 24px; letter-spacing: 2px;">SWEET HOME</div>
                 <div style="font-size: 12px; letter-spacing: 3px; margin-top: 5px; opacity: 0.8;">AIRPORT TRANSFER</div>
                 <div class="transfer-booking-id">BOOKING ID: ${confirmationId}</div>
              </div>

              <div class="pass-container">
                  <div class="boarding-grid">
                    <!-- Row 1 -->
                    <div class="grid-row">
                        <!-- Column 1: Flight / Route -->
                        <div class="grid-col">
                            <span class="label">FROM</span>
                            <span class="value">
                                ${bookingDetails.direction === 'arrive' ? 'Punta Cana Intl. Airport (PUJ)' : 'Sweet Home Punta Cana'}
                            </span>
                            
                            <span class="label">TO</span>
                            <span class="value">
                                ${bookingDetails.direction === 'arrive' ? 'Sweet Home Punta Cana' : 'Punta Cana Intl. Airport (PUJ)'}
                            </span>

                            <span class="label">FLIGHT</span>
                            <span class="value">
                                ${bookingDetails.direction === 'arrive'
        ? (bookingDetails.arrivalFlight || bookingDetails.flightNumber || 'N/A')
        : (bookingDetails.departureFlight || bookingDetails.flightNumber || 'N/A')}
                            </span>
                            
                            <span class="label">DATE</span>
                            <span class="value">
                                ${bookingDetails.arrivalDate || bookingDetails.departureDate || bookingDetails.date || 'N/A'}
                            </span>
                        </div>

                        <!-- Column 2: Passenger Info -->
                        <div class="grid-col">
                            <span class="label">PASSENGER NAME</span>
                            <span class="value value-large">${guestName}</span>

                            <span class="label">GUESTS</span>
                            <span class="value">
                                ${(bookingDetails.pax || bookingDetails.guests || '1').toString().toLowerCase().includes('guest') || (bookingDetails.pax || bookingDetails.guests || '1').toString().toLowerCase().includes('person')
        ? (bookingDetails.pax || bookingDetails.guests || '1')
        : (bookingDetails.pax || bookingDetails.guests || '1') + ' Person(s)'}
                            </span>

                            <span class="label">STATUS</span>
                            <span class="value" style="color: #27ae60;">CONFIRMED</span>
                        </div>

                        <!-- Column 3: Price & QR -->
                        <div class="grid-col" style="text-align: center;">
                             <span class="label">TOTAL FARE</span>
                             <span class="value value-large">$${totalPrice.toFixed(2)} USD</span>
                             
                             <div style="margin-top: 20px;">
                                <div style="background: #1A1E26; color: #D4AF37; padding: 10px; display: inline-block; font-family: sans-serif; font-size: 12px; letter-spacing: 1px;">
                                    BOARDING PASS
                                </div>
                             </div>
                             
                             <div class="qr-placeholder">
                                [SCAN FOR DETAILS]<br/>
                                ${confirmationId}
                             </div>
                        </div>
                    </div>
                  </div>

                  <div class="transfer-footer">
                    <p>Please present this digital confirmation to your driver upon arrival.</p>
                    <p>Need help? WhatsApp: <a href="https://wa.me/18095105465" style="color: #D4AF37; text-decoration: none;">+1 (809) 510-5465</a></p>
                    <p>Sweet Home Punta Cana</p>
                  </div>
              </div>
            </div>
          ` : `
            <div class="container">
              <div class="room-header">
                <h1>🏝️ Sweet Home Punta Cana</h1>
                <p>Booking Confirmation</p>
              </div>
              
              <div class="room-content">
                <h2>Thank you, ${guestName}!</h2>
                <p>Your booking has been confirmed. We're excited to welcome you!</p>
                
                <div class="room-detail">
                  <strong>Confirmation ID:</strong> ${confirmationId}
                </div>
                
                <div class="room-detail">
                  <strong>Booking Type:</strong> ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}
                </div>
                
                <div class="room-detail">
                  <strong>Details:</strong><br/>
                  ${JSON.stringify(bookingDetails, null, 2).replace(/\n/g, '<br/>')}
                </div>
                
                <div class="room-total">
                  Total: $${totalPrice.toFixed(2)} USD
                </div>
                
                <p><strong>What's next?</strong></p>
                <ul>
                  <li>Save this confirmation email</li>
                  <li>We'll contact you 24-48 hours before your arrival</li>
                  <li>For questions, reply to this email or WhatsApp us: +1 (809) 510-5465</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>Sweet Home Punta Cana | Bávaro, Punta Cana, Dominican Republic</p>
                <p>📧 info@sweethomepuntacana.com | 📱 +1 (809) 510-5465</p>
              </div>
            </div>
          `
    }
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
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send booking email:', error);
    return { success: false, error };
  }
}
