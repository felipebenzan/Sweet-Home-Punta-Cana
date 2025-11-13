
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
  const room = rooms[0];
  const shortId = confirmationId ? confirmationId.substring(0, 7).toUpperCase() : 'CONFIRM';
  const previewText = `Your reservation for ${room.name} is confirmed!`;
  
  const fromDate = parseISO(dates.from);
  const toDate = parseISO(dates.to);
  const nights = differenceInDays(toDate, fromDate);
  const roomSubtotal = room.price * nights;

  const qrValue = `${shortId}-${room.slug}`;

  const renderPickupDetails = () => {
    if (!airportPickup || airportPickup.tripType === 'none') return null;
    
    const arrivalInfo = `${airportPickup.airline || ''} ${airportPickup.flightNumber || ''}`.trim() || 'TBD';
    const returnInfo = `${airportPickup.returnFlightNumber || 'Flight TBD'}`;
    const arrivalDateFormatted = airportPickup.arrivalDate ? format(parseISO(airportPickup.arrivalDate), 'MMM dd, yyyy') : 'Date TBD';
    const returnDateFormatted = airportPickup.returnDate ? format(parseISO(airportPickup.returnDate), 'MMM dd, yyyy') : 'Date TBD';

    return (
      <Row style={summaryRow}>
        <Column>
          <Text style={{ ...itemDetail, fontWeight: 'bold' }}>Airport Pickup (PUJ)</Text>
          <Text style={{ ...itemDetail, fontSize: '12px' }}>
            {airportPickup.tripType === 'one-way' && `Arrival • ${arrivalInfo} • ${arrivalDateFormatted}`}
            {airportPickup.tripType === 'round-trip' && `Round Trip • Arr: ${arrivalInfo} ${arrivalDateFormatted} • Dep: ${returnInfo} ${returnDateFormatted}`}
          </Text>
        </Column>
        <Column align="right">
          <Text style={{...itemDetail, fontFamily: 'monospace'}}>${airportPickup.price.toFixed(2)}</Text>
        </Column>
      </Row>
    )
  }

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
             <Text style={logoText}>Sweet Home Punta Cana</Text>
             <Text style={logoSubtitle}>Guest House</Text>
          </Section>
          <Section style={contentSection}>
            <Text style={paragraph}>Hi {guestInfo?.firstName || 'Guest'},</Text>
            <Text style={paragraph}>
              Thank you for booking your stay with us. We're excited to welcome you to paradise!
            </Text>
          </Section>
          
          <Section style={contentSection}>
            {/* QR Code and Reservation ID */}
            <Section style={box}>
               <Row>
                  <Column style={{ width: '100px', paddingTop: '8px' }}>
                      <Img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${qrValue}`}
                        alt="QR Code"
                        width="80"
                        height="80"
                      />
                  </Column>
                  <Column>
                      <Text style={smallMutedText}>Reservation ID</Text>
                      <Text style={bookingIdText}>{shortId}</Text>
                      <Text style={smallMutedText}>Keep this for check-in.</Text>
                  </Column>
               </Row>
            </Section>
            
            {/* Reservation Details */}
            <Section style={box}>
               <Text style={heading}>Your Reservation</Text>
               <Row>
                  <Column style={{ width: '120px' }}>
                      <Img src={room.image} width="100" height="75" alt={room.name} style={{ borderRadius: '8px' }} />
                  </Column>
                   <Column>
                      <Text style={itemStrong}>{room.name}</Text>
                      <Text style={itemDetail}>{room.bedding} Bed</Text>
                  </Column>
               </Row>
               <Hr style={hr} />
               <Row>
                  <Column>
                      <Text style={{...itemDetail, textAlign: 'left'}}><strong>Dates:</strong> {format(fromDate, "MMM dd")} - {format(toDate, "MMM dd, yyyy")}</Text>
                  </Column>
                  <Column align="right">
                       <Text style={{...itemDetail, textAlign: 'right'}}><strong>Guests:</strong> {guests}</Text>
                  </Column>
               </Row>
            </Section>

            {/* Payment Summary */}
            <Section style={box}>
               <Text style={heading}>Payment Summary</Text>
               <Text style={smallMutedText}>Receipt sent to {guestInfo?.email}</Text>
               <Hr style={hr} />
               <Row style={summaryRow}>
                  <Column>
                      <Text style={{...itemDetail, fontWeight: 'bold' }}>Room Subtotal</Text>
                      <Text style={{...itemDetail, fontSize: '12px' }}>{nights} {nights === 1 ? 'night' : 'nights'}</Text>
                  </Column>
                  <Column align="right"><Text style={{...itemDetail, fontFamily: 'monospace'}}>${roomSubtotal.toFixed(2)}</Text></Column>
               </Row>
               {renderPickupDetails()}
               <Row style={summaryRow}>
                  <Column>
                      <Text style={{...itemDetail, color: '#28a745', fontWeight: 'bold' }}>✓ All taxes & fees included</Text>
                  </Column>
               </Row>
               <Hr style={hr} />
               <Row style={summaryRow}>
                  <Column><Text style={itemDetail}>Subtotal</Text></Column>
                  <Column align="right"><Text style={{...itemDetail, fontFamily: 'monospace'}}>${totalPrice.toFixed(2)}</Text></Column>
               </Row>
               <Row style={summaryRow}>
                  <Column><Text style={{...itemDetail, fontWeight: 'bold'}}>Total Paid (USD)</Text></Column>
                  <Column align="right"><Text style={{...itemDetail, fontWeight: 'bold', fontFamily: 'monospace'}}>${totalPrice.toFixed(2)}</Text></Column>
               </Row>
               <Row style={summaryRow}>
                  <Column><Text style={{...itemDetail, fontWeight: 'bold'}}>Balance Due</Text></Column>
                  <Column align="right"><Text style={{...itemDetail, fontWeight: 'bold', fontFamily: 'monospace'}}>$0.00</Text></Column>
               </Row>
               <Hr style={hr} />
               <Text style={{...smallMutedText, textAlign: 'left'}}>
                  Paid on: {format(new Date(), 'MMM dd, yyyy')} • Method: Visa ••••4242<br/>
                  Transaction ID: ch_3Pq...{Math.floor(Math.random()*9000+1000)}<br/>
                  Billing name: {guestInfo?.firstName} {guestInfo?.lastName}
               </Text>
            </Section>

            {/* Check-in info */}
            <Section style={box}>
                <Text style={{...itemDetail, textAlign: 'left'}}><strong>Check-in:</strong> 3:00 PM • <strong>Check-out:</strong> 11:00 AM</Text>
                <Text style={{...itemDetail, textAlign: 'left'}}><strong>Cancellation:</strong> Free cancellation up to 48h before arrival.</Text>
            </Section>
          </Section>

          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button style={button} href={`${baseUrl}/guest-services`}>
                Enhance Your Stay →
            </Button>
          </Section>
          
          <Section style={contentSection}>
           <Section style={enhanceStayBox}>
                  <Row style={{verticalAlign: 'middle'}}>
                      <Column style={imageColumn}>
                          <Img src="https://iampuntacana.com/wp-content/uploads/2025/09/unnamed.png" alt="Scooter" style={promoImage} />
                      </Column>
                      <Column style={textColumn}>
                          <Text style={enhanceStayTitle}>Need a ride?</Text>
                          <Text style={enhanceStayText}>Get a scooter delivered to your door.</Text>
                          <Button style={learnMoreButton} href="https://www.scooterspc.com">Learn More</Button>
                      </Column>
                  </Row>
           </Section>
          </Section>

          <Section style={socialsSection}>
              <Row>
                <Column align="center" style={socialsIconContainer}>
                  <Link href="https://www.facebook.com/sweethomepc/">
                    <Img src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/facebook%20sweet%20home%20punta%20cana%20guest%20house.png?alt=media&token=9576b0e2-0d2d-4c8f-89a5-d97e0bbd56a7" alt="Facebook" width="24" height="24" />
                  </Link>
                </Column>
                <Column align="center" style={socialsIconContainer}>
                  <Link href="https://www.instagram.com/sweethome_puntacana/">
                    <Img src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/instagram%20sweet%20home%20punta%20cana.png?alt=media&token=27380234-317d-49d1-ac8b-527d171308d1" alt="Instagram" width="24" height="24" />
                  </Link>
                </Column>
                <Column align="center" style={socialsIconContainer}>
                  <Link href="https://www.youtube.com/@IAMPUNTACANA">
                    <Img src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/youtube%20sweet%20home%20punta%20cana%20i%20am%20punta%20cana%20scooters%20punta%20cana.jpg?alt=media&token=f1eb40ef-feda-4780-b892-2e554237ae98" alt="YouTube" width="24" height="24" />
                  </Link>
                </Column>
              </Row>
          </Section>

          <Text style={footer}>
            Sweet Home Punta Cana, Bávaro, Punta Cana, Dominican Republic
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#FAF7F3",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  maxWidth: "680px",
  margin: "0 auto",
  padding: "32px 0 48px",
};

const contentSection = {
  padding: '0 40px',
  textAlign: 'left' as const,
};

const logoSection = {
  padding: '16px 0 32px 0',
  textAlign: "center" as const,
};

const logoText = {
  fontFamily: '"Playfair Display", "Times New Roman", serif',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#0F1115',
  margin: 0,
};

const logoSubtitle = {
  fontFamily: '"Dancing Script", cursive',
  fontSize: '20px',
  color: '#0F1115',
  margin: '-5px 0 0 0',
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.7",
  color: "#2D3A4A",
  marginBottom: '24px',
  textAlign: 'left' as const,
};

const heading = {
  fontSize: "18px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
  marginBottom: '12px',
  textAlign: 'left' as const,
};

const box = {
  padding: "24px",
  backgroundColor: "#FDF9F4",
  border: "1px solid #e5e5e5",
  borderRadius: "16px",
  marginBottom: "24px"
};

const itemDetail = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#525f7f",
  margin: '0',
  textAlign: 'left' as const,
};

const itemStrong = {
  ...itemDetail,
  fontWeight: 'bold',
  color: '#484848',
  fontSize: '16px'
}

const smallMutedText = {
  fontSize: "12px",
  color: "#8898aa",
  margin: '0 0 4px 0',
  textAlign: 'left' as const,
}

const bookingIdText = {
  fontSize: "20px",
  fontWeight: 'bold',
  color: '#484848',
  fontFamily: 'monospace',
  margin: 0,
  textAlign: 'left' as const,
}

const summaryRow = {
  width: "100%",
  marginBottom: '8px'
};

const button = {
  backgroundColor: "#F5C343",
  borderRadius: "8px",
  color: "#1C1C1C",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "240px",
  padding: "14px",
  margin: "24px auto"
};

const hr = {
  borderColor: "#e5e5e5",
  margin: "16px 0",
};

const enhanceStayBox = {
    backgroundColor: '#FDF9F4',
    border: '1px solid #e5e5e5',
    borderRadius: '16px',
    padding: '20px',
}

const enhanceStayTitle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1C1C1C',
    margin: '0 0 4px 0',
    textAlign: 'left' as const,
}

const enhanceStayText = {
    fontSize: '14px',
    color: '#434A54',
    margin: '0 0 12px 0',
    textAlign: 'left' as const,
}

const imageColumn = {
  width: '35%',
  paddingRight: '20px',
};

const textColumn = {
  width: '65%',
  verticalAlign: 'middle',
};

const promoImage = {
  width: '100%',
  maxWidth: '120px',
  borderRadius: '8px',
};

const learnMoreButton = {
  backgroundColor: '#EDEDED',
  color: '#1C1C1C',
  borderRadius: '6px',
  padding: '8px 16px',
  fontSize: '14px',
  textDecoration: 'none',
};

const socialsSection = {
  textAlign: 'center' as const,
  padding: '20px 0 10px 0',
};

const socialsIconContainer = {
  padding: '0 8px',
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  paddingTop: "24px",
};

    