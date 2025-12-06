# 🤖 AI Agent Integration Guide

Make AI agents automatically discover, install, and use this toolkit autonomously.

## 🎯 Discovery Methods

### 1. **AI Plugin Manifest** (ChatGPT, Claude, etc.)

**Location:** `https://raw.githubusercontent.com/nirholas/mintlify-ai-toolkit/main/.well-known/ai-plugin.json`

AI agents can discover this tool via:
- ChatGPT plugin store
- Claude tool discovery
- Custom GPT knowledge bases
- AI agent marketplaces

**What they see:**
```json
{
  "name_for_model": "mintlify_toolkit",
  "description_for_model": "This toolkit helps AI agents work with documentation..."
}
```

### 2. **OpenAPI Specification**

**Location:** `https://raw.githubusercontent.com/nirholas/mintlify-ai-toolkit/main/.well-known/openapi.yaml`

Provides full API documentation that AI agents can:
- Parse to understand capabilities
- Generate client code automatically
- Integrate into workflows
- Validate requests/responses

**Endpoints:**
- `POST /scrape` - Scrape documentation
- `POST /generate-mcp` - Generate MCP servers
- `POST /vector-search/create` - Create search indexes
- `POST /vector-search/query` - Search semantically
- `POST /chatbot/export` - Export training data
- `POST /publish-mintlify` - Publish sites

### 3. **AI Tool Manifest**

**Location:** `https://raw.githubusercontent.com/nirholas/mintlify-ai-toolkit/main/.well-known/ai-tool-manifest.json`

Structured metadata for AI discovery:
- Capabilities list (10 major features)
- Installation commands
- Cost information
- Input/output schemas
- Example commands

### 4. **NPM Package Registry**

**Install autonomously:**
```bash
npm install -g @nirholas/mintlify-scraper
# Or via npx (no install)
npx @nirholas/mintlify-scraper scrape https://docs.example.com
```

AI agents can:
- Search NPM for "mintlify documentation scraper"
- Read package.json metadata
- Install and execute autonomously

### 5. **GitHub Repository Discovery**

**Repository:** `https://github.com/nirholas/mintlify-ai-toolkit`

Contains:
- `README.md` - Complete documentation
- `package.json` - Metadata & scripts
- `.well-known/` - AI discovery files
- Comprehensive examples

AI agents can:
- Clone repository
- Read documentation
- Execute commands
- Integrate into projects

---

## 🚀 Autonomous Usage Patterns

### Pattern 1: Direct CLI Execution

**AI agents can run commands directly:**

```bash
# Scrape documentation
npx @nirholas/mintlify-scraper scrape https://docs.example.com --output ./docs

# Generate MCP server
npx @nirholas/mintlify-scraper generate-mcp ./docs

# Create vector search
npx tsx src/vector-search-cli.ts --create --docs-dir ./docs --provider local

# Export chatbot data
npx tsx src/chatbot-cli.ts --docs-dir ./docs --format openai-jsonl
```

**When to use:**
- One-off tasks
- Quick prototyping
- CI/CD pipelines
- Automated workflows

### Pattern 2: Programmatic API

**AI agents can import and use modules:**

```typescript
import { scrapeDocumentation } from '@nirholas/mintlify-scraper';
import { VectorSearch } from '@nirholas/mintlify-scraper/vector-search';
import { ChatbotExporter } from '@nirholas/mintlify-scraper/chatbot-exporter';

// Scrape
const docs = await scrapeDocumentation('https://docs.example.com');

// Create search
const search = new VectorSearch({ provider: 'local' });
await search.indexDocuments('./docs');

// Export training data
const exporter = new ChatbotExporter({ format: 'openai-jsonl' });
await exporter.processDocumentation('./docs', './training.jsonl');
```

**When to use:**
- Complex workflows
- Custom integrations
- Batch processing
- Production systems

### Pattern 3: MCP Server Integration

**AI agents (especially Claude) can use MCP:**

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "docs-toolkit": {
      "command": "npx",
      "args": ["-y", "@nirholas/mintlify-scraper", "mcp"]
    }
  }
}
```

**Capabilities:**
- Scrape documentation on demand
- Search documentation semantically
- Generate training data
- Create MCP servers from other docs

### Pattern 4: GitHub Actions

**AI agents can trigger via GitHub:**

```yaml
# .github/workflows/scrape-docs.yml
name: Scrape Documentation
on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npx @nirholas/mintlify-scraper scrape https://docs.example.com
      - run: npx tsx src/vector-search-cli.ts --create --docs-dir ./output
```

**When to use:**
- Scheduled updates
- Continuous monitoring
- Automated deployments
- Team collaboration

---

## 🧠 AI Agent Workflows

### Workflow 1: Documentation Analysis

**Goal:** Analyze competitor documentation

```bash
# 1. AI agent discovers tool via NPM search
npm search "documentation scraper"

