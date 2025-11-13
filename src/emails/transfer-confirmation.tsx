
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
  Link,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";
import { ServiceBooking } from "@/lib/types";
import { format, parseISO, parse } from "date-fns";

interface TransferConfirmationEmailProps {
  booking: ServiceBooking;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const DIRECTION_LABELS = {
  arrive: "Arrival",
  depart: "Departure",
  round: "Round Trip",
  "one-way": "One-Way",
};

export default function TransferConfirmationEmail({
  booking,
}: TransferConfirmationEmailProps) {
  const bookingId = booking.id || booking.bookingId || 'N/A';
  const shortId = bookingId.substring(0, 7).toUpperCase();
  const previewText = `Your airport transfer is confirmed! Booking ID: ${shortId}`;

  const directionKey = booking.direction?.toLowerCase() as keyof typeof DIRECTION_LABELS | undefined;
  const directionLabel = directionKey ? DIRECTION_LABELS[directionKey] : 'Transfer';


  const isArrival = booking.direction?.toLowerCase().includes('arr') || booking.direction?.toLowerCase().includes('one-way');
  const isDeparture = booking.direction?.toLowerCase().includes('dep');
  
  const fromLocation = isDeparture ? "SHPC" : "PUJ";
  const fromLocationDetail = isDeparture ? "Sweet Home Punta Cana" : "Punta Cana Airport";
  const toLocation = isDeparture ? "PUJ" : "SHPC";
  const toLocationDetail = isDeparture ? "Punta Cana Airport" : "Sweet Home Punta Cana";
  
  const dateAndFlight = () => {
    let dateStr = booking.arrivalDate || booking.departureDate;
    if (!dateStr) return "Date not specified";

    let flightInfo = booking.arrivalFlight || booking.departureFlight || 'Flight TBD';

    try {
        const date = parseISO(dateStr);
        let datePart = format(date, "MMM dd, yyyy");
        
        let timePart = '';
        if (booking.departureTime) {
            timePart = ` at ${format(parse(booking.departureTime, 'HH:mm', new Date()), 'h:mm a')}`;
        }
        
        if (isArrival) {
            return `${datePart} - ${flightInfo}`;
        }
        
        return `${datePart}${timePart}`;

    } catch (e) {
        console.error("Could not parse date for email:", dateStr);
        return "Invalid Date";
    }
  };
  
  const qrValue = `${shortId}-${fromLocation}-${toLocation}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
           <Section style={logoSection}>
             <Link href="https://www.sweethomepc.com">
               <Img
                src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Sweet%20Home%20Punta%20Cana%20logo.png?alt=media&token=2daf1c25-1bb0-4f7e-9fd2-598f30501843"
                width="240"
                alt="Sweet Home Punta Cana"
                style={logo}
              />
            </Link>
          </Section>

          <Section style={{ padding: '0 24px' }}>
            <Text style={paragraph}>Hi {booking.guestName},</Text>
            <Text style={paragraph}>
              This is to confirm your airport transfer request. Your driver will be waiting for you as scheduled.
            </Text>
          </Section>

          <Section style={pass}>
            {/* Header */}
            <Section style={header}>
              <Text style={headerTitle}>TRANSFER PASS</Text>
              <Text style={headerSubtitle}>Sweet Home Punta Cana</Text>
            </Section>

            {/* Main Content */}
            <Section style={content}>
              <Row>
                {/* Left Column */}
                <Column style={leftColumn}>
                  <Row>
                    <Column style={{width: '50%'}}>
                      <Text style={label}>From</Text>
                      <Text style={locationCode}>{fromLocation}</Text>
                      <Text style={locationDetail}>{fromLocationDetail}</Text>
                    </Column>
                    <Column style={{width: '50%'}}>
                      <Text style={label}>To</Text>
                      <Text style={locationCode}>{toLocation}</Text>
                      <Text style={locationDetail}>{toLocationDetail}</Text>
                    </Column>
                  </Row>
                  <Hr style={solidHr} />
                  <Text style={label}>{isDeparture ? 'Departure Date & Time' : 'Arrival Date & Flight'}</Text>
                  <Text style={largeDetail}>{dateAndFlight()}</Text>
                  <Hr style={solidHr} />
                  <Text style={label}>Passenger</Text>
                  <Text style={largeDetail}>{booking.guestName}</Text>
                </Column>
                
                {/* Dashed Separator */}
                <Column style={separatorColumn}>
                  <div style={dashedLine}></div>
                </Column>

                {/* Right Column */}
                <Column style={rightColumn}>
                  <Text style={label}>Direction</Text>
                  <Text style={largeDetail}>{directionLabel}</Text>
                  <Hr style={solidHr} />
                  <Text style={label}>Total Paid</Text>
                  <Text style={price}>${booking.total?.toFixed(2) || '0.00'}</Text>
                  <Img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrValue}`}
                    alt="QR Code"
                    width="100"
                    height="100"
                    style={{ margin: '12px auto 0' }}
                  />
                </Column>
              </Row>
            </Section>

