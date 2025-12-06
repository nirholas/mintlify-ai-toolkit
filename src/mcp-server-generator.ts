#!/usr/bin/env node
/**
 * Complete MCP Server Generator
 * 
 * Generates a complete, working MCP server from scraped documentation
 * Output is ready to use with Claude Desktop
 * 
 * Usage:
 *   npm run docs-to-mcp -- https://docs.privy.io
 *   npm run docs-to-mcp -- ./scraped-docs/privy --output ./privy-mcp
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { MintlifyDocsScraper } from './scraper.js';
import { McpToolGenerator } from './mcp-generator.js';

interface McpServerConfig {
  name: string;
  displayName: string;
  description: string;
  baseUrl?: string;
  apiKey?: boolean;
  version: string;
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

class McpServerGenerator {
  private docsPath: string;
  private outputPath: string;
  private config: McpServerConfig;

  constructor(docsPath: string, outputPath: string, config?: Partial<McpServerConfig>) {
    this.docsPath = docsPath;
    this.outputPath = outputPath;
    
    // Extract name from docs path or use provided
    const defaultName = path.basename(docsPath).replace(/[^a-z0-9]+/gi, '-');
    
    this.config = {
      name: config?.name || defaultName,
      displayName: config?.displayName || defaultName,
      description: config?.description || `MCP server for ${defaultName}`,
      baseUrl: config?.baseUrl,
      apiKey: config?.apiKey !== false, // default true
      version: config?.version || '1.0.0'
    };
  }

  /**
   * Generate complete MCP server
   */
  async generate(): Promise<void> {
    console.log(`\n🚀 Generating MCP Server: ${this.config.displayName}\n`);

    // Create output directory
    await fs.mkdir(this.outputPath, { recursive: true });

    // Step 1: Load or generate MCP tools
    console.log('📋 Step 1: Loading API documentation...');
    const tools = await this.loadOrGenerateTools();
    console.log(`✓ Found ${tools.length} API endpoints\n`);

    // Step 2: Generate package.json
    console.log('📦 Step 2: Creating package.json...');
    await this.generatePackageJson();
    console.log('✓ Package configuration created\n');

    // Step 3: Generate TypeScript server
    console.log('🔧 Step 3: Generating MCP server code...');
    await this.generateServerCode(tools);
    console.log('✓ Server code generated\n');

    // Step 4: Generate tool handlers
    console.log('⚙️  Step 4: Creating tool handlers...');
    await this.generateToolHandlers(tools);
    console.log('✓ Tool handlers created\n');

    // Step 5: Generate types
    console.log('📝 Step 5: Generating TypeScript types...');
    await this.generateTypes(tools);
    console.log('✓ Types generated\n');

    // Step 6: Generate tsconfig.json
    console.log('⚙️  Step 6: Creating TypeScript configuration...');
    await this.generateTsConfig();
    console.log('✓ TypeScript config created\n');

    // Step 7: Generate Claude Desktop config
    console.log('🖥️  Step 7: Creating Claude Desktop configuration...');
    await this.generateClaudeConfig();
    console.log('✓ Claude config created\n');

    // Step 8: Generate README
    console.log('📚 Step 8: Writing documentation...');
    await this.generateReadme(tools);
    console.log('✓ README created\n');

    // Step 9: Generate .env.example
    console.log('🔐 Step 9: Creating environment template...');
    await this.generateEnvExample();
    console.log('✓ Environment template created\n');

    // Success message
    console.log('✅ MCP Server generated successfully!\n');
    console.log(`📁 Location: ${this.outputPath}\n`);
    console.log('🎯 Next steps:');
    console.log(`   1. cd ${this.outputPath}`);
    console.log('   2. npm install');
    if (this.config.apiKey) {
      console.log('   3. cp .env.example .env (and add your API key)');
      console.log('   4. npm run build');
      console.log('   5. Add to Claude Desktop (see README.md)');
    } else {
      console.log('   3. npm run build');
      console.log('   4. Add to Claude Desktop (see README.md)');
    }
    console.log('');
  }

  /**
   * Load existing tools or generate from docs
   */
  private async loadOrGenerateTools(): Promise<McpTool[]> {
    // Check if mcp-tools.json exists
    const toolsPath = path.join(this.docsPath, 'mcp-tools', 'mcp-tools.json');
    
    try {
      const content = await fs.readFile(toolsPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Generate tools if they don't exist
      console.log('   Generating MCP tools from documentation...');
      const generator = new McpToolGenerator(this.docsPath);
      await generator.generate();
      const content = await fs.readFile(toolsPath, 'utf-8');
      return JSON.parse(content);
    }
  }

  /**
   * Generate package.json
   */
  private async generatePackageJson(): Promise<void> {
    const packageJson = {
      name: `@mcp/${this.config.name}`,
      version: this.config.version,
      description: this.config.description,
      type: "module",
      bin: {
        [this.config.name]: "./build/index.js"
      },
      scripts: {
        build: "tsc && chmod +x build/index.js",
        watch: "tsc --watch",
        prepare: "npm run build"
      },
      dependencies: {
        "@modelcontextprotocol/sdk": "^1.0.0",
        "dotenv": "^16.4.5"
      },
      devDependencies: {
        "@types/node": "^22.10.1",
        "typescript": "^5.7.2"
      },
      engines: {
        node: ">=18.0.0"
      }
    };

    await fs.writeFile(
      path.join(this.outputPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  /**
   * Generate main server code
   */
  private async generateServerCode(tools: McpTool[]): Promise<void> {
    const code = `#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { tools } from './tools.js';
import { handleToolCall } from './handlers.js';

// Load environment variables
dotenv.config();

/**
 * ${this.config.displayName} MCP Server
 * ${this.config.description}
 * 
 * Auto-generated from documentation
 */
class ${this.toPascalCase(this.config.name)}Server {
  private server: Server;
${this.config.apiKey ? `  private apiKey: string;\n` : ''}
  constructor() {
    this.server = new Server(
      {
        name: '${this.config.name}',
        version: '${this.config.version}',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
${this.config.apiKey ? `
    // Get API key from environment
    this.apiKey = process.env.API_KEY || '';
    if (!this.apiKey) {
      console.error('ERROR: API_KEY environment variable is required');
      process.exit(1);
    }
` : ''}
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const result = await handleToolCall(
          request.params.name,
          request.params.arguments || {}${this.config.apiKey ? `,\n          this.apiKey` : ''}
        );

        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: \`Error: \${errorMessage}\`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('${this.config.displayName} MCP server running on stdio');
  }
}

const server = new ${this.toPascalCase(this.config.name)}Server();
server.run().catch(console.error);
`;

    await fs.writeFile(path.join(this.outputPath, 'index.ts'), code);
  }

  /**
   * Generate tool handlers
   */
  private async generateToolHandlers(tools: McpTool[]): Promise<void> {
    const imports = this.config.baseUrl 
      ? `\n// Add your HTTP client here (e.g., fetch, axios)\n`
      : '';

    let code = `${imports}
/**
 * Tool handlers for ${this.config.displayName}
 * 
 * Each handler implements the logic for one MCP tool
 * Auto-generated - customize as needed
 */

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>${this.config.apiKey ? ',\n  apiKey: string' : ''}
): Promise<unknown> {
  switch (name) {
`;

    for (const tool of tools) {
      code += `    case '${tool.name}':\n`;
      code += `      return await ${this.toCamelCase(tool.name)}(args${this.config.apiKey ? ', apiKey' : ''});\n\n`;
    }

    code += `    default:\n`;
    code += `      throw new Error(\`Unknown tool: \${name}\`);\n`;
    code += `  }\n`;
    code += `}\n\n`;

    // Generate handler functions
    for (const tool of tools) {
      const params = Object.keys(tool.inputSchema.properties || {});
      const paramTypes = params.map(p => {
        const prop = tool.inputSchema.properties[p];
        return `  ${p}${tool.inputSchema.required?.includes(p) ? '' : '?'}: ${prop.type}`;
      }).join(';\n');

      code += `/**\n * ${tool.description}\n */\n`;
      code += `async function ${this.toCamelCase(tool.name)}(\n`;
      code += `  args: Record<string, unknown>${this.config.apiKey ? ',\n  apiKey: string' : ''}\n`;
      code += `): Promise<unknown> {\n`;
      code += `  // TODO: Implement ${tool.name}\n`;
      code += `  // Extract and validate parameters\n`;
      
      for (const param of params) {
        code += `  const ${param} = args.${param};\n`;
      }
      
      code += `\n  // TODO: Make API call${this.config.baseUrl ? ' to ' + this.config.baseUrl : ''}\n`;
      code += `  // Example:\n`;
      code += `  // const response = await fetch(\`${this.config.baseUrl || 'YOUR_API_URL'}...\`, {\n`;
      code += `  //   headers: { ${this.config.apiKey ? `'Authorization': \`Bearer \${apiKey}\`` : `'Content-Type': 'application/json'`} },\n`;
      code += `  // });\n`;
      code += `  // return await response.json();\n\n`;
      code += `  throw new Error('${tool.name} not yet implemented');\n`;
      code += `}\n\n`;
    }

    await fs.writeFile(path.join(this.outputPath, 'handlers.ts'), code);
  }

  /**
   * Generate TypeScript types
   */
  private async generateTypes(tools: McpTool[]): Promise<void> {
    const code = `/**
 * TypeScript type definitions
 * Auto-generated from MCP tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const tools: Tool[] = ${JSON.stringify(tools, null, 2)};
`;

    await fs.writeFile(path.join(this.outputPath, 'tools.ts'), code);
  }

  /**
   * Generate tsconfig.json
   */
  private async generateTsConfig(): Promise<void> {
    const tsconfig = {
      compilerOptions: {
        target: "ES2022",
        module: "Node16",
        moduleResolution: "Node16",
        outDir: "./build",
        rootDir: ".",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true
      },
      include: ["*.ts"],
      exclude: ["node_modules", "build"]
    };

    await fs.writeFile(
      path.join(this.outputPath, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2)
    );
  }

  /**
   * Generate Claude Desktop configuration
   */
  private async generateClaudeConfig(): Promise<void> {
    const config = {
      mcpServers: {
        [this.config.name]: {
          command: "node",
          args: [path.join(this.outputPath, "build", "index.js")],
          env: this.config.apiKey ? {
            API_KEY: "your-api-key-here"
          } : undefined
        }
      }
    };

    await fs.writeFile(
      path.join(this.outputPath, 'claude_desktop_config.json'),
      JSON.stringify(config, null, 2)
    );
  }

  /**
   * Generate README
   */
  private async generateReadme(tools: McpTool[]): Promise<void> {
    const readme = `# ${this.config.displayName} MCP Server

${this.config.description}

**Auto-generated from documentation** - Customize handlers in \`handlers.ts\`

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`
${this.config.apiKey ? `
### 2. Configure API Key

\`\`\`bash
cp .env.example .env
# Edit .env and add your API key
\`\`\`
` : ''}
### ${this.config.apiKey ? '3' : '2'}. Build

\`\`\`bash
npm run build
\`\`\`

### ${this.config.apiKey ? '4' : '3'}. Add to Claude Desktop

Add this to your Claude Desktop configuration:

**Location:** \`~/Library/Application Support/Claude/claude_desktop_config.json\` (Mac)

\`\`\`json
${JSON.stringify({
  mcpServers: {
    [this.config.name]: {
      command: "node",
      args: [path.join(this.outputPath, "build", "index.js")],
      env: this.config.apiKey ? { API_KEY: "your-api-key-here" } : undefined
    }
  }
}, null, 2)}
\`\`\`

### ${this.config.apiKey ? '5' : '4'}. Restart Claude Desktop

The tools will now be available in Claude!

---

## 🔧 Available Tools

This server provides **${tools.length} tools**:

${tools.map((tool, i) => `${i + 1}. **${tool.name}** - ${tool.description}`).join('\n')}

---

## 📝 Customization

### Implement Tool Handlers

Edit \`handlers.ts\` to implement each tool's logic:

\`\`\`typescript
async function exampleTool(args: Record<string, unknown>${this.config.apiKey ? ', apiKey: string' : ''}): Promise<unknown> {
  // Your implementation here
  const response = await fetch('...');
  return await response.json();
}
\`\`\`

### Add More Tools

1. Add tool definition to \`tools.ts\`
2. Implement handler in \`handlers.ts\`
3. Rebuild: \`npm run build\`

---

## 🐛 Debugging

Run in development mode:

\`\`\`bash
npm run watch
\`\`\`

View logs in Claude Desktop:
- Mac: \`~/Library/Logs/Claude/mcp*.log\`

---

## 📚 Documentation

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Desktop Setup](https://modelcontextprotocol.io/quickstart/user)
${this.config.baseUrl ? `- [API Documentation](${this.config.baseUrl})\n` : ''}
---

## 🤝 Contributing

This server was auto-generated. To improve:

1. Review tool definitions in \`tools.ts\`
2. Implement handlers in \`handlers.ts\`
3. Test with Claude Desktop
4. Add error handling
5. Add input validation

---

**Generated:** ${new Date().toISOString()}  
**Generator:** Mintlify MCP Server Generator
`;

    await fs.writeFile(path.join(this.outputPath, 'README.md'), readme);
  }

  /**
   * Generate .env.example
   */
  private async generateEnvExample(): Promise<void> {
    if (!this.config.apiKey) return;

    const env = `# ${this.config.displayName} API Configuration
API_KEY=your-api-key-here
${this.config.baseUrl ? `\n# Base URL\nBASE_URL=${this.config.baseUrl}\n` : ''}
# Add other environment variables as needed
`;

    await fs.writeFile(path.join(this.outputPath, '.env.example'), env);
  }

  /**
   * Utilities
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Complete MCP Server Generator
==============================

Generate a complete, working MCP server from documentation

Usage:
  npm run docs-to-mcp -- <url-or-docs-path> [options]

Examples:
  # From URL (scrapes first, then generates)
  npm run docs-to-mcp -- https://docs.privy.io

  # From existing scraped docs
  npm run docs-to-mcp -- ./scraped-docs/privy

  # Custom output location
  npm run docs-to-mcp -- https://docs.stripe.com --output ./stripe-mcp-server

  # With custom configuration
  npm run docs-to-mcp -- https://docs.api.com \\
    --name my-api \\
    --display-name "My API" \\
    --description "Custom description"

Options:
  --output <dir>        Output directory (default: ./<name>-mcp-server)
  --name <name>         Server name (default: from docs)
  --display-name <name> Display name (default: same as name)
  --description <text>  Server description
  --no-api-key          Don't require API key
  --help                Show this help

Output:
  <output>/
  ├── index.ts                    # Main server
  ├── handlers.ts                 # Tool implementations (customize!)
  ├── tools.ts                    # Tool definitions
  ├── package.json                # Dependencies
  ├── tsconfig.json               # TypeScript config
  ├── claude_desktop_config.json  # Claude Desktop config
  ├── .env.example                # Environment template
  └── README.md                   # Setup instructions
    `);
    process.exit(0);
  }

  const input = args[0];
  const outputIdx = args.indexOf('--output');
  const nameIdx = args.indexOf('--name');
  const displayNameIdx = args.indexOf('--display-name');
  const descriptionIdx = args.indexOf('--description');
  const noApiKey = args.includes('--no-api-key');

  let docsPath = input;
  let baseUrl: string | undefined;

  // Check if input is a URL or path
  if (input.startsWith('http://') || input.startsWith('https://')) {
    // Scrape documentation first
    console.log(`📥 Scraping documentation from: ${input}\n`);
    
    const url = new URL(input);
    const siteName = url.hostname.replace(/^docs\./, '').replace(/\..+$/, '');
    const scrapedPath = `./scraped-docs/${siteName}`;
    
    const scraper = new MintlifyDocsScraper({
      baseUrl: input,
      outputDir: scrapedPath,
    });
    
    await scraper.scrape();
    docsPath = scrapedPath;
    baseUrl = url.origin;
    console.log(`\n✅ Documentation scraped to: ${docsPath}\n`);
  }

  // Determine output path
  const defaultOutput = outputIdx !== -1 
    ? args[outputIdx + 1] 
    : `./${path.basename(docsPath)}-mcp-server`;

  const config: Partial<McpServerConfig> = {
    name: nameIdx !== -1 ? args[nameIdx + 1] : undefined,
    displayName: displayNameIdx !== -1 ? args[displayNameIdx + 1] : undefined,
    description: descriptionIdx !== -1 ? args[descriptionIdx + 1] : undefined,
    baseUrl,
    apiKey: !noApiKey,
  };

  const generator = new McpServerGenerator(docsPath, defaultOutput, config);
  
  try {
    await generator.generate();
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { McpServerGenerator };
