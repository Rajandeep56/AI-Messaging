#!/bin/bash

# 🔥 Firebase Free Distribution Deployment Script
# This script handles the complete deployment process for FREE

echo "🔥 Starting Firebase Free Distribution Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Verify Firebase setup
print_status "Step 1: Verifying Firebase setup..."
./test-firebase-setup.sh

if [ $? -ne 0 ]; then
    print_error "Firebase setup verification failed"
    exit 1
fi

print_success "Firebase setup verified!"

# Step 2: Check if APK exists
print_status "Step 2: Checking for existing APK..."
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"

if [ -f "$APK_PATH" ]; then
    print_success "APK found at: $APK_PATH"
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    print_status "APK size: $APK_SIZE"
    
    # Ask user if they want to rebuild
    echo ""
    read -p "Do you want to rebuild the APK? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        REBUILD=true
    else
        REBUILD=false
    fi
else
    print_warning "No APK found. Will build new APK."
    REBUILD=true
fi

# Step 3: Build APK if needed
if [ "$REBUILD" = true ]; then
    print_status "Step 3: Building Android APK..."
    echo ""
    print_warning "This step requires Android Studio and Android SDK to be installed."
    print_warning "If you don't have them installed, please install Android Studio first."
    echo ""
    read -p "Do you have Android Studio installed? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Building APK with Expo..."
        npx expo run:android --variant release
        
        if [ $? -ne 0 ]; then
            print_error "Failed to build APK"
            echo ""
            print_warning "Alternative: You can build the APK manually and place it at:"
            print_warning "$APK_PATH"
            echo ""
            read -p "Press Enter when you have the APK ready..."
        fi
    else
        print_warning "Please install Android Studio and try again."
        print_warning "Download from: https://developer.android.com/studio"
        exit 1
    fi
fi

# Step 4: Verify APK exists
print_status "Step 4: Verifying APK..."
if [ ! -f "$APK_PATH" ]; then
    print_error "APK not found at: $APK_PATH"
    print_warning "Please build the APK first or place it at the correct location."
    exit 1
fi

print_success "APK verified!"

# Step 5: Distribute via Firebase App Distribution
print_status "Step 5: Distributing via Firebase App Distribution..."
echo ""

# Get tester count
TESTER_COUNT=$(grep -v '^#' testers.txt | grep -v '^$' | wc -l)
print_status "Distributing to $TESTER_COUNT testers..."

# Distribute the APK
firebase appdistribution:distribute "$APK_PATH" \
    --app 1:965784009156:android:de800004fd88a35b410c91 \
    --groups testers \
    --release-notes-file release_notes.txt

if [ $? -ne 0 ]; then
    print_error "Failed to distribute via Firebase App Distribution"
    exit 1
fi

print_success "App distributed successfully!"

# Step 6: Summary
echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
echo "📋 Summary:"
echo ""
echo "✅ Firebase CLI: Installed and configured"
echo "✅ Project Access: ai-msging"
echo "✅ Android App: 1:965784009156:android:de800004fd88a35b410c91"
echo "✅ APK Built: $APK_PATH"
echo "✅ Testers: $TESTER_COUNT"
echo "✅ Distribution: Completed"
echo ""
echo "📱 Next Steps:"
echo ""
echo "1. 📧 Testers will receive email invitations"
echo "2. 📱 They can download the app from the email link"
echo "3. 📊 Monitor distribution in Firebase Console"
echo "4. 🔍 Check crash reports and analytics"
echo ""
echo "🌐 Firebase Console:"
echo "   https://console.firebase.google.com/project/ai-msging/appdistribution"
echo ""
print_success "Your app is now available for FREE testing! 🚀" 