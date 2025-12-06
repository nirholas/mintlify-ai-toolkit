# 🌐 Mintlify Publishing Guide

**Turn any documentation into your own Mintlify site in 3 commands**

Perfect for rebranding competitor docs, consolidating doc sites, or white-labeling documentation.

---

## 🎯 What Is This?

The **Mintlify Publisher** converts scraped documentation into a fully deployable Mintlify site with:
- ✅ Complete `mint.json` with all Mintlify features
- ✅ All MDX components (Tabs, Accordions, CodeGroup, Callouts)
- ✅ Analytics integration (GA4, Mixpanel, PostHog)
- ✅ Interactive API playground
- ✅ Feedback widgets (thumbs up/down, suggest edits)
- ✅ Reusable snippets
- ✅ Example pages showcasing all components
- ✅ OpenAPI integration support
- ✅ Organized navigation structure  
- ✅ Clean, formatted markdown
- ✅ Ready to deploy in minutes

## 🚀 Quick Start (3 Commands)

```bash
# 1. Scrape documentation
npm run scrape -- https://docs.privy.io --output ./privy-docs

# 2. Publish to Mintlify format (with all features!)
npm run publish-mintlify -- ./privy-docs --output ./my-privy-docs \
  --enable-feedback \
  --enable-api-playground \
  --ga4 G-XXXXXXXXXX

# 3. Preview locally
cd my-privy-docs && npm install && npx mintlify dev
```

Visit `http://localhost:3000` - you now have a fully-featured Mintlify site.

---

## 📋 Real-World Example: Rebrand Stripe Docs

Let's create a white-labeled version of Stripe's documentation with all features:

### Step 1: Scrape Stripe Docs

```bash
npm run scrape -- https://stripe.com/docs/api \
  --output ./stripe-docs \
  --crawl-depth 3
```

### Step 2: Publish with Full Features

```bash
npm run publish-mintlify -- ./stripe-docs \
  --output ./my-payments-docs \
  --name "PaymentFlow API" \
  --description "Complete payment processing documentation" \
  --domain https://docs.paymentflow.com \
  --color "#6366F1" \
  --github https://github.com/your-org/payments \
  --twitter https://twitter.com/paymentflow \
  --linkedin https://linkedin.com/company/paymentflow \
  --ga4 G-XXXXXXXXXX \
  --enable-feedback \
  --enable-api-playground \
  --api-base-url https://api.paymentflow.com \
  --openapi https://api.paymentflow.com/openapi.json
```

### Step 3: Explore Generated Site

```bash
cd my-payments-docs

# Check out the generated files:
ls -la

# ✅ mint.json - Full config with analytics, feedback, API playground
# ✅ introduction.mdx - Home page with Tabs, Accordions, Steps, Callouts
# ✅ examples/api-reference.mdx - Complete API docs with ParamField, ResponseField, CodeGroup
# ✅ examples/components.mdx - Showcase of all Mintlify components
# ✅ snippets/ - Reusable content (api-key, rate-limits, error-handling)
# ✅ package.json - Ready to install and run
# ✅ README.md - Complete deployment guide
```

### Step 4: Customize

```bash
# Add your logo
cp ~/Downloads/logo.png images/logo.png

# Edit mint.json to reference logo
code mint.json
# Add: "logo": { "light": "/images/logo.png", "dark": "/images/logo.png" }

# Customize home page
code introduction.mdx

# Check example pages for component usage
code examples/api-reference.mdx
code examples/components.mdx
```

### Step 5: Preview

```bash
npm install
npx mintlify dev
```

Open http://localhost:3000 and see:
- ✅ Your branding (name, colors, logo)
- ✅ Interactive components (tabs, accordions)
- ✅ Code examples in multiple languages
- ✅ Feedback widgets on every page
- ✅ API playground (if OpenAPI provided)
- ✅ Analytics tracking
- ✅ Clean navigation

### Step 6: Deploy to Mintlify

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial PaymentFlow docs"

