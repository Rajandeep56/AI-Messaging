// Environment Configuration Example
// Copy this file to env.ts and fill in your actual values

export const ENV_CONFIG = {
  // Firebase Configuration
  FIREBASE_API_KEY: 'your-firebase-api-key',
  FIREBASE_AUTH_DOMAIN: 'your-project.firebaseapp.com',
  FIREBASE_PROJECT_ID: 'your-project-id',
  FIREBASE_STORAGE_BUCKET: 'your-project.appspot.com',
  FIREBASE_MESSAGING_SENDER_ID: 'your-sender-id',
  FIREBASE_APP_ID: 'your-app-id',

  // OpenAI Configuration
  OPENAI_API_KEY: 'your-openai-api-key',

  // App Configuration
  APP_NAME: 'Chatter',
  APP_VERSION: '1.0.0',
};

// Instructions:
// 1. Copy this file to config/env.ts
// 2. Replace the placeholder values with your actual API keys
// 3. Never commit the actual env.ts file to version control
// 4. Use environment variables in production 