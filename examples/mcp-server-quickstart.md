# Complete MCP Server Generator - Quick Start Guide

## 🎯 Goal
Build a working MCP server for Claude Desktop in under 10 minutes.

## 📋 Prerequisites
- Node.js 18+
- Claude Desktop installed
- This repository cloned

## 🚀 Step-by-Step: Privy MCP Server

### Step 1: Generate the Server (2 minutes)

```bash
# One command does everything
npm run docs-to-mcp -- https://docs.privy.io

# Watch it work:
# 📥 Scraping documentation from: https://docs.privy.io
# 🔍 Discovering pages...
# 📋 Found 127 pages in sitemap
# 📖 Scraping 127 pages...
# ✓ Introduction
# ✓ Quick Start
# ✓ Authentication
# ... (auto-saves every 10 pages)
# 
# 🚀 Generating MCP Server: Privy
# 📋 Step 1: Loading API documentation...
# ✓ Found 23 API endpoints
# 
# 📦 Step 2: Creating package.json...
# ✓ Package configuration created
# 
# 🔧 Step 3: Generating MCP server code...
# ✓ Server code generated
# 
# ⚙️  Step 4: Creating tool handlers...
# ✓ Tool handlers created
# 
# ... (continues through all 9 steps)
# 
# ✅ MCP Server generated successfully!
# 📁 Location: ./privy-mcp-server
```

### Step 2: Install Dependencies (1 minute)

```bash
cd privy-mcp-server
npm install
```

### Step 3: Configure API Key (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Privy API key
nano .env  # or use your favorite editor

# Add:
# API_KEY=your-privy-api-key-here
```

### Step 4: Build (1 minute)

```bash
npm run build

# Output:
# > build
# > tsc && chmod +x build/index.js
# 
# (TypeScript compiles successfully)
```

### Step 5: Configure Claude Desktop (2 minutes)

```bash
# Open Claude Desktop config
# Mac: ~/Library/Application Support/Claude/claude_desktop_config.json
# Windows: %APPDATA%\Claude\claude_desktop_config.json

# Add this (or copy from claude_desktop_config.json):
{
  "mcpServers": {
    "privy": {
      "command": "node",
      "args": ["/full/path/to/privy-mcp-server/build/index.js"],
      "env": {
        "API_KEY": "your-privy-api-key-here"
      }
    }
  }
}
```

**Pro tip:** Get the full path:
```bash
pwd  # Copy this path
# Result: /Users/yourname/projects/privy-mcp-server
```

### Step 6: Restart Claude Desktop (1 minute)

1. Quit Claude Desktop completely
2. Relaunch Claude Desktop
3. Look for the 🔌 icon or check settings
4. Verify "privy" server is connected

### Step 7: Test in Claude! (1 minute)

Try asking Claude:

```
Can you authenticate a user with Privy using email test@example.com?
```

Claude will use your MCP tool:
```
I'll use the privy_auth_login tool to authenticate the user...
```

## ✅ Success!

You now have a working MCP server with ~23 Privy tools available in Claude Desktop!

---

## 🎨 Customization

### Implement Tool Logic

The generated `handlers.ts` has TODO comments where you add logic:

```typescript
// handlers.ts
async function privyAuthLogin(args: Record<string, unknown>, apiKey: string) {
  const { email, password } = args;
  
  // TODO: Implement privy_auth_login
  // Make API call to Privy
  const response = await fetch('https://auth.privy.io/api/v1/authenticate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  return await response.json();
}
```

After editing:

```bash
npm run build  # Rebuild
# Restart Claude Desktop
```

### Add More Tools

1. Edit `tools.ts` - Add new tool definition
2. Edit `handlers.ts` - Implement handler
3. Rebuild and restart Claude

---

## 🐛 Troubleshooting

### "Server not connecting"

Check Claude Desktop logs:
```bash
# Mac
tail -f ~/Library/Logs/Claude/mcp*.log

# Look for errors like:
# - Module not found
# - API_KEY undefined
# - Permission denied
```

### "API_KEY undefined"

Make sure `.env` file exists and has:
```
API_KEY=your-actual-key-here
```

Or set directly in Claude config:
```json
{
  "env": {
    "API_KEY": "your-actual-key-here"
  }
}
```

### "Tool not working"

The generated handlers are templates. You need to:

1. Implement the actual API calls
2. Handle errors properly
3. Return proper responses

Example:
```typescript
// Generated (won't work yet):
async function myTool(args: Record<string, unknown>) {
  throw new Error('myTool not yet implemented');
}

// Implemented:
async function myTool(args: Record<string, unknown>, apiKey: string) {
  const response = await fetch('https://api.example.com/endpoint', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  return await response.json();
}
```

---

## 📚 What's Generated

### File Structure
```
privy-mcp-server/
├── index.ts          # Main server (don't edit)
├── handlers.ts       # EDIT THIS - Implement your logic
├── tools.ts          # Tool definitions (edit to add tools)
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
├── .env.example      # Environment template
├── .env              # Your config (gitignored)
└── README.md         # Setup instructions
```

### What to Edit
- ✅ **handlers.ts** - Add your API implementation
- ✅ **tools.ts** - Add/modify tool definitions
- ✅ **.env** - Your API keys and config
- ❌ **index.ts** - Don't touch (unless you know what you're doing)

---

## 🎯 Real-World Example

Complete implementation for one tool:

```typescript
// tools.ts - Tool definition
{
  name: 'privy_get_wallet_balance',
  description: 'Get wallet balance for a user',
  inputSchema: {
    type: 'object',
    properties: {
      user_id: { type: 'string', description: 'User ID' },
      chain: { type: 'string', description: 'Blockchain (ethereum, polygon, etc)' }
    },
    required: ['user_id', 'chain']
  }
}

// handlers.ts - Implementation
async function privyGetWalletBalance(
  args: Record<string, unknown>,
  apiKey: string
): Promise<unknown> {
  const { user_id, chain } = args;
  
  // Validate inputs
  if (!user_id || typeof user_id !== 'string') {
    throw new Error('user_id is required and must be a string');
  }
  
  // Make API call
  const response = await fetch(
    `https://auth.privy.io/api/v1/users/${user_id}/wallet/balance?chain=${chain}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'privy-app-id': process.env.PRIVY_APP_ID || ''
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}
```

Test in Claude:
```
Get the Ethereum wallet balance for user usr_abc123
```

Claude uses your tool and returns the balance!

---

## 🎉 Next Steps

1. **Implement all handlers** - Add real API logic to each function
2. **Test each tool** - Try them in Claude Desktop
3. **Add error handling** - Make tools robust
4. **Add validation** - Check inputs before API calls
5. **Share with team** - Others can use your MCP server

---

## 💡 Pro Tips

**Development workflow:**
```bash
# Watch mode for quick iteration
npm run watch  # In one terminal

# Restart Claude Desktop after each change
# Or check logs:
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Testing tools:**
```bash
# Test your implementation directly
node build/index.js <<EOF
{
  "method": "tools/call",
  "params": {
    "name": "privy_auth_login",
    "arguments": { "email": "test@example.com" }
  }
}
EOF
```

**Version control:**
```bash
# Add to git
cd privy-mcp-server
git init
git add .
git commit -m "Initial Privy MCP server"

# .env is already in .gitignore (API keys safe!)
```

---

**Time to working MCP server: ~10 minutes**  
**Lines of code you wrote: ~0** (just configuration!)
