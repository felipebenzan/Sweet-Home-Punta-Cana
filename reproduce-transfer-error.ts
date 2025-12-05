
async function testBooking() {
    const payload = {
        type: 'transfer',
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        customer: { name: 'Test User', email: 'test@example.com', phone: '1234567890' },
        pricing: { totalUSD: 40, currency: 'USD' },
        details: {
            direction: 'arrive',
            arrivalDate: '2025-11-27',
            departureDate: null,
            arrivalFlight: 'qq234',
            departureFlight: null,
            departureTime: null
        },
        totalPrice: 40,
        paypalOrderId: 'test-order-id',
        paypalTransactionId: 'test-transaction-id'
    };

    try {
        console.log("Sending request to http://localhost:3000/api/bookings...");
        const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Response status:', response.status);
        console.log('Response body:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testBooking();
