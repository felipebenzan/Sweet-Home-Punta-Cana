declare namespace NodeJS {
    interface ProcessEnv {
        // Database
        DATABASE_URL: string;

        // PayPal
        NEXT_PUBLIC_PAYPAL_CLIENT_ID: string;
        PAYPAL_CLIENT_SECRET: string;
        PAYPAL_API_BASE: string; // 'https://api-m.sandbox.paypal.com' or 'https://api-m.paypal.com'

        // Beds24
        BEDS24_API_KEY: string;
        BEDS24_PROP_KEY: string; // Code uses PROP_KEY, user asked for PROP_ID. Keeping PROP_KEY as per code.

        // Google Maps
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;

        // Email
        RESEND_API_KEY: string;

        // Node Environment
        NODE_ENV: 'development' | 'production' | 'test';
    }
}
