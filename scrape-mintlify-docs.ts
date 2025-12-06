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
 *   npm run scrape-docs -- https://docs.privy.io --trieve-key tr-abc123
 *   npm run scrape-docs -- https://docs.example.com --no-api
 * 
 * Features:
 * - AUTO-DETECTS Trieve API for 10x faster scraping (preferred method)
 * - Falls back to HTML scraping if API unavailable
 * - Extracts clean markdown content
 * - Preserves code examples with exact formatting
 * - Generates index and navigation structure
 * - Handles rate limiting automatically
 * 
 * How it works:
 * 1. Tries to detect Mintlify's Trieve API key from search functionality
 * 2. If found, uses structured API to fetch all documentation chunks
 * 3. Falls back to HTML scraping via sitemap.xml if API unavailable
 * 4. Cleans and converts all content to perfect markdown
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
  useTrieveApi?: boolean;  // Use Trieve API if available
  trieveApiKey?: string;   // Optional Trieve API key
  maxRetries?: number;     // Max retry attempts for failed requests
  timeoutMs?: number;      // Request timeout in milliseconds
  skipEmpty?: boolean;     // Skip pages with no content
}

interface TrieveGroup {
  id: string;
  name: string;
  description?: string;
  chunks?: TrieveChunk[];
}

interface TrieveChunk {
  id: string;
  chunk_html?: string;
  link?: string;
  metadata?: Record<string, any>;
  tracking_id?: string;
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
    // Validate URL
    if (config.baseUrl && !this.isValidUrl(config.baseUrl)) {
      throw new Error(`Invalid URL: ${config.baseUrl}`);
    }

    this.config = {
      baseUrl: config.baseUrl || '',
      outputDir: config.outputDir || './scraped-docs',
      maxConcurrent: config.maxConcurrent || 3,
      delayMs: config.delayMs || 1000,
      userAgent: config.userAgent || 'MintlifyDocsScraper/1.0 (AI Agent Documentation Tool)',
      useTrieveApi: config.useTrieveApi ?? true,  // Default to true - prefer API
      trieveApiKey: config.trieveApiKey,
      maxRetries: config.maxRetries ?? 3,
      timeoutMs: config.timeoutMs ?? 30000,  // 30 second timeout
      skipEmpty: config.skipEmpty ?? true,
    };
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Main scraping workflow
   */
  async scrape(): Promise<void> {
    console.log(`🚀 Starting Mintlify docs scraper for: ${this.config.baseUrl}`);
    
    // Try Trieve API first (if enabled)
    if (this.config.useTrieveApi) {
      console.log('🔍 Attempting to use Trieve API for faster scraping...');
      const trieveSuccess = await this.scrapeViaTrieveApi();
      
      if (trieveSuccess) {
        console.log('✅ Successfully scraped via Trieve API!');
        await this.generateDocumentation();
        console.log(`✅ Scraping complete! ${this.pages.length} pages processed`);
        console.log(`📁 Documentation saved to: ${this.config.outputDir}`);
        return;
      }
      
      console.log('⚠️  Trieve API not available, falling back to HTML scraping...');
    }
    
    // Fallback: HTML scraping
    // Step 1: Discover all pages
    await this.discoverPages();
    
    // Step 2: Scrape each page
    await this.scrapeAllPages();
    
    // Step 3: Generate documentation files
    await this.generateDocumentation();
    
    // Print statistics
    const totalCodeExamples = this.pages.reduce((sum, p) => sum + p.codeExamples.length, 0);
    const sections = new Set(this.pages.map(p => p.section)).size;
    
    console.log(`\n✅ Scraping complete!`);
    console.log(`📊 Statistics:`);
    console.log(`   - ${this.pages.length} pages processed`);
    console.log(`   - ${sections} sections`);
    console.log(`   - ${totalCodeExamples} code examples extracted`);
    console.log(`📁 Documentation saved to: ${this.config.outputDir}`);
  }

