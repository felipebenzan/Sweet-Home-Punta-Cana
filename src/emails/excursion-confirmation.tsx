
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
  Column
} from "@react-email/components";
import * as React from "react";
import { Excursion } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface BundledItem extends Excursion {
  bookingDate?: string;
  adults: number;
}

interface ExcursionBookingDetails {
  mainExcursion: BundledItem;
  bundledItems: BundledItem[];
  totalPrice: number;
  bundleDiscount: number;
  bookingId: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
  }
}

interface ExcursionConfirmationEmailProps {
  bookingDetails: ExcursionBookingDetails;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const getPriceForItem = (item: { price: Excursion['price'], adults: number }) => {
    return (item.adults * item.price.adult);
}

export default function ExcursionConfirmationEmail({
  bookingDetails,
}: ExcursionConfirmationEmailProps) {
  const { mainExcursion, bundledItems, totalPrice, bundleDiscount, guestInfo, bookingId } = bookingDetails;
  const allItems = [mainExcursion, ...bundledItems];
  const previewText = `Your adventure in Punta Cana is confirmed!`;
    
  const renderExcursionItem = (item: BundledItem, index: number) => {
    
    let googleMapsUrl = "#";

    // Specific URL for Adventure Buggies
    if (item.slug.toLowerCase().includes('adventure-buggies')) {
      googleMapsUrl = "https://www.google.com/maps/dir/?api=1&origin=Sweet+Home+Punta+Cana+-+Guest+House,+Punta+Cana+23000,+Dominican+Republic&destination=Texaco+Villas+Bávaro,+Av.+Alemania,+Punta+Cana+23000,+Dominican+Republic&travelmode=walking";
    }

    // Specific URL for Isla Saona
    if (item.slug.toLowerCase().includes('isla-saona')) {
        googleMapsUrl = "https://www.google.com/maps/dir/?api=1&origin=Sweet+Home+Punta+Cana+-+Guest+House,+Punta+Cana+23000,+Dominican+Republic&destination=Supermercado+LAMA,+Bávaro,+Punta+Cana+23000,+Dominican+Republic&travelmode=driving";
    }

    // Fallback to link from practicalInfo if available
    if (googleMapsUrl === "#" && item.practicalInfo.pickupMapLink) {
        googleMapsUrl = item.practicalInfo.pickupMapLink;
    }

    return(
      <Section key={item.id} style={box}>
          <Row style={{ verticalAlign: 'top' }}>
            <Column style={{ width: '100%' }}>
                <Img src={item.image} width="80" height="60" alt={item.title} style={{ borderRadius: '8px', marginBottom: '16px' }} />
                <Text style={{...itemDetail, fontWeight: 'bold', fontSize: '16px', margin: '0 0 8px 0'}}>{item.title}</Text>
                <Text style={itemDetail}><span style={icon}>🗓️</span> {item.bookingDate ? format(parseISO(item.bookingDate), "EEEE, MMM dd") : 'Date to be confirmed'}</Text>
                <Text style={itemDetail}><span style={icon}>👥</span> {item.adults} Adult(s)</Text>
                <Text style={itemDetail}><span style={icon}>🕒</span> {item.practicalInfo.duration}</Text>
                <Text style={itemDetail}>
                  <span style={icon}>🕒</span> Departure: {item.practicalInfo.departure} <span style={onTimeStyle}>On Time</span>
                </Text>
            </Column>
          </Row>
          <Hr style={hr} />
           <Row style={{ verticalAlign: 'top' }}>
              <Column style={{ width: '40%', paddingRight: '10px' }}>
                <div style={{ width: '100%', height: '100px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '12px' }}>Map Preview</div>
              </Column>
              <Column style={{ width: '60%' }}>
                <Text style={{ ...itemDetail, margin: '0 0 8px 0' }}><span style={icon}>📍</span>{item.practicalInfo.pickup}</Text>
                {googleMapsUrl !== "#" && (
                  <>
                    <Button href={googleMapsUrl} style={mapButton}>🗺️ Open in Google Maps (opens externally)</Button>
                    <Text style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
                      If the map doesn’t open automatically, long press and choose “Open Link.”
                    </Text>
                  </>
                )}
              </Column>
          </Row>
      </Section>
  )};

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

          <Section style={{padding: '0 32px'}}>
            <Text style={paragraph}>Hi {guestInfo.firstName},</Text>
            <Text style={paragraph}>
              Get ready for an adventure! Your excursion booking is confirmed. Below are the details of your upcoming experiences.
            </Text>
            {bookingId && <Text style={{...paragraph, textAlign: 'center', fontWeight: 'bold', fontSize: '14px', fontFamily: 'monospace'}}>BOOKING ID: {bookingId.substring(0,8).toUpperCase()}</Text>}
          </Section>

          <Section style={{padding: '0 32px'}}>
            <Text style={ticketTitle}>YOUR BOOKED EXCURSIONS</Text>
            {allItems.map((item, index) => renderExcursionItem(item, index))}
          </Section>
          
           <Section style={{...box, marginTop: '24px', padding: '24px 32px'}}>
              <Text style={ticketTitle}>PAYMENT SUMMARY</Text>
              
               {allItems.map(item => (
                <Row key={`${item.id}-summary`} style={summaryRow}>
                    <Column>
                        <Text style={{ ...itemDetail, fontWeight: 'bold', fontFamily: 'sans-serif' }}>{item.title}</Text>
                        <Text style={{ ...itemDetail, fontSize: '12px', fontFamily: 'sans-serif' }}>{item.adults} adult(s) at ${item.price.adult.toFixed(2)} each</Text>
                    </Column>
                    <Column align="right">
                        <Text style={{...itemDetail, fontFamily: 'monospace'}}>${getPriceForItem(item).toFixed(2)}</Text>
                    </Column>
                </Row>
               ))}

               {bundleDiscount > 0 && (
                 <Row style={summaryRow}>
                    <Column><Text style={{...itemDetail, color: '#28a745', fontWeight: 'bold', fontFamily: 'sans-serif'}}>Bundle Discount</Text></Column>
                    <Column align="right"><Text style={{...itemDetail, color: '#28a745', fontFamily: 'monospace'}}>-${bundleDiscount.toFixed(2)}</Text></Column>
                 </Row>
               )}

              <Hr style={{...hr, margin: "16px 0"}} />
               <Row style={{ ...summaryRow, paddingTop: '4px' }}>
                  <Column><Text style={{...itemDetail, fontFamily: 'sans-serif'}}>Subtotal</Text></Column>
                  <Column align="right"><Text style={{...itemDetail, fontFamily: 'monospace'}}>${(totalPrice + bundleDiscount).toFixed(2)}</Text></Column>
              </Row>
              <Row style={{ ...summaryRow, paddingTop: '4px' }}>
                  <Column><Text style={{ ...totalLabel, fontSize: '16px', fontFamily: 'sans-serif' }}>Total Paid (USD)</Text></Column>
                  <Column align="right"><Text style={{ ...totalValue, fontFamily: 'monospace', fontSize: '16px' }}>${totalPrice.toFixed(2)}</Text></Column>
              </Row>
               <Row style={{ ...summaryRow, paddingTop: '4px' }}>
                  <Column><Text style={{...totalLabel, fontFamily: 'sans-serif'}}>Balance Due</Text></Column>
                  <Column align="right"><Text style={{...totalValue, fontFamily: 'monospace'}}>$0.00</Text></Column>
              </Row>
              <Row style={{ paddingTop: '16px' }}>
                  <Column><Text style={smallMuted}>✓ All taxes & fees included. No hidden charges.</Text></Column>
              </Row>
          </Section>
          
           <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button style={button} href={`${baseUrl}/guest-services`}>
                Enhance Your Stay →
            </Button>
          </Section>

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
            Sweet Home Punta Cana, Bávaro, Punta Cana Dominican Republic
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
};

const ticketTitle = {
  fontFamily: '"Roboto Mono", monospace',
  fontSize: "14px",
  letterSpacing: '0.1em',
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const box = {
  padding: "24px",
  backgroundColor: "#FDF9F4",
  border: "1px solid #e5e5e5",
  borderRadius: "16px",
  marginBottom: "24px",
};

const itemDetail = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#525f7f",
  margin: '4px 0',
  fontFamily: 'sans-serif',
};

const icon = {
  display: 'inline-block',
  width: '20px',
  marginRight: '8px'
}

const onTimeStyle = {
  color: '#28a745',
  fontWeight: 'bold',
  marginLeft: '8px'
}

const summaryRow = {
  width: "100%",
};

const totalLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#484848',
  fontFamily: 'sans-serif',
};

const totalValue = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#484848',
  fontFamily: 'monospace',
};

const smallMuted = {
  fontSize: '12px',
  color: '#28a745',
  paddingTop: '8px',
  fontFamily: 'sans-serif',
}

const hr = {
  borderColor: "#e5e5e5",
  margin: "20px 0",
};

const button = {
  backgroundColor: "#F5C343",
  borderRadius: "8px",
  color: "#1C1C1C",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
};

const mapButton = {
  backgroundColor: "#f0f0f0",
  borderRadius: "6px",
  color: "#333",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: '100%',
  padding: "10px 12px",
}

const enhanceStayBox = {
    backgroundColor: '#FDF9F4',
    border: '1px solid #e5e5e5',
    borderRadius: '16px',
    padding: '20px',
    margin: '0 32px'
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
