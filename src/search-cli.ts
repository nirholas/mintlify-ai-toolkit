#!/usr/bin/env node

/**
 * CLI for Vector Search
 * 
 * Usage:
 *   npx tsx src/search-cli.ts "your query"
 *   npx tsx src/search-cli.ts --related doc-id
 *   npx tsx src/search-cli.ts --suggest "partial query"
 */

import { VectorSearch } from './vector-search';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 Vector Search CLI

Usage:
  npx tsx src/search-cli.ts "your search query"
  npx tsx src/search-cli.ts --related <doc-id>
  npx tsx src/search-cli.ts --suggest "partial"
  npx tsx src/search-cli.ts --help

Examples:
  npx tsx src/search-cli.ts "How do I authenticate?"
  npx tsx src/search-cli.ts --related authentication-md-chunk-0
  npx tsx src/search-cli.ts --suggest "getting start"

First run:
  npx tsx src/vector-search-cli.ts --create \\
    --docs-dir ./output \\
    --provider openai \\
    --api-key sk-...
`);
    return;
  }

  // Load existing index
  const search = new VectorSearch({
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    vectorStore: 'local',
    features: {
      semanticSearch: true,
      hybridSearch: true,
      autoSuggest: true,
      relatedDocs: true,
    },
  });

  try {
    await search.loadIndex();
  } catch (error) {
    console.error('❌ No vector search index found!');
    console.error('   Run this first to create an index:');
    console.error('   npx tsx src/vector-search-cli.ts --create --docs-dir ./output');
    process.exit(1);
  }

  // Handle commands
  if (args[0] === '--related') {
    const docId = args[1];
    const results = await search.findRelated(docId, 5);
    
    console.log(`\n🔗 Related documents to "${docId}":\n`);
    for (const result of results) {
      console.log(`  ${result.chunk.metadata.title} (${Math.round(result.score * 100)}%)`);
      console.log(`  ${result.chunk.metadata.url}`);
      console.log(`  ${result.chunk.content.substring(0, 150)}...\n`);
    }
  } else if (args[0] === '--suggest') {
    const partial = args.slice(1).join(' ');
    const suggestions = await search.suggest(partial);
    
    console.log(`\n💡 Suggestions for "${partial}":\n`);
    for (const suggestion of suggestions) {
      console.log(`  - ${suggestion}`);
    }
  } else {
    const query = args.join(' ');
    const results = await search.search(query, 10);
    
    console.log(`\n🔍 Search results for "${query}":\n`);
    for (const result of results) {
      console.log(`  📄 ${result.chunk.metadata.title} (${Math.round(result.score * 100)}%)`);
      console.log(`     ${result.chunk.metadata.url}`);
      console.log(`     ${result.chunk.content.substring(0, 200)}...\n`);
    }
  }
}

main().catch(console.error);
