# Vector Search with Embeddings

Enable semantic search across your scraped documentation using AI-powered embeddings. Find content by **meaning**, not just keywords.

## Features

- **🔍 Semantic Search** - Find content by meaning, not just exact matches
- **🎯 Hybrid Search** - Combine semantic + keyword search for best results
- **🔗 Related Documents** - Automatically find similar pages
- **💡 Auto-Suggest** - Smart query suggestions as users type
- **⚡ Multiple Backends** - OpenAI, local embeddings, or custom models
- **🗄️ Vector Stores** - Pinecone, Qdrant, Chroma, or local JSON

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Vector Index

```bash
# Using OpenAI embeddings (best quality)
npx tsx src/vector-search.ts \
  --docs-dir ./output \
  --provider openai \
  --api-key sk-...

# Using local embeddings (FREE, runs offline)
npx tsx src/vector-search.ts \
  --docs-dir ./output \
  --provider local
```

### 3. Search Your Docs

```bash
# Search for content
npx tsx src/search-cli.ts "How do I authenticate users?"

# Find related documents
npx tsx src/search-cli.ts --related "authentication.md"

# Auto-suggest
npx tsx src/search-cli.ts --suggest "how to"
```

## Configuration

Create `vector-search-config.json`:

```json
{
  "provider": "openai",
  "model": "text-embedding-3-small",
  "apiKey": "${OPENAI_API_KEY}",
  "vectorStore": "local",
  "features": {
    "semanticSearch": true,
    "hybridSearch": true,
    "autoSuggest": true,
    "relatedDocs": true
  },
  "chunkSize": 1000,
  "chunkOverlap": 200
}
```

## Embedding Providers

### OpenAI (Recommended)

**Best for:** Production use, highest quality

```json
{
  "provider": "openai",
  "model": "text-embedding-3-small",
  "apiKey": "sk-..."
}
```

**Models:**
- `text-embedding-3-small` - $0.02/1M tokens, 1536 dimensions
- `text-embedding-3-large` - $0.13/1M tokens, 3072 dimensions
- `text-embedding-ada-002` - $0.10/1M tokens, 1536 dimensions (legacy)

**Cost Example:** Indexing 1000 pages (~500K tokens) = **$0.01**

### Local Embeddings (FREE)

**Best for:** Development, offline use, cost-sensitive projects

```json
{
  "provider": "local",
  "model": "all-MiniLM-L6-v2"
}
```

Runs entirely on your machine - no API calls, no costs!

**Setup:**

```bash
# Install Python dependencies
pip install sentence-transformers torch

# The scraper will automatically use local models
```

**Available Models:**
- `all-MiniLM-L6-v2` - Fast, 384 dimensions, 80MB
- `all-mpnet-base-v2` - Better quality, 768 dimensions, 420MB
- `multi-qa-MiniLM-L6-cos-v1` - Optimized for Q&A, 384 dimensions

### Cohere

**Best for:** Multilingual search

```json
{
  "provider": "cohere",
  "model": "embed-english-v3.0",
  "apiKey": "..."
}
```

## Vector Store Backends

### Local (JSON)

Simple file-based storage - perfect for small to medium sites.

```json
{
  "vectorStore": "local"
}
```

**Pros:**
- ✅ No setup required
- ✅ Works offline
- ✅ Easy to backup

**Cons:**
- ❌ Slower for large datasets (10K+ documents)
- ❌ No distributed search

**Best for:** < 5,000 pages

### Pinecone

Fully managed vector database - best for production.

```json
{
  "vectorStore": "pinecone",
  "vectorStoreConfig": {
    "apiKey": "...",
    "environment": "us-west1-gcp",
    "index": "docs-search"
  }
}
```

**Pros:**
- ✅ Blazing fast
- ✅ Scales to millions of documents
- ✅ Managed service

**Pricing:** Free tier: 1M vectors

### Qdrant

Open-source vector database - self-hosted or cloud.

```json
{
  "vectorStore": "qdrant",
  "vectorStoreConfig": {
    "url": "http://localhost:6333",
    "collection": "documentation"
  }
}
```

**Setup:**

```bash
docker run -p 6333:6333 qdrant/qdrant
```

**Pros:**
- ✅ Self-hosted (free)
- ✅ Great performance
- ✅ Rich filtering

### Chroma

Lightweight vector database - perfect for development.

```json
{
  "vectorStore": "chroma",
  "vectorStoreConfig": {
    "path": "./chroma-db"
  }
}
```

**Setup:**

```bash
pip install chromadb
```

**Pros:**
- ✅ Easy setup
- ✅ Works locally
- ✅ Good for prototyping

## Search Types

### Semantic Search

Find content by meaning, even if exact words don't match.

```javascript
const results = await search.search('user authentication', 10);

// Finds:
// - "How to log in users"
// - "Authentication guide"
// - "Securing user sessions"
```

### Hybrid Search

Combines semantic + keyword search for best results.

```json
{
  "features": {
    "hybridSearch": true
  }
}
```

**How it works:**
- 70% semantic similarity
- 30% keyword matching
- Best of both worlds!

### Related Documents

Automatically find similar pages.

```javascript
const related = await search.findRelated('authentication.md', 5);

// Returns similar docs:
// - OAuth setup
// - Session management  
// - User permissions
```

### Auto-Suggest

Smart query suggestions as users type.

```javascript
const suggestions = await search.suggest('how to auth');

// Returns:
// - "How to authenticate with OAuth"
// - "How to authenticate API requests"
// - "How to authenticate users with email"
```

