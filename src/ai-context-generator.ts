#!/usr/bin/env node
/**
 * AI Context Generator
 * 
 * Generates optimized context files for AI coding assistants
 * 
 * Supports:
 * - Cursor (.cursorrules)
 * - Cline (.clinerules)
 * - Claude Desktop (claude-context.md)
 * - Windsurf (.windsurfrules)
 * - Generic AI context
 * 
 * Usage:
 *   npm run generate-ai-context -- ./scraped-docs
 *   npm run generate-ai-context -- ./scraped-docs --format cursor
 *   npm run generate-ai-context -- ./scraped-docs --format all
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface ContextConfig {
  format: 'cursor' | 'cline' | 'claude' | 'windsurf' | 'all';
  outputDir: string;
  maxTokens?: number;
  includeExamples?: boolean;
  includePatterns?: boolean;
}

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: any[];
  authentication?: string;
}

interface CodePattern {
  language: string;
  pattern: string;
  description: string;
  example: string;
}

class AIContextGenerator {
  private docsPath: string;
  private config: ContextConfig;
  private metadata: any;
  private endpoints: ApiEndpoint[] = [];
  private patterns: CodePattern[] = [];

  constructor(docsPath: string, config: ContextConfig) {
    this.docsPath = docsPath;
    this.config = config;
  }

  async generate(): Promise<void> {
    console.log(`\n🤖 Generating AI Context Files\n`);
    console.log(`📁 Source: ${this.docsPath}`);
    console.log(`📝 Format: ${this.config.format}\n`);

    // Load metadata
    await this.loadMetadata();

    // Extract API endpoints
    console.log('🔍 Extracting API endpoints...');
    await this.extractEndpoints();
    console.log(`✓ Found ${this.endpoints.length} endpoints\n`);

    // Extract code patterns
    if (this.config.includePatterns) {
      console.log('🎨 Extracting code patterns...');
      await this.extractPatterns();
      console.log(`✓ Found ${this.patterns.length} patterns\n`);
    }

    // Generate context files
    if (this.config.format === 'all') {
      await this.generateCursorRules();
      await this.generateClineRules();
      await this.generateClaudeContext();
      await this.generateWindsurfRules();
    } else {
      switch (this.config.format) {
        case 'cursor':
          await this.generateCursorRules();
          break;
        case 'cline':
          await this.generateClineRules();
          break;
        case 'claude':
          await this.generateClaudeContext();
          break;
        case 'windsurf':
          await this.generateWindsurfRules();
          break;
      }
    }

    console.log('\n✅ AI context files generated successfully!\n');
    console.log(`📁 Output directory: ${this.config.outputDir}\n`);
  }

  private async loadMetadata(): Promise<void> {
    const metadataPath = path.join(this.docsPath, 'metadata.json');
    try {
      const content = await fs.readFile(metadataPath, 'utf-8');
      this.metadata = JSON.parse(content);
    } catch (error) {
      console.warn('⚠️  No metadata.json found, using basic extraction');
      this.metadata = { pages: [], baseUrl: '' };
    }
  }

  private async extractEndpoints(): Promise<void> {
    // Look for API reference files
    const apiRefPath = path.join(this.docsPath, 'api-reference');
    
    try {
      const files = await fs.readdir(apiRefPath);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(path.join(apiRefPath, file), 'utf-8');
          const endpoints = this.parseEndpointsFromMarkdown(content);
          this.endpoints.push(...endpoints);
        }
      }
    } catch (error) {
      // No api-reference folder, try other sections
      await this.scanAllSections();
    }
  }

  private parseEndpointsFromMarkdown(content: string): ApiEndpoint[] {
    const endpoints: ApiEndpoint[] = [];
    
    // Match HTTP methods and paths
    const endpointRegex = /^(GET|POST|PUT|DELETE|PATCH)\s+([^\s]+)/gm;
    let match;
    
    while ((match = endpointRegex.exec(content)) !== null) {
      endpoints.push({
        method: match[1],
        path: match[2],
        description: this.extractDescription(content, match.index),
        authentication: this.extractAuthentication(content)
      });
    }
    
    return endpoints;
  }

  private extractDescription(content: string, startIndex: number): string {
    // Get the next paragraph after the endpoint
    const afterEndpoint = content.slice(startIndex);
    const descMatch = afterEndpoint.match(/\n\n(.+?)(\n\n|$)/);
    return descMatch ? descMatch[1].trim() : '';
  }

  private extractAuthentication(content: string): string | undefined {
    if (content.toLowerCase().includes('bearer')) return 'Bearer token';
    if (content.toLowerCase().includes('api key')) return 'API key';
    if (content.toLowerCase().includes('basic auth')) return 'Basic auth';
    return undefined;
  }

  private async scanAllSections(): Promise<void> {
    const sections = await fs.readdir(this.docsPath);
    
    for (const section of sections) {
      const sectionPath = path.join(this.docsPath, section);
      const stat = await fs.stat(sectionPath);
      
      if (stat.isDirectory() && section !== 'images') {
        const files = await fs.readdir(sectionPath);
        
        for (const file of files) {
          if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(sectionPath, file), 'utf-8');
            const endpoints = this.parseEndpointsFromMarkdown(content);
            this.endpoints.push(...endpoints);
          }
        }
      }
    }
  }

  private async extractPatterns(): Promise<void> {
    // Extract code patterns from documentation
    const sections = await fs.readdir(this.docsPath);
    
    for (const section of sections) {
      const sectionPath = path.join(this.docsPath, section);
      const stat = await fs.stat(sectionPath);
      
      if (stat.isDirectory() && section !== 'images') {
        const files = await fs.readdir(sectionPath);
        
        for (const file of files) {
          if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(sectionPath, file), 'utf-8');
            const patterns = this.extractCodeBlocks(content);
            this.patterns.push(...patterns);
          }
        }
      }
    }
  }

  private extractCodeBlocks(content: string): CodePattern[] {
    const patterns: CodePattern[] = [];
    const codeBlockRegex = /```(\w+)\n([\s\S]+?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1];
      const code = match[2].trim();
      
      // Get description from surrounding context
      const beforeBlock = content.slice(Math.max(0, match.index - 200), match.index);
      const descMatch = beforeBlock.match(/([^\n]+)\n*$/);
      const description = descMatch ? descMatch[1].trim() : '';
      
      patterns.push({
        language,
        pattern: this.identifyPattern(code, language),
        description,
        example: code
      });
    }
    
    return patterns;
  }

  private identifyPattern(code: string, language: string): string {
    if (code.includes('fetch(') || code.includes('axios')) return 'HTTP Request';
    if (code.includes('async') || code.includes('await')) return 'Async/Await';
    if (code.includes('try') && code.includes('catch')) return 'Error Handling';
    if (code.includes('class ')) return 'Class Definition';
    if (code.includes('function ') || code.includes('=>')) return 'Function';
    if (code.includes('import ') || code.includes('require(')) return 'Import/Module';
    return 'Code Example';
  }

  /**
   * Generate .cursorrules file
   */
  private async generateCursorRules(): Promise<void> {
    console.log('📝 Generating .cursorrules...');
    
    const content = `# AI Coding Rules for ${this.metadata.title || 'API'}

## Project Context

${this.metadata.description || 'API documentation and integration guidelines'}

Base URL: ${this.metadata.baseUrl || 'https://api.example.com'}

## API Endpoints

${this.endpoints.map(ep => `### ${ep.method} ${ep.path}
${ep.description}
${ep.authentication ? `Authentication: ${ep.authentication}` : ''}
`).join('\n')}

## Code Patterns

${this.patterns.slice(0, 10).map(p => `### ${p.language} - ${p.pattern}
${p.description}

\`\`\`${p.language}
${p.example}
\`\`\`
`).join('\n')}

