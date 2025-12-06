# Integration Guide

Easy ways to integrate Mintlify AI Toolkit into your projects.

## 🚀 Quick Integration Options

### Option 1: NPM Package (Recommended)

Install directly into your project:

```bash
npm install @nirholas/mintlify-scraper
# or
yarn add @nirholas/mintlify-scraper
# or
pnpm add @nirholas/mintlify-scraper
```

### Option 2: GitHub Submodule

Add as a submodule to your monorepo:

```bash
git submodule add https://github.com/nirholas/mintlify-ai-toolkit.git tools/docs
cd tools/docs
npm install
```

### Option 3: CLI Tool (Global Install)

Install globally for command-line access:

```bash
npm install -g @nirholas/mintlify-scraper

# Use anywhere
mintlify-scraper https://docs.example.com --output ./docs
```

---

## 📦 Using as a Library

Import generators directly into your Node.js/TypeScript projects:

### Basic Usage

```typescript
import { 
  MintlifyPublisher,
  MCPGenerator,
  AIContextGenerator,
  AIToolGenerator,
  RAGGenerator,
  TypeScriptGenerator,
  CodeExtractor 
} from '@nirholas/mintlify-scraper';

// Example: Generate Mintlify site
const publisher = new MintlifyPublisher('./scraped-docs');
await publisher.publish('./output', {
  name: 'My API Docs',
  description: 'API documentation',
  primaryColor: '#6366F1'
});

// Example: Generate AI context
const aiContext = new AIContextGenerator('./scraped-docs');
await aiContext.generate('all'); // cursor, cline, claude, windsurf

// Example: Generate RAG chunks
const rag = new RAGGenerator('./scraped-docs');
await rag.generate({
  chunkSize: 1000,
  overlap: 200,
  generateQA: true,
  vectorDB: 'pinecone'
});
```

### Advanced Usage

```typescript
import { 
  MintlifyPublisher,
  AIToolGenerator,
  RAGGenerator 
} from '@nirholas/mintlify-scraper';

async function processDocumentation(docsUrl: string) {
  // 1. Scrape documentation
  const scraper = new Scraper(docsUrl);
  await scraper.scrape('./scraped-docs');
  
  // 2. Publish as Mintlify site
  const publisher = new MintlifyPublisher('./scraped-docs');
  await publisher.publish('./my-docs-site', {
    name: 'My Documentation',
    analytics: {
      ga4: 'G-XXXXXXXXXX',
      mixpanel: 'abc123'
    },
    enableFeedback: true,
    enableAPIPlayground: true
  });
  
  // 3. Generate AI tool definitions
  const toolGen = new AIToolGenerator('./scraped-docs');
  await toolGen.generate('all'); // All frameworks
  
  // 4. Generate RAG chunks for vector DB
  const rag = new RAGGenerator('./scraped-docs');
  await rag.generate({
    chunkSize: 1000,
    generateQA: true,
    exportFormat: 'jsonl',
    vectorDB: 'pinecone'
  });
  
  console.log('✅ Documentation processed!');
  console.log('📚 Mintlify site: ./my-docs-site');
  console.log('🛠️ AI tools: ./ai-tools');
  console.log('🔮 RAG chunks: ./rag-output');
}

processDocumentation('https://docs.example.com');
```

---

## 🔧 Integration Patterns

### 1. CI/CD Pipeline Integration

Add to your GitHub Actions workflow:

```yaml
# .github/workflows/docs.yml
name: Update Documentation

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly
  workflow_dispatch:

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Mintlify Toolkit
        run: npm install -g @nirholas/mintlify-scraper
      
      - name: Scrape Documentation
        run: mintlify-scraper https://docs.example.com --output ./docs
      
      - name: Generate AI Context
        run: |
          cd docs
          npm run generate-ai-context -- . --format all
          npm run generate-ai-tools -- . --framework all
          npm run generate-rag -- . --generate-qa
      
      - name: Commit Changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "Update documentation" || exit 0
          git push
```

### 2. Pre-commit Hook

