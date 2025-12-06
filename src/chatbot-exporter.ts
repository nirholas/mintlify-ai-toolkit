/**
 * Chatbot Training Data Exporter
 * 
 * Export documentation as Q&A pairs for fine-tuning chatbots.
 * Supports OpenAI, LLaMA, Claude, and generic formats.
 * 
 * Features:
 * - Auto-generate Q&A from docs
 * - Multiple export formats (JSONL, CSV, JSON)
 * - Validation test sets
 * - Quality filtering
 * - Custom prompt templates
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ChatbotExporterConfig {
  format: 'openai-jsonl' | 'llama' | 'claude' | 'generic-json' | 'csv';
  qaGeneration: {
    enabled: boolean;
    provider?: 'openai' | 'anthropic' | 'local';
    apiKey?: string;
    questionsPerSection?: number;
  };
  validation: {
    enabled: boolean;
    splitRatio?: number; // 0.8 = 80% train, 20% validation
  };
  quality: {
    minAnswerLength?: number;
    maxAnswerLength?: number;
    requireCodeExamples?: boolean;
  };
  systemPrompt?: string;
}

export interface QAPair {
  question: string;
  answer: string;
  context?: string;
  metadata: {
    url: string;
    title: string;
    section: string;
    hasCode: boolean;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

export class ChatbotExporter {
  private config: ChatbotExporterConfig;
  private qaPairs: QAPair[] = [];

  constructor(config: ChatbotExporterConfig) {
    this.config = {
      format: config.format,
      qaGeneration: {
        enabled: config.qaGeneration?.enabled ?? false,
        questionsPerSection: config.qaGeneration?.questionsPerSection ?? 3,
        provider: config.qaGeneration?.provider,
        apiKey: config.qaGeneration?.apiKey,
      },
      validation: {
        enabled: config.validation?.enabled ?? true,
        splitRatio: config.validation?.splitRatio ?? 0.8,
      },
      quality: {
        minAnswerLength: config.quality?.minAnswerLength ?? 50,
        maxAnswerLength: config.quality?.maxAnswerLength ?? 2000,
        requireCodeExamples: config.quality?.requireCodeExamples ?? false,
      },
      systemPrompt: config.systemPrompt || this.getDefaultSystemPrompt(),
    };
  }

  /**
   * Process documentation and generate training data
   */
  async processDocumentation(docsDir: string, outputPath: string): Promise<void> {
    console.log('🤖 Generating chatbot training data...');
    
    // Find all markdown files
    const files = await this.findMarkdownFiles(docsDir);
    console.log(`   Found ${files.length} documentation files`);

    // Extract Q&A pairs
    for (const file of files) {
      const pairs = await this.processFile(file);
      this.qaPairs.push(...pairs);
    }

    console.log(`   Generated ${this.qaPairs.length} Q&A pairs`);

    // Filter by quality
    this.filterByQuality();
    console.log(`   After quality filter: ${this.qaPairs.length} pairs`);

    // Split into train/validation
    const { train, validation } = this.splitDataset();

    // Export in requested format
    await this.export(train, validation, outputPath);

    console.log('✅ Training data exported successfully!');
  }

  /**
   * Process a single markdown file
   */
  private async processFile(filePath: string): Promise<QAPair[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const pairs: QAPair[] = [];

    // Extract metadata
    const metadata = this.extractMetadata(content, filePath);

    // Remove frontmatter
    const cleanContent = content.replace(/^---[\s\S]*?---\n/, '');

    // Split into sections
    const sections = this.splitIntoSections(cleanContent);

    for (const section of sections) {
      if (this.config.qaGeneration.enabled) {
        // Auto-generate Q&A using AI
        const generatedPairs = await this.generateQA(section, metadata);
        pairs.push(...generatedPairs);
      } else {
        // Extract manual Q&A patterns
        const manualPairs = this.extractManualQA(section, metadata);
        pairs.push(...manualPairs);
      }
    }

    return pairs;
  }

  /**
   * Extract metadata from markdown
   */
  private extractMetadata(content: string, filePath: string): any {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const metadata: any = {};
      
      frontmatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        }
      });
      
      return metadata;
    }

    return {
      url: filePath,
      title: path.basename(filePath, '.md'),
      section: path.dirname(filePath).split('/').pop(),
    };
  }

  /**
   * Split content into sections
   */
  private splitIntoSections(content: string): Array<{ heading: string; content: string }> {
    const sections: Array<{ heading: string; content: string }> = [];
    const lines = content.split('\n');
    
    let currentHeading = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith('#')) {
        // Save previous section
        if (currentContent.length > 0) {
          sections.push({
            heading: currentHeading,
            content: currentContent.join('\n'),
          });
        }
        
        // Start new section
        currentHeading = line.replace(/^#+\s*/, '');
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentContent.length > 0) {
      sections.push({
        heading: currentHeading,
        content: currentContent.join('\n'),
      });
    }

    return sections.filter(s => s.content.trim().length > 50);
  }

  /**
   * Generate Q&A pairs using AI
   */
  private async generateQA(
    section: { heading: string; content: string },
    metadata: any
  ): Promise<QAPair[]> {
    const prompt = `Generate ${this.config.qaGeneration.questionsPerSection} question-answer pairs from this documentation section.

Section: ${section.heading}

Content:
${section.content}

Generate questions that:
1. Test understanding of key concepts
2. Are specific and answerable from the content
3. Range from basic to advanced
4. Include practical use cases

Format as JSON array:
[
  {
    "question": "...",
    "answer": "...",
    "difficulty": "easy|medium|hard"
  }
]`;

    try {
      const response = await this.callAI(prompt);
      const generated = JSON.parse(response);

      return generated.map((qa: any) => ({
        question: qa.question,
        answer: qa.answer,
        context: section.content,
        metadata: {
          ...metadata,
          hasCode: /```/.test(section.content),
          difficulty: qa.difficulty,
        },
      }));
    } catch (error) {
      console.warn(`   Failed to generate Q&A for section "${section.heading}": ${error}`);
      return [];
    }
  }

  /**
   * Extract manual Q&A patterns from content
   */
  private extractManualQA(
    section: { heading: string; content: string },
    metadata: any
  ): QAPair[] {
    const pairs: QAPair[] = [];

    // Pattern 1: FAQ sections
    const faqMatch = section.content.match(/(?:^|\n)(?:Q:|Question:)\s*(.*?)\n(?:A:|Answer:)\s*([\s\S]*?)(?=\n(?:Q:|Question:)|\n#|$)/gi);
    
    if (faqMatch) {
      for (const match of faqMatch) {
        const questionMatch = match.match(/(?:Q:|Question:)\s*(.*)/i);
        const answerMatch = match.match(/(?:A:|Answer:)\s*([\s\S]*)/i);
        
        if (questionMatch && answerMatch) {
          pairs.push({
            question: questionMatch[1].trim(),
            answer: answerMatch[1].trim(),
            context: section.content,
            metadata: {
              ...metadata,
              hasCode: /```/.test(match),
            },
          });
        }
      }
    }

    // Pattern 2: "How to" sections
    if (section.heading.toLowerCase().includes('how to')) {
      pairs.push({
        question: section.heading,
        answer: section.content.trim(),
        context: section.content,
        metadata: {
          ...metadata,
          hasCode: /```/.test(section.content),
        },
      });
    }

    // Pattern 3: Code examples with explanations
    const codeBlocks = section.content.match(/```[\s\S]*?```/g);
    if (codeBlocks && codeBlocks.length > 0) {
      const explanation = section.content.replace(/```[\s\S]*?```/g, '').trim();
      if (explanation.length > 100) {
        pairs.push({
          question: `How do I ${section.heading.toLowerCase()}?`,
          answer: section.content,
          context: section.content,
          metadata: {
            ...metadata,
            hasCode: true,
          },
        });
      }
    }

    return pairs;
  }

  /**
   * Call AI provider to generate content
   */
  private async callAI(prompt: string): Promise<string> {
    if (this.config.qaGeneration.provider === 'openai') {
      return await this.callOpenAI(prompt);
    } else if (this.config.qaGeneration.provider === 'anthropic') {
      return await this.callAnthropic(prompt);
    }
    
    throw new Error(`Unsupported AI provider: ${this.config.qaGeneration.provider}`);
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.qaGeneration.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a documentation Q&A generator. Generate clear, specific questions and detailed answers.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.qaGeneration.apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Filter Q&A pairs by quality
   */
  private filterByQuality(): void {
    this.qaPairs = this.qaPairs.filter(pair => {
      // Check answer length
      if (pair.answer.length < this.config.quality.minAnswerLength!) {
        return false;
      }
      
      if (pair.answer.length > this.config.quality.maxAnswerLength!) {
        return false;
      }

      // Check for code examples if required
      if (this.config.quality.requireCodeExamples && !pair.metadata.hasCode) {
        return false;
      }

      return true;
    });
  }

  /**
   * Split dataset into train/validation
   */
  private splitDataset(): { train: QAPair[]; validation: QAPair[] } {
    if (!this.config.validation.enabled) {
      return { train: this.qaPairs, validation: [] };
    }

    const shuffled = [...this.qaPairs].sort(() => Math.random() - 0.5);
    const splitIndex = Math.floor(shuffled.length * this.config.validation.splitRatio!);

    return {
      train: shuffled.slice(0, splitIndex),
      validation: shuffled.slice(splitIndex),
    };
  }

  /**
   * Export training data
   */
  private async export(train: QAPair[], validation: QAPair[], outputPath: string): Promise<void> {
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    switch (this.config.format) {
      case 'openai-jsonl':
        await this.exportOpenAIFormat(train, validation, outputPath);
        break;
      
      case 'llama':
        await this.exportLLaMAFormat(train, validation, outputPath);
        break;
      
      case 'claude':
        await this.exportClaudeFormat(train, validation, outputPath);
        break;
      
      case 'generic-json':
        await this.exportGenericJSON(train, validation, outputPath);
        break;
      
      case 'csv':
        await this.exportCSV(train, validation, outputPath);
        break;
    }
  }

  /**
   * Export in OpenAI fine-tuning format (JSONL)
   */
  private async exportOpenAIFormat(train: QAPair[], validation: QAPair[], outputPath: string): Promise<void> {
    const trainLines = train.map(pair => JSON.stringify({
      messages: [
        { role: 'system', content: this.config.systemPrompt },
        { role: 'user', content: pair.question },
        { role: 'assistant', content: pair.answer },
      ],
    }));

    const validationLines = validation.map(pair => JSON.stringify({
      messages: [
        { role: 'system', content: this.config.systemPrompt },
        { role: 'user', content: pair.question },
        { role: 'assistant', content: pair.answer },
      ],
    }));

    await fs.writeFile(
      outputPath.replace(/\.[^.]+$/, '-train.jsonl'),
      trainLines.join('\n'),
      'utf-8'
    );

    if (validation.length > 0) {
      await fs.writeFile(
        outputPath.replace(/\.[^.]+$/, '-validation.jsonl'),
        validationLines.join('\n'),
        'utf-8'
      );
    }

    console.log(`   📁 Exported OpenAI format to ${outputPath}`);
  }

  /**
   * Export in LLaMA format
   */
  private async exportLLaMAFormat(train: QAPair[], validation: QAPair[], outputPath: string): Promise<void> {
    const formatPair = (pair: QAPair) => {
      return `<s>[INST] <<SYS>>\n${this.config.systemPrompt}\n<</SYS>>\n\n${pair.question} [/INST] ${pair.answer} </s>`;
    };

    await fs.writeFile(
      outputPath.replace(/\.[^.]+$/, '-train.txt'),
      train.map(formatPair).join('\n\n'),
      'utf-8'
    );

    if (validation.length > 0) {
      await fs.writeFile(
        outputPath.replace(/\.[^.]+$/, '-validation.txt'),
        validation.map(formatPair).join('\n\n'),
        'utf-8'
      );
    }

    console.log(`   📁 Exported LLaMA format to ${outputPath}`);
  }

  /**
   * Export in Claude format
   */
  private async exportClaudeFormat(train: QAPair[], validation: QAPair[], outputPath: string): Promise<void> {
    const trainData = train.map(pair => ({
      prompt: `Human: ${pair.question}\n\nAssistant:`,
      completion: ` ${pair.answer}`,
    }));

    const validationData = validation.map(pair => ({
      prompt: `Human: ${pair.question}\n\nAssistant:`,
      completion: ` ${pair.answer}`,
    }));

    await fs.writeFile(
      outputPath.replace(/\.[^.]+$/, '-train.jsonl'),
      trainData.map(d => JSON.stringify(d)).join('\n'),
      'utf-8'
    );

    if (validation.length > 0) {
      await fs.writeFile(
        outputPath.replace(/\.[^.]+$/, '-validation.jsonl'),
        validationData.map(d => JSON.stringify(d)).join('\n'),
        'utf-8'
      );
    }

    console.log(`   📁 Exported Claude format to ${outputPath}`);
  }

  /**
   * Export as generic JSON
   */
  private async exportGenericJSON(train: QAPair[], validation: QAPair[], outputPath: string): Promise<void> {
    await fs.writeFile(
      outputPath.replace(/\.[^.]+$/, '-train.json'),
      JSON.stringify(train, null, 2),
      'utf-8'
    );

    if (validation.length > 0) {
      await fs.writeFile(
        outputPath.replace(/\.[^.]+$/, '-validation.json'),
        JSON.stringify(validation, null, 2),
        'utf-8'
      );
    }

    console.log(`   📁 Exported JSON format to ${outputPath}`);
  }

  /**
   * Export as CSV
   */
  private async exportCSV(train: QAPair[], validation: QAPair[], outputPath: string): Promise<void> {
    const toCSV = (pairs: QAPair[]) => {
      const header = 'question,answer,url,title,has_code\n';
      const rows = pairs.map(pair => {
        const question = pair.question.replace(/"/g, '""');
        const answer = pair.answer.replace(/"/g, '""');
        return `"${question}","${answer}","${pair.metadata.url}","${pair.metadata.title}",${pair.metadata.hasCode}`;
      });
      return header + rows.join('\n');
    };

    await fs.writeFile(
      outputPath.replace(/\.[^.]+$/, '-train.csv'),
      toCSV(train),
      'utf-8'
    );

    if (validation.length > 0) {
      await fs.writeFile(
        outputPath.replace(/\.[^.]+$/, '-validation.csv'),
        toCSV(validation),
        'utf-8'
      );
    }

    console.log(`   📁 Exported CSV format to ${outputPath}`);
  }

  /**
   * Get default system prompt
   */
  private getDefaultSystemPrompt(): string {
    return 'You are a helpful assistant that answers questions about documentation. Provide clear, accurate, and detailed responses based on the documentation content.';
  }

  /**
   * Find all markdown files recursively
   */
  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...await this.findMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

/**
 * CLI for chatbot data export
 */
export async function exportChatbotData(args: {
  docsDir: string;
  outputPath: string;
  format: 'openai-jsonl' | 'llama' | 'claude' | 'generic-json' | 'csv';
  generateQA?: boolean;
  apiKey?: string;
}): Promise<void> {
  const config: ChatbotExporterConfig = {
    format: args.format,
    qaGeneration: {
      enabled: args.generateQA || false,
      provider: args.apiKey ? 'openai' : undefined,
      apiKey: args.apiKey || process.env.OPENAI_API_KEY,
      questionsPerSection: 3,
    },
    validation: {
      enabled: true,
      splitRatio: 0.8,
    },
    quality: {
      minAnswerLength: 50,
      maxAnswerLength: 2000,
    },
  };

  const exporter = new ChatbotExporter(config);
  await exporter.processDocumentation(args.docsDir, args.outputPath);
  
  console.log('\n✅ Chatbot training data exported!');
  console.log('   Upload to OpenAI: https://platform.openai.com/finetune');
}
