# Batch Scraping Guide

Scrape multiple documentation sites simultaneously with intelligent job scheduling and resource management.

## Overview

The batch scraper allows you to:
- ✅ Scrape 5, 10, 50+ sites in one command
- ✅ Control parallelism (how many at once)
- ✅ Set job priorities
- ✅ Continue on errors
- ✅ Track progress per job
- ✅ Get detailed results report

## Quick Start

### 1. Create Batch Configuration

```json
{
  "maxParallel": 3,
  "continueOnError": true,
  "jobs": [
    {
      "id": "privy",
      "name": "Privy Documentation",
      "url": "https://docs.privy.io",
      "outputDir": "./output/privy",
      "priority": 10
    },
    {
      "id": "etherscan",
      "name": "Etherscan Docs",
      "url": "https://docs.etherscan.io",
      "outputDir": "./output/etherscan",
      "priority": 8
    }
  ]
}
```

### 2. Run Batch Scrape

```bash
npm run batch-scrape -- ./batch-config.json
```

### 3. Check Results

Results are saved to `batch-config-results.json`:

```json
{
  "timestamp": "2024-12-06T10:00:00Z",
  "total": 2,
  "completed": 2,
  "failed": 0,
  "jobs": [
    {
      "id": "privy",
      "status": "completed",
      "stats": {
        "pages": 150,
        "duration": 45000,
        "codeExamples": 234
      }
    }
  ]
}
```

## Configuration Options

### Batch Settings

```json
{
  "maxParallel": 3,
  "$comment": "How many sites to scrape simultaneously",
  
  "continueOnError": true,
  "$comment": "Keep going if one job fails",
  
  "globalConfig": {
    "$comment": "Default config applied to all jobs",
    "trieve": { "enabled": true },
    "output": { "format": "markdown" }
  }
}
```

### Job Definition

Each job can use one of three methods:

#### Method 1: Simple URL

```json
{
  "id": "unique-id",
  "name": "Display Name",
  "url": "https://docs.example.com",
  "outputDir": "./output/example",
  "priority": 10
}
```

#### Method 2: Config File

```json
{
  "id": "stripe",
  "name": "Stripe API",
  "configFile": "./configs/stripe.json",
  "outputDir": "./output/stripe",
  "priority": 9
}
```

#### Method 3: Inline Config

```json
{
  "id": "custom",
  "name": "Custom Site",
  "config": {
    "start_urls": ["https://api.example.com"],
    "selectors": {
      "default": {
        "lvl0": "h1",
        "text": "p"
      }
    }
  },
  "outputDir": "./output/custom",
  "priority": 5
}
```

## Priority System

Jobs are processed by priority (higher = first):

```json
{
  "jobs": [
    {
      "id": "critical",
      "priority": 10,
      "$comment": "Runs first"
    },
    {
      "id": "important",
      "priority": 8,
      "$comment": "Runs second"
    },
    {
      "id": "normal",
      "priority": 5,
      "$comment": "Runs third"
    }
  ]
}
```

With `maxParallel: 3`, all three start simultaneously. With `maxParallel: 2`, the highest two start first.

## Use Cases

### 1. Scrape Multiple Related Projects

```json
{
  "maxParallel": 4,
  "jobs": [
    { "url": "https://docs.1inch.io", "outputDir": "./defi/1inch" },
    { "url": "https://docs.uniswap.org", "outputDir": "./defi/uniswap" },
    { "url": "https://docs.aave.com", "outputDir": "./defi/aave" },
    { "url": "https://docs.compound.finance", "outputDir": "./defi/compound" }
  ]
}
```

### 2. Scrape Company Documentation Suite

```json
{
  "maxParallel": 3,
  "jobs": [
    {
      "name": "API Docs",
      "url": "https://api.company.com/docs",
      "priority": 10
    },
    {
      "name": "SDKs",
      "url": "https://sdks.company.com/docs",
      "priority": 8
    },
    {
      "name": "Guides",
      "url": "https://guides.company.com",
      "priority": 5
    }
  ]
}
```

### 3. Scrape with Different Configs

```json
{
  "maxParallel": 2,
  "jobs": [
    {
      "name": "Public Docs",
      "configFile": "./configs/public.json",
      "outputDir": "./output/public"
    },
    {
      "name": "Internal Docs",
      "configFile": "./configs/internal-auth.json",
      "outputDir": "./output/internal"
    }
  ]
}
```

## Global Configuration

Apply settings to all jobs:

```json
{
  "globalConfig": {
    "trieve": { "enabled": true },
    "output": {
      "format": "markdown",
      "structure": "per-section"
    },
    "crawling": {
      "max_concurrent": 3,
      "delay_ms": 1000
    },
    "authentication": {
      "type": "bearer",
      "token": "${DOCS_TOKEN}"
    }
  },
  "jobs": [
    {
      "$comment": "Inherits all globalConfig settings",
      "url": "https://docs.example.com",
      "outputDir": "./output/example"
    }
  ]
}
```

## Error Handling

### Continue on Error (Recommended)

```json
{
  "continueOnError": true,
  "$comment": "One failure doesn't stop the batch"
}
```

Output:
```
▶️  Starting: Site A
▶️  Starting: Site B
▶️  Starting: Site C
❌ Failed: Site B - Connection timeout
✅ Completed: Site A
✅ Completed: Site C

📊 Batch Summary:
   Total: 3
   ✅ Completed: 2
   ❌ Failed: 1
```

