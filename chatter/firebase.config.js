import app from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

// Firebase configuration is handled by GoogleService-Info.plist for iOS
// and google-services.json for Android

// Initialize Analytics
analytics().setAnalyticsCollectionEnabled(true);

// Initialize Crashlytics
crashlytics().setCrashlyticsCollectionEnabled(true);

export { app, analytics, crashlytics };
export default app; 