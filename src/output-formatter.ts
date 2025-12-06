/**
 * Output Formatters for Mintlify Documentation Scraper
 * 
 * Supports multiple output formats:
 * - Markdown (default): Clean markdown files
 * - JSON: Structured JSON with metadata
 * - Single-file: Combined markdown in one file
 * - Per-page: Individual files per documentation page
 * - Per-section: Files organized by section
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface DocContent {
  url: string;
  title: string;
  section: string;
  subsection?: string;
  content: string;
  codeExamples: Array<{
    language: string;
    code: string;
    description?: string;
  }>;
  metadata?: {
    scraped_at: string;
    page_rank?: number;
    tags?: string[];
  };
}

export interface OutputOptions {
  format: 'markdown' | 'json' | 'both';
  structure: 'single-file' | 'per-page' | 'per-section';
  include_metadata: boolean;
  preserve_code_blocks: boolean;
  output_dir: string;
}

export class OutputFormatter {
  private options: OutputOptions;

  constructor(options: OutputOptions) {
    this.options = options;
  }

  /**
   * Format and save documentation content
   */
  async save(docs: DocContent[]): Promise<void> {
    await fs.mkdir(this.options.output_dir, { recursive: true });

    if (this.options.format === 'markdown' || this.options.format === 'both') {
      await this.saveMarkdown(docs);
    }

    if (this.options.format === 'json' || this.options.format === 'both') {
      await this.saveJson(docs);
    }
  }

  /**
   * Save as markdown files
   */
  private async saveMarkdown(docs: DocContent[]): Promise<void> {
    switch (this.options.structure) {
      case 'single-file':
        await this.saveSingleMarkdown(docs);
        break;
      case 'per-page':
        await this.savePerPageMarkdown(docs);
        break;
      case 'per-section':
        await this.savePerSectionMarkdown(docs);
        break;
    }
  }

  /**
   * Save all content in a single markdown file
   */
  private async saveSingleMarkdown(docs: DocContent[]): Promise<void> {
    let content = '';

    if (this.options.include_metadata) {
      content += this.generateMetadataHeader(docs);
    }

    // Group by section
    const sections = this.groupBySection(docs);

    for (const [sectionName, sectionDocs] of sections) {
      content += `\n# ${sectionName}\n\n`;

      for (const doc of sectionDocs) {
        content += this.formatDocContent(doc);
        content += '\n---\n\n';
      }
    }

    const filePath = path.join(this.options.output_dir, 'COMPLETE.md');
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✅ Saved single markdown file: ${filePath}`);
  }

  /**
   * Save each page as a separate markdown file
   */
  private async savePerPageMarkdown(docs: DocContent[]): Promise<void> {
    for (const doc of docs) {
      const filename = this.sanitizeFilename(doc.title) + '.md';
      const filePath = path.join(this.options.output_dir, filename);
      
      let content = '';
      if (this.options.include_metadata) {
        content += this.formatMetadata(doc);
        content += '\n\n';
      }
      
      content += this.formatDocContent(doc);
      
      await fs.writeFile(filePath, content, 'utf-8');
    }
    
    console.log(`✅ Saved ${docs.length} markdown files`);
  }

  /**
   * Save files organized by section
   */
  private async savePerSectionMarkdown(docs: DocContent[]): Promise<void> {
    const sections = this.groupBySection(docs);

    for (const [sectionName, sectionDocs] of sections) {
      const sectionDir = path.join(
        this.options.output_dir,
        this.sanitizeFilename(sectionName)
      );
      await fs.mkdir(sectionDir, { recursive: true });

      let indexContent = `# ${sectionName}\n\n`;

      for (const doc of sectionDocs) {
        const filename = this.sanitizeFilename(doc.title) + '.md';
        const filePath = path.join(sectionDir, filename);
        
        let content = '';
        if (this.options.include_metadata) {
          content += this.formatMetadata(doc);
          content += '\n\n';
        }
        
        content += this.formatDocContent(doc);
        
        await fs.writeFile(filePath, content, 'utf-8');
        
        // Add to index
        indexContent += `- [${doc.title}](./${filename})\n`;
      }

      // Save section index
      const indexPath = path.join(sectionDir, 'INDEX.md');
      await fs.writeFile(indexPath, indexContent, 'utf-8');
    }

    // Create main index
    await this.createMainIndex(sections);
    
    console.log(`✅ Saved ${sections.size} sections with ${docs.length} total pages`);
  }

  /**
   * Save as JSON files
   */
  private async saveJson(docs: DocContent[]): Promise<void> {
    const jsonData = {
      generated_at: new Date().toISOString(),
      total_pages: docs.length,
      sections: this.groupBySectionToObject(docs),
      pages: docs.map(doc => ({
        url: doc.url,
        title: doc.title,
        section: doc.section,
        subsection: doc.subsection,
        content: doc.content,
        code_examples: doc.codeExamples,
        metadata: doc.metadata,
      })),
    };

    const filePath = path.join(this.options.output_dir, 'documentation.json');
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log(`✅ Saved JSON file: ${filePath}`);
  }

  /**
   * Format documentation content as markdown
   */
  private formatDocContent(doc: DocContent): string {
    let content = '';

    // Title
    content += `# ${doc.title}\n\n`;

    // Main content
    content += doc.content;
    content += '\n\n';

    // Code examples
    if (doc.codeExamples.length > 0) {
      content += `## Code Examples\n\n`;
      
      for (const example of doc.codeExamples) {
        if (example.description) {
          content += `${example.description}\n\n`;
        }
        
        content += `\`\`\`${example.language}\n`;
        content += example.code;
        content += `\n\`\`\`\n\n`;
      }
    }

    return content;
  }

  /**
   * Format metadata as frontmatter
   */
  private formatMetadata(doc: DocContent): string {
    const metadata = doc.metadata || {};
    
    let frontmatter = '---\n';
    frontmatter += `title: "${doc.title}"\n`;
    frontmatter += `url: "${doc.url}"\n`;
    frontmatter += `section: "${doc.section}"\n`;
    
    if (doc.subsection) {
      frontmatter += `subsection: "${doc.subsection}"\n`;
    }
    
    if ((metadata as any).scraped_at) {
      frontmatter += `scraped_at: "${(metadata as any).scraped_at}"\n`;
    }
    
    if ((metadata as any).page_rank) {
      frontmatter += `page_rank: ${(metadata as any).page_rank}\n`;
    }
    
    if ((metadata as any).tags && (metadata as any).tags.length > 0) {
      frontmatter += `tags:\n`;
      for (const tag of (metadata as any).tags) {
        frontmatter += `  - ${tag}\n`;
      }
    }
    
    frontmatter += '---';
    
    return frontmatter;
  }

  /**
   * Generate metadata header for single file
   */
  private generateMetadataHeader(docs: DocContent[]): string {
    const sections = this.groupBySection(docs);
    
    let header = '# Documentation\n\n';
    header += `Generated: ${new Date().toISOString()}\n\n`;
    header += `Total Pages: ${docs.length}\n\n`;
    header += `## Table of Contents\n\n`;
    
    for (const [sectionName, sectionDocs] of sections) {
      header += `- [${sectionName}](#${this.slugify(sectionName)})\n`;
      for (const doc of sectionDocs) {
        header += `  - [${doc.title}](#${this.slugify(doc.title)})\n`;
      }
    }
    
    header += '\n';
    return header;
  }

  /**
   * Create main index file
   */
  private async createMainIndex(sections: Map<string, DocContent[]>): Promise<void> {
    let index = '# Documentation Index\n\n';
    
    for (const [sectionName, sectionDocs] of sections) {
      const sectionSlug = this.sanitizeFilename(sectionName);
      index += `## [${sectionName}](./${sectionSlug}/INDEX.md)\n\n`;
      
      for (const doc of sectionDocs) {
        const filename = this.sanitizeFilename(doc.title) + '.md';
        index += `- [${doc.title}](./${sectionSlug}/${filename})\n`;
      }
      
      index += '\n';
    }

    const indexPath = path.join(this.options.output_dir, 'INDEX.md');
    await fs.writeFile(indexPath, index, 'utf-8');
  }

  /**
   * Group documents by section
   */
  private groupBySection(docs: DocContent[]): Map<string, DocContent[]> {
    const sections = new Map<string, DocContent[]>();

    for (const doc of docs) {
      const section = doc.section || 'Uncategorized';
      if (!sections.has(section)) {
        sections.set(section, []);
      }
      sections.get(section)!.push(doc);
    }

    return sections;
  }

  /**
   * Group documents by section (as object)
   */
  private groupBySectionToObject(docs: DocContent[]): Record<string, DocContent[]> {
    const sections = this.groupBySection(docs);
    const result: Record<string, DocContent[]> = {};
    
    for (const [name, docs] of sections) {
      result[name] = docs;
    }
    
    return result;
  }

  /**
   * Sanitize filename
   */
  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  /**
   * Create URL slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
