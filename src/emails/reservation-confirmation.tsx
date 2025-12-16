
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  render,
  Link,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";
import { BookingDetails, Room } from "@/lib/types";
import { format, parseISO, differenceInDays } from "date-fns";

interface ReservationConfirmationEmailProps {
  bookingDetails: BookingDetails;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";


export default function ReservationConfirmationEmail({
  bookingDetails,
}: ReservationConfirmationEmailProps) {

  const { rooms, dates, guests, totalPrice, guestInfo, confirmationId, airportPickup } = bookingDetails;
  // If rooms is empty or undefined, fallback for safety (though unlikely if api is correct)
  const safeRooms = (rooms && rooms.length > 0) ? rooms : [{
    name: 'Standard Room', id: 'RM1', capacity: 2, price: totalPrice, image: 'https://sweet-home-punta-cana.vercel.app/home-hero.png', slug: 'standard'
  }];

  const shortId = confirmationId ? confirmationId.substring(0, 7).toUpperCase() : 'CONFIRM';
  const previewText = `Pack your bags ${guestInfo?.firstName || 'Guest'}, your booking is confirmed!`;

  const fromDate = parseISO(dates.from);
  const toDate = parseISO(dates.to);
  const nights = differenceInDays(toDate, fromDate) || 1;

  // For QR code, if multiple rooms, just use the confirmationId plus GROUP
  const qrValue = `${shortId}-${safeRooms.length > 1 ? 'GROUP' : safeRooms[0].slug}`;

  return (
    <Html>
      <Head>
        <style>
          {`
            @media only screen and (max-width: 600px) {
              .mobile-stack {
                display: block !important;
                width: 100% !important;
              }
              .mobile-center {
                text-align: center !important;
              }
              .mobile-hide {
                display: none !important;
              }
            }
          `}
        </style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Image/Logo with Background */}
          <Section
            style={{
              ...headerSection,
              backgroundImage: "url('https://sweet-home-punta-cana.vercel.app/home-hero.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              padding: '0',
              textAlign: 'center'
            }}
          >
            <Section style={{ padding: '40px 20px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '12px 12px 0 0' }}>
              <Img
                src="https://sweet-home-punta-cana.vercel.app/sweet-home-logo-2.png"
                width="100"
                alt="Sweet Home Punta Cana"
                style={{ margin: '0 auto 24px auto', borderRadius: '50%', backgroundColor: 'white', padding: '12px', display: 'block' }}
              />
              <Text style={{ ...headerTitle, color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)', marginBottom: '16px' }}>
                Pack your bags {guestInfo?.firstName}, your booking is confirmed!
              </Text>
              <Text style={{ ...headerSubtitle, color: 'rgba(255,255,255,0.95)', textShadow: '0 1px 2px rgba(0,0,0,0.3)', maxWidth: '500px', margin: '0 auto' }}>
                We are thrilled to confirm your reservation at our beautiful Punta Cana guest house!
              </Text>
            </Section>
          </Section>

          <Section style={contentSection}>

            {/* Reservation Details (Guest Info & ID) */}
            <Section style={card}>
              <Section style={{ ...cardHeader, backgroundColor: '#FEFCE8', borderBottom: '1px solid #FEF08A' }}>
                <Text style={{ ...cardTitle, fontFamily: '"Playfair Display", serif', fontSize: '20px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', fontSize: '24px' }}>✅</span> Reservation Details
                </Text>
              </Section>
              <Section style={cardContent}>
                <Row>
                  <Column className="mobile-stack" style={{ verticalAlign: 'top', paddingRight: '16px' }}>

                    {/* ID */}
                    <Section style={{ marginBottom: '20px' }}>
                      <Text style={label}>Reservation ID</Text>
                      <Text style={{ ...valueLarge, fontSize: '32px' }}>{shortId}</Text>
                    </Section>

                    {/* Guest & Email Grid */}
                    <Row style={{ marginBottom: '20px' }}>
                      <Column className="mobile-stack" style={{ paddingRight: '12px', paddingBottom: '12px', width: '50%', verticalAlign: 'top' }}>
                        <Text style={label}>Guest Name</Text>
                        <Text style={{ ...valueMedium, fontWeight: '500' }}>{guestInfo?.firstName} {guestInfo?.lastName}</Text>
                      </Column>
                      <Column className="mobile-stack" style={{ paddingBottom: '12px', width: '50%', verticalAlign: 'top' }}>
                        <Text style={label}>Confirmation Sent To</Text>
                        <Text style={valueMedium}>{guestInfo?.email}</Text>
                        {guestInfo?.phone && <Text style={{ ...smallText, marginTop: '4px' }}>{guestInfo.phone}</Text>}
                      </Column>
                    </Row>

                    {/* Guest House */}
                    <Section>
                      <Text style={label}>Guest House</Text>
                      <Text style={valueMedium}>Sweet Home Punta Cana</Text>
                    </Section>
                  </Column>

                  {/* QR Code Column (Right) */}
                  <Column className="mobile-stack" style={{ width: '150px', verticalAlign: 'top', paddingLeft: '8px' }}>
                    <Section style={{ backgroundColor: '#FAF7F3', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid #E5E5E5' }}>
                      <Img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrValue}`}
                        alt="QR Code"
                        width="100"
                        height="100"
                        style={{ margin: '0 auto', display: 'block', backgroundColor: 'white', padding: '6px', borderRadius: '8px' }}
                      />
                      <Text style={{ ...smallText, textAlign: 'center', marginTop: '10px', lineHeight: '1.3' }}>
                        📌 Keep this ID and QR Code handy for quick check-in!
                      </Text>
                    </Section>
                  </Column>
                </Row>
              </Section>
            </Section>

            {/* Your Stay & Room */}
            <Section style={card}>
              <Section style={cardHeader}>
                <Text style={cardTitle}>📅 Your Stay & Room{safeRooms.length > 1 ? 's' : ''}</Text>
              </Section>
              <Section style={cardContent}>
                {/* Row 1: Dates & Guests (Common) */}
                <Row style={{ marginBottom: '24px', borderBottom: '1px dashed #E5E7EB', paddingBottom: '16px' }}>
                  <Column className="mobile-stack" style={{ paddingRight: '16px', paddingBottom: '12px', width: '33%', verticalAlign: 'top' }}>
                    <Text style={label}>🗓 Dates</Text>
                    <Text style={valueMedium}>
                      {dates?.from && dates?.to
                        ? `${format(parseISO(dates.from), "MMM dd")} – ${format(parseISO(dates.to), "MMM dd, yyyy")}`
                        : 'Dates Pending'}
                    </Text>
                  </Column>
                  <Column className="mobile-stack" style={{ paddingRight: '16px', paddingBottom: '12px', width: '33%', verticalAlign: 'top' }}>
                    <Text style={label}>🕒 Check-in</Text>
                    <Text style={valueMedium}>3:00 PM</Text>
                  </Column>
                  <Column className="mobile-stack" style={{ paddingBottom: '12px', width: '33%', verticalAlign: 'top' }}>
                    <Text style={label}>🕚 Check-out</Text>
                    <Text style={valueMedium}>11:00 AM</Text>
                  </Column>
                </Row>

                {/* Rooms Loop */}
                {safeRooms.map((roomItem, index) => {
                  const isLast = index === safeRooms.length - 1;
                  const itemRate = roomItem.price / nights;

                  return (
                    <div key={index} style={{ marginBottom: isLast ? '0' : '24px', paddingBottom: isLast ? '0' : '24px', borderBottom: isLast ? 'none' : '1px solid #F3F4F6' }}>
                      <Row>
                        {/* Image */}
                        <Column style={{ width: '100px', verticalAlign: 'top', paddingRight: '16px' }}>
                          <Img
                            src={roomItem.image}
                            width="100"
                            height="100"
                            style={{ borderRadius: '8px', objectFit: 'cover', height: '80px', width: '100px', backgroundColor: '#eee' }}
                            alt={roomItem.name}
                          />
                        </Column>
                        {/* Details */}
                        <Column style={{ verticalAlign: 'top' }}>
                          <Text style={{ ...valueMedium, fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                            {roomItem.name}
                          </Text>
                          <Text style={{ ...smallText, marginBottom: '8px' }}>
                            Ref: {roomItem.id?.substring(0, 5).toUpperCase() || 'RES'} <br />
                            Occupancy: {roomItem.capacity || 2} Guests
                          </Text>
                          <Row>
                            <Column>
                              <Text style={{ ...smallText, color: '#9CA3AF' }}>${itemRate.toFixed(2)} x {nights} nights</Text>
                            </Column>
                            <Column align="right">
                              <Text style={{ ...valueMedium, fontWeight: 'bold' }}>${roomItem.price.toFixed(2)}</Text>
                            </Column>
                          </Row>
                        </Column>
                      </Row>
                    </div>
                  );
                })}


              </Section>
            </Section>

            {/* Airport Transfer Section (Conditional) */}
            {bookingDetails.airportPickup && (
              <Section style={card}>
                <Section style={{ ...cardHeader, backgroundColor: '#EFF6FF', borderBottom: '1px solid #DBEAFE' }}>
                  <Row>
                    <Column><Text style={{ ...cardTitle, color: '#1E3A8A' }}>✈️ Airport Transfer (Confirmed)</Text></Column>
                    <Column align="right" style={{ width: '50px' }}>
                      <Img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=TRANSFER-${shortId}`} width="40" height="40" alt="QR" style={{ backgroundColor: 'white', padding: '2px', borderRadius: '4px' }} />
                    </Column>
                  </Row>
                  <Text style={{ ...smallText, color: '#1E40AF', marginTop: '4px' }}>
                    Seamless transfer arranged.
                  </Text>
                </Section>
                <Section style={cardContent}>

                  {airportPickup?.airline && (
                    <Row style={{ marginBottom: '16px' }}>
                      <Column className="mobile-stack" style={{ paddingRight: '16px', paddingBottom: '12px' }}>
                        <Text style={label}>Airline</Text>
                        <Text style={valueMedium}>{airportPickup.airline}</Text>
                      </Column>
                      <Column className="mobile-stack" style={{ paddingBottom: '12px' }}>
                        <Text style={label}>Flight Number</Text>
                        <Text style={valueMedium}>{airportPickup.flightNumber}</Text>
                      </Column>
                    </Row>
                  )}

                  <Row style={{ marginBottom: '16px' }}>
                    <Column>
                      <Text style={label}>Transfer Total</Text>
                      <Text style={valueLarge}>${airportPickup?.price.toFixed(2)}</Text>
                    </Column>
                  </Row>

                  <Section style={{ backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
                    <Text style={{ ...smallText, color: '#1E3A8A', fontWeight: 'bold' }}>🌟 Peace of Mind Promise</Text>
                    <Text style={{ ...smallText, color: '#1E3A8A' }}>
                      Your driver will be waiting for you at the airport exit holding a sign with your name.
                    </Text>
                  </Section>
                </Section>
              </Section>
            )}


            {/* Payment Summary */}
            <Section style={card}>
              <Section style={cardHeader}>
                <Text style={cardTitle}>💰 Payment Summary</Text>
              </Section>
              <Section style={cardContent}>
                <Row style={{ marginBottom: '4px' }}>
                  <Column><Text style={itemDetail}>Subtotal</Text></Column>
                  <Column align="right"><Text style={valueMedium}>${totalPrice.toFixed(2)}</Text></Column>
                </Row>
                <Row style={{ marginBottom: '4px' }}>
                  <Column><Text style={{ ...itemDetail, fontWeight: 'bold', color: '#1C1C1C', fontSize: '18px' }}>Total Paid (USD)</Text></Column>
                  <Column align="right"><Text style={{ ...valueMedium, fontWeight: 'bold', fontSize: '18px' }}>${totalPrice.toFixed(2)}</Text></Column>
                </Row>
                <Row style={{ marginBottom: '16px' }}>
                  <Column><Text style={itemDetail}>Balance Due at Check-in</Text></Column>
                  <Column align="right"><Text style={valueMedium}>$0.00</Text></Column>
                </Row>

                <Hr style={hr} />

                <Row>
                  <Column className="mobile-stack" style={{ paddingBottom: '12px', paddingRight: '16px' }}>
                    <Text style={label}>Payment Processed On</Text>
                    <Text style={valueMedium}>{format(new Date(), "MMM dd, yyyy")}</Text>
                  </Column>

                </Row>

                <Section style={{ backgroundColor: '#FAF7F3', padding: '8px', borderRadius: '6px', textAlign: 'center', marginTop: '8px' }}>
                  <Text style={{ ...smallText, color: '#4B5563', fontWeight: 'bold' }}>✨ All taxes included, no hidden fees.</Text>
                </Section>
              </Section>
            </Section>

            {/* Next Steps Buttons */}
            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#1C1C1C', marginBottom: '16px' }}>📝 Next Steps</Text>
              <Button style={outlineButton} href={`${baseUrl}/confirmation?bid=${confirmationId}`}>
                View Booking Online
              </Button>
              <Button style={primaryButton} href={`${baseUrl}/guest-services`}>
                Enhance Your Stay
              </Button>
            </Section>

            {/* Footer Links (Common) */}
            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Text style={{ fontSize: '14px', color: '#6B7280' }}>
                💬 Need help? <Link href="https://wa.me/18095105465" style={{ color: '#1C1C1C', fontWeight: 'bold', textDecoration: 'underline' }}>Chat with us on WhatsApp.</Link>
              </Text>
            </Section>

            <Text style={footer}>
              Sweet Home Punta Cana, Bávaro, Punta Cana, Dominican Republic<br />
              www.sweethomepuntacana.com
            </Text>

          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#FAF7F3",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "0",
};

const headerSection = {
  backgroundColor: '#1C1C1C',
  padding: '40px 20px',
  textAlign: 'center' as const,
  backgroundImage: 'url(https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const headerTitle = {
  color: '#FFFFFF',
  fontSize: '28px',
  fontWeight: 'bold',
  fontFamily: '"Playfair Display", serif',
  margin: '20px 0 10px',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
};

const headerSubtitle = {
  color: 'rgba(255,255,255,0.9)',
  fontSize: '16px',
  margin: '0',
  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
};

const contentSection = {
  padding: '24px',
  marginTop: '-20px',
  position: 'relative' as const,
  zIndex: 10,
};

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  marginBottom: '24px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  border: '1px solid #E5E7EB',
};

const cardHeader = {
  backgroundColor: '#FEFCE8', // shpc-yellow/10
  padding: '16px 24px',
  borderBottom: '1px solid #FEF08A',
};

const cardTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1C1C1C',
  margin: '0',
  fontFamily: '"Playfair Display", serif',
};

const cardContent = {
  padding: '24px',
};

const label = {
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  fontWeight: 'bold',
  color: '#6B7280', // muted-foreground
  margin: '0 0 4px 0',
  letterSpacing: '0.05em',
};

const valueMedium = {
  fontSize: '15px',
  color: '#1F2937', // shpc-ink
  fontWeight: 500,
  margin: '0',
};

const valueLarge = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1C1C1C',
  margin: '0',
  letterSpacing: '-0.025em',
};

const itemDetail = {
  fontSize: '14px',
  color: '#4B5563',
  margin: '0',
};

const smallText = {
  fontSize: '12px',
  color: '#6B7280',
  margin: '0',
};

const hr = {
  borderColor: "#E5E7EB",
  margin: "16px 0",
};

const primaryButton = {
  backgroundColor: "#F5C343",
  borderRadius: "12px",
  color: "#1C1C1C",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 24px",
  margin: "8px",
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const outlineButton = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  color: "#1C1C1C",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 24px",
  margin: "8px",
  border: '2px solid #F5C343',
};

const footer = {
  color: "#9CA3AF",
  fontSize: "12px",
  lineHeight: "1.5",
  textAlign: "center" as const,
  marginTop: "24px",
};
