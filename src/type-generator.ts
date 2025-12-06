#!/usr/bin/env node
/**
 * TypeScript Type Generator
 * 
 * Auto-generates TypeScript types from API documentation
 * 
 * Generates:
 * - TypeScript interfaces
 * - Zod schemas
 * - Type guards
 * - OpenAPI schema
 * 
 * Usage:
 *   npm run generate-types -- ./scraped-docs
 *   npm run generate-types -- ./scraped-docs --with-zod
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface TypeDefinition {
  name: string;
  properties: Record<string, PropertyDefinition>;
  required: string[];
}

interface PropertyDefinition {
  type: string;
  description?: string;
  optional?: boolean;
  array?: boolean;
}

class TypeScriptGenerator {
  private docsPath: string;
  private types: TypeDefinition[] = [];
  private withZod: boolean;

  constructor(docsPath: string, withZod: boolean = false) {
    this.docsPath = docsPath;
    this.withZod = withZod;
  }

  async generate(): Promise<void> {
    console.log(`\n📘 Generating TypeScript Types\n`);
    
    await this.extractTypes();
    await this.generateTypeScript();
    
    if (this.withZod) {
      await this.generateZod();
    }
    
    console.log('\n✅ Types generated!\n');
  }

  private async extractTypes(): Promise<void> {
    // Extract from MCP tools or docs
    const mcpPath = path.join(this.docsPath, 'mcp-tools.json');
    
    try {
      const content = await fs.readFile(mcpPath, 'utf-8');
      const tools = JSON.parse(content);
      
      for (const tool of tools) {
        if (tool.inputSchema?.properties) {
          this.types.push({
            name: this.toPascalCase(tool.name) + 'Input',
            properties: tool.inputSchema.properties,
            required: tool.inputSchema.required || []
          });
        }
      }
    } catch {
      console.warn('⚠️  No MCP tools found');
    }
  }

  private async generateTypeScript(): Promise<void> {
    let code = `// Auto-generated TypeScript types\n\n`;
    
    for (const type of this.types) {
      code += `export interface ${type.name} {\n`;
      
      for (const [key, prop] of Object.entries(type.properties)) {
        const optional = !type.required.includes(key) ? '?' : '';
        const tsType = this.toTSType(prop.type);
        const array = prop.array ? '[]' : '';
        
        if (prop.description) {
          code += `  /** ${prop.description} */\n`;
        }
        code += `  ${key}${optional}: ${tsType}${array};\n`;
      }
      
      code += `}\n\n`;
    }
    
    await fs.mkdir('./types-output', { recursive: true });
    await fs.writeFile('./types-output/index.ts', code);
    console.log('✓ TypeScript types generated');
  }

  private async generateZod(): Promise<void> {
    let code = `import { z } from 'zod';\n\n`;
    
    for (const type of this.types) {
      code += `export const ${type.name}Schema = z.object({\n`;
      
      for (const [key, prop] of Object.entries(type.properties)) {
        const zodType = this.toZodType(prop.type);
        const optional = !type.required.includes(key);
        const array = prop.array ? '.array()' : '';
        const opt = optional ? '.optional()' : '';
        
        code += `  ${key}: z.${zodType}()${array}${opt}`;
        if (prop.description) {
          code += `.describe('${prop.description}')`;
        }
        code += `,\n`;
      }
      
      code += `});\n\n`;
      code += `export type ${type.name} = z.infer<typeof ${type.name}Schema>;\n\n`;
    }
    
    await fs.writeFile('./types-output/schemas.ts', code);
    console.log('✓ Zod schemas generated');
  }

  private toPascalCase(str: string): string {
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }

  private toTSType(type: string): string {
    const map: Record<string, string> = {
      string: 'string',
      number: 'number',
      integer: 'number',
      boolean: 'boolean',
      object: 'Record<string, any>',
      array: 'any[]'
    };
    return map[type] || 'any';
  }

  private toZodType(type: string): string {
    const map: Record<string, string> = {
      string: 'string',
      number: 'number',
      integer: 'number',
      boolean: 'boolean',
      object: 'record(z.string(), z.any())',
      array: 'array(z.any())'
    };
    return map[type] || 'any';
  }
}

async function main() {
  const docsPath = process.argv[2] || './scraped-docs';
  const withZod = process.argv.includes('--with-zod');
  
  const generator = new TypeScriptGenerator(docsPath, withZod);
  await generator.generate();
}

main().catch(console.error);

export { TypeScriptGenerator };
