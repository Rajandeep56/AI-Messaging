#!/bin/bash

echo "🔑 Generating new Expo token for GitHub Actions..."
echo ""

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check if user is logged in
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please login first:"
    echo "   eas login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Logged in as: $(eas whoami)"
echo ""

# Generate new token
echo "🔧 Generating new Expo token..."
echo ""
echo "📝 Please go to: https://expo.dev/accounts/rajandeep56/settings/access-tokens"
echo "   Click 'Create token' and copy the token value."
echo ""
echo "🔐 Then add it to your GitHub repository secrets:"
echo "   Repository Settings → Secrets and variables → Actions → New repository secret"
echo "   Name: EXPO_TOKEN"
echo "   Value: [paste your token here]"
echo ""
echo "⚠️  Keep your token secure and don't share it publicly!"
echo ""
echo "💡 Alternative: You can also run 'eas login' in GitHub Actions without a token"
echo "   by removing the EXPO_TOKEN environment variable from the workflow."
    echo ""
    echo "✅ Instructions completed!"
    echo ""
    echo "🚀 After adding the token to GitHub secrets, your deployment should work!" 