# Push to GitHub
git remote add origin https://github.com/your-org/payment-docs
git push -u origin main

# Deploy on mintlify.com:
# 1. Sign in to mintlify.com
# 2. Click "New Documentation"
# 3. Connect your GitHub repo
# 4. Select 'main' branch
# 5. Deploy!
```

You now have Stripe's documentation with your brand and all Mintlify features.

---

## 🎨 All Available Options

### Basic Options
```bash
--output <dir>          # Output directory (default: ./mintlify-site)
--name <name>           # Site name (default: from docs folder)
--description <text>    # Site description for SEO
--domain <url>          # Your custom domain
--color <hex>           # Primary brand color (e.g., "#FF6B6B")
--logo <path>           # Path to logo file
```

### Social Links
```bash
--github <url>          # GitHub repository or organization
--twitter <url>         # Twitter profile
--linkedin <url>        # LinkedIn company page
```

### Analytics Integration
```bash
--ga4 <measurement-id>  # Google Analytics 4 (e.g., G-XXXXXXXXXX)
--mixpanel <token>      # Mixpanel project token
--posthog <api-key>     # PostHog API key
```

### Interactive Features
```bash
--enable-feedback       # Enable thumbs up/down and suggest edits
--enable-api-playground # Enable interactive API testing
```

### API Configuration
```bash
--api-base-url <url>    # Base URL for your API
--openapi <url>         # OpenAPI/Swagger spec URL for auto-docs
```

### Complete Example

```bash
npm run publish-mintlify -- ./scraped-docs \
  --output ./my-docs-site \
  --name "Acme API Documentation" \
  --description "Developer platform for the modern web" \
  --domain https://docs.acme.com \
  --color "#6366F1" \
  --logo /images/acme-logo.png \
  --github https://github.com/acme/api \
  --twitter https://twitter.com/acmeapi \
  --linkedin https://linkedin.com/company/acme \
  --ga4 G-ABC123XYZ \
  --mixpanel a1b2c3d4e5f6 \
  --enable-feedback \
  --enable-api-playground \
  --api-base-url https://api.acme.com \
  --openapi https://api.acme.com/openapi.json
```

---

## 📦 Generated File Structure

```
my-docs-site/
├── mint.json                      # Complete Mintlify configuration
│   ├── Analytics (GA4, Mixpanel, PostHog)
│   ├── Feedback widgets
│   ├── API playground settings
│   ├── OpenAPI integration
│   ├── Navigation structure
│   └── Branding (colors, logo, social links)
│
├── introduction.mdx               # Home page with all components
│   ├── CardGroup for quick links
│   ├── AccordionGroup for features
│   ├── Tabs for code examples
│   ├── Steps for onboarding
│   └── Callouts (Note, Warning, Info)
│
├── examples/
│   ├── api-reference.mdx          # API docs example
│   │   ├── CodeGroup (multi-language examples)
│   │   ├── ParamField (request parameters)
│   │   ├── ResponseField (response schema)
│   │   └── ResponseExample (JSON examples)
│   │
│   └── components.mdx             # All Mintlify components
│       ├── Callouts (Note, Info, Tip, Warning, Check)
│       ├── Accordions
│       ├── Tabs
│       ├── Steps
│       ├── CodeGroups
│       ├── Cards
│       └── Frames
│
├── snippets/                      # Reusable content
│   ├── api-key.mdx                # How to get API keys
│   ├── rate-limits.mdx            # Rate limit info
│   └── error-handling.mdx         # Error response format
│
├── [your-scraped-docs]/           # Organized by section
│   ├── api-reference/
│   ├── guides/
│   └── ...
│
├── package.json                   # Dependencies
├── README.md                      # Complete deployment guide
└── .gitignore                     # Git ignore rules
```

---

## 🎯 Component Usage Guide

The generated site includes examples of every Mintlify component. Here's a quick reference:

### Callouts
```mdx
<Note>General information</Note>
<Info>Helpful tips</Info>
<Tip>Best practices</Tip>
<Warning>Important warnings</Warning>
<Check>Success messages</Check>
```

### Accordions
```mdx
<AccordionGroup>
  <Accordion title="Question?" icon="question">
    Answer content here
  </Accordion>
