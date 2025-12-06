#!/usr/bin/env node

/**
 * CLI for creating vector search indexes
 * 
 * Usage:
 *   npx tsx src/vector-search-cli.ts --create --docs-dir ./output
 *   npx tsx src/vector-search-cli.ts --create --docs-dir ./output --provider local
 */

import { createVectorSearchIndex } from './vector-search';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
🔍 Vector Search Index Creator

Usage:
  npx tsx src/vector-search-cli.ts --create --docs-dir <path> [options]

Options:
  --docs-dir <path>       Directory with scraped markdown files (required)
  --provider <name>       Embedding provider: openai | local (default: openai)
  --api-key <key>         API key (or set OPENAI_API_KEY env var)
  --help                  Show this help

Examples:
  # Using OpenAI embeddings (best quality)
  npx tsx src/vector-search-cli.ts --create \\
    --docs-dir ./output \\
    --provider openai \\
    --api-key sk-...

  # Using local embeddings (FREE, no API needed)
  npx tsx src/vector-search-cli.ts --create \\
    --docs-dir ./output \\
    --provider local

Environment Variables:
  OPENAI_API_KEY          Your OpenAI API key
`);
    return;
  }

  const docsDir = args[args.indexOf('--docs-dir') + 1];
  const provider = args.includes('--provider') 
    ? args[args.indexOf('--provider') + 1] as 'openai' | 'local'
    : 'openai';
  const apiKey = args.includes('--api-key')
    ? args[args.indexOf('--api-key') + 1]
    : process.env.OPENAI_API_KEY;

  if (!docsDir) {
    console.error('❌ Error: --docs-dir is required');
    console.error('   Example: npx tsx src/vector-search-cli.ts --create --docs-dir ./output');
    process.exit(1);
  }

  if (provider === 'openai' && !apiKey) {
    console.error('❌ Error: OpenAI API key required');
    console.error('   Set OPENAI_API_KEY environment variable or use --api-key');
    console.error('   Or use local embeddings: --provider local');
    process.exit(1);
  }

  await createVectorSearchIndex({
    docsDir,
    provider,
    apiKey,
  });
}

main().catch(console.error);
