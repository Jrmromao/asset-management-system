# AI Providers Setup Guide

This guide explains how to configure multiple AI providers for the asset management system with automatic fallback functionality.

## Overview

The system now supports three AI providers with automatic fallback:

1. **OpenAI** (Primary) - High accuracy, industry standard
2. **DeepSeek** (Cost-effective) - Cheaper alternative with good performance  
3. **Gemini** (Google) - Free tier available, good for development

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# OpenAI Configuration (Primary)
OPENAI_API_KEY=your_openai_api_key_here

# DeepSeek Configuration (Cost-effective alternative)
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1

# Gemini Configuration (Google's AI)
GEMINI_API_KEY=your_gemini_api_key_here
```

## How to Get API Keys

### OpenAI
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new secret key
5. Add billing information (required for API usage)

### DeepSeek
1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Create an account
3. Go to API Keys section
4. Generate a new API key
5. Much cheaper than OpenAI (~10x less cost)

### Gemini (Google AI)
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with Google account
3. Create a new API key
4. Free tier available (limited requests per minute)

## Fallback Strategy

The system automatically tries providers in this order:

1. **OpenAI** (if API key available)
2. **DeepSeek** (if OpenAI fails)
3. **Gemini** (if both above fail)

If all providers fail, the system returns an error message.

## Usage Examples

### Basic Usage (Automatic Fallback)
```typescript
import { calculateAssetCo2 } from '@/lib/services/ai-multi-provider.service';

const result = await calculateAssetCo2(
  'MacBook Pro',
  'Apple', 
  'MacBook Pro 14-inch M3'
);

console.log(`Used provider: ${result.provider}`);
console.log(`CO2e: ${result.data?.totalCo2e} kg`);
```

### Preferred Provider
```typescript
import { calculateAssetCo2 } from '@/lib/services/ai-multi-provider.service';

const result = await calculateAssetCo2(
  'MacBook Pro',
  'Apple',
  'MacBook Pro 14-inch M3',
  'deepseek' // Try DeepSeek first
);
```

### Check Provider Status
```typescript
import { aiService } from '@/lib/services/ai-multi-provider.service';

const status = aiService.getProviderStatus();
console.log('Available providers:', status);
// Output: { openai: true, deepseek: false, gemini: true }

const providers = aiService.getAvailableProviders();
console.log('Active providers:', providers);
// Output: ['openai', 'gemini']
```

## Cost Comparison

| Provider | Model | Cost per 1K tokens | Best for |
|----------|-------|-------------------|----------|
| OpenAI | GPT-4o-mini | ~$0.00015 | High accuracy |
| DeepSeek | deepseek-chat | ~$0.00014 | Cost optimization |
| Gemini | gemini-1.5-flash | Free tier | Development/testing |

## Configuration Options

### Model Selection
You can customize models in the service:

```typescript
// In ai-multi-provider.service.ts
const config = {
  openai: {
    model: 'gpt-4o-mini', // or 'gpt-4', 'gpt-3.5-turbo'
  },
  deepseek: {
    model: 'deepseek-chat', // or 'deepseek-coder'
  },
  gemini: {
    model: 'gemini-1.5-flash', // or 'gemini-1.5-pro'
  }
};
```

### Temperature Settings
Lower temperature = more consistent results:
- **OpenAI**: 0.1 (very deterministic)
- **DeepSeek**: 0.1 (very deterministic)  
- **Gemini**: 0.1 (very deterministic)

## Monitoring and Debugging

The service logs provider attempts:

```
🤖 Attempting CO2 calculation with providers: openai, deepseek, gemini
🔄 Trying openai provider...
❌ openai provider failed: Rate limit exceeded
🔄 Trying deepseek provider...
✅ Successfully calculated CO2 using deepseek
```

## Error Handling

Common error scenarios:

1. **No API keys configured**: Returns error immediately
2. **Rate limits**: Automatically tries next provider
3. **Invalid API keys**: Logs warning, tries next provider
4. **Network issues**: Retries with next provider
5. **All providers fail**: Returns detailed error message

## Best Practices

1. **Always configure at least 2 providers** for redundancy
2. **Use OpenAI for production** (most reliable)
3. **Use DeepSeek for cost optimization** (development/testing)
4. **Use Gemini for free tier** (prototyping)
5. **Monitor usage and costs** in each provider's dashboard
6. **Set up billing alerts** to avoid unexpected charges

## Security Notes

- Store API keys in environment variables only
- Never commit API keys to version control
- Use different keys for development/production
- Regularly rotate API keys
- Monitor API usage for suspicious activity

## Troubleshooting

### Provider Not Loading
```bash
⚠️ Failed to initialize OpenAI provider: Invalid API key
```
**Solution**: Check that your API key is correct and has billing enabled.

### All Providers Failing
```bash
❌ All AI providers failed. Last error from gemini: Safety settings blocked response
```
**Solutions**:
1. Check API key validity
2. Verify network connectivity
3. Check rate limits
4. Review content safety settings (Gemini)

### Rate Limit Issues
```bash
❌ openai provider failed: Rate limit exceeded
🔄 Trying deepseek provider...
```
**Solution**: This is normal behavior - the system automatically falls back to the next provider.

## Migration from Single Provider

If you're migrating from the old single-provider system:

1. Add new environment variables
2. Update imports:
   ```typescript
   // Old
   import { calculateAssetCo2 } from '@/lib/services/ai.service';
   
   // New  
   import { calculateAssetCo2 } from '@/lib/services/ai-multi-provider.service';
   ```
3. The function signature remains the same for backward compatibility
4. Test with multiple providers to ensure reliability

## Support

For issues with specific providers:
- **OpenAI**: [OpenAI Support](https://help.openai.com/)
- **DeepSeek**: [DeepSeek Documentation](https://platform.deepseek.com/docs)
- **Gemini**: [Google AI Support](https://ai.google.dev/support) 