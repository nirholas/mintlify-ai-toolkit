/**
 * Integration Layer - Connects all advanced features to the main app
 * AI Enhancement, Real-time Preview, and Semantic Search
 */

(function() {
    'use strict';

    // Initialize feature managers
    let aiEnhancer = null;
    let searchEngine = null;
    let previewManager = null;
    let hotReload = null;

    // Wait for DOM and all scripts to load
    window.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Initializing advanced features...');

        // Initialize AI enhancer
        if (window.AIDocEnhancer) {
            aiEnhancer = new window.AIDocEnhancer();
            console.log('✓ AI Enhancer initialized');
        }

        // Initialize semantic search
        if (window.SemanticSearchEngine) {
            searchEngine = new window.SemanticSearchEngine();
            console.log('✓ Semantic Search initialized');
        }

        // Initialize preview manager
        if (window.RealtimePreview && window.HotReloadManager) {
            previewManager = new window.RealtimePreview();
            hotReload = new window.HotReloadManager(previewManager);
            console.log('✓ Real-time Preview initialized');
        }

        // Setup UI event listeners
        setupUIEventListeners();

        // Integrate with main scraper if available
        integrateWithMainApp();
    });

    /**
     * Setup UI event listeners for new features
     */
    function setupUIEventListeners() {
        // Preview button
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn && previewManager) {
            previewBtn.addEventListener('click', () => {
                const success = previewManager.initPreview();
                if (success) {
                    showNotification('✓ Preview window opened', 'success');
                }
            });
        }

        // Search button
        const searchBtn = document.getElementById('searchBtn');
        const searchModal = document.getElementById('searchModal');
        const searchClose = document.getElementById('searchClose');
        const searchInput = document.getElementById('searchInput');

        if (searchBtn && searchModal) {
            searchBtn.addEventListener('click', () => {
                if (!searchEngine || !searchEngine.documents || searchEngine.documents.length === 0) {
                    showNotification('⚠️ No documents to search. Scrape docs first!', 'warning');
                    return;
                }
                searchModal.classList.add('active');
                setTimeout(() => searchInput && searchInput.focus(), 100);
            });
        }

        if (searchClose && searchModal) {
            searchClose.addEventListener('click', () => {
                searchModal.classList.remove('active');
            });
        }

        if (searchModal) {
            searchModal.addEventListener('click', (e) => {
                if (e.target === searchModal) {
                    searchModal.classList.remove('active');
                }
            });
        }

        // Search input with debounce
        if (searchInput && searchEngine) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    performSearch(e.target.value);
                }, 300);
            });

            // Keyboard shortcuts in search
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchModal.classList.remove('active');
                }
            });
        }

        // Search filters
        const filterBtns = document.querySelectorAll('.search-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (searchInput && searchInput.value) {
                    performSearch(searchInput.value);
                }
            });
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchEngine && searchEngine.documents && searchEngine.documents.length > 0) {
                    searchModal.classList.add('active');
                    setTimeout(() => searchInput && searchInput.focus(), 100);
                }
            }

            // Ctrl/Cmd + P for preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                if (previewManager) {
                    previewManager.initPreview();
                }
            }
        });
    }

    /**
     * Perform semantic search and display results
     */
    function performSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer || !searchEngine) return;

        if (!query || query.trim().length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <p style="font-size: 1.2rem; margin-bottom: 10px;">🔍</p>
                    <p>Start typing to search documentation...</p>
                </div>
            `;
            return;
        }

        // Get active filter
        const activeFilter = document.querySelector('.search-filter-btn.active');
        const filter = activeFilter ? activeFilter.dataset.filter : 'all';

        // Perform search
        const options = {
            limit: 20,
            includeCode: filter === 'all' || filter === 'code'
        };

        const results = searchEngine.search(query, options);

        // Display results
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <p style="font-size: 1.2rem; margin-bottom: 10px;">😕</p>
                    <p>No results found for "${query}"</p>
                    <p style="font-size: 0.9rem; margin-top: 10px; color: #999;">Try different keywords or check spelling</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = results.map(result => {
            const matchTypeIcons = {
                'exact-title': '🎯',
                'title': '📄',
                'section': '📁',
                'code': '💻',
                'content': '📝',
                'semantic': '🔍'
            };

            const icon = matchTypeIcons[result.matchType] || '📄';
            const score = Math.round(result.score);

            return `
                <div class="search-result-item" data-url="${result.url}">
                    <div class="search-result-title">
                        ${icon} ${result.title}
                        <span style="margin-left: auto; font-size: 0.8rem; color: #999;">${score}%</span>
                    </div>
                    <div class="search-result-meta">
                        <span>${result.section}</span> • 
                        <span>${result.matchType.replace('-', ' ')}</span>
                        ${result.aiAnalysis ? ` • Quality: ${result.aiAnalysis.qualityScore}/100` : ''}
                    </div>
                    <div class="search-result-preview">${result.preview}</div>
                </div>
            `;
        }).join('');

        // Add click handlers to results
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                const result = results.find(r => r.url === url);
                if (result && previewManager) {
                    previewManager.updatePreview({
                        title: result.title,
                        content: result.content,
                        url: result.url
                    }, result.aiAnalysis);
                    showNotification('✓ Preview updated', 'success');
                }
            });
        });
    }

    /**
     * Integrate with main scraper application
     */
    function integrateWithMainApp() {
        // Hook into scraper if MintlifyScraperUI exists
        const checkInterval = setInterval(() => {
            if (window.MintlifyScraperUI) {
                clearInterval(checkInterval);
                extendScraperUI();
                console.log('✓ Integrated with main scraper');
            }
        }, 100);

        // Give up after 5 seconds
        setTimeout(() => clearInterval(checkInterval), 5000);
    }

    /**
     * Extend the main scraper UI with advanced features
     */
    function extendScraperUI() {
        const ScraperUI = window.MintlifyScraperUI;
        if (!ScraperUI || !ScraperUI.prototype) return;

        // Store original scrapePage method
        const originalScrapePage = ScraperUI.prototype.scrapePage;

        // Extend scrapePage to include AI analysis
        ScraperUI.prototype.scrapePage = async function(url) {
            const page = await originalScrapePage.call(this, url);

            if (!page) return page;

            // Add AI enhancement if enabled
            if (this.config.aiEnhance && aiEnhancer) {
                try {
                    page.aiAnalysis = await aiEnhancer.analyzeQuality(
                        page.content,
                        page.title,
                        page.url
                    );

                    // Show quality score
                    if (page.aiAnalysis.qualityScore) {
                        this.updateStatus(
                            `📊 Quality: ${page.aiAnalysis.qualityScore}/100 | ` +
                            `Readability: ${page.aiAnalysis.readabilityScore}/100`,
                            'info'
                        );
                    }

                    // Show suggestions if quality is low
                    if (page.aiAnalysis.qualityScore < 60 && page.aiAnalysis.suggestions.length > 0) {
                        console.log(`💡 Suggestions for ${page.title}:`, page.aiAnalysis.suggestions);
                    }
                } catch (error) {
                    console.error('AI analysis error:', error);
                }
            }

            // Update preview if enabled
            if (this.config.realTimePreview && previewManager && hotReload) {
                hotReload.watch(page);
                hotReload.checkAndReload(page);
            }

            return page;
        };

        // Store original generateZip method
        const originalGenerateZip = ScraperUI.prototype.generateZip;

        // Extend generateZip to add search index
        ScraperUI.prototype.generateZip = async function() {
            // Build search index if enabled
            if (this.config.semanticSearch && searchEngine && this.pages.length > 0) {
                this.updateStatus('🔍 Building semantic search index...', 'info');
                try {
                    await searchEngine.buildIndex(this.pages);
                    
                    // Export index to localStorage for persistence
                    const indexData = searchEngine.exportIndex();
                    localStorage.setItem('searchIndex', JSON.stringify(indexData));
                    
                    this.addLog(`✓ Search index built: ${this.pages.length} pages indexed`, 'success');
                    
                    // Enable search button
                    const searchBtn = document.getElementById('searchBtn');
                    if (searchBtn) {
                        searchBtn.style.background = '#17a2b8';
                        searchBtn.disabled = false;
                    }
                } catch (error) {
                    console.error('Search index error:', error);
                }
            }

            // Generate AI summary if AI enhancement was enabled
            if (this.config.aiEnhance && aiEnhancer && this.pages.length > 0) {
                try {
                    const summary = aiEnhancer.generateAISummary(this.pages);
                    localStorage.setItem('aiSummary', JSON.stringify(summary));
                    console.log('📊 AI Summary:', summary);
                } catch (error) {
                    console.error('AI summary error:', error);
                }
            }

            // Call original method
            await originalGenerateZip.call(this);
        };
    }

    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10001;
            animation: slideIn 0.3s ease-out;
            font-size: 0.9rem;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Expose API for external use
    window.AdvancedFeatures = {
        aiEnhancer,
        searchEngine,
        previewManager,
        hotReload,
        search: (query) => searchEngine && searchEngine.search(query),
        preview: (page) => previewManager && previewManager.updatePreview(page),
        analyze: (content, title, url) => aiEnhancer && aiEnhancer.analyzeQuality(content, title, url)
    };

    console.log('✨ Advanced features ready!');
    console.log('Available features:', {
        aiEnhancement: !!aiEnhancer,
        semanticSearch: !!searchEngine,
        realtimePreview: !!previewManager,
        hotReload: !!hotReload
    });

})();
