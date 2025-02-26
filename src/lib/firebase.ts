import { initializeApp, getApps } from 'firebase/app';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

// Initialize Firebase only if it hasn't been initialized already
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// Only initialize analytics in the browser
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

console.log('Firebase initialized with config:', {
  ...firebaseConfig,
  apiKey: '***'  // Hide sensitive data
});

// Test Firestore connection
const testConnection = async () => {
  try {
      const testDoc = doc(db, '_test_connection', 'test');
      await setDoc(testDoc, { timestamp: new Date() }, { merge: true });
      console.log('Firestore connection successful');
      await deleteDoc(testDoc); // Clean up test document
  } catch (error) {
      console.error('Firestore connection error:', error);
  }
};

testConnection();