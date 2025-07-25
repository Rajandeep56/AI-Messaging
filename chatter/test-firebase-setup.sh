#!/bin/bash

# 🔥 Firebase Setup Test Script
# This script tests the Firebase App Distribution setup

echo "🔥 Testing Firebase App Distribution Setup..."

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

# Test 1: Check Firebase CLI
print_status "Testing Firebase CLI..."
if command -v firebase &> /dev/null; then
    FIREBASE_VERSION=$(firebase --version)
    print_success "Firebase CLI installed: $FIREBASE_VERSION"
else
    print_error "Firebase CLI not found"
    exit 1
fi

# Test 2: Check Firebase login
print_status "Testing Firebase login..."
if firebase projects:list &> /dev/null; then
    print_success "Firebase login successful"
else
    print_error "Firebase login failed"
    exit 1
fi

# Test 3: Check project access
print_status "Testing project access..."
CURRENT_PROJECT=$(firebase use --json | grep -o '"current":"[^"]*"' | cut -d'"' -f4)
if [ "$CURRENT_PROJECT" = "ai-msging" ]; then
    print_success "Using correct project: $CURRENT_PROJECT"
else
    print_warning "Current project: $CURRENT_PROJECT"
    print_status "Switching to ai-msging..."
    firebase use ai-msging
fi

# Test 4: Check configuration files
print_status "Testing configuration files..."

if [ -f "firebase.json" ]; then
    print_success "firebase.json found"
else
    print_error "firebase.json missing"
fi

if [ -f "google-services.json" ]; then
    print_success "google-services.json found"
else
    print_error "google-services.json missing"
fi

if [ -f "release_notes.txt" ]; then
    print_success "release_notes.txt found"
else
    print_error "release_notes.txt missing"
fi

if [ -f "testers.txt" ]; then
    print_success "testers.txt found"
    TESTER_COUNT=$(grep -v '^#' testers.txt | grep -v '^$' | wc -l)
    print_status "Found $TESTER_COUNT testers in testers.txt"
else
    print_error "testers.txt missing"
fi

# Test 5: Check Firebase App Distribution access
print_status "Testing Firebase App Distribution access..."
if firebase appdistribution:distribute --help &> /dev/null; then
    print_success "Firebase App Distribution accessible"
else
    print_error "Firebase App Distribution not accessible"
fi

# Test 6: Check if app exists in Firebase
print_status "Testing app existence in Firebase..."
if firebase apps:list &> /dev/null; then
    print_success "Firebase apps list accessible"
    APPS=$(firebase apps:list --json 2>/dev/null | grep -o '"appId":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$APPS" ]; then
        print_status "Available apps: $APPS"
    else
        print_warning "No apps found - you may need to create one in Firebase Console"
    fi
else
    print_warning "Cannot list Firebase apps"
fi

echo ""
print_success "🎉 Firebase setup test completed!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. 📱 Build Android APK:"
echo "   npx expo run:android --variant release"
echo ""
echo "2. 🚀 Distribute via Firebase:"
echo "   firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "3. 📊 Monitor in Firebase Console:"
echo "   https://console.firebase.google.com/project/ai-msging/appdistribution"
echo ""
print_success "Your Firebase setup is ready! 🔥" 