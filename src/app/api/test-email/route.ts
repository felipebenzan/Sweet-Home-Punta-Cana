import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123_build_placeholder');

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Send test email
    const result = await resend.emails.send({
      from: 'Sweet Home Punta Cana <bookings@sweethomepc.com>',
      to: [email],
      bcc: [
        'info@sweethomepuntacana.com',
        'sweethomepc123@gmail.com'
      ],
      subject: 'Test Email from Sweet Home Punta Cana',
      html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
                      .content { padding: 20px; background: #f9f9f9; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>🏝️ Sweet Home Punta Cana</h1>
                        <p>Email Test</p>
                      </div>
                      <div class="content">
                        <h2>Email System Working!</h2>
                        <p>If you're reading this, your email configuration is working correctly.</p>
                        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
                        <p><strong>API Key Status:</strong> ${process.env.RESEND_API_KEY ? 'Configured ✅' : 'Missing ❌'}</p>
                        <p><strong>BCC Recipients:</strong> sweethomepc123@gmail.com, info@sweethomepuntacana.com</p>
                      </div>
                    </div>
                  </body>
                </html>
            `,
    });

    console.log('✅ Test email sent:', result);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: result.data?.id,
      keyUsed: (process.env.RESEND_API_KEY || '').substring(0, 5) + '...',
      details: result,
    });

  } catch (error: any) {
    console.error('❌ Test email failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send test email',
        details: error
      },
      { status: 500 }
    );
  }
}
