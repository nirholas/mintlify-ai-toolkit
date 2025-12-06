/**
 * AI-Powered Content Enhancement
 * 
 * Uses AI to improve scraped documentation:
 * - Smart content extraction
 * - Automatic summarization
 * - Code example explanation
 * - Quality scoring
 * - Section classification
 * - Missing content detection
 */

import * as fs from 'fs/promises';

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'local' | 'none';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  features: {
    summarize?: boolean;
    extractKeyPoints?: boolean;
    explainCode?: boolean;
    scoreQuality?: boolean;
    classifySections?: boolean;
    detectMissing?: boolean;
  };
}

export interface AIEnhancedDoc {
  originalContent: string;
  summary?: string;
  keyPoints?: string[];
  sections?: Array<{
    title: string;
    type: 'intro' | 'tutorial' | 'reference' | 'guide' | 'example';
    importance: number;
  }>;
  codeExplanations?: Array<{
    code: string;
    language: string;
    explanation: string;
    complexity: 'simple' | 'moderate' | 'complex';
  }>;
  qualityScore?: {
    overall: number;
    completeness: number;
    clarity: number;
    examples: number;
    feedback: string[];
  };
  missingContent?: string[];
}

export class AIContentEnhancer {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = {
      model: 'gpt-4',
      ...config,
    };
  }

  /**
   * Enhance documentation with AI
   */
  async enhance(content: string, url: string): Promise<AIEnhancedDoc> {
    const enhanced: AIEnhancedDoc = {
      originalContent: content,
    };

    if (this.config.features.summarize) {
      enhanced.summary = await this.summarize(content);
    }

    if (this.config.features.extractKeyPoints) {
      enhanced.keyPoints = await this.extractKeyPoints(content);
    }

    if (this.config.features.classifySections) {
      enhanced.sections = await this.classifySections(content);
    }

    if (this.config.features.explainCode) {
      enhanced.codeExplanations = await this.explainCodeBlocks(content);
    }

    if (this.config.features.scoreQuality) {
      enhanced.qualityScore = await this.scoreQuality(content);
    }

    if (this.config.features.detectMissing) {
      enhanced.missingContent = await this.detectMissingContent(content, url);
    }

    return enhanced;
  }

  /**
   * Generate concise summary
   */
  private async summarize(content: string): Promise<string> {
    const prompt = `Summarize this documentation in 2-3 sentences. Focus on what it teaches and who it's for:

${content.substring(0, 2000)}`;

    return await this.callAI(prompt, 150);
  }

  /**
   * Extract key points
   */
  private async extractKeyPoints(content: string): Promise<string[]> {
    const prompt = `Extract 3-5 key points from this documentation as a JSON array:

${content.substring(0, 2000)}

Return only the JSON array, nothing else.`;

    const response = await this.callAI(prompt, 200);
    
    try {
      return JSON.parse(response);
    } catch {
      // Fallback to simple extraction
      return response.split('\n').filter(line => line.trim().startsWith('-'));
    }
  }

  /**
   * Classify sections
   */
  private async classifySections(content: string): Promise<any[]> {
    // Extract headings
    const headings = this.extractHeadings(content);
    
    const classifications = await Promise.all(
      headings.map(async (heading) => {
        const prompt = `Classify this documentation section heading.
Heading: "${heading}"

Respond with JSON: {"type": "intro|tutorial|reference|guide|example", "importance": 1-10}`;

        const response = await this.callAI(prompt, 50);
        
        try {
          const { type, importance } = JSON.parse(response);
          return { title: heading, type, importance };
        } catch {
          return { title: heading, type: 'guide', importance: 5 };
        }
      })
    );

    return classifications;
  }

  /**
   * Explain code blocks
   */
  private async explainCodeBlocks(content: string): Promise<any[]> {
    const codeBlocks = this.extractCodeBlocks(content);
    
    if (codeBlocks.length === 0) return [];

    // Limit to first 3 code blocks to save API costs
    const blocksToExplain = codeBlocks.slice(0, 3);
    
    const explanations = await Promise.all(
      blocksToExplain.map(async ({ code, language }) => {
        const prompt = `Explain this ${language} code in one sentence:

\`\`\`${language}
${code.substring(0, 500)}
\`\`\`

Also rate its complexity as "simple", "moderate", or "complex".
Respond with JSON: {"explanation": "...", "complexity": "..."}`;

        const response = await this.callAI(prompt, 100);
        
        try {
          const { explanation, complexity } = JSON.parse(response);
          return { code, language, explanation, complexity };
        } catch {
          return {
            code,
            language,
            explanation: 'Code example',
            complexity: 'moderate',
          };
        }
      })
    );

    return explanations;
  }

  /**
   * Score documentation quality
   */
  private async scoreQuality(content: string): Promise<any> {
    const prompt = `Rate this documentation quality (0-10) on:
- Completeness: Has all necessary information
- Clarity: Easy to understand
- Examples: Good code examples

Content:
${content.substring(0, 1500)}

Respond with JSON:
{
  "overall": 0-10,
  "completeness": 0-10,
  "clarity": 0-10,
  "examples": 0-10,
  "feedback": ["improvement 1", "improvement 2"]
}`;

    const response = await this.callAI(prompt, 200);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        overall: 7,
        completeness: 7,
        clarity: 7,
        examples: 7,
        feedback: ['Could not analyze'],
      };
    }
  }

  /**
   * Detect missing content
   */
  private async detectMissingContent(content: string, url: string): Promise<string[]> {
    const isAPI = url.includes('/api') || url.includes('/reference');
    
    const prompt = `What important information is missing from this ${isAPI ? 'API' : ''} documentation?

${content.substring(0, 1500)}

List 2-3 critical missing items as JSON array. Be specific.`;

    const response = await this.callAI(prompt, 150);
    
    try {
      return JSON.parse(response);
    } catch {
      return [];
    }
  }

  /**
   * Call AI provider
   */
  private async callAI(prompt: string, maxTokens: number): Promise<string> {
    if (this.config.provider === 'none') {
      return '';
    }

    if (this.config.provider === 'openai') {
      return await this.callOpenAI(prompt, maxTokens);
    }

    if (this.config.provider === 'anthropic') {
      return await this.callAnthropic(prompt, maxTokens);
    }

    if (this.config.provider === 'local') {
      return await this.callLocal(prompt, maxTokens);
    }

    throw new Error(`Unsupported AI provider: ${this.config.provider}`);
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string, maxTokens: number): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(prompt: string, maxTokens: number): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  }

  /**
   * Call local LLM (Ollama, LM Studio, etc.)
   */
  private async callLocal(prompt: string, maxTokens: number): Promise<string> {
    const baseUrl = this.config.baseUrl || 'http://localhost:11434';
    
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'llama2',
        prompt,
        max_tokens: maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Local LLM error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.trim();
  }

  /**
   * Extract headings from markdown
   */
  private extractHeadings(content: string): string[] {
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    const headings: string[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      headings.push(match[1]);
    }

    return headings;
  }

  /**
   * Extract code blocks from markdown
   */
  private extractCodeBlocks(content: string): Array<{ code: string; language: string }> {
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    const blocks: Array<{ code: string; language: string }> = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2],
      });
    }

    return blocks;
  }

  /**
   * Generate enhanced markdown with AI insights
   */
  generateEnhancedMarkdown(doc: AIEnhancedDoc): string {
    let output = '';

    // Add AI summary at top
    if (doc.summary) {
      output += `> **AI Summary:** ${doc.summary}\n\n`;
    }

    // Add key points
    if (doc.keyPoints && doc.keyPoints.length > 0) {
      output += `## 📌 Key Points\n\n`;
      doc.keyPoints.forEach(point => {
        output += `- ${point}\n`;
      });
      output += '\n';
    }

    // Add quality score
    if (doc.qualityScore) {
      const { overall, completeness, clarity, examples } = doc.qualityScore;
      output += `## 📊 Quality Score\n\n`;
      output += `- Overall: ${overall}/10\n`;
      output += `- Completeness: ${completeness}/10\n`;
      output += `- Clarity: ${clarity}/10\n`;
      output += `- Examples: ${examples}/10\n\n`;
    }

    // Original content
    output += doc.originalContent;

    // Add code explanations
    if (doc.codeExplanations && doc.codeExplanations.length > 0) {
      output += `\n## 💡 AI Code Explanations\n\n`;
      doc.codeExplanations.forEach(({ language, explanation, complexity }) => {
        output += `**${language}** (${complexity}): ${explanation}\n\n`;
      });
    }

    // Add missing content suggestions
    if (doc.missingContent && doc.missingContent.length > 0) {
      output += `\n## ⚠️ Suggested Additions\n\n`;
      doc.missingContent.forEach(item => {
        output += `- ${item}\n`;
      });
      output += '\n';
    }

    return output;
  }
}
