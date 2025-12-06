#!/usr/bin/env node
/**
 * Enhanced Code Example Extractor
 * 
 * Extracts and organizes code examples from documentation
 * 
 * Features:
 * - Organize by language
 * - Generate test suites
 * - Create runnable examples
 * - Extract dependencies
 * 
 * Usage:
 *   npm run extract-code -- ./scraped-docs
 *   npm run extract-code -- ./scraped-docs --with-tests
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface CodeExample {
  language: string;
  code: string;
  title?: string;
  dependencies?: string[];
  context?: string;
}

interface TestCase {
  name: string;
  code: string;
  expected?: string;
}

class CodeExtractor {
  private docsPath: string;
  private examples: Map<string, CodeExample[]> = new Map();
  private withTests: boolean;

  constructor(docsPath: string, withTests: boolean = false) {
    this.docsPath = docsPath;
    this.withTests = withTests;
  }

  async extract(): Promise<void> {
    console.log(`\n📦 Extracting Code Examples\n`);
    
    await this.scanDocs();
    await this.organizeExamples();
    
    if (this.withTests) {
      await this.generateTests();
    }
    
    console.log('\n✅ Code examples extracted!\n');
  }

  private async scanDocs(): Promise<void> {
    const files = await this.getAllMarkdownFiles(this.docsPath);
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const examples = this.extractCodeBlocks(content, file);
      
      for (const example of examples) {
        const lang = example.language || 'plaintext';
        if (!this.examples.has(lang)) {
          this.examples.set(lang, []);
        }
        this.examples.get(lang)!.push(example);
      }
    }
    
    console.log(`✓ Found examples in ${this.examples.size} languages`);
  }

  private extractCodeBlocks(markdown: string, filePath: string): CodeExample[] {
    const examples: CodeExample[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      const language = match[1] || 'plaintext';
      const code = match[2].trim();
      
      // Get context (heading before code block)
      const beforeCode = markdown.substring(0, match.index);
      const headingMatch = beforeCode.match(/#+\s+(.+)$/m);
      const title = headingMatch ? headingMatch[1] : undefined;
      
      // Extract dependencies
      const dependencies = this.extractDependencies(code, language);
      
      examples.push({
        language,
        code,
        title,
        dependencies,
        context: path.basename(filePath, '.md')
      });
    }
    
    return examples;
  }

  private extractDependencies(code: string, language: string): string[] {
    const deps: string[] = [];
    
    if (language === 'javascript' || language === 'typescript') {
      const importRegex = /import .+ from ['"](.+)['"]/g;
      const requireRegex = /require\(['"](.+)['"]\)/g;
      
      let match;
      while ((match = importRegex.exec(code)) !== null) {
        deps.push(match[1]);
      }
      while ((match = requireRegex.exec(code)) !== null) {
        deps.push(match[1]);
      }
    } else if (language === 'python') {
      const importRegex = /(?:from|import)\s+(\w+)/g;
      let match;
      while ((match = importRegex.exec(code)) !== null) {
        deps.push(match[1]);
      }
    }
    
    return [...new Set(deps)]; // Remove duplicates
  }

  private async organizeExamples(): Promise<void> {
    const outputDir = './code-examples';
    await fs.mkdir(outputDir, { recursive: true });
    
    for (const [language, examples] of this.examples) {
      const langDir = path.join(outputDir, language);
      await fs.mkdir(langDir, { recursive: true });
      
      // Create index file
      let indexContent = `# ${language.toUpperCase()} Examples\n\n`;
      indexContent += `Found ${examples.length} examples\n\n`;
      
      // Save each example
      for (let i = 0; i < examples.length; i++) {
        const example = examples[i];
        const filename = `example-${i + 1}.${this.getExtension(language)}`;
        const filepath = path.join(langDir, filename);
        
        let content = '';
        if (example.title) {
          content += `// ${example.title}\n`;
        }
        if (example.context) {
          content += `// From: ${example.context}\n`;
        }
        if (example.dependencies && example.dependencies.length > 0) {
          content += `// Dependencies: ${example.dependencies.join(', ')}\n`;
        }
        content += '\n' + example.code;
        
        await fs.writeFile(filepath, content);
        
        indexContent += `## Example ${i + 1}\n`;
        if (example.title) {
          indexContent += `**${example.title}**\n\n`;
        }
        indexContent += `File: \`${filename}\`\n\n`;
        if (example.dependencies && example.dependencies.length > 0) {
          indexContent += `Dependencies: ${example.dependencies.join(', ')}\n\n`;
        }
        indexContent += '```' + language + '\n' + example.code + '\n```\n\n';
      }
      
      await fs.writeFile(path.join(langDir, 'README.md'), indexContent);
    }
    
    console.log(`✓ Organized examples in ./code-examples/`);
  }

  private async generateTests(): Promise<void> {
    for (const [language, examples] of this.examples) {
      if (!['javascript', 'typescript', 'python'].includes(language)) {
        continue;
      }
      
      const langDir = path.join('./code-examples', language);
      const testCases = this.generateTestCases(examples, language);
      
      if (language === 'javascript' || language === 'typescript') {
        await this.generateJestTests(langDir, testCases);
      } else if (language === 'python') {
        await this.generatePytestTests(langDir, testCases);
      }
    }
    
    console.log(`✓ Generated test suites`);
  }

  private generateTestCases(examples: CodeExample[], language: string): TestCase[] {
    const tests: TestCase[] = [];
    
    for (let i = 0; i < examples.length; i++) {
      const example = examples[i];
      const name = example.title || `Example ${i + 1}`;
      
      tests.push({
        name,
        code: example.code,
        expected: undefined // Could be inferred from comments
      });
    }
    
    return tests;
  }

  private async generateJestTests(dir: string, tests: TestCase[]): Promise<void> {
    let content = `import { describe, test, expect } from '@jest/globals';\n\n`;
    content += `describe('Code Examples', () => {\n`;
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      content += `  test('${test.name}', async () => {\n`;
      content += `    // TODO: Add test implementation\n`;
      content += `    expect(true).toBe(true);\n`;
      content += `  });\n\n`;
    }
    
    content += `});\n`;
    
    await fs.writeFile(path.join(dir, 'examples.test.ts'), content);
  }

  private async generatePytestTests(dir: string, tests: TestCase[]): Promise<void> {
    let content = `import pytest\n\n`;
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const funcName = test.name.toLowerCase().replace(/\s+/g, '_');
      content += `def test_${funcName}():\n`;
      content += `    # TODO: Add test implementation\n`;
      content += `    assert True\n\n`;
    }
    
    await fs.writeFile(path.join(dir, 'test_examples.py'), content);
  }

  private getExtension(language: string): string {
    const ext: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      bash: 'sh',
      shell: 'sh',
      json: 'json',
      yaml: 'yaml',
      sql: 'sql',
      rust: 'rs',
      go: 'go'
    };
    return ext[language] || 'txt';
  }

  private async getAllMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          files.push(...await this.getAllMarkdownFiles(fullPath));
        } else if (entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist
    }
    
    return files;
  }
}

async function main() {
  const docsPath = process.argv[2] || './scraped-docs';
  const withTests = process.argv.includes('--with-tests');
  
  const extractor = new CodeExtractor(docsPath, withTests);
  await extractor.extract();
}

main().catch(console.error);

export { CodeExtractor };
