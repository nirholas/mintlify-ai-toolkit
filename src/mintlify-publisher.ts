#!/usr/bin/env node
/**
 * Mintlify Site Publisher
 * 
 * Converts scraped documentation into a deployable Mintlify site
 * 
 * Usage:
 *   npm run publish-mintlify -- ./scraped-docs/privy
 *   npm run publish-mintlify -- ./scraped-docs/privy --output ./my-mintlify-site
 * 
 * Perfect for:
 * - Rebranding competitor docs
 * - Consolidating multiple doc sites
 * - Migrating to Mintlify
 * - White-labeling documentation
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface MintlifyConfig {
  name: string;
  logo?: {
    light?: string;
    dark?: string;
  };
  favicon?: string;
  colors: {
    primary: string;
    light: string;
    dark: string;
  };
  topbarLinks?: Array<{
    name: string;
    url: string;
  }>;
  topbarCtaButton?: {
    name: string;
    url: string;
  };
  anchors?: Array<{
    name: string;
    icon: string;
    url: string;
  }>;
  navigation: Array<{
    group: string;
    pages: string[];
  }>;
  footerSocials?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  analytics?: {
    ga4?: { measurementId: string };
    gtm?: { tagId: string };
    mixpanel?: { projectToken: string };
    posthog?: { apiKey: string; apiHost?: string };
    plausible?: { domain: string };
  };
  feedback?: {
    thumbsRating?: boolean;
    suggestEdit?: boolean;
    raiseIssue?: boolean;
  };
  api?: {
    baseUrl?: string;
    auth?: {
      method: 'bearer' | 'basic' | 'key';
      name?: string;
    };
    playground?: {
      mode?: 'simple' | 'show';
    };
  };
  openapi?: string | string[];
  versions?: string[];
  tabs?: Array<{
    name: string;
    url: string;
  }>;
  search?: {
    prompt?: string;
  };
  modeToggle?: {
    default?: 'light' | 'dark';
    isHidden?: boolean;
  };
  metadata?: {
    'og:image'?: string;
    'twitter:site'?: string;
  };
}

interface SiteConfig {
  name: string;
  description?: string;
  domain?: string;
  primaryColor?: string;
  logo?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  // Analytics
  googleAnalytics?: string;
  mixpanel?: string;
  posthog?: string;
  // Features
  enableFeedback?: boolean;
  enableApiPlayground?: boolean;
  apiBaseUrl?: string;
  openapi?: string;
  // Advanced
  versions?: string[];
  tabs?: Array<{ name: string; url: string }>;
}

class MintlifyPublisher {
  private docsPath: string;
  private outputPath: string;
  private config: SiteConfig;

  constructor(docsPath: string, outputPath?: string, config?: SiteConfig) {
    this.docsPath = docsPath;
    this.outputPath = outputPath || './mintlify-site';
    this.config = config || { name: path.basename(docsPath) };
  }

  /**
   * Generate complete Mintlify site
   */
  async publish(): Promise<void> {
    console.log(`\n🚀 Publishing Mintlify Site: ${this.config.name}\n`);

    // Step 1: Create output directory
    console.log('📁 Step 1: Creating site structure...');
    await this.createStructure();
    console.log('✓ Site structure created\n');

    // Step 2: Copy and organize markdown files
    console.log('📝 Step 2: Organizing documentation files...');
    await this.organizeContent();
    console.log('✓ Documentation organized\n');

    // Step 3: Generate mint.json
    console.log('⚙️  Step 3: Generating mint.json configuration...');
    await this.generateMintConfig();
    console.log('✓ Configuration generated\n');

    // Step 4: Create home page
    console.log('🏠 Step 4: Creating home page...');
    await this.generateHomePage();
    console.log('✓ Home page created\n');

    // Step 5: Generate package.json
    console.log('📦 Step 5: Creating package.json...');
    await this.generatePackageJson();
    console.log('✓ Package configuration created\n');

    // Step 6: Create README
    console.log('📚 Step 6: Writing deployment guide...');
    await this.generateReadme();
    console.log('✓ Deployment guide created\n');

    // Step 7: Create .gitignore
    console.log('🔒 Step 7: Creating .gitignore...');
    await this.generateGitignore();
    console.log('✓ Git configuration created\n');

    // Step 8: Create example pages
    console.log('📄 Step 8: Creating example documentation pages...');
    await this.generateExamplePages();
    console.log('✓ Example pages created\n');

    // Step 9: Create snippets
    console.log('✂️  Step 9: Creating reusable snippets...');
    await this.generateSnippets();
    console.log('✓ Snippets created\n');

    // Success!
    console.log('✅ Mintlify site generated successfully!\n');
    console.log(`📁 Location: ${this.outputPath}\n`);
    console.log('🎯 Next steps:');
    console.log(`   1. cd ${this.outputPath}`);
    console.log('   2. npm install');
    console.log('   3. npx mintlify dev');
    console.log('   4. Visit http://localhost:3000');
    console.log('   5. Deploy to Mintlify (see README.md)');
    console.log('');
  }

  /**
   * Create directory structure
   */
  private async createStructure(): Promise<void> {
    await fs.mkdir(this.outputPath, { recursive: true });
    await fs.mkdir(path.join(this.outputPath, 'images'), { recursive: true });
    await fs.mkdir(path.join(this.outputPath, 'api-reference'), { recursive: true });
  }

  /**
   * Organize content from scraped docs
   */
  private async organizeContent(): Promise<void> {
    // Read metadata
    const metadataPath = path.join(this.docsPath, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

    // Get all sections
    const sections = new Set<string>(metadata.pages.map((p: any) => p.section));

    // Copy files by section
    for (const section of sections) {
      const sectionPath = path.join(this.docsPath, section);
      const outputSectionPath = path.join(this.outputPath, section);

      try {
        await fs.mkdir(outputSectionPath, { recursive: true });
        
        // Copy all markdown files from this section
        const files = await fs.readdir(sectionPath);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const sourcePath = path.join(sectionPath, file);
            const destPath = path.join(outputSectionPath, file);
            
            // Read, clean, and write
            let content = await fs.readFile(sourcePath, 'utf-8');
            content = this.cleanMarkdown(content);
            await fs.writeFile(destPath, content);
          }
        }
      } catch (error) {
        console.warn(`   ⚠️  Could not process section: ${section}`);
      }
    }
  }

  /**
   * Clean markdown for Mintlify
   */
  private cleanMarkdown(content: string): string {
    // Remove URL metadata that we added during scraping
    content = content.replace(/^\*\*URL:\*\* .+\n\n/gm, '');
    
    // Remove "## Documentation" headers we added
    content = content.replace(/^## Documentation\n\n/gm, '');
    
    // Remove API Endpoint sections (Mintlify handles these differently)
    content = content.replace(/^## API Endpoint\n\n[\s\S]*?(?=^##|\Z)/gm, '');
    
    return content.trim();
  }

  /**
   * Generate mint.json configuration
   */
  private async generateMintConfig(): Promise<void> {
    // Read metadata
    const metadataPath = path.join(this.docsPath, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

    // Build navigation from sections
    const navigation: Array<{ group: string; pages: string[] }> = [];
    
    // Group pages by section
    const sectionMap = new Map<string, any[]>();
    for (const page of metadata.pages) {
      if (!sectionMap.has(page.section)) {
        sectionMap.set(page.section, []);
      }
      sectionMap.get(page.section)!.push(page);
    }

    // Create navigation groups
    for (const [section, pages] of sectionMap) {
      const group = {
        group: this.formatSectionName(section),
        pages: pages.map(p => `${p.section}/${this.slugify(p.title)}`)
      };
      navigation.push(group);
    }

    // Create mint.json
    const mintConfig: MintlifyConfig = {
      name: this.config.name,
      logo: this.config.logo ? {
        light: this.config.logo,
        dark: this.config.logo
      } : undefined,
      favicon: '/images/favicon.png',
      colors: {
        primary: this.config.primaryColor || '#0D9373',
        light: '#07C983',
        dark: '#0D9373'
      },
      topbarLinks: [
        {
          name: 'Documentation',
          url: '/'
        }
      ],
      topbarCtaButton: this.config.domain ? {
        name: 'Get Started',
        url: this.config.domain
      } : undefined,
      navigation: [
        {
          group: 'Getting Started',
          pages: ['introduction']
        },
        ...navigation
      ],
      footerSocials: {
        github: this.config.github,
        twitter: this.config.twitter,
        linkedin: this.config.linkedin
      },
      // Analytics
      analytics: this.buildAnalyticsConfig(),
      // Feedback
      feedback: this.config.enableFeedback ? {
        thumbsRating: true,
        suggestEdit: true,
        raiseIssue: true
      } : undefined,
      // API Configuration
      api: this.config.apiBaseUrl ? {
        baseUrl: this.config.apiBaseUrl,
        auth: {
          method: 'bearer' as const
        },
        playground: this.config.enableApiPlayground ? {
          mode: 'simple' as const
        } : undefined
      } : undefined,
      // OpenAPI
      openapi: this.config.openapi,
      // Versioning
      versions: this.config.versions,
      // Tabs
      tabs: this.config.tabs,
      // Search
      search: {
        prompt: `Search ${this.config.name} documentation...`
      },
      // Mode toggle
      modeToggle: {
        default: 'light' as const
      }
    };

    await fs.writeFile(
      path.join(this.outputPath, 'mint.json'),
      JSON.stringify(mintConfig, null, 2)
    );
  }

  /**
   * Build analytics configuration
   */
  private buildAnalyticsConfig(): MintlifyConfig['analytics'] | undefined {
    const analytics: MintlifyConfig['analytics'] = {};
    
    if (this.config.googleAnalytics) {
      analytics.ga4 = { measurementId: this.config.googleAnalytics };
    }
    if (this.config.mixpanel) {
      analytics.mixpanel = { projectToken: this.config.mixpanel };
    }
    if (this.config.posthog) {
      analytics.posthog = { apiKey: this.config.posthog };
    }
    
    return Object.keys(analytics).length > 0 ? analytics : undefined;
  }

  /**
   * Generate home page
   */
  private async generateHomePage(): Promise<void> {
    const homepage = `---
title: Welcome to ${this.config.name}
description: ${this.config.description || `Complete documentation for ${this.config.name}`}
---

# Welcome to ${this.config.name}

${this.config.description || `This documentation provides comprehensive information about ${this.config.name}.`}

## Quick Links

<CardGroup cols={2}>
  <Card title="Getting Started" icon="rocket" href="/getting-started">
    Learn the basics and get up and running quickly
  </Card>
  <Card title="API Reference" icon="code" href="/api-reference">
    Complete API documentation and examples
  </Card>
  <Card title="Guides" icon="book" href="/guides">
    Step-by-step guides and tutorials
  </Card>
  <Card title="Examples" icon="lightbulb" href="/examples">
    Real-world examples and use cases
  </Card>
</CardGroup>

## Features

<AccordionGroup>
  <Accordion title="Complete API Documentation" icon="book-open">
    Comprehensive reference for all API endpoints, parameters, and responses with interactive examples.
  </Accordion>
  <Accordion title="Code Examples" icon="code">
    Real-world examples in multiple programming languages including JavaScript, Python, Go, and more.
  </Accordion>
  <Accordion title="Interactive Playground" icon="play">
    Test API endpoints directly from the documentation with our built-in API playground.
  </Accordion>
  <Accordion title="Comprehensive Guides" icon="map">
    Step-by-step tutorials and guides to help you integrate quickly and effectively.
  </Accordion>
</AccordionGroup>

## Popular Endpoints

<Tabs>
  <Tab title="Authentication">
    \`\`\`javascript
    const response = await fetch('${this.config.apiBaseUrl || 'https://api.example.com'}/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    \`\`\`
  </Tab>
  <Tab title="Data Retrieval">
    \`\`\`javascript
    const response = await fetch('${this.config.apiBaseUrl || 'https://api.example.com'}/data', {
      headers: { 'Authorization': \`Bearer \${apiKey}\` }
    });
    \`\`\`
  </Tab>
  <Tab title="Updates">
    \`\`\`javascript
    const response = await fetch('${this.config.apiBaseUrl || 'https://api.example.com'}/resource/123', {
      method: 'PUT',
      headers: { 
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });
    \`\`\`
  </Tab>
</Tabs>

<Note>
  **New to our API?** Start with our [Quickstart Guide](/quickstart) to make your first API call in under 5 minutes.
</Note>

## What's Next?

<Steps>
  <Step title="Get API Keys">
    Sign up and generate your API keys from the [dashboard](${this.config.domain || 'https://app.example.com'}).
  </Step>
  <Step title="Make Your First Request">
    Follow our [quickstart guide](/quickstart) to send your first API request.
  </Step>
  <Step title="Explore Features">
    Browse our [API reference](/api-reference) to discover all available endpoints.
  </Step>
  <Step title="Build Your Integration">
    Use our [SDKs](/sdks) and [guides](/guides) to build your integration.
  </Step>
</Steps>

<Warning>
  **Rate Limiting:** API requests are rate-limited to 100 requests per minute. See our [Rate Limiting Guide](/guides/rate-limits) for details.
</Warning>

---

<Info>
  **Need help?** Join our [community Discord](https://discord.gg/example) or [contact support](mailto:support@example.com).
</Info>
`;

    await fs.writeFile(
      path.join(this.outputPath, 'introduction.mdx'),
      homepage
    );
  }

  /**
   * Generate package.json
   */
  private async generatePackageJson(): Promise<void> {
    const packageJson = {
      name: this.slugify(this.config.name),
      version: '1.0.0',
      description: this.config.description || `Documentation for ${this.config.name}`,
      scripts: {
        dev: 'mintlify dev',
        install: 'mintlify install'
      },
      devDependencies: {
        mintlify: 'latest'
      }
    };

    await fs.writeFile(
      path.join(this.outputPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  /**
   * Generate README
   */
  private async generateReadme(): Promise<void> {
    const readme = `# ${this.config.name} Documentation

This is a Mintlify documentation site, auto-generated from scraped documentation.

## 🚀 Development

### Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Run Locally

\`\`\`bash
npx mintlify dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your documentation.

## 📝 Customization

### Update Configuration

Edit \`mint.json\` to customize:
- Site name and branding
- Colors and theme
- Navigation structure
- Social links
- Analytics

### Add Logo

1. Add your logo to \`/images/logo.png\`
2. Update \`mint.json\`:
   \`\`\`json
   {
     "logo": {
       "light": "/images/logo-light.png",
       "dark": "/images/logo-dark.png"
     }
   }
   \`\`\`

### Customize Colors

Edit \`mint.json\`:
\`\`\`json
{
  "colors": {
    "primary": "#your-color",
    "light": "#your-light-color",
    "dark": "#your-dark-color"
  }
}
\`\`\`

### Add Custom Domain

1. Edit \`mint.json\`:
   \`\`\`json
   {
     "domain": "docs.yourdomain.com"
   }
   \`\`\`
2. Configure DNS (see Mintlify docs)

## 🌐 Deployment

### Deploy to Mintlify

1. **Sign up** at [mintlify.com](https://mintlify.com)

2. **Connect GitHub:**
   - Create a new repo
   - Push this code:
     \`\`\`bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin <your-repo-url>
     git push -u origin main
     \`\`\`

3. **Link to Mintlify:**
   - Go to Mintlify dashboard
   - Click "New Documentation"
   - Connect your GitHub repo
   - Select the branch (main)
   - Deploy!

4. **Custom Domain (optional):**
   - In Mintlify dashboard, go to Settings
   - Add your custom domain
   - Update DNS records as instructed

### Deploy to Vercel/Netlify

Mintlify sites can also deploy to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

See [Mintlify deployment docs](https://mintlify.com/docs/deploy) for details.

## 📚 Documentation Structure

\`\`\`
.
├── mint.json           # Main configuration
├── introduction.mdx    # Home page
├── api-reference/      # API documentation
├── guides/             # User guides
└── images/             # Images and assets
\`\`\`

## ✨ Features

- ✅ Auto-generated from scraped documentation
- ✅ Mintlify-optimized structure
- ✅ Clean, formatted markdown
- ✅ Organized navigation
- ✅ Ready to deploy

## 🎨 Branding

To fully rebrand this documentation:

1. **Replace logo** in \`/images/\`
2. **Update colors** in \`mint.json\`
3. **Customize home page** in \`introduction.mdx\`
4. **Add custom domain** in \`mint.json\`
5. **Update social links** in \`mint.json\`
6. **Modify content** in markdown files as needed

## 📖 Learn More

- [Mintlify Documentation](https://mintlify.com/docs)
- [Mintlify Examples](https://mintlify.com/showcase)
- [Mintlify Community](https://mintlify.com/community)

## 🤝 Contributing

To update this documentation:

1. Edit markdown files
2. Test locally with \`npx mintlify dev\`
3. Commit and push changes
4. Mintlify auto-deploys on push

---

**Generated by:** Mintlify Publisher  
**Source:** ${this.docsPath}  
**Generated:** ${new Date().toISOString()}
`;

    await fs.writeFile(
      path.join(this.outputPath, 'README.md'),
      readme
    );
  }

  /**
   * Generate .gitignore
   */
  private async generateGitignore(): Promise<void> {
    const gitignore = `# Dependencies
node_modules/
.pnp
.pnp.js

# Mintlify
.mintlify/

# Testing
coverage/

# Production
build/
dist/

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Editor
.vscode/
.idea/
*.swp
*.swo
*~
`;

    await fs.writeFile(
      path.join(this.outputPath, '.gitignore'),
      gitignore
    );
  }

  /**
   * Generate example documentation pages showcasing all Mintlify components
   */
  private async generateExamplePages(): Promise<void> {
    await fs.mkdir(path.join(this.outputPath, 'examples'), { recursive: true });
    
    // API Reference Example
    const apiExample = `---
title: API Reference Example
description: Example showing all API documentation components
---

# API Reference

This page demonstrates API documentation components.

## Authentication

<ParamField path="api_key" type="string" required>
  Your API key from the [dashboard](${this.config.domain || 'https://app.example.com'}/api-keys)
</ParamField>

<ParamField header="Authorization" type="string" required>
  Bearer token for authentication. Format: \`Bearer YOUR_API_KEY\`
</ParamField>

## Create Resource

<CodeGroup>

\`\`\`javascript JavaScript
const response = await fetch('${this.config.apiBaseUrl || 'https://api.example.com'}/resource', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Resource',
    type: 'example'
  })
});
\`\`\`

\`\`\`python Python
import requests

response = requests.post(
    '${this.config.apiBaseUrl || 'https://api.example.com'}/resource',
    headers={
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    },
    json={
        'name': 'My Resource',
        'type': 'example'
    }
)
\`\`\`

\`\`\`go Go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

func main() {
    data := map[string]string{
        "name": "My Resource",
        "type": "example",
    }
    jsonData, _ := json.Marshal(data)
    
    req, _ := http.NewRequest("POST", "${this.config.apiBaseUrl || 'https://api.example.com'}/resource", bytes.NewBuffer(jsonData))
    req.Header.Set("Authorization", "Bearer " + API_KEY)
    req.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, _ := client.Do(req)
}
\`\`\`

</CodeGroup>

### Request Parameters

<ParamField body="name" type="string" required>
  The name of the resource to create
</ParamField>

<ParamField body="type" type="string">
  The type of resource. Defaults to \`default\`
</ParamField>

<ParamField body="metadata" type="object">
  Optional metadata object
  
  <Expandable title="metadata properties">
    <ParamField body="metadata.tags" type="string[]">
      Array of tags to associate with the resource
    </ParamField>
    <ParamField body="metadata.priority" type="number">
      Priority level (1-10)
    </ParamField>
  </Expandable>
</ParamField>

### Response

<ResponseField name="id" type="string">
  Unique identifier for the created resource
</ResponseField>

<ResponseField name="name" type="string">
  The name of the resource
</ResponseField>

<ResponseField name="created_at" type="timestamp">
  ISO 8601 timestamp of when the resource was created
</ResponseField>

<ResponseExample>
\`\`\`json
{
  "id": "res_1234567890",
  "name": "My Resource",
  "type": "example",
  "created_at": "2025-12-06T10:30:00Z"
}
\`\`\`
</ResponseExample>
`;

    await fs.writeFile(
      path.join(this.outputPath, 'examples/api-reference.mdx'),
      apiExample
    );

    // Components Example
    const componentsExample = `---
title: Components Showcase
description: All Mintlify MDX components in one place
---

# Mintlify Components

This page showcases all available Mintlify components.

## Callouts

<Note>
  **Note:** This is a note callout for general information.
</Note>

<Info>
  **Info:** Use this for helpful tips and additional context.
</Info>

<Tip>
  **Tip:** Share best practices and recommendations here.
</Tip>

<Warning>
  **Warning:** Alert users about important considerations.
</Warning>

<Check>
  ✅ **Success:** Confirm successful operations or outcomes.
</Check>

## Accordions

<AccordionGroup>
  <Accordion title="How do I get started?" icon="rocket">
    Getting started is easy! Just follow our [quickstart guide](/quickstart) to make your first API call in under 5 minutes.
  </Accordion>
  
  <Accordion title="How do I authenticate?" icon="key">
    Authentication uses Bearer tokens. Get your API key from the dashboard and include it in the Authorization header.
  </Accordion>
  
  <Accordion title="What are rate limits?" icon="gauge">
    API requests are limited to 100 requests per minute. Enterprise plans have higher limits.
  </Accordion>
</AccordionGroup>

## Tabs

<Tabs>
  <Tab title="Overview">
    This is the overview content. Tabs are great for organizing related information.
  </Tab>
  
  <Tab title="Features">
    - Feature 1: High performance
    - Feature 2: Easy integration
    - Feature 3: Great documentation
  </Tab>
  
  <Tab title="Pricing">
    Check out our flexible pricing options for every team size.
  </Tab>
</Tabs>

## Steps

<Steps>
  <Step title="Install the SDK">
    \`\`\`bash
    npm install @example/sdk
    \`\`\`
  </Step>
  
  <Step title="Initialize the client">
    \`\`\`javascript
    import { Client } from '@example/sdk';
    const client = new Client({ apiKey: 'your-api-key' });
    \`\`\`
  </Step>
  
  <Step title="Make your first request">
    \`\`\`javascript
    const response = await client.getData();
    console.log(response);
    \`\`\`
  </Step>
</Steps>

## Code Groups

<CodeGroup>

\`\`\`javascript Node.js
const sdk = require('@example/sdk');
const client = new sdk.Client('api-key');
\`\`\`

\`\`\`python Python
from example_sdk import Client
client = Client('api-key')
\`\`\`

\`\`\`ruby Ruby
require 'example_sdk'
client = ExampleSDK::Client.new('api-key')
\`\`\`

\`\`\`php PHP
use Example\\SDK\\Client;
$client = new Client('api-key');
\`\`\`

</CodeGroup>

## Cards

<CardGroup cols={3}>
  <Card title="Documentation" icon="book" href="/docs">
    Browse complete documentation
  </Card>
  <Card title="API Reference" icon="code" href="/api">
    Detailed API reference
  </Card>
  <Card title="SDKs" icon="download" href="/sdks">
    Official client libraries
  </Card>
  <Card title="Guides" icon="map" href="/guides">
    Step-by-step tutorials
  </Card>
  <Card title="Community" icon="users" href="https://discord.gg/example">
    Join our Discord
  </Card>
  <Card title="Support" icon="life-ring" href="/support">
    Get help
  </Card>
</CardGroup>

## Frames

<Frame>
  <img src="/images/screenshot.png" alt="Example Screenshot" />
</Frame>

<Frame caption="A beautiful diagram">
  <img src="/images/diagram.png" alt="Architecture Diagram" />
</Frame>
`;

    await fs.writeFile(
      path.join(this.outputPath, 'examples/components.mdx'),
      componentsExample
    );
  }

  /**
   * Generate reusable snippets
   */
  private async generateSnippets(): Promise<void> {
    await fs.mkdir(path.join(this.outputPath, 'snippets'), { recursive: true });
    
    // API Key snippet
    const apiKeySnippet = `To get your API key:

1. Log in to your [dashboard](${this.config.domain || 'https://app.example.com'})
2. Navigate to **Settings** → **API Keys**
3. Click **Create New Key**
4. Copy and securely store your key

<Warning>
  Keep your API keys secure! Never commit them to version control or share them publicly.
</Warning>`;

    await fs.writeFile(
      path.join(this.outputPath, 'snippets/api-key.mdx'),
      apiKeySnippet
    );

    // Rate limits snippet
    const rateLimitsSnippet = `## Rate Limits

Our API enforces the following rate limits:

| Plan | Requests per Minute | Burst Limit |
|------|---------------------|-------------|
| Free | 10 | 20 |
| Pro | 100 | 200 |
| Enterprise | 1,000 | 2,000 |

<Info>
  Rate limit headers are included in every API response. Monitor \`X-RateLimit-Remaining\` to avoid hitting limits.
</Info>`;

    await fs.writeFile(
      path.join(this.outputPath, 'snippets/rate-limits.mdx'),
      rateLimitsSnippet
    );

    // Error handling snippet
    const errorHandlingSnippet = `## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "error": {
    "code": "invalid_request",
    "message": "The request was invalid",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
\`\`\`

### Common Error Codes

- \`invalid_request\` - Malformed request
- \`unauthorized\` - Invalid or missing API key
- \`forbidden\` - Insufficient permissions
- \`not_found\` - Resource not found
- \`rate_limit_exceeded\` - Too many requests
- \`internal_error\` - Server error`;

    await fs.writeFile(
      path.join(this.outputPath, 'snippets/error-handling.mdx'),
      errorHandlingSnippet
    );
  }

  /**
   * Utilities
   */
  private formatSectionName(section: string): string {
    return section
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Mintlify Site Publisher
=======================

Convert scraped documentation into a deployable Mintlify site

Usage:
  npm run publish-mintlify -- <docs-path> [options]

Examples:
  # Basic publish
  npm run publish-mintlify -- ./scraped-docs/privy

  # Custom output location
  npm run publish-mintlify -- ./scraped-docs/stripe --output ./my-docs-site

  # With custom configuration
  npm run publish-mintlify -- ./scraped-docs/api \\
    --name "My API Docs" \\
    --description "Complete API documentation" \\
    --domain https://docs.myapi.com \\
    --color "#FF6B6B" \\
    --github https://github.com/user/repo

Options:
  --output <dir>          Output directory (default: ./mintlify-site)
  --name <name>           Site name (default: from docs)
  --description <text>    Site description
  --domain <url>          Your domain
  --color <hex>           Primary color (hex code)
  --logo <path>           Logo path
  --github <url>          GitHub URL
  --twitter <url>         Twitter URL
  --linkedin <url>        LinkedIn URL
  --ga4 <id>              Google Analytics 4 measurement ID
  --mixpanel <token>      Mixpanel project token
  --posthog <key>         PostHog API key
  --enable-feedback       Enable feedback widgets
  --enable-api-playground Enable interactive API playground
  --api-base-url <url>    Base URL for API
  --openapi <url>         OpenAPI specification URL
  --help                  Show this help

Output:
  <output>/
  ├── mint.json           # Mintlify configuration
  ├── introduction.mdx    # Home page
  ├── package.json        # Dependencies
  ├── README.md           # Deployment guide
  ├── .gitignore          # Git configuration
  ├── api-reference/      # API docs
  ├── guides/             # User guides
  └── images/             # Assets

What This Does:
  ✅ Converts scraped docs to Mintlify format
  ✅ Generates mint.json configuration
  ✅ Creates navigation structure
  ✅ Cleans markdown for Mintlify
  ✅ Sets up for deployment
  ✅ Ready to customize and deploy

Perfect For:
  🎨 Rebranding competitor documentation
  📚 Consolidating multiple doc sites
  🚀 Migrating to Mintlify
  🏷️  White-labeling documentation
  🌐 Hosting docs on your domain
    `);
    process.exit(0);
  }

  const docsPath = args[0];
  const outputIdx = args.indexOf('--output');
  const nameIdx = args.indexOf('--name');
  const descIdx = args.indexOf('--description');
  const domainIdx = args.indexOf('--domain');
  const colorIdx = args.indexOf('--color');
  const logoIdx = args.indexOf('--logo');
  const githubIdx = args.indexOf('--github');
  const twitterIdx = args.indexOf('--twitter');
  const linkedinIdx = args.indexOf('--linkedin');
  const ga4Idx = args.indexOf('--ga4');
  const mixpanelIdx = args.indexOf('--mixpanel');
  const posthogIdx = args.indexOf('--posthog');
  const apiBaseUrlIdx = args.indexOf('--api-base-url');
  const openapiIdx = args.indexOf('--openapi');

  const config: SiteConfig = {
    name: nameIdx !== -1 ? args[nameIdx + 1] : path.basename(docsPath),
    description: descIdx !== -1 ? args[descIdx + 1] : undefined,
    domain: domainIdx !== -1 ? args[domainIdx + 1] : undefined,
    primaryColor: colorIdx !== -1 ? args[colorIdx + 1] : undefined,
    logo: logoIdx !== -1 ? args[logoIdx + 1] : undefined,
    github: githubIdx !== -1 ? args[githubIdx + 1] : undefined,
    twitter: twitterIdx !== -1 ? args[twitterIdx + 1] : undefined,
    linkedin: linkedinIdx !== -1 ? args[linkedinIdx + 1] : undefined,
    googleAnalytics: ga4Idx !== -1 ? args[ga4Idx + 1] : undefined,
    mixpanel: mixpanelIdx !== -1 ? args[mixpanelIdx + 1] : undefined,
    posthog: posthogIdx !== -1 ? args[posthogIdx + 1] : undefined,
    enableFeedback: args.includes('--enable-feedback'),
    enableApiPlayground: args.includes('--enable-api-playground'),
    apiBaseUrl: apiBaseUrlIdx !== -1 ? args[apiBaseUrlIdx + 1] : undefined,
    openapi: openapiIdx !== -1 ? args[openapiIdx + 1] : undefined,
  };

  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : undefined;

  const publisher = new MintlifyPublisher(docsPath, outputPath, config);
  
  try {
    await publisher.publish();
  } catch (error) {
    console.error('❌ Publishing failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { MintlifyPublisher };
