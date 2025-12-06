/**
 * Real-Time Preview & Collaboration Module
 * Live markdown rendering, collaborative editing, and hot reload
 */

class RealtimePreview {
    constructor() {
        this.previewWindow = null;
        this.currentPage = null;
        this.autoRefresh = true;
        this.collaborators = new Map();
        this.changeHistory = [];
        this.maxHistorySize = 100;
    }

    /**
     * Initialize live preview window
     */
    initPreview() {
        if (this.previewWindow && !this.previewWindow.closed) {
            return this.previewWindow;
        }

        const html = this.generatePreviewHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        this.previewWindow = window.open(url, 'DocsPreview', 
            'width=800,height=600,menubar=no,toolbar=no,location=no,status=no'
        );

        // Setup communication channel
        this.setupMessageChannel();

        return this.previewWindow;
    }

    /**
     * Generate preview window HTML
     */
    generatePreviewHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Documentation Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
            margin-bottom: 30px;
        }

        .status {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4CAF50;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .collaborators {
            display: flex;
            gap: 5px;
            margin-top: 10px;
        }

        .collaborator {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }

        #content {
            animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        h1 {
            font-size: 2.5em;
            margin-bottom: 0.5em;
            color: #1a1a1a;
        }

        h2 {
            font-size: 2em;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            color: #2a2a2a;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 0.3em;
        }

        h3 {
            font-size: 1.5em;
            margin-top: 1.2em;
            margin-bottom: 0.5em;
            color: #3a3a3a;
        }

        p {
            margin-bottom: 1em;
        }

        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }

        pre {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 1.5em 0;
        }

        pre code {
            background: none;
            padding: 0;
            color: inherit;
        }

        ul, ol {
            margin-left: 2em;
            margin-bottom: 1em;
        }

        li {
            margin-bottom: 0.5em;
        }

        a {
            color: #0066cc;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5em 0;
        }

        th, td {
            padding: 12px;
            border: 1px solid #e0e0e0;
            text-align: left;
        }

        th {
            background: #f9f9f9;
            font-weight: bold;
        }

        blockquote {
            border-left: 4px solid #0066cc;
            padding-left: 20px;
            margin: 1.5em 0;
            color: #555;
            font-style: italic;
        }

        img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
            margin: 1.5em 0;
        }

        .update-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        }

        .update-indicator.show {
            opacity: 1;
            transform: translateY(0);
        }

        .metrics {
            display: flex;
            gap: 20px;
            margin-top: 10px;
            font-size: 0.9em;
            color: #666;
        }

        .metric {
            display: flex;
            align-items: center;
            gap: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1 id="page-title">Documentation Preview</h1>
                <div class="metrics">
                    <div class="metric">📄 <span id="word-count">0</span> words</div>
                    <div class="metric">💻 <span id="code-count">0</span> code blocks</div>
                    <div class="metric">📊 <span id="quality-score">0</span>/100 quality</div>
                </div>
            </div>
            <div class="status">
                <span class="status-dot"></span>
                <span>Live</span>
            </div>
        </div>
        <div class="collaborators" id="collaborators"></div>
        <div id="content">
            <p style="color: #999; text-align: center; padding: 50px;">
                Waiting for content...
            </p>
        </div>
    </div>
    <div class="update-indicator" id="update-indicator">Updated</div>

    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script>
        // Setup marked for markdown rendering
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                return code; // In production, use syntax highlighter like Prism.js
            }
        });

        // Listen for updates from parent window
        window.addEventListener('message', (event) => {
            if (event.data.type === 'update-preview') {
                updateContent(event.data.page);
            } else if (event.data.type === 'update-collaborators') {
                updateCollaborators(event.data.collaborators);
            }
        });

        function updateContent(page) {
            if (!page) return;

            // Update title
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = page.title || 'Documentation Preview';
            }
            document.title = `Preview: ${page.title || 'Untitled'}`;

            // Render markdown
            const html = marked.parse(page.content || '');
            const contentEl = document.getElementById('content');
            if (contentEl) {
                contentEl.innerHTML = html;
            }

            // Update metrics
            const wordCount = (page.content || '').split(/\s+/).filter(w => w.length > 0).length;
            const codeCount = (page.content || '').match(/```/g)?.length / 2 || 0;
            
            const wordCountEl = document.getElementById('word-count');
            const codeCountEl = document.getElementById('code-count');
            const qualityScoreEl = document.getElementById('quality-score');
            
            if (wordCountEl) wordCountEl.textContent = wordCount;
            if (codeCountEl) codeCountEl.textContent = Math.floor(codeCount);
            if (qualityScoreEl) qualityScoreEl.textContent = page.qualityScore || 0;

            // Show update indicator
            showUpdateIndicator();

            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function updateCollaborators(collaborators) {
            const container = document.getElementById('collaborators');
            if (!container) return;
            container.innerHTML = '';

            collaborators.forEach((collab, i) => {
                const el = document.createElement('div');
                el.className = 'collaborator';
                el.style.background = collab.color;
                el.textContent = collab.initial;
                el.title = collab.name;
                container.appendChild(el);
            });
        }

        function showUpdateIndicator() {
            const indicator = document.getElementById('update-indicator');
            indicator.classList.add('show');
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
        }

        // Auto-refresh connection check
        setInterval(() => {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: 'preview-alive' }, '*');
            }
        }, 5000);
    </script>
</body>
</html>`;
    }

    /**
     * Setup bidirectional communication
     */
    setupMessageChannel() {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'preview-alive') {
                // Preview window is still alive
                this.updateStatus('connected');
            }
        });
    }

    /**
     * Update preview with new content
     */
    updatePreview(page, aiAnalysis = null) {
        if (!this.previewWindow || this.previewWindow.closed) {
            if (this.autoRefresh) {
                this.initPreview();
            } else {
                return false;
            }
        }

        const previewData = {
            type: 'update-preview',
            page: {
                title: page.title,
                content: page.content,
                qualityScore: aiAnalysis?.qualityScore || 0,
                url: page.url
            }
        };

        this.previewWindow.postMessage(previewData, '*');
        this.currentPage = page;

        // Track change
        this.addToHistory({
            timestamp: Date.now(),
            page: page.title,
            action: 'preview-update'
        });

        return true;
    }

    /**
     * Add collaborator
     */
    addCollaborator(id, name, color) {
        this.collaborators.set(id, {
            name,
            color,
            initial: name.charAt(0).toUpperCase(),
            lastSeen: Date.now()
        });

        this.updateCollaborators();
    }

    /**
     * Remove collaborator
     */
    removeCollaborator(id) {
        this.collaborators.delete(id);
        this.updateCollaborators();
    }

    /**
     * Update collaborators in preview
     */
    updateCollaborators() {
        if (!this.previewWindow || this.previewWindow.closed) return;

        const collabArray = Array.from(this.collaborators.values());
        this.previewWindow.postMessage({
            type: 'update-collaborators',
            collaborators: collabArray
        }, '*');
    }

    /**
     * Add to change history
     */
    addToHistory(entry) {
        this.changeHistory.unshift(entry);
        if (this.changeHistory.length > this.maxHistorySize) {
            this.changeHistory.pop();
        }
    }

    /**
     * Get change history
     */
    getHistory(limit = 10) {
        return this.changeHistory.slice(0, limit);
    }

    /**
     * Update status
     */
    updateStatus(status) {
        // Can be extended to show connection status in UI
        console.log('Preview status:', status);
    }

    /**
     * Close preview window
     */
    closePreview() {
        if (this.previewWindow && !this.previewWindow.closed) {
            this.previewWindow.close();
        }
        this.previewWindow = null;
    }

    /**
     * Toggle auto-refresh
     */
    toggleAutoRefresh() {
        this.autoRefresh = !this.autoRefresh;
        return this.autoRefresh;
    }
}

