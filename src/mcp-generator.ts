#!/usr/bin/env node
/**
 * MCP Tool Generator
 * 
 * Automatically generates MCP tool definitions from scraped API documentation
 * 
 * Usage:
 *   tsx src/mcp-generator.ts ./output/etherscan
 *   tsx src/mcp-generator.ts ./output/etherscan --output ./mcp-tools
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface ApiEndpoint {
  method: string;
  endpoint: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
    }>;
    required: string[];
  };
}

class McpToolGenerator {
  private docsPath: string;
  private outputPath: string;

  constructor(docsPath: string, outputPath?: string) {
    this.docsPath = docsPath;
    this.outputPath = outputPath || path.join(docsPath, 'mcp-tools');
  }

  /**
   * Generate MCP tools from scraped documentation
   */
  async generate(): Promise<void> {
    console.log('🔧 Generating MCP tools from documentation...');

    // Read metadata
    const metadataPath = path.join(this.docsPath, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

    const tools: McpTool[] = [];

    // Process each page that has an API endpoint
    for (const page of metadata.pages) {
      if (page.hasApiEndpoint) {
        const pagePath = path.join(this.docsPath, page.section, `${this.slugify(page.title)}.md`);
        
        try {
          const content = await fs.readFile(pagePath, 'utf-8');
          const tool = this.parseApiToMcpTool(content, page);
          
          if (tool) {
            tools.push(tool);
            console.log(`✓ ${tool.name}`);
          }
        } catch (error) {
          console.warn(`⚠️  Could not process ${page.title}:`, error);
        }
      }
    }

    // Save MCP tools
    await fs.mkdir(this.outputPath, { recursive: true });
    
    // Save as JSON
    await fs.writeFile(
      path.join(this.outputPath, 'mcp-tools.json'),
      JSON.stringify(tools, null, 2)
    );

    // Generate TypeScript file
    await this.generateTypeScriptFile(tools);

    console.log(`\n✅ Generated ${tools.length} MCP tools`);
    console.log(`📁 Saved to: ${this.outputPath}`);
  }

  /**
   * Parse API documentation to MCP tool
   */
  private parseApiToMcpTool(markdown: string, page: any): McpTool | null {
    try {
      // Extract API endpoint info from markdown
      const methodMatch = markdown.match(/\*\*Method:\*\* `(GET|POST|PUT|DELETE|PATCH)`/);
      const endpointMatch = markdown.match(/\*\*Endpoint:\*\* `([^`]+)`/);
      
      if (!methodMatch || !endpointMatch) return null;

      const method = methodMatch[1];
      const endpoint = endpointMatch[1];

      // Extract parameters from table
      const parameters: Array<{ name: string; type: string; required: boolean; description: string }> = [];
      const paramTableMatch = markdown.match(/### Parameters\n\n\|([^#]+)/);
      
      if (paramTableMatch) {
        const rows = paramTableMatch[1].split('\n').slice(2); // Skip header and separator
        
        for (const row of rows) {
          const cells = row.split('|').map(c => c.trim()).filter(Boolean);
          if (cells.length >= 4) {
            parameters.push({
              name: cells[0],
              type: cells[1].toLowerCase(),
              required: cells[2].toLowerCase() === 'yes',
              description: cells[3]
            });
          }
        }
      }

      // Generate tool name
      const toolName = this.generateToolName(page.section, page.title);

      // Build input schema
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const param of parameters) {
        properties[param.name] = {
          type: this.mapType(param.type),
          description: param.description
        };
        
        if (param.required) {
          required.push(param.name);
        }
      }

      return {
        name: toolName,
        description: page.title || 'No description',
        inputSchema: {
          type: 'object',
          properties,
          required
        }
      };
    } catch (error) {
      console.warn(`Could not parse ${page.title}:`, error);
      return null;
    }
  }

  /**
   * Generate TypeScript file with MCP tools
   */
  private async generateTypeScriptFile(tools: McpTool[]): Promise<void> {
    let typescript = `/**
 * Auto-generated MCP Tools
 * Generated from: ${this.docsPath}
 * Date: ${new Date().toISOString()}
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const mcpTools: Tool[] = [
`;

    for (const tool of tools) {
      typescript += `  {
    name: '${tool.name}',
    description: \`${tool.description}\`,
    inputSchema: ${JSON.stringify(tool.inputSchema, null, 6).replace(/^/gm, '    ')}
  },
`;
    }

    typescript += `];\n`;

    await fs.writeFile(
      path.join(this.outputPath, 'mcp-tools.ts'),
      typescript
    );
  }

  /**
   * Generate tool name from section and title
   */
  private generateToolName(section: string, title: string): string {
    const prefix = section.replace(/[-\s]+/g, '_');
    const suffix = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    
    return `${prefix}_${suffix}`;
  }

  /**
   * Map API type to JSON schema type
   */
  private mapType(apiType: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'integer': 'number',
      'number': 'number',
      'boolean': 'boolean',
      'array': 'array',
      'object': 'object'
    };

    return typeMap[apiType.toLowerCase()] || 'string';
  }

  /**
   * Convert title to slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
MCP Tool Generator
==================

Automatically generate MCP tool definitions from scraped documentation

Usage:
  tsx src/mcp-generator.ts <docs-path> [options]

Examples:
  tsx src/mcp-generator.ts ./output/etherscan
  tsx src/mcp-generator.ts ./output/etherscan --output ./custom-path

Options:
  --output <dir>    Output directory (default: <docs-path>/mcp-tools)
  --help           Show this help
    `);
    process.exit(0);
  }

  const docsPath = args[0];
  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : undefined;

  const generator = new McpToolGenerator(docsPath, outputPath);
  
  try {
    await generator.generate();
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { McpToolGenerator };
