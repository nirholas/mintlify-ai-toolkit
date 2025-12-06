# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2025-12-06

### Vector Search & Chatbot Training + AI Discoverability

This release adds two game-changing features and makes the toolkit fully discoverable by AI agents.

### Added - Vector Search & Semantic Discovery 🔍

- **Vector Search Engine** (`src/vector-search.ts`)
  - Semantic search across documentation (find by meaning, not keywords)
  - Hybrid search (combines semantic + keyword matching for best results)
  - Related documents finder (auto-discover similar pages)
  - Auto-suggest (smart query completions)
  - OpenAI embeddings ($0.02/1M tokens = ~$0.01 per 1000 pages)
  - Local embeddings via sentence-transformers (100% FREE, offline)
  - Cohere support for multilingual search
  - Multiple vector stores: Pinecone, Qdrant, Chroma, local JSON
  - Configurable chunking (size, overlap, metadata)
  - CLI: `npm run create-vector-index`, `npm run search-docs`
  - Full guide: `VECTOR-SEARCH.md` (400+ lines)

- **Chatbot Training Data Exporter** (`src/chatbot-exporter.ts`)
  - Auto-generate Q&A pairs from documentation using AI
  - Manual Q&A extraction from FAQs, how-tos, code examples (FREE)
  - Export formats: OpenAI JSONL, LLaMA, Claude, JSON, CSV
  - Automatic train/validation split (80/20)
  - Quality filtering (length, code presence, etc.)
  - Custom system prompts for bot personality
  - OpenAI/Anthropic/local LLM support
  - Cost: $0.10 per 1000 pages (AI) or FREE (manual)
  - Yield: 3-10 Q&A pairs per page
  - CLI: `npm run export-chatbot-data`
  - Full guide: `CHATBOT-TRAINING.md` (500+ lines)

### Added - AI Discoverability 🤖

- **AI Plugin Manifest** (`.well-known/ai-plugin.json`)
  - ChatGPT plugin discovery format
  - Claude tool discovery format
  - Custom GPT knowledge base compatible
  - Includes API endpoints and authentication

- **OpenAPI 3.1 Specification** (`.well-known/openapi.yaml`)
  - Complete API documentation
  - 6 core endpoints (scrape, generate-mcp, vector-search, chatbot-export, etc.)
  - AI agents can auto-generate client code
  - Request/response schemas for all operations

- **AI Tool Manifest** (`.well-known/ai-tool-manifest.json`)
  - Comprehensive capability definitions (10 features)
  - Input/output schemas for each capability
  - Cost information ($0 to $0.10 per 1000 pages)
  - Speed metrics (10-100x faster scraping)
  - Example commands for autonomous usage
  - Installation methods (npm, npx, git)
  - AI integration patterns (MCP, function calling, RAG)

- **AI Agent Integration Guide** (`AI-AGENT-INTEGRATION.md`)
  - 5 discovery methods (NPM, GitHub, AI manifests)
  - Autonomous usage patterns (CLI, API, MCP)
  - Example workflows for common tasks
  - Integration with Claude Desktop, Cursor, Cline, Windsurf
  - Step-by-step setup for AI agents
  - 400+ lines of integration documentation

- **SEO & Crawler Optimization**
  - `robots.txt` with AI crawler permissions
  - `sitemap.xml` with all documentation URLs
  - 20+ NPM keywords for discoverability
  - GitHub topics for search optimization

### Added - Complete AI Toolkit 🧠

- **Documentation Guides** (2500+ lines total)
  - `VECTOR-SEARCH.md` - Complete vector search guide with examples
  - `CHATBOT-TRAINING.md` - Complete chatbot training guide with examples
  - `QUICKSTART-AI.md` - Quick start for both features (5 minutes)
  - `AI-AGENT-INTEGRATION.md` - Autonomous AI agent integration guide
  - `AI-DISCOVERABILITY-COMPLETE.md` - Implementation summary

- **Example Configurations** (7 configs)
  - `config/vector-search.json` - OpenAI embeddings
  - `config/vector-search-local.json` - Local embeddings (FREE)
  - `config/chatbot-training.json` - AI-generated Q&A
  - `config/chatbot-training-manual.json` - Manual extraction (FREE)
  - `config/chatbot-training-api.json` - API docs specialized
  - All configs with detailed inline comments

- **CLI Tools** (3 new commands)
  - `npm run create-vector-index` - Create searchable index
  - `npm run search-docs` - Interactive semantic search
  - `npm run export-chatbot-data` - Export training data

