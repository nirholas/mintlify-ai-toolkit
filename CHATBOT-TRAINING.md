# Chatbot Training Data Exporter

Export your scraped documentation as training data for fine-tuning chatbots, GPTs, and AI assistants. Turn your docs into a custom AI expert!

## Features

- **🤖 Auto-Generate Q&A** - AI creates question-answer pairs from your docs
- **📋 Multiple Formats** - OpenAI JSONL, LLaMA, Claude, JSON, CSV
- **✅ Validation Sets** - Automatic train/test split
- **🎯 Quality Filtering** - Only export high-quality pairs
- **💰 Cost-Effective** - Manual extraction (free) or AI-powered ($)
- **🎨 Custom Prompts** - Tailor the bot's personality

## Quick Start

### 1. Basic Export (Manual Q&A)

Extract existing Q&A from your documentation:

```bash
npx tsx src/chatbot-exporter.ts \
  --docs-dir ./output \
  --output ./chatbot-data.jsonl \
  --format openai-jsonl
```

**Finds:**
- FAQ sections
- "How to" guides
- Code examples with explanations

### 2. AI-Generated Q&A

Let AI create comprehensive training data:

```bash
npx tsx src/chatbot-exporter.ts \
  --docs-dir ./output \
  --output ./chatbot-data.jsonl \
  --format openai-jsonl \
  --generate-qa \
  --api-key sk-...
```

**Creates:**
- 3+ questions per documentation section
- Questions ranging from basic to advanced
- Answers grounded in your docs

### 3. Fine-Tune Your Chatbot

Upload to OpenAI for fine-tuning:

```bash
# Upload training data
openai api fine_tuning.jobs.create \
  -t chatbot-data-train.jsonl \
  -v chatbot-data-validation.jsonl \
  -m gpt-3.5-turbo

# Or use the web interface
# https://platform.openai.com/finetune
```

## Export Formats

### OpenAI JSONL (Recommended)

For fine-tuning GPT-3.5/GPT-4:

```bash
--format openai-jsonl
```

**Output:**
```json
{"messages":[{"role":"system","content":"You are a helpful docs assistant."},{"role":"user","content":"How do I authenticate?"},{"role":"assistant","content":"To authenticate, use the API key..."}]}
{"messages":[{"role":"system","content":"You are a helpful docs assistant."},{"role":"user","content":"What is rate limiting?"},{"role":"assistant","content":"Rate limiting prevents abuse..."}]}
```

**Use for:**
- OpenAI fine-tuning
- Custom GPTs
- ChatGPT plugins

### LLaMA Format

For fine-tuning LLaMA, Mistral, or similar models:

```bash
--format llama
```

**Output:**
```
<s>[INST] <<SYS>>
You are a helpful docs assistant.
<</SYS>>

How do I authenticate? [/INST] To authenticate, use the API key... </s>

<s>[INST] <<SYS>>
You are a helpful docs assistant.
<</SYS>>

What is rate limiting? [/INST] Rate limiting prevents abuse... </s>
```

**Use for:**
- LLaMA 2/3
- Mistral
- Mixtral
- Vicuna

### Claude Format

For fine-tuning Claude models:

```bash
--format claude
```

**Output:**
```json
{"prompt":"Human: How do I authenticate?\n\nAssistant:","completion":" To authenticate, use the API key..."}
{"prompt":"Human: What is rate limiting?\n\nAssistant:","completion":" Rate limiting prevents abuse..."}
```

**Use for:**
- Claude fine-tuning
- Anthropic models

### Generic JSON

For custom training pipelines:

```bash
--format generic-json
```

**Output:**
```json
[
  {
    "question": "How do I authenticate?",
    "answer": "To authenticate, use the API key...",
    "context": "Full section content...",
    "metadata": {
      "url": "https://docs.example.com/auth",
      "title": "Authentication",
      "section": "api-reference",
      "hasCode": true,
      "difficulty": "medium"
    }
  }
]
```

**Use for:**
- Custom training scripts
- Data analysis
- RAG systems
- Vector databases

### CSV

For spreadsheets and analysis:

```bash
--format csv
```

**Output:**
```csv
question,answer,url,title,has_code
"How do I authenticate?","To authenticate, use...","https://...","Authentication",true
"What is rate limiting?","Rate limiting prevents...","https://...","API Limits",false
```

**Use for:**
- Excel/Google Sheets
- Data analysis
- Human review

## Configuration

Create `chatbot-config.json`:

```json
{
  "format": "openai-jsonl",
  "qaGeneration": {
    "enabled": true,
    "provider": "openai",
    "apiKey": "${OPENAI_API_KEY}",
    "questionsPerSection": 3
  },
  "validation": {
    "enabled": true,
    "splitRatio": 0.8
  },
  "quality": {
    "minAnswerLength": 50,
    "maxAnswerLength": 2000,
    "requireCodeExamples": false
  },
  "systemPrompt": "You are a helpful assistant that answers questions about our API. Be concise and include code examples when relevant."
}
```

