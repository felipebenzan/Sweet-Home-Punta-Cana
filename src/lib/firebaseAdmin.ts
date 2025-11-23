import 'server-only';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore | undefined = undefined;

console.log('[firebaseAdmin] Attempting to initialize Firebase Admin SDK...');

function getServiceAccount() {
  const base64 = process.env.SERVICE_ACCOUNT_BASE64;
  if (!base64) {
    console.warn('[firebaseAdmin] WARNING: SERVICE_ACCOUNT_BASE64 env var not set. Firestore will be UNAVAILABLE in this environment.');
    return undefined;
  }
  try {
    const jsonString = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('[firebaseAdmin] CRITICAL: Failed to parse service account JSON.', error);
    return undefined;
  }
}

const serviceAccount = getServiceAccount();

if (serviceAccount) {
  let app: App;
  if (getApps().length === 0) {
    console.log('[firebaseAdmin] Initializing new Firebase app with service account.');
    app = initializeApp({ credential: cert(serviceAccount) });
  } else {
    console.log('[firebaseAdmin] Using existing Firebase app.');
    app = getApps()[0];
  }
  
  try {
    adminDb = getFirestore(app);
    console.log('[firebaseAdmin] Firestore (adminDb) initialized successfully.');
  } catch(error) {
    console.error('[firebaseAdmin] CRITICAL: Failed to get Firestore instance.', error);
  }

} else {
  console.log('[firebaseAdmin] Skipping Firebase Admin initialization. No service account found.');
}

export { adminDb };
