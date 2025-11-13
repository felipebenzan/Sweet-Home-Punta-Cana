

export interface Room {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  bedding: 'California King' | 'King' | 'Queen' | 'Full';
  capacity: number;
  price: number;
  image: string;
  amenities: string[];
  gallery?: string[];
  rating?: {
    score: number;
    review: string;
  };
  inventoryUnits?: number;
  cancellationPolicy?: string;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  text: string;
  rating: number;
}

export interface Excursion {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  icon?: string;
  price: {
    adult: number;
  };
  inclusions: string[];
  practicalInfo: {
    departure: string;
    duration: string;
    pickup: string;
    pickupMapLink?: string;
    notes: string[];
  };
  gallery: string[];
  promo?: {
    headline: string;
    subheadline: string;
  };
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

export interface Metadata {
  title: string;
  description: string;
  openGraph?: {
    title: string;
    description: string;
    images: { url: string }[];
  };
}

// --------------------------------------------------
// NEW UNIFIED BOOKING TYPES
// --------------------------------------------------

export type BookingStatus = "draft" | "awaiting_payment" | "confirmed" | "canceled";

export interface GuestInfo {
  fullName: string;
  email: string;
  phone?: string;
}

export interface ServiceBookingDetailsLaundry {
  bagsOrLoadCount: number;
  specialNotes?: string;
}

export interface ServiceBookingDetailsAirport {
  direction: "airport_to_guesthouse" | "guesthouse_to_airport" | "round_trip";
  flightNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string; // ISO8601 string
}

export interface ServiceBookingDetailsExcursion {
  excursionId: string;
  excursionName: string;
  date: string; // ISO8601 date or datetime
  adults: number;
  children: number;
}

export interface CreateBookingDraftRequest {
  bookingKind: "room" | "service";
  guestInfo: GuestInfo;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  serviceType?: "laundry" | "airport_transfer" | "excursion";
  serviceDetails?: any;
}

export interface CreateBookingDraftResponse {
  bookingId: string;
  totalDue: number;
  currency: "USD";
}


// Legacy types to be phased out - kept for admin panel compatibility for now
export interface Reservation {
  id: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  roomName: string;
  roomId: string;
  numberOfGuests: number;
  totalPrice: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  createdAt: string;
  [key: string]: any;
}

export interface ServiceBooking {
  id: string;
  guestName: string;
  email?: string;
  phone?: string;
  serviceType: string;
  date?: string;
  time?: string;
  qty?: number;
  createdAt: string;
  total?: number;
  excursionId?: string;
  serviceId?: string;
  accommodation?: string; 
  bookingId?: string; 
  [key: string]: any; 
}


export interface BookingDetails {
  confirmationId: string;
  rooms: { id: string, name: string, bedding: string, price: number, image: string, capacity: number, slug: string }[];
  dates: { from: string; to: string };
  guests: number;
  nights: number;
  totalPrice: number;
  guestInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  },
  airportPickup?: {
    tripType: 'one-way' | 'round-trip';
    price: number;
    airline?: string;
    flightNumber?: string;
    arrivalDate?: string;
    returnDate?: string;
    returnFlightNumber?: string;
    airport?: string;
  }
}
