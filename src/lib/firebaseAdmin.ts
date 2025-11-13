
import 'server-only';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Decode whole JSON from a single base64 env var (bullet-proof against newline issues)
function getCreds() {
  const b64 = process.env.SERVICE_ACCOUNT_BASE64;
  if (!b64) return null;
  const json = Buffer.from(b64, 'base64').toString('utf8');
  return JSON.parse(json);
}

if (!getApps().length) {
  const creds = getCreds();
  initializeApp(
    creds ? { credential: cert(creds), projectId: creds.project_id } : {}
  );
}

export const adminDb = getFirestore();
export const runtime = 'nodejs';