  /**
   * Scrape documentation using Trieve API
   * This is much faster and cleaner than HTML scraping
   */
  private async scrapeViaTrieveApi(): Promise<boolean> {
    try {
      // Step 1: Detect Trieve API key from the site's search
      const apiKey = this.config.trieveApiKey || await this.detectTrieveApiKey();
      
      if (!apiKey) {
        console.log('❌ Could not detect Trieve API key');
        return false;
      }
      
      console.log('✓ Found Trieve API key');
      
      // Step 2: Get dataset ID from the site
      const datasetId = await this.detectTrieveDatasetId(apiKey);
      
      if (!datasetId) {
        console.log('❌ Could not detect Trieve dataset ID');
        return false;
      }
      
      console.log(`✓ Found dataset ID: ${datasetId}`);
      
      // Step 3: Fetch all groups (documentation sections)
      const groups = await this.fetchTrieveGroups(apiKey, datasetId);
      
      console.log(`✓ Found ${groups.length} documentation groups`);
      
      // Step 4: Fetch chunks for each group and convert to pages
      for (const group of groups) {
        await this.processTrieveGroup(apiKey, datasetId, group);
      }
      
      return this.pages.length > 0;
      
    } catch (error) {
      console.warn('⚠️  Trieve API error:', error);
      return false;
    }
  }

