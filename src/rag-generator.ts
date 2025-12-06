#!/usr/bin/env node
/**
 * RAG-Ready Output Generator
 * 
 * Generates documentation in formats optimized for Retrieval-Augmented Generation (RAG)
 * 
 * Features:
 * - Semantic chunking with metadata
 * - Vector database formats (Pinecone, Weaviate, Chroma, etc.)
 * - Embedding-ready JSON
 * - Q&A pair generation
 * - Import scripts for popular vector DBs
 * 
 * Usage:
 *   npm run generate-rag -- ./scraped-docs
 *   npm run generate-rag -- ./scraped-docs --vector-db pinecone
 *   npm run generate-rag -- ./scraped-docs --chunk-size 1000
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface Chunk {
  id: string;
  content: string;
  metadata: {
    section: string;
    title: string;
    url?: string;
    type: 'documentation' | 'api' | 'guide' | 'example';
    tokens: number;
    keywords: string[];
  };
}

interface QAPair {
  question: string;
  answer: string;
  context: string;
  metadata: {
    section: string;
    relevance: number;
  };
}

interface RAGConfig {
  chunkSize: number;
  chunkOverlap: number;
  vectorDB?: 'pinecone' | 'weaviate' | 'chroma' | 'qdrant' | 'milvus';
  generateQA: boolean;
  outputFormat: 'json' | 'jsonl' | 'csv';
}

class RAGGenerator {
  private docsPath: string;
  private config: RAGConfig;
  private chunks: Chunk[] = [];
  private qaPairs: QAPair[] = [];

  constructor(docsPath: string, config: RAGConfig) {
    this.docsPath = docsPath;
    this.config = config;
  }

  async generate(): Promise<void> {
    console.log(`\n🧠 Generating RAG-Ready Documentation\n`);
    console.log(`📁 Source: ${this.docsPath}`);
    console.log(`📏 Chunk size: ${this.config.chunkSize} characters`);
    console.log(`🔄 Overlap: ${this.config.chunkOverlap} characters`);
    if (this.config.vectorDB) {
      console.log(`🗄️  Vector DB: ${this.config.vectorDB}`);
    }
    console.log('');

    // Step 1: Read and chunk documentation
    console.log('📝 Step 1: Chunking documentation...');
    await this.chunkDocumentation();
    console.log(`✓ Created ${this.chunks.length} chunks\n`);

    // Step 2: Generate Q&A pairs
    if (this.config.generateQA) {
      console.log('❓ Step 2: Generating Q&A pairs...');
      await this.generateQAPairs();
      console.log(`✓ Generated ${this.qaPairs.length} Q&A pairs\n`);
    }

    // Step 3: Export in requested format
    console.log('💾 Step 3: Exporting data...');
    await this.exportChunks();
    if (this.config.generateQA) {
      await this.exportQAPairs();
    }
    console.log('✓ Export complete\n');

    // Step 4: Generate vector DB import scripts
    if (this.config.vectorDB) {
      console.log('🔧 Step 4: Generating import scripts...');
      await this.generateImportScripts();
      console.log('✓ Import scripts created\n');
    }

    console.log('✅ RAG-ready documentation generated successfully!\n');
    console.log(`📊 Summary:`);
    console.log(`   - ${this.chunks.length} semantic chunks`);
    if (this.config.generateQA) {
      console.log(`   - ${this.qaPairs.length} Q&A pairs`);
    }
    if (this.config.vectorDB) {
      console.log(`   - Import script for ${this.config.vectorDB}`);
    }
    console.log('');
  }

  private async chunkDocumentation(): Promise<void> {
    const metadata = await this.loadMetadata();
    
    for (const page of metadata.pages || []) {
      const filePath = path.join(this.docsPath, page.section, `${page.slug}.md`);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const pageChunks = this.chunkText(content, {
          section: page.section,
          title: page.title,
          url: page.url
        });
        
        this.chunks.push(...pageChunks);
      } catch (error) {
        console.warn(`   ⚠️  Could not read ${filePath}`);
      }
    }
  }

  private async loadMetadata(): Promise<any> {
    try {
      const content = await fs.readFile(
        path.join(this.docsPath, 'metadata.json'),
        'utf-8'
      );
      return JSON.parse(content);
    } catch {
      return { pages: [] };
    }
  }

  private chunkText(text: string, pageMetadata: any): Chunk[] {
    const chunks: Chunk[] = [];
    
    // Remove frontmatter and URL metadata
    text = text.replace(/^---[\s\S]*?---\n/, '');
    text = text.replace(/^\*\*URL:\*\* .+\n\n/gm, '');
    
    // Split into sections by headers
    const sections = text.split(/^##+ /gm);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;
      
      // Further split large sections
      const sectionChunks = this.splitIntoChunks(section);
      
      for (const chunk of sectionChunks) {
        const chunkId = `${pageMetadata.section}_${i}_${chunks.length}`;
        const type = this.determineChunkType(chunk, pageMetadata.section);
        const keywords = this.extractKeywords(chunk);
        
        chunks.push({
          id: chunkId,
          content: chunk,
          metadata: {
            section: pageMetadata.section,
            title: pageMetadata.title,
            url: pageMetadata.url,
            type,
            tokens: this.estimateTokens(chunk),
            keywords
          }
        });
      }
    }
    
    return chunks;
  }

  private splitIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > this.config.chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  private determineChunkType(content: string, section: string): Chunk['metadata']['type'] {
    if (section.includes('api')) return 'api';
    if (section.includes('guide')) return 'guide';
    if (section.includes('example')) return 'example';
    if (content.includes('```')) return 'example';
    return 'documentation';
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (can be enhanced with NLP)
    const words = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4);
    
    // Get unique words and count frequency
    const wordFreq = new Map<string, number>();
    words.forEach(w => wordFreq.set(w, (wordFreq.get(w) || 0) + 1));
    
    // Return top keywords
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private async generateQAPairs(): Promise<void> {
    // Generate Q&A pairs from chunks
    for (const chunk of this.chunks) {
      const questions = this.generateQuestionsFromChunk(chunk);
      
      for (const question of questions) {
        this.qaPairs.push({
          question,
          answer: chunk.content,
          context: chunk.metadata.section,
          metadata: {
            section: chunk.metadata.section,
            relevance: 1.0
          }
        });
      }
    }
  }

  private generateQuestionsFromChunk(chunk: Chunk): string[] {
    const questions: string[] = [];
    const content = chunk.content.toLowerCase();
    
    // Pattern-based question generation
    if (content.includes('how to')) {
      questions.push(`How do I ${this.extractTopic(chunk.content)}?`);
    }
    
    if (chunk.metadata.type === 'api') {
      questions.push(`What is the ${chunk.metadata.title} endpoint?`);
      questions.push(`How do I use ${chunk.metadata.title}?`);
    }
    
    if (content.includes('error') || content.includes('exception')) {
      questions.push(`How do I handle errors in ${chunk.metadata.section}?`);
    }
    
    // Generic question
    questions.push(`What is ${chunk.metadata.title}?`);
    
    return questions;
  }

  private extractTopic(content: string): string {
    // Extract first meaningful phrase
    const match = content.match(/^(.{20,80}?)[.!?]/);
    return match ? match[1].trim() : 'this feature';
  }

  private async exportChunks(): Promise<void> {
    const outputPath = path.join('./rag-output', `chunks.${this.config.outputFormat}`);
    await fs.mkdir('./rag-output', { recursive: true });
    
    switch (this.config.outputFormat) {
      case 'json':
        await fs.writeFile(outputPath, JSON.stringify(this.chunks, null, 2));
        break;
      case 'jsonl':
        const jsonl = this.chunks.map(c => JSON.stringify(c)).join('\n');
        await fs.writeFile(outputPath, jsonl);
        break;
      case 'csv':
        const csv = this.chunksToCSV();
        await fs.writeFile(outputPath, csv);
        break;
    }
    
    console.log(`   ✓ Exported to ${outputPath}`);
  }

  private async exportQAPairs(): Promise<void> {
    const outputPath = path.join('./rag-output', `qa-pairs.${this.config.outputFormat}`);
    
    switch (this.config.outputFormat) {
      case 'json':
        await fs.writeFile(outputPath, JSON.stringify(this.qaPairs, null, 2));
        break;
      case 'jsonl':
        const jsonl = this.qaPairs.map(qa => JSON.stringify(qa)).join('\n');
        await fs.writeFile(outputPath, jsonl);
        break;
      case 'csv':
        const csv = this.qaPairsToCSV();
        await fs.writeFile(outputPath, csv);
        break;
    }
    
    console.log(`   ✓ Exported Q&A to ${outputPath}`);
  }

  private chunksToCSV(): string {
    const header = 'id,content,section,title,type,tokens,keywords\n';
    const rows = this.chunks.map(c => 
      `"${c.id}","${c.content.replace(/"/g, '""')}","${c.metadata.section}","${c.metadata.title}","${c.metadata.type}",${c.metadata.tokens},"${c.metadata.keywords.join(',')}"`
    );
    return header + rows.join('\n');
  }

  private qaPairsToCSV(): string {
    const header = 'question,answer,context,section\n';
    const rows = this.qaPairs.map(qa => 
      `"${qa.question.replace(/"/g, '""')}","${qa.answer.replace(/"/g, '""')}","${qa.context}","${qa.metadata.section}"`
    );
    return header + rows.join('\n');
  }

  private async generateImportScripts(): Promise<void> {
    switch (this.config.vectorDB) {
      case 'pinecone':
        await this.generatePineconeScript();
        break;
      case 'weaviate':
        await this.generateWeaviateScript();
        break;
      case 'chroma':
        await this.generateChromaScript();
        break;
      case 'qdrant':
        await this.generateQdrantScript();
        break;
      case 'milvus':
        await this.generateMilvusScript();
        break;
    }
  }

  private async generatePineconeScript(): Promise<void> {
    const script = `import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import * as fs from 'fs';

const chunks = JSON.parse(fs.readFileSync('./rag-output/chunks.json', 'utf-8'));

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY
});

async function uploadToPinecone() {
  const index = pinecone.index('docs-index');
  
  // Process in batches of 100
  for (let i = 0; i < chunks.length; i += 100) {
    const batch = chunks.slice(i, i + 100);
    
    const vectors = await Promise.all(
      batch.map(async (chunk) => ({
        id: chunk.id,
        values: await embeddings.embedQuery(chunk.content),
        metadata: {
          content: chunk.content,
          section: chunk.metadata.section,
          title: chunk.metadata.title,
          type: chunk.metadata.type,
          keywords: chunk.metadata.keywords.join(',')
        }
      }))
    );
    
    await index.upsert(vectors);
    console.log(\`Uploaded batch \${i / 100 + 1}\`);
  }
  
  console.log('✅ Upload complete!');
}

uploadToPinecone().catch(console.error);
`;

    await fs.writeFile('./rag-output/import-pinecone.ts', script);
    console.log('   ✓ Pinecone import script created');
  }

  private async generateWeaviateScript(): Promise<void> {
    const script = `import weaviate from 'weaviate-ts-client';
import { OpenAIEmbeddings } from '@langchain/openai';
import * as fs from 'fs';

const chunks = JSON.parse(fs.readFileSync('./rag-output/chunks.json', 'utf-8'));

const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_HOST!,
  apiKey: { apiKey: process.env.WEAVIATE_API_KEY! }
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY
});

async function uploadToWeaviate() {
  // Create schema
  await client.schema
    .classCreator()
    .withClass({
      class: 'Documentation',
      properties: [
        { name: 'content', dataType: ['text'] },
        { name: 'section', dataType: ['string'] },
        { name: 'title', dataType: ['string'] },
        { name: 'type', dataType: ['string'] },
        { name: 'keywords', dataType: ['string[]'] }
      ]
    })
    .do();
  
  // Upload chunks
  for (const chunk of chunks) {
    const vector = await embeddings.embedQuery(chunk.content);
    
    await client.data
      .creator()
      .withClassName('Documentation')
      .withProperties({
        content: chunk.content,
        section: chunk.metadata.section,
        title: chunk.metadata.title,
        type: chunk.metadata.type,
        keywords: chunk.metadata.keywords
      })
      .withVector(vector)
      .do();
  }
  
  console.log('✅ Upload complete!');
}

uploadToWeaviate().catch(console.error);
`;

    await fs.writeFile('./rag-output/import-weaviate.ts', script);
    console.log('   ✓ Weaviate import script created');
  }

  private async generateChromaScript(): Promise<void> {
    const script = `import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddings } from '@langchain/openai';
import * as fs from 'fs';

const chunks = JSON.parse(fs.readFileSync('./rag-output/chunks.json', 'utf-8'));

const client = new ChromaClient();
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY
});

async function uploadToChroma() {
  const collection = await client.createCollection({
    name: 'documentation',
    metadata: { description: 'Documentation chunks' }
  });
  
  const ids = chunks.map(c => c.id);
  const documents = chunks.map(c => c.content);
  const metadatas = chunks.map(c => c.metadata);
  const embedVectors = await Promise.all(
    documents.map(doc => embeddings.embedQuery(doc))
  );
  
  await collection.add({
    ids,
    embeddings: embedVectors,
    documents,
    metadatas
  });
  
  console.log('✅ Upload complete!');
}

uploadToChroma().catch(console.error);
`;

    await fs.writeFile('./rag-output/import-chroma.ts', script);
    console.log('   ✓ Chroma import script created');
  }

  private async generateQdrantScript(): Promise<void> {
    const script = `import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from '@langchain/openai';
import * as fs from 'fs';

const chunks = JSON.parse(fs.readFileSync('./rag-output/chunks.json', 'utf-8'));

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY
});

async function uploadToQdrant() {
  await client.createCollection('documentation', {
    vectors: { size: 1536, distance: 'Cosine' }
  });
  
  const points = await Promise.all(
    chunks.map(async (chunk, idx) => ({
      id: idx,
      vector: await embeddings.embedQuery(chunk.content),
      payload: {
        content: chunk.content,
        ...chunk.metadata
      }
    }))
  );
  
  await client.upsert('documentation', { points });
  
  console.log('✅ Upload complete!');
}

uploadToQdrant().catch(console.error);
`;

    await fs.writeFile('./rag-output/import-qdrant.ts', script);
    console.log('   ✓ Qdrant import script created');
  }

  private async generateMilvusScript(): Promise<void> {
    const script = `import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { OpenAIEmbeddings } from '@langchain/openai';
import * as fs from 'fs';

const chunks = JSON.parse(fs.readFileSync('./rag-output/chunks.json', 'utf-8'));

const client = new MilvusClient({
  address: process.env.MILVUS_ADDRESS!
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY
});

async function uploadToMilvus() {
  await client.createCollection({
    collection_name: 'documentation',
    fields: [
      { name: 'id', data_type: 'Int64', is_primary_key: true },
      { name: 'vector', data_type: 'FloatVector', dim: 1536 },
      { name: 'content', data_type: 'VarChar', max_length: 65535 },
      { name: 'section', data_type: 'VarChar', max_length: 255 }
    ]
  });
  
  const data = await Promise.all(
    chunks.map(async (chunk, idx) => ({
      id: idx,
      vector: await embeddings.embedQuery(chunk.content),
      content: chunk.content,
      section: chunk.metadata.section
    }))
  );
  
  await client.insert({
    collection_name: 'documentation',
    data
  });
  
  console.log('✅ Upload complete!');
}

uploadToMilvus().catch(console.error);
`;

    await fs.writeFile('./rag-output/import-milvus.ts', script);
    console.log('   ✓ Milvus import script created');
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
RAG-Ready Output Generator
===========================

Generate documentation in formats optimized for RAG systems

Usage:
  npm run generate-rag -- <docs-path> [options]

Examples:
  # Basic RAG output
  npm run generate-rag -- ./scraped-docs

  # With Q&A pairs and Pinecone import
  npm run generate-rag -- ./scraped-docs --generate-qa --vector-db pinecone

  # Custom chunk size
  npm run generate-rag -- ./scraped-docs --chunk-size 500

Options:
  --chunk-size <n>        Chunk size in characters (default: 1000)
  --chunk-overlap <n>     Overlap between chunks (default: 200)
  --vector-db <name>      Generate import script for vector DB
  --generate-qa           Generate Q&A pairs
  --format <type>         Output format: json, jsonl, csv (default: json)
  --help                  Show this help

Supported Vector Databases:
  • Pinecone
  • Weaviate
  • Chroma
  • Qdrant
  • Milvus

Output Files:
  ./rag-output/
  ├── chunks.json          # Semantic chunks with metadata
  ├── qa-pairs.json        # Generated Q&A pairs
  └── import-<db>.ts       # Vector DB import script
    `);
    process.exit(0);
  }

  const docsPath = args[0];
  const chunkSizeIdx = args.indexOf('--chunk-size');
  const chunkOverlapIdx = args.indexOf('--chunk-overlap');
  const vectorDBIdx = args.indexOf('--vector-db');
  const formatIdx = args.indexOf('--format');

  const config: RAGConfig = {
    chunkSize: chunkSizeIdx !== -1 ? parseInt(args[chunkSizeIdx + 1]) : 1000,
    chunkOverlap: chunkOverlapIdx !== -1 ? parseInt(args[chunkOverlapIdx + 1]) : 200,
    vectorDB: vectorDBIdx !== -1 ? args[vectorDBIdx + 1] as any : undefined,
    generateQA: args.includes('--generate-qa'),
    outputFormat: formatIdx !== -1 ? args[formatIdx + 1] as any : 'json'
  };

  const generator = new RAGGenerator(docsPath, config);
  
  try {
    await generator.generate();
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { RAGGenerator };
