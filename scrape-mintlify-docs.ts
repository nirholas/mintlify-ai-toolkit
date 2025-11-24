#!/usr/bin/env node
/**
 * Mintlify Documentation Scraper
 * 
 * Scrapes complete documentation from any Mintlify-based docs site
 * Generates markdown files optimized for AI agent consumption
 * 
 * Usage:
 *   npm run scrape-docs -- https://docs.etherscan.io
 *   npm run scrape-docs -- https://docs.etherscan.io --output ./docs/etherscan
 * 
 * Features:
 * - Discovers all pages via sitemap.xml
 * - Extracts clean markdown content
 * - Preserves code examples and API schemas
 * - Generates index and navigation structure
 * - Handles rate limiting automatically
 * 
 * Benefits the world by:
 * - Making documentation AI-accessible
 * - Enabling better agent understanding
 * - Creating offline documentation backups
 * - Improving MCP server development
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import { mkdir } from 'fs/promises';

interface ScraperConfig {
  baseUrl: string;
  outputDir: string;
  maxConcurrent: number;
  delayMs: number;
  userAgent: string;
}

interface DocPage {
  url: string;
  path: string;
  title: string;
  content: string;
  section: string;
  subsection?: string;
  codeExamples: CodeExample[];
  apiEndpoint?: ApiEndpoint;
}

interface CodeExample {
  language: string;
  code: string;
  description?: string;
}

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
  response?: string;
}

class MintlifyDocsScraper {
  private config: ScraperConfig;
  private visitedUrls = new Set<string>();
  private pages: DocPage[] = [];
  private queue: string[] = [];

  constructor(config: Partial<ScraperConfig>) {
    this.config = {
      baseUrl: config.baseUrl || '',
      outputDir: config.outputDir || './scraped-docs',
      maxConcurrent: config.maxConcurrent || 3,
      delayMs: config.delayMs || 1000,
      userAgent: config.userAgent || 'MintlifyDocsScraper/1.0 (AI Agent Documentation Tool)',
    };
  }

  /**
   * Main scraping workflow
   */
  async scrape(): Promise<void> {
    console.log(`🚀 Starting Mintlify docs scraper for: ${this.config.baseUrl}`);
    
    // Step 1: Discover all pages
    await this.discoverPages();
    
    // Step 2: Scrape each page
    await this.scrapeAllPages();
    
    // Step 3: Generate documentation files
    await this.generateDocumentation();
    
    console.log(`✅ Scraping complete! ${this.pages.length} pages processed`);
    console.log(`📁 Documentation saved to: ${this.config.outputDir}`);
  }

  /**
   * Discover all documentation pages
   */
  private async discoverPages(): Promise<void> {
    console.log('🔍 Discovering pages...');
    
    // Try sitemap.xml first (Mintlify standard)
    const sitemapUrl = `${this.config.baseUrl}/sitemap.xml`;
    const urls = await this.parseSitemap(sitemapUrl);
    
    if (urls.length > 0) {
      console.log(`📋 Found ${urls.length} pages in sitemap`);
      this.queue.push(...urls);
      return;
    }
    
    // Fallback: Crawl from homepage
    console.log('📋 No sitemap found, crawling from homepage...');
    await this.crawlFromHomepage();
  }

  /**
   * Parse sitemap.xml to get all URLs
   */
  private async parseSitemap(sitemapUrl: string): Promise<string[]> {
    try {
      const response = await fetch(sitemapUrl, {
        headers: { 'User-Agent': this.config.userAgent },
      });
      
      if (!response.ok) return [];
      
      const xml = await response.text();
      const urls: string[] = [];
      
      // Extract <loc> URLs from sitemap
      const locMatches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
      for (const match of locMatches) {
        const url = match[1];
        // Filter out non-documentation URLs
        if (this.isDocumentationUrl(url)) {
          urls.push(url);
        }
      }
      
      return urls;
    } catch (error) {
      console.warn(`⚠️  Could not parse sitemap: ${error}`);
      return [];
    }
  }

  /**
   * Check if URL is a documentation page
   */
  private isDocumentationUrl(url: string): boolean {
    // Exclude common non-doc pages
    const excludePatterns = [
      '/changelog',
      '/blog',
      '/search',
      '/404',
      '/legal',
      '/privacy',
      '/terms',
    ];
    
    return !excludePatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Crawl from homepage to discover pages
   */
  private async crawlFromHomepage(): Promise<void> {
    const homepage = this.config.baseUrl;
    const links = await this.extractLinks(homepage);
    
    console.log(`📋 Found ${links.length} links from homepage`);
    this.queue.push(...links);
  }

  /**
   * Extract all documentation links from a page
   */
  private async extractLinks(url: string): Promise<string[]> {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': this.config.userAgent },
      });
      
      if (!response.ok) return [];
      
      const html = await response.text();
      const $ = cheerio.load(html);
      const links: string[] = [];
      
      // Mintlify uses nav elements and specific classes
      $('nav a, .sidebar a, [class*="nav"] a').each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
          const fullUrl = new URL(href, this.config.baseUrl).href;
          if (fullUrl.startsWith(this.config.baseUrl) && this.isDocumentationUrl(fullUrl)) {
            links.push(fullUrl);
          }
        }
      });
      
      return [...new Set(links)]; // Deduplicate
    } catch (error) {
      console.warn(`⚠️  Could not extract links from ${url}: ${error}`);
      return [];
    }
  }

  /**
   * Scrape all discovered pages
   */
  private async scrapeAllPages(): Promise<void> {
    console.log(`📖 Scraping ${this.queue.length} pages...`);
    
    let processed = 0;
    const total = this.queue.length;
    
    // Process in batches to respect rate limits
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.config.maxConcurrent);
      
      await Promise.all(
        batch.map(url => this.scrapePage(url))
      );
      
      processed += batch.length;
      console.log(`⏳ Progress: ${processed}/${total} pages`);
      
      // Rate limiting
      if (this.queue.length > 0) {
        await this.sleep(this.config.delayMs);
      }
    }
  }

  /**
   * Scrape a single documentation page
   */
  private async scrapePage(url: string): Promise<void> {
    if (this.visitedUrls.has(url)) return;
    this.visitedUrls.add(url);
    
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': this.config.userAgent },
      });
      
      if (!response.ok) {
        console.warn(`⚠️  Failed to fetch ${url}: ${response.status}`);
        return;
      }
      
      const html = await response.text();
      const page = this.parsePage(url, html);
      
      if (page) {
        this.pages.push(page);
        console.log(`✓ ${page.title}`);
      }
    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error);
    }
  }

  /**
   * Parse HTML page into structured documentation
   */
  private parsePage(url: string, html: string): DocPage | null {
    const $ = cheerio.load(html);
    
    // Extract title
    const title = $('h1').first().text().trim() || 
                  $('title').text().trim() || 
                  'Untitled';
    
    // Extract main content (Mintlify uses specific containers)
    const contentSelectors = [
      'main',
      '[class*="content"]',
      'article',
      '.markdown',
    ];
    
    let $content = $('main');
    for (const selector of contentSelectors) {
      const $el = $(selector);
      if ($el.length > 0) {
        $content = $el;
        break;
      }
    }
    
    // Remove navigation and non-content elements
    $content.find('nav, .sidebar, .toc, [class*="navigation"]').remove();
    
    // Extract code examples
    const codeExamples = this.extractCodeExamples($content);
    
    // Extract API endpoint info (if present)
    const apiEndpoint = this.extractApiEndpoint($content);
    
    // Convert to clean markdown
    const content = this.htmlToMarkdown($content);
    
    // Determine section from URL
    const urlPath = new URL(url).pathname;
    const pathParts = urlPath.split('/').filter(Boolean);
    const section = pathParts[0] || 'root';
    const subsection = pathParts[1];
    
    return {
      url,
      path: urlPath,
      title,
      content,
      section,
      subsection,
      codeExamples,
      apiEndpoint,
    };
  }

  /**
   * Extract code examples from content
   */
  private extractCodeExamples($content: cheerio.Cheerio<any>): CodeExample[] {
    const examples: CodeExample[] = [];
    
    $content.find('pre code, .code-block').each((_, el) => {
      const $el = cheerio.load(el)('code, .code-block');
      const code = $el.text().trim();
      
      // Try to detect language from class names
      const className = $el.attr('class') || '';
      const langMatch = className.match(/language-(\w+)|lang-(\w+)/);
      const language = langMatch ? (langMatch[1] || langMatch[2]) : 'text';
      
      // Look for description in preceding paragraph
      const $prev = $el.parent().prev('p');
      const description = $prev.length > 0 ? $prev.text().trim() : undefined;
      
      examples.push({ language, code, description });
    });
    
    return examples;
  }

  /**
   * Extract API endpoint information
   */
  private extractApiEndpoint($content: cheerio.Cheerio<any>): ApiEndpoint | undefined {
    // Look for API endpoint indicators
    const $endpoint = $content.find('[class*="endpoint"], .api-endpoint, code:contains("https://")').first();
    if ($endpoint.length === 0) return undefined;
    
    const endpointText = $endpoint.text().trim();
    
    // Extract method (GET, POST, etc.)
    const methodMatch = endpointText.match(/\b(GET|POST|PUT|DELETE|PATCH)\b/);
    const method = methodMatch ? methodMatch[1] : 'GET';
    
    // Extract endpoint URL
    const urlMatch = endpointText.match(/https?:\/\/[^\s]+/);
    const endpoint = urlMatch ? urlMatch[0] : endpointText;
    
    // Extract parameters from tables or lists
    const parameters: ApiEndpoint['parameters'] = [];
    $content.find('table').each((_, table) => {
      const $table = cheerio.load(table)('table');
      $table.find('tr').each((i, row) => {
        if (i === 0) return; // Skip header
        
        const $row = cheerio.load(row)('tr');
        const cells = $row.find('td');
        if (cells.length >= 3) {
          parameters.push({
            name: cheerio.load(cells[0])('td').text().trim(),
            type: cheerio.load(cells[1])('td').text().trim(),
            required: cheerio.load(cells[2])('td').text().toLowerCase().includes('yes'),
            description: cells.length > 3 ? cheerio.load(cells[3])('td').text().trim() : '',
          });
        }
      });
    });
    
    // Extract response example
    const $response = $content.find('pre:contains("response"), pre:contains("Response")').first();
    const response = $response.length > 0 ? $response.text().trim() : undefined;
    
    return {
      method,
      endpoint,
      description: $content.find('p').first().text().trim(),
      parameters,
      response,
    };
  }

  /**
   * Convert HTML to clean markdown
   */
  private htmlToMarkdown($element: cheerio.Cheerio<any>): string {
    const $ = cheerio.load($element.html() || '');
    let markdown = '';
    
    // Process each element
    $element.children().each((_, el) => {
      const $el = $(el);
      const tagName = el.tagName?.toLowerCase();
      
      switch (tagName) {
        case 'h1':
          markdown += `\n# ${$el.text().trim()}\n\n`;
          break;
        case 'h2':
          markdown += `\n## ${$el.text().trim()}\n\n`;
          break;
        case 'h3':
          markdown += `\n### ${$el.text().trim()}\n\n`;
          break;
        case 'h4':
          markdown += `\n#### ${$el.text().trim()}\n\n`;
          break;
        case 'p':
          markdown += `${$el.text().trim()}\n\n`;
          break;
        case 'ul':
          $el.find('li').each((_, li) => {
            markdown += `- ${$(li).text().trim()}\n`;
          });
          markdown += '\n';
          break;
        case 'ol':
          $el.find('li').each((i, li) => {
            markdown += `${i + 1}. ${$(li).text().trim()}\n`;
          });
          markdown += '\n';
          break;
        case 'pre':
          const code = $el.find('code').text() || $el.text();
          const lang = $el.find('code').attr('class')?.match(/language-(\w+)/)?.[1] || '';
          markdown += `\`\`\`${lang}\n${code.trim()}\n\`\`\`\n\n`;
          break;
        case 'code':
          if (!$el.parent().is('pre')) {
            markdown += `\`${$el.text()}\``;
          }
          break;
        case 'blockquote':
          markdown += `> ${$el.text().trim()}\n\n`;
          break;
        case 'table':
          markdown += this.tableToMarkdown($el);
          break;
        default:
          markdown += $el.text().trim() + '\n\n';
      }
    });
    
    return markdown.trim();
  }

  /**
   * Convert HTML table to markdown table
   */
  private tableToMarkdown($table: cheerio.Cheerio<any>): string {
    const $ = cheerio.load($table.html() || '');
    let markdown = '\n';
    
    // Header
    const $header = $table.find('thead tr, tr:first-child');
    const headers: string[] = [];
    $header.find('th, td').each((_, th) => {
      headers.push($(th).text().trim());
    });
    
    markdown += '| ' + headers.join(' | ') + ' |\n';
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    
    // Rows
    $table.find('tbody tr, tr').each((i, tr) => {
      if (i === 0 && !$table.find('thead').length) return; // Skip first row if used as header
      
      const cells: string[] = [];
      $(tr).find('td').each((_, td) => {
        cells.push($(td).text().trim());
      });
      
      if (cells.length > 0) {
        markdown += '| ' + cells.join(' | ') + ' |\n';
      }
    });
    
    return markdown + '\n';
  }

  /**
   * Generate documentation files
   */
  private async generateDocumentation(): Promise<void> {
    console.log('📝 Generating documentation files...');
    
    // Create output directory
    await mkdir(this.config.outputDir, { recursive: true });
    
    // Group pages by section
    const sections = new Map<string, DocPage[]>();
    for (const page of this.pages) {
      if (!sections.has(page.section)) {
        sections.set(page.section, []);
      }
      sections.get(page.section)!.push(page);
    }
    
    // Generate index
    await this.generateIndex(sections);
    
    // Generate section files
    for (const [section, pages] of sections) {
      await this.generateSection(section, pages);
    }
    
    // Generate combined file
    await this.generateCombinedFile();
    
    // Generate metadata
    await this.generateMetadata();
  }

  /**
   * Generate main index file
   */
  private async generateIndex(sections: Map<string, DocPage[]>): Promise<void> {
    let markdown = `# ${new URL(this.config.baseUrl).hostname} Documentation\n\n`;
    markdown += `> Scraped from: ${this.config.baseUrl}\n`;
    markdown += `> Date: ${new Date().toISOString()}\n`;
    markdown += `> Total pages: ${this.pages.length}\n\n`;
    markdown += `## Table of Contents\n\n`;
    
    for (const [section, pages] of sections) {
      markdown += `### ${this.formatSectionName(section)}\n\n`;
      
      for (const page of pages) {
        const filename = this.getPageFilename(page);
        markdown += `- [${page.title}](./${section}/${filename})\n`;
      }
      
      markdown += '\n';
    }
    
    await fs.writeFile(
      path.join(this.config.outputDir, 'INDEX.md'),
      markdown
    );
  }

  /**
   * Generate section directory with all pages
   */
  private async generateSection(section: string, pages: DocPage[]): Promise<void> {
    const sectionDir = path.join(this.config.outputDir, section);
    await mkdir(sectionDir, { recursive: true });
    
    for (const page of pages) {
      const filename = this.getPageFilename(page);
      const filepath = path.join(sectionDir, filename);
      
      let markdown = `# ${page.title}\n\n`;
      markdown += `**URL:** ${page.url}\n\n`;
      
      if (page.apiEndpoint) {
        markdown += `## API Endpoint\n\n`;
        markdown += `**Method:** \`${page.apiEndpoint.method}\`\n`;
        markdown += `**Endpoint:** \`${page.apiEndpoint.endpoint}\`\n\n`;
        markdown += `${page.apiEndpoint.description}\n\n`;
        
        if (page.apiEndpoint.parameters.length > 0) {
          markdown += `### Parameters\n\n`;
          markdown += `| Parameter | Type | Required | Description |\n`;
          markdown += `| --- | --- | --- | --- |\n`;
          
          for (const param of page.apiEndpoint.parameters) {
            markdown += `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
          }
          
          markdown += '\n';
        }
        
        if (page.apiEndpoint.response) {
          markdown += `### Response\n\n\`\`\`json\n${page.apiEndpoint.response}\n\`\`\`\n\n`;
        }
      }
      
      markdown += `## Documentation\n\n${page.content}\n\n`;
      
      if (page.codeExamples.length > 0) {
        markdown += `## Code Examples\n\n`;
        
        for (const example of page.codeExamples) {
          if (example.description) {
            markdown += `${example.description}\n\n`;
          }
          markdown += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
        }
      }
      
      await fs.writeFile(filepath, markdown);
    }
  }

  /**
   * Generate single combined file with all documentation
   */
  private async generateCombinedFile(): Promise<void> {
    let markdown = `# Complete ${new URL(this.config.baseUrl).hostname} Documentation\n\n`;
    markdown += `> Scraped from: ${this.config.baseUrl}\n`;
    markdown += `> Date: ${new Date().toISOString()}\n`;
    markdown += `> Total pages: ${this.pages.length}\n\n`;
    markdown += `---\n\n`;
    
    // Sort pages by section and title
    const sorted = [...this.pages].sort((a, b) => {
      if (a.section !== b.section) {
        return a.section.localeCompare(b.section);
      }
      return a.title.localeCompare(b.title);
    });
    
    let currentSection = '';
    
    for (const page of sorted) {
      if (page.section !== currentSection) {
        currentSection = page.section;
        markdown += `\n\n# ${this.formatSectionName(currentSection)}\n\n---\n\n`;
      }
      
      markdown += `## ${page.title}\n\n`;
      markdown += `**URL:** ${page.url}\n\n`;
      markdown += `${page.content}\n\n`;
      
      if (page.codeExamples.length > 0) {
        for (const example of page.codeExamples) {
          markdown += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
        }
      }
      
      markdown += `---\n\n`;
    }
    
    await fs.writeFile(
      path.join(this.config.outputDir, 'COMPLETE.md'),
      markdown
    );
  }

  /**
   * Generate metadata JSON file
   */
  private async generateMetadata(): Promise<void> {
    const metadata = {
      baseUrl: this.config.baseUrl,
      scrapedAt: new Date().toISOString(),
      totalPages: this.pages.length,
      sections: [...new Set(this.pages.map(p => p.section))],
      pages: this.pages.map(p => ({
        url: p.url,
        path: p.path,
        title: p.title,
        section: p.section,
        subsection: p.subsection,
        hasApiEndpoint: !!p.apiEndpoint,
        codeExamplesCount: p.codeExamples.length,
      })),
    };
    
    await fs.writeFile(
      path.join(this.config.outputDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
  }

  /**
   * Helper: Get filename for a page
   */
  private getPageFilename(page: DocPage): string {
    const slug = page.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${slug}.md`;
  }

  /**
   * Helper: Format section name
   */
  private formatSectionName(section: string): string {
    return section
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Helper: Sleep for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Mintlify Documentation Scraper
==============================

Usage:
  npm run scrape-docs -- <baseUrl> [options]

Examples:
  npm run scrape-docs -- https://docs.etherscan.io
  npm run scrape-docs -- https://docs.etherscan.io --output ./docs/etherscan
  npm run scrape-docs -- https://docs.1inch.io --delay 2000

Options:
  --output <dir>        Output directory (default: ./scraped-docs)
  --concurrent <num>    Max concurrent requests (default: 3)
  --delay <ms>          Delay between batches (default: 1000)
  --help                Show this help

Benefits:
  ✅ Makes documentation AI-accessible
  ✅ Creates offline backups
  ✅ Improves MCP server development
  ✅ Enables better agent understanding
    `);
    process.exit(0);
  }
  
  const baseUrl = args[0];
  const outputDir = args[args.indexOf('--output') + 1] || './scraped-docs';
  const maxConcurrent = parseInt(args[args.indexOf('--concurrent') + 1]) || 3;
  const delayMs = parseInt(args[args.indexOf('--delay') + 1]) || 1000;
  
  const scraper = new MintlifyDocsScraper({
    baseUrl,
    outputDir,
    maxConcurrent,
    delayMs,
  });
  
  try {
    await scraper.scrape();
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MintlifyDocsScraper };
