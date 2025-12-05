import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const roomsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/rooms.json'), 'utf-8'));
const excursionsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/excursions.json'), 'utf-8'));

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Seed Rooms
    for (const room of roomsData) {
        const existingRoom = await prisma.room.findUnique({
            where: { slug: room.slug },
        });

        if (!existingRoom) {
            console.log(`Creating room: ${room.name}`);
            await prisma.room.create({
                data: {
                    id: room.id,
                    slug: room.slug,
                    name: room.name,
                    tagline: room.tagline,
                    description: room.description,
                    bedding: room.bedding,
                    capacity: room.capacity,
                    price: room.price,
                    image: room.image,
                    amenities: JSON.stringify(room.amenities),
                    gallery: room.gallery ? JSON.stringify(room.gallery) : null,
                    inventoryUnits: room.inventoryUnits || 1,
                    cancellationPolicy: room.cancellationPolicy || null,
                },
            });
        } else {
            console.log(`Room already exists: ${room.name}`);
        }
    }

    // Seed Excursions
    for (const excursion of excursionsData) {
        const existingExcursion = await prisma.excursion.findUnique({
            where: { slug: excursion.slug },
        });

        if (!existingExcursion) {
            console.log(`Creating excursion: ${excursion.title}`);
            await prisma.excursion.create({
                data: {
                    id: excursion.id,
                    slug: excursion.slug,
                    title: excursion.title,
                    tagline: excursion.tagline,
                    description: excursion.description,
                    image: excursion.image,
                    icon: excursion.icon || null,
                    priceAdult: excursion.price.adult,
                    inclusions: JSON.stringify(excursion.inclusions),
                    departure: excursion.practicalInfo.departure,
                    duration: excursion.practicalInfo.duration,
                    pickup: excursion.practicalInfo.pickup,
                    pickupMapLink: excursion.practicalInfo.pickupMapLink || null,
                    notes: JSON.stringify(excursion.practicalInfo.notes),
                    gallery: JSON.stringify(excursion.gallery),
                }
            })
        } else {
            console.log(`Excursion already exists: ${excursion.title}`);
        }
    }

    // Seed Admin User
    const adminEmail = 'admin@sweethome.com';
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        console.log('Creating admin user...');
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Admin User',
                role: 'ADMIN',
                permissions: JSON.stringify(['*']),
            },
        });
        console.log('Admin user created: admin@sweethome.com / admin123');
    } else {
        console.log('Admin user already exists.');
    }

    // Seed Mock Reservations and Service Bookings
    console.log('Seeding mock bookings...');

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Helper to create date in current month
    const getDate = (day: number) => new Date(currentYear, currentMonth, day);

    // 1. Room Reservations
    const deluxeRoom = await prisma.room.findUnique({ where: { slug: 'deluxe-king' } });
    const queenRoom = await prisma.room.findUnique({ where: { slug: 'queen-garden' } });

    if (deluxeRoom && queenRoom) {
        const reservations = [
            {
                roomId: deluxeRoom.id,
                guestName: 'John Doe',
                guestEmail: 'john@example.com',
                guestPhone: '+15550101',
                checkInDate: getDate(5),
                checkOutDate: getDate(10),
                numberOfGuests: 2,
                totalPrice: 425.00, // 5 nights * $85
                status: 'Confirmed',
            },
            {
                roomId: queenRoom.id,
                guestName: 'Jane Smith',
                guestEmail: 'jane@example.com',
                guestPhone: '+15550102',
                checkInDate: getDate(15),
                checkOutDate: getDate(18),
                numberOfGuests: 1,
                totalPrice: 225.00, // 3 nights * $75
                status: 'Confirmed',
            },
            {
                roomId: deluxeRoom.id,
                guestName: 'Alice Johnson',
                guestEmail: 'alice@example.com',
                guestPhone: '+15550103',
                checkInDate: getDate(20),
                checkOutDate: getDate(25),
                numberOfGuests: 2,
                totalPrice: 425.00, // 5 nights * $85
                status: 'Pending',
            }
        ];

        for (const res of reservations) {
            await prisma.reservation.create({ data: res });
        }
    }

    // 2. Service Bookings
    const saonaExcursion = await prisma.excursion.findUnique({ where: { slug: 'saona-island' } });
    const buggyExcursion = await prisma.excursion.findUnique({ where: { slug: 'buggy-adventure' } });

    const serviceBookings = [
        // Transfers
        {
            type: 'airport_transfer',
            serviceType: 'transfer',
            guestName: 'Michael Brown',
            email: 'michael@example.com',
            phone: '+15550201',
            date: getDate(6),
            total: 45.00, // Standard transfer price
            pax: '2 Guests',
            status: 'Confirmed',
            details: JSON.stringify({
                direction: 'arrive',
                arrivalDate: getDate(6).toISOString().split('T')[0],
                flightNumber: 'AA123',
                airline: 'American Airlines',
                passengers: 2
            })
        },
        {
            type: 'airport_transfer',
            serviceType: 'transfer',
            guestName: 'Sarah Wilson',
            email: 'sarah@example.com',
            phone: '+15550202',
            date: getDate(12),
            total: 45.00,
            pax: '1 Guest',
            status: 'Confirmed',
            details: JSON.stringify({
                direction: 'depart',
                departureDate: getDate(12).toISOString().split('T')[0],
                departureTime: '14:00',
                flightNumber: 'DL456',
                airline: 'Delta',
                pickupTime: '11:00'
            })
        },
        // Laundry
        {
            type: 'laundry',
            serviceType: 'laundry',
            guestName: 'Emily Davis',
            email: 'emily@example.com',
            phone: '+15550301',
            date: getDate(8),
            total: 30.00,
            status: 'Confirmed',
            details: JSON.stringify({
                bags: 2,
                pricePerBag: 15,
                roomNumber: '101 (Deluxe King)',
                pickupTime: '09:00 AM',
                specialInstructions: 'Fold shirts, hang pants'
            })
        },
        // Excursions
        {
            type: 'excursion',
            serviceType: 'excursion',
            excursionId: saonaExcursion?.id,
            guestName: 'David Miller',
            email: 'david@example.com',
            phone: '+15550401',
            date: getDate(14),
            total: 178.00, // 2 * $89
            pax: '2 Guests',
            status: 'Confirmed',
            details: JSON.stringify({
                title: saonaExcursion?.title || 'Saona Island Paradise',
                guests: 2,
                pickupLocation: 'Lobby',
                pricePerPerson: 89
            })
        },
        {
            type: 'excursion',
            serviceType: 'excursion',
            excursionId: buggyExcursion?.id,
            guestName: 'Chris Evans',
            email: 'chris@example.com',
            phone: '+15550402',
            date: getDate(16),
            total: 150.00, // 2 * $75
            pax: '2 Guests',
            status: 'Confirmed',
            details: JSON.stringify({
                title: buggyExcursion?.title || 'Buggy Adventure Tour',
                guests: 2,
                pickupLocation: 'Lobby',
                shift: 'Morning (8:00 AM)',
                pricePerPerson: 75
            })
        }
    ];

    for (const booking of serviceBookings) {
        await prisma.serviceBooking.create({ data: booking });
    }

    console.log('Seeding finished (Legacy Models).');

    // --------------------------------------------------
    // SEED FINANCIAL COMMAND CENTER DATA
    // --------------------------------------------------
    console.log('Seeding Financial Command Center data...');

    // 1. Providers
    const providers = [
        {
            name: 'Saona Tours S.R.L.',
            type: 'VENDOR',
            email: 'bookings@saonatours.com',
            defaultCostMethod: 'FIXED_NET_RATE',
            defaultCostValue: 50.00 // We pay them $50 per person
        },
        {
            name: 'Maria Housekeeping',
            type: 'STAFF',
            email: 'maria@sweethome.com',
            defaultCostMethod: 'PERCENTAGE_COMMISSION',
            defaultCostValue: 0.10 // 10% commission on laundry
        },
        {
            name: 'Booking.com',
            type: 'PLATFORM',
            email: 'finance@booking.com'
        },
        {
            name: 'Expedia',
            type: 'PLATFORM',
            email: 'finance@expedia.com'
        },
        {
            name: 'Pedro Transport',
            type: 'VENDOR',
            email: 'pedro@transport.com',
            defaultCostMethod: 'FIXED_NET_RATE',
            defaultCostValue: 30.00 // We pay $30 per transfer
        }
    ];

    const createdProviders: any = {};
    for (const p of providers) {
        const provider = await prisma.provider.create({
            data: {
                name: p.name,
                type: p.type,
                email: p.email,
                defaultCostMethod: p.defaultCostMethod,
                defaultCostValue: p.defaultCostValue
            }
        });
        createdProviders[p.name] = provider;
        console.log(`Created provider: ${p.name}`);
    }

    // 2. Bookings (Unified Model)

    // Booking 1: Direct Room Booking (High Margin)
    const booking1 = await prisma.booking.create({
        data: {
            guestName: 'Juan Perez',
            guestEmail: 'juan@gmail.com',
            date: getDate(2),
            status: 'CONFIRMED',
            source: 'DIRECT',
            lineItems: {
                create: [
                    {
                        type: 'ACCOMMODATION',
                        description: 'Deluxe King Room - 3 Nights',
                        quantity: 1,
                        unitPrice: 450.00, // Gross Price
                        isTaxable: true,
                        taxRate: 0.18,
                        taxAmount: 450.00 * 0.18, // $81 Tax
                        totalGross: 450.00,

                        // Cost: 0 (We own the room)
                        costMethod: 'FIXED_NET_RATE',
                        costValue: 0,
                        totalCost: 0
                    }
                ]
            }
        }
    });
    // Update totals for Booking 1
    await prisma.booking.update({
        where: { id: booking1.id },
        data: {
            totalGross: 450.00,
            totalTax: 81.00,
            totalNet: 450.00 - 81.00 - 0 // $369 Net Profit
        }
    });

    // Booking 2: Booking.com Room + Airport Transfer (Vendor)
    const booking2 = await prisma.booking.create({
        data: {
            guestName: 'Sarah Connor',
            guestEmail: 'sarah@skynet.com',
            date: getDate(5),
            status: 'CONFIRMED',
            source: 'BOOKING_COM',
            lineItems: {
                create: [
                    {
                        type: 'ACCOMMODATION',
                        description: 'Queen Garden View - 5 Nights',
                        quantity: 1,
                        unitPrice: 500.00,
                        isTaxable: true,
                        taxRate: 0.18,
                        taxAmount: 500.00 * 0.18, // $90 Tax
                        totalGross: 500.00,
                        costMethod: 'FIXED_NET_RATE',
                        costValue: 0,
                        totalCost: 0
                    },
                    {
                        type: 'TRANSPORT',
                        description: 'Airport Transfer (Arrival)',
                        quantity: 1,
                        unitPrice: 45.00,
                        isTaxable: false, // Transport often exempt or different logic, keeping simple
                        taxRate: 0,
                        taxAmount: 0,
                        totalGross: 45.00,

                        // Cost: We owe Pedro Transport
                        providerId: createdProviders['Pedro Transport'].id,
                        costMethod: 'FIXED_NET_RATE',
                        costValue: 30.00,
                        totalCost: 30.00
                    }
                ]
            }
        }
    });
    // Update totals for Booking 2
    await prisma.booking.update({
        where: { id: booking2.id },
        data: {
            totalGross: 545.00,
            totalTax: 90.00,
            totalNet: 545.00 - 90.00 - 30.00 // $425 Net Profit
        }
    });

    // Booking 3: Excursion (Vendor) + Laundry (Staff Commission)
    const booking3 = await prisma.booking.create({
        data: {
            guestName: 'Mike Ross',
            guestEmail: 'mike@pearson.com',
            date: getDate(10),
            status: 'CONFIRMED',
            source: 'DIRECT',
            lineItems: {
                create: [
                    {
                        type: 'EXCURSION',
                        description: 'Saona Island Paradise (2 Pax)',
                        quantity: 2,
                        unitPrice: 89.00, // $178 Total
                        isTaxable: true,
                        taxRate: 0.18,
                        taxAmount: 178.00 * 0.18, // $32.04 Tax
                        totalGross: 178.00,

                        // Cost: We owe Saona Tours
                        providerId: createdProviders['Saona Tours S.R.L.'].id,
                        costMethod: 'FIXED_NET_RATE',
                        costValue: 50.00, // $50 per person
                        totalCost: 100.00 // $100 Total Cost
                    },
                    {
                        type: 'SERVICE',
                        description: 'Laundry Service (5 Bags)',
                        quantity: 5,
                        unitPrice: 15.00, // $75 Total
                        isTaxable: true,
                        taxRate: 0.18,
                        taxAmount: 75.00 * 0.18, // $13.50 Tax
                        totalGross: 75.00,

                        // Cost: Maria gets 10% commission
                        providerId: createdProviders['Maria Housekeeping'].id,
                        costMethod: 'PERCENTAGE_COMMISSION',
                        costValue: 0.10,
                        totalCost: 75.00 * 0.10 // $7.50 Cost
                    }
                ]
            }
        }
    });
    // Update totals for Booking 3
    await prisma.booking.update({
        where: { id: booking3.id },
        data: {
            totalGross: 253.00,
            totalTax: 45.54,
            totalNet: 253.00 - 45.54 - 107.50 // $99.96 Net Profit
        }
    });

    // 3. Monthly Expenses (Booking.com Invoice)
    await prisma.monthlyExpense.create({
        data: {
            providerId: createdProviders['Booking.com'].id,
            month: getDate(1), // Current month
            amount: 150.00, // Monthly commission invoice
            ncf: 'B0100000001',
            description: 'Commission Invoice for October'
        }
    });

    console.log('Financial Command Center seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
