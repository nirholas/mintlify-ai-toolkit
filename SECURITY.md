# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.5.x   | :white_check_mark: |
| 1.4.x   | :white_check_mark: |
| < 1.4   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please do the following:

### DO NOT

- Open a public GitHub issue
- Disclose the vulnerability publicly before it's fixed
- Exploit the vulnerability

### DO

1. **Email us privately** at security@mintlify-ai-toolkit.dev (or open a private security advisory on GitHub)
2. **Include details**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. **Wait for response** - We'll acknowledge within 48 hours
4. **Coordinate disclosure** - We'll work with you on timing

## Security Considerations

### API Keys

This toolkit may use API keys for:
- OpenAI (vector search, chatbot generation)
- Anthropic (AI enhancement)
- Trieve (faster scraping)

**Best Practices:**
- Never commit API keys to version control
- Use environment variables (`OPENAI_API_KEY`, etc.)
- Rotate keys regularly
- Use separate keys for development/production

### Data Privacy

**What data is processed:**
- Documentation content from public URLs
- Generated embeddings (vector representations)
- Q&A pairs for chatbot training

**What is NOT sent externally:**
- No telemetry or usage tracking
- No data collection by default
- API calls only when explicitly configured

### Local vs Cloud Processing

**Local Processing (FREE, More Secure):**
- Vector search with sentence-transformers
- Manual Q&A extraction
- All processing on your machine
- No API calls, no data leaves your system

**Cloud Processing (Paid, Convenient):**
- OpenAI embeddings
- AI-generated Q&A
- Data sent to third-party APIs
- Follow their security policies

### Dependencies

We regularly update dependencies to patch security vulnerabilities. Run:

```bash
npm audit
npm audit fix
```

### Scraping Ethics

**Please be responsible:**
- Respect robots.txt
- Use rate limiting (`--delay` flag)
- Don't overload servers
- Only scrape public documentation
- Respect copyright and terms of service

## Disclosure Process

1. **Report received** - We acknowledge within 48 hours
2. **Investigation** - We assess severity and impact
3. **Fix developed** - We create a patch
4. **Testing** - We verify the fix
5. **Release** - We publish a security update
6. **Disclosure** - We coordinate public announcement (typically 90 days)

## Security Updates

Security updates are released as:
- Patch versions (1.5.x)
- Announced in CHANGELOG.md
- Tagged as security updates in release notes

Subscribe to releases on GitHub to get notified.

## Hall of Fame

We'll recognize security researchers who responsibly disclose vulnerabilities:

*No reports yet - be the first!*

---

Thank you for helping keep Mintlify AI Toolkit secure! 🔒
