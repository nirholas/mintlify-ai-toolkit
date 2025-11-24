# MCP Server Project Template

Complete template for creating a new MCP server from scraped documentation.

## Project Structure

```
my-mcp-server/
├── src/
│   ├── index.ts              # Server entry point
│   ├── server.ts             # MCP server setup
│   ├── tools/
│   │   ├── index.ts          # Export all tools
│   │   └── {category}/       # Tools by category
│   │       └── {name}.ts
│   ├── services/
│   │   └── {api}.ts          # API client services
│   └── types/
│       └── index.ts          # TypeScript types
├── docs/
│   └── scraped/              # Output from mintlify-scraper
├── tests/
│   └── tools.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 1. Package.json

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for XYZ API",
  "type": "module",
  "main": "./dist/index.js",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "scrape": "cd ../mintlify-scraper && npm run scrape -- https://docs.example.com --output ../my-mcp-server/docs/scraped",
    "generate-tools": "cd ../mintlify-scraper && npm run generate-mcp -- ../my-mcp-server/docs/scraped"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.20.0",
    "typescript": "^5.9.0"
  }
}
```

## 2. src/index.ts

```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { setupTools } from './tools/index.js';

// Create MCP server
const server = new Server(
  {
    name: 'my-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Setup all tools
setupTools(server);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

## 3. src/tools/index.ts

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import auto-generated tools
import { mcpTools } from '../../docs/scraped/mcp-tools/mcp-tools.js';

// Import handlers
import { handleAccountTools } from './accounts/index.js';
import { handleSwapTools } from './swap/index.js';

export function setupTools(server: Server) {
  // List all tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: mcpTools,
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Route to appropriate handler
    if (name.startsWith('accounts_')) {
      return await handleAccountTools(name, args);
    }

    if (name.startsWith('swap_')) {
      return await handleSwapTools(name, args);
    }

    throw new Error(`Unknown tool: ${name}`);
  });
}
```

## 4. src/tools/accounts/index.ts

```typescript
import { AccountService } from '../../services/api.js';

const accountService = new AccountService();

export async function handleAccountTools(name: string, args: any) {
  switch (name) {
    case 'accounts_get_balance':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              await accountService.getBalance(args.address),
              null,
              2
            ),
          },
        ],
      };

    case 'accounts_get_transactions':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              await accountService.getTransactions(
                args.address,
                args.page,
                args.limit
              ),
              null,
              2
            ),
          },
        ],
      };

    default:
      throw new Error(`Unknown account tool: ${name}`);
  }
}
```

## 5. src/services/api.ts

```typescript
export class AccountService {
  private baseUrl = 'https://api.example.com';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.API_KEY || '';
    if (!this.apiKey) {
      throw new Error('API_KEY environment variable required');
    }
  }

  async getBalance(address: string) {
    const response = await fetch(
      `${this.baseUrl}/accounts/${address}/balance`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async getTransactions(address: string, page = 1, limit = 10) {
    const url = new URL(`${this.baseUrl}/accounts/${address}/transactions`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

## 6. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 7. README.md

```markdown
# My MCP Server

MCP server providing AI agents with access to XYZ API.

## Installation

\`\`\`bash
npm install
npm run build
\`\`\`

## Configuration

Create a `.env` file:

\`\`\`
API_KEY=your-api-key-here
\`\`\`

## Development

\`\`\`bash
# Scrape latest documentation
npm run scrape

# Generate MCP tools from docs
npm run generate-tools

# Run in development mode
npm run dev
\`\`\`

## Claude Desktop Setup

Add to your Claude Desktop config:

\`\`\`json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/dist/index.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
\`\`\`

## Available Tools

Auto-generated from documentation:
- \`accounts_get_balance\` - Get account balance
- \`accounts_get_transactions\` - List transactions
- \`swap_get_quote\` - Get swap quote
- And more...

## Testing

\`\`\`bash
npm test
\`\`\`
```

## Usage Workflow

### 1. Scrape Documentation
```bash
npm run scrape
```

### 2. Generate MCP Tools
```bash
npm run generate-tools
```

This creates:
- `docs/scraped/mcp-tools/mcp-tools.json`
- `docs/scraped/mcp-tools/mcp-tools.ts`

### 3. Implement Handlers

For each tool, implement the handler in the appropriate category file.

### 4. Test
```bash
npm run dev
```

### 5. Deploy
```bash
npm run build
npm start
```

## Tips

### Error Handling
```typescript
try {
  const result = await service.call();
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
} catch (error) {
  return {
    content: [{ type: 'text', text: `Error: ${error.message}` }],
    isError: true,
  };
}
```

### Rate Limiting
```typescript
class RateLimiter {
  private lastCall = 0;
  private minInterval = 1000; // 1 request per second

  async throttle() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastCall)
      );
    }
    this.lastCall = Date.now();
  }
}
```

### Caching
```typescript
class Cache {
  private cache = new Map<string, { data: any; expires: number }>();

  get(key: string) {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) {
      return null;
    }
    return item.data;
  }

  set(key: string, data: any, ttl = 60000) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }
}
```

## Checklist

- [ ] Scraped documentation
- [ ] Generated MCP tools
- [ ] Implemented all handlers
- [ ] Added error handling
- [ ] Added rate limiting
- [ ] Added caching
- [ ] Tested all tools
- [ ] Updated README
- [ ] Added environment variables
- [ ] Built for production


Built with ❤️ by [nich](https://x.com/nichxbt)👉[on Github](https://github.com/nirholas)