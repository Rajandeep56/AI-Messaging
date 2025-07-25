#!/bin/bash

# 🚀 Chatter App Deployment Script
# This script helps you deploy your app for free

echo "🚀 Starting Chatter App Deployment..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_success "All prerequisites are installed!"

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed successfully!"

# Build for web
print_status "Building for web..."
npm run build:web

if [ $? -ne 0 ]; then
    print_error "Failed to build for web"
    exit 1
fi

print_success "Web build completed!"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_warning "Not in a git repository. Initializing..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    print_warning "No remote origin found."
    echo "Please add your GitHub repository as origin:"
    echo "git remote add origin https://github.com/yourusername/chatter.git"
    echo "Then run: git push -u origin main"
fi

# Display deployment options
echo ""
print_status "🎉 Build completed successfully!"
echo ""
echo "📋 Next steps to deploy for FREE:"
echo ""
echo "1. 🌐 Vercel (Recommended):"
echo "   - Go to https://vercel.com"
echo "   - Sign up with GitHub"
echo "   - Import your repository"
echo "   - Deploy automatically!"
echo ""
echo "2. 🌐 Netlify:"
echo "   - Go to https://netlify.com"
echo "   - Sign up with GitHub"
echo "   - Import your repository"
echo "   - Deploy automatically!"
echo ""
echo "3. 📱 Mobile App:"
echo "   - Run: npm run build:android (for Android)"
echo "   - Run: npm run build:ios (for iOS)"
echo "   - Upload to app stores"
echo ""
echo "4. 📊 Analytics:"
echo "   - Set up Google Analytics (free)"
echo "   - Monitor your app usage"
echo ""
print_success "Your app is ready for deployment! 🚀" 