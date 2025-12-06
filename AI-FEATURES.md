# AI Features Guide

Complete guide to AI-focused features in Mintlify AI Toolkit.

## Overview

The toolkit includes 5 AI-focused generators that transform documentation into AI-ready formats:

1. **AI Context Generator** - Coding assistant context files
2. **Multi-Framework Tool Generator** - AI agent tool definitions
3. **RAG Generator** - Vector database integration
4. **TypeScript Type Generator** - Auto-generated types
5. **Code Example Extractor** - Organized code examples

---

## 1. AI Context Generator

Generate context files for popular AI coding assistants.

### Usage

```bash
npm run generate-ai-context -- ./scraped-docs

# Options
npm run generate-ai-context -- ./scraped-docs --format cursor
npm run generate-ai-context -- ./scraped-docs --format cline
npm run generate-ai-context -- ./scraped-docs --format claude
npm run generate-ai-context -- ./scraped-docs --format windsurf
npm run generate-ai-context -- ./scraped-docs --format all
```

### Output

Creates context files optimized for each AI assistant:

- **`.cursorrules`** - Cursor AI rules
- **`.clinerules`** - Cline assistant guidelines
- **`claude-context.md`** - Claude Desktop context
- **`.windsurfrules`** - Windsurf IDE rules

### Features

- **API Endpoint Extraction** - Automatically finds all API endpoints
- **Code Pattern Recognition** - Identifies common patterns (HTTP requests, error handling, async/await)
- **Best Practices** - Extracts guidelines and recommendations
- **Token Optimization** - Keeps context under ~8000 tokens
- **Integration Checklists** - Step-by-step setup guides

### Example Output

```markdown
# API Quick Reference

## Authentication
Use API key in header: `X-API-Key: your_key_here`

## Endpoints
- GET /api/users - List users
- POST /api/users - Create user
- GET /api/users/{id} - Get user

## Code Patterns
1. HTTP Request Pattern
2. Async/Await Pattern
3. Error Handling Pattern
```

---

## 2. Multi-Framework Tool Generator

Convert documentation to tool definitions for 6 AI frameworks.

### Usage

```bash
npm run generate-ai-tools -- ./scraped-docs

# Generate for specific framework
npm run generate-ai-tools -- ./scraped-docs --framework openai
npm run generate-ai-tools -- ./scraped-docs --framework langchain
npm run generate-ai-tools -- ./scraped-docs --framework anthropic
npm run generate-ai-tools -- ./scraped-docs --framework gemini
npm run generate-ai-tools -- ./scraped-docs --framework vercel
npm run generate-ai-tools -- ./scraped-docs --framework all
```

### Supported Frameworks

1. **MCP (Model Context Protocol)** - Standard tool definitions
2. **OpenAI** - Function calling format
3. **LangChain** - DynamicStructuredTool with Zod
4. **Anthropic** - Claude tool use format
5. **Google Gemini** - Function declarations
6. **Vercel AI SDK** - Tool definitions with execute functions

### Output Files

```
./ai-tools/
├── mcp-tools.json          # MCP format
├── openai-tools.json       # OpenAI function calling
├── langchain-tools.ts      # LangChain tools
├── anthropic-tools.json    # Claude tool use
├── gemini-tools.json       # Gemini functions
├── vercel-tools.ts         # Vercel AI SDK
└── README.md               # Usage guide
```

### Example: OpenAI Format

```json
{
  "type": "function",
  "function": {
    "name": "get_user",
    "description": "Fetch user by ID",
    "parameters": {
      "type": "object",
      "properties": {
        "user_id": {
          "type": "string",
          "description": "The user ID"
        }
      },
      "required": ["user_id"]
    }
  }
}
```

### Example: LangChain Format

```typescript
import { DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';

export const getUserTool = new DynamicStructuredTool({
  name: 'get_user',
  description: 'Fetch user by ID',
  schema: z.object({
    user_id: z.string().describe('The user ID')
  }),
  func: async ({ user_id }) => {
    // Implementation
    return result;
  }
});
```

