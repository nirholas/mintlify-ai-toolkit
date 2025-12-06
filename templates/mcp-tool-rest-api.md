# MCP Tool Definition Template (REST API)

Use this template when generating MCP tools from REST API documentation.

## Tool Structure

```json
{
  "name": "section_action_description",
  "description": "Clear description of what this tool does",
  "inputSchema": {
    "type": "object",
    "properties": {
      "parameterName": {
        "type": "string | number | boolean | array | object",
        "description": "What this parameter does"
      }
    },
    "required": ["list", "of", "required", "params"]
  }
}
```

## Naming Convention

**Pattern:** `{section}_{action}_{resource}`

**Examples:**
- `accounts_get_balance` - Get account balance
- `transactions_list_by_address` - List transactions for address
- `tokens_get_metadata` - Get token metadata
- `swap_execute_trade` - Execute swap trade

**Rules:**
- Use lowercase with underscores
- Start with section/category
- Use verb (get, list, create, update, delete)
- End with resource name

## Input Schema Types

### String Parameters
```json
{
  "address": {
    "type": "string",
    "description": "Ethereum address (0x...)"
  }
}
```

### Number Parameters
```json
{
  "chainId": {
    "type": "number",
    "description": "Chain ID (1 for mainnet, 56 for BSC)"
  }
}
```

### Boolean Parameters
```json
{
  "includePending": {
    "type": "boolean",
    "description": "Include pending transactions"
  }
}
```

### Enum Parameters
```json
{
  "sort": {
    "type": "string",
    "enum": ["asc", "desc"],
    "description": "Sort order"
  }
}
```

### Array Parameters
```json
{
  "addresses": {
    "type": "array",
    "items": { "type": "string" },
    "description": "List of addresses to query"
  }
}
```

### Object Parameters
```json
{
  "filters": {
    "type": "object",
    "properties": {
      "minAmount": { "type": "number" },
      "maxAmount": { "type": "number" }
    },
    "description": "Filter criteria"
  }
}
```

## Complete Example

```json
{
  "name": "swap_get_quote",
  "description": "Get the best swap quote across multiple DEXes for a token pair",
  "inputSchema": {
    "type": "object",
    "properties": {
      "fromTokenAddress": {
        "type": "string",
        "description": "Source token contract address"
      },
      "toTokenAddress": {
        "type": "string",
        "description": "Destination token contract address"
      },
      "amount": {
        "type": "string",
        "description": "Amount to swap in smallest unit (wei)"
      },
      "chainId": {
        "type": "number",
        "description": "Blockchain network ID (1=Ethereum, 56=BSC)"
      },
      "slippage": {
        "type": "number",
        "description": "Max slippage percentage (default: 1.0)"
      },
      "protocols": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Specific protocols to use (optional)"
      }
    },
    "required": ["fromTokenAddress", "toTokenAddress", "amount"]
  }
}
```

## Required vs Optional

**Required:** Parameters that MUST be provided
```json
"required": ["address", "chainId"]
```

**Optional:** Parameters with defaults or not always needed
- Don't list in required array
- Add description of default value

## Description Best Practices

✅ **Good descriptions:**
- "Ethereum address of the token holder (0x...)"
- "Amount in smallest unit (wei for ETH, satoshi for BTC)"
- "Chain ID (1=Ethereum mainnet, 56=BSC, 137=Polygon)"

❌ **Bad descriptions:**
- "The address" (too vague)
- "Amount" (what unit?)
- "Network" (be specific)

## Categories

Organize tools by category:

### DeFi
- `swap_*` - DEX swaps
- `liquidity_*` - Liquidity pools
- `stake_*` - Staking operations
- `lend_*` - Lending protocols
- `farm_*` - Yield farming

### Blockchain
- `accounts_*` - Account queries
- `transactions_*` - Transaction operations
- `blocks_*` - Block information
- `contracts_*` - Smart contracts

### Tokens
- `tokens_get_*` - Token information
- `tokens_transfer_*` - Token transfers
- `nft_*` - NFT operations

### Analytics
- `analytics_*` - Data analytics
- `portfolio_*` - Portfolio tracking
- `stats_*` - Statistics

## Validation Rules

1. **Name:** lowercase, underscores only, descriptive
2. **Description:** Clear, concise, under 200 chars
3. **Parameters:** Meaningful names, not generic
4. **Types:** Use correct JSON schema types
5. **Required:** Only truly required parameters
6. **Descriptions:** Explain format, units, defaults

## Auto-Generation from Docs

When parsing API docs, look for:

1. **Endpoint:** `GET /api/v1/accounts/{address}/balance`
   - Extract: action (get), resource (balance)
   
2. **Parameters:** Usually in tables
   - Extract: name, type, required, description
   
3. **Description:** First paragraph or summary
   - Use as tool description
   
4. **Examples:** Code blocks
   - Extract parameter examples for validation

## Template Checklist

- [ ] Name follows convention
- [ ] Description is clear and concise
- [ ] All parameters have types
- [ ] All parameters have descriptions
- [ ] Required parameters listed
- [ ] Optional parameters have defaults documented
- [ ] Enums defined where applicable
- [ ] Examples would work in practice

---

[View on GitHub](https://github.com/nirholas/mintlify-ai-toolkit)