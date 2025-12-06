/**
 * Mintlify Docs Scraper - Frontend Application
 * Browser-based scraper with zip download functionality
 */

class MintlifyScraperUI {
    constructor() {
        this.pages = [];
        this.visitedUrls = new Set();
        this.isRunning = false;
        this.baseUrl = '';
        this.config = {
            includeApiRef: true,
            useTrieveApi: true,
            maxConcurrent: 3,
            delayMs: 500,
            includeTables: true,
            includeImages: true,
            aiOptimized: true,
            web3Focus: false,
        };
        this.stats = {
            pages: 0,
            sections: new Set(),
            codeBlocks: 0,
        };
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const form = document.getElementById('scrapeForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.startScraping();
        });
    }

    async startScraping() {
        const urlInput = document.getElementById('docsUrl');
        const url = urlInput.value.trim();
        
        if (!url) {
            this.addLog('Please enter a valid URL', 'error');
            return;
        }

        this.baseUrl = url;
        this.config.includeApiRef = document.getElementById('includeApiRef').checked;
        this.config.useTrieveApi = document.getElementById('useTrieveApi').checked;
        this.config.maxConcurrent = parseInt(document.getElementById('maxConcurrent')?.value || 3);
        this.config.delayMs = parseInt(document.getElementById('delayMs')?.value || 500);
        this.config.includeTables = document.getElementById('includeTables')?.checked ?? true;
        this.config.includeImages = document.getElementById('includeImages')?.checked ?? true;
        this.config.aiOptimized = document.getElementById('aiOptimized')?.checked ?? true;
        this.config.web3Focus = document.getElementById('web3Focus')?.checked ?? false;
        this.config.aiEnhance = document.getElementById('aiEnhance')?.checked ?? true;
        this.config.realTimePreview = document.getElementById('realTimePreview')?.checked ?? false;
        this.config.semanticSearch = document.getElementById('semanticSearch')?.checked ?? true;
        
        // Reset state
        this.pages = [];
        this.visitedUrls.clear();
        this.isRunning = true;
        this.stats = {
            pages: 0,
            sections: new Set(),
            codeBlocks: 0,
        };
        
        // Update UI
        const scrapeBtn = document.getElementById('scrapeBtn');
        const progressContainer = document.getElementById('progressContainer');
        const statsContainer = document.getElementById('statsContainer');
        const logContainer = document.getElementById('logContainer');
        
        if (scrapeBtn) {
            scrapeBtn.disabled = true;
            scrapeBtn.textContent = 'Scraping...';
        }
        if (progressContainer) progressContainer.classList.add('visible');
        if (statsContainer) statsContainer.classList.add('visible');
        if (logContainer) logContainer.innerHTML = '';
        this.updateStats();
        
        // Add to history
        if (window.addToHistory) {
            window.addToHistory(url);
        }
        
        try {
            this.addLog(`Starting scrape for: ${url}`, 'success');
            
            // Try Trieve API first if enabled
            if (this.config.useTrieveApi) {
                this.addLog('Attempting Trieve API method...', 'info');
                const trieveSuccess = await this.scrapeViaTrieveApi();
                
                if (trieveSuccess) {
                    this.addLog('✓ Trieve API scraping successful!', 'success');
                    await this.generateZip();
                    return;
                }
                
                this.addLog('⚠ Trieve API unavailable, using HTML scraping...', 'warning');
            }
            
            // Fallback to HTML scraping
            await this.scrapeViaHTML();
            await this.generateZip();
            
        } catch (error) {
            this.addLog(`Error: ${error.message}`, 'error');
            console.error(error);
        } finally {
            this.isRunning = false;
            const scrapeBtn = document.getElementById('scrapeBtn');
            if (scrapeBtn) {
                scrapeBtn.disabled = false;
                scrapeBtn.textContent = 'Start Scraping';
            }
        }
    }

    async scrapeViaTrieveApi() {
        try {
            // Fetch homepage to detect API key
            this.updateProgress(10, 'Detecting Trieve API configuration...');
            
            const response = await this.fetchWithCORS(this.baseUrl);
            const html = await response.text();
            
            // Try to find Trieve API key
            const apiKeyMatch = html.match(/['"]tr-[a-zA-Z0-9-_]+['"]/g);
            if (!apiKeyMatch) {
                this.addLog('Trieve API key not found', 'warning');
                return false;
            }
            
            const apiKey = apiKeyMatch[0].replace(/['"]/g, '');
            this.addLog(`✓ Found API key: ${apiKey.substring(0, 10)}...`, 'success');
            
            // Find dataset ID (UUID)
            const datasetMatches = html.match(/['"]([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})['"]/g);
            if (!datasetMatches) {
                this.addLog('Dataset ID not found', 'warning');
                return false;
            }
            
            const datasetId = datasetMatches[0].replace(/['"]/g, '');
            this.addLog(`✓ Found dataset ID: ${datasetId}`, 'success');
            
            // Fetch groups
            this.updateProgress(30, 'Fetching documentation groups...');
            const groups = await this.fetchTrieveGroups(apiKey, datasetId);
            this.addLog(`✓ Found ${groups.length} documentation sections`, 'success');
            
            // Process each group
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                const progress = 30 + ((i / groups.length) * 60);
                this.updateProgress(progress, `Processing: ${group.name}...`);
                
                await this.processTrieveGroup(apiKey, datasetId, group);
            }
            
            this.updateProgress(100, 'Trieve API scraping complete!');
            return true;
            
        } catch (error) {
            this.addLog(`Trieve API error: ${error.message}`, 'warning');
            return false;
        }
    }

    async fetchTrieveGroups(apiKey, datasetId) {
        const groups = [];
        let page = 1;
        const pageSize = 100;
        
        while (true) {
            try {
                const url = `https://api.trieve.ai/api/chunk_group/${datasetId}/${page}/${pageSize}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': apiKey,
                        'TR-Dataset': datasetId,
                    },
                });
                
                if (!response.ok) break;
                
                const data = await response.json();
                if (!data.groups || data.groups.length === 0) break;
                
                groups.push(...data.groups);
                
                if (data.groups.length < pageSize) break;
                page++;
                
            } catch (error) {
                break;
            }
        }
        
        return groups;
    }

    async processTrieveGroup(apiKey, datasetId, group) {
        try {
            const url = `https://api.trieve.ai/api/chunk_group/${group.id}/${datasetId}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': apiKey,
                    'TR-Dataset': datasetId,
                },
            });
            
            if (!response.ok) return;
            
            const data = await response.json();
            const chunks = data.chunks || [];
            
            // Convert chunks to markdown
            for (const chunk of chunks) {
                const content = this.convertChunkToMarkdown(chunk);
                const urlPath = chunk.link || chunk.tracking_id || '';
                const codeExamples = this.extractCodeFromHTML(chunk.chunk_html || '');
                
                this.pages.push({
                    url: `${this.baseUrl}${urlPath}`,
                    title: group.name,
                    content: content,
                    section: group.name,
                    codeExamples: codeExamples,
                });
                
                // Update stats
                this.stats.pages++;
                this.stats.sections.add(group.name);
                this.stats.codeBlocks += codeExamples.length;
                this.updateStats();
            }
            
            this.addLog(`✓ Processed ${chunks.length} chunks from ${group.name}`);
            
        } catch (error) {
            this.addLog(`Error processing group ${group.name}: ${error.message}`, 'warning');
        }
    }

    convertChunkToMarkdown(chunk) {
        if (!chunk.chunk_html) return '';
        
        // Create a temporary element to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = chunk.chunk_html;
        
        // Extract text and convert to markdown
        return this.htmlToMarkdown(temp);
    }

    async scrapeViaHTML() {
        this.updateProgress(10, 'Discovering pages from sitemap...');
        
        // Get all URLs from sitemap
        const urls = await this.discoverUrlsFromSitemap();
        
        if (urls.length === 0) {
            throw new Error('No URLs found in sitemap');
        }
        
        this.addLog(`✓ Found ${urls.length} pages to scrape`, 'success');
        
        // Scrape each URL
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const progress = 10 + ((i / urls.length) * 80);
            this.updateProgress(progress, `Scraping page ${i + 1}/${urls.length}...`);
            
            try {
                await this.scrapePage(url);
                this.addLog(`✓ Scraped: ${url}`);
            } catch (error) {
                this.addLog(`✗ Failed to scrape ${url}: ${error.message}`, 'warning');
            }
            
            // Rate limiting
            await this.sleep(this.config.delayMs);
        }
        
        this.updateProgress(100, 'HTML scraping complete!');
    }

    async discoverUrlsFromSitemap() {
        const urls = [];
        
        try {
            // Try sitemap.xml
            const sitemapUrl = `${this.baseUrl}/sitemap.xml`;
            const response = await this.fetchWithCORS(sitemapUrl);
            const text = await response.text();
            
            // Parse XML and extract URLs
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            const urlElements = xml.querySelectorAll('url > loc');
            
            urlElements.forEach(el => {
                const url = el.textContent.trim();
                if (url && this.shouldIncludeUrl(url)) {
                    urls.push(url);
                }
            });
            
        } catch (error) {
            this.addLog('Could not fetch sitemap.xml, trying alternative discovery...', 'warning');
            // Fallback: just try the base URL
            urls.push(this.baseUrl);
        }
        
        return urls;
    }

    shouldIncludeUrl(url) {
        // Filter out non-docs URLs
        if (!this.config.includeApiRef && url.includes('/api-reference')) {
            return false;
        }
        
        // Only include URLs from the same domain
        return url.startsWith(this.baseUrl);
    }

    async scrapePage(url) {
        if (this.visitedUrls.has(url)) return;
        this.visitedUrls.add(url);
        
        try {
            const response = await this.fetchWithCORS(url);
            const html = await response.text();
            
            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract content
            const title = this.extractTitle(doc);
            const content = this.extractContent(doc);
            const codeExamples = this.extractCodeExamples(doc);
            const section = this.extractSection(url);
            
            // Extract Web3 data if enabled
            let web3Data = null;
            if (this.config.web3Focus) {
                web3Data = this.extractWeb3Data(content, codeExamples);
            }
            
            this.pages.push({
                url,
                title,
                content,
                section,
                codeExamples,
                web3Data,
            });
            
            // Update stats
            this.stats.pages++;
            this.stats.sections.add(section);
            this.stats.codeBlocks += codeExamples.length;
            this.updateStats();
            
        } catch (error) {
            throw new Error(`Failed to fetch ${url}: ${error.message}`);
        }
    }

    extractTitle(doc) {
        const h1 = doc.querySelector('h1');
        if (h1) return h1.textContent.trim();
        
        const title = doc.querySelector('title');
        return title ? title.textContent.trim() : 'Untitled';
    }

    extractContent(doc) {
        // Find main content area (Mintlify uses specific selectors)
        const contentSelectors = [
            'main',
            '[role="main"]',
            '.docs-content',
            'article',
            '#content',
        ];
        
        let mainContent = null;
        for (const selector of contentSelectors) {
            mainContent = doc.querySelector(selector);
            if (mainContent) break;
        }
        
        if (!mainContent) {
            mainContent = doc.body;
        }
        
        // Convert to markdown
        return this.htmlToMarkdown(mainContent);
    }

    htmlToMarkdown(element) {
        let markdown = '';
        
        for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) markdown += text + ' ';
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = node.tagName.toLowerCase();
                
                switch (tag) {
                    case 'h1':
                        markdown += `\n# ${node.textContent.trim()}\n\n`;
                        break;
                    case 'h2':
                        markdown += `\n## ${node.textContent.trim()}\n\n`;
                        break;
                    case 'h3':
                        markdown += `\n### ${node.textContent.trim()}\n\n`;
                        break;
                    case 'h4':
                        markdown += `\n#### ${node.textContent.trim()}\n\n`;
                        break;
                    case 'h5':
                        markdown += `\n##### ${node.textContent.trim()}\n\n`;
                        break;
                    case 'h6':
                        markdown += `\n###### ${node.textContent.trim()}\n\n`;
                        break;
                    case 'p':
                        markdown += `${node.textContent.trim()}\n\n`;
                        break;
                    case 'a':
                        const href = node.getAttribute('href') || '#';
                        markdown += `[${node.textContent.trim()}](${href})`;
                        break;
                    case 'code':
                        if (node.parentElement.tagName.toLowerCase() === 'pre') {
                            const lang = node.className.replace(/language-/, '') || '';
                            markdown += `\`\`\`${lang}\n${node.textContent}\n\`\`\`\n\n`;
                        } else {
                            markdown += `\`${node.textContent}\``;
                        }
                        break;
                    case 'ul':
                    case 'ol':
                        markdown += this.listToMarkdown(node, tag === 'ol');
                        break;
                    case 'table':
                        if (this.config.includeTables) {
                            markdown += this.tableToMarkdown(node);
                        }
                        break;
                    case 'li':
                        // Handled by ul/ol
                        break;
                    case 'blockquote':
                        markdown += `> ${node.textContent.trim()}\n\n`;
                        break;
                    case 'strong':
                    case 'b':
                        markdown += `**${node.textContent.trim()}**`;
                        break;
                    case 'em':
                    case 'i':
                        markdown += `*${node.textContent.trim()}*`;
                        break;
                    case 'img':
                        if (this.config.includeImages) {
                            const alt = node.getAttribute('alt') || '';
                            const src = node.getAttribute('src') || '';
                            markdown += `![${alt}](${src})\n\n`;
                        }
                        break;
                    case 'hr':
                        markdown += `\n---\n\n`;
                        break;
                    case 'pre':
                        // Handled by code
                        break;
                    case 'script':
                    case 'style':
                    case 'nav':
                    case 'footer':
                    case 'header':
                        // Skip these
                        break;
                    default:
                        markdown += this.htmlToMarkdown(node);
                }
            }
        }
        
        return markdown;
    }

    tableToMarkdown(table) {
        let markdown = '\n';
        const rows = table.querySelectorAll('tr');
        
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('th, td');
            const cellValues = Array.from(cells).map(cell => cell.textContent.trim());
            markdown += `| ${cellValues.join(' | ')} |\n`;
            
            // Add separator after header row
            if (index === 0 && row.querySelector('th')) {
                markdown += `| ${cellValues.map(() => '---').join(' | ')} |\n`;
            }
        });
        
        markdown += '\n';
        return markdown;
    }

    listToMarkdown(listElement, isOrdered) {
        let markdown = '';
        const items = listElement.querySelectorAll(':scope > li');
        
        items.forEach((item, index) => {
            const prefix = isOrdered ? `${index + 1}. ` : '- ';
            markdown += `${prefix}${item.textContent.trim()}\n`;
        });
        
        markdown += '\n';
        return markdown;
    }

    extractCodeExamples(doc) {
        const examples = [];
        const codeBlocks = doc.querySelectorAll('pre code, .code-block, [class*="language-"]');
        
        codeBlocks.forEach(block => {
            const code = block.textContent.trim();
            if (!code) return;
            
            const lang = this.detectLanguage(block);
            examples.push({ language: lang, code });
        });
        
        return examples;
    }

    extractCodeFromHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return this.extractCodeExamples(temp);
    }

    detectLanguage(element) {
        const className = element.className || '';
        
        const langMatch = className.match(/language-(\w+)/);
        if (langMatch) return langMatch[1];
        
        const code = element.textContent.toLowerCase();
        if (code.includes('function') || code.includes('const ') || code.includes('let ')) return 'javascript';
        if (code.includes('def ') || code.includes('import ')) return 'python';
        if (code.includes('curl ') || code.includes('#!/bin/bash')) return 'bash';
        if (code.includes('{') && code.includes('}')) return 'json';
        
        return 'text';
    }

    extractSection(url) {
        const path = url.replace(this.baseUrl, '').split('/').filter(Boolean);
        return path[0] || 'General';
    }

    async generateZip() {
        this.updateProgress(90, 'Generating ZIP file...');
        this.addLog('Creating documentation files...', 'info');
        
        const zip = new JSZip();
        
        // Group pages by section
        const sections = {};
        this.pages.forEach(page => {
            const section = page.section || 'General';
            if (!sections[section]) sections[section] = [];
            sections[section].push(page);
        });
        
        // Create COMPLETE.md with all content
        let completeContent = `# Complete Documentation\n\nScraped from: ${this.baseUrl}\n\n`;
        completeContent += `Total pages: ${this.pages.length}\n\n`;
        completeContent += `---\n\n`;
        
        // Create section files
        for (const [section, pages] of Object.entries(sections)) {
            let sectionContent = `# ${section}\n\n`;
            
            pages.forEach(page => {
                sectionContent += `## ${page.title}\n\n`;
                sectionContent += `Source: ${page.url}\n\n`;
                sectionContent += `${page.content}\n\n`;
                
                if (page.codeExamples && page.codeExamples.length > 0) {
                    sectionContent += `### Code Examples\n\n`;
                    page.codeExamples.forEach(ex => {
                        sectionContent += `\`\`\`${ex.language}\n${ex.code}\n\`\`\`\n\n`;
                    });
                }
                
                sectionContent += `---\n\n`;
                
                // Add to complete file
                completeContent += `## ${page.title}\n\n`;
                completeContent += `${page.content}\n\n`;
            });
            
            // Add section file to zip
            const safeSectionName = section.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            zip.file(`${safeSectionName}.md`, sectionContent);
        }
        
        // Add complete file
        zip.file('COMPLETE.md', completeContent);
        
        // Add README
        const readme = this.generateReadme();
        zip.file('README.md', readme);
        
        // Generate and download zip
        this.addLog('Generating ZIP archive...', 'info');
        const blob = await zip.generateAsync({ type: 'blob' });
        
        const domain = new URL(this.baseUrl).hostname.replace('docs.', '');
        const filename = `${domain}-docs.zip`;
        
        this.downloadBlob(blob, filename);
        
        this.updateProgress(100, 'Complete! ZIP file downloaded.');
        this.addLog(`✓ Downloaded: ${filename}`, 'success');
        this.addLog(`✓ Total pages scraped: ${this.pages.length}`, 'success');
    }

    extractWeb3Data(content, codeExamples) {
        const web3Data = {
            contractAddresses: [],
            chainIds: [],
            tokens: [],
            protocols: [],
        };
        
        // Extract Ethereum addresses (0x followed by 40 hex chars)
        const addressRegex = /0x[a-fA-F0-9]{40}/g;
        const addresses = content.match(addressRegex) || [];
        web3Data.contractAddresses = [...new Set(addresses)];
        
        // Extract chain IDs
        const chainRegex = /chain[\s_-]?id[:\s]+([0-9]+)/gi;
        let match;
        while ((match = chainRegex.exec(content)) !== null) {
            web3Data.chainIds.push(match[1]);
        }
        web3Data.chainIds = [...new Set(web3Data.chainIds)];
        
        // Detect common tokens
        const tokenKeywords = ['ETH', 'USDC', 'USDT', 'DAI', 'WETH', 'BTC', 'MATIC'];
        tokenKeywords.forEach(token => {
            if (content.includes(token)) {
                web3Data.tokens.push(token);
            }
        });
        
        // Detect protocols
        const protocolKeywords = ['Uniswap', 'Aave', 'Compound', 'Curve', 'Balancer', 'Chainlink', 'TheGraph'];
        protocolKeywords.forEach(protocol => {
            if (content.toLowerCase().includes(protocol.toLowerCase())) {
                web3Data.protocols.push(protocol);
            }
        });
        
        return web3Data;
    }

    generateReadme() {
        const sections = Object.keys(this.pages.reduce((acc, p) => ({ ...acc, [p.section]: true }), {}));
        const totalCodeBlocks = this.pages.reduce((sum, p) => sum + (p.codeExamples?.length || 0), 0);
        
        // Aggregate Web3 data if enabled
        let web3Summary = '';
        if (this.config.web3Focus) {
            const allAddresses = new Set();
            const allChainIds = new Set();
            const allTokens = new Set();
            const allProtocols = new Set();
            
            this.pages.forEach(page => {
                if (page.web3Data) {
                    page.web3Data.contractAddresses?.forEach(addr => allAddresses.add(addr));
                    page.web3Data.chainIds?.forEach(id => allChainIds.add(id));
                    page.web3Data.tokens?.forEach(token => allTokens.add(token));
                    page.web3Data.protocols?.forEach(proto => allProtocols.add(proto));
                }
            });
            
            if (allAddresses.size > 0 || allTokens.size > 0 || allProtocols.size > 0) {
                web3Summary = `\n## 🌐 Web3/Crypto Data Detected\n\n`;
                
                if (allAddresses.size > 0) {
                    web3Summary += `### Smart Contract Addresses (${allAddresses.size})\n`;
                    Array.from(allAddresses).slice(0, 10).forEach(addr => {
                        web3Summary += `- \`${addr}\`\n`;
                    });
                    if (allAddresses.size > 10) {
                        web3Summary += `- ...and ${allAddresses.size - 10} more\n`;
                    }
                    web3Summary += `\n`;
                }
                
                if (allChainIds.size > 0) {
                    web3Summary += `### Chain IDs: ${Array.from(allChainIds).join(', ')}\n\n`;
                }
                
                if (allTokens.size > 0) {
                    web3Summary += `### Tokens: ${Array.from(allTokens).join(', ')}\n\n`;
                }
                
                if (allProtocols.size > 0) {
                    web3Summary += `### Protocols: ${Array.from(allProtocols).join(', ')}\n\n`;
                }
            }
        }
        
        return `# Documentation Archive

Scraped from: ${this.baseUrl}
Date: ${new Date().toISOString().split('T')[0]}
Time: ${new Date().toLocaleTimeString()}
Total Pages: ${this.pages.length}
Total Sections: ${sections.length}
Total Code Blocks: ${totalCodeBlocks}

## 🤖 AI Agent Ready

This documentation has been optimized for AI agents and LLM consumption:
- **COMPLETE.md** - Single context file with all docs (perfect for Claude, ChatGPT, RAG systems)
- **Clean Markdown** - Zero HTML/CSS artifacts, pure content
- **Structured Data** - Organized sections with metadata
- **Code Preserved** - Exact formatting maintained for AI understanding
${web3Summary}
## Files Included

- **COMPLETE.md** - All documentation in a single file (perfect for AI agents)
- **[section].md** - Individual section files organized by topic

## Usage

### For AI Agents (Claude, ChatGPT, etc.)
Use \`COMPLETE.md\` for full context. This file contains all documentation in a single markdown file, making it perfect for:
- 💬 Loading into Claude/ChatGPT for interactive Q&A
- 🧠 RAG systems and semantic search
- 🤖 Autonomous agent knowledge bases
- 📊 LLM fine-tuning datasets
- 🔍 Documentation analysis and summarization

### For Web3/Blockchain Developers
${this.config.web3Focus ? '- **Web3 data extracted** - Smart contract addresses, chain IDs, tokens\n' : ''}- Perfect for DeFi, NFT, and blockchain integration projects
- Smart contract documentation readily accessible
- API endpoints for on-chain interactions

### For Browsing
Use individual section files for easier navigation:
${sections.map(s => `- **${s.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md**`).join('\n')}

## Statistics

- **Pages Scraped**: ${this.pages.length}
- **Sections**: ${sections.length}
- **Code Examples**: ${totalCodeBlocks}
- **Scraping Method**: ${this.config.useTrieveApi ? 'Trieve API (Fast)' : 'HTML Scraping'}
- **AI Optimized**: ${this.config.aiOptimized ? 'Yes ✅' : 'No'}
- **Web3 Focus**: ${this.config.web3Focus ? 'Yes 🌐' : 'No'}

## Sections

${sections.map(s => `- ${s}`).join('\n')}

## Configuration Used

- Include API Reference: ${this.config.includeApiRef ? 'Yes' : 'No'}
- Include Tables: ${this.config.includeTables ? 'Yes' : 'No'}
- Include Images: ${this.config.includeImages ? 'Yes' : 'No'}
- AI Optimized: ${this.config.aiOptimized ? 'Yes' : 'No'}
- Web3 Data Extraction: ${this.config.web3Focus ? 'Yes' : 'No'}
- Max Concurrent: ${this.config.maxConcurrent}
- Delay: ${this.config.delayMs}ms

## 💡 Tips for AI Usage

1. **Claude/Anthropic**: Upload COMPLETE.md as a project document for persistent context
2. **ChatGPT**: Paste sections as needed or use with GPT-4 large context window
3. **RAG Systems**: Use individual sections for chunk-based retrieval
4. **Autonomous Agents**: Parse the structured markdown for API calls and actions
5. **LangChain/LlamaIndex**: Perfect for document loaders and vector stores

---

Generated with Mintlify Docs Scraper
https://github.com/nirholas/mintlify-ai-toolkit
`;
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async fetchWithCORS(url) {
        // Try direct fetch first
        try {
            const response = await fetch(url);
            if (response.ok) return response;
        } catch (error) {
            // CORS error, try proxy
        }
        
        // Use CORS proxy
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        return fetch(proxyUrl);
    }

    updateProgress(percent, status) {
        const progressFill = document.getElementById('progressFill');
        const statusText = document.getElementById('statusText');
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (statusText) statusText.textContent = status;
    }

    addLog(message, type = 'info') {
        const logContainer = document.getElementById('logContainer');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateStats() {
        const statPages = document.getElementById('statPages');
        const statSections = document.getElementById('statSections');
        const statCode = document.getElementById('statCode');
        
        if (statPages) statPages.textContent = this.stats.pages;
        if (statSections) statSections.textContent = this.stats.sections.size;
        if (statCode) statCode.textContent = this.stats.codeBlocks;
    }
}

// Initialize the app
const app = new MintlifyScraperUI();