            {/* Driver Note */}
            {isArrival && (
              <Section style={noteSection}>
                <Text style={noteText}>👋 Your driver will meet you at arrivals with a sign. Welcome to paradise!</Text>
              </Section>
            )}
            
            {/* Footer */}
            <Section style={ticketFooter}>
              <Text style={ticketFooterText}>BOOKING ID: {shortId}</Text>
            </Section>
          </Section>

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button style={button} href={`${baseUrl}/guest-services`}>
                Enhance Your Stay →
            </Button>
          </Section>
          
           <Section style={enhanceStaySection}>
             <Section style={enhanceStayBox}>
                  <Row>
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

          <Section style={footer}>
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
              <Text style={footerText}>
                Travel made easy with Sweet Home Punta Cana.<br/>
                Bávaro, Punta Cana, Dominican Republic
              </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#F8F6F3", // Warm beige
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  maxWidth: "640px",
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 24px",
  borderRadius: "8px"
};

const logoSection = {
  padding: '0 20px',
  textAlign: "right" as const,
};

const logo = {
  margin: "0",
  width: "240px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#434A54", // gray-blue
  padding: '0 20px',
};

const button = {
  backgroundColor: "#F6C344", // gold
  borderRadius: "8px",
  color: "#1C1C1C", // black
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
};

const learnMoreButton = {
  backgroundColor: '#EDEDED',
  color: '#1C1C1C',
  borderRadius: '6px',
  padding: '8px 16px',
  fontSize: '14px',
  textDecoration: 'none',
};

const footer = {
  textAlign: 'center' as const,
  paddingTop: '24px',
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  paddingTop: "12px",
}

const socialsIconContainer = {
  display: 'inline-block',
  width: '40px'
};

const pass = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  border: '1px solid #E0E0E0',
  margin: '20px 0',
};

const header = {
  backgroundColor: '#0F1115',
  padding: '16px 0',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '0.2em',
  margin: '0',
};

const headerSubtitle = {
  color: '#F6C33B',
  fontSize: '12px',
  margin: '4px 0 0',
};

const content = {
  padding: '24px',
};

const leftColumn = {
  width: '65%',
};

const rightColumn = {
  width: '35%',
  textAlign: 'center' as const,
};

const separatorColumn = {
  width: '1px',
  padding: '0 12px'
};

const dashedLine = {
  width: '1px',
  height: '100%',
  borderLeft: '2px dashed #E0E0E0',
};

const label = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '0 0 4px',
};

const locationCode = {
  color: '#0F1115',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  lineHeight: '1',
};

const locationDetail = {
  color: '#525f7f',
  fontSize: '12px',
  margin: '4px 0 0',
};

const largeDetail = {
  color: '#0F1115',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const price = {
  ...largeDetail,
  fontSize: '24px',
  fontWeight: 'bold',
};

const solidHr = {
  borderTop: '1px solid #E0E0E0',
  margin: '16px 0',
};

const noteSection = {
  backgroundColor: '#F9F7F2',
  padding: '12px 24px',
};

const noteText = {
  fontSize: '12px',
  color: '#525f7f',
  margin: '0',
  textAlign: 'center' as const,
};

const ticketFooter = {
  backgroundColor: '#0F1115',
  padding: '12px 0',
  textAlign: 'center' as const,
};

const ticketFooterText = {
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '0.1em',
  margin: '0',
};

const enhanceStaySection = {
  padding: '24px 0',
};

const enhanceStayBox = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '16px',
    padding: '20px',
}

const enhanceStayTitle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1C1C1C',
    margin: '0 0 4px 0'
}

const enhanceStayText = {
    fontSize: '14px',
    color: '#434A54',
    margin: '0 0 12px 0'
}

const imageColumn = {
  width: '40%',
  paddingRight: '20px',
};

const textColumn = {
  width: '60%',
  verticalAlign: 'middle',
};

const promoImage = {
  width: '100%',
  maxWidth: '120px',
  borderRadius: '8px',
};

    