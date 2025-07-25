#!/bin/bash

# 🔥 Firebase Initialization Script for Chatter App
# This script helps you set up Firebase for your iOS app deployment

echo "🔥 Starting Firebase Initialization for Chatter App..."

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

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed."
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install Firebase CLI"
        exit 1
    fi
fi

print_success "Firebase CLI is installed!"

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    print_warning "You are not logged in to Firebase."
    echo "Please log in to Firebase:"
    firebase login
    
    if [ $? -ne 0 ]; then
        print_error "Failed to login to Firebase"
        exit 1
    fi
fi

print_success "Logged in to Firebase!"

# Initialize Firebase project
print_status "Initializing Firebase project..."
firebase init

if [ $? -ne 0 ]; then
    print_error "Failed to initialize Firebase project"
    exit 1
fi

print_success "Firebase project initialized!"

# Deploy Firebase configuration
print_status "Deploying Firebase configuration..."
firebase deploy

if [ $? -ne 0 ]; then
    print_error "Failed to deploy Firebase configuration"
    exit 1
fi

print_success "Firebase configuration deployed!"

echo ""
print_success "🎉 Firebase setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. 📱 Build and Distribute Android app:"
echo "   npm run deploy:android:firebase"
echo ""
echo "2. 🌐 Deploy Web app:"
echo "   npm run deploy:web"
echo ""
echo "3. 📊 Monitor in Firebase Console:"
echo "   https://console.firebase.google.com/project/ai-msging"
echo ""
print_success "Your Firebase setup is ready! 🔥" 