</AccordionGroup>
```

### Tabs
```mdx
<Tabs>
  <Tab title="JavaScript">
    ```javascript
    const code = 'example';
    ```
  </Tab>
  <Tab title="Python">
    ```python
    code = 'example'
    ```
  </Tab>
</Tabs>
```

### Code Groups (Multi-Language)
```mdx
<CodeGroup>

```javascript Node.js
const sdk = require('@example/sdk');
```

```python Python
from example import SDK
```

```go Go
import "github.com/example/sdk"
```

</CodeGroup>
```

### Steps
```mdx
<Steps>
  <Step title="First Step">
    Do this first
  </Step>
  <Step title="Second Step">
    Then do this
  </Step>
</Steps>
```

### API Documentation
```mdx
<ParamField path="id" type="string" required>
  The unique identifier
</ParamField>

<ResponseField name="created_at" type="timestamp">
  When the resource was created
</ResponseField>
```

### Cards
```mdx
<CardGroup cols={2}>
  <Card title="Guide" icon="book" href="/guides/start">
    Get started quickly
  </Card>
  <Card title="API" icon="code" href="/api">
    API reference
  </Card>
</CardGroup>
```

### Snippets (Reusable Content)
```mdx
<Snippet file="api-key.mdx" />
```

All these components are demonstrated in the generated `examples/` folder!

---

## 🎨 Advanced Customization

### Basic Options

```bash
npm run publish-mintlify -- ./scraped-docs/api \
  --name "Acme API Documentation" \
  --description "Enterprise API for developers" \
  --domain https://docs.acme.com \
  --color "#FF6B6B" \
  --logo /images/acme-logo.png \
  --github https://github.com/acme/api \
  --twitter https://twitter.com/acmeapi
```

### Manual mint.json Editing

After publishing, edit `mint.json` for advanced features:

```json
{
  "name": "Your Docs",
  "logo": {
    "light": "/images/logo-light.png",
    "dark": "/images/logo-dark.png"
  },
  "favicon": "/images/favicon.png",
  "colors": {
    "primary": "#0D9373",
    "light": "#07C983",
    "dark": "#0D9373"
  },
  "topbarLinks": [
    { "name": "Documentation", "url": "/" },
    { "name": "Blog", "url": "https://blog.yourdomain.com" }
  ],
  "topbarCtaButton": {
    "name": "Get Started",
    "url": "https://app.yourdomain.com/signup"
  },
  "anchors": [
    {
      "name": "API Reference",
      "icon": "code",
      "url": "api-reference"
    },
    {
      "name": "Community",
      "icon": "discord",
      "url": "https://discord.gg/your-server"
    }
  ],
  "navigation": [
    {
      "group": "Getting Started",
      "pages": ["introduction", "quickstart"]
    },
    {
      "group": "Guides",
      "pages": ["guides/authentication", "guides/webhooks"]
    }
  ],
  "footerSocials": {
    "twitter": "https://twitter.com/yourhandle",
    "github": "https://github.com/yourorg",
    "linkedin": "https://linkedin.com/company/yourcompany"
  },
  "analytics": {
    "ga4": {
      "measurementId": "G-XXXXXXXXXX"
    }
  }
}
```

### Customize Home Page

Edit `introduction.mdx`:

```mdx
---
title: Welcome to Acme API
description: Build powerful integrations with Acme's RESTful API
---

<img src="/images/hero.png" alt="Acme API" />

# Welcome to Acme API

Build amazing products with Acme's developer platform.

## Why Acme?

- ⚡ **Lightning Fast** - Sub-50ms response times
- 🔒 **Enterprise Security** - SOC 2 Type II certified
- 🌍 **Global Scale** - 99.99% uptime SLA
- 🎨 **Beautiful DX** - Intuitive API design

