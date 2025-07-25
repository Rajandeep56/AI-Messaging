#!/bin/bash

echo "🆓 Deploying APK to Firebase App Distribution (No Google Play Store)"
echo ""

while true; do
    echo "📱 Checking APK build status..."
    
    BUILD_INFO=$(eas build:list --platform android --limit 1 --json --non-interactive)
    BUILD_STATUS=$(echo "$BUILD_INFO" | jq -r '.[0].status')
    
    if [ "$BUILD_STATUS" = "FINISHED" ]; then
        echo "✅ APK build completed! Downloading..."
        
        BUILD_URL=$(echo "$BUILD_INFO" | jq -r '.[0].artifacts.buildUrl')
        
        if curl -L -o app-release.apk "$BUILD_URL"; then
            echo "✅ APK downloaded successfully"
            echo ""
            echo "🚀 Deploying to Firebase App Distribution (Free)..."
            
            firebase appdistribution:distribute app-release.apk \
                --app 1:965784009156:android:de800004fd88a35b410c91 \
                --groups testers \
                --release-notes "Chatter App v1.0.0 - Free Firebase Distribution"
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "🎉 Deployment successful!"
                echo "📧 Testers will receive email invitations"
                echo "📊 Monitor at: https://console.firebase.google.com/project/ai-msging/appdistribution"
                echo ""
                echo "🆓 This is completely free - no Google Play Store required!"
                break
            else
                echo "❌ Deployment failed"
                break
            fi
        else
            echo "❌ Failed to download APK"
            break
        fi
    else
        if [ "$BUILD_STATUS" = "IN_PROGRESS" ]; then
            echo "🔨 APK build in progress... (should complete soon)"
        elif [ "$BUILD_STATUS" = "IN_QUEUE" ]; then
            QUEUE_POS=$(echo "$BUILD_INFO" | jq -r '.[0].queuePosition // "unknown"')
            echo "⏳ APK build in queue: Position $QUEUE_POS"
        else
            echo "⏳ APK build status: $BUILD_STATUS"
        fi
        
        echo "⏰ Waiting 30 seconds before checking again..."
        sleep 30
    fi
done 