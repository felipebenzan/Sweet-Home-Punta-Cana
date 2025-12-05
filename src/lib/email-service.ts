import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .detail { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3498db; }
          .total { font-size: 24px; font-weight: bold; color: #2c3e50; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏝️ Sweet Home Punta Cana</h1>
            <p>Booking Confirmation</p>
          </div>
          
          <div class="content">
            <h2>Thank you, ${guestName}!</h2>
            <p>Your booking has been confirmed. We're excited to welcome you!</p>
            
            <div class="detail">
              <strong>Confirmation ID:</strong> ${confirmationId}
            </div>
            
            <div class="detail">
              <strong>Booking Type:</strong> ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}
            </div>
            
            <div class="detail">
              <strong>Details:</strong><br/>
              ${JSON.stringify(bookingDetails, null, 2).replace(/\n/g, '<br/>')}
            </div>
            
            <div class="total">
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
