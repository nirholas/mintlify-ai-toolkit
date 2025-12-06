#!/usr/bin/env node

/**
 * CLI for Chatbot Training Data Export
 * 
 * Usage:
 *   npx tsx src/chatbot-cli.ts --docs-dir ./output --format openai-jsonl
 */

import { exportChatbotData } from './chatbot-exporter';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
🤖 Chatbot Training Data Exporter

Usage:
  npx tsx src/chatbot-cli.ts --docs-dir <path> --format <format> [options]

Required:
  --docs-dir <path>       Directory with scraped markdown files
  --format <format>       Output format:
                          - openai-jsonl (GPT-3.5/4 fine-tuning)
                          - llama (LLaMA, Mistral, Mixtral)
                          - claude (Claude fine-tuning)
                          - generic-json (Custom training)
                          - csv (Spreadsheet review)

Options:
  --output <path>         Output file path (default: chatbot-data)
  --generate-qa           Use AI to generate Q&A (requires API key)
  --api-key <key>         OpenAI API key (or set OPENAI_API_KEY)
  --help                  Show this help

Examples:
  # Manual Q&A extraction (FREE)
  npx tsx src/chatbot-cli.ts \\
    --docs-dir ./output \\
    --format openai-jsonl \\
    --output ./training-data.jsonl

  # AI-generated Q&A
  npx tsx src/chatbot-cli.ts \\
    --docs-dir ./output \\
    --format openai-jsonl \\
    --generate-qa \\
    --api-key sk-...

  # Export as CSV for review
  npx tsx src/chatbot-cli.ts \\
    --docs-dir ./output \\
    --format csv \\
    --output ./review.csv

  # LLaMA format
  npx tsx src/chatbot-cli.ts \\
    --docs-dir ./output \\
    --format llama \\
    --generate-qa

Environment Variables:
  OPENAI_API_KEY          Your OpenAI API key (for --generate-qa)

What You Get:
  - training-data-train.jsonl       (80% training set)
  - training-data-validation.jsonl  (20% validation set)

Next Steps:
  # Upload to OpenAI for fine-tuning
  openai api fine_tuning.jobs.create \\
    -t training-data-train.jsonl \\
    -v training-data-validation.jsonl \\
    -m gpt-3.5-turbo

  # Or create a Custom GPT at https://chat.openai.com/gpts/editor
`);
    return;
  }

  const docsDir = args[args.indexOf('--docs-dir') + 1];
  const format = args[args.indexOf('--format') + 1] as any;
  const output = args.includes('--output') 
    ? args[args.indexOf('--output') + 1]
    : './chatbot-data';
  const generateQA = args.includes('--generate-qa');
  const apiKey = args.includes('--api-key')
    ? args[args.indexOf('--api-key') + 1]
    : process.env.OPENAI_API_KEY;

  if (!docsDir) {
    console.error('❌ Error: --docs-dir is required');
    console.error('   Example: npx tsx src/chatbot-cli.ts --docs-dir ./output --format openai-jsonl');
    process.exit(1);
  }

  if (!format) {
    console.error('❌ Error: --format is required');
    console.error('   Options: openai-jsonl, llama, claude, generic-json, csv');
    process.exit(1);
  }

  if (generateQA && !apiKey) {
    console.error('❌ Error: --generate-qa requires OpenAI API key');
    console.error('   Set OPENAI_API_KEY environment variable or use --api-key');
    console.error('   Or remove --generate-qa for manual extraction (FREE)');
    process.exit(1);
  }

  await exportChatbotData({
    docsDir,
    outputPath: output,
    format,
    generateQA,
    apiKey,
  });
}

main().catch(console.error);
