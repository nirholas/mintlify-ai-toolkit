# 🌐 Using the Web Interface

The Mintlify Docs Scraper is now available as a web application - no installation required!

## Quick Start

1. **Visit the web app**: [https://nirholas.github.io/mintlify-ai-toolkit](https://nirholas.github.io/mintlify-ai-toolkit)

2. **Enter a Mintlify docs URL**:
   - Example: `https://docs.etherscan.io`
   - Example: `https://docs.privy.io`
   - Example: `https://docs.1inch.io`

3. **Choose your options**:
   - ✅ Include API Reference sections (recommended)
   - ✅ Try Trieve API for faster scraping (recommended)

4. **Click "Start Scraping"**

5. **Wait for completion** (usually 1-5 minutes depending on site size)

6. **Download your ZIP file** containing:
   - `COMPLETE.md` - All documentation in one file
   - Individual section files organized by topic
   - `README.md` - Information about the archive

## What Gets Downloaded

Your ZIP file will contain clean markdown files with:

- ✅ All documentation pages
- ✅ Perfect code example preservation
- ✅ Proper markdown formatting
- ✅ Zero CSS/JS artifacts
- ✅ Organized by section

## Tips

### For AI Agents
Use the `COMPLETE.md` file - it has all documentation in one file, perfect for loading into Claude, ChatGPT, or other AI assistants.

### For Reading
Use the individual section files - they're organized by topic and easier to browse.

### For Large Sites
- Be patient - some sites have hundreds of pages
- The log window shows real-time progress
- Trieve API (when available) makes it much faster

### If Something Goes Wrong
- Check that the URL is a Mintlify docs site
- Some sites may block scraping (you'll see errors in the log)
- Try the CLI version if the web version doesn't work

## Advantages vs CLI

**Web Interface:**
- ✅ No Node.js installation needed
- ✅ Works on any device with a browser
- ✅ Simple point-and-click interface
- ✅ Mobile-friendly

**CLI Version:**
- ✅ More control over options
- ✅ Can resume interrupted scrapes
- ✅ Better for very large sites
- ✅ Can integrate into workflows

## Privacy & Security

- All scraping happens **in your browser**
- No data is sent to any server (except fetching the docs themselves)
- The app is completely client-side JavaScript
- Source code is open and auditable on GitHub

## Browser Compatibility

Works best on:
- Chrome/Edge (latest versions)
- Firefox (latest versions)
- Safari (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## CORS Limitations

Some sites may block cross-origin requests. If you see CORS errors:
1. The app will automatically try using a CORS proxy
2. If that fails, use the CLI version instead

## Examples

### Scrape Etherscan Docs
1. Enter: `https://docs.etherscan.io`
2. Click "Start Scraping"
3. Wait ~2-3 minutes
4. Download `etherscan-docs.zip`

### Scrape Privy Docs (Fast with Trieve)
1. Enter: `https://docs.privy.io`
2. Keep "Try Trieve API" checked
3. Click "Start Scraping"
4. Wait ~30 seconds (Trieve is fast!)
5. Download `privy-docs.zip`

## Need Help?

- Check the [main README](README.md) for more information
- Visit the [GitHub repository](https://github.com/nirholas/mintlify-ai-toolkit)
- Open an issue if you find bugs

## Advanced Usage

For advanced features like:
- Resume capability
- Custom rate limiting
- MCP server generation
- Batch processing

Use the CLI version - see the main README for instructions.

---

Happy scraping! 🚀
