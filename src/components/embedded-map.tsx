
'use client';

import Image from 'next/image';
import Link from 'next/link';

interface EmbeddedMapProps {
  mapUrl: string;
  origin?: string;
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
  zoom?: number;
}

// Function to extract direction parameters from the URL
const getDirectionsFromUrl = (url: string): { origin: string | null; destination: string | null; mode: string | null } => {
  try {
    const urlObj = new URL(url);
    
    // Handles URLs like: /maps/dir/Origin/Destination
    if (urlObj.pathname.includes('/dir/')) {
      const parts = urlObj.pathname.split('/dir/')[1].split('/');
      if (parts.length >= 2) {
        return {
          origin: decodeURIComponent(parts[0].replace(/\+/g, ' ')),
          destination: decodeURIComponent(parts[1].replace(/\+/g, ' ')),
          mode: urlObj.searchParams.get('travelmode'),
        };
      }
    }

    // Handles URLs like: /maps/dir/?api=1&origin=...&destination=...
    const origin = urlObj.searchParams.get('origin');
    const destination = urlObj.searchParams.get('destination');
    if (origin && destination) {
        return {
          origin,
          destination,
          mode: urlObj.searchParams.get('travelmode'),
        };
    }

    return { origin: null, destination: null, mode: null };
    
  } catch (e) {
    console.error("Error parsing map URL:", e);
    return { origin: null, destination: null, mode: null };
  }
};


// Function to extract the query from the Google Maps URL
const getPlaceQueryFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    // Handle URLs like: https://www.google.com/maps/place/Texaco+Villas+Bávaro/@18.666...
    if (urlObj.pathname.startsWith('/maps/place/')) {
      const pathParts = urlObj.pathname.split('/');
      // pathParts will be ['', 'maps', 'place', 'Texaco+Villas+Bávaro', '@18.66...']
      if (pathParts.length > 3) {
        return decodeURIComponent(pathParts[3].replace(/\+/g, ' '));
      }
    }
    // Handle search URLs
    if (urlObj.pathname.includes('/maps/search/')) {
        const parts = urlObj.pathname.split('/maps/search/');
        if (parts[1]) {
            return decodeURIComponent(parts[1].split('/')[0]);
        }
    }
    // Fallback for simple query parameter
    return urlObj.searchParams.get('q');
  } catch (error) {
    console.error("Invalid map URL", error);
    return null;
  }
}

export default function EmbeddedMap({ mapUrl, origin: propOrigin, mode: propMode = 'driving', zoom = 15 }: EmbeddedMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is missing.");
    return <div className="text-red-500 text-xs">Map cannot be displayed: Missing API Key.</div>;
  }
  
  let embedUrl;
  const directions = getDirectionsFromUrl(mapUrl);

  let destination: string;

  if (directions.origin && directions.destination) {
    const origin = directions.origin;
    destination = directions.destination;
    const mode = directions.mode || propMode;
    embedUrl = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&zoom=${zoom}`;
  } else {
    destination = getPlaceQueryFromUrl(mapUrl) || "Sweet Home Punta Cana";
    if (propOrigin) {
      embedUrl = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(propOrigin)}&destination=${encodeURIComponent(destination)}&mode=${propMode}&zoom=${zoom}`;
    } else {
      embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(destination)}&zoom=${zoom}`;
    }
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden border">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={embedUrl}
      ></iframe>
    </div>
  );
}
