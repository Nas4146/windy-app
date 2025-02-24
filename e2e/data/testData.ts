import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

export async function setupTestData() {
  try {
    console.log('Initializing Firebase with config:', { ...firebaseConfig, apiKey: '***' });
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Clear existing test data
    const boardsRef = collection(db, 'boards');
    const existingBoards = await getDocs(boardsRef);
    for (const doc of existingBoards.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Add test board
    await addDoc(boardsRef, {
      title: 'Test Board',
      columns: [
        { id: '1', title: 'To Do', order: 0 },
        { id: '2', title: 'In Progress', order: 1 },
        { id: '3', title: 'Done', order: 2 }
      ]
    });
    
    console.log('Test data setup complete');
  } catch (error) {
    console.error('Error setting up test data:', error);
    throw error;
  }
}