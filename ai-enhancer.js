/**
 * AI-Powered Documentation Enhancement Module
 * Provides real-time quality analysis, content suggestions, and semantic search
 */

class AIDocEnhancer {
    constructor() {
        this.analysisCache = new Map();
        this.vectorIndex = [];
    }

    /**
     * Analyze documentation quality and provide suggestions
     */
    async analyzeQuality(content, title, url) {
        const cacheKey = `${url}:${content.length}`;
        if (this.analysisCache.has(cacheKey)) {
            return this.analysisCache.get(cacheKey);
        }

        const analysis = {
            qualityScore: 0,
            readabilityScore: 0,
            seoScore: 0,
            suggestions: [],
            detectedIssues: [],
            strengths: [],
            metrics: {}
        };

        // Extract metrics
        const metrics = this.extractMetrics(content);
        analysis.metrics = metrics;

        // Calculate quality score (0-100)
        let qualityPoints = 0;
        
        // Code examples (0-20 points)
        if (metrics.codeBlocks > 0) qualityPoints += 15;
        if (metrics.codeBlocks >= 3) qualityPoints += 5;
        
        // Document structure (0-25 points)
        if (metrics.headings >= 2) qualityPoints += 10;
        if (metrics.headings >= 5) qualityPoints += 10;
        if (metrics.lists >= 3) qualityPoints += 5;
        
        // Links and references (0-15 points)
        if (metrics.links > 0) qualityPoints += 8;
        if (metrics.links >= 5) qualityPoints += 7;
        
        // Tables (0-10 points)
        if (metrics.tables > 0) qualityPoints += 10;
        
        // Content length (0-20 points)
        if (metrics.wordCount >= 100 && metrics.wordCount <= 2000) qualityPoints += 15;
        if (metrics.wordCount >= 300) qualityPoints += 5;
        
        // Images (0-10 points)
        if (metrics.images > 0) qualityPoints += 5;
        if (metrics.images >= 3) qualityPoints += 5;
        
        analysis.qualityScore = Math.min(100, qualityPoints);

        // Generate suggestions
        this.generateSuggestions(analysis, metrics);

        // Calculate readability (Flesch Reading Ease)
        analysis.readabilityScore = this.calculateReadability(content, metrics);

        // Calculate SEO score
        analysis.seoScore = this.calculateSEO(title, metrics);

        // Identify strengths
        this.identifyStrengths(analysis, metrics);

        this.analysisCache.set(cacheKey, analysis);
        return analysis;
    }

