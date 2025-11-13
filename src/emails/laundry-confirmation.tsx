
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
  Row,
  Column,
  Link,
} from "@react-email/components";
import * as React from "react";
import { ServiceBooking } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface LaundryConfirmationEmailProps {
  booking: ServiceBooking;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const numberToWord = (num: number) => {
    const words = ["Zero", "One", "Two", "Three", "Four", "Five"];
    return words[num] || String(num);
};

export default function LaundryConfirmationEmail({
  booking,
}: LaundryConfirmationEmailProps) {
  const previewText = `Your laundry service for ${booking.qty} load(s) is confirmed.`;
  const formattedDate = booking.date ? format(parseISO(booking.date), "EEEE, MMMM do") : 'N/A';
  const formattedTime = booking.time ? new Date(`1970-01-01T${booking.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A';
  const shortId = booking.id.substring(0, 7).toUpperCase();


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
              Thank you for your request! We've received your booking and are preparing everything for you.
            </Text>
          </Section>

          {/* Ticket Section */}
          <Section style={ticket}>
            <Section style={ticketHeader}>
                <Text style={ticketTitle}>LAUNDRY SERVICE</Text>
                <Text style={ticketSubtitle}>Admit {numberToWord(booking.qty || 1)} ({booking.qty === 1 ? "Laundry Bag" : "Laundry Bags"})</Text>
            </Section>
            
            <Hr style={dashedHr} />

            <Section style={ticketDetails}>
                <Row style={detailRow}>
                    <Column style={detailLabelCol}>
                        <Text style={detailLabel}>NAME</Text>
                    </Column>
                    <Column style={detailValueCol}>
                        <Text style={detailValue}>{booking.guestName}</Text>
                    </Column>
                </Row>
                 <Row style={detailRow}>
                    <Column style={detailLabelCol}>
                        <Text style={detailLabel}>ROOM</Text>
                    </Column>
                    <Column style={detailValueCol}>
                        <Text style={detailValue}>{booking.accommodation}</Text>
                    </Column>
                </Row>
                 <Row style={detailRow}>
                    <Column style={detailLabelCol}>
                        <Text style={detailLabel}>LOADS</Text>
                    </Column>
                    <Column style={detailValueCol}>
                        <Text style={detailValue}>{booking.qty}</Text>
                    </Column>
                </Row>
                <Row style={detailRow}>
                    <Column style={detailLabelCol}>
                        <Text style={detailLabel}>PICKUP</Text>
                    </Column>
                    <Column style={detailValueCol}>
                        <Text style={detailValueRight}>{formattedDate} at {formattedTime}</Text>
                    </Column>
                </Row>
                 <Row style={detailRow}>
                    <Column style={detailLabelCol}>
                        <Text style={detailLabel}>TOTAL</Text>
                    </Column>
                    <Column style={detailValueCol}>
                        <Text style={detailValue}>${booking.total?.toFixed(2)}</Text>
                    </Column>
                </Row>
            </Section>
            <Section style={ticketFooter}>
                <Text style={ticketFooterText}>BOOKING ID: {shortId}</Text>
            </Section>
          </Section>
          
          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button style={button} href={`${baseUrl}/guest-services`}>
                Enhance Your Stay →
            </Button>
          </Section>
          
          {/* Enhance Your Stay Section */}
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
                Laundry handled with care by Sweet Home Punta Cana.<br/>
                Bávaro, Punta Cana, Dominican Republic
              </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// STYLES

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
  paddingBottom: '24px',
  textAlign: "right" as const,
};

const logo = {
  margin: "0",
  width: "240px"
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#434A54", // gray-blue
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

// TICKET STYLES
const ticket = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5e5',
  borderRadius: '16px',
  fontFamily: 'Roboto Mono, Courier, monospace',
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const ticketHeader = {
    padding: '24px',
    textAlign: 'center' as const,
};

const ticketTitle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1C1C1C',
    letterSpacing: '0.1em',
    margin: 0,
};

const ticketSubtitle = {
    fontSize: '14px',
    color: '#434A54',
    margin: '4px 0 0 0',
};

const dashedHr = {
    borderTop: '2px dashed #cccccc',
    borderBottom: 'none',
    margin: '0 24px',
};

const ticketDetails = {
    padding: '24px',
};

const detailRow = {
    marginBottom: '16px',
};

const detailLabelCol = {
    width: '30%',
};

const detailValueCol = {
    width: '70%',
};

const detailLabel = {
    fontSize: '14px',
    color: '#434A54',
    margin: 0,
};

const detailValue = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1C1C1C',
    margin: 0,
    textAlign: 'right' as const
};
const detailValueRight = {
  ...detailValue,
  textAlign: 'right' as const
};

const ticketFooter = {
  backgroundColor: '#1C1C1C',
  padding: '12px 24px',
  borderBottomLeftRadius: '15px',
  borderBottomRightRadius: '15px',
  textAlign: 'center' as const,
};

const ticketFooterText = {
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '0.1em',
  margin: 0,
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