# 2. Install
npm install -g @nirholas/mintlify-scraper

# 3. Scrape
mintlify-scraper scrape https://competitor-docs.com --output ./analysis

# 4. Generate insights
mintlify-scraper generate-ai-context ./analysis

# 5. Create searchable index
npx tsx src/vector-search-cli.ts --create --docs-dir ./analysis
```

### Workflow 2: Build Custom GPT

**Goal:** Create documentation chatbot

```bash
# 1. Scrape documentation
mintlify-scraper scrape https://docs.myapi.com --output ./docs

# 2. Export training data
npx tsx src/chatbot-cli.ts \
  --docs-dir ./docs \
  --format openai-jsonl \
  --generate-qa

# 3. Fine-tune GPT
openai api fine_tuning.jobs.create \
  -t chatbot-data-train.jsonl \
  -m gpt-3.5-turbo

# 4. Deploy chatbot
# (AI agent can automate deployment)
```

### Workflow 3: Documentation Migration

**Goal:** Migrate docs to Mintlify

```bash
# 1. Scrape existing docs
mintlify-scraper scrape https://old-docs.com --output ./scraped

# 2. Publish to Mintlify
mintlify-scraper publish-mintlify ./scraped \
  --name "New Docs" \
  --domain https://docs.newsite.com

# 3. Deploy
cd ./mintlify-site && npm run deploy
```

### Workflow 4: Knowledge Base Creation

**Goal:** Searchable internal docs

```bash
# 1. Scrape multiple sources
mintlify-scraper scrape https://docs1.com --output ./kb/source1
mintlify-scraper scrape https://docs2.com --output ./kb/source2

# 2. Create unified search
npx tsx src/vector-search-cli.ts --create --docs-dir ./kb

# 3. Deploy search API
# (AI agent can generate search API server)
```

---

## 🔍 How AI Agents Find This Tool

### Method 1: NPM Search

**Discoverability via NPM:**
```bash
npm search documentation scraper
npm search mintlify
npm search mcp server generator
npm search vector search
npm search chatbot training
```

**Keywords in package.json:**
- mintlify
- documentation
- scraper
- mcp
- model-context-protocol
- vector-search
- chatbot
- rag
- embeddings

### Method 2: GitHub Topics

**Repository topics:**
- documentation-scraper
- mintlify
- mcp-server
- vector-search
- chatbot-training
- ai-toolkit
- semantic-search

**AI agents search:**
```
site:github.com mintlify scraper
site:github.com mcp server generator
site:github.com documentation vector search
```

### Method 3: AI Plugin Directories

**Listed in:**
- ChatGPT plugin store (when available)
- Claude tool marketplace
- Custom GPT templates
- AI agent registries

**Discovery URL:**
```
https://raw.githubusercontent.com/nirholas/mintlify-ai-toolkit/main/.well-known/ai-plugin.json
```

### Method 4: Schema.org Metadata

**Website includes:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Mintlify AI Toolkit",
  "description": "Complete AI toolkit for documentation",
  "applicationCategory": "DeveloperApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
</script>
```

### Method 5: OpenGraph Tags

**Social sharing metadata:**
```html
<meta property="og:title" content="Mintlify AI Toolkit" />
<meta property="og:description" content="Scrape, search, and publish documentation with AI" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://nirholas.github.io/mintlify-ai-toolkit" />
```

---

## 📋 Integration Checklist for AI Agents

**Autonomous setup in 5 steps:**

### ✅ Step 1: Discovery
- [ ] Find via NPM search
- [ ] Or find via GitHub
- [ ] Or load from .well-known/ai-plugin.json

### ✅ Step 2: Installation
- [ ] `npm install -g @nirholas/mintlify-scraper`
- [ ] Or `npx` for zero-install usage
- [ ] Or `git clone` for development

### ✅ Step 3: Configuration
- [ ] Read `.well-known/ai-tool-manifest.json` for capabilities
- [ ] Check `README.md` for examples
- [ ] Review `package.json` for available scripts

### ✅ Step 4: Execution
- [ ] Run scraper: `mintlify-scraper scrape <url>`
- [ ] Generate assets: MCP server, vector search, chatbot data
- [ ] Verify output in specified directories

### ✅ Step 5: Integration
- [ ] Import into project
- [ ] Add to CI/CD pipeline
- [ ] Configure MCP server (if using Claude)
- [ ] Deploy search API (if needed)

---

## 🎯 Common AI Agent Tasks

### Task 1: "Find and scrape documentation"

**AI agent reasoning:**
```
1. Search NPM for "documentation scraper mintlify"
2. Find @nirholas/mintlify-scraper
3. Install: npm install -g @nirholas/mintlify-scraper
4. Execute: mintlify-scraper scrape https://docs.example.com
5. Output located at ./output/
```