  /**
   * Detect Trieve API key by inspecting the site's search functionality
   */
  private async detectTrieveApiKey(): Promise<string | null> {
    try {
      const response = await fetch(this.config.baseUrl);
      const html = await response.text();
      
      // Look for Trieve API key in script tags or window object
      const apiKeyMatch = html.match(/['"]tr-[a-zA-Z0-9-_]+['"]/g);
      
      if (apiKeyMatch && apiKeyMatch.length > 0) {
        // Remove quotes
        return apiKeyMatch[0].replace(/['"]/g, '');
      }
      
      // Alternative: Look for it in search API calls
      const searchMatch = html.match(/api\.trieve\.ai.*?['"]Authorization['"]:\s*['"]([^'"]+)['"]/s);
      if (searchMatch) {
        return searchMatch[1];
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect Trieve dataset ID
   */
  private async detectTrieveDatasetId(apiKey: string): Promise<string | null> {
    try {
      const response = await fetch(this.config.baseUrl);
      const html = await response.text();
      
      // Look for dataset ID in script tags (UUID format)
      const datasetMatches = html.match(/['"]([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})['"]/g);
      
      if (datasetMatches && datasetMatches.length > 0) {
        // Return the first UUID found (usually the dataset ID)
        return datasetMatches[0].replace(/['"]/g, '');
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Fetch all groups from Trieve API
   * Uses cursor-based pagination for better performance
   */
  private async fetchTrieveGroups(apiKey: string, datasetId: string): Promise<TrieveGroup[]> {
    const groups: TrieveGroup[] = [];
    let page = 1;
    const pageSize = 100;
    
    while (true) {
      try {
        const response = await this.fetchWithRetry(
          `https://api.trieve.ai/api/chunk_group/${datasetId}/${page}/${pageSize}`,
          {
            headers: {
              'Authorization': apiKey,
              'TR-Dataset': datasetId,
            },
          }
        );
        
        if (!response.ok) {
          console.warn(`⚠️  Groups API returned ${response.status}`);
          break;
        }
        
        const data = await response.json();
        
        if (!data.groups || data.groups.length === 0) {
          break;
        }
        
        groups.push(...data.groups);
        console.log(`✓ Fetched page ${page} (${data.groups.length} groups)`);
        
        // Check if there are more pages
        if (data.groups.length < pageSize) {
          break;
        }
        
        page++;
        await this.sleep(this.config.delayMs);
        
      } catch (error) {
        console.warn(`⚠️  Error fetching groups page ${page}:`, error);
        break;
      }
    }
    
    return groups;
  }

  /**
   * Process a Trieve group and extract documentation
   */
  private async processTrieveGroup(apiKey: string, datasetId: string, group: TrieveGroup): Promise<void> {
    try {
      // Fetch chunks for this group with retry
      const response = await this.fetchWithRetry(
        `https://api.trieve.ai/api/chunk_group/${group.id}/${datasetId}`,
        {
          headers: {
            'Authorization': apiKey,
            'TR-Dataset': datasetId,
          },
        }
      );
      
      if (!response.ok) {
        console.warn(`⚠️  Failed to fetch group ${group.name}: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      const chunks = data.chunks || [];
      
      // Convert chunks to documentation pages with duplicate detection
      for (const chunk of chunks) {
        const page = this.convertTrieveChunkToPage(chunk, group);
        if (page) {
          // Check for duplicates by URL
          const isDuplicate = this.pages.some(p => p.url === page.url);
          if (isDuplicate) {
            console.log(`⏭️  Skipping duplicate: ${page.title}`);
            continue;
          }

          // Skip empty pages if configured
          if (this.config.skipEmpty && !page.content.trim()) {
            console.log(`⏭️  Skipping empty page: ${page.title}`);
            continue;
          }

          this.pages.push(page);
          console.log(`✓ ${page.title}`);
        }
      }
      
    } catch (error) {
      console.warn(`⚠️  Error processing group ${group.name}:`, error);
    }
  }

  /**
   * Convert Trieve chunk to DocPage
   */
  private convertTrieveChunkToPage(chunk: TrieveChunk, group: TrieveGroup): DocPage | null {
    try {
      const url = chunk.link || chunk.metadata?.link || '';
      if (!url) return null;
      
      // Parse HTML content
      const $ = cheerio.load(chunk.chunk_html || '');
      
      // Extract title
      const title = $('h1').first().text().trim() || 
                    chunk.metadata?.title || 
                    group.name || 
                    'Untitled';
      
      // Remove scripts and styles from chunk HTML
      $('script, style, noscript').remove();
      
      // Extract code examples
      const codeExamples = this.extractCodeExamples($('body'));
      
      // Convert to clean markdown
      const content = this.htmlToMarkdown($('body'));
      
      // Determine section from URL or group
      const urlPath = new URL(url, this.config.baseUrl).pathname;
      const pathParts = urlPath.split('/').filter(Boolean);
      const section = pathParts[0] || group.name || 'root';
      const subsection = pathParts[1];
      
      return {
        url,
        path: urlPath,
        title,
        content,
        section,
        subsection,
        codeExamples,
      };
      
    } catch (error) {
      console.warn('⚠️  Error converting chunk:', error);
      return null;
    }
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
      const response = await this.fetchWithRetry(sitemapUrl, {
        headers: { 'User-Agent': this.config.userAgent },
      });
      
      if (!response.ok) {
        console.log(`⚠️  Sitemap returned ${response.status}`);
        return [];
      }
      
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
      
      console.log(`✓ Found ${urls.length} documentation URLs in sitemap`);
      return urls;
    } catch (error) {
      console.warn(`⚠️  Could not parse sitemap: ${error instanceof Error ? error.message : error}`);
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
      const response = await this.fetchWithRetry(url, {
        headers: { 'User-Agent': this.config.userAgent },
      });
      
      if (!response.ok) {
        console.warn(`⚠️  Failed to fetch ${url}: ${response.status}`);
        return;
      }
      
      const html = await response.text();
      const page = this.parsePage(url, html);
      
      if (page) {
        // Validate content
        if (this.config.skipEmpty && !page.content.trim() && page.codeExamples.length === 0) {
          console.log(`⏭️  Skipping empty page: ${page.title}`);
          return;
        }

        this.pages.push(page);
        console.log(`✓ ${page.title}`);
      }
    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error instanceof Error ? error.message : error);
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
        $content = $el as any;
        break;
      }
    }
    
    // CRITICAL: Remove scripts and styles FIRST to prevent them from being extracted as code
    $content.find('script, style, noscript').remove();
    
    // Remove navigation and non-content elements
    $content.find('nav, .sidebar, .toc, [class*="navigation"]').remove();
    
    // Remove iframes and embedded content
    $content.find('iframe, embed, object').remove();
    
    // Remove Mintlify-specific elements
    $content.find('[class*="navbar"], [class*="footer"], [id*="search"]').remove();
    
    // Remove hidden elements, metadata, and tracking
    $content.find('[hidden], [style*="display: none"], [style*="visibility: hidden"]').remove();
    $content.find('meta, link, head').remove();
    
    // Remove ads, banners, and promotional content
    $content.find('[class*="banner"], [class*="advertisement"], [class*="promo"]').remove();
    
    // Remove duplicate navigation elements
    $content.find('[class*="breadcrumb"], [class*="pagination"]').remove();
    
    // Remove social media widgets and share buttons
    $content.find('[class*="share"], [class*="social"]').remove();
    
    // Remove comment sections and feedback forms
    $content.find('[class*="comment"], [class*="feedback"], [class*="rating"]').remove();
    
    // Extract code examples AFTER cleaning but BEFORE markdown conversion
    const codeExamples = this.extractCodeExamples($content);
    
    // Extract API endpoint info (if present)
    const apiEndpoint = this.extractApiEndpoint($content);
    
    // Convert to clean markdown
    let content = this.htmlToMarkdown($content);
    
    // Final cleanup: normalize whitespace and formatting
    content = content
      .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
      .replace(/^\s+|\s+$/gm, '')  // Trim lines
      .replace(/ +/g, ' ')  // Normalize spaces
      .trim();
    
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
   * CRITICAL: Preserves exact code formatting without normalization
   */
  private extractCodeExamples($content: cheerio.Cheerio<any>): CodeExample[] {
    const examples: CodeExample[] = [];
    const seen = new Set<string>();
    
    // Find all code blocks - support multiple formats
    const codeSelectors = [
      'pre code',           // Standard markdown/HTML
      'pre',                // Plain pre blocks
      '.code-block',        // Mintlify custom
      '.codeblock',         // Alternative naming
      '[class*="highlight"]', // Syntax highlighting
      '.highlight code',    // Prism.js
      '.hljs',              // highlight.js
    ];
    
    $content.find(codeSelectors.join(', ')).each((_, el) => {
      const $el = cheerio.load(el)(el as any);
      const $parent = $el.parent();
      
      // Get code - preserve exact whitespace and formatting
      let code: string;
      if (el.tagName?.toLowerCase() === 'pre' && $el.find('code').length > 0) {
        // Pre with code inside - get code element's text
        code = $el.find('code').text();
      } else if (el.tagName?.toLowerCase() === 'code' && $parent.is('pre')) {
        // Code inside pre - get this element's text
        code = $el.text();
      } else {
        // Other formats
        code = $el.text();
      }
      
      // Skip empty code blocks
      if (!code || !code.trim()) return;
      
      // Detect language from multiple possible sources
      let language = 'text';
      
      // 1. Check code element's class
      const codeClass = $el.attr('class') || '';
      let langMatch = codeClass.match(/language-(\w+)|lang-(\w+)|hljs-(\w+)/);
      if (langMatch) {
        language = langMatch[1] || langMatch[2] || langMatch[3];
      }
      
      // 2. Check parent pre element's class
      if (language === 'text' && $parent.is('pre')) {
        const preClass = $parent.attr('class') || '';
        langMatch = preClass.match(/language-(\w+)|lang-(\w+)/);
        if (langMatch) {
          language = langMatch[1] || langMatch[2];
        }
      }
      
      // 3. Check data attributes
      if (language === 'text') {
        const dataLang = $el.attr('data-language') || $parent.attr('data-language') || 
                        $el.attr('data-lang') || $parent.attr('data-lang');
        if (dataLang) {
          language = dataLang;
        }
      }
      
      // 4. Try to infer from content if still unknown
      if (language === 'text') {
        language = this.inferLanguageFromCode(code);
      }
      
      // Look for description in preceding paragraph or title
      let description: string | undefined;
      const $prev = $parent.prev('p');
      if ($prev.length > 0) {
        description = $prev.text().trim();
      } else {
        // Check for title/label above code block
        const $title = $parent.prev('[class*="title"], [class*="label"], h4, h5');
        if ($title.length > 0) {
          description = $title.text().trim();
        }
      }
      
      // Deduplicate - same code might appear in multiple selectors
      const codeHash = `${language}:${code.substring(0, 100)}`;
      if (seen.has(codeHash)) return;
      seen.add(codeHash);
      
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
      
      // Skip empty elements
      const text = $el.text().trim();
      if (!text && tagName !== 'pre' && tagName !== 'code' && tagName !== 'table') {
        return;
      }
      
      switch (tagName) {
        case 'h1':
          markdown += `\n# ${this.cleanText(text)}\n\n`;
          break;
        case 'h2':
          markdown += `\n## ${this.cleanText(text)}\n\n`;
          break;
        case 'h3':
          markdown += `\n### ${this.cleanText(text)}\n\n`;
          break;
        case 'h4':
          markdown += `\n#### ${this.cleanText(text)}\n\n`;
          break;
        case 'h5':
          markdown += `\n##### ${this.cleanText(text)}\n\n`;
          break;
        case 'h6':
          markdown += `\n###### ${this.cleanText(text)}\n\n`;
          break;
        case 'p':
          const pContent = this.extractTextWithLinks($el);
          if (pContent.trim()) {
            markdown += `${pContent}\n\n`;
          }
          break;
        case 'ul':
          $el.children('li').each((_, li) => {
            const liContent = this.extractTextWithLinks($(li));
            if (liContent.trim()) {
              markdown += `- ${liContent}\n`;
            }
          });
          markdown += '\n';
          break;
        case 'ol':
          $el.children('li').each((i, li) => {
            const liContent = this.extractTextWithLinks($(li));
            if (liContent.trim()) {
              markdown += `${i + 1}. ${liContent}\n`;
            }
          });
          markdown += '\n';
          break;
        case 'pre':
          // CRITICAL: Preserve exact code formatting - do NOT normalize whitespace
          let code: string;
          let lang = 'text';
          
          if ($el.find('code').length > 0) {
            // Code inside pre
            code = $el.find('code').text();
            // Check code element for language
            const codeClass = $el.find('code').attr('class') || '';
            const codeLangMatch = codeClass.match(/language-(\w+)|lang-(\w+)|hljs-(\w+)/);
            if (codeLangMatch) {
              lang = codeLangMatch[1] || codeLangMatch[2] || codeLangMatch[3];
            }
          } else {
            // Plain pre block
            code = $el.text();
          }
          
          // Check pre element for language if not found
          if (lang === 'text') {
            const preClass = $el.attr('class') || '';
            const preLangMatch = preClass.match(/language-(\w+)|lang-(\w+)/);
            if (preLangMatch) {
              lang = preLangMatch[1] || preLangMatch[2];
            }
          }
          
          // Check data attributes
          if (lang === 'text') {
            lang = $el.attr('data-language') || $el.attr('data-lang') || 
                   $el.find('code').attr('data-language') || 'text';
          }
          
          if (code && code.trim()) {
            // Do NOT trim - preserve exact indentation and whitespace
            markdown += `\`\`\`${lang}\n${code}\`\`\`\n\n`;
          }
          break;
        case 'code':
          if (!$el.parent().is('pre')) {
            const codeText = $el.text().trim();
            if (codeText) {
              markdown += `\`${codeText}\``;
            }
          }
          break;
        case 'blockquote':
          if (text) {
            markdown += `> ${this.cleanText(text)}\n\n`;
          }
          break;
        case 'table':
          markdown += this.tableToMarkdown($el);
          break;
        case 'a':
          // Standalone links
          const href = $el.attr('href');
          if (href && text) {
            markdown += `[${this.cleanText(text)}](${href})\n\n`;
          }
          break;
        case 'div':
        case 'section':
        case 'article':
          // Recursively process container elements
          const nested = this.htmlToMarkdown($el);
          if (nested.trim()) {
            markdown += nested;
          }
          break;
        case 'hr':
          markdown += '\n---\n\n';
          break;
        case 'br':
          markdown += '\n';
          break;
        case 'strong':
        case 'b':
          if (text) {
            markdown += `**${this.cleanText(text)}**`;
          }
          break;
        case 'em':
        case 'i':
          if (text) {
            markdown += `*${this.cleanText(text)}*`;
          }
          break;
        case 'img':
          const src = $el.attr('src');
          const alt = $el.attr('alt') || '';
          if (src) {
            markdown += `![${alt}](${src})\n\n`;
          }
          break;
        case 'dl':
          // Definition lists
          $el.children('dt, dd').each((_, dlChild) => {
            const $dlChild = $(dlChild);
            if (dlChild.tagName?.toLowerCase() === 'dt') {
              markdown += `**${this.cleanText($dlChild.text())}**\n`;
            } else {
              markdown += `: ${this.cleanText($dlChild.text())}\n\n`;
            }
          });
          break;
        default:
          // For unknown elements, extract text if it exists
          if (text && !['script', 'style', 'svg', 'path', 'g'].includes(tagName || '')) {
            const extracted = this.extractTextWithLinks($el);
            if (extracted.trim()) {
              markdown += `${extracted}\n\n`;
            }
          }
      }
    });
    
    return markdown.trim();
  }

  /**
   * Infer programming language from code content
   */
  private inferLanguageFromCode(code: string): string {
    const trimmed = code.trim();
    
    // JSON
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {}
    }
    
    // Shell/Bash
    if (trimmed.startsWith('$') || trimmed.startsWith('#!') || 
        /^(npm|yarn|pnpm|curl|wget|git|cd|ls|mkdir)\s/m.test(trimmed)) {
      return 'bash';
    }
    
    // JavaScript/TypeScript
    if (/\b(const|let|var|function|async|await|import|export|interface|type)\b/.test(trimmed)) {
      if (/\b(interface|type|as|namespace)\b/.test(trimmed)) {
        return 'typescript';
      }
      return 'javascript';
    }
    
    // Python
    if (/\b(def|class|import|from|print|if __name__)\b/.test(trimmed)) {
      return 'python';
    }
    
    // HTML
    if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
      return 'html';
    }
    
    // CSS
    if (/[.#]?\w+\s*\{[^}]*\}/.test(trimmed)) {
      return 'css';
    }
    
    // SQL
    if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(trimmed)) {
      return 'sql';
    }
    
    // YAML
    if (/^\w+:\s*.+$/m.test(trimmed) && !trimmed.includes('{')) {
      return 'yaml';
    }
    
    return 'text';
  }

  /**
   * Clean text by removing extra whitespace and normalizing
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n\s*\n/g, '\n')  // Remove multiple newlines
      .trim();
  }

  /**
   * Extract text with inline links preserved
   */
  private extractTextWithLinks($element: cheerio.Cheerio<any>): string {
    let result = '';
    
    $element.contents().each((_, node) => {
      if (node.type === 'text') {
        result += node.data || '';
      } else if (node.type === 'tag') {
        const $ = cheerio.load('');
        const $node = $(node);
        const tagName = node.tagName?.toLowerCase();
        
        switch (tagName) {
          case 'a':
            const href = $node.attr('href');
            const text = $node.text().trim();
            if (href && text) {
              result += `[${text}](${href})`;
            } else if (text) {
              result += text;
            }
            break;
          case 'code':
            const code = $node.text().trim();
            if (code) {
              result += `\`${code}\``;
            }
            break;
          case 'strong':
          case 'b':
            const strongText = $node.text().trim();
            if (strongText) {
              result += `**${strongText}**`;
            }
            break;
          case 'em':
          case 'i':
            const emText = $node.text().trim();
            if (emText) {
              result += `*${emText}*`;
            }
            break;
          case 'br':
            result += '\n';
            break;
          default:
            result += $node.text();
        }
      }
    });
    
    return this.cleanText(result);
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

  /**
   * Fetch with retry logic and timeout
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries = this.config.maxRetries || 3
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs || 30000);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        return response;
      } catch (error) {
        clearTimeout(timeout);

        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`⚠️  Retry ${attempt + 1}/${retries} for ${url} after ${backoffMs}ms...`);
        await this.sleep(backoffMs);
      }
    }

    throw new Error('Max retries exceeded');
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
  --no-api              Disable Trieve API, use HTML scraping only
  --trieve-key <key>    Manually specify Trieve API key
  --help                Show this help

Benefits:
  ✅ Makes documentation AI-accessible
  ✅ Creates offline backups
  ✅ Improves MCP server development
  ✅ Enables better agent understanding
  
Advanced:
  By default, the scraper will automatically detect and use Mintlify's
  Trieve API for faster, cleaner scraping. Use --no-api to force HTML scraping.
    `);
    process.exit(0);
  }
  
  const baseUrl = args[0];
  const outputDir = args[args.indexOf('--output') + 1] || './scraped-docs';
  const maxConcurrent = parseInt(args[args.indexOf('--concurrent') + 1]) || 3;
  const delayMs = parseInt(args[args.indexOf('--delay') + 1]) || 1000;
  const useTrieveApi = !args.includes('--no-api');
  const trieveApiKey = args.includes('--trieve-key') 
    ? args[args.indexOf('--trieve-key') + 1] 
    : undefined;
  
  const scraper = new MintlifyDocsScraper({
    baseUrl,
    outputDir,
    maxConcurrent,
    delayMs,
    useTrieveApi,
    trieveApiKey,
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
