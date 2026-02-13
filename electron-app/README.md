# ActionFlix Electron Desktop App

A Netflix-styled desktop application that transforms any rom-com into an explosive action blockbuster! 💥

## Quick Start

### Easy Launch (Recommended)

**Windows:** Double-click `start-actionflix.bat` in the project root

**macOS/Linux:**
```bash
chmod +x start-actionflix.sh
./start-actionflix.sh
```

### Manual Installation

#### Prerequisites
- Node.js 18+ installed
- AI Provider (choose one):
  - OpenAI API key, OR
  - Azure OpenAI endpoint and key, OR
  - Ollama running locally
- TMDB API key (optional, for Top 10 feature)

#### Getting API Keys

**Option 1: OpenAI (Default)**
1. Visit: https://platform.openai.com/api-keys
2. Create an account or sign in
3. Generate a new API key
4. Copy and save it securely
5. Add it in the app's Settings menu

**Option 2: Azure OpenAI**
1. Create an Azure OpenAI resource in Azure Portal
2. Deploy text and image models (e.g., GPT-4, DALL-E-3)
3. Copy your endpoint URL and API key from "Keys and Endpoint"
4. Note your deployment names
5. Configure all settings in the app's Settings menu:
   - Azure Endpoint (e.g., https://your-resource.openai.azure.com)
   - Azure API Key
   - API Version (default: 2024-02-15-preview)
   - Text Deployment Name
   - Image Deployment Name

**Option 3: Ollama (Local - Free)**
1. Install Ollama from: https://ollama.ai
2. Start Ollama service
3. Pull a model: `ollama pull llama2` (or mistral, codellama, etc.)
4. Configure in Settings:
   - Base URL (default: http://localhost:11434)
   - Text Model Name (e.g., llama2, mistral)
   - ⚠️ Note: Image generation requires OpenAI or Azure OpenAI

**TMDB API Key (Optional - for Top 10 feature)**
1. Visit: https://www.themoviedb.org/signup
2. Create a free account
3. Go to: https://www.themoviedb.org/settings/api
4. Request an API key (choose "Developer" option)
5. Accept the terms and provide basic information
6. Copy your API key and add it in Settings

#### Steps

```bash
# Navigate to the electron app directory
cd electron-app

# Install dependencies
npm install

# Start the app
npm start
```

### Building Installers

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for both
npm run build:all
```

## Features

### 🎬 Transform Any Rom-Com
Enter any rom-com title and watch as AI transforms it into an action-packed blockbuster with:
- Actionized title
- Action-packed plot summary
- AI-generated action movie poster in one of 40+ diverse styles!

### 🎨 40+ Action Poster Styles
Each poster is randomly styled from our extensive collection, ensuring variety and uniqueness:

**💥 Explosions & Fire:**
- Inferno Blast, Pyroclastic Fury, Hellfire Strike

**🔫 Military & Tactical:**
- Black Ops Mission, Desert Warfare, Navy SEAL Assault, Special Forces

**🏙️ Urban Action:**
- Street Chase, Rooftop Showdown, Urban Warfare, Alley Combat, High-Rise Assault

**🕵️ Spy & Thriller:**
- Covert Operation, Espionage Noir, Shadow Protocol, Classified Intel

**🌃 Urban & Modern:**
- Neon Gunfight, Rain-Soaked Battle, Cyber Warfare, Dark City Strike

**📜 Classic & Vintage:**
- Vintage War Hero, Cold War Espionage, Retro Action, Classic Standoff

**✨ Night & Celestial:**
- Midnight Raid, Starlight Assault, Lunar Operation

**🏰 Fantasy & Magical:**
- Dragon Battle, Medieval Siege, Mythic Warrior, Enchanted Combat

**🎭 Dramatic & Artistic:**
- Film Noir Assassin, Epic Showdown, Silhouette Strike, Dark Vigilante

Each style includes unique color palettes, lighting, mood, and composition instructions to create visually stunning and diverse action posters!

### 📺 Live Top 10 from TMDB
Real-time popular movies and TV shows fetched from The Movie Database (TMDB) API based on your selected country:
- **Popular Movies** - Currently trending films in your region
- **Popular TV Shows** - Top series in your country
- **Action Movies** - Popular action films
- **Sci-Fi Movies** - Trending science fiction
- One-click actionization or use **"Actionize All 10"** to transform an entire category!

### 🌍 Country Selection
Choose your country in Settings to see region-specific Top 10 content. Default is Belgium, with support for:
- Belgium, United States, United Kingdom, Netherlands, France, Germany
- Spain, Italy, Portugal, Japan, South Korea, China
- Canada, Australia, India, Brazil, Mexico, and more!

### 💥 Actionize All 10
Each Top 10 category (Movies, TV Shows, Action, Sci-Fi) has a dedicated "Actionize All 10" button that:
- Transforms all 10 rom-coms/shows in the category sequentially
- Generates action-packed titles, summaries, and posters for each
- Automatically saves them to your collection
- Renames the genre to an action version (e.g., "Romantic Comedy" → "Pure Action")
- Displays them in a special Top 10 card layout in your collection

### 💾 Personal Collection (Netflix-Style)
Your collection now features a beautiful Netflix-inspired layout:

**🎬 Featured Hero Section**
- Large hero banner showcasing a random movie from your collection
- Full-screen poster backdrop with gradient overlay
- Quick access buttons to watch on Netflix or view details

**📺 Action Top 10 Collections**
- Complete transformed categories with Netflix-style ranking display
- Horizontal scrolling rows with rank numbers

**📁 Smart Action Categories**
Individual movies are automatically organized into action subcategories:
- 🔥 **High-Octane Thrillers** - Intense explosive stories
- ⭐ **Rival Warriors** - Epic battles and showdowns
- 💪 **Pure Action** - Nonstop adrenaline and combat
- ✨ **Fantasy Action Epics** - Magical action-packed tales
- 🚀 **Sci-Fi Warfare** - Combat across space and time
- 🌙 **Dark Action & Noir** - Mysterious and gritty
- 😊 **Adrenaline Rush** - Fast-paced and explosive
- 💥 **Classic Action Films** - Timeless action masterpieces
- 🆕 **Recently Added** - Your newest additions

Movies can appear in multiple categories based on their themes!

### ⚙️ AI Model Selection
Choose from multiple OpenAI models:

**Image Generation:**
- DALL-E 3 (Best quality)
- DALL-E 2 (Faster)
- GPT Image 1.5 (Latest)
- GPT Image 1
- GPT Image 1 Mini (Fastest)

**Text Generation:**
- GPT-5.2 (Latest & Best, Default)
- GPT-5 Mini (Fast)
- GPT-5 Nano (Fastest)

### 🌍 Multi-Language Support
Generate action-packed content in:
- English, Dutch, French, Spanish, German
- Italian, Portuguese, Japanese, Korean, Chinese

The entire UI is also translated based on your language selection! When you change the language in settings, all interface elements (navigation, buttons, messages, etc.) will automatically update to your chosen language.

## Configuration

### API Key Setup

The app supports two ways to provide your OpenAI API key:

1. **Environment Variable (Recommended for developers):**
   
   **Windows (PowerShell):**
   ```powershell
   $env:OPENAI_API_KEY='sk-your-key-here'
   ```
   
   **Windows (CMD):**
   ```cmd
   set OPENAI_API_KEY=sk-your-key-here
   ```
   
   **macOS/Linux:**
   ```bash
   export OPENAI_API_KEY='sk-your-key-here'
   ```

2. **Settings Panel:**
   - Launch the app
   - Click the ⚙️ Settings icon
   - Enter your API key
   - Save settings

*Note: Environment variable takes priority over saved settings.*

### Model Selection

1. Click the ⚙️ Settings icon
2. Select your preferred image and text models
3. Choose your language
4. Save settings

## Project Structure

```
electron-app/
├── main.js          # Main process (Electron)
├── preload.js       # Preload script (IPC bridge)
├── index.html       # Main UI
├── styles.css       # Netflix-style CSS
├── renderer.js      # Renderer process logic
├── package.json     # Dependencies & build config
└── assets/
    └── README.md    # Icon creation guide
```

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **OpenAI API** - AI-powered action text & image generation
- **electron-store** - Persistent settings storage
- **electron-builder** - Packaging & distribution

## Building Custom Icons

See `assets/README.md` for icon creation instructions.

## Troubleshooting

### API Key Issues
- Ensure your OpenAI API key has access to the selected models
- DALL-E 3 requires specific API access

### Build Issues
- Run `npm cache clean --force` and reinstall
- Ensure you have proper code signing certificates for macOS

## License

MIT