---

## 3. RAG Generator

Generate RAG-optimized documentation chunks for vector databases.

### Usage

```bash
npm run generate-rag -- ./scraped-docs

# Options
npm run generate-rag -- ./scraped-docs --chunk-size 1000 --overlap 200
npm run generate-rag -- ./scraped-docs --generate-qa
npm run generate-rag -- ./scraped-docs --format json
npm run generate-rag -- ./scraped-docs --vector-db pinecone
```

### Features

- **Semantic Chunking** - Intelligent text splitting
- **Rich Metadata** - Section, title, type, keywords, tokens
- **Q&A Generation** - Automatic question-answer pairs
- **Multiple Formats** - JSON, JSONL, CSV export
- **Vector DB Scripts** - Ready-to-run import scripts

### Supported Vector Databases

1. **Pinecone** - Cloud vector database
2. **Weaviate** - Open-source vector search
3. **Chroma** - Embedding database
4. **Qdrant** - Vector similarity search
5. **Milvus** - Scalable vector database

### Output Structure

```
./rag-output/
├── chunks.json              # Chunked documentation
├── qa-pairs.json            # Question-answer pairs
├── import-pinecone.py       # Pinecone import script
├── import-weaviate.py       # Weaviate import script
├── import-chroma.py         # Chroma import script
├── import-qdrant.py         # Qdrant import script
├── import-milvus.py         # Milvus import script
└── README.md                # Setup instructions
```

### Example Chunk

```json
{
  "id": "chunk_1",
  "text": "Documentation content...",
  "metadata": {
    "section": "Authentication",
    "title": "API Keys",
    "url": "/docs/auth/api-keys",
    "type": "documentation",
    "tokens": 245,
    "keywords": ["API", "authentication", "security"]
  }
}
```

### Example Import Script (Pinecone)

```python
from pinecone import Pinecone
import openai
import json

# Initialize
pc = Pinecone(api_key="your-api-key")
index = pc.Index("docs")

# Load chunks
with open('chunks.json') as f:
    chunks = json.load(f)

# Upload with embeddings
for chunk in chunks:
    embedding = openai.Embedding.create(
        input=chunk['text'],
        model="text-embedding-ada-002"
    )['data'][0]['embedding']
    
    index.upsert([(
        chunk['id'],
        embedding,
        chunk['metadata']
    )])
```

---

## 4. TypeScript Type Generator

Auto-generate TypeScript types from API documentation.

### Usage

```bash
npm run generate-types -- ./scraped-docs

# With Zod schemas
npm run generate-types -- ./scraped-docs --with-zod
```

### Output

```
./types-output/
├── index.ts        # TypeScript interfaces
├── schemas.ts      # Zod schemas (if --with-zod)
└── README.md       # Usage guide
```

### Example Output

**TypeScript Interfaces:**
```typescript
export interface GetUserInput {
  /** The user ID */
  user_id: string;
  include_metadata?: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
}
```

**Zod Schemas:**
```typescript
import { z } from 'zod';

export const GetUserInputSchema = z.object({
  user_id: z.string().describe('The user ID'),
  include_metadata: z.boolean().optional()
});

export type GetUserInput = z.infer<typeof GetUserInputSchema>;
```

---

## 5. Code Example Extractor

Extract and organize code examples from documentation.

### Usage

```bash
npm run extract-code -- ./scraped-docs

# With test generation
npm run extract-code -- ./scraped-docs --with-tests
```

### Features

- **Language Organization** - Group by programming language
- **Dependency Extraction** - Auto-detect imports/requires
- **Context Preservation** - Keep titles and descriptions
- **Test Generation** - Jest/Pytest test suites
- **Runnable Examples** - Self-contained code files

### Output Structure