Auto-generate docs on commit:

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Update AI context if docs changed
if git diff --cached --name-only | grep -q "docs/"; then
  echo "📚 Updating AI context..."
  npm run generate-ai-context -- ./docs --format cursor
fi
```

### 3. Build Script Integration

Add to your `package.json`:

```json
{
  "scripts": {
    "docs:scrape": "mintlify-scraper https://docs.example.com --output ./docs",
    "docs:publish": "mintlify-publisher ./docs --output ./public/docs",
    "docs:ai-context": "generate-ai-context ./docs --format all",
    "docs:ai-tools": "generate-ai-tools ./docs --framework all",
    "docs:rag": "generate-rag ./docs --generate-qa --vector-db pinecone",
    "docs:types": "generate-types ./docs --with-zod",
    "docs:all": "npm run docs:scrape && npm run docs:publish && npm run docs:ai-context && npm run docs:ai-tools && npm run docs:rag && npm run docs:types",
    "postinstall": "npm run docs:ai-context"
  }
}
```

### 4. Monorepo Integration

```
my-monorepo/
├── packages/
│   ├── api/
│   ├── web/
│   └── docs/              # Mintlify site
├── tools/
│   └── mintlify-toolkit/  # Submodule
├── scripts/
│   └── update-docs.ts     # Custom script
└── .cursorrules           # AI context (auto-generated)
```

**scripts/update-docs.ts:**
```typescript
import { MintlifyPublisher, AIContextGenerator } from '../tools/mintlify-toolkit';

async function updateDocs() {
  // Generate Mintlify site
  const publisher = new MintlifyPublisher('./scraped-docs');
  await publisher.publish('./packages/docs');
  
  // Update AI context for root
  const aiContext = new AIContextGenerator('./scraped-docs');
  await aiContext.generate('cursor', '../.cursorrules');
  
  console.log('✅ Documentation updated!');
}

updateDocs();
```

---

## 🎯 Framework-Specific Integrations

### Next.js Integration

Serve generated Mintlify docs alongside your Next.js app:

```typescript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/docs/:path*',
        destination: '/mintlify-docs/:path*'
      }
    ];
  }
};
```

```json
// package.json
{
  "scripts": {
    "build": "npm run docs:publish && next build",
    "docs:publish": "mintlify-publisher ./docs --output ./public/mintlify-docs"
  }
}
```

### Express.js Integration

Serve docs from Express:

```typescript
import express from 'express';
import path from 'path';

const app = express();

// Serve generated Mintlify docs
app.use('/docs', express.static(path.join(__dirname, 'mintlify-docs')));

// API endpoint to regenerate docs
app.post('/api/docs/refresh', async (req, res) => {
  const { MintlifyPublisher } = await import('@nirholas/mintlify-scraper');
  const publisher = new MintlifyPublisher('./scraped-docs');
  await publisher.publish('./mintlify-docs');
  res.json({ success: true });
});

app.listen(3000);
```

### Vite Integration

Add to vite.config.ts:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['@nirholas/mintlify-scraper']
    }
  }
});
```

---

## 🤖 AI Assistant Integrations

### Cursor AI Integration

```bash
# Generate .cursorrules
npm run generate-ai-context -- ./docs --format cursor

# Cursor AI now has full API context automatically
```

### Claude Desktop (MCP) Integration

```bash
# Generate MCP server
npm run generate-mcp -- ./docs

# Add to claude_desktop_config.json
{
  "mcpServers": {
    "my-api-docs": {
      "command": "node",
      "args": ["/path/to/generated-mcp-server/build/index.js"]
    }
  }
}
```

### LangChain Integration

```typescript
import { getUserTool, createUserTool } from './ai-tools/langchain-tools';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { createToolCallingAgent } from 'langchain/agents';

const llm = new ChatOpenAI({ temperature: 0 });

const agent = createToolCallingAgent({
  llm,
  tools: [getUserTool, createUserTool],
  prompt: systemPrompt
});
```

### OpenAI Function Calling Integration

