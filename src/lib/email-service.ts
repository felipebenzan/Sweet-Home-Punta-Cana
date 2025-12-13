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

  // Normalize details: Standalone has nested 'details', Room+Transfer has flattened properties
  const details = bookingDetails.details || bookingDetails;

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
          .transfer-logo { display: block; margin: 0 auto 15px auto; max-width: 150px; }
          .transfer-booking-id { color: #D4AF37; font-family: 'Helvetica', 'Arial', sans-serif; font-size: 14px; letter-spacing: 1px; margin-top: 15px; font-weight: bold; text-transform: uppercase; }
          
          .pass-container { padding: 30px 20px; }
          .boarding-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #ccc; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
          
          .grid-row { display: table-row; }
          .grid-col { display: table-cell; width: 33.33%; padding: 30px; vertical-align: top; border-right: 1px dashed #ccc; box-sizing: border-box; }
          .grid-col:last-child { border-right: none; }
          
          .label { display: block; font-family: 'Helvetica', 'Arial', sans-serif; font-size: 10px; letter-spacing: 1px; color: #999; text-transform: uppercase; margin-bottom: 5px; margin-top: 20px; }
          .label:first-child { margin-top: 0; }
          
          .value { display: block; font-size: 16px; font-weight: bold; color: #1A1E26; line-height: 1.3; font-family: 'Times New Roman', serif; }
          .value-large { font-size: 22px; margin-bottom: 20px; }
          
          .qr-placeholder { background: #f0f0f0; border: 1px dashed #ccc; padding: 20px; text-align: center; color: #999; font-size: 10px; font-family: sans-serif; margin-top: 10px; }

          .transfer-footer { padding: 20px; text-align: center; font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #666; border-top: 1px dashed #ccc; margin-top: 20px; }

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
          }
        </style>
      </head>
      <body>
        ${bookingType === 'transfer' ? `
            <!-- Main Wrapper ensuring centered content -->
            <div style="background-color: #f4f4f4; padding: 20px; font-family: 'Helvetica', 'Arial', sans-serif;">
              
              <!-- Confirmation Message Wrapper -->
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
                            <!-- Bus Icon Placeholder using Emoji for email compatibility -->
                            <span style="font-size: 24px;">🚌</span>
                        </div>
                    </div>
                </div>

                <!-- Ticket Body (3 Columns) -->
                <div>
                   <!-- Mobile Fallback: Stack them. Desktop: Table Cell. Using a table for layout -->
                   <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <tr>
                        <!-- Column 1: Departure / Arrival -->
                        <td width="33.33%" valign="top" style="padding: 24px; border-right: 1px dashed #ccc; font-family: sans-serif;" class="stack-column">
                            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: bold; margin-bottom: 15px;">Departure / Arrival</div>
                            
                            <!-- From -->
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">From</div>
                                <div style="font-size: 14px; font-weight: bold; color: #1A1E26; margin-bottom: 2px;">
                                    ${details.direction === 'arrive' ? 'Punta Cana Intl. Airport' : 'Sweet Home Punta Cana'}
                                </div>
                                <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #666;">
                                    ${details.direction === 'arrive' ? 'PUJ' : 'SHPC'}
                                </div>
                            </div>
                            
                            <!-- Divider with Bus -->
                            <div style="position: relative; height: 1px; background-color: #ccc; margin: 15px 0;">
                                <div style="position: absolute; top: -10px; left: 50%; margin-left: -10px; background-color: #FAF8F5; padding: 0 5px;">🚌</div>
                            </div>

                            <!-- To -->
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">To</div>
                                <div style="font-size: 14px; font-weight: bold; color: #1A1E26; margin-bottom: 2px;">
                                     ${details.direction === 'arrive' ? 'Sweet Home Punta Cana' : 'Punta Cana Intl. Airport'}
                                </div>
                                <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #666;">
                                    ${details.direction === 'arrive' ? 'SHPC' : 'PUJ'}
                                </div>
                            </div>

                            <!-- Details -->
                            <div style="border-top: 1px dashed #ccc; padding-top: 15px;">
                                <table width="100%">
                                    <tr>
                                        <td style="font-size: 10px; text-transform: uppercase; color: #999;">Flight</td>
                                        <td style="font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; text-align: right; color: #1A1E26;">
                                            ${details.direction === 'arrive'
        ? (details.arrivalFlight || details.flightNumber || 'N/A')
        : (details.departureFlight || details.flightNumber || 'N/A')}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 10px; text-transform: uppercase; color: #999; padding-top: 5px;">Date</td>
                                        <td style="font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; text-align: right; color: #1A1E26; padding-top: 5px;">
                                            ${details.arrivalDate || details.departureDate || details.date || 'N/A'}
                                        </td>
                                    </tr>
                                    ${details.direction === 'depart' && details.departureTime ? `
                                    <tr>
                                        <td style="font-size: 10px; text-transform: uppercase; color: #999; padding-top: 5px;">Time</td>
                                        <td style="font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; text-align: right; color: #1A1E26; padding-top: 5px;">
                                            ${details.departureTime}
                                        </td>
                                    </tr>` : ''}
                                </table>
                            </div>
                        </td>

                        <!-- Column 2: Passenger / Booking Info -->
                        <td width="33.33%" valign="top" style="padding: 24px; border-right: 1px dashed #ccc; font-family: sans-serif;" class="stack-column">
                            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: bold; margin-bottom: 15px;">Passenger / Info</div>
                            
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">Passenger Name</div>
                                <div style="font-family: 'Times New Roman', serif; font-size: 18px; font-weight: bold; color: #1A1E26; text-transform: uppercase;">
                                    ${guestName}
                                </div>
                            </div>

                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">Service Type</div>
                                <div style="font-size: 14px; font-weight: bold; color: #1A1E26;">
                                    ${details.direction === 'arrive' ? 'Arrival' : (details.direction === 'depart' ? 'Departure' : 'Round Trip')}
                                </div>
                            </div>

                             <div style="margin-bottom: 15px;">
                                <div style="font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px;">Guests</div>
                                <div style="font-size: 14px; font-weight: bold; color: #1A1E26;">
                                     ${(details.pax || details.guests || '1').toString().replace(/[^0-9]/g, '') || '1'} 
                                     <span style="font-size: 12px; font-weight: normal; color: #666;">(Max 2)</span>
                                </div>
                            </div>

                            <!-- Note Box -->
                            <div style="background-color: rgba(212, 175, 55, 0.1); border-left: 2px solid #D4AF37; padding: 10px; margin-top: 20px;">
                                <p style="margin: 0; font-size: 11px; color: #1A1E26; line-height: 1.4;">
                                    <strong>Note:</strong> Your driver will be waiting with a sign bearing your name.
                                </p>
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
                                <div style="font-family: 'Times New Roman', serif; font-size: 28px; font-weight: bold; color: #1A1E26;">
                                    $${totalPrice.toFixed(2)} USD
                                </div>
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
          `}
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
