# Example: Scraping Etherscan Documentation

This example shows how to scrape the complete Etherscan API documentation and generate MCP tools.

## Step 1: Scrape Documentation

```bash
npm run scrape -- https://docs.etherscan.io --output ./output/etherscan
```

This will:
- Discover all pages via sitemap.xml
- Scrape 100+ documentation pages
- Generate organized markdown files
- Create metadata.json with page structure

**Output:**
```
output/etherscan/
├── INDEX.md              # Navigation index
├── COMPLETE.md           # Single file with all docs
├── metadata.json         # Structured metadata
├── api/
│   ├── accounts.md
│   ├── transactions.md
│   └── ...
├── contracts/
│   └── ...
└── ...
```

## Step 2: Generate MCP Tools

```bash
npm run generate-mcp -- ./output/etherscan --output ./output/etherscan/mcp-tools
```

This will:
- Parse API endpoints from documentation
- Extract parameters and types
- Generate MCP tool definitions
- Create TypeScript file with tools

**Output:**
```
output/etherscan/mcp-tools/
├── mcp-tools.json        # JSON tool definitions
└── mcp-tools.ts          # TypeScript exports
```

**Generated Tool Example:**
```json
{
  "name": "api_get_account_balance",
  "description": "Get Ether Balance for a Single Address",
  "inputSchema": {
    "type": "object",
    "properties": {
      "address": {
        "type": "string",
        "description": "The address to check for balance"
      },
      "tag": {
        "type": "string",
        "description": "The block number (latest, earliest, or specific)"
      }
    },
    "required": ["address"]
  }
}
```

## Step 3: Extract Code Examples

```bash
npm run extract-examples -- ./output/etherscan
```

This will:
- Find all code blocks in documentation
- Organize by programming language
- Create language-specific example files

**Output:**
```
output/etherscan/examples/
├── INDEX.md
├── typescript-examples.md
├── python-examples.md
├── javascript-examples.md
├── curl-examples.md
└── ...
```

## Step 4: Use in MCP Server

Now you can use the generated tools in your MCP server:

```typescript
import { mcpTools } from './output/etherscan/mcp-tools/mcp-tools.ts';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server(
  {
    name: 'etherscan-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register all auto-generated tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: mcpTools,
}));

// Implement tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Your implementation here
  // The tool definitions are already done!
});
```

## Results

From a single command, you now have:
- ✅ Complete offline documentation backup
- ✅ Ready-to-use MCP tool definitions
- ✅ Organized code examples by language
- ✅ Structured metadata for custom processing
- ✅ TypeScript types for API endpoints

---

[View on GitHub](https://github.com/nirholas/mintlify-ai-toolkit)