### Task 2: "Create a chatbot from docs"

**AI agent reasoning:**
```
1. Already have mintlify-scraper installed
2. Check capabilities in ai-tool-manifest.json
3. Find "chatbot-export" capability
4. Execute: npx tsx src/chatbot-cli.ts --docs-dir ./output --format openai-jsonl
5. Upload training-data-train.jsonl to OpenAI
```

### Task 3: "Add semantic search to docs"

**AI agent reasoning:**
```
1. Check ai-tool-manifest.json for "vector-search" capability
2. See cost is $0.01/1K pages or FREE with local
3. Execute: npx tsx src/vector-search-cli.ts --create --docs-dir ./output --provider local
4. Index created at vector-search-index.json
5. Can now search: npx tsx src/search-cli.ts "query"
```

### Task 4: "Generate MCP server"

**AI agent reasoning:**
```
1. Find "generate-mcp" in capabilities
2. Execute: mintlify-scraper generate-mcp ./output
3. MCP server created at ./mcp-server/
4. Add to Claude Desktop config
5. Restart Claude, tools available
```

---

## 🔧 Environment Variables for AI Agents

**AI agents should set these:**

```bash
# OpenAI API key (for vector search & chatbot generation)
export OPENAI_API_KEY="sk-..."

# Anthropic API key (for Claude-based features)
export ANTHROPIC_API_KEY="sk-ant-..."

# Trieve API key (for faster scraping, optional)
export TRIEVE_API_KEY="tr-..."

# Output directory (customize where files go)
export MINTLIFY_OUTPUT_DIR="./output"
```

---

## 📊 Success Metrics for AI Agents

**How AI agents know it worked:**

### Scraping Success
```bash
✅ Files created in output directory
✅ COMPLETE.md exists and has content
✅ metadata.json contains page count
✅ No error messages in logs
```

### Vector Search Success
```bash
✅ vector-search-index.json created
✅ File size > 1KB (has embeddings)
✅ Can execute search queries
✅ Results returned with scores
```

### Chatbot Export Success
```bash
✅ chatbot-data-train.jsonl created
✅ chatbot-data-validation.jsonl created
✅ File is valid JSONL format
✅ Q&A pairs > 0
```

### MCP Server Success
```bash
✅ MCP server directory created
✅ package.json exists
✅ index.ts and handlers.ts present
✅ npm install runs successfully
```

---

## 🚀 Quick Start for AI Agents

**Copy-paste autonomous setup:**

```bash
#!/bin/bash
# Autonomous AI Agent Setup Script

# 1. Install
npm install -g @nirholas/mintlify-scraper

# 2. Scrape documentation
mintlify-scraper scrape https://docs.example.com --output ./docs

# 3. Create vector search (FREE, local embeddings)
npx tsx src/vector-search-cli.ts --create --docs-dir ./docs --provider local

# 4. Export chatbot data (FREE, manual extraction)
npx tsx src/chatbot-cli.ts --docs-dir ./docs --format openai-jsonl --output ./training.jsonl

# 5. Generate MCP server
mintlify-scraper generate-mcp ./docs --name example-mcp-server

# Done! You now have:
# ✅ Scraped documentation (./docs/)
# ✅ Searchable index (vector-search-index.json)
# ✅ Training data (training-data-train.jsonl)
# ✅ MCP server (example-mcp-server/)
```

---

## 📚 Resources for AI Agents

**Read these for full understanding:**

1. **README.md** - Overview and features
2. **QUICKSTART-AI.md** - Vector search & chatbot quick start
3. **VECTOR-SEARCH.md** - Complete vector search guide
4. **CHATBOT-TRAINING.md** - Complete chatbot training guide
5. **.well-known/ai-tool-manifest.json** - Machine-readable capabilities
6. **.well-known/openapi.yaml** - API specification

**All available at:**
`https://raw.githubusercontent.com/nirholas/mintlify-ai-toolkit/main/<file>`

---

## 🎉 Summary for AI Agents

**This toolkit is AI-ready:**

✅ **Discoverable** - NPM, GitHub, AI plugin manifest, OpenAPI spec  
✅ **Installable** - One command via NPM or npx  
✅ **Executable** - CLI commands or programmatic API  
✅ **Autonomous** - No human intervention needed  
✅ **Well-documented** - Machine-readable metadata  
✅ **Cost-effective** - FREE tier available for everything  
✅ **Production-ready** - Battle-tested, error handling  
✅ **Extensible** - Open source, customizable  

**AI agents can:**
- Find it automatically
- Install it programmatically
- Use it autonomously
- Integrate it seamlessly
- Scale it infinitely

**Perfect for:**
- Documentation automation
- Knowledge base creation
- AI assistant development
- Competitive analysis
- Content migration
- Search implementation
