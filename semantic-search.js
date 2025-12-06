/**
 * Advanced Semantic Search Component
 * AI-powered search with vector embeddings, fuzzy matching, and intelligent ranking
 */

class SemanticSearchEngine {
    constructor() {
        this.index = null;
        this.documents = [];
        this.idf = new Map(); // Inverse document frequency
        this.searchHistory = [];
        this.maxHistorySize = 50;
    }

    /**
     * Build search index from scraped pages
     */
    async buildIndex(pages) {
        console.log(`Building semantic search index for ${pages.length} pages...`);
        
        this.documents = pages.map((page, idx) => ({
            id: idx,
            url: page.url,
            title: page.title,
            section: page.section || 'General',
            content: page.content,
            codeExamples: page.codeExamples || [],
            aiAnalysis: page.aiAnalysis,
            vector: null
        }));

        // Calculate TF-IDF
        await this.calculateTFIDF();

        // Create vectors for each document
        for (const doc of this.documents) {
            doc.vector = this.createDocumentVector(doc);
        }

        console.log('Search index built successfully');
        return this.documents.length;
    }

    /**
     * Calculate TF-IDF scores
     */
    async calculateTFIDF() {
        const termDocCount = new Map();

        // Count documents containing each term
        this.documents.forEach(doc => {
            const terms = new Set(this.tokenize(doc.content + ' ' + doc.title));
            terms.forEach(term => {
                termDocCount.set(term, (termDocCount.get(term) || 0) + 1);
            });
        });

        // Calculate IDF
        const totalDocs = this.documents.length;
        termDocCount.forEach((count, term) => {
            this.idf.set(term, Math.log(totalDocs / count));
        });
    }

    /**
     * Create document vector using TF-IDF
     */
    createDocumentVector(doc) {
        const text = `${doc.title} ${doc.title} ${doc.content}`; // Title weighted 2x
        const terms = this.tokenize(text);
        
        // Calculate term frequency
        const tf = new Map();
        terms.forEach(term => {
            tf.set(term, (tf.get(term) || 0) + 1);
        });

        // Create weighted vector
        const vector = new Map();
        tf.forEach((freq, term) => {
            const idf = this.idf.get(term) || 0;
            vector.set(term, freq * idf);
        });

        return vector;
    }