### Added - Infrastructure & Developer Experience 🛠️

- **GitHub Actions Workflows**
  - `.github/workflows/ci.yml` - Automated testing (3 OS × 3 Node versions)
  - `.github/workflows/publish.yml` - NPM auto-publishing on release
  - Validates AI discovery files, OpenAPI spec, linting, tests

- **Issue Templates**
  - `.github/ISSUE_TEMPLATE/bug_report.yml` - Structured bug reports
  - `.github/ISSUE_TEMPLATE/feature_request.yml` - Structured feature requests
  - YAML forms with dropdowns, checkboxes, validation

- **Security & Compliance**
  - `SECURITY.md` - Security policy and vulnerability reporting
  - Supported versions table (1.5.x and 1.4.x supported)
  - Private disclosure process with 48hr response SLA
  - Security considerations for API keys and data privacy

- **Quality Assurance**
  - `PRE-LAUNCH-CHECKLIST.md` - Comprehensive 50+ item checklist
  - Validation commands for package.json, NPM, testing, security
  - Ready-to-launch commands for git tagging and publishing
  - Organized into 10 sections (package, npm, testing, docs, security, etc.)

### Improved - Package & Metadata 📦

- **NPM Discoverability**
  - Added 20+ AI-related keywords to `package.json`
  - Enhanced package description and metadata
  - Proper exports configuration for ESM/CJS
  - bin entries for CLI tools

- **README Updates**
  - Added AI Discoverability section with badges
  - Updated feature list with vector search and chatbot training
  - Links to new documentation guides
  - Quick start examples for AI features

### Technical Details

**New Dependencies:**
- `@anthropic-ai/sdk` - Anthropic Claude API support
- `openai` - OpenAI API for embeddings and chat
- `chromadb` (optional) - Chroma vector database client
- `@pinecone-database/pinecone` (optional) - Pinecone vector database client
- `@qdrant/js-client-rest` (optional) - Qdrant vector database client

**Cost & Performance:**
- Vector Search: $0.01 per 1000 pages (OpenAI) or FREE (local)
- Chatbot Training: $0.10 per 1000 pages (AI) or FREE (manual)
- Speed: 10-100x faster than manual documentation scraping
- Local embeddings: 100% offline, no API costs

**Backward Compatibility:**
- ✅ 100% backward compatible with v1.4.x
- ✅ All existing configs and APIs work unchanged
- ✅ New features are opt-in (require config flags)
- ✅ No breaking changes

### Migration Guide

No migration needed! All new features are additive:

1. **Update to v1.5.0:**
   ```bash
   git pull origin main
   npm install
   npm run build
   ```

2. **Try Vector Search (optional):**
   ```bash
   npm run create-vector-index config/vector-search.json
   npm run search-docs
   ```

3. **Try Chatbot Training (optional):**
   ```bash
   npm run export-chatbot-data config/chatbot-training.json
   ```

All existing scraping and MCP generation features work exactly as before!

### Stats 📊

- **New Code:** 2000+ lines TypeScript (vector-search.ts, chatbot-exporter.ts)
- **New Documentation:** 4000+ lines across 8 guides
- **Example Configs:** 7 ready-to-use configurations
- **CLI Tools:** 3 new interactive commands
- **AI Discovery:** 5 mechanisms (NPM, AI manifests, GitHub topics, etc.)
- **Test Coverage:** CI testing on 9 OS/Node combinations

---



- **🧠 AI Context Generator**
  - Generate .cursorrules for Cursor AI
  - Generate .clinerules for Cline assistant
  - Generate claude-context.md for Claude Desktop
  - Generate .windsurfrules for Windsurf IDE
  - Auto-extract API endpoints from documentation
  - Identify code patterns (HTTP requests, async/await, error handling)
  - Include best practices and integration checklists
  - Token-optimized context (~8000 token limit)
  - CLI: `npm run generate-ai-context`

- **🛠️ Multi-Framework Tool Generator**
  - MCP (Model Context Protocol) tool definitions
  - OpenAI function calling format with usage examples
  - LangChain DynamicStructuredTool with Zod schemas
  - Anthropic Claude tool use format with examples
  - Google Gemini function declarations
  - Vercel AI SDK tool definitions with execute functions
  - Auto-convert documentation to tool definitions
  - CLI: `npm run generate-ai-tools`