## Q&A Generation Options

### Manual Extraction (FREE)

Extracts existing Q&A from your docs:

```json
{
  "qaGeneration": {
    "enabled": false
  }
}
```

**Finds:**

1. **FAQ Sections:**
   ```markdown
   Q: How do I authenticate?
   A: Use the API key in the header...
   ```

2. **How-to Guides:**
   ```markdown
   ## How to Set Up OAuth
   
   Follow these steps...
   ```

3. **Code Examples:**
   ```markdown
   ## Making API Calls
   
   Here's how to call the API:
   ```python
   response = api.get('/users')
   ```
   ```

**Best for:**
- Well-structured docs with FAQs
- Budget-conscious projects
- Quick setup

### AI-Powered Generation

AI creates comprehensive Q&A from any content:

```json
{
  "qaGeneration": {
    "enabled": true,
    "provider": "openai",
    "apiKey": "sk-...",
    "questionsPerSection": 3
  }
}
```

**Creates:**

From this docs section:
```markdown
## Rate Limiting

Our API limits requests to 100 per minute per API key.
When you exceed the limit, you'll receive a 429 error.
```

**AI generates:**
```json
[
  {
    "question": "What is the API rate limit?",
    "answer": "The API limits requests to 100 per minute per API key.",
    "difficulty": "easy"
  },
  {
    "question": "What happens when I exceed the rate limit?",
    "answer": "When you exceed the limit, you'll receive a 429 (Too Many Requests) HTTP status code.",
    "difficulty": "medium"
  },
  {
    "question": "How can I avoid hitting rate limits in my application?",
    "answer": "To avoid rate limits, implement exponential backoff, cache responses, and spread out your requests. Monitor the X-RateLimit headers to track your usage.",
    "difficulty": "hard"
  }
]
```

**Cost:** ~$0.10 per 1000 documentation pages

**Best for:**
- Comprehensive coverage
- Unstructured documentation
- Creating diverse Q&A

### AI Providers

#### OpenAI (Recommended)

```json
{
  "provider": "openai",
  "apiKey": "sk-...",
  "model": "gpt-4o-mini"
}
```

**Cost:** $0.15 per 1M tokens (~$0.10/1000 pages)

#### Anthropic Claude

```json
{
  "provider": "anthropic",
  "apiKey": "sk-ant-...",
  "model": "claude-3-5-sonnet-20241022"
}
```

**Cost:** $3.00 per 1M tokens (~$2.00/1000 pages)

**Better for:** Complex technical content

#### Local LLMs (FREE)

```json
{
  "provider": "local",
  "apiUrl": "http://localhost:11434"
}
```

Use with Ollama, LM Studio, or LocalAI - completely free!

## Quality Control

### Answer Length Filtering

```json
{
  "quality": {
    "minAnswerLength": 50,
    "maxAnswerLength": 2000
  }
}
```

Removes:
- Too short (usually incomplete)
- Too long (usually off-topic)

### Code Examples

Require answers to include code:

```json
{
  "quality": {
    "requireCodeExamples": true
  }
}
```

Only keeps Q&A pairs that include code blocks.

**Best for:** API documentation, SDK guides

### Custom Filtering

Add your own filters programmatically:

```typescript
import { ChatbotExporter } from './src/chatbot-exporter';

const exporter = new ChatbotExporter(config);
await exporter.processDocumentation('./output', './data.jsonl');

// Custom filter
exporter.qaPairs = exporter.qaPairs.filter(pair => {
  // Only keep API-related questions
  return pair.metadata.section.includes('api');
  
  // Or only advanced questions
  return pair.metadata.difficulty === 'hard';
});
```

## Validation & Testing

### Automatic Train/Test Split

```json
{
  "validation": {
    "enabled": true,
    "splitRatio": 0.8
  }
}
```

**Output:**
- `chatbot-data-train.jsonl` (80% of data)
- `chatbot-data-validation.jsonl` (20% of data)

**Why?** Validation set helps prevent overfitting during fine-tuning.

### Manual Review

Export as CSV for human review:

```bash
npx tsx src/chatbot-exporter.ts \
  --format csv \
  --output ./review.csv
```

Open in Excel/Sheets and:
- ✅ Review questions
- ✅ Edit answers
- ✅ Remove bad pairs
- ✅ Add new pairs

Then convert back to JSONL for training.

## Custom System Prompts

Define your chatbot's personality:

```json
{
  "systemPrompt": "You are TechBot, an expert in our API. You're friendly, concise, and always include code examples. When users ask questions, provide step-by-step instructions and highlight common pitfalls."
}
```

