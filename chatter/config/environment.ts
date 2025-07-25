// Environment Configuration
// Copy this to your .env file or use these values directly

export const ENVIRONMENT = {
  // Firebase Configuration
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDRRVZBA4Fw2PY-a99Qn0MCOOVzuBxbzIA',
  FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'ai-msging.firebaseapp.com',
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'ai-msging',
  FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ai-msging.firebasestorage.app',
  FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '965784009156',
  FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:965784009156:android:de800004fd88a35b410c91',

  // AI Configuration (Free Service)
  HUGGING_FACE_API_KEY: process.env.EXPO_PUBLIC_HUGGING_FACE_API_KEY || '', // Optional for free tier

  // OpenAI Configuration (Legacy - can be removed)
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-openai-api-key-here',

  // App Configuration
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'Chatter',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
};

// Instructions:
// 1. Create a .env file in the chatter directory
// 2. Add the following variables with your actual values:
/*
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDRRVZBA4Fw2PY-a99Qn0MCOOVzuBxbzIA
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-msging.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ai-msging
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-msging.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=965784009156
EXPO_PUBLIC_FIREBASE_APP_ID=1:965784009156:android:de800004fd88a35b410c91
EXPO_PUBLIC_HUGGING_FACE_API_KEY=your-hugging-face-token (optional - for higher rate limits)
*/ 