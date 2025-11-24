#!/usr/bin/env node
/**
 * Code Example Extractor
 * 
 * Extracts and organizes code examples from scraped documentation
 * Useful for quick reference and understanding API usage
 * 
 * Usage:
 *   tsx src/example-extractor.ts ./output/etherscan
 *   tsx src/example-extractor.ts ./output/etherscan --language typescript
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface CodeExample {
  title: string;
  language: string;
  code: string;
  source: string;
  description?: string;
}

class CodeExampleExtractor {
  private docsPath: string;
  private outputPath: string;
  private filterLanguage?: string;

  constructor(docsPath: string, outputPath?: string, filterLanguage?: string) {
    this.docsPath = docsPath;
    this.outputPath = outputPath || path.join(docsPath, 'examples');
    this.filterLanguage = filterLanguage;
  }

  /**
   * Extract all code examples from scraped documentation
   */
  async extract(): Promise<void> {
    console.log('📚 Extracting code examples from documentation...');

    const examples: CodeExample[] = [];

    // Read all markdown files
    const files = await this.findMarkdownFiles(this.docsPath);

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const fileExamples = this.extractFromMarkdown(content, file);
      examples.push(...fileExamples);
    }

    // Filter by language if specified
    const filtered = this.filterLanguage
      ? examples.filter(ex => ex.language === this.filterLanguage)
      : examples;

    console.log(`✓ Found ${filtered.length} code examples`);

    // Organize by language
    await this.organizeByLanguage(filtered);

    // Generate index
    await this.generateIndex(filtered);

    console.log(`📁 Saved to: ${this.outputPath}`);
  }

  /**
   * Find all markdown files recursively
   */
  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await this.findMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Extract code examples from a markdown file
   */
  private extractFromMarkdown(markdown: string, source: string): CodeExample[] {
    const examples: CodeExample[] = [];
    
    // Match code blocks: ```language\ncode\n```
    const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
    let match;

    // Get title from the first heading
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const defaultTitle = titleMatch ? titleMatch[1] : path.basename(source);

    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      const language = match[1];
      const code = match[2].trim();

      // Skip empty code blocks
      if (!code) continue;

      // Find description (paragraph before code block)
      const beforeCode = markdown.substring(0, match.index);
      const descMatch = beforeCode.match(/\n\n([^\n]+)\n*$/);
      const description = descMatch ? descMatch[1].trim() : undefined;

      // Find specific title (heading before code block)
      const headingMatch = beforeCode.match(/\n#{2,4}\s+([^\n]+)\n[^#]*$/);
      const title = headingMatch ? headingMatch[1].trim() : defaultTitle;

      examples.push({
        title,
        language,
        code,
        source: path.relative(this.docsPath, source),
        description,
      });
    }

    return examples;
  }

  /**
   * Organize examples by language
   */
  private async organizeByLanguage(examples: CodeExample[]): Promise<void> {
    await fs.mkdir(this.outputPath, { recursive: true });

    // Group by language
    const byLanguage = new Map<string, CodeExample[]>();
    
    for (const example of examples) {
      if (!byLanguage.has(example.language)) {
        byLanguage.set(example.language, []);
      }
      byLanguage.get(example.language)!.push(example);
    }

    // Save each language to a separate file
    for (const [language, langExamples] of byLanguage) {
      let markdown = `# ${this.capitalize(language)} Examples\n\n`;
      markdown += `Total examples: ${langExamples.length}\n\n`;
      markdown += `---\n\n`;

      for (const example of langExamples) {
        markdown += `## ${example.title}\n\n`;
        
        if (example.description) {
          markdown += `${example.description}\n\n`;
        }
        
        markdown += `**Source:** \`${example.source}\`\n\n`;
        markdown += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
        markdown += `---\n\n`;
      }

      const filename = `${language}-examples.md`;
      await fs.writeFile(
        path.join(this.outputPath, filename),
        markdown
      );

      console.log(`✓ ${language}: ${langExamples.length} examples`);
    }
  }

  /**
   * Generate index of all examples
   */
  private async generateIndex(examples: CodeExample[]): Promise<void> {
    let markdown = `# Code Examples Index\n\n`;
    markdown += `Total examples: ${examples.length}\n\n`;

    // Group by language
    const byLanguage = new Map<string, CodeExample[]>();
    
    for (const example of examples) {
      if (!byLanguage.has(example.language)) {
        byLanguage.set(example.language, []);
      }
      byLanguage.get(example.language)!.push(example);
    }

    // Table of contents
    markdown += `## Languages\n\n`;
    for (const [language, langExamples] of byLanguage) {
      markdown += `- [${this.capitalize(language)}](#${language}) (${langExamples.length} examples)\n`;
    }
    markdown += `\n`;

    // Examples by language
    for (const [language, langExamples] of byLanguage) {
      markdown += `## ${this.capitalize(language)}\n\n`;
      
      for (const example of langExamples) {
        markdown += `### ${example.title}\n\n`;
        
        if (example.description) {
          markdown += `${example.description}\n\n`;
        }
        
        markdown += `**Source:** \`${example.source}\`\n\n`;
        markdown += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
      }
    }

    await fs.writeFile(
      path.join(this.outputPath, 'INDEX.md'),
      markdown
    );
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Code Example Extractor
======================

Extract and organize code examples from scraped documentation

Usage:
  tsx src/example-extractor.ts <docs-path> [options]

Examples:
  tsx src/example-extractor.ts ./output/etherscan
  tsx src/example-extractor.ts ./output/etherscan --language typescript
  tsx src/example-extractor.ts ./output/etherscan --output ./examples

Options:
  --language <lang>  Filter by language (typescript, python, javascript, etc.)
  --output <dir>     Output directory (default: <docs-path>/examples)
  --help            Show this help
    `);
    process.exit(0);
  }

  const docsPath = args[0];
  const languageIdx = args.indexOf('--language');
  const language = languageIdx !== -1 ? args[languageIdx + 1] : undefined;
  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : undefined;

  const extractor = new CodeExampleExtractor(docsPath, outputPath, language);
  
  try {
    await extractor.extract();
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { CodeExampleExtractor };