    /**
     * Extract content metrics
     */
    extractMetrics(content) {
        return {
            wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
            charCount: content.length,
            codeBlocks: (content.match(/```[\s\S]*?```/g) || []).length,
            unspecifiedCodeBlocks: (content.match(/```\n/g) || []).length,
            headings: (content.match(/^#{1,6}\s.+$/gm) || []).length,
            h1Count: (content.match(/^#\s.+$/gm) || []).length,
            h2Count: (content.match(/^##\s.+$/gm) || []).length,
            links: (content.match(/\[.*?\]\(.*?\)/g) || []).length,
            internalLinks: (content.match(/\[.*?\]\(\/.*?\)/g) || []).length,
            externalLinks: (content.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length,
            lists: (content.match(/^\s*[-*+]\s/gm) || []).length,
            orderedLists: (content.match(/^\s*\d+\.\s/gm) || []).length,
            tables: (content.match(/\|.*\|/g) || []).length / 3, // Rough estimate
            images: (content.match(/!\[.*?\]\(.*?\)/g) || []).length,
            sentences: content.split(/[.!?]+\s/).filter(s => s.length > 0).length,
            paragraphs: content.split(/\n\n+/).filter(p => p.trim().length > 0).length
        };
    }

    /**
     * Generate actionable suggestions
     */
    generateSuggestions(analysis, metrics) {
        // Code examples
        if (metrics.codeBlocks === 0 && metrics.wordCount > 200) {
            analysis.suggestions.push({
                type: 'code',
                priority: 'high',
                message: '💡 Add code examples to illustrate concepts',
                action: 'Add at least one code block with ```language syntax'
            });
        }

        if (metrics.unspecifiedCodeBlocks > 0) {
            analysis.suggestions.push({
                type: 'code',
                priority: 'medium',
                message: `🏷️ ${metrics.unspecifiedCodeBlocks} code block(s) missing language specification`,
                action: 'Add language after ``` (e.g., ```javascript)'
            });
        }

        // Structure
        if (metrics.headings < 2 && metrics.wordCount > 300) {
            analysis.suggestions.push({
                type: 'structure',
                priority: 'high',
                message: '📋 Add more section headings to improve structure',
                action: 'Break content into logical sections with ## headings'
            });
        }

        if (metrics.h1Count > 1) {
            analysis.detectedIssues.push({
                type: 'structure',
                severity: 'warning',
                message: '⚠️ Multiple H1 headings detected',
                details: 'Use only one H1 (#) per page for better SEO'
            });
        }

        // Links
        if (metrics.links === 0 && metrics.wordCount > 200) {
            analysis.suggestions.push({
                type: 'links',
                priority: 'medium',
                message: '🔗 Add links to related documentation or external resources',
                action: 'Link to related topics and authoritative sources'
            });
        }

        // Content length
        if (metrics.wordCount < 100) {
            analysis.suggestions.push({
                type: 'content',
                priority: 'high',
                message: '📝 Content seems brief - consider expanding with more details',
                action: 'Add explanations, examples, and use cases'
            });
        }

        if (metrics.wordCount > 3000) {
            analysis.suggestions.push({
                type: 'content',
                priority: 'medium',
                message: '✂️ Consider breaking this into multiple pages',
                action: 'Split long content for better readability and navigation'
            });
        }

        // Tables
        if (metrics.tables === 0 && (content.includes('parameter') || content.includes('option') || content.includes('property'))) {
            analysis.suggestions.push({
                type: 'formatting',
                priority: 'low',
                message: '📊 Consider using tables for structured data',
                action: 'Format parameters/options as markdown tables'
            });
        }

        // Lists
        if (metrics.lists === 0 && metrics.wordCount > 500) {
            analysis.suggestions.push({
                type: 'formatting',
                priority: 'low',
                message: '📌 Use lists to break up dense text',
                action: 'Convert sequences or steps into bullet/numbered lists'
            });
        }
    }

    /**
     * Identify content strengths
     */
    identifyStrengths(analysis, metrics) {
        if (metrics.codeBlocks >= 3) {
            analysis.strengths.push('✅ Rich code examples');
        }
        if (metrics.headings >= 5) {
            analysis.strengths.push('✅ Well-structured with clear sections');
        }
        if (metrics.links >= 5) {
            analysis.strengths.push('✅ Well-referenced with helpful links');
        }
        if (metrics.tables > 0) {
            analysis.strengths.push('✅ Uses tables for structured data');
        }
        if (metrics.images > 0) {
            analysis.strengths.push('✅ Includes visual aids');
        }
        if (metrics.wordCount >= 300 && metrics.wordCount <= 1500) {
            analysis.strengths.push('✅ Appropriate content length');
        }
    }