## Quick Start

<CardGroup cols={2}>
  <Card title="Authentication" icon="key" href="/guides/authentication">
    Get your API keys and authenticate requests
  </Card>
  <Card title="Make Your First Request" icon="code" href="/quickstart">
    Send your first API request in 60 seconds
  </Card>
  <Card title="API Reference" icon="book-open" href="/api-reference">
    Complete API documentation
  </Card>
  <Card title="SDKs" icon="rocket" href="/sdks">
    Official client libraries
  </Card>
</CardGroup>

## Popular Guides

<CardGroup cols={3}>
  <Card title="Webhooks" icon="webhook" href="/guides/webhooks">
    Real-time event notifications
  </Card>
  <Card title="Rate Limiting" icon="gauge" href="/guides/rate-limits">
    Understand API limits
  </Card>
  <Card title="Error Handling" icon="triangle-exclamation" href="/guides/errors">
    Handle errors gracefully
  </Card>
</CardGroup>

---

**Ready to build?** Get your [API keys](https://app.acme.com/api-keys) →
```

---

## 🏗️ Use Cases

### 1. **Competitor Documentation Rebranding**

Scrape a competitor's docs and rebrand as your own:

```bash
# Scrape competitor docs
npm run scrape -- https://competitor.com/docs --output ./competitor-docs

# Rebrand as yours
npm run publish-mintlify -- ./competitor-docs \
  --name "YourProduct Docs" \
  --color "#your-brand-color"
```

### 2. **Multi-Product Documentation Consolidation**

Combine docs from multiple products into one site:

```bash
# Scrape Product A
npm run scrape -- https://product-a.com/docs --output ./product-a

# Scrape Product B
npm run scrape -- https://product-b.com/docs --output ./product-b

# Publish separately, then manually merge mint.json navigation
npm run publish-mintlify -- ./product-a --output ./unified-docs
# Copy product-b markdown files into unified-docs
# Edit mint.json to include both navigation trees
```

### 3. **Platform Migration to Mintlify**

Migrate from GitBook, ReadMe, or Docusaurus to Mintlify:

```bash
# Scrape your current GitBook site
npm run scrape -- https://yourapp.gitbook.io/docs --output ./current-docs

# Convert to Mintlify
npm run publish-mintlify -- ./current-docs --output ./mintlify-docs

# Deploy to Mintlify platform
# Much better UX and SEO!
```

### 4. **White-Label Documentation**

Create branded docs for each customer:

```bash
# Base documentation
npm run scrape -- https://yourapi.com/docs --output ./base-docs

# Customer A's branded docs
npm run publish-mintlify -- ./base-docs \
  --output ./customer-a-docs \
  --name "Customer A API" \
  --domain https://docs.customer-a.com \
  --color "#customer-a-color"

# Customer B's branded docs
npm run publish-mintlify -- ./base-docs \
  --output ./customer-b-docs \
  --name "Customer B API" \
  --domain https://docs.customer-b.com \
  --color "#customer-b-color"
```

---

## 📂 Generated Structure

```
mintlify-site/
├── mint.json                 # Mintlify configuration
├── introduction.mdx          # Home page
├── package.json              # Dependencies
├── README.md                 # Deployment guide
├── .gitignore               # Git ignore rules
│
├── api-reference/           # API documentation
│   ├── authentication.md
│   ├── endpoints.md
│   └── ...
│
├── guides/                  # User guides
│   ├── getting-started.md
│   ├── webhooks.md
│   └── ...
│
└── images/                  # Assets
    ├── logo.png
    └── favicon.png
```

---

## 🚀 Deployment Options

### Option 1: Mintlify Platform (Recommended)

**Pros:** Automatic builds, CDN, custom domains, analytics
**Cost:** Free for open source, paid for private repos

1. Push to GitHub
2. Connect at [mintlify.com](https://mintlify.com)
3. Auto-deploys on every push

### Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 3: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Option 4: Self-Hosted

Build and host the static site yourself:

```bash
npm run build
# Upload dist/ folder to your server
```

---

## 💡 Pro Tips

### Tip 1: Auto-Update Documentation

Set up a cron job to re-scrape and re-publish:

```bash
#!/bin/bash
# update-docs.sh

# Scrape latest docs
npm run scrape -- https://docs.example.com --output ./scraped-docs

# Re-publish to Mintlify
npm run publish-mintlify -- ./scraped-docs --output ./mintlify-site

# Commit and push (triggers Mintlify deploy)
cd mintlify-site
git add .
git commit -m "Auto-update: $(date)"
git push
```

Schedule with cron:
```cron
0 0 * * * /path/to/update-docs.sh  # Daily at midnight
```

### Tip 2: Version Your Documentation

```bash
# Scrape v1 docs
npm run scrape -- https://docs.example.com/v1 --output ./docs-v1
npm run publish-mintlify -- ./docs-v1 --output ./mintlify-v1

# Scrape v2 docs
npm run scrape -- https://docs.example.com/v2 --output ./docs-v2
npm run publish-mintlify -- ./docs-v2 --output ./mintlify-v2

# Deploy both with version switching
# Edit mint.json to add version dropdown
```

### Tip 3: Add Custom Components

Mintlify supports custom React components:

```bash
cd mintlify-site
mkdir components

# Create custom component
cat > components/PricingTable.tsx << 'EOF'
export default function PricingTable() {
  return (
    <div className="pricing-grid">
      {/* Your pricing table */}
    </div>
  );
}
EOF

# Use in markdown
# <PricingTable />
```

---

## 🔧 Troubleshooting

### Navigation Not Showing

Check that markdown files exist at paths in `mint.json`:

```bash
# Verify files exist
ls -la api-reference/
ls -la guides/

# Check mint.json paths match actual files
cat mint.json | grep pages
```

### Images Not Loading

Ensure images are in `/images/` folder:

```bash
# Copy images from scraped docs
cp -r ./scraped-docs/*/images/* ./mintlify-site/images/

# Reference in markdown as /images/filename.png
```

### Broken Links

Use relative paths without `.md`:

```markdown
❌ [See Guide](./guides/authentication.md)
✅ [See Guide](/guides/authentication)
```

### Custom Domain Not Working

1. Add CNAME record: `docs.yourdomain.com` → `cname.mintlify.com`
2. Add to `mint.json`: `"domain": "docs.yourdomain.com"`
3. Wait for DNS propagation (up to 24h)

---

## 📊 Analytics & SEO

### Add Google Analytics

Edit `mint.json`:

```json
{
  "analytics": {
    "ga4": {
      "measurementId": "G-XXXXXXXXXX"
    }
  }
}
```

### Add SEO Metadata

In each markdown file:

```markdown
---
title: "Your Page Title"
description: "Detailed description for SEO"
og:image: "/images/social-preview.png"
---
```

### Add Sitemap

Mintlify auto-generates sitemap.xml at `/sitemap.xml`

---

## 🎓 Learning Resources

- [Mintlify Documentation](https://mintlify.com/docs)
- [Mintlify Showcase](https://mintlify.com/showcase) - See examples
- [Mintlify Community](https://mintlify.com/community)
- [MDX Documentation](https://mdxjs.com/) - For custom components

---

## 🤝 Community Examples

Check out these real-world Mintlify sites for inspiration:

- [Anthropic](https://docs.anthropic.com)
- [Fern](https://buildwithfern.com/docs)
- [Vapi](https://docs.vapi.ai)
- [Plain](https://docs.plain.com)
- [Knock](https://docs.knock.app)

All these sites could be recreated with:

```bash
npm run scrape -- <their-docs-url>
npm run publish-mintlify -- ./scraped-docs
```

---

**Questions?** Open an issue or PR at [github.com/nirholas/mintlify-ai-toolkit](https://github.com/nirholas/mintlify-ai-toolkit)