## Best Practices

1. Always include proper error handling
2. Use async/await for API calls
${this.endpoints.some(e => e.authentication) ? '3. Include authentication headers in all requests' : ''}
4. Follow the code patterns shown above
5. Keep code clean and well-documented

## Common Patterns

- Use fetch() or axios for HTTP requests
- Handle errors with try/catch blocks
- Validate responses before processing
- Use environment variables for API keys
- Log errors appropriately

---
Generated by Mintlify AI Toolkit
`;

    await fs.writeFile(
      path.join(this.config.outputDir, '.cursorrules'),
      content
    );
    console.log('✓ .cursorrules created\n');
  }

  /**
   * Generate .clinerules file
   */
  private async generateClineRules(): Promise<void> {
    console.log('📝 Generating .clinerules...');
    
    const content = `# Cline AI Rules for ${this.metadata.title || 'API'}

## Overview
${this.metadata.description || 'API documentation and integration guidelines'}

## API Information
Base URL: ${this.metadata.baseUrl || 'https://api.example.com'}
${this.endpoints.some(e => e.authentication) ? `Authentication: ${this.endpoints.find(e => e.authentication)?.authentication}` : ''}

## Available Endpoints

${this.endpoints.map(ep => `**${ep.method} ${ep.path}**
${ep.description}
`).join('\n')}

