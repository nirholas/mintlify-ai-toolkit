# Examples

Real-world examples of using the Mintlify documentation scraper and MCP server generator.

## 📚 Available Examples

### [MCP Server Quickstart](./mcp-server-quickstart.md) ⭐ **NEW!**
Complete guide to generating a working MCP server for Claude Desktop in under 10 minutes.

**What you'll learn:**
- One-command MCP server generation
- Step-by-step setup for Claude Desktop
- Implementing tool handlers
- Testing and debugging
- Real-world implementation examples

**Perfect for:** Claude Desktop users, MCP beginners, anyone wanting custom AI tools

---

### [Privy MCP Workflow](./privy-mcp-workflow.md)
Complete workflow for scraping Privy documentation and building an MCP server.

**What you'll learn:**
- How to scrape documentation with pause/resume
- Loading docs into AI context
- Using metadata for structure
- Building MCP tools from scraped docs
- Handling interruptions
- Sharing with team via zip archives

**Perfect for:** First-time users, MCP server developers

---

### [Multi-Site Comparison](./multi-site-comparison.md)
Comparing documentation across multiple similar services.

**What you'll learn:**
- Scraping multiple sites systematically
- Comparing features with grep
- Creating comparison documents
- AI-assisted comparison
- Tracking changes over time
- Multi-chain and DeFi examples

**Perfect for:** Evaluating multiple services, research, competitive analysis

---

### [1inch MCP Server](./1inch-mcp-server.md)
Building an MCP server for 1inch DEX aggregator.

**Original example** showing:
- API endpoint discovery
- MCP tool generation
- Real integration code

---

### [Etherscan Integration](./etherscan.md)
Scraping and using Etherscan documentation.

**Original example** showing:
- Blockchain explorer docs
- API reference extraction
- Multi-chain support patterns

---

## Quick Start Templates

### Template: Basic Scraping

```bash
# Scrape any Mintlify site
npm run scrape -- https://docs.example.com --output ./docs/example --zip
```

### Template: Large Site with Pause

```bash
# Start scraping
npm run scrape -- https://docs.large-site.com --output ./docs

# Press SPACE to pause
# Choose [S] to save & exit
# Resume later with:
npm run scrape -- --resume ./docs
```

### Template: AI Context Loading

```bash
# 1. Scrape
npm run scrape -- https://docs.example.com --output ./docs

# 2. Load into AI
cat docs/COMPLETE.md | pbcopy

# 3. Ask AI
# "Based on docs/COMPLETE.md, create MCP tools for..."
```

### Template: Multi-Site Comparison

```bash
# Scrape multiple sites
npm run scrape -- https://docs.site1.com --output ./compare/site1 --zip
npm run scrape -- https://docs.site2.com --output ./compare/site2 --zip
npm run scrape -- https://docs.site3.com --output ./compare/site3 --zip

# Compare features
grep -r "feature-name" compare/*/COMPLETE.md
```

---

## 💡 Example Use Cases

### For MCP Server Development
1. Scrape API documentation
2. Load COMPLETE.md into AI
3. Generate MCP tool definitions
4. Implement handlers with full API knowledge

**See:** [privy-mcp-workflow.md](./privy-mcp-workflow.md)

### For Service Evaluation
1. Scrape competitor documentation
2. Compare features with grep
3. Create comparison matrix
4. Make informed decision

**See:** [multi-site-comparison.md](./multi-site-comparison.md)

### For Offline Reference
1. Scrape documentation with --zip
2. Archive for offline use
3. Share with team
4. Version control for changes

**See:** Both examples above

### For Integration Development
1. Scrape complete API docs
2. Reference during development
3. Copy code examples
4. Understand auth flows

**See:** [1inch-mcp-server.md](./1inch-mcp-server.md), [etherscan.md](./etherscan.md)

---

## 🎯 Choose Your Example

**New to the tool?**  
→ Start with [Privy MCP Workflow](./privy-mcp-workflow.md)

**Comparing services?**  
→ See [Multi-Site Comparison](./multi-site-comparison.md)

**Building an MCP server?**  
→ Check [1inch MCP Server](./1inch-mcp-server.md)

**Working with blockchain?**  
→ Review [Etherscan Integration](./etherscan.md)

---

## 📝 Contributing Examples

Have a great workflow? Share it!

1. Create a new `.md` file in `examples/`
2. Follow the format of existing examples
3. Include:
   - Clear use case
   - Step-by-step commands
   - Expected output
   - Tips and tricks
4. Update this README
5. Submit a PR

**Popular topics for examples:**
- Web3 protocol integration
- AI/ML API documentation
- Payment processor docs
- SaaS product docs
- Multi-language documentation
