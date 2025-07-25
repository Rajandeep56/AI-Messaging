#!/bin/bash

echo "🚀 Deploying Finished AAB Build to Firebase App Distribution"
echo ""

# Check if AAB file exists
if [ ! -f "app-release.aab" ]; then
    echo "❌ AAB file not found. Downloading from EAS..."
    curl -L -o app-release.aab "https://expo.dev/artifacts/eas/tda4pib5cJeEoAv4PG6JgX.aab"
fi

if [ -f "app-release.aab" ]; then
    echo "✅ Found AAB file: app-release.aab"
    echo ""
    echo "🚀 Deploying to Firebase App Distribution..."
    
    firebase appdistribution:distribute app-release.aab \
        --app 1:965784009156:android:de800004fd88a35b410c91 \
        --groups testers \
        --release-notes "Chatter App v1.0.0 - Call Feature Update"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Deployment successful!"
        echo "📧 Testers will receive email invitations"
        echo "📊 Monitor at: https://console.firebase.google.com/project/ai-msging/appdistribution"
    else
        echo ""
        echo "❌ Deployment failed. Make sure:"
        echo "   1. Google Play account is linked in Firebase"
        echo "   2. App exists in Google Play Console with package name: com.anonymous.chatter"
        echo "   3. You're logged into Firebase CLI"
    fi
else
    echo "❌ Failed to download AAB file"
fi 