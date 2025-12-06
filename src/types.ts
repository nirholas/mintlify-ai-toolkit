// Type definitions for Mintlify AI Toolkit

export interface ScraperOptions {
  output?: string;
  concurrent?: number;
  retries?: number;
  timeout?: number;
}

export interface PublisherOptions {
  name?: string;
  description?: string;
  primaryColor?: string;
  logo?: string;
  domain?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  analytics?: AnalyticsOptions;
  enableFeedback?: boolean;
  enableAPIPlayground?: boolean;
  apiBaseUrl?: string;
  openapi?: string;
}

export interface AnalyticsOptions {
  ga4?: string;
  mixpanel?: string;
  posthog?: string;
}

export type AIContextFormat = 'cursor' | 'cline' | 'claude' | 'windsurf' | 'all';

export type AIToolFramework = 'mcp' | 'openai' | 'langchain' | 'anthropic' | 'gemini' | 'vercel' | 'all';

export type VectorDatabase = 'pinecone' | 'weaviate' | 'chroma' | 'qdrant' | 'milvus';

export type ExportFormat = 'json' | 'jsonl' | 'csv';

export interface RAGOptions {
  chunkSize?: number;
  overlap?: number;
  generateQA?: boolean;
  exportFormat?: ExportFormat;
  vectorDB?: VectorDatabase;
}

export interface TypeGeneratorOptions {
  withZod?: boolean;
}

export interface CodeExtractorOptions {
  withTests?: boolean;
}

export interface Chunk {
  id: string;
  text: string;
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  section: string;
  title: string;
  url: string;
  type: 'documentation' | 'api' | 'guide' | 'example';
  tokens: number;
  keywords: string[];
}

export interface QAPair {
  question: string;
  answer: string;
  context: string;
  metadata: ChunkMetadata;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, Parameter>;
  required?: string[];
}

export interface Parameter {
  type: string;
  description?: string;
  optional?: boolean;
  array?: boolean;
}
