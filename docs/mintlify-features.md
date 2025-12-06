# Mintlify Features Reference

This document lists all Mintlify features we should support in our publisher.

## mint.json Configuration

### Essential Fields (✅ Implemented)
- `name` - Site name
- `logo` - Logo configuration (light/dark)
- `favicon` - Site favicon
- `colors` - Primary, light, dark colors
- `navigation` - Navigation structure
- `topbarLinks` - Links in top navigation
- `topbarCtaButton` - CTA button
- `footerSocials` - Social media links

### Advanced Fields (🔄 To Add)
- `versions` - Version selector
- `api` - API configuration
  - `baseUrl` - Base API URL
  - `auth` - Authentication method
  - `playground` - API playground settings
- `openapi` - OpenAPI spec URL
- `tabs` - Top-level navigation tabs
- `anchors` - Sidebar anchors/sections
- `search` - Search configuration
  - `prompt` - Search placeholder
- `feedback` - Feedback widget
  - `thumbsRating` - Enable thumbs up/down
  - `suggestEdit` - Enable suggest edits
- `modeToggle` - Dark mode settings
  - `default` - Default mode (light/dark)
  - `isHidden` - Hide toggle
- `backgroundImage` - Custom background
- `metadata` - SEO metadata
  - `og:image` - OpenGraph image
  - `twitter:site` - Twitter handle
- `redirects` - URL redirects
- `analytics` - Analytics integrations
  - `ga4` - Google Analytics 4
  - `gtm` - Google Tag Manager
  - `koala` - Koala analytics
  - `logrocket` - LogRocket
  - `mixpanel` - Mixpanel
  - `pirsch` - Pirsch analytics
  - `plausible` - Plausible analytics
  - `posthog` - PostHog
  - `amplitude` - Amplitude

## MDX Components

### Text Components (✅ Basic Support)
- Standard markdown (headings, lists, links, images, tables)
- Code blocks with syntax highlighting
- Blockquotes

### Card Components (✅ Implemented)
- `<Card>` - Single card
- `<CardGroup>` - Card grid
  - `cols={2}` or `cols={3}`

### Interactive Components (🔄 To Add)
- `<Accordion>` - Collapsible content
- `<AccordionGroup>` - Multiple accordions
- `<Tabs>` - Tabbed content
- `<Tab>` - Individual tab
- `<Steps>` - Numbered steps
- `<CodeGroup>` - Code examples in multiple languages
- `<Frame>` - Image/video frames
- `<Tooltip>` - Hover tooltips
- `<Check>` - Checkmark item
- `<Warning>` - Warning callout
- `<Info>` - Info callout
- `<Tip>` - Tip callout
- `<Note>` - Note callout

### API Components (🔄 To Add)
- `<ParamField>` - API parameter documentation
- `<ResponseField>` - API response documentation
- `<Expandable>` - Expandable content
- `<ResponseExample>` - Response examples
- `<RequestExample>` - Request examples

### Media Components (🔄 To Add)
- `<img>` with zoom, caption
- `<video>` with controls
- `<iframe>` embedded content
- `<Icon>` - Icon from library

### Layout Components (🔄 To Add)
- `<Columns>` - Multi-column layout
- `<Column>` - Individual column
- `<Frame>` - Bordered container

## Page Metadata

### Frontmatter (✅ Basic Support)
```yaml
---
title: Page Title
description: Page description
---
```

### Advanced Frontmatter (🔄 To Add)
```yaml
---
title: Page Title
description: SEO description
icon: 'icon-name'
iconType: 'solid' | 'regular' | 'light' | 'duotone'
mode: 'wide' # Full-width mode
sidebarTitle: Different sidebar title
og:image: /images/og-image.png
---
```

## Snippets

### Reusable Content (🔄 To Add)
Create snippets in `/snippets/` folder:

```mdx
// snippets/api-key.mdx
To get your API key, visit the [Dashboard](https://app.example.com/api-keys).
```

Use in pages:
```mdx
<Snippet file="api-key.mdx" />
```

## OpenAPI Integration

### Auto-Generate API Docs (🔄 To Add)
```json
{
  "openapi": "https://api.example.com/openapi.json",
  "api": {
    "baseUrl": "https://api.example.com",
    "auth": {
      "method": "bearer"
    },
    "playground": {
      "mode": "simple"
    }
  }
}
```

## Versioning

### Multiple Versions (🔄 To Add)
```json
{
  "versions": ["v2", "v1"],
  "navigation": [
    {
      "group": "Getting Started",
      "version": "v2",
      "pages": ["v2/introduction"]
    }
  ]
}
```

## Search

### Custom Search (🔄 To Add)
```json
{
  "search": {
    "prompt": "Search documentation..."
  }
}
```

## Integrations

### Analytics (🔄 To Add)
See analytics section above for full list

### Feedback (🔄 To Add)
```json
{
  "feedback": {
    "thumbsRating": true,
    "suggestEdit": true,
    "raiseIssue": true
  }
}
```

## Priority Enhancements for Publisher

### Phase 1 (High Priority)
1. ✅ Basic mint.json
2. ✅ Navigation structure
3. ✅ Card components
4. 🔄 Tabs component
5. 🔄 Accordion component
6. 🔄 CodeGroup for multi-language examples
7. 🔄 Callouts (Info, Warning, Tip, Note)

### Phase 2 (Medium Priority)
1. 🔄 API parameter documentation (ParamField)
2. 🔄 OpenAPI integration
3. 🔄 Snippets support
4. 🔄 Analytics integration options
5. 🔄 Feedback widget
6. 🔄 Advanced frontmatter

### Phase 3 (Nice to Have)
1. 🔄 Versioning
2. 🔄 Custom search
3. 🔄 Advanced layouts (Columns)
4. 🔄 Background images
5. 🔄 Redirects

## Notes

- Most features are optional and can be added incrementally
- Basic publisher works great for simple docs
- Advanced features can be manually added to generated sites
- Focus on making core workflow seamless first