**Examples:**

**Formal & Professional:**
```json
{
  "systemPrompt": "You are an enterprise API assistant. Provide accurate, well-structured responses with proper terminology. Include security considerations and best practices."
}
```

**Casual & Friendly:**
```json
{
  "systemPrompt": "You're a friendly developer helper! Explain things clearly, use analogies, and don't be afraid to add a bit of humor. Make documentation fun!"
}
```

**Specific Domain:**
```json
{
  "systemPrompt": "You are a blockchain development assistant specializing in smart contracts. Always consider gas optimization and security vulnerabilities in your answers."
}
```

## Fine-Tuning Guides

### OpenAI GPT-3.5/4

1. **Prepare data:**
   ```bash
   npx tsx src/chatbot-exporter.ts \
     --format openai-jsonl \
     --generate-qa \
     --output ./training-data.jsonl
   ```

2. **Upload & fine-tune:**
   ```bash
   # Upload training file
   openai api files.create \
     -f training-data-train.jsonl \
     -p fine-tune
   
   # Create fine-tuning job
   openai api fine_tuning.jobs.create \
     -t file-abc123 \
     -m gpt-3.5-turbo
   ```

3. **Monitor progress:**
   ```bash
   openai api fine_tuning.jobs.get -i ftjob-abc123
   ```

4. **Use your model:**
   ```python
   response = openai.ChatCompletion.create(
     model="ft:gpt-3.5-turbo:org:custom:id",
     messages=[
       {"role": "user", "content": "How do I authenticate?"}
     ]
   )
   ```

**Cost:** $8/1M tokens (~$0.008 per 1000 training examples)

### LLaMA Fine-Tuning

1. **Export data:**
   ```bash
   npx tsx src/chatbot-exporter.ts \
     --format llama \
     --output ./llama-data.txt
   ```

2. **Fine-tune with Hugging Face:**
   ```python
   from transformers import AutoModelForCausalLM, Trainer
   
   model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b")
   
   # Load training data
   dataset = load_dataset('text', data_files='llama-data-train.txt')
   
   # Fine-tune
   trainer = Trainer(model=model, train_dataset=dataset)
   trainer.train()
   ```

**Cost:** FREE (self-hosted) or ~$1/hour on RunPod/Vast.ai

### Custom GPT (No Fine-Tuning Needed!)

1. **Export as JSON:**
   ```bash
   npx tsx src/chatbot-exporter.ts \
     --format generic-json \
     --output ./knowledge.json
   ```

2. **Create Custom GPT:**
   - Go to https://chat.openai.com/gpts/editor
   - Upload `knowledge.json` as knowledge base
   - Configure instructions
   - Publish!

**Cost:** FREE with ChatGPT Plus

**Limitations:** Max 20 files, 500MB total

## Use Cases

### API Documentation Bot

```json
{
  "format": "openai-jsonl",
  "qaGeneration": {
    "enabled": true,
    "questionsPerSection": 5
  },
  "quality": {
    "requireCodeExamples": true
  },
  "systemPrompt": "You are an API documentation assistant. Always include code examples and explain error codes."
}
```

**Perfect for:** Helping developers integrate your API

### Product Support Bot

```json
{
  "format": "openai-jsonl",
  "qaGeneration": {
    "enabled": true,
    "questionsPerSection": 3
  },
  "systemPrompt": "You are a friendly customer support assistant. Help users troubleshoot issues and guide them to the right features."
}
```

**Perfect for:** Reducing support tickets

### Internal Knowledge Bot

```json
{
  "format": "generic-json",
  "qaGeneration": {
    "enabled": true,
    "provider": "local"
  },
  "systemPrompt": "You are an internal company knowledge assistant. Help employees find information about policies, procedures, and tools."
}
```

**Perfect for:** Employee onboarding & knowledge sharing

### Educational Tutor

```json
{
  "format": "openai-jsonl",
  "qaGeneration": {
    "enabled": true,
    "questionsPerSection": 4
  },
  "systemPrompt": "You are a patient tutor. Explain concepts step-by-step, use analogies, and encourage learning. Ask follow-up questions to check understanding."
}
```

**Perfect for:** Course materials, tutorials

## Programmatic Usage

```typescript
import { ChatbotExporter } from './src/chatbot-exporter';

// Configure exporter
const exporter = new ChatbotExporter({
  format: 'openai-jsonl',
  qaGeneration: {
    enabled: true,
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    questionsPerSection: 3
  },
  validation: {
    enabled: true,
    splitRatio: 0.8
  },
  quality: {
    minAnswerLength: 50,
    maxAnswerLength: 2000
  },
  systemPrompt: 'You are a helpful API assistant.'
});

// Process documentation
await exporter.processDocumentation(
  './output',
  './chatbot-data.jsonl'
);

// Access generated pairs
console.log(`Generated ${exporter.qaPairs.length} Q&A pairs`);

// Custom processing
for (const pair of exporter.qaPairs) {
  console.log(`Q: ${pair.question}`);
  console.log(`A: ${pair.answer}`);
}
```

