/**
 * Batch Scraper for Multiple Documentation Sites
 * 
 * Scrape multiple documentation sites in parallel with intelligent scheduling
 * and resource management
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigLoader, ScraperConfiguration } from './config-loader';
import { ProgressTracker } from './progress-tracker';

export interface BatchJob {
  id: string;
  name: string;
  url?: string;
  config?: ScraperConfiguration;
  configFile?: string;
  outputDir: string;
  priority?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  error?: string;
  stats?: {
    pages: number;
    duration: number;
    codeExamples: number;
  };
}

export interface BatchConfig {
  jobs: BatchJob[];
  maxParallel?: number;
  continueOnError?: boolean;
  globalConfig?: Partial<ScraperConfiguration>;
}

export class BatchScraper {
  private config: BatchConfig;
  private activeJobs = new Map<string, Promise<void>>();
  private results: BatchJob[] = [];

  constructor(config: BatchConfig) {
    this.config = {
      maxParallel: 3,
      continueOnError: true,
      ...config,
    };
  }

  /**
   * Load batch configuration from file
   */
  static async loadFromFile(filePath: string): Promise<BatchScraper> {
    const content = await fs.readFile(filePath, 'utf-8');
    const config = JSON.parse(content) as BatchConfig;
    return new BatchScraper(config);
  }

  /**
   * Run all batch jobs
   */
  async run(): Promise<BatchJob[]> {
    console.log(`\n🚀 Starting batch scrape: ${this.config.jobs.length} jobs`);
    console.log(`   Max parallel: ${this.config.maxParallel}`);
    console.log(`   Continue on error: ${this.config.continueOnError}\n`);

    // Sort by priority (higher first)
    const sortedJobs = [...this.config.jobs].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );

    // Process jobs with parallelism control
    const queue = [...sortedJobs];
    
    while (queue.length > 0 || this.activeJobs.size > 0) {
      // Start new jobs up to max parallel
      while (
        queue.length > 0 &&
        this.activeJobs.size < this.config.maxParallel!
      ) {
        const job = queue.shift()!;
        this.startJob(job);
      }

      // Wait for any job to complete
      if (this.activeJobs.size > 0) {
        await Promise.race(this.activeJobs.values());
      }
    }

    this.printSummary();
    return this.results;
  }

  /**
   * Start a single job
   */
  private async startJob(job: BatchJob): Promise<void> {
    job.status = 'running';
    job.startTime = new Date().toISOString();
    
    console.log(`\n▶️  Starting: ${job.name} (${job.id})`);
    
    const promise = this.executeJob(job)
      .then(() => {
        job.status = 'completed';
        job.endTime = new Date().toISOString();
        console.log(`✅ Completed: ${job.name}`);
      })
      .catch((error) => {
        job.status = 'failed';
        job.error = error.message;
        job.endTime = new Date().toISOString();
        console.error(`❌ Failed: ${job.name} - ${error.message}`);
        
        if (!this.config.continueOnError) {
          throw error;
        }
      })
      .finally(() => {
        this.activeJobs.delete(job.id);
        this.results.push(job);
      });

    this.activeJobs.set(job.id, promise);
  }

  /**
   * Execute a single scraping job
   */
  private async executeJob(job: BatchJob): Promise<void> {
    // Load configuration
    let config: ScraperConfiguration;
    
    if (job.configFile) {
      config = await ConfigLoader.loadFromFile(job.configFile);
    } else if (job.config) {
      config = ConfigLoader.applyDefaults(job.config);
    } else if (job.url) {
      config = ConfigLoader.fromArgs({ url: job.url });
    } else {
      throw new Error('Job must have url, config, or configFile');
    }

    // Apply global config overrides
    if (this.config.globalConfig) {
      config = { ...config, ...this.config.globalConfig };
    }

    // Create output directory
    await fs.mkdir(job.outputDir, { recursive: true });

    // TODO: Run actual scraper here
    // For now, this is a placeholder that would call the main scraper
    // You would integrate with your existing MintlifyDocsScraper class
    
    const startTime = Date.now();
    
    // Simulate scraping (replace with actual scraper call)
    console.log(`   Scraping: ${config.start_urls[0]}`);
    console.log(`   Output: ${job.outputDir}`);
    
    const duration = Date.now() - startTime;
    
    job.stats = {
      pages: 0, // Would come from actual scraper
      duration,
      codeExamples: 0,
    };
  }

  /**
   * Print batch summary
   */
  private printSummary(): void {
    const completed = this.results.filter(j => j.status === 'completed').length;
    const failed = this.results.filter(j => j.status === 'failed').length;
    const totalDuration = this.results.reduce(
      (sum, j) => sum + (j.stats?.duration || 0),
      0
    );

    console.log('\n' + '='.repeat(60));
    console.log('📊 Batch Scrape Summary');
    console.log('='.repeat(60));
    console.log(`   Total Jobs: ${this.results.length}`);
    console.log(`   ✅ Completed: ${completed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏱️  Total Duration: ${Math.round(totalDuration / 1000)}s`);
    console.log('='.repeat(60));

    if (failed > 0) {
      console.log('\n❌ Failed Jobs:');
      this.results
        .filter(j => j.status === 'failed')
        .forEach(j => {
          console.log(`   - ${j.name}: ${j.error}`);
        });
    }

    console.log('\n✅ Completed Jobs:');
    this.results
      .filter(j => j.status === 'completed')
      .forEach(j => {
        console.log(`   - ${j.name}: ${j.stats?.pages} pages in ${Math.round((j.stats?.duration || 0) / 1000)}s`);
      });
  }

  /**
   * Save results to file
   */
  async saveResults(outputFile: string): Promise<void> {
    const results = {
      timestamp: new Date().toISOString(),
      total: this.results.length,
      completed: this.results.filter(j => j.status === 'completed').length,
      failed: this.results.filter(j => j.status === 'failed').length,
      jobs: this.results,
    };

    await fs.writeFile(
      outputFile,
      JSON.stringify(results, null, 2),
      'utf-8'
    );
    
    console.log(`\n💾 Results saved to: ${outputFile}`);
  }
}

/**
 * CLI for batch scraping
 */
export async function runBatchScraper(args: string[]): Promise<void> {
  const configFile = args[0];
  
  if (!configFile) {
    console.error('Usage: npm run batch-scrape -- <batch-config.json>');
    process.exit(1);
  }

  const scraper = await BatchScraper.loadFromFile(configFile);
  const results = await scraper.run();
  
  // Save results
  const outputFile = configFile.replace('.json', '-results.json');
  await scraper.saveResults(outputFile);
  
  // Exit with error if any jobs failed
  const failed = results.filter(j => j.status === 'failed').length;
  if (failed > 0) {
    process.exit(1);
  }
}
