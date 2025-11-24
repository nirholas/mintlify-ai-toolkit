# GraphQL API MCP Tool Template

Use this template when generating MCP tools from GraphQL API documentation.

## Tool Structure

```json
{
  "name": "graphql_query_name",
  "description": "What this GraphQL query/mutation does",
  "inputSchema": {
    "type": "object",
    "properties": {
      "variables": {
        "type": "object",
        "description": "GraphQL variables"
      }
    },
    "required": []
  }
}
```

## Naming Convention

**Pattern:** `{domain}_{operation}_{resource}`

**Examples:**
- `uniswap_query_pool` - Query pool information
- `thegraph_query_tokens` - Query tokens
- `lens_mutation_post` - Create a post

## GraphQL Query Example

### Source GraphQL
```graphql
query GetPool($poolId: ID!, $block: Int) {
  pool(id: $poolId, block: { number: $block }) {
    id
    token0 {
      symbol
      decimals
    }
    token1 {
      symbol
      decimals
    }
    liquidity
    volumeUSD
  }
}
```

### MCP Tool Definition
```json
{
  "name": "uniswap_query_pool",
  "description": "Get detailed information about a Uniswap liquidity pool including tokens and volume",
  "inputSchema": {
    "type": "object",
    "properties": {
      "poolId": {
        "type": "string",
        "description": "Pool contract address"
      },
      "block": {
        "type": "number",
        "description": "Block number for historical data (optional)"
      }
    },
    "required": ["poolId"]
  }
}
```

## GraphQL Mutation Example

### Source GraphQL
```graphql
mutation CreatePost($content: String!, $tags: [String!]) {
  createPost(input: { content: $content, tags: $tags }) {
    id
    content
    createdAt
  }
}
```

### MCP Tool Definition
```json
{
  "name": "lens_mutation_create_post",
  "description": "Create a new post on Lens Protocol with optional tags",
  "inputSchema": {
    "type": "object",
    "properties": {
      "content": {
        "type": "string",
        "description": "Post content text"
      },
      "tags": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Tags to categorize the post"
      }
    },
    "required": ["content"]
  }
}
```

## Complex Variables Example

```json
{
  "name": "thegraph_query_tokens_filtered",
  "description": "Query tokens with filtering, sorting, and pagination",
  "inputSchema": {
    "type": "object",
    "properties": {
      "first": {
        "type": "number",
        "description": "Number of results to return (max 1000)"
      },
      "skip": {
        "type": "number",
        "description": "Number of results to skip for pagination"
      },
      "orderBy": {
        "type": "string",
        "enum": ["id", "symbol", "name", "decimals", "totalSupply"],
        "description": "Field to sort by"
      },
      "orderDirection": {
        "type": "string",
        "enum": ["asc", "desc"],
        "description": "Sort direction"
      },
      "where": {
        "type": "object",
        "properties": {
          "symbol_contains": { "type": "string" },
          "totalSupply_gt": { "type": "string" }
        },
        "description": "Filter conditions"
      }
    },
    "required": []
  }
}
```

## The Graph Subgraph Pattern

Common pattern for The Graph subgraphs:

```json
{
  "name": "{protocol}_query_{entity}",
  "description": "Query {entity} from {protocol} subgraph",
  "inputSchema": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "description": "Entity ID"
      },
      "first": {
        "type": "number",
        "description": "Limit results (default: 100, max: 1000)"
      },
      "skip": {
        "type": "number",
        "description": "Pagination offset"
      },
      "orderBy": {
        "type": "string",
        "description": "Sort field"
      },
      "orderDirection": {
        "type": "string",
        "enum": ["asc", "desc"]
      },
      "where": {
        "type": "object",
        "description": "Filter conditions"
      },
      "block": {
        "type": "object",
        "properties": {
          "number": { "type": "number" }
        },
        "description": "Query at specific block"
      }
    },
    "required": []
  }
}
```

## Subscription Example

```json
{
  "name": "uniswap_subscribe_swaps",
  "description": "Subscribe to real-time swap events on Uniswap",
  "inputSchema": {
    "type": "object",
    "properties": {
      "poolId": {
        "type": "string",
        "description": "Pool to monitor"
      },
      "minAmount": {
        "type": "string",
        "description": "Minimum swap amount in USD"
      }
    },
    "required": ["poolId"]
  }
}
```

## Type Mapping

GraphQL → JSON Schema:

| GraphQL Type | JSON Schema Type | Example |
|--------------|------------------|---------|
| String | string | "USDC" |
| Int | number | 42 |
| Float | number | 3.14 |
| Boolean | boolean | true |
| ID | string | "0x123..." |
| [String] | array (items: string) | ["tag1", "tag2"] |
| String! | string (required) | Must provide |
| Custom Type | object | { properties: {...} } |

## Best Practices

### 1. Handle Pagination
Always include pagination parameters:
```json
{
  "first": { "type": "number", "description": "Limit (max 1000)" },
  "skip": { "type": "number", "description": "Offset" }
}
```

### 2. Support Filtering
Include where clause for complex queries:
```json
{
  "where": {
    "type": "object",
    "description": "Filter conditions (e.g., { symbol_contains: 'USD' })"
  }
}
```

### 3. Enable Sorting
Provide ordering options:
```json
{
  "orderBy": { 
    "type": "string",
    "enum": ["field1", "field2"],
    "description": "Sort field"
  },
  "orderDirection": {
    "type": "string",
    "enum": ["asc", "desc"]
  }
}
```

### 4. Historical Queries
Support block-based queries:
```json
{
  "block": {
    "type": "object",
    "properties": {
      "number": { "type": "number" }
    },
    "description": "Query at specific block height"
  }
}
```

## Common Patterns

### Uniswap V3
```
uniswap_query_pool
uniswap_query_pools
uniswap_query_token
uniswap_query_swaps
uniswap_query_positions
```

### The Graph
```
thegraph_query_{entity}
thegraph_query_{entities}
thegraph_subscribe_{entity}
```

### Lens Protocol
```
lens_query_profile
lens_mutation_create_post
lens_mutation_follow
lens_query_publications
```

## Validation

- [ ] Proper GraphQL operation type (query/mutation/subscription)
- [ ] Variable types match GraphQL schema
- [ ] Pagination parameters included
- [ ] Filter/where clause supported
- [ ] Sorting options available
- [ ] Required fields marked correctly
- [ ] Descriptions reference GraphQL fields

Built with ❤️ by [nich](https://x.com/nichxbt)👉[on Github](https://github.com/nirholas)