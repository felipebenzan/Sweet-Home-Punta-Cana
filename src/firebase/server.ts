
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as serviceAccount from '../../service-account.json';

const serviceAccountCred = serviceAccount as any;

// Check if the app is already initialized to prevent errors
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccountCred)
  });
  console.log('Firebase Admin SDK Initialized.');
}

// Export the initialized services directly
const adminAuth = getAuth();
const adminFirestore = getFirestore();

export { adminAuth, adminFirestore };
