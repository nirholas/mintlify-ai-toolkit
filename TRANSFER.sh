#!/bin/bash
# Transfer script for Mintlify Scraper
# 
# Usage in your other repo:
#   1. Create this script in your repo root
#   2. chmod +x TRANSFER.sh
#   3. ./TRANSFER.sh /path/to/[insert_user]/tools/[insert_repo_name]
#   or just run commands below manually

SOURCE_DIR="${1:-../[insert_user]/tools/[insert_repo_name]}"

echo "📦 Transferring Mintlify Scraper from: $SOURCE_DIR"

# Create directory structure
mkdir -p tools/mintlify-scraper/{src,examples,templates,output}

# Copy source files
echo "📄 Copying source files..."
cp "$SOURCE_DIR/src/scraper.ts" tools/mintlify-scraper/src/
cp "$SOURCE_DIR/src/mcp-generator.ts" tools/mintlify-scraper/src/
cp "$SOURCE_DIR/src/example-extractor.ts" tools/mintlify-scraper/src/

# Copy examples
echo "📚 Copying examples..."
cp "$SOURCE_DIR/examples/etherscan.md" tools/mintlify-scraper/examples/
cp "$SOURCE_DIR/examples/1inch-mcp-server.md" tools/mintlify-scraper/examples/

# Copy templates
echo "📋 Copying templates..."
cp "$SOURCE_DIR/templates/mcp-tool-rest-api.md" tools/mintlify-scraper/templates/
cp "$SOURCE_DIR/templates/mcp-tool-graphql.md" tools/mintlify-scraper/templates/
cp "$SOURCE_DIR/templates/mcp-server-template.md" tools/mintlify-scraper/templates/

# Copy documentation
echo "📖 Copying documentation..."
cp "$SOURCE_DIR/README.md" tools/mintlify-scraper/
cp "$SOURCE_DIR/package.json" tools/mintlify-scraper/

# Install dependencies
echo "📦 Installing dependencies..."
cd tools/mintlify-scraper
npm install

echo "✅ Transfer complete!"
echo ""
echo "Next steps:"
echo "  cd tools/mintlify-scraper"
echo "  npm run scrape -- https://docs.example.com"