```typescript
import tools from './ai-tools/openai-tools.json';
import OpenAI from 'openai';

const openai = new OpenAI();

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Get user with ID 123' }],
  tools: tools,
  tool_choice: 'auto'
});
```

---

## 🔮 Vector Database Integrations

### Pinecone Integration

```bash
# Generate chunks and import script
npm run generate-rag -- ./docs --vector-db pinecone

# Run import script
cd rag-output
pip install pinecone-client openai
export PINECONE_API_KEY="your-key"
python import-pinecone.py
```

Then query in your app:

```typescript
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.Index('docs');
const openai = new OpenAI();

async function searchDocs(query: string) {
  // Get embedding
  const embedding = await openai.embeddings.create({
    input: query,
    model: 'text-embedding-ada-002'
  });
  
  // Query Pinecone
  const results = await index.query({
    vector: embedding.data[0].embedding,
    topK: 5,
    includeMetadata: true
  });
  
  return results.matches;
}
```

### Weaviate Integration

```bash
npm run generate-rag -- ./docs --vector-db weaviate
cd rag-output
pip install weaviate-client openai
python import-weaviate.py
```

### Chroma Integration

```bash
npm run generate-rag -- ./docs --vector-db chroma
cd rag-output
pip install chromadb openai
python import-chroma.py
```

---

## 📚 Example Projects

### 1. Documentation Portal

```typescript
// docs-portal/index.ts
import { 
  MintlifyPublisher, 
  AIContextGenerator,
  RAGGenerator 
} from '@nirholas/mintlify-scraper';

class DocsPortal {
  async setup(docsUrls: string[]) {
    for (const url of docsUrls) {
      const name = new URL(url).hostname;
      
      // Scrape
      await this.scrape(url, `./docs/${name}`);
      
      // Publish
      const publisher = new MintlifyPublisher(`./docs/${name}`);
      await publisher.publish(`./public/${name}`);
      
      // Generate AI assets
      const ai = new AIContextGenerator(`./docs/${name}`);
      await ai.generate('all');
      
      // Generate RAG chunks
      const rag = new RAGGenerator(`./docs/${name}`);
      await rag.generate({ vectorDB: 'pinecone' });
    }
  }
}
```

### 2. API Client Generator

```typescript
// api-client-gen/index.ts
import { AIToolGenerator, TypeScriptGenerator } from '@nirholas/mintlify-scraper';

async function generateClient(docsPath: string) {
  // Generate TypeScript types
  const typeGen = new TypeScriptGenerator(docsPath, true);
  await typeGen.generate();
  
  // Generate tool definitions
  const toolGen = new AIToolGenerator(docsPath);
  await toolGen.generate('openai');
  
  // Now build client using types + tools
  console.log('✅ Client generated with types and tools!');
}
```

### 3. Smart Documentation Assistant

```typescript
// smart-assistant/index.ts
import { RAGGenerator } from '@nirholas/mintlify-scraper';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

class DocsAssistant {
  constructor(
    private openai: OpenAI,
    private pinecone: Pinecone
  ) {}
  
  async answer(question: string) {
    // Get relevant chunks
    const chunks = await this.searchDocs(question);
    
    // Generate answer with context
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Answer based on documentation' },
        { role: 'user', content: `Context: ${chunks}\n\nQuestion: ${question}` }
      ]
    });
    
    return response.choices[0].message.content;
  }
}
```

---

## 🛠️ Custom Integrations

### Create Custom Generator

```typescript
import { BaseGenerator } from '@nirholas/mintlify-scraper';

class CustomGenerator extends BaseGenerator {
  async generate() {
    const docs = await this.loadDocs();
    
    // Your custom logic
    const output = this.transform(docs);
    
    await this.save(output);
  }
}
```

### Extend Existing Generators

