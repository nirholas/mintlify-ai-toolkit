# Contributing to Mintlify Documentation Scraper

First off, thank you for considering contributing to this project! 🎉

This tool helps developers build MCP servers faster by automating documentation scraping and tool generation. Your contributions help the entire AI agent development community.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**Good Bug Reports** include:

- **Clear title** - Describe the issue concisely
- **Steps to reproduce** - Detailed steps to recreate the bug
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Environment** - Node version, OS, etc.
- **Sample URL** - The documentation site you were scraping (if applicable)

**Example:**

```
Title: Scraper fails on pages with nested tables

Environment:
- Node: v20.10.0
- OS: macOS 14.2
- Site: https://docs.example.com

Steps to reproduce:
1. Run: npm run scrape-docs -- https://docs.example.com
2. Wait for scraping to complete
3. Check output/api-reference/complex-table.md

Expected: Table should be converted to markdown
Actual: Error "Cannot read property 'find' of undefined"
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use case** - Why is this enhancement needed?
- **Proposed solution** - How should it work?
- **Alternatives** - Other approaches you've considered
- **Examples** - Similar features in other tools

**Example Enhancement:**

```
Title: Add support for Docusaurus documentation sites

Use case:
Many popular projects use Docusaurus (React, Jest, etc.). Supporting 
Docusaurus would expand the tool's reach significantly.

Proposed solution:
- Detect Docusaurus by checking for specific meta tags
- Parse Docusaurus sidebar.json for navigation
- Handle Docusaurus-specific HTML structure

Alternatives:
- Use a plugin system where users can add parsers
- Focus only on Mintlify (current approach)

Examples:
- HTTrack handles multiple CMS types via plugins
```

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**:
   ```bash
   npm run test
   # Or test with a real site:
   npm run scrape-docs -- https://docs.etherscan.io --output ./test-output
   ```
5. **Commit** with a clear message:
   ```bash
   git commit -m "Add support for nested code blocks in tables"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## 💻 Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git

### Setup Steps

```bash
# 1. Clone your fork
git clone https://github.com/YOUR-USERNAME/scrape-mintlify.git
cd scrape-mintlify

# 2. Install dependencies
npm install

# 3. Test the scraper
npm run test

# 4. Make changes and test
npm run scrape-docs -- https://docs.etherscan.io --output ./test-output

# 5. Check generated files
ls -la test-output/
cat test-output/COMPLETE.md
```

## 📝 Code Style

### TypeScript Guidelines

- **Use TypeScript** - All code should be properly typed
- **No `any` types** - Use specific types or generics
- **Document complex logic** - Add comments for non-obvious code
- **Keep functions small** - One responsibility per function
- **Use meaningful names** - Variables and functions should be self-documenting

**Example:**

```typescript
// ✅ Good
interface ScraperConfig {
  baseUrl: string;
  outputDir: string;
  maxConcurrent: number;
}

async function extractApiEndpoint($content: cheerio.Cheerio<any>): Promise<ApiEndpoint | undefined> {
  // Implementation
}

// ❌ Bad
function doStuff(data: any): any {
  // Implementation
}
```

### Formatting

We use standard TypeScript conventions:

- **Indentation:** 2 spaces
- **Semicolons:** Yes
- **Quotes:** Single quotes for strings
- **Line length:** Max 100 characters (soft limit)
- **Trailing commas:** Yes for multi-line

### Comments

```typescript
// ✅ Good - Explain WHY, not WHAT
// Rate limiting to respect server resources and avoid IP bans
await this.sleep(this.config.delayMs);

// ❌ Bad - States the obvious
// Sleep for delayMs milliseconds
await this.sleep(this.config.delayMs);
```

## 🧪 Testing

### Manual Testing

Always test with real documentation sites:

```bash
# Test with different doc sites
npm run scrape-docs -- https://docs.etherscan.io --output ./test/etherscan
npm run scrape-docs -- https://docs.1inch.io --output ./test/1inch
npm run scrape-docs -- https://docs.gopluslabs.io --output ./test/goplus

# Verify output
cat test/etherscan/COMPLETE.md
cat test/etherscan/metadata.json
```

### Edge Cases to Test

- **Large documentation sites** (100+ pages)
- **Sites with nested tables**
- **Sites with complex code examples**
- **Sites with GraphQL schemas**
- **Sites with authentication docs**
- **Sites with broken links**
- **Sites with non-standard HTML**

### What to Verify

- [ ] All pages discovered correctly
- [ ] Markdown formatting is clean
- [ ] Code examples are preserved
- [ ] Tables are properly formatted
- [ ] Navigation structure is accurate
- [ ] No duplicate content
- [ ] Files are organized logically
- [ ] metadata.json is accurate

## 🎯 Priority Areas for Contribution

### High Priority

1. **Support more documentation platforms**
   - Docusaurus
   - ReadTheDocs
   - Sphinx

2. **Improve MCP tool generation**
   - Better parameter type detection
   - Automatic validation rules
   - Example request generation

3. **Better API client generation**
   - Full TypeScript client generation
   - Python client generation
   - Authentication handling

### Medium Priority

4. **Enhanced parsing**
   - Better table handling
   - GraphQL schema extraction
   - OpenAPI spec generation

5. **Developer experience**
   - Progress indicators
   - Better error messages
   - Resume interrupted scrapes

### Nice to Have

6. **Documentation quality checks**
   - Detect broken links
   - Validate code examples
   - Check for completeness

7. **Multi-language support**
   - Generate clients in multiple languages
   - Internationalization

## 📚 Resources

### Helpful Links

- [Cheerio Documentation](https://cheerio.js.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Mintlify Platform](https://mintlify.com)

### Example Sites to Test

- [Etherscan](https://docs.etherscan.io) - Blockchain data
- [1inch](https://docs.1inch.io) - DeFi aggregator
- [GoPlus](https://docs.gopluslabs.io) - Security API
- [Anthropic](https://docs.anthropic.com) - AI API

## ❓ Questions?

- **Check existing issues** - Your question might already be answered
- **Open a discussion** - For general questions about usage
- **Open an issue** - For specific bugs or feature requests

## 🎖️ Recognition

Contributors will be:

- Listed in the README
- Mentioned in release notes
- Credited in the project documentation

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 🙏 Thank You!

Every contribution, no matter how small, helps make this tool better for the entire AI agent development community. Thank you for being part of this! 🚀

---

Built with ❤️ by the community
