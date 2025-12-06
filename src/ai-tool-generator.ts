#!/usr/bin/env node
/**
 * Multi-Framework AI Tool Generator
 * 
 * Generates tool definitions for multiple AI frameworks from documentation
 * 
 * Supports:
 * - MCP (Model Context Protocol) - for Claude Desktop
 * - OpenAI Function Calling
 * - LangChain Tools
 * - Anthropic Claude Tools
 * - Google Gemini Function Calling
 * - Vercel AI SDK
 * 
 * Usage:
 *   npm run generate-ai-tools -- ./scraped-docs --all
 *   npm run generate-ai-tools -- ./scraped-docs --openai --langchain
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enum?: string[];
}

interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  method: string;
  path: string;
}

interface GeneratorConfig {
  frameworks: Set<string>;
  outputDir: string;
  includeExamples: boolean;
}

class MultiFrameworkToolGenerator {
  private docsPath: string;
  private config: GeneratorConfig;
  private tools: Tool[] = [];

  constructor(docsPath: string, config: GeneratorConfig) {
    this.docsPath = docsPath;
    this.config = config;
  }

  async generate(): Promise<void> {
    console.log(`\n🛠️  Generating AI Tools for Multiple Frameworks\n`);
    console.log(`📁 Source: ${this.docsPath}`);
    console.log(`🎯 Frameworks: ${Array.from(this.config.frameworks).join(', ')}\n`);

    // Extract tools from documentation
    console.log('🔍 Extracting tools from documentation...');
    await this.extractTools();
    console.log(`✓ Found ${this.tools.length} tools\n`);

    // Generate for each framework
    for (const framework of this.config.frameworks) {
      switch (framework) {
        case 'mcp':
          await this.generateMCP();
          break;
        case 'openai':
          await this.generateOpenAI();
          break;
        case 'langchain':
          await this.generateLangChain();
          break;
        case 'anthropic':
          await this.generateAnthropic();
          break;
        case 'gemini':
          await this.generateGemini();
          break;
        case 'vercel':
          await this.generateVercelAI();
          break;
      }
    }

    console.log('\n✅ AI tools generated successfully!\n');
    console.log(`📁 Output directory: ${this.config.outputDir}\n`);
  }

  private async extractTools(): Promise<void> {
    // Read existing mcp-tools.json if it exists
    const mcpToolsPath = path.join(this.docsPath, 'mcp-tools.json');
    
    try {
      const content = await fs.readFile(mcpToolsPath, 'utf-8');
      const mcpTools = JSON.parse(content);
      
      // Convert MCP tools to our generic format
      for (const tool of mcpTools) {
        this.tools.push({
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema?.properties 
            ? Object.entries(tool.inputSchema.properties).map(([name, prop]: [string, any]) => ({
                name,
                type: prop.type,
                description: prop.description,
                required: tool.inputSchema?.required?.includes(name) || false,
                enum: prop.enum
              }))
            : [],
          method: tool.method || 'POST',
          path: tool.endpoint || '/'
        });
      }
    } catch (error) {
      // No MCP tools, extract from docs
      await this.extractFromDocs();
    }
  }

  private async extractFromDocs(): Promise<void> {
    const apiRefPath = path.join(this.docsPath, 'api-reference');
    
    try {
      const files = await fs.readdir(apiRefPath);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(path.join(apiRefPath, file), 'utf-8');
          const tools = this.parseToolsFromMarkdown(content);
          this.tools.push(...tools);
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not extract tools from documentation');
    }
  }

  private parseToolsFromMarkdown(content: string): Tool[] {
    const tools: Tool[] = [];
    const endpointRegex = /^(GET|POST|PUT|DELETE|PATCH)\s+([^\s]+)/gm;
    let match;
    
    while ((match = endpointRegex.exec(content)) !== null) {
      const method = match[1];
      const path = match[2];
      const name = this.generateToolName(path, method);
      
      tools.push({
        name,
        description: `${method} request to ${path}`,
        parameters: [],
        method,
        path
      });
    }
    
    return tools;
  }

  private generateToolName(path: string, method: string): string {
    const cleanPath = path.replace(/[{}]/g, '').replace(/\//g, '_');
    return `${method.toLowerCase()}${cleanPath}`.replace(/__+/g, '_');
  }

  /**
   * Generate MCP (Model Context Protocol) tools
   */
  private async generateMCP(): Promise<void> {
    console.log('📝 Generating MCP tools...');
    
    const mcpTools = this.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: {
        type: 'object',
        properties: Object.fromEntries(
          tool.parameters.map(p => [
            p.name,
            {
              type: p.type,
              description: p.description,
              ...(p.enum && { enum: p.enum })
            }
          ])
        ),
        required: tool.parameters.filter(p => p.required).map(p => p.name)
      },
      method: tool.method,
      endpoint: tool.path
    }));

    await fs.writeFile(
      path.join(this.config.outputDir, 'mcp-tools.json'),
      JSON.stringify(mcpTools, null, 2)
    );
    
    console.log('✓ mcp-tools.json created\n');
  }

  /**
   * Generate OpenAI Function Calling format
   */
  private async generateOpenAI(): Promise<void> {
    console.log('📝 Generating OpenAI functions...');
    
    const openaiTools = this.tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: Object.fromEntries(
            tool.parameters.map(p => [
              p.name,
              {
                type: p.type,
                description: p.description,
                ...(p.enum && { enum: p.enum })
              }
            ])
          ),
          required: tool.parameters.filter(p => p.required).map(p => p.name)
        }
      }
    }));

    await fs.writeFile(
      path.join(this.config.outputDir, 'openai-functions.json'),
      JSON.stringify(openaiTools, null, 2)
    );

    if (this.config.includeExamples) {
      const exampleCode = `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const tools = ${JSON.stringify(openaiTools, null, 2)};

async function chat(messages: any[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    tools,
    tool_choice: 'auto'
  });

  return response;
}

// Example usage
const result = await chat([
  { role: 'user', content: 'Call the ${this.tools[0]?.name} function' }
]);
`;

      await fs.writeFile(
        path.join(this.config.outputDir, 'openai-example.ts'),
        exampleCode
      );
    }
    
    console.log('✓ openai-functions.json created\n');
  }

  /**
   * Generate LangChain tools
   */
  private async generateLangChain(): Promise<void> {
    console.log('📝 Generating LangChain tools...');
    
    const langchainCode = `import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

${this.tools.map(tool => {
  const zodSchema = tool.parameters.length > 0
    ? `z.object({
  ${tool.parameters.map(p => `${p.name}: z.${p.type}()${p.required ? '' : '.optional()'}${p.description ? `.describe("${p.description}")` : ''}`).join(',\n  ')}
})`
    : 'z.object({})';

  return `export const ${tool.name}Tool = new DynamicStructuredTool({
  name: "${tool.name}",
  description: "${tool.description}",
  schema: ${zodSchema},
  func: async (input) => {
    // TODO: Implement ${tool.method} ${tool.path}
    const response = await fetch('${tool.path}', {
      method: '${tool.method}',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${process.env.API_KEY}\`
      },
      body: JSON.stringify(input)
    });
    return await response.json();
  }
});`;
}).join('\n\n')}

export const tools = [
  ${this.tools.map(t => `${t.name}Tool`).join(',\n  ')}
];
`;

    await fs.writeFile(
      path.join(this.config.outputDir, 'langchain-tools.ts'),
      langchainCode
    );
    
    console.log('✓ langchain-tools.ts created\n');
  }

  /**
   * Generate Anthropic Claude tools
   */
  private async generateAnthropic(): Promise<void> {
    console.log('📝 Generating Anthropic Claude tools...');
    
    const anthropicTools = this.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object',
        properties: Object.fromEntries(
          tool.parameters.map(p => [
            p.name,
            {
              type: p.type,
              description: p.description,
              ...(p.enum && { enum: p.enum })
            }
          ])
        ),
        required: tool.parameters.filter(p => p.required).map(p => p.name)
      }
    }));

    await fs.writeFile(
      path.join(this.config.outputDir, 'anthropic-tools.json'),
      JSON.stringify(anthropicTools, null, 2)
    );

    if (this.config.includeExamples) {
      const exampleCode = `import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const tools = ${JSON.stringify(anthropicTools, null, 2)};

async function chat(messages: any[]) {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    tools,
    messages
  });

  return response;
}

// Example usage
const result = await chat([
  { role: "user", content: "Use the ${this.tools[0]?.name} tool" }
]);
`;

      await fs.writeFile(
        path.join(this.config.outputDir, 'anthropic-example.ts'),
        exampleCode
      );
    }
    
    console.log('✓ anthropic-tools.json created\n');
  }

  /**
   * Generate Google Gemini function calling
   */
  private async generateGemini(): Promise<void> {
    console.log('📝 Generating Google Gemini functions...');
    
    const geminiTools = [{
      function_declarations: this.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'OBJECT',
          properties: Object.fromEntries(
            tool.parameters.map(p => [
              p.name,
              {
                type: p.type.toUpperCase(),
                description: p.description
              }
            ])
          ),
          required: tool.parameters.filter(p => p.required).map(p => p.name)
        }
      }))
    }];

    await fs.writeFile(
      path.join(this.config.outputDir, 'gemini-functions.json'),
      JSON.stringify(geminiTools, null, 2)
    );
    
    console.log('✓ gemini-functions.json created\n');
  }

  /**
   * Generate Vercel AI SDK tools
   */
  private async generateVercelAI(): Promise<void> {
    console.log('📝 Generating Vercel AI SDK tools...');
    
    const vercelCode = `import { tool } from 'ai';
import { z } from 'zod';

${this.tools.map(tool => {
  const zodSchema = tool.parameters.length > 0
    ? `z.object({
  ${tool.parameters.map(p => `${p.name}: z.${p.type}()${p.required ? '' : '.optional()'}${p.description ? `.describe('${p.description}')` : ''}`).join(',\n  ')}
})`
    : 'z.object({})';

  return `export const ${tool.name} = tool({
  description: '${tool.description}',
  parameters: ${zodSchema},
  execute: async (input) => {
    // TODO: Implement ${tool.method} ${tool.path}
    const response = await fetch('${tool.path}', {
      method: '${tool.method}',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${process.env.API_KEY}\`
      },
      body: JSON.stringify(input)
    });
    return await response.json();
  }
});`;
}).join('\n\n')}

export const tools = {
  ${this.tools.map(t => t.name).join(',\n  ')}
};
`;

    await fs.writeFile(
      path.join(this.config.outputDir, 'vercel-ai-tools.ts'),
      vercelCode
    );
    
    console.log('✓ vercel-ai-tools.ts created\n');
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Multi-Framework AI Tool Generator
==================================

Generate AI tool definitions for multiple frameworks from documentation

Usage:
  npm run generate-ai-tools -- <docs-path> [options]

Examples:
  # Generate for all frameworks
  npm run generate-ai-tools -- ./scraped-docs --all

  # Generate for specific frameworks
  npm run generate-ai-tools -- ./scraped-docs --openai --langchain

  # With examples
  npm run generate-ai-tools -- ./scraped-docs --all --include-examples

Options:
  --all                   Generate for all frameworks
  --mcp                   Generate MCP tools (Model Context Protocol)
  --openai                Generate OpenAI function calling format
  --langchain             Generate LangChain tools
  --anthropic             Generate Anthropic Claude tools
  --gemini                Generate Google Gemini functions
  --vercel                Generate Vercel AI SDK tools
  --output <dir>          Output directory (default: ./ai-tools)
  --include-examples      Include usage examples
  --help                  Show this help

Supported Frameworks:
  • MCP - Model Context Protocol (Claude Desktop)
  • OpenAI - Function calling for GPT-4
  • LangChain - LangChain tool definitions
  • Anthropic - Claude tool use
  • Gemini - Google Gemini function calling
  • Vercel AI - Vercel AI SDK tools

Output Files:
  ./ai-tools/
  ├── mcp-tools.json         # MCP tool definitions
  ├── openai-functions.json  # OpenAI function calling
  ├── openai-example.ts      # OpenAI usage example
  ├── langchain-tools.ts     # LangChain tools
  ├── anthropic-tools.json   # Anthropic Claude tools
  ├── anthropic-example.ts   # Anthropic usage example
  ├── gemini-functions.json  # Google Gemini functions
  └── vercel-ai-tools.ts     # Vercel AI SDK tools
    `);
    process.exit(0);
  }

  const docsPath = args[0];
  const outputIdx = args.indexOf('--output');

  const frameworks = new Set<string>();
  
  if (args.includes('--all')) {
    frameworks.add('mcp');
    frameworks.add('openai');
    frameworks.add('langchain');
    frameworks.add('anthropic');
    frameworks.add('gemini');
    frameworks.add('vercel');
  } else {
    if (args.includes('--mcp')) frameworks.add('mcp');
    if (args.includes('--openai')) frameworks.add('openai');
    if (args.includes('--langchain')) frameworks.add('langchain');
    if (args.includes('--anthropic')) frameworks.add('anthropic');
    if (args.includes('--gemini')) frameworks.add('gemini');
    if (args.includes('--vercel')) frameworks.add('vercel');
  }

  if (frameworks.size === 0) {
    console.error('❌ Please specify at least one framework or use --all');
    process.exit(1);
  }

  const config: GeneratorConfig = {
    frameworks,
    outputDir: outputIdx !== -1 ? args[outputIdx + 1] : './ai-tools',
    includeExamples: args.includes('--include-examples')
  };

  // Create output directory
  await fs.mkdir(config.outputDir, { recursive: true });

  const generator = new MultiFrameworkToolGenerator(docsPath, config);
  
  try {
    await generator.generate();
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { MultiFrameworkToolGenerator };
