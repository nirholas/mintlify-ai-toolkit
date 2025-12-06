/**
 * Configuration Loader for Mintlify Documentation Scraper
 * 
 * Loads and validates scraper configuration from JSON files
 * Compatible with Meilisearch docs-scraper config format
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface SelectorConfig {
  selector: string;
  global?: boolean;
  default_value?: string;
}

export interface SelectorSet {
  lvl0: string | SelectorConfig;
  lvl1?: string | SelectorConfig;
  lvl2?: string | SelectorConfig;
  lvl3?: string | SelectorConfig;
  lvl4?: string | SelectorConfig;
  lvl5?: string | SelectorConfig;
  lvl6?: string | SelectorConfig;
  text: string;
  code?: string;
}

export interface StartUrl {
  url: string;
  page_rank?: number;
  selectors_key?: string;
  tags?: string[];
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2';
  username?: string;
  password?: string;
  token?: string;
  header_name?: string;
}

export interface TrieveConfig {
  enabled: boolean;
  api_key?: string;
  dataset_id?: string;
}

export interface OutputConfig {
  format: 'markdown' | 'json' | 'both';
  structure: 'single-file' | 'per-page' | 'per-section';
  include_metadata: boolean;
  preserve_code_blocks: boolean;
}

export interface CrawlingConfig {
  max_concurrent: number;
  delay_ms: number;
  max_retries: number;
  timeout_ms: number;
  skip_empty: boolean;
  follow_redirects: boolean;
}

export interface ProgressConfig {
  save_state: boolean;
  state_file: string;
}

export interface ScraperConfiguration {
  index_uid?: string;
  start_urls: (string | StartUrl)[];
  stop_urls?: string[];
  sitemap_urls?: string[];
  sitemap_alternate_links?: boolean;
  allowed_domains?: string[];
  selectors?: Record<string, SelectorSet>;
  selectors_exclude?: string[];
  scrape_start_urls?: boolean;
  min_indexed_level?: number;
  only_content_level?: boolean;
  js_render?: boolean;
  js_wait?: number;
  authentication?: AuthConfig;
  trieve?: TrieveConfig;
  output?: OutputConfig;
  crawling?: CrawlingConfig;
  progress?: ProgressConfig;
}

export class ConfigLoader {
  /**
   * Load configuration from a JSON file
   */
  static async loadFromFile(configPath: string): Promise<ScraperConfiguration> {
    const absolutePath = path.resolve(configPath);
    
    try {
      const content = await fs.readFile(absolutePath, 'utf-8');
      const config = JSON.parse(content) as ScraperConfiguration;
      
      // Apply defaults
      return this.applyDefaults(config);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Configuration file not found: ${absolutePath}`);
      }
      throw new Error(`Failed to load configuration: ${error}`);
    }
  }

  /**
   * Create configuration from command-line arguments
   */
  static fromArgs(args: {
    url: string;
    output?: string;
    trieveKey?: string;
    noApi?: boolean;
    maxConcurrent?: number;
    delay?: number;
  }): ScraperConfiguration {
    const config: ScraperConfiguration = {
      start_urls: [args.url],
      trieve: {
        enabled: !args.noApi,
        api_key: args.trieveKey,
      },
      crawling: {
        max_concurrent: args.maxConcurrent || 3,
        delay_ms: args.delay || 1000,
        max_retries: 3,
        timeout_ms: 30000,
        skip_empty: true,
        follow_redirects: true,
      },
    };

    return this.applyDefaults(config);
  }

  /**
   * Apply default values to configuration
   */
  public static applyDefaults(config: ScraperConfiguration): ScraperConfiguration {
    return {
      ...config,
      scrape_start_urls: config.scrape_start_urls ?? true,
      min_indexed_level: config.min_indexed_level ?? 0,
      only_content_level: config.only_content_level ?? false,
      js_render: config.js_render ?? false,
      js_wait: config.js_wait ?? 0,
      sitemap_alternate_links: config.sitemap_alternate_links ?? false,
      authentication: config.authentication ?? { type: 'none' },
      trieve: {
        enabled: true,
        ...config.trieve,
      },
      output: {
        format: 'markdown',
        structure: 'per-section',
        include_metadata: true,
        preserve_code_blocks: true,
        ...config.output,
      },
      crawling: {
        max_concurrent: 3,
        delay_ms: 1000,
        max_retries: 3,
        timeout_ms: 30000,
        skip_empty: true,
        follow_redirects: true,
        ...config.crawling,
      },
      progress: {
        save_state: true,
        state_file: '.scraper-state.json',
        ...config.progress,
      },
      selectors: config.selectors ?? {
        default: {
          lvl0: 'h1',
          lvl1: 'h2',
          lvl2: 'h3',
          lvl3: 'h4',
          lvl4: 'h5',
          lvl5: 'h6',
          text: 'p, li',
          code: 'pre code, .code-block',
        },
      },
    };
  }

  /**
   * Validate configuration
   */
  static validate(config: ScraperConfiguration): string[] {
    const errors: string[] = [];

    if (!config.start_urls || config.start_urls.length === 0) {
      errors.push('start_urls is required and must contain at least one URL');
    }

    if (config.js_wait && config.js_wait > 0 && !config.js_render) {
      errors.push('js_wait requires js_render to be enabled');
    }

    if (config.min_indexed_level && (config.min_indexed_level < 0 || config.min_indexed_level > 6)) {
      errors.push('min_indexed_level must be between 0 and 6');
    }

    if (config.authentication) {
      const { type, username, password, token } = config.authentication;
      
      if (type === 'basic' && (!username || !password)) {
        errors.push('Basic authentication requires username and password');
      }
      
      if ((type === 'bearer' || type === 'apikey') && !token) {
        errors.push(`${type} authentication requires a token`);
      }
    }

    return errors;
  }

  /**
   * Get selector for a specific URL
   */
  static getSelectorForUrl(config: ScraperConfiguration, url: string): SelectorSet {
    // Check if URL has a specific selector key
    const startUrl = config.start_urls.find(u => {
      if (typeof u === 'string') return false;
      return url.startsWith(u.url);
    });

    const selectorKey = typeof startUrl === 'object' && startUrl.selectors_key 
      ? startUrl.selectors_key 
      : 'default';

    return config.selectors?.[selectorKey] ?? config.selectors?.default ?? {
      lvl0: 'h1',
      lvl1: 'h2',
      lvl2: 'h3',
      text: 'p, li',
    };
  }

  /**
   * Check if URL should be scraped based on stop_urls
   */
  static shouldScrapeUrl(config: ScraperConfiguration, url: string): boolean {
    if (!config.stop_urls || config.stop_urls.length === 0) {
      return true;
    }

    return !config.stop_urls.some(pattern => {
      // Support regex patterns
      try {
        const regex = new RegExp(pattern);
        return regex.test(url);
      } catch {
        // Fallback to simple string matching
        return url.includes(pattern);
      }
    });
  }

  /**
   * Get page rank for a URL
   */
  static getPageRank(config: ScraperConfiguration, url: string): number {
    const startUrl = config.start_urls.find(u => {
      if (typeof u === 'string') return u === url;
      return u.url === url;
    });

    if (typeof startUrl === 'object' && startUrl.page_rank !== undefined) {
      return startUrl.page_rank;
    }

    return 1; // Default rank
  }

  /**
   * Get authentication headers
   */
  static getAuthHeaders(config: ScraperConfiguration): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!config.authentication || config.authentication.type === 'none') {
      return headers;
    }

    const { type, username, password, token, header_name } = config.authentication;

    switch (type) {
      case 'basic':
        if (username && password) {
          const credentials = Buffer.from(`${username}:${password}`).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;

      case 'bearer':
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        break;

      case 'apikey':
        if (token && header_name) {
          headers[header_name] = token;
        }
        break;
    }

    return headers;
  }
}