/**
 * Hot Reload Manager
 * Watches for changes and automatically refreshes preview
 */
class HotReloadManager {
    constructor(previewManager) {
        this.preview = previewManager;
        this.watchedPages = new Map();
        this.debounceTimers = new Map();
        this.enabled = false;
    }

    /**
     * Enable hot reload for a page
     */
    watch(page) {
        const key = page.url;
        this.watchedPages.set(key, {
            page,
            lastUpdate: Date.now(),
            hash: this.hashContent(page.content)
        });
    }

    /**
     * Check for changes and reload if needed
     */
    checkAndReload(page) {
        if (!this.enabled) return false;

        const key = page.url;
        const watched = this.watchedPages.get(key);

        if (!watched) {
            this.watch(page);
            return false;
        }

        const newHash = this.hashContent(page.content);
        if (newHash !== watched.hash) {
            // Content changed - debounce reload
            this.debounceReload(page, newHash);
            return true;
        }

        return false;
    }

    /**
     * Debounce reload to avoid too frequent updates
     */
    debounceReload(page, newHash) {
        const key = page.url;
        
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }

        const timer = setTimeout(() => {
            this.preview.updatePreview(page);
            
            // Update watched data
            const watched = this.watchedPages.get(key);
            if (watched) {
                watched.hash = newHash;
                watched.lastUpdate = Date.now();
            }

            this.debounceTimers.delete(key);
        }, 500); // 500ms debounce

        this.debounceTimers.set(key, timer);
    }

    /**
     * Simple hash function for content comparison
     */
    hashContent(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    /**
     * Enable/disable hot reload
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Clear all watches
     */
    clearAll() {
        this.watchedPages.clear();
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
    }
}

// Export for use in app.js
window.RealtimePreview = RealtimePreview;
window.HotReloadManager = HotReloadManager;
