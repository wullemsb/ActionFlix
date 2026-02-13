# ActionFlix 💥

"Because even rom-coms get explosive transformations... and everything is better with action!"

So, it's Action Movie Night. You’re all set for an epic evening—popcorn in hand, ready to witness explosions, car chases, and maybe even a few well-timed one-liners. But then... disaster strikes.

"Can we watch something romantic instead?" 😱

Your dreams of high-speed pursuits are about to be replaced by slow-motion hand-holding. But wait! That’s where ActionFlix saves the day!

Simply enter your partner's favorite rom-com title, and BOOM—we sprinkle some explosive action magic on it, turning it into the most action-packed film ever.

The Notebook? Now it's The Detonator—a high-octane tale of a man fighting through enemy lines to reunite with his teammate.
Love Actually? It's now Die Actually—a multi-threaded action thriller where love is lethal and everyone's armed.
Sleepless in Seattle? Welcome to Sleepless Sniper—a tale of a sharpshooter who never rests until the mission is complete.
Not only does this app generate an action-packed title and summary, but it also creates an explosive movie poster! Impress your partner with a film that feels action-packed—even if it started as a rom-com.

Your movie night is saved. Your relationship is thriving. You’re welcome. 🎩💥

## 🖥️ Desktop App (NEW!)

ActionFlix is now available as a **Netflix-styled desktop application** for Windows and macOS!

### Desktop Features
- 🎨 **Beautiful Netflix-inspired UI** - Dark theme with explosive action accents
- 🎬 **Transform Any Rom-Com** - Enter any romantic movie title and get instant actionization
- 💥 **40+ Action Poster Styles** - Each poster uses a randomly selected aesthetic from our diverse collection:
  - Explosions & Fire (Inferno Blast, Fireball Strike, Explosive Entry)
  - Military & Tactical (Spec Ops Mission, Black Ops, Combat Zone)
  - Urban Action (Rooftop Chase, Street Fighter, City Under Siege)
  - Sci-Fi Action (Cyberpunk Streets, Space Battle, Mech Warfare)
  - Post-Apocalyptic (Wasteland Survival, Desert Ruins, Survivor Mode)
  - Martial Arts (Kung Fu Master, Samurai Warrior, Street Brawl)
  - Spy/Thriller (Agent Mode, Surveillance, Undercover Operation)
  - And many more explosive styles!
- 📺 **Live Top 10 from TMDB** - Real-time popular movies and shows by country
- 🌍 **Country-Specific Top 10** - Select your country to see region-specific trending content
- 🔥 **Actionize All 10** - Transform an entire Top 10 category at once with a single click
- 💾 **Netflix-Style Collection** - Your collection now features:
  - 🎬 Hero banner with featured movie
  - 📁 Smart action subcategories (High-Octane Thrillers, Rival Warriors, Pure Action, Fantasy Epics, etc.)
  - 📺 Horizontal scrolling rows like Netflix
  - 🏆 Top 10 collections with ranking display
- 🤖 **Multiple AI Models** - Choose from DALL-E 2/3, GPT Image 1/1.5/Mini, GPT-5.2/Mini/Nano
- 🌍 **Full Internationalization** - UI and content in 10+ languages (English, Dutch, French, Spanish, German, Italian, Portuguese, Japanese, Korean, Chinese)
- ⚙️ **Customizable Settings** - Pick your preferred AI models, language, and region

### API Keys Required

ActionFlix supports multiple AI providers:

#### Option 1: OpenAI (Default)
- **OpenAI API Key** (Required)
  - Get it from: https://platform.openai.com/api-keys
  - Used for: Generating action-packed titles, summaries, and posters
  - Supports: DALL-E 2/3, GPT Image models, GPT-5.2/Mini/Nano

#### Option 2: Azure OpenAI
- **Azure OpenAI Endpoint** and **API Key** (Required)
  - Get it from: Azure Portal
  - Configure deployment names for your text and image models
  - Supports: Same models as OpenAI but deployed in your Azure subscription

#### Option 3: Ollama (Local)
- **Ollama** (Required - free and open source)
  - Install from: https://ollama.ai
  - Run locally on your machine
  - Configure base URL (default: http://localhost:11434)
  - Supports text generation with local models (llama2, mistral, etc.)
  - ⚠️ Note: Image generation requires OpenAI or Azure OpenAI

#### TMDB API Key (Optional - for Top 10 feature)
- Get it from: https://www.themoviedb.org/settings/api
- Free registration required
- Used for: Fetching popular movies and TV shows by country

Add your API keys and configure your preferred provider in the app's Settings menu.

📘 **[Complete AI Provider Setup Guide →](docs/AI_PROVIDER_SETUP.md)**

### Quick Start (Desktop)

**Windows:** Double-click `start-actionflix.bat`

**macOS/Linux:**
```bash
chmod +x start-actionflix.sh
./start-actionflix.sh
```

**Or manually:**
```bash
cd electron-app
npm install
npm start
```

### Build Installers

```bash
npm run build:win   # Windows installer
npm run build:mac   # macOS installer
```

See [electron-app/README.md](electron-app/README.md) for full documentation.

---

## Features (CLI Version)

Turn any rom-com title, summary & poster into an action-packed masterpiece with our powerful and fun tools! 
Whether you're transforming The Notebook into an explosive thriller or giving Love Actually a deadly twist, ActionFlix has got you covered.

## Installation

To get started with ActionFlix, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/wullemsb/ActionFlix.git
   cd ActionFlix
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up your OpenAI API key. You can do this by exporting it as an environment variable:
   
   **Windows (PowerShell):**
   ```powershell
   $env:OPENAI_API_KEY='your_api_key_here'
   ```
   
   **Windows (CMD):**
   ```cmd
   set OPENAI_API_KEY=your_api_key_here
   ```
   
   **macOS/Linux:**
   ```bash
   export OPENAI_API_KEY='your_api_key_here'
   ```
   
   *Note: The Desktop App also allows you to enter the API key in Settings.*

## Usage

To run the application, execute the following command in your terminal:

```
python src/main.py
```

You will be prompted to enter the title of the rom-com you wish to actionize. After entering the title, the application will process it and provide you with an action-packed title, summary, and a movie poster in the movies directory.

## 🔄 Auto-Update Feature

The desktop app includes automatic update functionality:

- **Automatic Checks**: App checks for updates on startup
- **In-App Notifications**: Get notified when new versions are available
- **One-Click Updates**: Download and install updates with a single click
- **Data Preservation**: All your settings, API keys, and collections are preserved during updates
- **Background Downloads**: Updates download in the background without interrupting your work

### User Data Location

Your data is safely stored in:
- **Windows**: `%APPDATA%\actionflix\`
- **macOS**: `~/Library/Application Support/actionflix/`

This data persists across all updates, ensuring you never lose your action movie collection!

## 🚀 For Developers: Creating Releases

Want to create a new release? See the [RELEASE.md](RELEASE.md) guide for detailed instructions.

Quick release:
```powershell
.\release.ps1 -Version "1.1.0" -CreateGitHubRelease
```

Or simply run and enter version when prompted:
```powershell
.\release.ps1 -CreateGitHubRelease
```

This will:
- Build installer for your current platform (Windows or macOS)
- Create git tag and GitHub release
- Upload installers automatically
- Enable auto-update for users

💡 For multi-platform releases, run on each platform or use CI/CD

## OpenAI API Integration

This application utilizes the OpenAI API to generate action-packed content. Ensure you have a valid API key and that you adhere to the usage policies set forth by OpenAI.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.