## Advanced Features

### Chunking Strategy

Control how documents are split:

```json
{
  "chunkSize": 1000,      // Characters per chunk
  "chunkOverlap": 200     // Overlap between chunks
}
```

**Guidelines:**
- **Small chunks (500):** Better precision, more results
- **Large chunks (2000):** Better context, fewer results
- **Overlap:** Prevents splitting mid-concept

### Metadata Filtering

Search within specific sections:

```javascript
const results = await search.search('authentication', 10, {
  section: 'api-reference',
  hasCode: true
});
```

### Quality Scoring

Results include quality scores:

```javascript
{
  "chunk": { "content": "..." },
  "score": 0.87,  // Similarity score (0-1)
  "highlights": ["relevant text"]
}
```

## Programmatic Usage

### Basic Search

```typescript
import { VectorSearch } from './src/vector-search';

const search = new VectorSearch({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  vectorStore: 'local',
  features: {
    semanticSearch: true,
    hybridSearch: true,
    autoSuggest: true,
    relatedDocs: true
  }
});

// Index documentation
await search.indexDocuments('./output');

// Search
const results = await search.search('How do I authenticate?', 10);

for (const result of results) {
  console.log(`${result.chunk.metadata.title} (${result.score})`);
  console.log(result.chunk.content.substring(0, 200));
}
```

### Related Documents

```typescript
const related = await search.findRelated('doc-id', 5);

for (const doc of related) {
  console.log(`Related: ${doc.chunk.metadata.title}`);
}
```

### Auto-Suggest

```typescript
const suggestions = await search.suggest('getting start');

console.log('Did you mean:', suggestions);
```

## Integration Examples

### Add to Your Website

```html
<!-- Search Box -->
<input 
  type="text" 
  id="search" 
  placeholder="Search documentation..."
>
<div id="results"></div>

<script>
const searchBox = document.getElementById('search');
const resultsDiv = document.getElementById('results');

searchBox.addEventListener('input', async (e) => {
  const query = e.target.value;
  
  if (query.length < 3) return;
  
  const response = await fetch(`/api/search?q=${query}`);
  const results = await response.json();
  
  resultsDiv.innerHTML = results.map(r => `
    <div class="result">
      <h3>${r.title}</h3>
      <p>${r.snippet}</p>
      <a href="${r.url}">Read more →</a>
    </div>
  `).join('');
});
</script>
```

### API Server

```typescript
import express from 'express';
import { VectorSearch } from './src/vector-search';

const app = express();
const search = new VectorSearch({ /* config */ });

await search.loadIndex('./vector-search-index.json');

app.get('/api/search', async (req, res) => {
  const query = req.query.q as string;
  const results = await search.search(query, 10);
  
  res.json(results.map(r => ({
    title: r.chunk.metadata.title,
    url: r.chunk.metadata.url,
    snippet: r.chunk.content.substring(0, 200),
    score: r.score
  })));
});

app.listen(3000);
```

## Performance Optimization

### Pre-compute Embeddings

Generate embeddings once, reuse forever:

```bash
# Create index
npx tsx src/vector-search.ts --docs-dir ./output

# Save index (includes all embeddings)
# File: vector-search-index.json

# Later, just load:
await search.loadIndex('./vector-search-index.json');
```

### Batch Processing

Process large sites faster:

```typescript
const search = new VectorSearch({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  vectorStore: 'local'
});

// Processes in batches of 100
await search.indexDocuments('./output');
```

### Caching

Cache search results for common queries:

```typescript
const cache = new Map();

async function cachedSearch(query: string) {
  if (cache.has(query)) {
    return cache.get(query);
  }
  
  const results = await search.search(query, 10);
  cache.set(query, results);
  return results;
}
```

## Cost Estimation

### OpenAI Embeddings

**text-embedding-3-small:** $0.02 per 1M tokens

| Pages | Avg Tokens | Cost |
|-------|-----------|------|
| 100 | 50K | $0.001 |
| 1,000 | 500K | $0.01 |
| 10,000 | 5M | $0.10 |
| 100,000 | 50M | $1.00 |

**Note:** This is a one-time cost. Searches are free!

### Local Embeddings

**FREE** - Runs entirely on your machine!

Processing speed:
- ~100 pages/minute on modern CPU
- ~500 pages/minute with GPU

## Troubleshooting

### Slow Indexing

**Problem:** Taking too long to index large sites

**Solutions:**
1. Use `text-embedding-3-small` instead of `3-large`
2. Increase chunk size to reduce total chunks
3. Use local embeddings (faster for large batches)
4. Process in parallel (coming soon)

### Poor Search Results

**Problem:** Search not finding relevant content

**Solutions:**
1. Enable hybrid search (combines semantic + keywords)
2. Adjust chunk size (try 500-1500)
3. Increase chunk overlap (try 150-250)
4. Use better embedding model (`text-embedding-3-large`)

### Out of Memory

**Problem:** Node.js runs out of memory

**Solutions:**
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npx tsx src/vector-search.ts
```

## Examples

See `examples/configs/vector-search.json` for a complete example configuration.

## Coming Soon

- 🔄 Incremental indexing (update only changed pages)
- ⚡ GPU acceleration
- 🌍 Multilingual search
- 📊 Search analytics
- 🎨 Pre-built UI components
- 🔌 WordPress/Ghost plugins

## Resources

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Sentence Transformers](https://www.sbert.net/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Chroma Documentation](https://docs.trychroma.com/)
