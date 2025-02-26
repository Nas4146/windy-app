import admin from 'firebase-admin';
import { env } from '$env/dynamic/private';

if (!env.VITE_FIREBASE_PROJECT_ID || !env.VITE_CLIENT_EMAIL || !env.VITE_FIREBASE_PRIVATE_KEY) {
  throw new Error(
    'Missing Firebase Admin configuration. Required environment variables: ' +
    'VITE_FIREBASE_PROJECT_ID, VITE_CLIENT_EMAIL, VITE_FIREBASE_PRIVATE_KEY'
  );
}

const serviceAccount = {
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: env.VITE_CLIENT_EMAIL,
  privateKey: env.VITE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

// Add error handling for missing environment variables
if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  throw new Error('Missing required Firebase Admin configuration. Check your environment variables.');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
}

export const adminDB = admin.firestore();