## Code Examples

${this.patterns.slice(0, 5).map(p => `### ${p.description || p.pattern}

\`\`\`${p.language}
${p.example}
\`\`\`
`).join('\n')}

## Guidelines

1. Use TypeScript for type safety
2. Implement proper error handling
3. Follow REST API best practices
4. Keep code DRY and modular
5. Document complex logic

## Integration Checklist

- [ ] Set up API authentication
- [ ] Configure base URL
- [ ] Implement error handling
- [ ] Add request/response logging
- [ ] Test all endpoints
- [ ] Handle rate limiting

---
Generated by Mintlify AI Toolkit
`;

    await fs.writeFile(
      path.join(this.config.outputDir, '.clinerules'),
      content
    );
    console.log('✓ .clinerules created\n');
  }

  /**
   * Generate claude-context.md for Claude Desktop
   */
  private async generateClaudeContext(): Promise<void> {
    console.log('📝 Generating claude-context.md...');
    
    const content = `# ${this.metadata.title || 'API'} - Claude Context

## Quick Reference

${this.metadata.description || 'Complete API documentation and integration guide'}

**Base URL:** \`${this.metadata.baseUrl || 'https://api.example.com'}\`

## Authentication

${this.endpoints.some(e => e.authentication) 
  ? `This API uses ${this.endpoints.find(e => e.authentication)?.authentication}. Include it in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\``
  : 'No authentication required for public endpoints.'}

## API Endpoints

${this.endpoints.map(ep => `### ${ep.method} \`${ep.path}\`

${ep.description}

**Method:** ${ep.method}  
**Authentication:** ${ep.authentication || 'None'}

`).join('\n')}

## Common Code Patterns

${this.patterns.slice(0, 8).map((p, i) => `#### ${i + 1}. ${p.description || p.pattern}

\`\`\`${p.language}
${p.example}
\`\`\`

`).join('\n')}

## Best Practices

1. **Error Handling:** Always wrap API calls in try/catch blocks
2. **Rate Limiting:** Respect API rate limits to avoid throttling
3. **Retries:** Implement exponential backoff for failed requests
4. **Logging:** Log all API interactions for debugging
5. **Validation:** Validate request data before sending

## Example Integration

Here's a complete example of integrating with this API:

