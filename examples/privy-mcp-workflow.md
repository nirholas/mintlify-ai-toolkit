# Example: Scraping Privy Docs for MCP Server Development

This example shows how to scrape Privy documentation and use it to build an MCP server.

## Step 1: Scrape the Documentation

```bash
# Scrape Privy docs with zip archive
npm run scrape -- https://docs.privy.io --output ./privy-docs --zip
```

**What happens:**
- Discovers all pages via sitemap.xml
- Downloads each page (auto-saves every 10 pages)
- Generates COMPLETE.md with all content
- Creates INDEX.md for navigation
- Saves metadata.json with structure
- Creates privy-docs.zip archive

**Expected output:**
```
🚀 Starting Mintlify docs scraper for: https://docs.privy.io

💡 Controls: Press [SPACE] or [P] to pause, [Ctrl+C] to exit

🔍 Discovering pages...
📋 Found 127 pages in sitemap
📖 Scraping 127 pages...
✓ Introduction
✓ Quick Start
✓ Authentication
...
⏳ Progress: 10/127 pages (117 remaining)
✅ Progress saved: 10 pages scraped, 117 remaining
...
⏳ Progress: 127/127 pages (0 remaining)
📝 Generating documentation files...
📦 Creating zip archive...
📦 Zip archive created: privy-docs.zip (2.3 MB)
✅ Scraping complete! 127 pages processed
📁 Documentation saved to: privy-docs
```

## Step 2: Review the Output

```bash
# Check the structure
ls -lh privy-docs/

# Output:
# COMPLETE.md          (all docs in one file - 1.8 MB)
# INDEX.md             (table of contents)
# metadata.json        (structured data)
# introduction/        (section folder)
# authentication/      (section folder)
# wallets/             (section folder)
# ...
```

## Step 3: Load into AI Context

```bash
# Option 1: Copy entire docs to clipboard (Mac)
cat privy-docs/COMPLETE.md | pbcopy

# Option 2: Just reference the file
# Then in your AI chat:
```

**AI Prompt:**
```
I have the complete Privy documentation in privy-docs/COMPLETE.md.

Please create MCP tools for:
1. User authentication (login, logout, session management)
2. Wallet operations (connect, disconnect, get balance)
3. Transaction signing

For each tool, provide:
- Tool name and description
- Input schema with all parameters
- Example implementation
```

## Step 4: Use Metadata for Structure

```bash
# View all available sections
cat privy-docs/metadata.json | jq '.sections'

# Output:
# [
#   "introduction",
#   "authentication",
#   "wallets",
#   "transactions",
#   "api-reference"
# ]

# View all API endpoints
cat privy-docs/metadata.json | jq '.pages[] | select(.hasApiEndpoint == true) | .title'

# Output:
# "Authenticate User"
# "Create Wallet"
# "Sign Transaction"
# ...
```

## Step 5: Build Your MCP Server

Based on the scraped docs, you can now build your MCP server with complete understanding of:

**Authentication:**
- From `privy-docs/authentication/`
- All auth methods, flows, and examples

**Wallets:**
- From `privy-docs/wallets/`
- Wallet creation, management, operations

**API Reference:**
- From `privy-docs/api-reference/`
- All endpoints, parameters, responses

## Bonus: Handling Interruptions

If you need to stop mid-scrape:

```bash
# Start scraping
npm run scrape -- https://docs.privy.io --output ./privy-docs

# ... scraping 50/127 pages ...
# Oops! Need to close laptop

# Press SPACE
# Choose [S] Save & Exit

# Later... resume from page 50
npm run scrape -- --resume ./privy-docs

# Continues from: 50/127 pages
```

## Bonus: Sharing with Team

```bash
# The zip file makes it easy to share
# Just send privy-docs.zip to your team

# They can extract and use:
unzip privy-docs.zip
cat privy-docs/COMPLETE.md
```

## Result

You now have:
- ✅ Complete offline Privy documentation
- ✅ Single COMPLETE.md file for AI context
- ✅ Organized sections for browsing
- ✅ Structured metadata for programmatic use
- ✅ Zip archive for backup/sharing
- ✅ Full understanding of Privy API for MCP development

**Time spent:** 5-10 minutes  
**Time saved:** Hours of manual research  
**Result:** Ready to build MCP server with complete API knowledge
