# Mintlify Documentation Scraper & AI Toolkit

> Turn any Mintlify site into MCP servers, Mintlify sites, RAG chunks, AI tool definitions, TypeScript types, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AI-Powered](https://img.shields.io/badge/AI-Powered-blueviolet)](./ADVANCED_FEATURES.md)
[![AI-Discoverable](https://img.shields.io/badge/AI-Discoverable-brightgreen)](./.well-known/ai-plugin.json)
[![NPM Package](https://img.shields.io/npm/v/@nirholas/mintlify-scraper)](https://www.npmjs.com/package/@nirholas/mintlify-scraper)

## AI Agent Ready

AI agents can discover and use this toolkit autonomously:

- NPM Registry: `npm install -g @nirholas/mintlify-scraper`
- AI Plugin Manifest: [.well-known/ai-plugin.json](./.well-known/ai-plugin.json)
- OpenAPI Spec: [.well-known/openapi.yaml](./.well-known/openapi.yaml)
- Tool Manifest: [.well-known/ai-tool-manifest.json](./.well-known/ai-tool-manifest.json)

[Complete AI Agent Integration Guide](./AI-AGENT-INTEGRATION.md)

---

## Advanced AI Features

- AI Quality Analysis - Quality scores, readability metrics, and suggestions
- Real-Time Preview - Live markdown rendering with hot reload
- Semantic Search - Vector-based search with fuzzy matching
- Web3 Extraction - Detect smart contracts, tokens, and DeFi protocols

[Read Full Advanced Features Documentation](./ADVANCED_FEATURES.md)

---

## Web Interface

Browser-based scraper (no installation required):

[https://nirholas.github.io/mintlify-ai-toolkit](https://nirholas.github.io/mintlify-ai-toolkit)

**Features:**
- AI Quality Analysis - Real-time quality scoring and suggestions
- Semantic Search - Search scraped docs with vector similarity
- Live Preview - See documentation rendered in real-time
- Web3 Detection - Extract smart contract addresses and crypto data
- Quality Metrics - Readability scores, SEO analysis, content health
- Smart Suggestions - Actionable improvement recommendations
- Enter any Mintlify docs URL
- Download complete documentation as ZIP
- Works entirely in browser
- Dark mode with live stats

---

## Overview

**Use Cases:**
- Building AI integrations from documentation
- Aggregating documentation from multiple pages
- Optimizing docs for AI agents, RAG, and vector DBs
- Auto-generating types, tools, and code examples
- Assessing documentation quality
- Searching docs before downloading

**Capabilities:**
1. AI-powered quality analysis
2. Semantic search
3. Real-time preview
4. Complete MCP server generation (ready for Claude Desktop)
5. Mintlify site generation (deploy to your domain)
6. AI context files (Cursor, Cline, Claude, Windsurf)
7. AI tool definitions (OpenAI, LangChain, Anthropic, Gemini, Vercel)
8. RAG chunks (Pinecone, Weaviate, Chroma, Qdrant, Milvus)
9. TypeScript types (interfaces + Zod schemas)
10. Code examples (organized by language with tests)
11. Auto-scrapes documentation (Trieve API = 10-100x faster)
12. Perfect code preservation with zero CSS/JS artifacts

## Key Features

### Advanced AI Features
- **Quality Analysis** - Comprehensive scoring (quality, readability, SEO) with actionable suggestions
- **Semantic Search** - TF-IDF vectorization with cosine similarity and fuzzy matching
- **Real-Time Preview** - Live markdown rendering with hot reload
- **AI Summaries** - Auto-generate documentation health reports
- **Web3 Extraction** - Detect smart contracts (0x addresses), chain IDs, tokens, and DeFi protocols
- **Link Detection** - Find broken, relative, and insecure links automatically
- **Code Analysis** - Identify missing language specifications and syntax issues

### AI Features
- **Vector Search** - Semantic search across docs with OpenAI/local embeddings ([Guide](./VECTOR-SEARCH.md))
- **Chatbot Training** - Export Q&A for GPT fine-tuning, Custom GPTs, RAG ([Guide](./CHATBOT-TRAINING.md))
- **AI Context Generator** - Generate .cursorrules, .clinerules, claude-context.md, .windsurfrules
- **Multi-Framework Tools** - Create tool definitions for 6 AI frameworks
- **RAG Generator** - Semantic chunking + 5 vector DB import scripts
- **TypeScript Types** - Auto-generate interfaces and Zod schemas
- **Code Extractor** - Organize examples by language with Jest/Pytest tests

[Quick Start: Vector Search & Chatbot Training](./QUICKSTART-AI.md)

### Mintlify Site Publisher
- **One command** - Scraped docs → Deployable Mintlify site
- **Auto-generates** - mint.json, navigation, home page
- **Full branding** - Custom colors, logo, domain
- **All components** - Tabs, Accordions, CodeGroup, Steps, Callouts, API playground
- **Analytics** - GA4, Mixpanel, PostHog integration
- **Deploy anywhere** - Mintlify.com, Vercel, Netlify

### MCP Server Generator
- **One command** - Docs URL → Working MCP server
- **Auto-generates** - All tools, handlers, types, configs
- **Claude Desktop ready** - Just npm install and configure
- **Customizable** - Edit handlers.ts to implement your logic

### Intelligent Scraping
- **Auto-detects Trieve API** - 10-100x faster than HTML scraping
- **Dual-mode operation** - API first, HTML fallback
- **Smart content filtering** - Removes ads, tracking, social widgets
- **Rate limiting** - Respectful crawling with configurable delays
- **Progress tracking** - Resume interrupted scrapes automatically
- **Authentication** - Basic, Bearer, API key support

### Perfect Code Preservation
- **Exact formatting** - No whitespace normalization in code blocks
- **Multi-format support** - Handles 7+ syntax highlighters
- **Auto language detection** - JSON, Bash, JS/TS, Python, HTML, CSS, SQL, YAML
- **Deduplication** - Prevents duplicate code blocks

### Clean Markdown Output
- **Zero artifacts** - No CSS, JavaScript, or HTML markup
- **Link preservation** - Inline links and formatting maintained
- **Nested content** - Properly handles divs, sections, articles
- **Complete structure** - H1-H6, lists, tables, blockquotes, images

### Advanced Configuration
- **Config file system** - JSON-based configuration
- **Custom selectors** - Extract exactly what you need
- **Multiple output formats** - Markdown, JSON, or both
- **Flexible structure** - Single file, per-page, or per-section
- **Page ranking** - Prioritize important pages
- **URL filtering** - Include/exclude patterns with regex

### AI Enhancement
- **Auto-summarization** - Generate concise summaries
- **Key point extraction** - Identify main concepts
- **Code explanations** - AI-powered code commentary
- **Quality scoring** - Rate documentation completeness
- **Missing content detection** - Find gaps in docs
- **Multiple providers** - OpenAI, Anthropic, or local LLMs

[See Advanced Features Guide](./ADVANCED_FEATURES.md)

---

## Quick Start

### Option 1: NPM Package

```bash
# Install
npm install @nirholas/mintlify-scraper

# Use in your code
import { MintlifyPublisher, AIContextGenerator } from '@nirholas/mintlify-scraper';

const publisher = new MintlifyPublisher('./docs');
await publisher.publish('./output');
```

[Complete NPM Usage Guide](./QUICKSTART.md)

### Option 2: Global CLI

```bash
# Install globally
npm install -g @nirholas/mintlify-scraper

# Use anywhere
mintlify-scraper https://docs.example.com --output ./docs
generate-ai-context ./docs --format cursor
```

### Option 3: Clone & Run

```bash
git clone https://github.com/nirholas/mintlify-ai-toolkit.git
cd mintlify-ai-toolkit
npm install
```

---

## 📦 Easy Integration

**Import as a library:**
```typescript
import { 
  MintlifyPublisher,
  AIContextGenerator,
  RAGGenerator,
  TypeScriptGenerator 
} from '@nirholas/mintlify-scraper';
```

**Use in CI/CD:**
```yaml
- run: npm install @nirholas/mintlify-scraper
- run: generate-ai-context ./docs --format all
```

**[📖 Complete Integration Guide](./INTEGRATION.md)** - Next.js, Express, Docker, CI/CD, and more

---

## Quick Start

### Installation

```bash
git clone https://github.com/nirholas/mintlify-ai-toolkit.git
cd mintlify-ai-toolkit
npm install
npm run build
```

---

## 🧠 AI Features

**Transform documentation into AI-ready formats:**

### 1. AI Context Generator
Generate context files for AI coding assistants:
```bash
npm run generate-ai-context -- ./scraped-docs --format all
```
Generates: `.cursorrules`, `.clinerules`, `claude-context.md`, `.windsurfrules`

### 2. Multi-Framework Tool Generator
Create AI tool definitions for 6 frameworks:
```bash
npm run generate-ai-tools -- ./scraped-docs --framework all
```
Supports: MCP, OpenAI, LangChain, Anthropic, Gemini, Vercel AI SDK

### 3. RAG Generator
Generate semantic chunks for vector databases:
```bash
npm run generate-rag -- ./scraped-docs --generate-qa
```
Supports: Pinecone, Weaviate, Chroma, Qdrant, Milvus

### 4. TypeScript Type Generator
Auto-generate types and Zod schemas:
```bash
npm run generate-types -- ./scraped-docs --with-zod
```

### 5. Code Example Extractor
Organize code examples by language:
```bash
npm run extract-code -- ./scraped-docs --with-tests
```

📖 **[See Complete AI Features Guide](./AI-FEATURES.md)**

---

## 🤖 MCP Server Generator

**Turn any Mintlify docs into a working MCP server for Claude Desktop:**

[→ See complete MCP Server Guide](./examples/mcp-server-quickstart.md)

---

## 🌐 Mintlify Site Publisher

**Turn scraped docs into your own deployable Mintlify site - perfect for rebranding, white-labeling, or hosting on your domain:**

```bash
# 1. Scrape docs
npm run scrape -- https://docs.privy.io --output ./privy-docs

# 2. Publish as Mintlify site (with all features!)
npm run publish-mintlify -- ./privy-docs --output ./my-privy-site

# 3. Preview locally
cd my-privy-site
npm install
npx mintlify dev
```

**What you get:**
- ✅ Complete `mint.json` with analytics, feedback, API playground
- ✅ All Mintlify MDX components (Tabs, Accordions, CodeGroup, Callouts)
- ✅ Example pages showcasing API docs and components
- ✅ Reusable snippets for common content
- ✅ Organized navigation structure
- ✅ Clean markdown optimized for Mintlify
- ✅ Ready to deploy to mintlify.com, Vercel, or Netlify
- ✅ Custom branding and domain support

**Advanced features:**

```bash
npm run publish-mintlify -- ./scraped-docs \
  --name "Your API Docs" \
  --description "Complete API documentation" \
  --domain https://docs.yourdomain.com \
  --color "#FF6B6B" \
  --github https://github.com/your-org/repo \
  --linkedin https://linkedin.com/company/yourco \
  --ga4 G-XXXXXXXXXX \
  --enable-feedback \
  --enable-api-playground \
  --api-base-url https://api.yourdomain.com \
  --openapi https://api.yourdomain.com/openapi.json
```

**All Mintlify features supported:**
- 📊 **Analytics**: Google Analytics, Mixpanel, PostHog
- 💬 **Feedback**: Thumbs up/down, suggest edits, raise issues
- 🎮 **API Playground**: Interactive API testing
- 📖 **OpenAPI**: Auto-generate API docs from spec
- 🎨 **Components**: Tabs, Accordions, Cards, Callouts, Steps, CodeGroup
- ✂️ **Snippets**: Reusable content blocks
- 🔗 **Navigation**: Auto-generated from doc structure

**Perfect for:**
- 🎨 Rebranding competitor documentation
- 📚 Consolidating multiple doc sites
- Migrating to Mintlify
- 🏷️ White-labeling documentation

[→ See complete Publishing Guide](./examples/mintlify-publishing.md)

---

## 🤖 MCP Server Generator

**Turn any Mintlify docs into a working MCP server for Claude Desktop:**

### Basic Usage

```bash
# One command: URL → Complete MCP Server
npm run docs-to-mcp -- https://docs.privy.io

# Output: privy-mcp-server/ with everything needed!
```

### What You Get

```
privy-mcp-server/
├── index.ts                    # Complete MCP server
├── handlers.ts                 # Tool implementations (customize here!)
├── tools.ts                    # Auto-generated tool definitions
├── package.json                # All dependencies
├── tsconfig.json               # TypeScript config
├── claude_desktop_config.json  # Claude Desktop setup
├── .env.example                # Environment template
└── README.md                   # Setup instructions
```

### Setup in 3 Steps

```bash
# 1. Generate server
npm run docs-to-mcp -- https://docs.privy.io

# 2. Install and build
cd privy-mcp-server
npm install
npm run build

# 3. Add to Claude Desktop
# Copy claude_desktop_config.json content to:
# ~/Library/Application Support/Claude/claude_desktop_config.json

# Done! Restart Claude Desktop and you have Privy tools!
```

### Advanced Options

```bash
# Custom output location
npm run docs-to-mcp -- https://docs.stripe.com --output ./my-stripe-server

# Custom server name and description
npm run docs-to-mcp -- https://docs.api.com \
  --name my-api \
  --display-name "My Custom API" \
  --description "Custom API MCP server"

# No API key required (for public APIs)
npm run docs-to-mcp -- https://docs.example.com --no-api-key

# From already scraped docs
npm run docs-to-mcp -- ./scraped-docs/privy --output ./privy-mcp
```

### What It Does

1. **Scrapes documentation** (if URL provided) using Trieve API
2. **Extracts API endpoints** from docs automatically
3. **Generates MCP tools** with proper schemas
4. **Creates server code** with TypeScript
5. **Adds Claude Desktop config** ready to use
6. **Includes setup instructions** in README

### Example: Generated Tools

If docs have these endpoints:
- `POST /auth/login` - Authenticate user
- `GET /wallet/balance` - Get wallet balance
- `POST /transaction/sign` - Sign transaction

You get these MCP tools:
- `privy_auth_login` - Authenticate user
- `privy_wallet_balance` - Get wallet balance  
- `privy_transaction_sign` - Sign transaction

All with proper TypeScript types and schemas!

### Customize Implementation

Edit `handlers.ts` to add your API logic:

```typescript
async function privyAuthLogin(args: Record<string, unknown>, apiKey: string) {
  const { email, password } = args;
  
  // Your implementation
  const response = await fetch('https://api.privy.io/auth/login', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  return await response.json();
}
```

---

## 🔍 Vector Search & Semantic Discovery

**Add AI-powered semantic search to your scraped documentation:**

```bash
# 1. Scrape documentation
npm run scrape -- https://docs.example.com --output ./docs

# 2. Create vector search index
npx tsx src/vector-search.ts \
  --docs-dir ./docs \
  --provider openai \
  --api-key sk-...

# 3. Search by meaning (not just keywords!)
npx tsx src/search-cli.ts "How do I authenticate users?"
```

**What You Get:**
- 🔍 **Semantic Search** - Find content by meaning, not exact words
- 🎯 **Hybrid Search** - Combines AI + keyword for best results  
- 🔗 **Related Docs** - Auto-find similar pages
- 💡 **Auto-Suggest** - Smart query suggestions
- 💰 **FREE Option** - Local embeddings (no API costs!)

**[→ Complete Vector Search Guide](./VECTOR-SEARCH.md)**

**Example:**
```typescript
// Search finds relevant content even without exact keywords
await search.search("user login");
// Returns: "Authentication", "OAuth Setup", "Session Management"
```

---

## 🤖 Chatbot Training Data Export

**Turn your docs into training data for GPT, Claude, LLaMA, or Custom GPTs:**

```bash
# 1. Scrape documentation
npm run scrape -- https://docs.example.com --output ./docs

# 2. Generate Q&A training data
npx tsx src/chatbot-exporter.ts \
  --docs-dir ./docs \
  --output ./training-data.jsonl \
  --format openai-jsonl \
  --generate-qa

# 3. Fine-tune your chatbot
openai api fine_tuning.jobs.create \
  -t training-data-train.jsonl \
  -m gpt-3.5-turbo
```

**What You Get:**
- 🤖 **Auto-Generate Q&A** - AI creates questions from your docs
- 📋 **Multiple Formats** - OpenAI, LLaMA, Claude, JSON, CSV
- ✅ **Validation Sets** - Auto train/test split
- 💰 **FREE Option** - Manual Q&A extraction (no AI costs!)
- 🎨 **Custom Prompts** - Define your bot's personality

**Use Cases:**
- Fine-tune GPT on your API docs
- Create Custom GPTs for support
- Train internal knowledge bots
- Build educational tutors

**[→ Complete Chatbot Training Guide](./CHATBOT-TRAINING.md)**

**Cost Example:** 1,000 pages → 3,000 Q&A pairs = **$0.10** (one-time)

---

## 📥 Documentation Scraping

### Basic Scraping

```bash
# Scrape Privy docs (auto-detects Trieve API for 10x speed boost!)
npm run scrape -- https://docs.privy.io --output ./output/privy

# Scrape Etherscan docs
npm run scrape -- https://docs.etherscan.io --output ./output/etherscan

# Scrape 1inch docs  
npm run scrape -- https://docs.1inch.io --output ./output/1inch
```

### Trieve API

The scraper now **automatically detects** Mintlify's Trieve API for:
- **10-100x faster** scraping
- **Cleaner** content extraction
- **More reliable** results

```bash
# Auto-detect and use Trieve API (default behavior)
npm run scrape -- https://docs.privy.io --output ./docs/privy

# Manually provide Trieve API key (optional)
npm run scrape -- https://docs.privy.io \
  --trieve-key tr-abc123xyz \
  --output ./docs/privy

# Force HTML scraping only (disable Trieve API)
npm run scrape -- https://docs.example.com \
  --no-api \
  --output ./docs
```

**How it works:**
1. Scraper inspects the site's search functionality
2. Extracts Trieve API key automatically (format: `tr-xxxxx`)
3. Fetches structured documentation via API
4. Falls back to HTML scraping if API unavailable

### ⚙️ Configuration File (Advanced)

For complex scraping scenarios, use a JSON configuration file:

```bash
# Use configuration file
npm run scrape -- --config ./my-config.json --output ./docs
```

**Example configuration:**

```json
{
  "index_uid": "my-docs",
  "start_urls": [
    {
      "url": "https://docs.example.com/",
      "page_rank": 10,
      "tags": ["getting-started"]
    }
  ],
  "selectors": {
    "default": {
      "lvl0": "h1",
      "lvl1": "h2",
      "text": "p, li",
      "code": "pre code"
    }
  },
  "authentication": {
    "type": "bearer",
    "token": "your-token"
  },
  "output": {
    "format": "both",
    "structure": "per-section"
  },
  "crawling": {
    "max_concurrent": 5,
    "delay_ms": 500
  }
}
```

**Configuration features:**
- 🎯 **Custom selectors** - Extract exactly what you need
- 🔐 **Authentication** - Basic, Bearer, API key support
- 📊 **Multiple formats** - Markdown, JSON, or both
- 📁 **Flexible structure** - Single file, per-page, or per-section
- ⭐ **Page ranking** - Prioritize important pages
- 🚫 **URL filtering** - Include/exclude patterns
- 💾 **Progress tracking** - Auto-resume interrupted scrapes

📖 **[See Advanced Features Guide](./ADVANCED.md)** for complete configuration options

### Advanced Usage

```bash
# Custom rate limiting for large sites
npm run scrape -- https://docs.chain.link \
  --output ./output/chainlink \
  --concurrent 2 \
  --delay 2000

# Manually specify Trieve API key
npm run scrape -- https://docs.example.com \
  --trieve-key tr-your-key-here \
  --output ./docs

# Force HTML scraping (bypass Trieve API)
npm run scrape -- https://docs.example.com \
  --no-api \
  --output ./docs

# Use configuration file with authentication
npm run scrape -- --config ./protected-docs.json
```

### Common Workflows

**For AI Agents:**
```bash
# 1. Scrape docs (uses Trieve API automatically)
npm run scrape -- https://docs.privy.io --output ./privy

# 2. Use COMPLETE.md with AI
cat privy/COMPLETE.md | pbcopy  # macOS
cat privy/COMPLETE.md | xclip -selection clipboard  # Linux

# 3. Or reference directly in prompts
# "Based on privy/COMPLETE.md, create MCP tools for authentication"
```

**For Offline Backup:**
```bash
# Scrape complete documentation
npm run scrape -- https://docs.stripe.com --output ./backup/stripe

# Result: backup/stripe/ folder with all docs
```

**For Large Sites:**
```bash
# Use slower rate limiting
npm run scrape -- https://docs.alchemy.com \
  --output ./alchemy \
  --concurrent 2 \
  --delay 2000
```

**AI-Enhanced Scraping:**
```bash
# Set up API key
export OPENAI_API_KEY="sk-..."

# Use AI-enhanced config
npm run scrape -- --config ./examples/configs/ai-enhanced.json

# Gets:
# - Auto-generated summaries
# - Key points extraction
# - Code explanations
# - Quality scores
# - Missing content detection
```

---

## 🧰 Features

### ✅ What You Get

**For AI Agents:**
- **📄 COMPLETE.md** - All docs in one file, ready to load into Claude/GPT context
- **🎯 Smart Extraction** - Clean markdown, perfect code examples, API schemas
- **📊 Structured Metadata** - JSON with all page info for programmatic access
- **⚡ Trieve API** - 10-100x faster scraping with auto-detection

**For Developers:**
- **Dual-Mode Scraping** - Trieve API with HTML fallback
- **🗂️ Organized Output** - Individual files by section + combined view
- **💎 Perfect Code Blocks** - Exact formatting preservation, no artifacts
- **🔍 Deep Crawling** - Sitemap + recursive link discovery
- **⚡ Smart Rate Limiting** - Configurable, respectful scraping
- **🧹 Clean Content** - Zero CSS/JS/tracking/ads in output

**Content Quality:**
- **7+ Code Formats** - Prism, highlight.js, Mintlify, plain HTML
- **Auto Language Detection** - JSON, Bash, JS/TS, Python, HTML, CSS, SQL, YAML
- **Link Preservation** - Inline links and formatting maintained
- **Complete Structure** - H1-H6, lists, tables, blockquotes, images, definition lists

---

## 📁 Output Structure

```
output/privy/
├── COMPLETE.md                    # All docs in one file (perfect for AI!)
├── INDEX.md                       # Navigation table of contents
├── metadata.json                  # Structured data about all pages
└── api-reference/                 # Individual pages organized by section
    ├── authenticate.md
    ├── create-wallet.md
    ├── get-user-by-id.md
    └── ...
```

### What You Get

**COMPLETE.md** - Single file with everything
- Perfect for AI agent context (paste entire file)
- Easy full-text search
- Offline reference
- No CSS/JavaScript artifacts

**Individual files** - Organized by section
- Browse like a normal docs site
- Import into your own docs
- Version control friendly
- Clean markdown only

**metadata.json** - Structured data
- All URLs and titles
- Section organization
- Scraping timestamp
- Page count and statistics

---

## 🎯 Use Cases

### 1. **AI Agent Context**

```bash
# Download docs
npm run scrape -- https://docs.privy.io --output ./privy

# Load into AI
cat privy/COMPLETE.md | pbcopy

# Or just reference the file
# "Based on privy/COMPLETE.md, create MCP tools for authentication"
```

### 2. **Offline Documentation**

```bash
# Download with zip for easy backup
npm run scrape -- https://docs.stripe.com --output ./stripe --zip

# Now you have:
# - stripe/ folder with all docs
# - stripe.zip for backup/sharing
# - Works completely offline
```

### 3. **Project Integration**

```bash
# Scrape docs for your integration
npm run scrape -- https://docs.alchemy.com --output ./docs/alchemy

# Reference in your code comments
// See docs/alchemy/guides/authentication.md for details

# Include in your repo for team reference
git add docs/alchemy/
```

### 4. **Large Sites (Pause/Resume)**

```bash
# Start scraping
npm run scrape -- https://docs.chain.link --output ./chainlink

# Need to stop? Press SPACE → [S] to save
# Auto-saves every 10 pages anyway!

# Resume later
npm run scrape -- --resume ./chainlink
```

### 5. **Documentation Rebrand/White-label**

```bash
# Scrape source docs
npm run scrape -- https://docs.example.com --output ./docs

# Edit the markdown files
# - Update branding
# - Customize content
# - Add your own sections

# Deploy as your own documentation
```

---

## 🧰 Features

### ✅ Current Features

- **📥 Complete Site Scraping** - Downloads all pages via sitemap
- **🎯 Smart Content Extraction** - Clean markdown, code examples, API schemas
- **⏸️ Interactive Pause/Resume** - Pause anytime, save progress, resume later
- **💾 Auto-Save Progress** - Automatically saves every 10 pages
- **⌨️ Keyboard Controls** - Space/P to pause, Ctrl+C to exit with save
- **📦 Zip Archives** - Create compressed archives with `--zip`
- **🗂️ Organized Output** - Individual files + combined COMPLETE.md
- **📊 Metadata Tracking** - JSON file with all page info
- **⚡ Rate Limiting** - Configurable delays and concurrent requests
- **🔄 Resume Support** - Continue from where you left off
- **🔗 Link Following** - Optional recursive crawling (configurable depth)
- **🗑️ Data Management** - Delete all data and start fresh option

### 🔮 Planned Features

#### v1.1 - Quality & Reliability
- [ ] **Smart Retry** - Exponential backoff for failed pages
- [ ] **Rate Limit Detection** - Auto-detect 429 errors and slow down
- [ ] **Content Validation** - Check for broken links and min content length
- [ ] **Real-time Stats** - Show scraping speed, errors, data size
- [ ] **Error Recovery** - Better handling of edge cases

#### v1.2 - Enhanced Output
- [ ] **Image Download** - Save images locally with updated references
- [ ] **Custom Filters** - Exclude sections via regex patterns
- [ ] **Multi-format Export** - JSON, YAML, HTML options
- [ ] **Code Example Extraction** - Separate by language
- [ ] **API Spec Generation** - OpenAPI/Swagger from docs

#### v2.0 - Advanced Features
- [ ] **MCP Tool Generator** - Auto-generate MCP tools from API docs
- [ ] **Diff Mode** - Compare scrapes and show changes
- [ ] **Semantic Search** - Search across all scraped docs
- [ ] **TypeScript Client Gen** - Generate API clients
- [ ] **Documentation Quality Score** - Rate completeness

### 💡 Want a Feature?

Open an issue and describe your use case! We prioritize features that help the most users.

---

## 📖 Examples & Guides

Check out the [examples/](./examples/) directory for detailed workflows:

- **[Privy MCP Workflow](./examples/privy-mcp-workflow.md)** - Complete guide to scraping Privy docs and building an MCP server
- **[Multi-Site Comparison](./examples/multi-site-comparison.md)** - Compare multiple services, track changes, make informed decisions
- **[1inch MCP Server](./examples/1inch-mcp-server.md)** - DEX aggregator integration example
- **[Etherscan Integration](./examples/etherscan.md)** - Blockchain explorer documentation

---

## 🌐 Web Interface

Don't want to install Node.js? Use our **browser-based scraper**:

### 👉 [Launch Web Scraper](https://nirholas.github.io/mintlify-ai-toolkit)

**Features:**
- ✅ No installation required - works in your browser
- ✅ Enter any Mintlify docs URL
- ✅ Auto-detects Trieve API for fast scraping
- ✅ Download complete docs as ZIP
- ✅ Clean markdown files with code examples
- ✅ Perfect for quick one-time doc downloads

**How to use:**
1. Visit the web app
2. Enter the Mintlify documentation URL (e.g., `https://docs.etherscan.io`)
3. Click "Start Scraping"
4. Wait for processing (uses Trieve API when available)
5. Download your ZIP file with all documentation

**What you get:**
- `COMPLETE.md` - All docs in one file for AI agents
- Individual section files - Organized by topic
- `README.md` - Information about the archive
- Clean markdown with preserved code formatting

---

## 📚 CLI Reference

### Commands

```bash
# Basic scraping
npm run scrape -- <url> [options]

# Resume from saved progress
npm run scrape -- --resume <output-dir>

# Show help
npm run scrape -- --help
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--output <dir>` | Output directory | `./scraped-docs` |
| `--concurrent <num>` | Max concurrent requests | `3` |
| `--delay <ms>` | Delay between batches (ms) | `1000` |
| `--resume <dir>` | Resume from saved progress | - |
| `--help` | Show help message | - |

### Interactive Controls (During Scraping)

| Key | Action |
|-----|--------|
| `SPACE` or `P` | Pause and show menu |
| `Ctrl+C` | Stop with save option |

### Pause Menu

| Option | Action |
|--------|--------|
| `C` | Continue scraping |
| `S` | Save progress and exit |
| `D` | Delete all data and exit |
| `R` | Resume from saved progress |

---

## 📖 Examples

### Example 1: Building Privy MCP Server

```bash
# 1. Scrape Privy docs
npm run scrape -- https://docs.privy.io --output ./privy

# 2. Review the complete documentation
cat privy/COMPLETE.md

# 3. Check available sections
cat privy/INDEX.md

# 4. Use metadata for tool generation
cat privy/metadata.json

# 5. Implement MCP tools using the docs
# (All API info is now in privy/COMPLETE.md)
```

### Example 2: Handling Interruptions

```bash
# Start scraping a large site
npm run scrape -- https://docs.alchemy.com --output ./alchemy

# Oops! Need to close laptop
# Press SPACE → [S] to save

# Later... resume from where you left off
npm run scrape -- --resume ./alchemy

# Auto-saved after every 10 pages, so minimal re-work!
```

### Example 3: Multi-Chain Explorer

```bash
# Scrape multiple blockchain explorers
npm run scrape -- https://docs.etherscan.io --output ./explorers/ethereum
npm run scrape -- https://docs.bscscan.com --output ./explorers/bsc
npm run scrape -- https://docs.polygonscan.com --output ./explorers/polygon

# Now you have complete docs for all chains!
# Each with COMPLETE.md, INDEX.md, and metadata.json
```

### Example 4: DeFi Protocol Integration

```bash
# Scrape DeFi protocol docs (with pauses as needed)
npm run scrape -- https://docs.uniswap.org --output ./defi/uniswap
npm run scrape -- https://docs.aave.com --output ./defi/aave
npm run scrape -- https://docs.compound.finance --output ./defi/compound

# Build MCP server with all DeFi protocols
```

---

## 🎨 What Makes This Different?

### Traditional Approach
1. ❌ Manually read documentation page by page
2. ❌ Copy-paste content into notes
3. ❌ Lose progress if interrupted
4. ❌ Start over if browser crashes
5. ❌ No easy way to search across all docs

**Time:** Hours to days  
**Risk:** High (lose progress easily)

### With This Tool
1. ✅ Auto-download complete docs (100+ pages in minutes)
2. ✅ Pause/resume anytime with keyboard controls
3. ✅ Auto-saves every 10 pages (never lose progress)
4. ✅ Get everything in one COMPLETE.md file
5. ✅ Easy grep/search across all content
6. ✅ Perfect for AI agent context

**Time:** Minutes  
**Risk:** Zero (auto-save + resume support)

---

## 🌍 Works With Any Mintlify Site

**Any Mintlify-based documentation works**, including:

### Popular Examples
- **Web3:** Privy, Etherscan, 1inch, Alchemy, QuickNode, Uniswap, Aave
- **AI/ML:** OpenAI, Anthropic, Replicate, Hugging Face
- **Dev Tools:** Vercel, Supabase, Neon, Railway, Render
- **And thousands more...**

### How to Tell if a Site Uses Mintlify
1. Check for `sitemap.xml` at the domain
2. Look for Mintlify branding in footer
3. Try it! If it has a sitemap, it'll work

---

## 💡 MCP Development Workflow

### Step 1: Download Documentation
```bash
npm run scrape -- https://docs.privy.io --output ./output/privy
# Can pause anytime with SPACE, auto-saves every 10 pages
```

### Step 2: Load into AI Context
```bash
# Copy complete docs to clipboard
cat output/privy/COMPLETE.md | pbcopy

# Or use metadata for structure
cat output/privy/metadata.json
```

### Step 3: Generate MCP Tools (with AI)
```
Prompt: "Based on this Privy documentation, create MCP tools for:
- User authentication
- Wallet management  
- Transaction signing"
```

### Step 4: Implement MCP Server
```typescript
// Use the scraped docs as reference
// All API details, parameters, and examples are in COMPLETE.md
const tools = [
  {
    name: 'privy_authenticate_user',
    description: 'Authenticate a user with Privy',
    // ... implement based on docs
  }
];
```

---

## 🔮 Roadmap

### v1.1 - Quality & Reliability (Coming Soon)
- [ ] Smart retry with exponential backoff
- [ ] Rate limit detection (429 errors)
- [ ] Content validation (broken links, min length)
- [ ] Real-time statistics dashboard
- [ ] Error recovery improvements

### v1.2 - Enhanced Features
- [ ] Image downloading with local storage
- [ ] Custom filters (regex patterns for sections)
- [ ] Diff mode (compare scrapes over time)
- [ ] Multi-format export (JSON, YAML)
- [ ] Webhook notifications

### v2.0 - AI Integration
- [ ] Auto-generate MCP tools from docs
- [ ] TypeScript client generation
- [ ] OpenAPI spec extraction
- [ ] Semantic search across docs
- [ ] Documentation quality scoring

### v3.0 - Enterprise Features
- [ ] Multi-source integration
- [ ] Scheduled scraping
- [ ] Change detection alerts
- [ ] Team collaboration features
- [ ] Cloud storage integration

---

## 💡 Pro Tips

### Choosing the Right Settings

**Small sites (<50 pages):**
```bash
npm run scrape -- <url> --concurrent 3 --delay 500
# Fast and respectful
```

**Medium sites (50-200 pages):**
```bash
npm run scrape -- <url> --concurrent 2 --delay 1000 --zip
# Default settings + zip for backup
```

**Large sites (200+ pages):**
```bash
npm run scrape -- <url> --concurrent 1 --delay 2000
# Conservative, use pause/resume
```

### Best Practices

**1. Always use `--zip` for backups**
```bash
npm run scrape -- <url> --output ./docs --zip
```
- Creates instant backup
- Easy to share
- 60-80% size reduction

**2. Use pause/resume for large sites**
- Press SPACE during scraping
- Choose [S] to save and exit
- Resume with `--resume ./output/dir`

**3. Organize your downloads**
```bash
./docs/
├── privy/         # One site per folder
├── etherscan/
└── stripe/
```

**4. For AI context, use COMPLETE.md**
```bash
# Direct copy
cat docs/privy/COMPLETE.md | pbcopy

# Or reference in prompt
"Based on docs/privy/COMPLETE.md..."
```

### Troubleshooting

**Pages missing?**
- Try `--crawl-depth 10` for deeper recursion
- Check if site uses JavaScript rendering (Mintlify usually doesn't)

**Scraping too slow?**
- Increase `--concurrent` (be respectful)
- Decrease `--delay` (only for small sites)

**Rate limited?**
- Decrease `--concurrent 1`
- Increase `--delay 3000`
- Use pause/resume to spread out over time

---

## 🤝 Contributing

We welcome contributions! Here are some ways you can help:

### High-Impact Contributions
- Implement rate limit detection (429 handling)
- Add smart retry with backoff
- Build real-time statistics display
- Create content validation system
- Implement image downloading

### Future Features
- Support for other doc platforms (Docusaurus, GitBook)
- GraphQL schema extraction
- Multi-language client generation
- Documentation quality metrics
- Test generation from examples

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📊 Real-World Impact

### Before This Tool
- **Time to download docs:** Manual copy-paste for hours
- **Risk of data loss:** High (browser crash, accidental close)
- **Documentation format:** Scattered across pages
- **Resume capability:** None - start over
- **AI context preparation:** Manual compilation

### After This Tool
- **Time to download docs:** Minutes (with pause/resume)
- **Risk of data loss:** Zero (auto-save every 10 pages)
- **Documentation format:** Single COMPLETE.md file
- **Resume capability:** Full support (save anytime, resume later)
- **AI context preparation:** Copy one file

### Example: Scraping Privy Docs
- **Pages:** ~100+ documentation pages
- **Time without tool:** 2-4 hours manual work
- **Time with tool:** 5-10 minutes automated
- **Time saved:** ~95% reduction
- **Interruption handling:** Pause/resume anytime
- **Auto-save frequency:** Every 10 pages

---

## 🚨 Responsible Use

**Please respect the sites you scrape:**

✅ **DO:**
- Use reasonable rate limits (defaults are respectful)
- Only scrape publicly accessible documentation
- Respect robots.txt
- Cache results to avoid re-scraping
- Use `--zip` to create backups instead of re-downloading
- Use pause/resume for large jobs to spread load over time

❌ **DON'T:**
- Scrape private or paywalled content
- Overload servers with aggressive settings
- Ignore rate limiting (429 errors)
- Re-scrape frequently without need

**Example: Respectful large-scale scraping**
```bash
# For 500+ pages, use conservative settings
npm run scrape -- https://docs.large-site.com \
  --output ./docs \
  --concurrent 1 \
  --delay 3000 \
  --zip

# Use pause/resume to spread over multiple sessions
# Auto-saves every 10 pages, so you can stop anytime
```

---

## 🗺️ Roadmap

### Roadmap

#### 🔍 **Vector Search with Embeddings**
- Semantic search across all scraped docs
- Find content by meaning, not just keywords
- Hybrid search (keyword + semantic)
- Auto-suggest and related docs
- Providers: OpenAI, local sentence-transformers

#### 🤖 **Chatbot Training Data Exporter**
- Export docs in OpenAI fine-tuning format
- Auto-generate Q&A pairs from documentation
- Create custom GPTs from any docs
- Support for LLaMA, GPT, Claude formats
- Validation test set generation

#### 📸 **Visual Regression Testing**
- Compare scraped docs over time
- Detect changed, new, deleted pages
- Track code example updates
- Identify broken links
- Maintain version history

#### 🔄 **Real-Time Sync & Watch Mode**
- Continuously monitor documentation sites
- Auto-detect and scrape only changed pages
- Scheduled updates (hourly, daily, weekly)
- Notifications on major changes
- Incremental updates with version control

#### 🧪 **Code Example Tester**
- Automatically run code examples
- Validate output matches expectations
- Support for JavaScript, Python, Go, more
- AI-powered auto-fix for broken examples
- Integration with CI/CD

### 📋 Planned Features

#### 🌍 **Auto-Translation Pipeline**
- Translate docs to 50+ languages
- OpenAI, DeepL, Google Translate support
- Preserve code blocks and links
- Technical glossary support
- One command multilingual docs

#### 🎥 **Interactive Tutorials Generator**
- Convert static docs to step-by-step tutorials
- Progress tracking and code validation
- Hints and achievements system
- Gamified learning experience
- Export to Mintlify or standalone

#### 🔗 **Dependency Graph Visualizer**
- Interactive map of page relationships
- Topic clustering and navigation paths
- Identify orphaned pages and hubs
- Visual documentation structure
- Export as SVG, PNG, interactive HTML

#### 🎨 **Auto-Generated Diagrams**
- Architecture diagrams from docs
- Flowcharts for processes
- Sequence diagrams for APIs
- Mind maps for concepts
- Mermaid, PlantUML, D2 support

#### 📊 **Documentation Analytics Dashboard**
- Track page views and search queries
- Monitor time on page and exit pages
- Code copy click tracking
- Common user paths analysis
- Export analytics to CSV

#### 🎯 **Smart Content Recommendations**
- AI-powered similar pages suggestions
- Next steps and prerequisites
- Related API endpoints
- Logical learning progression
- Context-aware recommendations

#### 📝 **Changelog Generator**
- Auto-generate changelogs from doc diffs
- Detect breaking changes
- Track new endpoints and features
- Identify deprecated content
- Version comparison reports

#### 🎓 **Learning Path Generator**
- AI creates structured curriculum
- Beginner to expert paths
- Prerequisites and time estimates
- Progress tracking
- Personalized recommendations

#### 📱 **Mobile App Generator**
- Generate React Native/Flutter apps
- Offline documentation access
- Search, bookmarks, dark mode
- Code copy and syntax highlighting
- Push notifications for updates

#### 🔐 **Enterprise Features**
- SSO integration (Okta, Auth0)
- Role-based access control
- Audit logging
- Private hosting options
- White-label customization
- Advanced analytics

### ✅ Quick Wins (Coming Very Soon)

- **Offline Mode** - PWA with service worker
- **Dark Mode Detection** - Auto light/dark themes
- **Reading Time Estimates** - "5 min read" indicators
- **Print Optimization** - Clean print CSS
- **Keyboard Shortcuts** - Power user features
- **Copy Link to Section** - Share specific headings
- **Version Selector** - Switch between doc versions

### 💡 Feature Requests

Have an idea? [Open an issue](https://github.com/nirholas/mintlify-ai-toolkit/issues) or [start a discussion](https://github.com/nirholas/mintlify-ai-toolkit/discussions)!

---

## 🎓 Learn More

- [Mintlify Documentation Platform](https://mintlify.com)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
- [How to Build MCP Servers](../../../docs/MCP_DEVELOPMENT.md)

---

## License

MIT License

---

## Acknowledgments

Built with:
- [Cheerio](https://cheerio.js.org/) - HTML parsing
- [tsx](https://github.com/esbuild-kit/tsx) - TypeScript execution

---

Making documentation accessible to both humans and AI agents.