    /**
     * Tokenize text into searchable terms
     */
    tokenize(text) {
        // Remove code blocks for cleaner text search
        const textOnly = text.replace(/```[\s\S]*?```/g, ' ');
        
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
            'these', 'those', 'it', 'its', 'they', 'them', 'their'
        ]);

        return textOnly
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, ' ')
            .split(/\s+/)
            .filter(term => term.length > 2 && !stopWords.has(term));
    }

    /**
     * Perform semantic search
     */
    search(query, options = {}) {
        const {
            limit = 10,
            includeCode = true,
            section = null,
            minScore = 0.1
        } = options;

        if (!query || query.trim().length === 0) {
            return [];
        }

        // Track search
        this.addToSearchHistory(query);

        // Create query vector
        const queryVector = this.createQueryVector(query);

        // Score all documents
        const results = this.documents.map(doc => {
            let score = 0;

            // 1. Vector similarity (cosine similarity)
            score += this.cosineSimilarity(queryVector, doc.vector) * 100;

            // 2. Exact title match bonus
            if (doc.title.toLowerCase().includes(query.toLowerCase())) {
                score += 50;
            }

            // 3. Section match bonus
            if (doc.section.toLowerCase().includes(query.toLowerCase())) {
                score += 20;
            }

            // 4. Code search (if enabled)
            if (includeCode && doc.codeExamples.length > 0) {
                const codeMatch = doc.codeExamples.some(code =>
                    code.code.toLowerCase().includes(query.toLowerCase())
                );
                if (codeMatch) score += 30;
            }

            // 5. Fuzzy matching bonus
            const fuzzyScore = this.fuzzyMatch(query, doc.title + ' ' + doc.content.substring(0, 500));
            score += fuzzyScore * 10;

            // 6. Quality boost (if AI analysis available)
            if (doc.aiAnalysis && doc.aiAnalysis.qualityScore > 70) {
                score *= 1.1; // 10% boost for high-quality docs
            }

            // 7. Recency boost (if available)
            if (doc.lastModified) {
                const daysSinceModified = (Date.now() - doc.lastModified) / (1000 * 60 * 60 * 24);
                if (daysSinceModified < 30) {
                    score *= 1.05; // 5% boost for recent docs
                }
            }

            return {
                ...doc,
                score,
                preview: this.generatePreview(doc.content, query),
                matchType: this.getMatchType(query, doc)
            };
        });

        // Filter by section if specified
        let filteredResults = section
            ? results.filter(r => r.section === section)
            : results;

        // Filter by minimum score and sort
        return filteredResults
            .filter(r => r.score >= minScore)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * Create query vector
     */
    createQueryVector(query) {
        const terms = this.tokenize(query);
        const tf = new Map();
        
        terms.forEach(term => {
            tf.set(term, (tf.get(term) || 0) + 1);
        });

        const vector = new Map();
        tf.forEach((freq, term) => {
            const idf = this.idf.get(term) || 1;
            vector.set(term, freq * idf);
        });

        return vector;
    }

    /**
     * Calculate cosine similarity between vectors
     */
    cosineSimilarity(v1, v2) {
        let dotProduct = 0;
        let mag1 = 0;
        let mag2 = 0;

        // Get all terms
        const allTerms = new Set([...v1.keys(), ...v2.keys()]);

        allTerms.forEach(term => {
            const val1 = v1.get(term) || 0;
            const val2 = v2.get(term) || 0;
            
            dotProduct += val1 * val2;
            mag1 += val1 * val1;
            mag2 += val2 * val2;
        });

        if (mag1 === 0 || mag2 === 0) return 0;
        
        return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
    }

    /**
     * Fuzzy matching using Levenshtein-inspired algorithm
     */
    fuzzyMatch(query, text) {
        const queryLower = query.toLowerCase();
        const textLower = text.toLowerCase();

        // Quick exact match check
        if (textLower.includes(queryLower)) return 1.0;

        // Check for partial word matches
        const queryWords = queryLower.split(/\s+/);
        const textWords = textLower.split(/\s+/);

        let matches = 0;
        queryWords.forEach(qWord => {
            if (qWord.length < 3) return;
            
            const found = textWords.some(tWord => {
                // Exact match
                if (tWord === qWord) return true;
                
                // Starts with
                if (tWord.startsWith(qWord) || qWord.startsWith(tWord)) return true;
                
                // Similar length and small edit distance
                if (Math.abs(tWord.length - qWord.length) <= 2) {
                    return this.editDistance(qWord, tWord) <= 2;
                }
                
                return false;
            });

            if (found) matches++;
        });

        return queryWords.length > 0 ? matches / queryWords.length : 0;
    }

    /**
     * Calculate edit distance (Levenshtein)
     */
    editDistance(s1, s2) {
        const len1 = s1.length;
        const len2 = s2.length;
        const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) dp[i][0] = i;
        for (let j = 0; j <= len2; j++) dp[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (s1[i - 1] === s2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(
                        dp[i - 1][j] + 1,     // deletion
                        dp[i][j - 1] + 1,     // insertion
                        dp[i - 1][j - 1] + 1  // substitution
                    );
                }
            }
        }

        return dp[len1][len2];
    }

    /**
     * Generate contextual preview snippet
     */
    generatePreview(content, query, maxLength = 200) {
        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();

        // Find the position of the query
        const index = contentLower.indexOf(queryLower);

        if (index !== -1) {
            // Extract context around the match
            const start = Math.max(0, index - 50);
            const end = Math.min(content.length, index + query.length + 150);
            
            let preview = content.substring(start, end);
            
            // Clean up
            preview = preview.replace(/\n+/g, ' ').trim();
            
            if (start > 0) preview = '...' + preview;
            if (end < content.length) preview = preview + '...';
            
            // Highlight the match
            const regex = new RegExp(`(${query})`, 'gi');
            preview = preview.replace(regex, '<mark>$1</mark>');
            
            return preview;
        }

        // No exact match - return beginning
        let preview = content.substring(0, maxLength).replace(/\n+/g, ' ').trim();
        if (content.length > maxLength) preview += '...';
        
        return preview;
    }

    /**
     * Determine match type for display
     */
    getMatchType(query, doc) {
        const queryLower = query.toLowerCase();
        
        if (doc.title.toLowerCase() === queryLower) return 'exact-title';
        if (doc.title.toLowerCase().includes(queryLower)) return 'title';
        if (doc.section.toLowerCase().includes(queryLower)) return 'section';
        
        const codeMatch = doc.codeExamples?.some(code =>
            code.code.toLowerCase().includes(queryLower)
        );
        if (codeMatch) return 'code';
        
        if (doc.content.toLowerCase().includes(queryLower)) return 'content';
        
        return 'semantic';
    }

    /**
     * Get search suggestions
     */
    getSuggestions(partial, limit = 5) {
        if (partial.length < 2) return [];

        const suggestions = new Set();
        const partialLower = partial.toLowerCase();

        // From document titles
        this.documents.forEach(doc => {
            const words = doc.title.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.startsWith(partialLower) && word.length > partial.length) {
                    suggestions.add(word);
                }
            });
        });

        // From search history
        this.searchHistory.forEach(query => {
            const words = query.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.startsWith(partialLower) && word.length > partial.length) {
                    suggestions.add(word);
                }
            });
        });

        return Array.from(suggestions).slice(0, limit);
    }

    /**
     * Get popular searches
     */
    getPopularSearches(limit = 5) {
        const counts = new Map();
        
        this.searchHistory.forEach(query => {
            counts.set(query, (counts.get(query) || 0) + 1);
        });

        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([query, count]) => ({ query, count }));
    }

    /**
     * Add to search history
     */
    addToSearchHistory(query) {
        this.searchHistory.unshift(query);
        if (this.searchHistory.length > this.maxHistorySize) {
            this.searchHistory.pop();
        }
    }

    /**
     * Get available sections for filtering
     */
    getSections() {
        const sections = new Set();
        this.documents.forEach(doc => {
            if (doc.section) sections.add(doc.section);
        });
        return Array.from(sections).sort();
    }

    /**
     * Export index for persistence
     */
    exportIndex() {
        return {
            documents: this.documents.map(doc => ({
                id: doc.id,
                url: doc.url,
                title: doc.title,
                section: doc.section,
                content: doc.content.substring(0, 1000), // Truncate for size
                vector: Array.from(doc.vector.entries())
            })),
            idf: Array.from(this.idf.entries()),
            version: '1.0'
        };
    }

    /**
     * Import index from persisted data
     */
    importIndex(data) {
        if (data.version !== '1.0') {
            throw new Error('Incompatible index version');
        }

        this.documents = data.documents.map(doc => ({
            ...doc,
            vector: new Map(doc.vector)
        }));

        this.idf = new Map(data.idf);
        
        console.log(`Imported index with ${this.documents.length} documents`);
    }
}

// Export
window.SemanticSearchEngine = SemanticSearchEngine;
