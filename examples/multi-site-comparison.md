# Scraping Multiple Sites: Comparing Documentation

Example workflow for scraping and comparing documentation across multiple similar services.

## Use Case: Compare Embedded Wallet Solutions

Let's compare Privy, Dynamic, and Web3Auth documentation.

## Step 1: Scrape All Three

```bash
# Scrape Privy
npm run scrape -- https://docs.privy.io \
  --output ./wallets/privy \
  --zip

# Scrape Dynamic (if Mintlify-based)
npm run scrape -- https://docs.dynamic.xyz \
  --output ./wallets/dynamic \
  --zip

# Scrape Web3Auth (if Mintlify-based)
npm run scrape -- https://docs.web3auth.io \
  --output ./wallets/web3auth \
  --zip
```

## Step 2: Compare Features

```bash
# Search for specific features across all docs

# Authentication methods
grep -r "social login" wallets/*/COMPLETE.md
grep -r "email" wallets/*/COMPLETE.md
grep -r "oauth" wallets/*/COMPLETE.md

# Wallet features
grep -r "embedded wallet" wallets/*/COMPLETE.md
grep -r "mpc" wallets/*/COMPLETE.md
grep -r "key management" wallets/*/COMPLETE.md

# Supported chains
grep -r "ethereum" wallets/*/COMPLETE.md
grep -r "solana" wallets/*/COMPLETE.md
grep -r "polygon" wallets/*/COMPLETE.md
```

## Step 3: Compare Pricing (if documented)

```bash
# Search for pricing info
grep -i "pricing\|price\|cost\|plan" wallets/*/COMPLETE.md
```

## Step 4: Compare API Complexity

```bash
# Check metadata for API endpoints count
cat wallets/privy/metadata.json | jq '.pages | length'
cat wallets/dynamic/metadata.json | jq '.pages | length'
cat wallets/web3auth/metadata.json | jq '.pages | length'

# Check sections
cat wallets/*/metadata.json | jq '.sections'
```

## Step 5: Create Comparison Document

```bash
# Combine key pages for side-by-side comparison
cat << 'EOF' > wallet-comparison.md
# Embedded Wallet Solutions Comparison

## Authentication

### Privy
$(grep -A 20 "## Authentication" wallets/privy/COMPLETE.md)

### Dynamic
$(grep -A 20 "## Authentication" wallets/dynamic/COMPLETE.md)

### Web3Auth
$(grep -A 20 "## Authentication" wallets/web3auth/COMPLETE.md)

## Pricing

### Privy
$(grep -i -A 10 "pricing" wallets/privy/COMPLETE.md)

...
EOF
```

## Step 6: AI-Assisted Comparison

Load all three COMPLETE.md files into your AI:

```
I have documentation for three embedded wallet solutions:

1. Privy: wallets/privy/COMPLETE.md
2. Dynamic: wallets/dynamic/COMPLETE.md  
3. Web3Auth: wallets/web3auth/COMPLETE.md

Please create a comparison table showing:
- Authentication methods supported
- Wallet types (custodial, non-custodial, MPC)
- Supported chains
- Key differentiators
- Pricing model (if documented)
- Developer experience (SDK complexity)

Then recommend which is best for:
1. Consumer app (ease of use priority)
2. DeFi app (security priority)
3. Multi-chain app (chain support priority)
```

## Result

You now have:
- ✅ Complete documentation for all three services
- ✅ Ability to grep/search across all docs
- ✅ Structured data for comparison
- ✅ Offline reference for all three
- ✅ Foundation for informed decision

**Time spent:** 15-20 minutes  
**Alternative:** Days of manual research across three sites  
**Benefit:** Data-driven decision with complete information

## Bonus: Track Changes Over Time

```bash
# Save dated versions
mkdir -p archives/2025-12-06
cp wallets/privy.zip archives/2025-12-06/
cp wallets/dynamic.zip archives/2025-12-06/

# Re-scrape monthly to track changes
# Compare old vs new to see what changed
diff archives/2025-12-06/privy/COMPLETE.md wallets/privy/COMPLETE.md
```

## Use Case 2: Multi-Chain Explorer Docs

```bash
# Scrape blockchain explorer docs
npm run scrape -- https://docs.etherscan.io --output ./explorers/ethereum --zip
npm run scrape -- https://docs.bscscan.com --output ./explorers/bsc --zip
npm run scrape -- https://docs.polygonscan.com --output ./explorers/polygon --zip

# Now you have unified documentation for all explorers
# Perfect for building a multi-chain MCP server
```

## Use Case 3: DeFi Protocol Integration

```bash
# Scrape DeFi protocol docs
npm run scrape -- https://docs.uniswap.org --output ./defi/uniswap --zip
npm run scrape -- https://docs.aave.com --output ./defi/aave --zip
npm run scrape -- https://docs.compound.finance --output ./defi/compound --zip

# Compare APIs
grep -r "swap" defi/*/COMPLETE.md
grep -r "liquidity" defi/*/COMPLETE.md
grep -r "lending" defi/*/COMPLETE.md
```

## Tips for Multi-Site Scraping

1. **Use consistent output structure:**
   ```bash
   ./docs/
   ├── service1/
   ├── service2/
   └── service3/
   ```

2. **Always use --zip for archiving:**
   ```bash
   --zip
   # Creates easy-to-share archives
   ```

3. **Scrape at different times to avoid rate limits:**
   ```bash
   # Scrape site 1
   npm run scrape -- site1.com --output ./docs/site1
   
   # Wait 5-10 minutes
   
   # Scrape site 2
   npm run scrape -- site2.com --output ./docs/site2
   ```

4. **Use metadata.json for programmatic comparison:**
   ```javascript
   const privy = require('./wallets/privy/metadata.json');
   const dynamic = require('./wallets/dynamic/metadata.json');
   
   console.log('Privy pages:', privy.totalPages);
   console.log('Dynamic pages:', dynamic.totalPages);
   ```