## Cost Estimation

### Manual Extraction

**Cost:** $0 (free!)

**Time:** ~1 minute per 100 pages

**Q&A Yield:** 1-5 pairs per page (depends on docs structure)

### AI-Generated Q&A

**OpenAI (gpt-4o-mini):**
- $0.15 per 1M tokens
- ~500 tokens per page (input)
- ~200 tokens per Q&A (output)
- 3 Q&A pairs per page

| Pages | Cost | Q&A Pairs |
|-------|------|-----------|
| 100 | $0.01 | 300 |
| 1,000 | $0.10 | 3,000 |
| 10,000 | $1.00 | 30,000 |

**Note:** One-time cost, reuse forever!

## Examples

See `examples/configs/chatbot-training.json` for complete configuration.

### Example Output

**Input Documentation:**
```markdown
## Authentication

All API requests require authentication using an API key.
Include your API key in the `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.example.com/users
```

If your API key is invalid, you'll receive a 401 error.
```

**Generated Q&A:**
```json
[
  {
    "question": "How do I authenticate API requests?",
    "answer": "Include your API key in the Authorization header: `Authorization: Bearer YOUR_API_KEY`",
    "difficulty": "easy"
  },
  {
    "question": "What error do I get with an invalid API key?",
    "answer": "You'll receive a 401 (Unauthorized) HTTP status code if your API key is invalid.",
    "difficulty": "medium"
  },
  {
    "question": "Can you show me a complete example of an authenticated API request?",
    "answer": "Here's a complete curl example:\n```bash\ncurl -H \"Authorization: Bearer YOUR_API_KEY\" https://api.example.com/users\n```\nReplace YOUR_API_KEY with your actual API key.",
    "difficulty": "medium"
  }
]
```

## Tips & Best Practices

### 1. Start Small

Test with 10-20 pages first:
```bash
# Test on small sample
npx tsx src/chatbot-exporter.ts \
  --docs-dir ./output/getting-started \
  --format generic-json
```

Review the output before processing your entire docs.

### 2. Optimize for Your Use Case

**For code-heavy docs:**
```json
{
  "quality": {
    "requireCodeExamples": true
  }
}
```

**For conceptual docs:**
```json
{
  "qaGeneration": {
    "questionsPerSection": 5
  }
}
```

### 3. Iterate on System Prompt

Test different prompts:
```bash
# Technical
--system-prompt "You are a technical API assistant..."

# Friendly
--system-prompt "You are a friendly helper..."

# Compare results
```

### 4. Combine with Vector Search

Use together for best results:
1. Export Q&A for fine-tuning
2. Index docs with vector search
3. Fine-tuned bot + RAG = 🚀

### 5. Monitor Quality

After fine-tuning, test on validation set:
```python
for qa in validation_data:
    response = model.generate(qa['question'])
    if response != qa['answer']:
        print(f"Different answer for: {qa['question']}")
```

## Troubleshooting

### Poor Quality Q&A

**Problem:** Generated questions are too generic

**Solution:**
```json
{
  "qaGeneration": {
    "questionsPerSection": 5  // More variety
  },
  "quality": {
    "minAnswerLength": 100  // More detailed answers
  }
}
```

### Too Expensive

**Problem:** AI generation costs too much

**Solutions:**
1. Use manual extraction first
2. Use `gpt-4o-mini` instead of `gpt-4`
3. Use local LLMs (FREE)
4. Generate Q&A only for key sections

### Not Enough Data

**Problem:** Only getting 100 Q&A pairs from 500 pages

**Solutions:**
1. Enable AI generation
2. Increase `questionsPerSection`
3. Lower `minAnswerLength`
4. Include more doc sections

## Coming Soon

- 🎯 Active learning (bot suggests which docs need more Q&A)
- 📊 Quality scoring (auto-detect low-quality pairs)
- 🔄 Continuous training (auto-update when docs change)
- 🌍 Multi-language support
- 🧪 A/B testing framework
- 📈 Analytics dashboard

## Resources

- [OpenAI Fine-Tuning Guide](https://platform.openai.com/docs/guides/fine-tuning)
- [Hugging Face Fine-Tuning](https://huggingface.co/docs/transformers/training)
- [LLaMA Fine-Tuning Guide](https://github.com/facebookresearch/llama-recipes)
- [Custom GPTs](https://openai.com/blog/introducing-gpts)