- **🔮 RAG Generator**
  - Semantic chunking with configurable size and overlap
  - Rich metadata: section, title, URL, type, keywords, tokens
  - Q&A pair generation from documentation chunks
  - Export formats: JSON, JSONL, CSV
  - Vector database import scripts:
    - Pinecone (batch upload with OpenAI embeddings)
    - Weaviate (schema creation and properties)
    - Chroma (collection creation and batch add)
    - Qdrant (points with vectors and payloads)
    - Milvus (collection with FloatVector fields)
  - Keyword extraction and token estimation
  - CLI: `npm run generate-rag`

- **📝 TypeScript Type Generator**
  - Auto-generate TypeScript interfaces from API docs
  - Generate Zod schemas with validation
  - Type inference from z.infer
  - Extract from MCP tools or documentation
  - Support for optional fields and arrays
  - CLI: `npm run generate-types`

- **💻 Enhanced Code Example Extractor**
  - Organize code examples by programming language
  - Auto-detect dependencies (imports/requires)
  - Preserve context (titles, descriptions, source files)
  - Generate Jest test suites for JavaScript/TypeScript
  - Generate Pytest test suites for Python
  - Create runnable, self-contained examples
  - Support for 10+ languages
  - CLI: `npm run extract-code`

- **📚 Documentation**
  - Complete AI Features Guide (AI-FEATURES.md)
  - Integration examples for each AI tool
  - Best practices for AI optimization
  - Troubleshooting guide
  - Updated README with AI toolkit section

## [1.4.0] - 2025-12-06

### Added - Complete Mintlify Feature Set 🎨

- **🎨 All Mintlify MDX Components**
  - Added Tabs and Tab components for tabbed content
  - Added Accordion and AccordionGroup for collapsible sections
  - Added CodeGroup for multi-language code examples
  - Added Callouts: Note, Info, Tip, Warning, Check
  - Added Steps component for numbered instructions
  - Added ParamField and ResponseField for API documentation
  - Added Expandable for nested content
  - Added Frame component for images with captions
  
- **📊 Advanced Analytics Integration**
  - Google Analytics 4 (GA4) support via `--ga4` flag
  - Mixpanel integration via `--mixpanel` flag
  - PostHog analytics via `--posthog` flag
  - Auto-configured in mint.json
  
- **💬 Feedback & Interaction**
  - Thumbs up/down rating via `--enable-feedback`
  - Suggest edits feature
  - Raise issues directly from docs
  
- **🎮 API Features**
  - Interactive API playground via `--enable-api-playground`
  - OpenAPI integration via `--openapi` flag
  - Auto-generate API docs from OpenAPI spec
  - API base URL configuration
  - Bearer token authentication setup
  
- **✂️ Reusable Snippets**
  - Auto-generated snippets folder
  - API key snippet with security warnings
  - Rate limits snippet with table
  - Error handling snippet with examples
  - Use with `<Snippet file="snippet-name.mdx" />`
  
- **📄 Example Documentation Pages**
  - Complete API reference example with all components
  - Components showcase page demonstrating every feature
  - Real code examples in JavaScript, Python, Go, PHP, Ruby
  - Best practices and patterns
  
- **⚙️ Enhanced mint.json Configuration**
  - Search configuration with custom prompts
  - Mode toggle settings (light/dark)
  - Metadata for SEO (og:image, twitter:site)
  - LinkedIn social links
  - Versioning support (prepared for future use)
  - Tabs for top-level navigation
  
### Enhanced
- Updated home page (introduction.mdx) with:
  - AccordionGroup for features
  - Tabs for code examples
  - Steps for onboarding flow
  - Warning and Info callouts
  - Dynamic API base URL in examples
  
- Improved CLI with new flags:
  - `--linkedin <url>` - LinkedIn company URL
  - `--ga4 <id>` - Google Analytics measurement ID
  - `--mixpanel <token>` - Mixpanel project token
  - `--posthog <key>` - PostHog API key
  - `--enable-feedback` - Enable feedback widgets
  - `--enable-api-playground` - Enable API playground
  - `--api-base-url <url>` - Base API URL
  - `--openapi <url>` - OpenAPI specification URL

### Documentation
- Updated README with comprehensive feature list
- Added all new CLI flags and examples
- Documented analytics integration
- Documented API playground setup
- Added component showcase examples

## [1.3.0] - 2025-12-06

### Added - Mintlify Site Publisher 🌐
- **🌐 Complete Mintlify Site Publisher** - Convert scraped docs to deployable Mintlify sites
  - `npm run publish-mintlify -- <docs-path>` generates complete Mintlify site
  - Auto-generates `mint.json` configuration
  - Creates organized navigation structure
  - Generates home page with Card components
  - Includes deployment guide and setup instructions
  - Ready to deploy to mintlify.com, Vercel, or Netlify
  
