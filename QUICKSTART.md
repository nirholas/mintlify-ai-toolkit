# Quick Start - NPM Package Usage

Get started with Mintlify AI Toolkit in under 5 minutes.

## Installation

```bash
npm install @nirholas/mintlify-scraper
```

## Basic Usage

### 1. As a Library (JavaScript/TypeScript)

```typescript
import { 
  MintlifyPublisher,
  AIContextGenerator,
  RAGGenerator 
} from '@nirholas/mintlify-scraper';

// Generate Mintlify site
const publisher = new MintlifyPublisher('./docs');
await publisher.publish('./output', {
  name: 'My API Docs',
  primaryColor: '#6366F1'
});

// Generate AI context
const ai = new AIContextGenerator('./docs');
await ai.generate('cursor'); // or 'all'

// Generate RAG chunks
const rag = new RAGGenerator('./docs');
await rag.generate({ vectorDB: 'pinecone' });
```

### 2. As CLI Tools

```bash
# Install globally
npm install -g @nirholas/mintlify-scraper

# Use commands
mintlify-scraper https://docs.example.com --output ./docs
mintlify-publisher ./docs --output ./site
generate-ai-context ./docs --format cursor
generate-rag ./docs --vector-db pinecone
```

## Common Workflows

### Workflow 1: Documentation Portal

```typescript
import { MintlifyPublisher } from '@nirholas/mintlify-scraper';

async function createPortal() {
  const publisher = new MintlifyPublisher('./scraped-docs');
  
  await publisher.publish('./my-docs', {
    name: 'API Documentation',
    description: 'Complete API reference',
    primaryColor: '#6366F1',
    analytics: { ga4: 'G-XXXXXXXXXX' },
    enableFeedback: true,
    enableAPIPlayground: true
  });
  
  console.log('✅ Portal ready at ./my-docs');
}
```

### Workflow 2: AI Assistant Setup

```typescript
import { AIContextGenerator, AIToolGenerator } from '@nirholas/mintlify-scraper';

async function setupAI() {
  // Generate context files
  const context = new AIContextGenerator('./docs');
  await context.generate('all'); // cursor, cline, claude, windsurf
  
  // Generate tool definitions
  const tools = new AIToolGenerator('./docs');
  await tools.generate('all'); // all frameworks
  
  console.log('✅ AI context ready!');
}
```

### Workflow 3: RAG System

```typescript
import { RAGGenerator } from '@nirholas/mintlify-scraper';

async function setupRAG() {
  const rag = new RAGGenerator('./docs');
  
  await rag.generate({
    chunkSize: 1000,
    overlap: 200,
    generateQA: true,
    exportFormat: 'jsonl',
    vectorDB: 'pinecone'
  });
  
  console.log('✅ RAG chunks ready at ./rag-output');
}
```

## Integration Examples

### Express.js

```typescript
import express from 'express';
import { MintlifyPublisher } from '@nirholas/mintlify-scraper';

const app = express();

app.post('/api/docs/refresh', async (req, res) => {
  const publisher = new MintlifyPublisher('./docs');
  await publisher.publish('./public/docs');
  res.json({ success: true });
});

app.listen(3000);
```

### Next.js API Route

```typescript
// app/api/docs/route.ts
import { NextResponse } from 'next/server';
import { AIContextGenerator } from '@nirholas/mintlify-scraper';

export async function POST() {
  const ai = new AIContextGenerator('./docs');
  await ai.generate('cursor');
  
  return NextResponse.json({ success: true });
}
```

### Build Script

```json
{
  "scripts": {
    "docs:publish": "mintlify-publisher ./docs --output ./public/docs",
    "docs:ai": "generate-ai-context ./docs --format all",
    "build": "npm run docs:publish && npm run docs:ai && next build"
  }
}
```

## Complete Example Project

