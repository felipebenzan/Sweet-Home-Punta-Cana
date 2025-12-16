'use server';

export async function debugEnvVars() {
    const publicId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const privateId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_CLIENT_SECRET;

    return {
        serverSide: {
            NEXT_PUBLIC_PAYPAL_CLIENT_ID: publicId ? `${publicId.slice(0, 5)}...` : 'undefined',
            PAYPAL_CLIENT_ID: privateId ? `${privateId.slice(0, 5)}...` : 'undefined',
            PAYPAL_CLIENT_SECRET: secret ? 'Yes (Hidden)' : 'Missing',
            NODE_ENV: process.env.NODE_ENV,
        }
    };
}