- **Generated Site Includes:**
  - `mint.json` - Complete Mintlify configuration
  - `introduction.mdx` - Customizable home page
  - `package.json` - Mintlify dependencies
  - `README.md` - Deployment instructions
  - `.gitignore` - Git configuration
  - Organized markdown files by section
  - Clean markdown optimized for Mintlify

- **Customization Options:**
  - `--name` - Site name
  - `--description` - Site description
  - `--domain` - Custom domain
  - `--color` - Primary brand color
  - `--logo` - Logo path
  - `--github` / `--twitter` - Social links

- **Perfect For:**
  - 🎨 Rebranding competitor documentation
  - 📚 Consolidating multiple doc sites
  - Migrating to Mintlify
  - 🏷️ White-labeling documentation
  - 🌐 Hosting on custom domains

- **Examples:**
  - [Mintlify Publishing Guide](./examples/mintlify-publishing.md) - Complete walkthrough
  - Real-world rebranding examples (Stripe, Privy, etc.)
  - Deployment guides for Mintlify, Vercel, Netlify
  - Multi-product consolidation workflows
  - White-label documentation setup

### Changed
- Updated README with Mintlify Publisher section
- Enhanced package description to highlight publishing capability
- Updated features list to showcase publishing workflow

## [1.2.0] - 2025-12-06

### Added - MCP Server Generator
- **🤖 Complete MCP Server Generator** - One command creates working MCP server
  - `npm run docs-to-mcp -- <url>` generates complete server
  - Auto-extracts API endpoints from documentation
  - Generates TypeScript server code with all tools
  - Creates package.json with dependencies
  - Includes Claude Desktop configuration
  - Adds setup README and environment template
  - Ready to use with Claude Desktop in minutes
  
- **Generated Server Includes:**
  - `index.ts` - Complete MCP server implementation
  - `handlers.ts` - Tool implementations (customizable)
  - `tools.ts` - Auto-generated tool definitions
  - `package.json` - All required dependencies
  - `tsconfig.json` - TypeScript configuration
  - `claude_desktop_config.json` - Claude Desktop setup
  - `.env.example` - Environment variable template
  - `README.md` - Complete setup instructions

- **Examples:**
  - [MCP Server Quickstart](./examples/mcp-server-quickstart.md) - Complete walkthrough
  - Step-by-step guide for creating Privy MCP server
  - Troubleshooting and customization tips

### Changed
- Updated README with MCP Server Generator section
- Added prominent MCP generator documentation
- Enhanced examples with MCP server workflows

## [1.1.0] - 2025-12-06

### Added
- ⏸️ **Interactive Pause/Resume** - Press SPACE or P to pause scraping anytime
- 💾 **Auto-Save Progress** - Automatically saves every 10 pages
- 🎮 **Pause Menu** - Options to continue, save & exit, delete all, or resume
- 📦 **Zip Archive Creation** - `--zip` flag creates compressed backup
- 🔍 **Crawl Depth Control** - `--crawl-depth` flag to control recursive link following
- 🔗 **Link Following Toggle** - `--no-follow-links` to disable recursive crawling
- ⌨️ **Keyboard Controls** - SPACE/P to pause, Ctrl+C to exit with save prompt
- 🔄 **Resume Support** - `--resume <dir>` to continue from saved progress
- 🗑️ **Data Management** - Option to delete all scraped data from pause menu
- 📊 **Progress Tracking** - Shows pages scraped and remaining count

### Changed
- Updated README with comprehensive usage examples
- Added Pro Tips section for optimal scraping settings
- Added Common Workflows section for different use cases
- Improved help text with all new options

### Features by Use Case

**For AI Agents:**
- Single COMPLETE.md file with all documentation
- Easy to copy into Claude/GPT context
- Clean markdown extraction

**For Developers:**
- Pause/resume for long-running scrapes
- Auto-save prevents data loss
- Zip archives for easy sharing
- Organized output by section

**For Projects:**
- Offline documentation backup
- Version control friendly output
- Structured metadata (JSON)

## [1.0.0] - Initial Release

### Added
- Basic Mintlify documentation scraping
- Sitemap.xml discovery
- Content extraction (markdown, code examples, API schemas)
- Organized output structure
- Rate limiting support
- Individual files by section
- Combined COMPLETE.md file
- Metadata JSON generation
