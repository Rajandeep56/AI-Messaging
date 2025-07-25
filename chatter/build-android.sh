#!/bin/bash

# 🔥 Android Build Script for Firebase App Distribution
# This script builds the Android APK for free distribution

echo "🔥 Building Android APK for Firebase App Distribution..."

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

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed!"

# Build Android APK
print_status "Building Android APK..."
npx expo run:android --variant release

if [ $? -ne 0 ]; then
    print_error "Failed to build Android APK"
    exit 1
fi

print_success "Android APK built successfully!"

# Check if APK exists
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    print_success "APK found at: $APK_PATH"
    
    # Get APK size
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    print_status "APK size: $APK_SIZE"
    
    # Distribute via Firebase App Distribution
    print_status "Distributing via Firebase App Distribution..."
    firebase appdistribution:distribute "$APK_PATH" \
        --app ai-msging \
        --groups testers \
        --release-notes-file release_notes.txt
    
    if [ $? -ne 0 ]; then
        print_error "Failed to distribute via Firebase App Distribution"
        exit 1
    fi
    
    print_success "App distributed successfully!"
else
    print_error "APK not found at expected location: $APK_PATH"
    exit 1
fi

echo ""
print_success "🎉 Android build and distribution completed!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. 📱 Testers will receive email invitations"
echo "2. 📊 Monitor distribution in Firebase Console"
echo "3. 🔍 Check crash reports and analytics"
echo ""
print_success "Your app is now available for testing! 🚀" 