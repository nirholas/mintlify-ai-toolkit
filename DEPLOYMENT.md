# 🚀 Quick Deployment Commands

## Deploy to GitHub Pages

### Option 1: Automatic (Recommended)
```bash
./deploy.sh
```

### Option 2: Manual
```bash
# Stage all changes
git add .

# Commit with message
git commit -m "Add enhanced web interface v2.0 with dark mode, stats, and advanced features"

# Push to GitHub
git push origin main
```

## Enable GitHub Pages (First Time Only)

1. Go to: `https://github.com/nirholas/mintlify-ai-toolkit/settings/pages`
2. Under "Build and deployment":
   - Source: Select **"GitHub Actions"**
3. Click **Save**

## Verify Deployment

After pushing, check:
- **Actions**: https://github.com/nirholas/mintlify-ai-toolkit/actions
- Wait 1-2 minutes for deployment
- Visit: https://nirholas.github.io/mintlify-ai-toolkit

## Test Locally

### Start Local Server
```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000

# Then visit: http://localhost:8000
```

### Test CLI Tool
```bash
# Install dependencies
npm install

# Test scraping
npm run scrape -- https://docs.etherscan.io --output ./test-output

# Test MCP generation
npm run docs-to-mcp -- https://docs.privy.io --output ./test-mcp
```

## Verify Build

```bash
# Check for TypeScript errors
npm run build

# Run type check
npx tsc --noEmit
```

## What Happens After Push

1. **GitHub Actions triggers** - Workflow starts automatically
2. **Deployment runs** - Builds and deploys to Pages
3. **Site goes live** - Available at GitHub Pages URL
4. **Users can access** - No further action needed

## Troubleshooting

### Deployment Fails
- Check Actions tab for errors
- Verify GitHub Pages is enabled
- Ensure repository is public (or GitHub Pro for private)

### Site Not Loading
- Wait a few minutes for DNS propagation
- Clear browser cache
- Check deployment status in Actions

### Changes Not Showing
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Wait for GitHub Actions to complete
- Check that changes were pushed

## Files to Deploy

Essential files for GitHub Pages:
- ✅ `index.html` - Web interface
- ✅ `app.js` - Frontend logic
- ✅ `.github/workflows/deploy.yml` - CI/CD config

## Post-Deployment Checklist

- [ ] GitHub Actions workflow completed successfully
- [ ] Web interface loads at GitHub Pages URL
- [ ] Dark mode toggle works
- [ ] Scraping functionality works
- [ ] ZIP download works
- [ ] Mobile view works
- [ ] Stats display correctly
- [ ] History saves/loads
- [ ] Keyboard shortcuts work
- [ ] Help button shows info

## Next Steps

After deployment:
1. Test the web interface
2. Share the URL with users
3. Monitor GitHub Issues for feedback
4. Update documentation as needed

## Support

If you encounter issues:
- Open an issue on GitHub
- Check the Actions logs
- Review the browser console for errors
- Verify all files are committed

---

**Ready to deploy? Run:**
```bash
./deploy.sh
```

Or manually:
```bash
git add . && git commit -m "Deploy v2.0" && git push
```
