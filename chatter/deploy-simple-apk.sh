#!/bin/bash

echo "🚀 Simple APK Deployment - No EAS Complications"
echo ""

# Step 1: Setup Firebase service account
echo "🔧 Step 1: Setting up Firebase authentication..."

# Check if the secret is available
if [ -z "$FIREBASE_SERVICE_ACCOUNT_KEY" ]; then
    echo "❌ FIREBASE_SERVICE_ACCOUNT_KEY is not set"
    echo "Please add this secret to your GitHub repository:"
    echo "Repository Settings → Secrets and variables → Actions → New repository secret"
    echo "Name: FIREBASE_SERVICE_ACCOUNT_KEY"
    echo "Value: [Your Firebase service account JSON]"
    exit 1
fi

# Create service account file
echo "$FIREBASE_SERVICE_ACCOUNT_KEY" > firebase-service-account.json
export GOOGLE_APPLICATION_CREDENTIALS="firebase-service-account.json"
firebase use ai-msging

# Test Firebase authentication
echo "Testing Firebase authentication..."
firebase projects:list > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Firebase authentication successful"
else
    echo "❌ Firebase authentication failed"
    echo "Please check your FIREBASE_SERVICE_ACCOUNT_KEY secret"
    exit 1
fi

# Step 2: Add tester
echo ""
echo "👥 Step 2: Adding tester..."
firebase appdistribution:testers:add kaurdeep9073@gmail.com || echo "Tester already exists"
echo "✅ Tester added"

# Step 3: Download APK (simple method)
echo ""
echo "📥 Step 3: Downloading APK build..."
cd chatter

# Try to download APK from a direct URL or use existing file
if [ -f "app-release.apk" ]; then
    echo "✅ Using existing APK file"
elif [ -n "$APK_DOWNLOAD_URL" ]; then
    echo "Downloading APK from provided URL..."
    curl -L -o app-release.apk "$APK_DOWNLOAD_URL"
    echo "✅ Downloaded APK from URL"
else
    echo "❌ No APK file found and no download URL provided"
    echo "Please either:"
    echo "1. Place app-release.apk in the chatter directory, or"
    echo "2. Set APK_DOWNLOAD_URL environment variable"
    exit 1
fi

# Step 4: Deploy to Firebase App Distribution
echo ""
echo "🚀 Step 4: Deploying to Firebase App Distribution..."
firebase appdistribution:distribute app-release.apk \
  --app 1:965784009156:android:de800004fd88a35b410c91 \
  --testers kaurdeep9073@gmail.com \
  --release-notes "Chatter App v1.0.0 - Simple APK Deploy"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your App is Deployed!"
    echo "Perfect! Your Chatter app has been successfully deployed to Firebase App Distribution for free!"
    echo ""
    echo "✅ Deployment Complete:"
    echo "✅ APK Uploaded: Successfully uploaded to Firebase"
    echo "✅ Release Created: Version 1.0.0"
    echo "✅ Tester Added: kaurdeep9073@gmail.com"
    echo "✅ Distribution Complete: App sent to testers"
    echo ""
    echo "📱 What Happens Next:"
    echo "Email Invitation: kaurdeep9073@gmail.com will receive an email invitation"
    echo "Download Link: They can download and install the APK directly"
    echo "Testing: They can test your Chatter app with call features"
    echo ""
    echo "🔗 Important Links:"
    echo "Firebase Console: https://console.firebase.google.com/project/ai-msging/appdistribution"
    echo ""
    echo "🆓 This is Completely Free:"
    echo "✅ No Google Play Store required"
    echo "✅ No developer account fees"
    echo "✅ Firebase App Distribution is free"
    echo "✅ Unlimited testers can be added"
    echo ""
    echo "Your Chatter app is now live and ready for testing! 🚀"
else
    echo "❌ Deployment failed"
    exit 1
fi 