```
./code-examples/
├── javascript/
│   ├── example-1.js
│   ├── example-2.js
│   ├── examples.test.ts      # Jest tests
│   └── README.md
├── typescript/
│   ├── example-1.ts
│   ├── example-2.ts
│   ├── examples.test.ts
│   └── README.md
├── python/
│   ├── example_1.py
│   ├── example_2.py
│   ├── test_examples.py      # Pytest tests
│   └── README.md
└── README.md
```

### Example Organization

**example-1.ts:**
```typescript
// Making API Requests
// From: getting-started
// Dependencies: axios

import axios from 'axios';

async function getUser(userId: string) {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data;
}
```

**examples.test.ts:**
```typescript
import { describe, test, expect } from '@jest/globals';

describe('Code Examples', () => {
  test('Making API Requests', async () => {
    // TODO: Add test implementation
    expect(true).toBe(true);
  });
});
```

---

## Complete Workflow

Transform documentation into all AI-ready formats:

```bash
# 1. Scrape documentation
npm run scrape -- https://docs.example.com --output ./docs

# 2. Generate AI context files
npm run generate-ai-context -- ./docs --format all

# 3. Generate tool definitions
npm run generate-ai-tools -- ./docs --framework all

# 4. Generate RAG chunks
npm run generate-rag -- ./docs --generate-qa

# 5. Generate TypeScript types
npm run generate-types -- ./docs --with-zod

# 6. Extract code examples
npm run extract-code -- ./docs --with-tests

# 7. Publish as Mintlify site
npm run publish-mintlify -- ./docs --with-analytics
```

---

## Integration Examples

### Using with Cursor AI

1. Generate context:
   ```bash
   npm run generate-ai-context -- ./docs --format cursor
   ```

2. Copy `.cursorrules` to your project root

3. Cursor AI now has full API context

### Using with OpenAI

1. Generate tools:
   ```bash
   npm run generate-ai-tools -- ./docs --framework openai
   ```

2. Load in your app:
   ```typescript
   import tools from './ai-tools/openai-tools.json';
   
   const response = await openai.chat.completions.create({
     model: 'gpt-4',
     messages: [{ role: 'user', content: 'Get user 123' }],
     tools: tools,
     tool_choice: 'auto'
   });
   ```

### Using with LangChain

1. Generate tools:
   ```bash
   npm run generate-ai-tools -- ./docs --framework langchain
   ```

2. Import in your chain:
   ```typescript
   import { getUserTool } from './ai-tools/langchain-tools';
   
   const agent = createToolCallingAgent({
     llm,
     tools: [getUserTool],
     prompt
   });
   ```

### Using with Vector DB (Pinecone)

1. Generate chunks:
   ```bash
   npm run generate-rag -- ./docs --vector-db pinecone
   ```

2. Run import script:
   ```bash
   cd rag-output
   pip install pinecone-client openai
   python import-pinecone.py
   ```

3. Query in your app:
   ```python
   results = index.query(
       vector=embedding,
       top_k=5,
       include_metadata=True
   )
   ```

---

## Best Practices

1. **Context Files** - Keep under 8000 tokens for optimal AI performance
2. **Tool Definitions** - Use descriptive names and detailed descriptions
3. **RAG Chunks** - Balance chunk size (1000 chars) vs context preservation
4. **Type Generation** - Validate against actual API responses
5. **Code Examples** - Test extracted examples before deployment

---

## Troubleshooting

**Issue:** No endpoints extracted
- **Solution:** Check if API docs use standard OpenAPI/REST patterns

**Issue:** Chunks too large
- **Solution:** Reduce `--chunk-size` parameter (default: 1000)

**Issue:** Missing dependencies
- **Solution:** Use `--with-tests` to verify all imports

**Issue:** Types incomplete
- **Solution:** Ensure MCP tools are generated first

---

## Next Steps

- [Complete API Reference](./API.md)
- [Mintlify Publishing Guide](./examples/mintlify-publishing.md)
- [MCP Server Guide](./examples/1inch-mcp-server.md)
