# Advanced Scraper Features

This document describes the advanced features available in the Mintlify Documentation Scraper, inspired by industry-leading scrapers like Meilisearch docs-scraper, Crawl4AI, and Firecrawl.

## Table of Contents

- [Configuration File System](#configuration-file-system)
- [Custom Selectors](#custom-selectors)
- [Authentication](#authentication)
- [Progress Tracking & Resume](#progress-tracking--resume)
- [Multiple Output Formats](#multiple-output-formats)
- [Sitemap Features](#sitemap-features)
- [URL Filtering](#url-filtering)
- [Page Ranking](#page-ranking)

## Configuration File System

Instead of command-line arguments, you can use a JSON configuration file for complete control over scraping behavior.

### Basic Usage

```bash
npm run scrape-docs -- --config ./my-config.json
```

### Configuration File Structure

```json
{
  "index_uid": "my-docs",
  "start_urls": ["https://docs.example.com/"],
  "sitemap_urls": ["https://docs.example.com/sitemap.xml"],
  "stop_urls": ["/changelog/", "/blog/"],
  "selectors": {
    "default": {
      "lvl0": "h1",
      "lvl1": "h2",
      "lvl2": "h3",
      "text": "p, li",
      "code": "pre code"
    }
  },
  "output": {
    "format": "markdown",
    "structure": "per-section"
  },
  "crawling": {
    "max_concurrent": 5,
    "delay_ms": 500
  }
}
```

See `scraper-config.example.json` for a complete example with all options.

## Custom Selectors

Define custom CSS selectors to extract exactly the content you need.

### Selector Levels

- `lvl0` - Main page title (h1)
- `lvl1` - Section headers (h2)
- `lvl2` - Subsection headers (h3)
- `lvl3-6` - Additional heading levels
- `text` - Body content (paragraphs, lists)
- `code` - Code blocks

### Advanced Selector Configuration

```json
{
  "selectors": {
    "default": {
      "lvl0": {
        "selector": ".main-content h1",
        "global": false,
        "default_value": "Documentation"
      },
      "lvl1": ".main-content h2",
      "text": ".main-content p, .main-content li",
      "code": "pre code, .code-block, .highlight"
    },
    "api": {
      "lvl0": {
        "selector": ".api-nav .active",
        "global": true
      },
      "lvl1": ".api-content h1",
      "text": ".api-content .description"
    }
  }
}
```

### Selector Options

- `selector` - CSS selector string
- `global` - Extract from anywhere on page (not just main content)
- `default_value` - Fallback value if selector finds nothing

### Per-URL Selectors

Use different selectors for different sections:

```json
{
  "start_urls": [
    {
      "url": "https://docs.example.com/guide/",
      "selectors_key": "default"
    },
    {
      "url": "https://docs.example.com/api/",
      "selectors_key": "api"
    }
  ]
}
```

### Excluding Elements

Remove unwanted elements before extraction:

```json
{
  "selectors_exclude": [
    "nav",
    "footer",
    ".sidebar",
    ".table-of-contents",
    ".ads",
    "script",
    "style"
  ]
}
```

## Authentication

Access protected documentation sites with built-in authentication support.

### Basic Authentication

```json
{
  "authentication": {
    "type": "basic",
    "username": "user",
    "password": "pass"
  }
}
```

Or use environment variables:
```bash
export AUTH_USERNAME="user"
export AUTH_PASSWORD="pass"
npm run scrape-docs -- --config ./config.json
```

### Bearer Token

```json
{
  "authentication": {
    "type": "bearer",
    "token": "your-jwt-token"
  }
}
```

### API Key

```json
{
  "authentication": {
    "type": "apikey",
    "token": "your-api-key",
    "header_name": "X-API-Key"
  }
}
```

### Environment Variables

Avoid storing credentials in config files:

```bash
export AUTH_TYPE="bearer"
export AUTH_TOKEN="your-token"
npm run scrape-docs -- --config ./config.json
```

## Progress Tracking & Resume

The scraper automatically saves progress and can resume interrupted scrapes.

### Automatic Progress Saving

Progress is saved automatically every 30 seconds to `.scraper-state.json`:

```json
{
  "start_time": "2024-01-15T10:00:00Z",
  "visited_urls": ["https://docs.example.com/page1", "..."],
  "failed_urls": [],
  "statistics": {
    "total_pages": 100,
    "successful_pages": 75,
    "failed_pages": 0
  }
}
```

### Resuming a Scrape

Simply run the same command again:

```bash
npm run scrape-docs -- --config ./config.json
```

The scraper will:
- ✅ Load previous progress
- ✅ Skip already-scraped pages
- ✅ Continue from where it left off
- ✅ Retry previously failed pages

### Reset Progress

Start fresh by deleting the state file:

```bash
rm .scraper-state.json
npm run scrape-docs -- --config ./config.json
```

Or use the `--reset` flag:

```bash
npm run scrape-docs -- --config ./config.json --reset
```

### Custom State File

```json
{
  "progress": {
    "save_state": true,
    "state_file": "./my-progress.json"
  }
}
```

## Multiple Output Formats

Choose how to save your scraped documentation.

### Format Options

#### Markdown (Default)
Clean markdown files, perfect for AI consumption:

```json
{
  "output": {
    "format": "markdown"
  }
}
```

#### JSON
Structured data with metadata:

```json
{
  "output": {
    "format": "json"
  }
}
```

Output includes:
- Full page content
- Metadata (URL, title, timestamps)
- Code examples with language tags
- Section hierarchy

#### Both
Save both markdown and JSON:

```json
{
  "output": {
    "format": "both"
  }
}
```

### Structure Options

#### Per-Section (Default)
Organized by documentation sections:

```
docs/
├── INDEX.md
├── getting-started/
│   ├── INDEX.md
│   ├── installation.md
│   └── quick-start.md
├── api-reference/
│   ├── INDEX.md
│   ├── authentication.md
│   └── endpoints.md
└── guides/
    ├── INDEX.md
    └── best-practices.md
```

```json
{
  "output": {
    "structure": "per-section"
  }
}
```

#### Per-Page
Individual file for each page:

```
docs/
├── installation.md
├── quick-start.md
├── authentication.md
├── endpoints.md
└── best-practices.md
```

```json
{
  "output": {
    "structure": "per-page"
  }
}
```

#### Single-File
Everything in one file:

```
docs/
└── COMPLETE.md
```

```json
{
  "output": {
    "structure": "single-file"
  }
}
```

### Metadata Options

#### Include Metadata
Add frontmatter with metadata:

```markdown
---
title: "Installation Guide"
url: "https://docs.example.com/installation"
section: "Getting Started"
scraped_at: "2024-01-15T10:00:00Z"
page_rank: 5
tags:
  - setup
  - installation
---

# Installation Guide

...
```

```json
{
  "output": {
    "include_metadata": true
  }
}
```

#### Preserve Code Blocks
Maintain exact code formatting (enabled by default):

```json
{
  "output": {
    "preserve_code_blocks": true
  }
}
```

## Sitemap Features

### Basic Sitemap Crawling

```json
{
  "sitemap_urls": [
    "https://docs.example.com/sitemap.xml"
  ]
}
```

### Alternate Language Links

Crawl all language versions from sitemap:

```json
{
  "sitemap_urls": ["https://docs.example.com/sitemap.xml"],
  "sitemap_alternate_links": true
}
```

This will scrape both the main URL and alternate links:

```xml
<url>
  <loc>https://docs.example.com/guide</loc>
  <xhtml:link rel="alternate" hreflang="es" href="https://docs.example.com/es/guide"/>
  <xhtml:link rel="alternate" hreflang="fr" href="https://docs.example.com/fr/guide"/>
</url>
```

### Multiple Sitemaps

```json
{
  "sitemap_urls": [
    "https://docs.example.com/sitemap-main.xml",
    "https://docs.example.com/sitemap-api.xml",
    "https://docs.example.com/sitemap-guides.xml"
  ]
}
```

## URL Filtering

### Stop URLs

Prevent scraping specific URLs or patterns:

```json
{
  "stop_urls": [
    "/changelog/",
    "/blog/",
    "/careers/",
    "\\.pdf$",
    "/archive/.*"
  ]
}
```

Supports:
- Exact matches: `/specific/page`
- Partial matches: `/changelog/`
- Regex patterns: `\\.pdf$`

### Allowed Domains

Restrict scraping to specific domains:

```json
{
  "allowed_domains": [
    "docs.example.com",
    "api.example.com"
  ]
}
```

Useful for:
- Multi-domain documentation
- Preventing external link following
- Localhost scraping (`localhost:3000`)

### Scrape Start URLs

Control whether to scrape the start URLs themselves:

```json
{
  "start_urls": ["https://docs.example.com/"],
  "scrape_start_urls": false
}
```

Set to `false` if start URLs are:
- Navigation pages only
- Duplicates of other content
- Not valuable on their own

## Page Ranking

Assign priority/weight to specific pages.

### Basic Page Rank

```json
{
  "start_urls": [
    {
      "url": "https://docs.example.com/",
      "page_rank": 10
    },
    {
      "url": "https://docs.example.com/important-guide",
      "page_rank": 8
    },
    {
      "url": "https://docs.example.com/reference",
      "page_rank": 3
    }
  ]
}
```

Higher rank = higher priority:
- Used for processing order
- Included in metadata
- Can be used for search ranking

### With Tags

Combine with tags for organization:

```json
{
  "start_urls": [
    {
      "url": "https://docs.example.com/quick-start",
      "page_rank": 10,
      "tags": ["getting-started", "essential"]
    },
    {
      "url": "https://docs.example.com/advanced",
      "page_rank": 5,
      "tags": ["advanced", "optional"]
    }
  ]
}
```

## Crawling Options

Fine-tune scraping behavior:

```json
{
  "crawling": {
    "max_concurrent": 5,
    "delay_ms": 500,
    "max_retries": 3,
    "timeout_ms": 30000,
    "skip_empty": true,
    "follow_redirects": true
  }
}
```

Options:
- `max_concurrent` - Parallel requests (default: 3)
- `delay_ms` - Delay between requests (default: 1000)
- `max_retries` - Retry attempts for failures (default: 3)
- `timeout_ms` - Request timeout (default: 30000)
- `skip_empty` - Skip pages with no content (default: true)
- `follow_redirects` - Follow HTTP redirects (default: true)

## Content Extraction Options

### Minimum Indexed Level

Only index pages with sufficient heading hierarchy:

```json
{
  "min_indexed_level": 2
}
```

With `min_indexed_level: 2`, only pages with at least lvl0, lvl1, AND lvl2 headings are indexed.

### Content-Only Mode

Extract only content, skip headings:

```json
{
  "only_content_level": true
}
```

Useful for:
- Full-text search
- Content analysis
- AI training data

## Complete Configuration Example

```json
{
  "index_uid": "my-docs",
  "start_urls": [
    {
      "url": "https://docs.example.com/",
      "page_rank": 10,
      "tags": ["home"]
    },
    {
      "url": "https://docs.example.com/api/",
      "page_rank": 8,
      "selectors_key": "api",
      "tags": ["api", "reference"]
    }
  ],
  "stop_urls": ["/changelog/", "/blog/", "\\.pdf$"],
  "sitemap_urls": ["https://docs.example.com/sitemap.xml"],
  "sitemap_alternate_links": true,
  "allowed_domains": ["docs.example.com"],
  "selectors": {
    "default": {
      "lvl0": {
        "selector": ".content h1",
        "default_value": "Documentation"
      },
      "lvl1": ".content h2",
      "lvl2": ".content h3",
      "text": ".content p, .content li",
      "code": "pre code, .code-block"
    },
    "api": {
      "lvl0": ".api-header",
      "lvl1": ".endpoint-name",
      "text": ".description",
      "code": ".code-sample"
    }
  },
  "selectors_exclude": [
    "nav", "footer", ".sidebar", ".ads"
  ],
  "authentication": {
    "type": "bearer",
    "token": "your-token"
  },
  "trieve": {
    "enabled": true
  },
  "output": {
    "format": "both",
    "structure": "per-section",
    "include_metadata": true,
    "preserve_code_blocks": true
  },
  "crawling": {
    "max_concurrent": 5,
    "delay_ms": 500,
    "max_retries": 3,
    "timeout_ms": 30000,
    "skip_empty": true
  },
  "progress": {
    "save_state": true,
    "state_file": ".scraper-state.json"
  }
}
```

## Migration from Command-Line

### Before (CLI)
```bash
npm run scrape-docs -- https://docs.example.com \
  --output ./docs \
  --trieve-key tr-abc123 \
  --max-concurrent 5
```

### After (Config File)
```json
{
  "start_urls": ["https://docs.example.com"],
  "trieve": {
    "api_key": "tr-abc123"
  },
  "crawling": {
    "max_concurrent": 5
  }
}
```

```bash
npm run scrape-docs -- --config ./config.json --output ./docs
```

## Best Practices

1. **Start Simple** - Begin with basic config, add options as needed
2. **Use Progress Tracking** - Enable for large documentation sites
3. **Test Selectors** - Verify on a few pages before full scrape
4. **Respect Rate Limits** - Adjust `delay_ms` and `max_concurrent`
5. **Version Control** - Commit config files for reproducibility
6. **Environment Variables** - Use for sensitive credentials
7. **Validate Output** - Check code blocks preserve formatting
8. **Iterate Selectors** - Refine based on output quality

## Troubleshooting

### Issue: Scraped content includes navigation/footer

**Solution:** Add to `selectors_exclude`:
```json
{
  "selectors_exclude": ["nav", "footer", ".sidebar"]
}
```

### Issue: Code blocks have wrong formatting

**Solution:** Add code selectors:
```json
{
  "selectors": {
    "default": {
      "code": "pre code, .highlight, .code-block, .hljs"
    }
  }
}
```

### Issue: Authentication not working

**Solution:** Check auth configuration and test manually:
```bash
curl -H "Authorization: Bearer your-token" https://docs.example.com
```

### Issue: Progress not saving

**Solution:** Check file permissions and path:
```json
{
  "progress": {
    "save_state": true,
    "state_file": "./progress.json"
  }
}
```

### Issue: Missing pages in output

**Solution:** Check `stop_urls` patterns and `allowed_domains`

## Examples

See the `examples/` directory for real-world configurations:

- `examples/mintlify-config.json` - Mintlify documentation sites
- `examples/api-docs-config.json` - API reference documentation
- `examples/multilingual-config.json` - Multi-language docs
- `examples/protected-config.json` - Authenticated documentation

## Schema Validation

Validate your configuration against the JSON schema:

```bash
npm run validate-config -- ./my-config.json
```

Schema file: `scraper-config.schema.json`

## Support

- 📖 Documentation: See main [README.md](../README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/nirholas/mintlify-ai-toolkit/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/nirholas/mintlify-ai-toolkit/discussions)
