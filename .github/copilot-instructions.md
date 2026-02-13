# GitHub Copilot Instructions for ActionFlix

## Project Overview

ActionFlix is a fun application that transforms any rom-com into an explosive action blockbuster using AI. It generates action-packed titles, summaries, and movie posters.

## Project Structure

```
ActionFlix/
├── electron-app/          # Desktop application (Electron + Node.js)
│   ├── main.js            # Main process - IPC handlers, OpenAI API calls
│   ├── preload.js         # Preload script - secure IPC bridge
│   ├── index.html         # UI structure
│   ├── styles.css         # Netflix-style CSS
│   ├── renderer.js        # Frontend logic
│   └── package.json       # Dependencies and build config
├── src/                   # Original Python CLI version
├── start-actionflix.bat   # Windows startup script
├── start-actionflix.sh    # macOS/Linux startup script
└── README.md              # Main documentation
```

## Key Technologies

- **Desktop App**: Electron, Node.js, OpenAI SDK, TMDB API
- **CLI Version**: Python, OpenAI API
- **Styling**: Custom Netflix-inspired CSS

## Important Guidelines

### When Adding New Features

1. **Always update documentation** in both:
   - `README.md` (main project docs)
   - `electron-app/README.md` (desktop app specific docs)

2. **Always update startup scripts** if dependencies or startup process changes:
   - `start-actionflix.bat` (Windows)
   - `start-actionflix.sh` (macOS/Linux)

3. **Maintain consistency** between CLI and desktop app features when applicable

### Code Style

- Use modern ES6+ JavaScript for Electron app
- Follow existing naming conventions
- Keep the Netflix-inspired dark theme aesthetic
- Use CSS variables defined in `:root` for colors

### AI Provider Support

The app now supports multiple AI providers:

1. **OpenAI** (default):
   - Environment variable: `OPENAI_API_KEY` (checked first)
   - Settings stored via electron-store (fallback)
   - Supports all OpenAI models

2. **Azure OpenAI**:
   - Requires endpoint URL, API key, and deployment names
   - All settings stored via electron-store
   - Uses OpenAI SDK with Azure-specific configuration

3. **Ollama** (local):
   - Requires Ollama running locally (default: http://localhost:11434)
   - Configure base URL and model names
   - Text generation only (image generation requires OpenAI/Azure)

4. **TMDB API Key** (optional, for Top 10 feature):
   - Settings stored via electron-store only
   - Required for fetching real-time popular movies/shows by country

When modifying AI provider logic, ensure all three providers work correctly.

### Supported AI Models

**Image Generation (OpenAI/Azure only):**
- `dall-e-3` (default, best quality)
- `dall-e-2` (faster)
- `gpt-image-1.5` (latest)
- `gpt-image-1`
- `gpt-image-1-mini` (fastest)

**Text Generation (all providers):**
- `gpt-5.2` (latest & best, default)
- `gpt-5-mini` (fast)
- `gpt-5-nano` (fastest)
- For Ollama: any installed model (llama2, mistral, etc.)

### Build Commands

```bash
npm run build:win   # Windows installer (.exe)
npm run build:mac   # macOS installer (.dmg)
npm run build:all   # Both platforms
```

### Testing Changes

Always test:
1. App startup: `npm start` from electron-app/
2. Settings save/load
3. Movie transformation flow
4. Collection save/delete

## Documentation Maintenance Checklist

When making changes, ensure these are updated:

- [ ] `README.md` - Main features list and quick start
- [ ] `electron-app/README.md` - Detailed desktop app docs
- [ ] `start-actionflix.bat` - Windows script (if startup changes)
- [ ] `start-actionflix.sh` - macOS script (if startup changes)
- [ ] `RELEASE.md` - If release process changes
- [ ] This file - If project structure changes

## Release Management

### Creating a New Release

Use the automated release script:

```powershell
# Specify version
.\release.ps1 -Version "1.1.0" -CreateGitHubRelease

# Or run without version to be prompted
.\release.ps1 -CreateGitHubRelease
```

The script always builds for all platforms (Windows + macOS).

See [RELEASE.md](../RELEASE.md) for full documentation.

### Auto-Update System

ActionFlix includes automatic update functionality:
- Updates are checked on app startup
- Users are notified in-app when updates are available
- User data (API keys, collections, settings) is preserved across updates
- Powered by `electron-updater` and GitHub releases

When creating releases with `-CreateGitHubRelease`, the app will automatically detect them and notify users.

## Common Tasks

### Adding a New AI Model

1. Add option to `electron-app/index.html` in the appropriate select
2. Handle the model in `electron-app/main.js` API calls
3. Update model lists in documentation

### Adding a New Language

1. Add option to language select in `electron-app/index.html`
2. No backend changes needed (passed directly to OpenAI)
3. Update supported languages in documentation

### Adding a New View/Page

1. Add HTML section in `index.html` with class `view`
2. Add navigation link with `data-view` attribute
3. Add corresponding styles in `styles.css`
4. Add initialization and logic in `renderer.js`