### Stop on First Error

```json
{
  "continueOnError": false,
  "$comment": "Stop entire batch if any job fails"
}
```

## Performance Tuning

### High Parallelism (Fast, High Load)

```json
{
  "maxParallel": 10,
  "globalConfig": {
    "crawling": {
      "max_concurrent": 5,
      "delay_ms": 500
    }
  }
}
```

⚠️ Use only if:
- You have good bandwidth
- Target servers can handle load
- You need speed over safety

### Low Parallelism (Slow, Safe)

```json
{
  "maxParallel": 2,
  "globalConfig": {
    "crawling": {
      "max_concurrent": 2,
      "delay_ms": 2000
    }
  }
}
```

✅ Use when:
- Being respectful to servers
- On limited bandwidth
- Scraping sensitive sites

## Example: Large-Scale Scrape

Scrape 20 blockchain project docs:

```json
{
  "maxParallel": 5,
  "continueOnError": true,
  "globalConfig": {
    "trieve": { "enabled": true },
    "output": { "structure": "per-section" },
    "crawling": { "delay_ms": 1000 }
  },
  "jobs": [
    { "id": "ethereum", "url": "https://docs.ethereum.org", "outputDir": "./web3/ethereum", "priority": 10 },
    { "id": "polygon", "url": "https://docs.polygon.technology", "outputDir": "./web3/polygon", "priority": 9 },
    { "id": "arbitrum", "url": "https://docs.arbitrum.io", "outputDir": "./web3/arbitrum", "priority": 9 },
    { "id": "optimism", "url": "https://docs.optimism.io", "outputDir": "./web3/optimism", "priority": 8 },
    { "id": "base", "url": "https://docs.base.org", "outputDir": "./web3/base", "priority": 8 },
    { "id": "avalanche", "url": "https://docs.avax.network", "outputDir": "./web3/avalanche", "priority": 7 },
    { "id": "solana", "url": "https://docs.solana.com", "outputDir": "./web3/solana", "priority": 7 },
    { "id": "cosmos", "url": "https://docs.cosmos.network", "outputDir": "./web3/cosmos", "priority": 6 },
    { "id": "near", "url": "https://docs.near.org", "outputDir": "./web3/near", "priority": 6 },
    { "id": "polkadot", "url": "https://docs.polkadot.network", "outputDir": "./web3/polkadot", "priority": 5 }
  ]
}
```

## Results File

The results JSON includes:

```json
{
  "timestamp": "2024-12-06T10:30:00Z",
  "total": 10,
  "completed": 9,
  "failed": 1,
  "jobs": [
    {
      "id": "ethereum",
      "name": "Ethereum Docs",
      "status": "completed",
      "startTime": "2024-12-06T10:00:00Z",
      "endTime": "2024-12-06T10:05:30Z",
      "stats": {
        "pages": 250,
        "duration": 330000,
        "codeExamples": 456
      }
    },
    {
      "id": "solana",
      "status": "failed",
      "error": "Connection timeout",
      "startTime": "2024-12-06T10:00:00Z",
      "endTime": "2024-12-06T10:02:00Z"
    }
  ]
}
```

## Command Line Usage

```bash
# Basic usage
npm run batch-scrape -- ./batch-config.json

# With custom script
node src/batch-scraper.js ./batch-config.json

# TypeScript
tsx src/batch-scraper.ts ./batch-config.json
```

## Tips & Best Practices

### 1. Start Small
Test with 2-3 sites before scaling to 50+

### 2. Use Priorities
Put critical documentation first in case of interruption

### 3. Monitor Resources
Watch CPU/memory/network during first run

### 4. Save Results
Results file is useful for:
- Identifying failed jobs to retry
- Performance analysis
- Documentation for your team

### 5. Use Global Config
Avoid repeating same settings across jobs

### 6. Test Auth Once
Verify authentication works on one site before batch

### 7. Estimate Time
Rough estimate: 1-5 minutes per site with Trieve API, 5-30 without

## Troubleshooting

### Issue: Jobs not starting

**Check:** `maxParallel` setting
```json
{ "maxParallel": 1 }  // Only one at a time
```

### Issue: Too many failures

**Solution:** Lower parallelism
```json
{ "maxParallel": 2 }  // Reduce from 5+ to 2
```

### Issue: Out of memory

**Solution:** Reduce concurrent jobs
```json
{
  "maxParallel": 2,
  "globalConfig": {
    "crawling": { "max_concurrent": 2 }
  }
}
```

### Issue: Rate limiting errors

**Solution:** Add delays
```json
{
  "globalConfig": {
    "crawling": {
      "delay_ms": 2000,
      "max_concurrent": 2
    }
  }
}
```

## Integration with CI/CD

### GitHub Actions

```yaml
name: Batch Scrape Documentation

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run batch-scrape -- ./batch-config.json
      - uses: actions/upload-artifact@v3
        with:
          name: scraped-docs
          path: ./output/
```

### Cron Job

```bash
# crontab -e
0 0 * * 0 cd /path/to/scraper && npm run batch-scrape -- ./batch-config.json
```

## See Also

- [Advanced Features Guide](../ADVANCED.md)
- [Configuration Reference](../scraper-config.schema.json)
- [Example Configs](../examples/configs/)
