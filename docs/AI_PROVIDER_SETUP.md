# AI Provider Setup Guide

ActionFlix supports three AI providers. Choose the one that best fits your needs!

## 🌐 OpenAI (Default)

**Best for:** Quick setup, high-quality results, and full feature support

### Setup Steps:
1. Visit https://platform.openai.com/api-keys
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy your API key (starts with `sk-...`)
5. Open ActionFlix Settings
6. Select "OpenAI" as AI Provider
7. Paste your API key
8. Select your preferred models:
   - Image Model: DALL-E 3 (best quality) or DALL-E 2 (faster)
   - Text Model: GPT-5.2 (best) or GPT-5 Mini (faster)

**Features:**
- ✅ Text generation (titles, summaries, tags)
- ✅ Image generation (movie posters)
- ✅ Multiple model options
- ✅ Environment variable support (`OPENAI_API_KEY`)

**Pricing:** Pay-per-use (see OpenAI pricing)

---

## ☁️ Azure OpenAI

**Best for:** Enterprise users, regulatory compliance, Azure ecosystem integration

### Setup Steps:
1. Create an Azure OpenAI resource in Azure Portal
2. Deploy your models:
   - Deploy a text model (e.g., GPT-4, GPT-4 Turbo)
   - Deploy an image model (e.g., DALL-E 3)
3. Note your deployment names
4. Copy your endpoint and API key from "Keys and Endpoint"
5. Open ActionFlix Settings
6. Select "Azure OpenAI" as AI Provider
7. Configure:
   - **Azure Endpoint:** `https://your-resource.openai.azure.com`
   - **Azure API Key:** Your API key
   - **API Version:** `2024-02-15-preview` (or latest)
   - **Text Deployment Name:** Your GPT deployment name
   - **Image Deployment Name:** Your DALL-E deployment name
   - **Base Image Model:** Select DALL-E 2 or DALL-E 3 (match your deployment)
   - **Base Text Model:** Select model type (for app behavior)

**Features:**
- ✅ Text generation (titles, summaries, tags)
- ✅ Image generation (movie posters)
- ✅ Enterprise-grade security
- ✅ Data residency control
- ✅ Same models as OpenAI

**Pricing:** Azure pricing (typically lower than OpenAI for high volume)

**Important Notes:**
- Deployment names are different from model names
- Base model selection helps the app adjust parameters correctly
- Ensure your deployments have sufficient quota

---

## 🖥️ Ollama (Local)

**Best for:** Privacy, offline use, no API costs, experimentation

### Setup Steps:
1. Install Ollama from https://ollama.ai
2. Start Ollama service (usually starts automatically)
3. Pull a model:
   ```bash
   ollama pull llama2        # Good general model
   ollama pull mistral       # Great performance
   ollama pull codellama     # Code-focused
   ```
4. Open ActionFlix Settings
5. Select "Ollama" as AI Provider
6. Configure:
   - **Ollama Base URL:** `http://localhost:11434` (default)
   - **Text Model Name:** `llama2` (or your preferred model)
   - **Image Model Name:** Leave empty (not supported)

**Features:**
- ✅ Text generation (titles, summaries, tags)
- ⚠️ Image generation NOT supported (use OpenAI/Azure for posters)
- ✅ 100% free
- ✅ Runs offline
- ✅ Complete privacy (no data sent to cloud)
- ✅ Multiple model options (llama2, mistral, codellama, etc.)

**Pricing:** Free (runs on your hardware)

**Important Notes:**
- Requires decent hardware (8GB+ RAM recommended)
- Image generation requires OpenAI or Azure OpenAI
- Quality may vary compared to GPT-4/5
- First run is slower (model loads into memory)

### Recommended Models:
- **llama2**: Good all-around model (7B or 13B)
- **mistral**: Excellent performance and quality
- **mixtral**: Very powerful (requires more RAM)
- **codellama**: Great for technical content
- **phi**: Lightweight, good for lower-end hardware

---

## 🔄 Switching Providers

You can switch providers at any time:
1. Open Settings
2. Select new provider from "AI Provider" dropdown
3. Configure the new provider's settings
4. Save Settings

Your previous configurations are preserved, so switching back is easy!

---

## 🆘 Troubleshooting

### OpenAI
- **"API key not configured"**: Add your API key in Settings
- **"Invalid API key"**: Check your key at platform.openai.com
- **"Rate limit"**: Wait a few seconds and try again

### Azure OpenAI
- **"Endpoint not configured"**: Ensure endpoint URL is correct
- **"Deployment not found"**: Verify deployment names in Azure Portal
- **"API version error"**: Try `2024-02-15-preview` or check Azure docs

### Ollama
- **"Connection refused"**: Ensure Ollama service is running
- **"Model not found"**: Pull the model with `ollama pull <model>`
- **"Out of memory"**: Try a smaller model or close other applications

---

## 💡 Tips

1. **Testing**: Start with OpenAI for easiest setup
2. **Cost Optimization**: Use Ollama for text, OpenAI for images only
3. **Quality**: GPT-5.2 and DALL-E 3 produce best results
4. **Speed**: Use Mini/Nano models for faster responses
5. **Privacy**: Ollama keeps everything on your machine
6. **Production**: Azure OpenAI for enterprise compliance

---

## 📊 Feature Comparison

| Feature | OpenAI | Azure OpenAI | Ollama |
|---------|--------|--------------|--------|
| Text Generation | ✅ | ✅ | ✅ |
| Image Generation | ✅ | ✅ | ❌ |
| Setup Difficulty | Easy | Medium | Easy |
| Cost | Pay-per-use | Pay-per-use | Free |
| Privacy | Cloud | Cloud | Local |
| Internet Required | Yes | Yes | No* |
| Model Quality | Excellent | Excellent | Good |

*After initial model download
