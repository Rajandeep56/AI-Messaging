#!/bin/bash

echo "🚀 Deploying Existing Builds to Firebase App Distribution..."
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

# Check for existing builds
echo "📱 Checking existing builds..."

# Check for AAB file
if [ -f "app-release.aab" ]; then
    echo "✅ Found AAB file: app-release.aab"
    echo ""
    echo "🔧 Options for AAB deployment:"
    echo "   1. Google Play Store (recommended)"
    echo "   2. Firebase App Distribution (requires Google Play linking)"
    echo ""
    echo "📋 To deploy to Google Play Store:"
    echo "   - Go to: https://play.google.com/console"
    echo "   - Create new app or use existing"
    echo "   - Upload: app-release.aab"
    echo ""
    echo "📋 To deploy to Firebase App Distribution:"
    echo "   - Link Google Play account first"
    echo "   - Then run: firebase appdistribution:distribute app-release.aab --app 1:965784009156:android:de800004fd88a35b410c91 --groups testers"
    echo ""
fi

# Check for APK file
if [ -f "app-release.apk" ]; then
    echo "✅ Found APK file: app-release.apk"
    echo ""
    echo "🚀 Deploying APK to Firebase App Distribution..."
    firebase appdistribution:distribute app-release.apk \
        --app 1:965784009156:android:de800004fd88a35b410c91 \
        --groups testers \
        --release-notes "Chatter App v1.0.0 - Latest Update"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 APK deployment successful!"
        echo "📧 Testers will receive email invitations"
        echo "📊 Monitor at: https://console.firebase.google.com/project/ai-msging/appdistribution"
    else
        echo "❌ APK deployment failed"
    fi
else
    echo "📥 No APK file found. Checking for latest build..."
    
    # Check latest build status
    BUILD_INFO=$(eas build:list --platform android --limit 1 --json --non-interactive)
    BUILD_STATUS=$(echo "$BUILD_INFO" | jq -r '.[0].status')
    
    if [ "$BUILD_STATUS" = "FINISHED" ]; then
        echo "✅ Latest build completed. Downloading APK..."
        BUILD_URL=$(echo "$BUILD_INFO" | jq -r '.[0].artifacts.buildUrl')
        
        if curl -L -o app-release.apk "$BUILD_URL"; then
            echo "✅ APK downloaded successfully"
            echo ""
            echo "🚀 Deploying APK to Firebase App Distribution..."
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
            fi
        else
            echo "❌ Failed to download APK"
        fi
    else
        echo "⏳ Latest build status: $BUILD_STATUS"
        echo "Please wait for the build to complete and run this script again."
    fi
fi

echo ""
echo "📋 Summary:"
echo "   - AAB file: Ready for Google Play Store"
echo "   - APK file: Ready for Firebase App Distribution (when available)"
echo "   - Firebase project: ai-msging"
echo "   - App ID: 1:965784009156:android:de800004fd88a35b410c91" 