\`\`\`typescript
import axios from 'axios';

const API_BASE_URL = '${this.metadata.baseUrl || 'https://api.example.com'}';
const API_KEY = process.env.API_KEY;

class APIClient {
  private client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    }
  });

  async request(method: string, path: string, data?: any) {
    try {
      const response = await this.client.request({
        method,
        url: path,
        data
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

export const api = new APIClient();
\`\`\`

## Helpful Tips

- Use environment variables for API keys
- Implement request caching where appropriate
- Monitor API usage and costs
- Keep SDK/client libraries updated
- Review API changelog for breaking changes

---

*Generated by Mintlify AI Toolkit*  
*For complete documentation, see the full docs in this project*
`;

    await fs.writeFile(
      path.join(this.config.outputDir, 'claude-context.md'),
      content
    );
    console.log('✓ claude-context.md created\n');
  }

  /**
   * Generate .windsurfrules file
   */
  private async generateWindsurfRules(): Promise<void> {
    console.log('📝 Generating .windsurfrules...');
    
    const content = `# Windsurf AI Rules for ${this.metadata.title || 'API'}

project_context: |
  ${this.metadata.description || 'API integration project'}
  
  Base URL: ${this.metadata.baseUrl || 'https://api.example.com'}
  ${this.endpoints.some(e => e.authentication) ? `Authentication: ${this.endpoints.find(e => e.authentication)?.authentication}` : ''}

api_endpoints:
${this.endpoints.map(ep => `  - method: ${ep.method}
    path: ${ep.path}
    description: ${ep.description}
    ${ep.authentication ? `auth: ${ep.authentication}` : ''}`).join('\n')}

code_patterns:
${this.patterns.slice(0, 10).map(p => `  - language: ${p.language}
    pattern: ${p.pattern}
    description: ${p.description}`).join('\n')}

guidelines:
  - Always use TypeScript for type safety
  - Implement comprehensive error handling
  - Follow REST API conventions
  - Use async/await for asynchronous operations
  - Keep code modular and testable
  - Document all public APIs
  - Use environment variables for configuration

best_practices:
  - Validate input data before API calls
  - Handle rate limiting gracefully
  - Implement request retries with backoff
  - Log errors with context
  - Use proper HTTP status codes
  - Cache responses when appropriate

---
Generated by Mintlify AI Toolkit
`;

    await fs.writeFile(
      path.join(this.config.outputDir, '.windsurfrules'),
      content
    );
    console.log('✓ .windsurfrules created\n');
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
AI Context Generator
====================

Generate optimized context files for AI coding assistants

Usage:
  npm run generate-ai-context -- <docs-path> [options]

Examples:
  # Generate for Cursor
  npm run generate-ai-context -- ./scraped-docs --format cursor

  # Generate for all AI assistants
  npm run generate-ai-context -- ./scraped-docs --format all

  # With code patterns
  npm run generate-ai-context -- ./scraped-docs --include-patterns

Options:
  --format <type>         Context format: cursor, cline, claude, windsurf, all (default: all)
  --output <dir>          Output directory (default: ./ai-context)
  --include-patterns      Include code pattern analysis
  --include-examples      Include code examples
  --max-tokens <n>        Maximum tokens for context (default: 8000)
  --help                  Show this help

Supported AI Assistants:
  • Cursor (.cursorrules)
  • Cline (.clinerules)
  • Claude Desktop (claude-context.md)
  • Windsurf (.windsurfrules)

Output Files:
  ./ai-context/
  ├── .cursorrules          # Cursor AI rules
  ├── .clinerules           # Cline AI rules
  ├── claude-context.md     # Claude Desktop context
  └── .windsurfrules        # Windsurf AI rules
    `);
    process.exit(0);
  }

  const docsPath = args[0];
  const formatIdx = args.indexOf('--format');
  const outputIdx = args.indexOf('--output');
  const maxTokensIdx = args.indexOf('--max-tokens');

  const config: ContextConfig = {
    format: formatIdx !== -1 ? args[formatIdx + 1] as any : 'all',
    outputDir: outputIdx !== -1 ? args[outputIdx + 1] : './ai-context',
    includePatterns: args.includes('--include-patterns'),
    includeExamples: args.includes('--include-examples'),
    maxTokens: maxTokensIdx !== -1 ? parseInt(args[maxTokensIdx + 1]) : 8000
  };

  // Create output directory
  await fs.mkdir(config.outputDir, { recursive: true });

  const generator = new AIContextGenerator(docsPath, config);
  
  try {
    await generator.generate();
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { AIContextGenerator };