```typescript
// docs-generator.ts
import {
  MintlifyPublisher,
  AIContextGenerator,
  AIToolGenerator,
  RAGGenerator,
  TypeScriptGenerator,
  CodeExtractor
} from '@nirholas/mintlify-scraper';

class DocsGenerator {
  constructor(private docsPath: string) {}
  
  async generateAll() {
    console.log('🚀 Generating all documentation assets...\n');
    
    // 1. Mintlify site
    console.log('📚 Publishing Mintlify site...');
    const publisher = new MintlifyPublisher(this.docsPath);
    await publisher.publish('./mintlify-site', {
      name: 'API Documentation',
      primaryColor: '#6366F1',
      enableFeedback: true,
      enableAPIPlayground: true
    });
    
    // 2. AI context
    console.log('🧠 Generating AI context...');
    const ai = new AIContextGenerator(this.docsPath);
    await ai.generate('all');
    
    // 3. AI tools
    console.log('🛠️ Generating AI tools...');
    const tools = new AIToolGenerator(this.docsPath);
    await tools.generate('all');
    
    // 4. RAG chunks
    console.log('🔮 Generating RAG chunks...');
    const rag = new RAGGenerator(this.docsPath);
    await rag.generate({
      chunkSize: 1000,
      generateQA: true,
      vectorDB: 'pinecone'
    });
    
    // 5. TypeScript types
    console.log('📝 Generating TypeScript types...');
    const types = new TypeScriptGenerator(this.docsPath, true);
    await types.generate();
    
    // 6. Code examples
    console.log('💻 Extracting code examples...');
    const code = new CodeExtractor(this.docsPath, true);
    await code.extract();
    
    console.log('\n✅ All documentation assets generated!');
    console.log('📁 Outputs:');
    console.log('  - Mintlify site: ./mintlify-site');
    console.log('  - AI context: ./.cursorrules, .clinerules, etc.');
    console.log('  - AI tools: ./ai-tools');
    console.log('  - RAG chunks: ./rag-output');
    console.log('  - TypeScript types: ./types-output');
    console.log('  - Code examples: ./code-examples');
  }
}

// Usage
const generator = new DocsGenerator('./scraped-docs');
await generator.generateAll();
```

## Configuration

Create a config file for reusable settings:

```typescript
// mintlify.config.ts
export default {
  publisher: {
    name: 'API Documentation',
    primaryColor: '#6366F1',
    analytics: {
      ga4: process.env.GA4_ID
    },
    enableFeedback: true,
    enableAPIPlayground: true
  },
  ai: {
    contextFormat: 'cursor',
    toolFramework: 'openai',
    vectorDB: 'pinecone'
  },
  rag: {
    chunkSize: 1000,
    overlap: 200,
    generateQA: true
  }
};
```

Use in your code:

```typescript
import config from './mintlify.config';
import { MintlifyPublisher } from '@nirholas/mintlify-scraper';

const publisher = new MintlifyPublisher('./docs');
await publisher.publish('./output', config.publisher);
```

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import type { 
  PublisherOptions,
  RAGOptions,
  AIContextFormat,
  Chunk,
  QAPair 
} from '@nirholas/mintlify-scraper';

const options: PublisherOptions = {
  name: 'My Docs',
  primaryColor: '#6366F1',
  enableFeedback: true
};

const ragOptions: RAGOptions = {
  chunkSize: 1000,
  vectorDB: 'pinecone',
  generateQA: true
};
```

## Environment Variables

```bash
# .env
MINTLIFY_OUTPUT_DIR=./docs
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
GA4_ID=G-XXXXXXXXXX
```

Load in your code:

```typescript
import 'dotenv/config';
import { MintlifyPublisher } from '@nirholas/mintlify-scraper';

const publisher = new MintlifyPublisher(process.env.MINTLIFY_OUTPUT_DIR);
await publisher.publish('./output', {
  analytics: { ga4: process.env.GA4_ID }
});
```

## Next Steps

- 📖 [Complete Integration Guide](./INTEGRATION.md)
- 🧠 [AI Features Guide](./AI-FEATURES.md)
- 📚 [Full API Reference](./API.md)
- 🎯 [Example Projects](./examples/)

## Support

- 🐛 [Report Issues](https://github.com/nirholas/mintlify-ai-toolkit/issues)
- 💬 [Discussions](https://github.com/nirholas/mintlify-ai-toolkit/discussions)