    /**
     * Calculate readability score (Flesch Reading Ease)
     */
    calculateReadability(content, metrics) {
        if (metrics.sentences === 0 || metrics.wordCount === 0) return 0;

        const avgWordsPerSentence = metrics.wordCount / metrics.sentences;
        const avgSyllablesPerWord = this.estimateSyllables(content, metrics.wordCount);
        
        // Flesch Reading Ease formula
        const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Estimate syllables per word (rough approximation)
     */
    estimateSyllables(content, wordCount) {
        // Simple estimation: count vowel groups
        const vowelGroups = content.match(/[aeiou]+/gi) || [];
        return vowelGroups.length / wordCount || 1.5;
    }

    /**
     * Calculate SEO score
     */
    calculateSEO(title, metrics) {
        let score = 0;

        // Title (0-25 points)
        if (title && title.length >= 10 && title.length <= 70) score += 25;
        else if (title) score += 10;

        // Headings (0-25 points)
        if (metrics.headings >= 3) score += 25;
        else if (metrics.headings > 0) score += 15;

        // Links (0-25 points)
        if (metrics.links >= 3) score += 25;
        else if (metrics.links > 0) score += 15;

        // Content length (0-25 points)
        if (metrics.wordCount >= 300) score += 25;
        else if (metrics.wordCount >= 150) score += 15;

        return score;
    }

    /**
     * Create vector embeddings for semantic search
     */
    async createVectorIndex(pages) {
        this.vectorIndex = [];

        for (const page of pages) {
            const vector = await this.createVector(page);
            this.vectorIndex.push(vector);
        }

        return this.vectorIndex;
    }

    /**
     * Create vector representation of a page (simplified TF-IDF)
     */
    async createVector(page) {
        // Extract and normalize terms
        const terms = this.extractTerms(page.content);
        
        // Calculate term frequency
        const termFreq = {};
        terms.forEach(term => {
            termFreq[term] = (termFreq[term] || 0) + 1;
        });

        // Get top terms
        const topTerms = Object.entries(termFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(([term, freq]) => ({ term, freq }));

        return {
            url: page.url,
            title: page.title,
            section: page.section,
            terms: topTerms,
            preview: page.content.substring(0, 200).replace(/\n/g, ' ').trim(),
            wordCount: page.content.split(/\s+/).length,
            aiAnalysis: page.aiAnalysis
        };
    }

    /**
     * Extract meaningful terms from content
     */
    extractTerms(content) {
        // Remove code blocks
        const textOnly = content.replace(/```[\s\S]*?```/g, '');
        
        // Common stop words to filter out
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        ]);

        return textOnly
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, ' ')
            .split(/\s+/)
            .filter(term => term.length > 3 && !stopWords.has(term));
    }

    /**
     * Search vector index semantically
     */
    semanticSearch(query, limit = 10) {
        const queryTerms = new Set(this.extractTerms(query));
        
        // Score each document
        const scored = this.vectorIndex.map(doc => {
            let score = 0;
            
            // Term matching
            doc.terms.forEach(({ term, freq }) => {
                if (queryTerms.has(term)) {
                    score += freq;
                }
            });

            // Boost if query appears in title
            if (doc.title.toLowerCase().includes(query.toLowerCase())) {
                score += 50;
            }

            return { ...doc, score };
        });

        // Sort and return top results
        return scored
            .filter(doc => doc.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * Detect broken or relative links
     */
    detectLinkIssues(content, baseUrl) {
        const issues = [];
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;

        while ((match = linkRegex.exec(content)) !== null) {
            const text = match[1];
            const url = match[2];

            if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
                issues.push({
                    type: 'relative-link',
                    text,
                    url,
                    suggestion: `Consider converting to absolute URL: ${new URL(url, baseUrl).href}`
                });
            }

            if (url.startsWith('http://')) {
                issues.push({
                    type: 'insecure-link',
                    text,
                    url,
                    suggestion: 'Use HTTPS instead of HTTP for security'
                });
            }
        }

        return issues;
    }

    /**
     * Generate AI-optimized summary for LLMs
     */
    generateAISummary(pages) {
        const totalWords = pages.reduce((sum, p) => sum + (p.content?.split(/\s+/).length || 0), 0);
        const totalCode = pages.reduce((sum, p) => sum + (p.codeExamples?.length || 0), 0);
        
        const summary = {
            overview: {
                totalPages: pages.length,
                totalWords,
                totalCodeBlocks: totalCode,
                avgWordsPerPage: Math.round(totalWords / pages.length)
            },
            sections: [],
            topTerms: [],
            aiReadiness: {
                score: 0,
                factors: []
            }
        };

        // Group by section
        const sections = {};
        pages.forEach(page => {
            const section = page.section || 'General';
            if (!sections[section]) {
                sections[section] = {
                    name: section,
                    pages: [],
                    wordCount: 0,
                    codeBlocks: 0
                };
            }
            sections[section].pages.push(page.title);
            sections[section].wordCount += page.content?.split(/\s+/).length || 0;
            sections[section].codeBlocks += page.codeExamples?.length || 0;
        });

        summary.sections = Object.values(sections);

        // Calculate AI readiness score
        let aiScore = 0;
        if (totalCode > 10) { aiScore += 25; summary.aiReadiness.factors.push('Rich code examples'); }
        if (pages.length >= 10) { aiScore += 25; summary.aiReadiness.factors.push('Comprehensive coverage'); }
        if (totalWords >= 5000) { aiScore += 25; summary.aiReadiness.factors.push('Detailed documentation'); }
        if (this.vectorIndex.length > 0) { aiScore += 25; summary.aiReadiness.factors.push('Semantic search ready'); }
        
        summary.aiReadiness.score = aiScore;

        return summary;
    }
}

// Export for use in app.js
window.AIDocEnhancer = AIDocEnhancer;
