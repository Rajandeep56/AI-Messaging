#!/bin/bash

echo "🚀 Deploying APK to Firebase App Distribution..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged into Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase. Please login first:"
    echo "   firebase login"
    exit 1
fi

echo "✅ Logged into Firebase"
echo ""

# Wait for the build to complete and download APK
echo "📱 Checking for latest APK build..."
BUILD_INFO=$(eas build:list --platform android --limit 1 --json --non-interactive)
BUILD_STATUS=$(echo "$BUILD_INFO" | jq -r '.[0].status')

if [ "$BUILD_STATUS" = "FINISHED" ]; then
    echo "✅ Latest build completed successfully"
    
    # Download APK
    BUILD_URL=$(echo "$BUILD_INFO" | jq -r '.[0].artifacts.buildUrl')
    echo "📥 Downloading APK from: $BUILD_URL"
    
    if curl -L -o app-release.apk "$BUILD_URL"; then
        echo "✅ APK downloaded successfully"
        
        # Deploy to Firebase App Distribution
        echo "🚀 Deploying to Firebase App Distribution..."
        firebase appdistribution:distribute app-release.apk \
            --app 1:965784009156:android:de800004fd88a35b410c91 \
            --groups testers \
            --release-notes "Chatter App v1.0.0 - Latest Update"
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 Deployment successful!"
            echo "📧 Testers will receive email invitations"
            echo "📊 Monitor at: https://console.firebase.google.com/project/ai-msging/appdistribution"
        else
            echo "❌ Deployment failed"
            exit 1
        fi
    else
        echo "❌ Failed to download APK"
        exit 1
    fi
else
    echo "⏳ Build is still in progress. Status: $BUILD_STATUS"
    echo "Please wait for the build to complete and run this script again."
    exit 1
fi 