```typescript
import { MintlifyPublisher } from '@nirholas/mintlify-scraper';

class CustomPublisher extends MintlifyPublisher {
  async publish(output: string, options: any) {
    // Add custom preprocessing
    await this.customPreprocess();
    
    // Call parent
    await super.publish(output, options);
    
    // Add custom postprocessing
    await this.customPostprocess();
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# .env
MINTLIFY_SCRAPER_API_KEY=your-trieve-api-key
MINTLIFY_OUTPUT_DIR=./docs
OPENAI_API_KEY=your-openai-key
PINECONE_API_KEY=your-pinecone-key
```

### Config File

```typescript
// mintlify.config.ts
export default {
  scraper: {
    concurrent: 5,
    retries: 3,
    timeout: 30000
  },
  publisher: {
    defaultColor: '#6366F1',
    analytics: {
      ga4: process.env.GA4_ID
    }
  },
  ai: {
    contextFormat: 'cursor',
    toolFramework: 'openai',
    vectorDB: 'pinecone'
  }
};
```

---

## 🚀 Deployment

### Deploy Generated Mintlify Site

```bash
# 1. Generate site
npm run publish-mintlify -- ./docs --output ./mintlify-site

# 2. Deploy to Mintlify
cd mintlify-site
npm install
npx mintlify deploy

# Or deploy to Vercel
vercel deploy

# Or deploy to Netlify
netlify deploy --prod
```

### Docker Integration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install toolkit
RUN npm install -g @nirholas/mintlify-scraper

# Copy your scripts
COPY . .

# Run on startup
CMD ["npm", "run", "docs:all"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  docs-generator:
    build: .
    volumes:
      - ./output:/app/output
    environment:
      - DOCS_URL=https://docs.example.com
```

---

## 📖 API Reference

### MintlifyPublisher

```typescript
class MintlifyPublisher {
  constructor(docsPath: string);
  
  publish(outputPath: string, options: {
    name?: string;
    description?: string;
    primaryColor?: string;
    logo?: string;
    domain?: string;
    analytics?: {
      ga4?: string;
      mixpanel?: string;
      posthog?: string;
    };
    enableFeedback?: boolean;
    enableAPIPlayground?: boolean;
  }): Promise<void>;
}
```

### AIContextGenerator

```typescript
class AIContextGenerator {
  constructor(docsPath: string);
  
  generate(
    format: 'cursor' | 'cline' | 'claude' | 'windsurf' | 'all',
    outputPath?: string
  ): Promise<void>;
}
```

### RAGGenerator

```typescript
class RAGGenerator {
  constructor(docsPath: string);
  
  generate(options: {
    chunkSize?: number;
    overlap?: number;
    generateQA?: boolean;
    exportFormat?: 'json' | 'jsonl' | 'csv';
    vectorDB?: 'pinecone' | 'weaviate' | 'chroma' | 'qdrant' | 'milvus';
  }): Promise<void>;
}
```

---

## 💡 Best Practices

1. **Version Control** - Commit generated `.cursorrules` and types
2. **Automated Updates** - Use CI/CD to refresh docs weekly
3. **Environment Separation** - Different configs for dev/staging/prod
4. **Error Handling** - Wrap generators in try-catch blocks
5. **Caching** - Cache scraped docs to avoid re-scraping
6. **Incremental Updates** - Only regenerate what changed
7. **Testing** - Test generated outputs before deployment

---

## 🐛 Troubleshooting

**Issue:** Module not found
```bash
npm install @nirholas/mintlify-scraper
# Or link locally during development
npm link /path/to/mintlify-ai-toolkit
```

**Issue:** TypeScript errors
```bash
npm install --save-dev @types/node
```

**Issue:** Permission denied
```bash
chmod +x node_modules/.bin/mintlify-scraper
```

---

## 🎓 Learning Resources

- [Complete Examples](/examples/)
- [API Documentation](/API.md)
- [AI Features Guide](/AI-FEATURES.md)

---

## 🤝 Community Integrations

Share your integration! Open a PR to add it here:

- **Next.js Starter** - [Link]
- **Docusaurus Plugin** - [Link]
- **VS Code Extension** - [Link]
- **Raycast Extension** - [Link]

---

[View on GitHub](https://github.com/nirholas/mintlify-ai-toolkit)
