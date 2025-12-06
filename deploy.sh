#!/bin/bash

# Mintlify AI Toolkit - Deployment Script
# Prepares and deploys the project to GitHub Pages

set -e  # Exit on error

echo "🚀 Mintlify AI Toolkit - Deployment"
echo "===================================="
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Found uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📦 Staging all changes..."
        git add .
        
        echo "💬 Enter commit message (or press Enter for default):"
        read commit_message
        
        if [ -z "$commit_message" ]; then
            commit_message="Update web interface and documentation"
        fi
        
        echo "✅ Committing changes..."
        git commit -m "$commit_message"
    else
        echo "⚠️  Skipping commit. Deploy anyway? (y/n)"
        read -p "" -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Deployment cancelled"
            exit 1
        fi
    fi
fi

# Check current branch
current_branch=$(git branch --show-current)
echo "📍 Current branch: $current_branch"

if [ "$current_branch" != "main" ]; then
    echo "⚠️  Warning: Not on main branch. Continue? (y/n)"
    read -p "" -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
git push origin $current_branch

echo ""
echo "✅ Push complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to GitHub repository settings"
echo "2. Navigate to Pages section"
echo "3. Set Source to 'GitHub Actions'"
echo "4. Wait 1-2 minutes for deployment"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/' | cut -d/ -f1).github.io/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/' | cut -d/ -f2)"
echo ""
echo "✨ Deployment script completed!"
