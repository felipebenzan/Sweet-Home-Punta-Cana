import { sendBookingConfirmation } from '../src/lib/email-service';
import fs from 'fs';
import path from 'path';

// Helper to save HTML
const saveHtml = (name: string, html: string) => {
    const artifactDir = '/Users/felipebenzan/.gemini/antigravity/brain/c569118b-3558-496e-90c1-62b23fca3e09'; // Use artifact dir
    const filePath = path.join(artifactDir, `${name}.html`);
    fs.writeFileSync(filePath, html);
    console.log(`Saved ${name} to ${filePath}`);
};

async function run() {
    // 1. Room
    await sendBookingConfirmation({
        entry: 'room', // This isn't used but interface might require something if typing strict, but 'bookingType' is what matters
        guestName: 'John Doe',
        guestEmail: 'test@example.com',
        bookingType: 'room',
        bookingDetails: {
            checkInDate: '2024-01-15',
            checkOutDate: '2024-01-20',
            roomName: 'Ocean View Suite',
            numberOfGuests: 2,
        },
        confirmationId: 'RES-123456',
        totalPrice: 1250.00
    }).then(res => res.html && saveHtml('email_room', res.html));

    // 2. Transfer
    await sendBookingConfirmation({
        guestName: 'Jane Smith',
        guestEmail: 'jane@example.com',
        bookingType: 'transfer',
        bookingDetails: {
            details: {
                direction: 'arrive',
                arrivalAirline: 'Delta',
                arrivalFlight: 'DL123',
                arrivalDate: '2024-01-15',
                pax: '2 Passengers'
            }
        },
        confirmationId: 'TRF-789012',
        totalPrice: 45.00
    }).then(res => res.html && saveHtml('email_transfer', res.html));

    // 3. Excursion
    await sendBookingConfirmation({
        guestName: 'Mike Ross',
        guestEmail: 'mike@example.com',
        bookingType: 'excursion',
        bookingDetails: {
            details: {
                mainExcursion: {
                    title: 'Saona Island Adventure',
                    bookingDate: '2024-01-16',
                    adults: 2
                },
                pax: '2 Adults'
            }
        },
        confirmationId: 'EXC-345678',
        totalPrice: 180.00
    }).then(res => res.html && saveHtml('email_excursion', res.html));

    // 4. Laundry - Enriched Data for Strict Alignment Test
    await sendBookingConfirmation({
        guestName: 'Sarah Connor',
        guestEmail: 'sarah@example.com',
        bookingType: 'laundry',
        bookingDetails: {
            details: {
                bags: 2,
                pickupTime: '09:00 AM',
                roomNumber: '101',
                specialInstructions: 'Please use gentle cycle.',
                phone: '+1 (555) 0199'
            },
            date: '2024-01-17'
        },
        confirmationId: 'LND-901234',
        totalPrice: 30.00
    }).then(res => res.html && saveHtml('email_laundry', res.html));

    console.log('Done generating email previews.');
}

run().catch(console.error);
