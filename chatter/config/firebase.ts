import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { ENVIRONMENT } from './environment';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: ENVIRONMENT.FIREBASE_API_KEY,
  authDomain: ENVIRONMENT.FIREBASE_AUTH_DOMAIN,
  projectId: ENVIRONMENT.FIREBASE_PROJECT_ID,
  storageBucket: ENVIRONMENT.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENVIRONMENT.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENVIRONMENT.FIREBASE_APP_ID
};

// Initialize Firebase only if no apps exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 