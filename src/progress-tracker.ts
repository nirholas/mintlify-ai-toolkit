/**
 * Progress Tracker for Mintlify Documentation Scraper
 * 
 * Saves scraping progress to allow resuming interrupted scrapes
 * Tracks visited URLs, failed URLs, and statistics
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ScraperProgress {
  start_time: string;
  last_update: string;
  base_url: string;
  visited_urls: string[];
  failed_urls: {
    url: string;
    error: string;
    attempts: number;
    last_attempt: string;
  }[];
  queued_urls: string[];
  statistics: {
    total_pages: number;
    successful_pages: number;
    failed_pages: number;
    code_examples_found: number;
    api_endpoints_found: number;
  };
  metadata: {
    version: string;
    config_hash?: string;
  };
}

export class ProgressTracker {
  private progress: ScraperProgress;
  private stateFile: string;
  private autosaveInterval?: NodeJS.Timeout;
  private isDirty = false;

  constructor(baseUrl: string, stateFile: string = '.scraper-state.json') {
    this.stateFile = path.resolve(stateFile);
    this.progress = {
      start_time: new Date().toISOString(),
      last_update: new Date().toISOString(),
      base_url: baseUrl,
      visited_urls: [],
      failed_urls: [],
      queued_urls: [],
      statistics: {
        total_pages: 0,
        successful_pages: 0,
        failed_pages: 0,
        code_examples_found: 0,
        api_endpoints_found: 0,
      },
      metadata: {
        version: '2.0.0',
      },
    };
  }

  /**
   * Load existing progress from file
   */
  async load(): Promise<boolean> {
    try {
      const content = await fs.readFile(this.stateFile, 'utf-8');
      const saved = JSON.parse(content) as ScraperProgress;
      
      // Verify it's for the same base URL
      if (saved.base_url === this.progress.base_url) {
        this.progress = saved;
        this.progress.last_update = new Date().toISOString();
        console.log(`✅ Resumed from previous progress: ${saved.visited_urls.length} URLs already visited`);
        return true;
      } else {
        console.log(`⚠️  Previous progress was for different URL (${saved.base_url}), starting fresh`);
        return false;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('📝 Starting new scraping session');
        return false;
      }
      console.error('⚠️  Could not load progress:', error);
      return false;
    }
  }

  /**
   * Save progress to file
   */
  async save(): Promise<void> {
    try {
      this.progress.last_update = new Date().toISOString();
      const content = JSON.stringify(this.progress, null, 2);
      await fs.writeFile(this.stateFile, content, 'utf-8');
      this.isDirty = false;
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
    }
  }

  /**
   * Enable automatic saving every N seconds
   */
  enableAutosave(intervalSeconds: number = 30): void {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
    }

    this.autosaveInterval = setInterval(async () => {
      if (this.isDirty) {
        await this.save();
      }
    }, intervalSeconds * 1000);
  }

  /**
   * Disable automatic saving
   */
  disableAutosave(): void {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = undefined;
    }
  }

  /**
   * Mark a URL as visited
   */
  markVisited(url: string): void {
    if (!this.progress.visited_urls.includes(url)) {
      this.progress.visited_urls.push(url);
      this.progress.statistics.successful_pages++;
      this.isDirty = true;
    }

    // Remove from queued if present
    const queueIndex = this.progress.queued_urls.indexOf(url);
    if (queueIndex !== -1) {
      this.progress.queued_urls.splice(queueIndex, 1);
    }
  }

  /**
   * Mark a URL as failed
   */
  markFailed(url: string, error: string, attempts: number = 1): void {
    const existing = this.progress.failed_urls.find(f => f.url === url);
    
    if (existing) {
      existing.attempts = attempts;
      existing.error = error;
      existing.last_attempt = new Date().toISOString();
    } else {
      this.progress.failed_urls.push({
        url,
        error,
        attempts,
        last_attempt: new Date().toISOString(),
      });
      this.progress.statistics.failed_pages++;
    }

    this.isDirty = true;
  }

  /**
   * Add URLs to queue
   */
  addToQueue(urls: string[]): void {
    for (const url of urls) {
      if (!this.isVisited(url) && !this.progress.queued_urls.includes(url)) {
        this.progress.queued_urls.push(url);
        this.progress.statistics.total_pages++;
      }
    }
    this.isDirty = true;
  }

  /**
   * Check if URL was already visited
   */
  isVisited(url: string): boolean {
    return this.progress.visited_urls.includes(url);
  }

  /**
   * Check if URL has failed
   */
  hasFailed(url: string, maxAttempts: number = 3): boolean {
    const failed = this.progress.failed_urls.find(f => f.url === url);
    return failed ? failed.attempts >= maxAttempts : false;
  }

  /**
   * Get URLs that need to be scraped
   */
  getUnvisitedUrls(): string[] {
    return this.progress.queued_urls.filter(url => !this.isVisited(url));
  }

  /**
   * Get failed URLs that can be retried
   */
  getRetryableUrls(maxAttempts: number = 3): string[] {
    return this.progress.failed_urls
      .filter(f => f.attempts < maxAttempts)
      .map(f => f.url);
  }

  /**
   * Update statistics
   */
  updateStats(updates: Partial<ScraperProgress['statistics']>): void {
    this.progress.statistics = {
      ...this.progress.statistics,
      ...updates,
    };
    this.isDirty = true;
  }

  /**
   * Get current statistics
   */
  getStats(): ScraperProgress['statistics'] {
    return { ...this.progress.statistics };
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(): number {
    const total = this.progress.statistics.total_pages;
    if (total === 0) return 0;
    
    const completed = this.progress.statistics.successful_pages + this.progress.statistics.failed_pages;
    return Math.round((completed / total) * 100);
  }

  /**
   * Print progress summary
   */
  printSummary(): void {
    const stats = this.progress.statistics;
    const percentage = this.getProgressPercentage();
    const duration = Date.now() - new Date(this.progress.start_time).getTime();
    const durationMin = Math.round(duration / 60000);

    console.log('\n📊 Scraping Progress:');
    console.log(`   Total Pages: ${stats.total_pages}`);
    console.log(`   ✅ Successful: ${stats.successful_pages}`);
    console.log(`   ❌ Failed: ${stats.failed_pages}`);
    console.log(`   ⏳ Remaining: ${this.progress.queued_urls.length}`);
    console.log(`   📈 Progress: ${percentage}%`);
    console.log(`   ⏱️  Duration: ${durationMin} minutes`);
    console.log(`   📝 Code Examples: ${stats.code_examples_found}`);
    console.log(`   🔌 API Endpoints: ${stats.api_endpoints_found}`);
  }

  /**
   * Clear progress and start fresh
   */
  async reset(): Promise<void> {
    this.progress = {
      start_time: new Date().toISOString(),
      last_update: new Date().toISOString(),
      base_url: this.progress.base_url,
      visited_urls: [],
      failed_urls: [],
      queued_urls: [],
      statistics: {
        total_pages: 0,
        successful_pages: 0,
        failed_pages: 0,
        code_examples_found: 0,
        api_endpoints_found: 0,
      },
      metadata: {
        version: '2.0.0',
      },
    };

    try {
      await fs.unlink(this.stateFile);
      console.log('✅ Progress reset successfully');
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.disableAutosave();
    
    if (this.isDirty) {
      await this.save();
    }
  }
}
