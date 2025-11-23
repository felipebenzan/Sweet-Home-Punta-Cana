
import { getApps, initializeApp, getApp, FirebaseApp } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';
import * as serviceAccount from '../../service-account.json';

// Singleton pattern to avoid re-initializing the app on every server-side render.
let adminInstance: {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} | null = null;

// This function is for SERVER-SIDE use only.
export async function initializeFirebaseServer(): Promise<{
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}> {
  if (adminInstance) {
    return adminInstance;
  }

  const appIsInitialized = getApps().length > 0;

  const firebaseApp = appIsInitialized
    ? getApp()
    : initializeApp({ credential: credential.cert(serviceAccount as any) });

  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  adminInstance = { firebaseApp, auth, firestore };

  return adminInstance;
}
