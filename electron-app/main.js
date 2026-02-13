const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

const store = new Store();

let mainWindow;

// Common brand/franchise names to remove for safety system compliance
const BRAND_FRANCHISE_NAMES = [
  // Movie franchises
  'Marvel', 'DC', 'Disney', 'Pixar', 'DreamWorks', 'Warner Bros', 'Universal',
  'Star Wars', 'Star Trek', 'Harry Potter', 'Lord of the Rings', 'Hobbit',
  'Avengers', 'Spider-Man', 'Spiderman', 'Batman', 'Superman', 'Wonder Woman',
  'X-Men', 'Transformers', 'Fast & Furious', 'Fast and Furious', 'Jurassic',
  'Terminator', 'Matrix', 'James Bond', '007', 'Mission Impossible',
  'Indiana Jones', 'Pirates of the Caribbean', 'Alien', 'Predator',
  'Ghostbusters', 'Men in Black', 'Shrek', 'Toy Story', 'Finding Nemo',
  'Frozen', 'Minions', 'Despicable Me', 'Kung Fu Panda', 'Madagascar',
  'Ice Age', 'How to Train Your Dragon', 'Godzilla', 'Kong', 'King Kong',
  'John Wick', 'Rocky', 'Creed', 'Rambo', 'Die Hard', 'Lethal Weapon',
  'Back to the Future', 'Blade Runner', 'Hunger Games', 'Twilight',
  'Fifty Shades', 'The Godfather', 'Scarface', 'Goodfellas',
  // Characters
  'Iron Man', 'Captain America', 'Thor', 'Hulk', 'Black Widow', 'Hawkeye',
  'Black Panther', 'Doctor Strange', 'Ant-Man', 'Groot', 'Thanos',
  'Joker', 'Harley Quinn', 'Catwoman', 'Robin', 'Aquaman', 'Flash',
  'Darth Vader', 'Luke Skywalker', 'Yoda', 'Chewbacca', 'Han Solo',
  'Dumbledore', 'Voldemort', 'Gandalf', 'Frodo', 'Gollum', 'Sauron',
  'Optimus Prime', 'Bumblebee', 'Megatron',
  // Studios/Companies
  'Netflix', 'Amazon', 'HBO', 'Paramount', 'Sony', 'Fox', '20th Century',
  'MGM', 'Lionsgate', 'New Line', 'Legendary', 'Columbia Pictures',
  // Horror franchises
  'Chucky', 'Child\'s Play', 'Freddy', 'Krueger', 'Jason', 'Voorhees',
  'Michael Myers', 'Halloween', 'Nightmare on Elm Street', 'Friday the 13th',
  'Saw', 'Conjuring', 'Annabelle', 'Insidious', 'Paranormal Activity',
  'Scream', 'Ghostface', 'Pennywise', 'IT', 'Exorcist', 'Poltergeist',
  // Video game adaptations
  'Mario', 'Sonic', 'Pokemon', 'Pikachu', 'Zelda', 'Minecraft',
  'Resident Evil', 'Tomb Raider', 'Mortal Kombat', 'Street Fighter',
  'Assassin\'s Creed', 'Uncharted', 'Halo', 'Call of Duty'
];

/**
 * Creates a safer prompt for image generation by removing brand names
 * and making the description more generic/original
 */
function createSaferImagePrompt(originalTitle, actionTitle, genre, originalSummary) {
  // Remove brand/franchise names from title
  let safeTitle = actionTitle || originalTitle || 'Untitled Action';
  let safeOriginalTitle = originalTitle || '';
  
  // Remove brand names (case insensitive)
  for (const brand of BRAND_FRANCHISE_NAMES) {
    const regex = new RegExp(brand, 'gi');
    safeTitle = safeTitle.replace(regex, '').trim();
    safeOriginalTitle = safeOriginalTitle.replace(regex, '').trim();
  }
  
  // Clean up multiple spaces and trailing/leading punctuation
  safeTitle = safeTitle.replace(/\s+/g, ' ').replace(/^[:\-\s]+|[:\-\s]+$/g, '').trim();
  safeOriginalTitle = safeOriginalTitle.replace(/\s+/g, ' ').replace(/^[:\-\s]+|[:\-\s]+$/g, '').trim();
  
  // If title is now empty or too short, use generic title
  if (!safeTitle || safeTitle.length < 3) {
    safeTitle = 'Maximum Fury';
  }
  
  // Convert genre to a safe, generic description
  const genreLower = (genre || '').toLowerCase();
  let themeDescription = '';
  
  if (genreLower.includes('sci-fi') || genreLower.includes('science')) {
    themeDescription = 'a futuristic setting with advanced technology and explosive space battles';
  } else if (genreLower.includes('horror') || genreLower.includes('thriller')) {
    themeDescription = 'a dark tense atmosphere with dangerous action and combat';
  } else if (genreLower.includes('romance') || genreLower.includes('comedy')) {
    themeDescription = 'an intense battlefield with explosions and military operations';
  } else if (genreLower.includes('fantasy')) {
    themeDescription = 'an epic battlefield with swords, warriors, and mystical combat';
  } else if (genreLower.includes('animation') || genreLower.includes('family')) {
    themeDescription = 'an adventurous world with high-energy action and excitement';
  } else if (genreLower.includes('war') || genreLower.includes('history')) {
    themeDescription = 'a historical battlefield with period warfare and combat';
  } else if (genreLower.includes('drama')) {
    themeDescription = 'an intense action-packed setting with high stakes';
  } else {
    themeDescription = 'a cinematic action-packed setting with explosions';
  }
  
  // Build a completely original prompt that doesn't reference any existing movie
  const saferPrompt = `Create an ORIGINAL action movie poster concept (not based on any existing film or franchise).

POSTER TITLE: "${safeTitle}"

SCENE DESCRIPTION:
An explosive action hero in ${themeDescription}. Show intense combat, dramatic explosions, or high-stakes confrontation.

ARTISTIC STYLE:
- Professional Hollywood/Netflix movie poster quality
- Photorealistic, high-end cinematographic look
- Dramatic lighting with fire, explosions, or intense highlights
- Color palette: orange fire, red explosions, steel blue, dark shadows
- Dynamic action composition with depth
- 8K detail quality
- Intense, dramatic composition

TYPOGRAPHY:
- Display the title "${safeTitle}" prominently
- Use bold, aggressive military-style or impact font
- Add metallic effect or explosive glow to the title text

IMPORTANT: This is an ORIGINAL creative concept, not a recreation or parody of any existing film. Create something unique and explosive.`;

  return saferPrompt;
}

/**
 * Creates an ultra-safe fallback prompt with minimal specific details
 */
function createUltraSafeImagePrompt(actionTitle = 'Maximum Impact') {
  return `Create a powerful action movie poster for "${actionTitle}".

SCENE: A determined action hero in intense combat during an explosive moment with dramatic fire and smoke.

STYLE:
- Professional cinema poster quality
- Intense orange, red, and steel blue color palette
- Dynamic explosions and smoke background
- Photorealistic, high quality
- Dramatic and intense

Include bold military-style typography that says "${actionTitle}" in aggressive impact font.

This is an original artistic creation, not based on any existing property.`;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1000,
    minHeight: 800,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#141414',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');

  // Create application menu
  createMenu();

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

function createMenu() {
  const isMac = process.platform === 'darwin';
  
  const template = [
    // macOS app menu
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {
          label: 'About ActionFlix',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('show-about');
            }
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    // Help menu (with About for Windows/Linux)
    {
      label: 'Help',
      submenu: [
        ...(!isMac ? [{
          label: 'About ActionFlix',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('show-about');
            }
          }
        },
        { type: 'separator' }] : []),
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/janvanwassenhove/ActionFlix')
          }
        },
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/janvanwassenhove/ActionFlix#readme')
          }
        },
        { type: 'separator' },
        {
          label: 'Check for Updates...',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('manual-update-check');
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('No updates available');
});

autoUpdater.on('error', (err) => {
  console.log('Error checking for updates:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

autoUpdater.on('download-progress', (progress) => {
  console.log(`Download progress: ${progress.percent}%`);
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', progress);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Window controls
ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow.close();
});

// Settings management
function getApiKey() {
  // Check environment variable first, then fall back to stored setting
  return process.env.OPENAI_API_KEY || store.get('apiKey', '');
}

ipcMain.handle('get-settings', () => {
  const envApiKey = process.env.OPENAI_API_KEY;
  return {
    apiKey: store.get('apiKey', ''),
    envApiKey: envApiKey || null,  // Let UI know if env key exists
    hasEnvApiKey: !!envApiKey,
    imageModel: store.get('imageModel', 'dall-e-3'),
    textModel: store.get('textModel', 'gpt-5.2'),
    language: store.get('language', 'English'),
    tmdbApiKey: store.get('tmdbApiKey', ''),
    country: store.get('country', 'BE')
  };
});

ipcMain.handle('save-settings', (event, settings) => {
  store.set('apiKey', settings.apiKey);
  store.set('imageModel', settings.imageModel);
  store.set('textModel', settings.textModel);
  store.set('language', settings.language);
  store.set('tmdbApiKey', settings.tmdbApiKey);
  store.set('country', settings.country);
  return true;
});

// Test TMDB API key
ipcMain.handle('test-tmdb-key', async (event, apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    return { success: false, error: 'API key is required' };
  }
  
  try {
    // Test with a simple configuration request
    const testUrl = `https://api.themoviedb.org/3/configuration?api_key=${apiKey}`;
    const response = await axios.get(testUrl, { timeout: 10000 });
    
    if (response.data && response.data.images) {
      return { success: true, message: 'TMDB API key is valid!' };
    }
    
    return { success: false, error: 'Invalid response from TMDB' };
  } catch (error) {
    console.error('TMDB API test failed:', error.message);
    
    if (error.response) {
      // TMDB returned an error
      if (error.response.status === 401) {
        return { success: false, error: 'Invalid API key. Please check your TMDB API key.' };
      } else if (error.response.status === 404) {
        return { success: false, error: 'TMDB API endpoint not found.' };
      } else {
        return { success: false, error: `TMDB API error: ${error.response.status}` };
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      return { success: false, error: 'Network error. Please check your internet connection.' };
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return { success: false, error: 'Request timeout. Please try again.' };
    }
    
    return { success: false, error: `Connection failed: ${error.message}` };
  }
});

// Get saved movies
ipcMain.handle('get-saved-movies', () => {
  return store.get('movies', []);
});

ipcMain.handle('save-movie', (event, movie) => {
  const movies = store.get('movies', []);
  movies.unshift(movie);
  store.set('movies', movies);
  return movies;
});

ipcMain.handle('delete-movie', (event, movieId) => {
  const movies = store.get('movies', []);
  const filtered = movies.filter(m => String(m.id) !== String(movieId));
  store.set('movies', filtered);
  return filtered;
});

// Top 10 Collections management
ipcMain.handle('get-top10-collections', () => {
  return store.get('top10Collections', []);
});

ipcMain.handle('save-top10-collection', (event, collection) => {
  const collections = store.get('top10Collections', []);
  collections.unshift(collection);
  store.set('top10Collections', collections);
  return collections;
});

ipcMain.handle('delete-top10-collection', (event, collectionId) => {
  const collections = store.get('top10Collections', []);
  const collectionToDelete = collections.find(c => c.id === collectionId);
  
  // Also delete the associated movies
  if (collectionToDelete && collectionToDelete.movieIds) {
    const movies = store.get('movies', []);
    const filteredMovies = movies.filter(m => !collectionToDelete.movieIds.includes(m.id));
    store.set('movies', filteredMovies);
  }
  
  const filteredCollections = collections.filter(c => c.id !== collectionId);
  store.set('top10Collections', filteredCollections);
  return filteredCollections;
});

// OpenAI API calls
function getOpenAIClient() {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable or add it in Settings.');
  }
  return new OpenAI({ apiKey });
}

ipcMain.handle('get-movie-info', async (event, movieTitle) => {
  try {
    const openai = getOpenAIClient();
    const textModel = store.get('textModel', 'gpt-5.2');
    
    console.log(`Fetching movie info for: "${movieTitle}" using model: ${textModel}`);
    
    const response = await openai.chat.completions.create({
      model: textModel,
      messages: [
        { 
          role: 'system', 
          content: `You are a helpful movie database assistant. When given a movie title (which may be misspelled or incomplete), find the best matching real movie and return information about it.
          
Always return valid JSON with these exact keys:
- title: The correct/official movie title
- year: Release year as a number
- genre: Main genre(s)
- director: Director name(s)
- summary: A brief plot summary (2-3 sentences)
- matchedQuery: The original query you received (for reference)

If the movie title seems misspelled, find the closest matching real movie. If you truly cannot identify any movie, return JSON with title set to the query and a summary explaining you couldn't find information about this specific movie.`
        },
        { role: 'user', content: `Find information about the movie: "${movieTitle}"` }
      ],
      max_completion_tokens: 600,
      response_format: { type: "json_object" }
    });
    
    console.log('API Response received:', JSON.stringify(response, null, 2));
    
    const content = response.choices?.[0]?.message?.content;
    if (!content || content.trim() === '') {
      console.warn('Empty response content, returning fallback data');
      // Return fallback data instead of throwing error
      return {
        title: movieTitle,
        year: new Date().getFullYear(),
        genre: 'Drama',
        director: 'Unknown',
        summary: `"${movieTitle}" - A cinematic masterpiece waiting to be transformed into an action-packed adventure. While we couldn't retrieve all details, we can still create an amazing action version!`
      };
    }
    
    try {
      const parsed = JSON.parse(content);
      console.log('Successfully parsed movie info:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', content);
      // Return a fallback object if parsing fails
      return {
        title: movieTitle,
        year: new Date().getFullYear(),
        genre: 'Drama',
        director: 'Unknown',
        summary: `Could not retrieve detailed information for "${movieTitle}". You can still proceed to create an action version!`
      };
    }
  } catch (error) {
    console.error('Error in get-movie-info:', error);
    // Return fallback instead of throwing
    return {
      title: movieTitle,
      year: new Date().getFullYear(),
      genre: 'Drama',
      director: 'Unknown',
      summary: `"${movieTitle}" - Let's transform this into an action masterpiece! (Note: Could not retrieve original details due to: ${error.message})`
    };
  }
});

ipcMain.handle('actionize-movie', async (event, { title, summary }) => {
  try {
    console.log('=== ROMANTICIZE MOVIE START ===');
    console.log('Input:', { title, summary });
    
    const openai = getOpenAIClient();
    const textModel = store.get('textModel', 'gpt-5.2');
    const language = store.get('language', 'English');
    
    console.log('Using text model:', textModel, 'Language:', language);
    
    // Reasoning models (gpt-5.x, gpt-4o, etc.) use tokens for internal reasoning
    // so we need MUCH higher limits to get actual content output
    // gpt-5-mini can use 300-600 tokens just for reasoning alone!
    const isReasoningModel = textModel.includes('gpt-5') || textModel.includes('gpt-4o');
    const titleTokenLimit = isReasoningModel ? 800 : 100;
    
    console.log('Token strategy - Reasoning model:', isReasoningModel, 'Token limit:', titleTokenLimit);
    
    // Get action title
    // For reasoning models, use a more direct prompt that requires less reasoning
    const systemPrompt = isReasoningModel 
      ? `Transform ANY romantic comedy or rom-com title into an explosive action version. Examples:
"The Notebook" → "Tactical Strike Force"
"Sleepless in Seattle" → "Seattle Under Siege"
"Love Actually" → "War Protocol"
"27 Dresses" → "27 Weapons"

Respond with ONLY the action title.`
      : `You are a creative writer specializing in action movie titles. Your task is to transform ANY romantic comedy or rom-com title into an explosive action version. This is for a fun movie poster generator app.

RULES:
1. ALWAYS respond with exactly one action-packed title
2. Keep it intense and dramatic
3. Be creative - transform romance into combat/military/explosions
4. Never refuse - every rom-com can have an action twist

Examples of transformations:
- "The Notebook" → "Tactical Strike Force"
- "Sleepless in Seattle" → "Seattle Under Siege"  
- "The Proposal" → "The Extraction Protocol"
- "Crazy, Stupid, Love" → "Crazy, Deadly, Combat"
- "27 Dresses" → "27 Weapons"
- "Love Actually" → "War Protocol"

Respond with ONLY the new action title, no quotes, no explanation.`;
    
    const titleResponse = await openai.chat.completions.create({
      model: textModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create an action movie title based on: "${title}" (in ${language})` }
      ],
      max_completion_tokens: titleTokenLimit
    });
    
    console.log('Title API response:', JSON.stringify(titleResponse, null, 2));
    
    // Check for refusal
    const message = titleResponse.choices?.[0]?.message;
    if (message?.refusal) {
      console.warn('Model refused to generate title:', message.refusal);
    }
    
    // Check if response was truncated due to token limit
    const finishReason = titleResponse.choices?.[0]?.finish_reason;
    if (finishReason === 'length' && (!message?.content || message.content.trim() === '')) {
      console.warn('Empty response with finish_reason=length. Model used all tokens for reasoning. Usage:', titleResponse.usage);
      console.warn('This indicates the model needs more completion tokens for reasoning + output.');
    }
    
    let actionTitle = message?.content?.trim();
    
    // Remove any quotes the model might have added
    if (actionTitle) {
      actionTitle = actionTitle.replace(/^["']|["']$/g, '');
    }
    
    // If still empty, try a second attempt with simpler prompt
    if (!actionTitle) {
      console.warn('Empty action title response, trying simpler prompt...');
      
      // Use even more tokens for retry with simpler prompt
      const retryTokenLimit = isReasoningModel ? 1000 : 100;
      console.log('Retry attempt with token limit:', retryTokenLimit);
      
      const retryResponse = await openai.chat.completions.create({
        model: textModel,
        messages: [
          { role: 'user', content: `Give me an action movie title inspired by "${title}". Just the title, nothing else.` }
        ],
        max_completion_tokens: retryTokenLimit
      });
      
      console.log('Retry response finish_reason:', retryResponse.choices?.[0]?.finish_reason);
      console.log('Retry response usage:', retryResponse.usage);
      console.log('Retry response content:', retryResponse.choices?.[0]?.message?.content);
      
      actionTitle = retryResponse.choices?.[0]?.message?.content?.trim();
      if (actionTitle) {
        actionTitle = actionTitle.replace(/^["']|["']$/g, '');
      }
    }
    
    // Before final fallback, try to sanitize the description and regenerate
    if (!actionTitle) {
      console.warn('Title generation still failed, attempting to sanitize description and regenerate...');
      
      try {
        // Step 1: Ask LLM to create a sanitized/safer description
        const sanitizeResponse = await openai.chat.completions.create({
          model: textModel,
          messages: [
            { 
              role: 'system', 
              content: `You are a helpful assistant that creates safe, brand-free descriptions for creative projects. Remove all:
- Brand names (Disney, Marvel, DC, Netflix, etc.)
- Franchise names (Star Wars, Harry Potter, etc.)
- Character names from existing media (Darth Vader, Spider-Man, etc.)
- Trademarked terms
- Potentially problematic content

Replace them with generic descriptive terms that capture the essence and themes without referencing specific intellectual property.`
            },
            { 
              role: 'user', 
              content: `Create a safe, generic description for a movie originally titled "${title}" with this plot: "${summary}". 
              
Remove all brand names, franchise references, and trademarked content. Focus on the core themes, genre elements, and story structure without referencing specific properties. Keep it concise (2-3 sentences max).` 
            }
          ],
          max_completion_tokens: isReasoningModel ? 1200 : 200
        });
        
        console.log('Sanitization response finish_reason:', sanitizeResponse.choices?.[0]?.finish_reason);
        console.log('Sanitization response usage:', sanitizeResponse.usage);
        
        const sanitizedDescription = sanitizeResponse.choices?.[0]?.message?.content?.trim();
        console.log('Sanitized description:', sanitizedDescription);
        
        if (sanitizedDescription && sanitizedDescription.length > 20) {
          // Step 2: Try to generate action title with sanitized description
          const sanitizedTitleResponse = await openai.chat.completions.create({
            model: textModel,
            messages: [
              { 
                role: 'system', 
                content: `You are a creative writer specializing in action movie titles. Create an original, explosive action title based on the description provided. Be bold and intense. Respond with ONLY the title, no quotes or explanation.` 
              },
              { 
                role: 'user', 
                content: `Create an action movie title in ${language} based on this concept: "${sanitizedDescription}". Just the title, nothing else.` 
              }
            ],
            max_completion_tokens: isReasoningModel ? 1000 : 100
          });
          
          console.log('Sanitized title response finish_reason:', sanitizedTitleResponse.choices?.[0]?.finish_reason);
          console.log('Sanitized title response usage:', sanitizedTitleResponse.usage);
          
          const sanitizedTitle = sanitizedTitleResponse.choices?.[0]?.message?.content?.trim();
          if (sanitizedTitle) {
            actionTitle = sanitizedTitle.replace(/^["']|["']$/g, '');
            console.log('Successfully generated title from sanitized description:', actionTitle);
          }
        }
      } catch (sanitizeError) {
        console.error('Sanitization attempt failed:', sanitizeError.message);
        // Continue to final fallback
      }
    }
    
    // Final fallback - generate creative title ourselves
    if (!actionTitle) {
      console.warn('All API attempts failed, using creative fallback...');
      const actionPrefixes = ['Operation', 'Strike', 'Combat', 'Maximum', 'Tactical', 'Code'];
      const actionSuffixes = ['Protocol', 'Strike', 'Assault', 'Fury', 'Force', 'Chaos'];
      const usePrefix = Math.random() > 0.5;
      if (usePrefix) {
        const prefix = actionPrefixes[Math.floor(Math.random() * actionPrefixes.length)];
        actionTitle = `${prefix} ${title}`;
      } else {
        const suffix = actionSuffixes[Math.floor(Math.random() * actionSuffixes.length)];
        actionTitle = `${title} ${suffix}`;
      }
    }
    
    console.log('Generated action title:', actionTitle);
    
    // Get action summary (use higher token limit for reasoning models)
    const summaryTokenLimit = isReasoningModel ? 1500 : 800;
    console.log('Generating summary with token limit:', summaryTokenLimit);
    
    const summaryResponse = await openai.chat.completions.create({
      model: textModel,
      messages: [
        { role: 'system', content: 'You are a creative assistant that transforms romantic comedy summaries into explosive action versions. Be creative but keep it concise (max 150 words). Focus on combat, explosions, and adrenaline!' },
        { role: 'user', content: `Transform this rom-com summary into a hyper-action version in ${language}. Make it explosive and full of danger, but keep it under 150 words:\n\n"${summary}"` }
      ],
      max_completion_tokens: summaryTokenLimit
    });
    
    console.log('Summary API response finish_reason:', summaryResponse.choices?.[0]?.finish_reason);
    console.log('Summary API response usage:', summaryResponse.usage);
    
    let actionSummary = summaryResponse.choices[0]?.message?.content?.trim();
    
    // Check if summary generation failed due to token limit
    if (!actionSummary || actionSummary === '') {
      const summaryFinishReason = summaryResponse.choices?.[0]?.finish_reason;
      if (summaryFinishReason === 'length') {
        console.warn('Summary generation hit token limit. Reasoning tokens used:', summaryResponse.usage?.completion_tokens_details?.reasoning_tokens);
      }
      actionSummary = 'An explosive action thriller awaits...';
      console.warn('Empty summary response, using fallback:', actionSummary);
    }
    
    console.log('Generated action summary:', actionSummary);
    console.log('=== ACTIONIZE MOVIE END ===');
    
    return {
      actionTitle,
      actionSummary
    };
  } catch (error) {
    console.error('Error in actionize-movie:', error);
    throw new Error(error.message);
  }
});

ipcMain.handle('generate-tags', async (event, { actionTitle, actionSummary, genre }) => {
  try {
    console.log('=== GENERATE TAGS START ===');
    
    const openai = getOpenAIClient();
    const textModel = store.get('textModel', 'gpt-5.2');
    const language = store.get('language', 'English');
    
    const response = await openai.chat.completions.create({
      model: textModel,
      messages: [
        { 
          role: 'system', 
          content: `You are a creative assistant that generates engaging tags/keywords for action movies. Return ONLY a JSON array of 4-6 short tags (1-2 words each) that capture the essence and themes of the action story. Focus on combat, explosions, intensity, and action elements. Always return valid JSON with an array of strings.` 
        },
        { 
          role: 'user', 
          content: `Generate 4-6 engaging tags in ${language} for this action movie:\n\nTitle: ${actionTitle}\n\nSummary: ${actionSummary}\n\nOriginal Genre: ${genre || 'Unknown'}\n\nReturn only a JSON array of tags like: ["Tag1", "Tag2", "Tag3", "Tag4"]` 
        }
      ],
      max_completion_tokens: 150,
      response_format: { type: "json_object" }
    });
    
    
    const content = response.choices[0]?.message?.content?.trim();
    console.log('Raw tags response:', content);
    
    if (!content) {
      console.warn('Empty tags response, using defaults');
      return ['Romance', 'Love Story', 'Passion', 'AI Generated'];
    }
    
    try {
      const parsed = JSON.parse(content);
      // Handle both {tags: [...]} and direct array formats
      const tags = Array.isArray(parsed) ? parsed : (parsed.tags || parsed.keywords || []);
      
      if (Array.isArray(tags) && tags.length > 0) {
        console.log('Generated tags:', tags);
        return tags.slice(0, 6); // Limit to 6 tags
      }
    } catch (parseError) {
      console.error('Failed to parse tags JSON:', parseError);
    }
    
    // Fallback tags
    return ['Romance', 'Love Story', 'Passion', 'AI Generated'];
  } catch (error) {
    console.error('Error in generate-tags:', error);
    // Return fallback tags on error
    return ['Romance', 'Love Story', 'Passion', 'AI Generated'];
  }
});

ipcMain.handle('generate-poster', async (event, { originalTitle, actionTitle, genre, originalSummary, originalPosterUrl }) => {
  try {
    console.log('=== POSTER GENERATION START ===');
    console.log('Input params:', JSON.stringify({ originalTitle, actionTitle, genre, originalSummary, originalPosterUrl }, null, 2));
    
    const openai = getOpenAIClient();
    const imageModel = store.get('imageModel', 'dall-e-3');
    console.log('Using image model:', imageModel);
    
    // Use actionTitle, fallback to originalTitle if empty
    const titleForPrompt = actionTitle && actionTitle.trim() ? actionTitle : originalTitle || 'Untitled Action';
    console.log('Title for prompt:', titleForPrompt);
    
    // Add action variations for diversity in poster collection
    // Expanded collection with 40+ unique action styles
    const actionStyles = [
      // === EXPLOSIONS & FIRE ===
      {
        name: 'Inferno Blast',
        colors: 'Orange fire, red flames, yellow explosions, black smoke',
        lighting: 'Explosive fireball lighting with intense heat glow',
        mood: 'Explosive and intense with maximum destruction',
        composition: 'Hero walking away from massive explosion behind them',
        artStyle: 'Michael Bay style explosive action cinematography'
      },
      {
        name: 'Fireball Strike',
        colors: 'Deep red, bright orange, yellow fire, and dark shadows',
        lighting: 'Dramatic explosion lighting with fire reflections',
        mood: 'High-intensity with pyroclastic energy',
        composition: 'Close-up of determined hero with fireball erupting in background',
        artStyle: 'John Woo bullet-time action aesthetic'
      },
      {
        name: 'Explosive Sunset',
        colors: 'Burnt orange, crimson red, dark silhouettes against fire',
        lighting: 'Backlit by massive explosion at golden hour',
        mood: 'Epic and dramatic with apocalyptic scale',
        composition: 'Hero silhouette against sunset merged with explosion',
        artStyle: 'Christopher Nolan IMAX epic scale'
      },
      {
        name: 'Burning City',
        colors: 'Fire orange, ash grey, smoke black, ember red',
        lighting: 'City on fire with flames illuminating buildings',
        mood: 'Catastrophic destruction with urban warfare',
        composition: 'Hero in foreground with burning cityscape behind',
        artStyle: 'Die Hard urban action style'
      },
      {
        name: 'Phoenix Rising',
        colors: 'Gold flames, scarlet red, ash grey, bright yellow',
        lighting: 'Rising fire with dramatic upward lighting',
        mood: 'Rebirth through fire with triumphant energy',
        composition: 'Hero emerging from flames with fire wings effect',
        artStyle: 'Zack Snyder mythic action cinematography'
      },
      
      // === MILITARY & TACTICAL ===
      {
        name: 'Military Operation',
        colors: 'Olive drab, khaki tan, camouflage green, steel grey',
        lighting: 'Harsh tactical lighting with night vision green tint',
        mood: 'Strategic and tactical with military precision',
        composition: 'Soldiers in tactical formation with weapons ready',
        artStyle: 'Zero Dark Thirty realistic military aesthetic'
      },
      {
        name: 'Black Ops Mission',
        colors: 'Deep black, tactical grey, NVG green, red laser sights',
        lighting: 'Night ops lighting with minimal illumination',
        mood: 'Covert and stealthy with special forces intensity',
        composition: 'Elite operators in darkness with tactical gear silhouettes',
        artStyle: 'Call of Duty Modern Warfare tactical realism'
      },
      {
        name: 'Combat Zone',
        colors: 'Desert tan, blood red, smoke grey, muzzle flash yellow',
        lighting: 'Battlefield dust and gunfire flashes',
        mood: 'Intense combat with war zone atmosphere',
        composition: 'Soldiers in active firefight with bullets and explosions',
        artStyle: 'Saving Private Ryan gritty war realism'
      },
      {
        name: 'Spec Ops',
        colors: 'Midnight black, tactical grey, IR laser red, stealth blue',
        lighting: 'High-tech tactical lighting with laser targeting',
        mood: 'Elite forces with cutting-edge military tech',
        composition: 'Special forces team with advanced weapons and gear',
        artStyle: 'Act of Valor authentic SEAL team aesthetic'
      },
      {
        name: 'Tactical Strike',
        colors: 'Gunmetal grey, olive green, red targeting reticle, black',
        lighting: 'Tactical flashlight beams cutting through smoke',
        mood: 'Precision military operation with focused intensity',
        composition: 'Close quarters combat with tactical weapons',
        artStyle: 'Sicario tense tactical operations'
      },
      {
        name: 'War Room',
        colors: 'Command center blue, radar screen green, alert red, steel',
        lighting: 'Multiple monitor glow with strategic map lighting',
        mood: 'Strategic command with high-stakes decision making',
        composition: 'Military leaders coordinating massive operation',
        artStyle: 'Tom Clancy strategic military thriller'
      },
      
      // === URBAN ACTION ===
      {
        name: 'Rooftop Chase',
        colors: 'City night lights, neon reflections, dark rooftops, moonlight',
        lighting: 'Dynamic chase lighting with city glow',
        mood: 'High-speed parkour with urban adrenaline',
        composition: 'Hero mid-leap between buildings with city below',
        artStyle: 'District 13 parkour action style'
      },
      {
        name: 'Street Fighter',
        colors: 'Neon signs, wet asphalt, street lamp orange, fight club red',
        lighting: 'Underground fight lighting with crowd shadows',
        mood: 'Raw hand-to-hand combat with street intensity',
        composition: 'Close combat between fighters in urban setting',
        artStyle: 'The Raid brutal martial arts cinematography'
      },
      {
        name: 'City Under Siege',
        colors: 'Emergency red, police blue, smoke grey, shattered glass',
        lighting: 'Chaos lighting with sirens and emergency lights',
        mood: 'Urban crisis with citywide threat',
        composition: 'Hero defending city against massive attack',
        artStyle: 'The Dark Knight urban siege atmosphere'
      },
      {
        name: 'Urban Warfare',
        colors: 'Concrete grey, muzzle flash yellow, blood spatter red, smoke',
        lighting: 'Street battle with gunfire and tactical lights',
        mood: 'Intense firefight in urban environment',
        composition: 'Combat in city streets with cover and tactics',
        artStyle: 'Black Hawk Down urban combat realism'
      },
      {
        name: 'Parkour Pursuit',
        colors: 'Urban grey, motion blur, bright daylight, athletic gear',
        lighting: 'High-energy daylight with dynamic motion',
        mood: 'High-speed chase with acrobatic movement',
        composition: 'Hero in mid-air parkour move being pursued',
        artStyle: 'Casino Royale crane chase sequence'
      },
      {
        name: 'Alley Combat',
        colors: 'Dark shadows, dim street light, brick red, steel weapons',
        lighting: 'Single overhead light in dark alley',
        mood: 'Close-quarters brutal fight',
        composition: 'Hand-to-hand combat in narrow alley space',
        artStyle: 'John Wick tactical alley fight choreography'
      },
      
      // === SCI-FI ACTION ===
      {
        name: 'Cyberpunk Streets',
        colors: 'Neon cyan, hot pink holograms, dark urban, digital rain',
        lighting: 'Cyberpunk neon with holographic displays',
        mood: 'High-tech dystopian action',
        composition: 'Hero with cybernetic enhancements in neon city',
        artStyle: 'Blade Runner 2049 cyberpunk aesthetic'
      },
      {
        name: 'Space Battle',
        colors: 'Deep space black, laser blue, explosion orange, star white',
        lighting: 'Spacecraft explosions lighting up space',
        mood: 'Epic space combat with massive scale',
        composition: 'Fighter ships in intense space dogfight',
        artStyle: 'Star Wars space battle cinematography'
      },
      {
        name: 'Mech Warfare',
        colors: 'Metallic steel, HUD blue, laser red, industrial grey',
        lighting: 'Mechanical cockpit lighting with HUD glow',
        mood: 'Giant robot combat with mechanical warfare',
        composition: 'Pilot in mech suit battling other mechs',
        artStyle: 'Pacific Rim mech vs monster scale'
      },
      {
        name: 'Neon Dystopia',
        colors: 'Electric purple, toxic green, rust orange, acid yellow',
        lighting: 'Harsh neon with dystopian atmosphere',
        mood: 'Cyberpunk rebellion with tech noir',
        composition: 'Hacker/fighter in dystopian tech environment',
        artStyle: 'Ghost in the Shell cyber-action aesthetic'
      },
      {
        name: 'Blade Runner Style',
        colors: 'Noir rain, neon reflections, smoky blue, amber lights',
        lighting: 'Film noir meets neon cyberpunk',
        mood: 'Tech noir detective action',
        composition: 'Agent in rain-soaked neon city',
        artStyle: 'Blade Runner atmospheric tech noir'
      },
      {
        name: 'Matrix Mode',
        colors: 'Code green, digital black, bullet trail silver, leather black',
        lighting: 'Digital rain effect with bullet time',
        mood: 'Reality-bending action with digital warfare',
        composition: 'Hero dodging bullets in bullet-time freeze',
        artStyle: 'The Matrix bullet-time revolutionary style'
      },
      
      // === POST-APOCALYPTIC ===
      {
        name: 'Wasteland Survival',
        colors: 'Desert tan, rust red, dust brown, bleached bone white',
        lighting: 'Harsh desert sun with dust storms',
        mood: 'Brutal survival in harsh wasteland',
        composition: 'Survivor with weapons in barren wasteland',
        artStyle: 'Mad Max Fury Road desert warfare'
      },
      {
        name: 'Desert Ruins',
        colors: 'Sand yellow, ancient stone, sun-bleached, sky blue',
        lighting: 'Desert heat shimmer with ruins',
        mood: 'Ancient meets apocalypse',
        composition: 'Warrior among crumbling civilization',
        artStyle: 'Book of Eli post-apocalyptic journey'
      },
      {
        name: 'Post-Apocalyptic Dawn',
        colors: 'Nuclear orange, ash grey, toxic green, dark shadows',
        lighting: 'Contaminated atmosphere with eerie glow',
        mood: 'Survival after catastrophe',
        composition: 'Survivor watching destroyed world',
        artStyle: 'The Road bleak survival atmosphere'
      },
      {
        name: 'Survivor Mode',
        colors: 'Blood red, dirt brown, makeshift weapon grey, fire glow',
        lighting: 'Campfire in darkness with danger lurking',
        mood: 'Desperate survival with constant threat',
        composition: 'Armed survivor ready for attack',
        artStyle: 'The Last of Us survival horror action'
      },
      {
        name: 'Mad Max Style',
        colors: 'Chrome metal, desert orange, engine oil black, blood red',
        lighting: 'Desert sun with vehicle combat',
        mood: 'Vehicular warfare in wasteland',
        composition: 'War vehicles and road warriors',
        artStyle: 'Mad Max vehicular combat mayhem'
      },
      
      // === MARTIAL ARTS ===
      {
        name: 'Kung Fu Master',
        colors: 'Martial arts temple gold, blood red, bamboo green, silk white',
        lighting: 'Dramatic martial arts demonstration lighting',
        mood: 'Disciplined martial arts with ancient tradition',
        composition: 'Martial artist in powerful fighting stance',
        artStyle: 'Crouching Tiger Hidden Dragon wire-fu elegance'
      },
      {
        name: 'Samurai Warrior',
        colors: 'Katana steel, blood red, samurai armor, cherry blossom pink',
        lighting: 'Dawn duel lighting with blade gleam',
        mood: 'Honor-bound warrior with deadly precision',
        composition: 'Samurai with drawn katana in battle stance',
        artStyle: '13 Assassins samurai combat choreography'
      },
      {
        name: 'Street Brawl',
        colors: 'Bruise purple, split lip red, concrete grey, sweat shine',
        lighting: 'Underground fight club lighting',
        mood: 'Raw brutal hand-to-hand combat',
        composition: 'Fighters mid-punch in visceral combat',
        artStyle: 'Fight Club brutal underground aesthetic'
      },
      {
        name: 'Martial Arts Dojo',
        colors: 'Training mat red, gi white, focus black, discipline gold',
        lighting: 'Dojo interior with focused training light',
        mood: 'Martial arts mastery and training intensity',
        composition: 'Master and student in combat training',
        artStyle: 'Ip Man traditional martial arts style'
      },
      {
        name: 'Dragon Fist',
        colors: 'Dragon red, kung fu gold, mystical glow, martial black',
        lighting: 'Mystical martial arts energy glow',
        mood: 'Legendary martial arts with supernatural power',
        composition: 'Fighter channeling chi with energy effects',
        artStyle: 'Enter the Dragon legendary martial arts'
      },
      
      // === SPY/THRILLER ===
      {
        name: 'Agent Mode',
        colors: 'Tuxedo black, martini glass, silencer grey, danger red',
        lighting: 'Sophisticated spy lighting with shadows',
        mood: 'Elegant spy thriller with deadly style',
        composition: 'Suited agent with weapon in formal setting',
        artStyle: 'James Bond sophisticated spy aesthetic'
      },
      {
        name: 'Surveillance Op',
        colors: 'Monitor blue glow, camera feed green, target red, shadow black',
        lighting: 'Multiple surveillance screen glow',
        mood: 'High-tech espionage with digital warfare',
        composition: 'Agent monitoring targets through technology',
        artStyle: 'Enemy of the State surveillance thriller'
      },
      {
        name: 'Undercover Mission',
        colors: 'Blended civilian, hidden weapon, tension grey, alert yellow',
        lighting: 'Natural lighting hiding deadly intent',
        mood: 'Covert infiltration with constant danger',
        composition: 'Agent blending in while armed and dangerous',
        artStyle: 'The Departed undercover tension'
      },
      {
        name: 'Espionage Style',
        colors: 'Spy black, secret document, betrayal red, mystery blue',
        lighting: 'Film noir spy shadows with intrigue',
        mood: 'International espionage with high stakes',
        composition: 'Spy with classified intel in shadowy meet',
        artStyle: 'Tinker Tailor Soldier Spy cold war espionage'
      },
      {
        name: 'Covert Operation',
        colors: 'Stealth black, silent weapon grey, infiltration blue, escape red',
        lighting: 'Minimal light for covert insertion',
        mood: 'Stealth mission with extreme precision',
        composition: 'Operative infiltrating secure location',
        artStyle: 'Mission: Impossible impossible mission style'
      },
      
      // === DISASTER ===
      {
        name: 'Tsunami Wave',
        colors: 'Ocean blue, foam white, destruction grey, panic',
        lighting: 'Wall of water with catastrophic scale',
        mood: 'Natural disaster with survival imperative',
        composition: 'Hero escaping massive tidal wave',
        artStyle: 'The Impossible disaster survival realism'
      },
      {
        name: 'Earthquake Strike',
        colors: 'Crumbling concrete, dust cloud, structural steel, emergency red',
        lighting: 'Collapsing buildings with dust and chaos',
        mood: 'Seismic catastrophe with urban collapse',
        composition: 'Hero navigating collapsing city',
        artStyle: 'San Andreas earthquake destruction scale'
      },
      {
        name: 'Meteor Impact',
        colors: 'Space rock grey, atmospheric entry orange, impact crater, sky fire',
        lighting: 'Meteor strike with apocalyptic illumination',
        mood: 'Extinction-level event with cosmic scale',
        composition: 'Meteor descending with hero trying to prevent impact',
        artStyle: 'Armageddon space disaster epic'
      },
      {
        name: 'Volcanic Eruption',
        colors: 'Lava orange, volcanic ash grey, pyroclastic red, magma yellow',
        lighting: 'Volcanic eruption glow with lava rivers',
        mood: 'Volcanic catastrophe with primal destruction',
        composition: 'Hero escaping erupting volcano',
        artStyle: 'Dante\'s Peak volcanic disaster intensity'
      },
      {
        name: 'Hurricane Force',
        colors: 'Storm grey, wind-swept, lightning white, rain dark',
        lighting: 'Hurricane storm with lightning flashes',
        mood: 'Extreme weather survival',
        composition: 'Hero battling extreme wind and rain',
        artStyle: 'Into the Storm extreme weather action'
      },
      
      // === OTHER ACTION ===
      {
        name: 'Tank Battalion',
        colors: 'Armored steel, tank treads, cannon fire, battlefield smoke',
        lighting: 'Tank warfare with explosive combat',
        mood: 'Armored warfare with mechanized destruction',
        composition: 'Tank column advancing with explosions',
        artStyle: 'Fury tank warfare gritty realism'
      },
      {
        name: 'Helicopter Assault',
        colors: 'Rotor blur, door gunner, air cavalry, jungle green',
        lighting: 'Aerial combat with rotor wash and tracers',
        mood: 'Air cavalry assault with intense firepower',
        composition: 'Attack helicopters in combat formation',
        artStyle: 'Apocalypse Now helicopter attack sequence'
      },
      {
        name: 'Sniper Position',
        colors: 'Scope crosshair, rifle barrel, ghillie suit camouflage, distance',
        lighting: 'Sniper hide with precise targeting lighting',
        mood: 'Precision marksmanship with patience',
        composition: 'Sniper in position with target in sight',
        artStyle: 'American Sniper precision marksmanship'
      },
      {
        name: 'Hostage Rescue',
        colors: 'Breach charge, hostage orange, terrorist black, rescue team',
        lighting: 'Dynamic entry with flashbangs',
        mood: 'High-stakes rescue with time pressure',
        composition: 'Tactical team breaching to save hostages',
        artStyle: 'Captain Phillips hostage situation tension'
      },
      {
        name: 'Prison Break',
        colors: 'Prison grey, freedom desperation, guard tower, escape route',
        lighting: 'Prison searchlights with shadows for hiding',
        mood: 'Desperate escape with impossible odds',
        composition: 'Prisoner escaping through dangerous route',
        artStyle: 'Escape Plan prison break action'
      },
      {
        name: 'Bullet Time',
        colors: 'Slow motion bullet trail, frozen action, metallic sheen',
        lighting: 'Frozen moment with bullet trajectory visible',
        mood: 'Time-stopped action with precise choreography',
        composition: 'Hero in bullet-dodging slow motion pose',
        artStyle: 'The Matrix revolutionary bullet-time effect'
      }
    ];
    
    // Randomly select an action style for variation
    const selectedStyle = actionStyles[Math.floor(Math.random() * actionStyles.length)];
    console.log('Selected action style:', selectedStyle.name);
    
    // Build an intense, explosive action movie poster prompt
    const genreContext = genre ? `Original genre: ${genre.replace(/romance|comedy/gi, 'action')} - reimagined as an explosive action thriller.` : '';
    const summaryContext = originalSummary ? `Original story essence: ${originalSummary.substring(0, 300)}` : '';
    const originalContext = originalTitle ? `This is an action-packed reimagining of the movie "${originalTitle}".` : '';
    
    // Create a prompt that transforms the original movie concept into an action version
    const prompt = `Create a hyper-explosive action movie poster for "${titleForPrompt}" in ${selectedStyle.name} style.

${originalContext}
${genreContext}
${summaryContext}

TRANSFORMATION CONCEPT:
- Imagine taking the original rom-com "${originalTitle || titleForPrompt}" and turning it into an over-the-top action blockbuster
- Keep iconic visual elements from the original film but add explosions, combat, and danger
- If it was romance: dates become missions, kissing scenes become combat, love letters become battle plans
- If it was comedy: jokes become one-liners during gunfights, funny moments become explosive stunts
- If it was drama: emotional scenes become intense action sequences, conflicts become literal battles
- Transform every element into maximum adrenaline and danger

STYLE REQUIREMENTS (${selectedStyle.name}):
- Professional Hollywood action blockbuster poster aesthetic
- ${selectedStyle.composition}
- Characters should evoke the spirit of the original film but in intense action context
- ${selectedStyle.lighting}
- Color palette: ${selectedStyle.colors}
- Mood: ${selectedStyle.mood}
${selectedStyle.artStyle ? `- Art style: ${selectedStyle.artStyle}` : ''}
- High quality, 8K detail, photorealistic style
- Include the movie title "${titleForPrompt}" prominently displayed in bold, aggressive typography
- Title should be in a military-style or impact font with metallic or explosive effect
- Intense, dramatic, and explosive composition
- Make it unmistakably an ACTION version with explosions and combat`;

    console.log('Full prompt:', prompt);
    
    let response;
    
    console.log('Calling OpenAI images.generate...');
    
    if (imageModel === 'dall-e-2') {
      response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      });
    } else if (imageModel === 'dall-e-3') {
      response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd'
      });
    } else {
      // For gpt-image models (gpt-image-1, gpt-image-1-mini, gpt-image-1.5)
      response = await openai.images.generate({
        model: imageModel,
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      });
    }
    
    console.log('Response.data:', response?.data);
    console.log('Response.data type:', typeof response?.data);
    
    const imageData = response?.data?.[0];
    if (!imageData) {
      console.error('No image data in response. Full response:', JSON.stringify(response, null, 2));
      throw new Error('Failed to get image data from API response');
    }
    
    // Check for URL format (hosted image)
    if (imageData.url) {
      console.log('Successfully generated poster URL:', imageData.url);
      console.log('=== POSTER GENERATION SUCCESS ===');
      return {
        url: imageData.url,
        style: selectedStyle.name,
        styleDetails: {
          colors: selectedStyle.colors,
          mood: selectedStyle.mood,
          composition: selectedStyle.composition
        }
      };
    }
    
    // Check for base64 format (inline image)
    if (imageData.b64_json) {
      console.log('Received base64 image, converting to data URL');
      const dataUrl = `data:image/png;base64,${imageData.b64_json}`;
      console.log('Data URL created (length:', dataUrl.length, 'chars)');
      console.log('=== POSTER GENERATION SUCCESS ===');
      return {
        url: dataUrl,
        style: selectedStyle.name,
        styleDetails: {
          colors: selectedStyle.colors,
          mood: selectedStyle.mood,
          composition: selectedStyle.composition
        }
      };
    }
    
    console.error('No URL or b64_json in response. Image data:', imageData);
    throw new Error('Failed to extract image from API response (no url or b64_json field)');
  } catch (error) {
    console.error('Error in generate-poster:', error);
    // If safety system rejected the request, try with progressively safer prompts
    if (error.message && error.message.includes('safety')) {
      console.log('Safety rejection detected, trying with safer prompt (attempt 1)...');
      
      // First retry: Use the sanitized prompt that removes brand names
      try {
        const openai = getOpenAIClient();
        const imageModel = store.get('imageModel', 'dall-e-3');
        
        const saferPrompt = createSaferImagePrompt(originalTitle, actionTitle, genre, originalSummary);
        console.log('Safer prompt (attempt 1):', saferPrompt);
        
        let retryResponse;
        if (imageModel === 'dall-e-3') {
          retryResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt: saferPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd'
          });
        } else {
          retryResponse = await openai.images.generate({
            model: imageModel,
            prompt: saferPrompt,
            n: 1,
            size: '1024x1024'
          });
        }
        
        const retryImageData = retryResponse?.data?.[0];
        if (!retryImageData) {
          throw new Error('Failed to get image data from retry attempt 1');
        }
        
        // Handle both URL and base64 formats
        if (retryImageData.url) {
          console.log('Retry attempt 1 successful, poster URL:', retryImageData.url);
          return retryImageData.url;
        }
        
        if (retryImageData.b64_json) {
          console.log('Retry attempt 1 successful, received base64 image');
          const dataUrl = `data:image/png;base64,${retryImageData.b64_json}`;
          return dataUrl;
        }
        
        throw new Error('Failed to extract image from retry attempt 1');
      } catch (retryError1) {
        console.error('Retry attempt 1 failed:', retryError1.message);
        
        // If still rejected by safety, try ultra-safe prompt
        if (retryError1.message && retryError1.message.includes('safety')) {
          console.log('Safety rejection on attempt 1, trying ultra-safe prompt (attempt 2)...');
          
          try {
            const openai = getOpenAIClient();
            const imageModel = store.get('imageModel', 'dall-e-3');
            
            const titleForUltraSafe = actionTitle && actionTitle.trim() ? actionTitle : originalTitle || 'Maximum Impact';
            const ultraSafePrompt = createUltraSafeImagePrompt(titleForUltraSafe);
            console.log('Ultra-safe prompt (attempt 2):', ultraSafePrompt);
            
            let retryResponse2;
            if (imageModel === 'dall-e-3') {
              retryResponse2 = await openai.images.generate({
                model: 'dall-e-3',
                prompt: ultraSafePrompt,
                n: 1,
                size: '1024x1024',
                quality: 'hd'
              });
            } else {
              retryResponse2 = await openai.images.generate({
                model: imageModel,
                prompt: ultraSafePrompt,
                n: 1,
                size: '1024x1024'
              });
            }
            
            const retryImageData2 = retryResponse2?.data?.[0];
            if (!retryImageData2) {
              throw new Error('Failed to get image data from retry attempt 2');
            }
            
            if (retryImageData2.url) {
              console.log('Retry attempt 2 successful, poster URL:', retryImageData2.url);
              return retryImageData2.url;
            }
            
            if (retryImageData2.b64_json) {
              console.log('Retry attempt 2 successful, received base64 image');
              const dataUrl = `data:image/png;base64,${retryImageData2.b64_json}`;
              return dataUrl;
            }
            
            throw new Error('Failed to extract image from retry attempt 2');
          } catch (retryError2) {
            console.error('Retry attempt 2 failed:', retryError2);
            throw new Error('Could not generate poster even with safe prompts. The content may not be suitable for image generation. Please try a different movie.');
          }
        }
        
        throw new Error('Could not generate poster. Please try a different movie or try again later.');
      }
    }
    throw new Error(error.message);
  }
});

// Hardcoded fallback Top 10 data
function getFallbackTop10Data() {
  const posterBase = 'https://image.tmdb.org/t/p/w500';
  
  return {
    movies: [
      { title: "Oppenheimer", year: 2023, genre: "Drama/Biography", poster: `${posterBase}/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg` },
      { title: "Dune: Part Two", year: 2024, genre: "Sci-Fi/Adventure", poster: `${posterBase}/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg` },
      { title: "The Fall Guy", year: 2024, genre: "Action/Comedy", poster: `${posterBase}/tSz1qsmSJon0rqjHBxXZmrotuse.jpg` },
      { title: "Poor Things", year: 2023, genre: "Comedy/Drama", poster: `${posterBase}/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg` },
      { title: "Godzilla x Kong", year: 2024, genre: "Action/Sci-Fi", poster: `${posterBase}/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg` },
      { title: "Civil War", year: 2024, genre: "Action/Drama", poster: `${posterBase}/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg` },
      { title: "Kung Fu Panda 4", year: 2024, genre: "Animation/Action", poster: `${posterBase}/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg` },
      { title: "Anyone But You", year: 2023, genre: "Comedy/Romance", poster: `${posterBase}/5qHoazZiaLe7oFBok7XlUhg96f2.jpg` },
      { title: "Ghostbusters: Frozen Empire", year: 2024, genre: "Comedy/Fantasy", poster: `${posterBase}/e1J2oNzSBdou01sUvriVeCgMtqt.jpg` },
      { title: "The Beekeeper", year: 2024, genre: "Action/Thriller", poster: `${posterBase}/A7EByudX0eOzlkQ2FIbogzyazm2.jpg` }
    ],
    series: [
      { title: "Squid Game", year: 2021, genre: "Thriller/Drama", poster: `${posterBase}/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg` },
      { title: "Wednesday", year: 2022, genre: "Comedy/Fantasy", poster: `${posterBase}/9PFonBhy4cQy7Jz20NpMygczOkv.jpg` },
      { title: "Stranger Things", year: 2016, genre: "Sci-Fi/Horror", poster: `${posterBase}/49WJfeN0moxb9IPfGn8AIqMGskD.jpg` },
      { title: "The Witcher", year: 2019, genre: "Fantasy/Action", poster: `${posterBase}/cZ0d3rtvXPVvuiX22sP79K3Hmjz.jpg` },
      { title: "Bridgerton", year: 2020, genre: "Drama/Romance", poster: `${posterBase}/luoKpgVwi1E5nQsi7W0UuKHu2Rq.jpg` },
      { title: "The Crown", year: 2016, genre: "Drama/History", poster: `${posterBase}/1M876KPjulVwppEpldhdc8V4o68.jpg` },
      { title: "Money Heist", year: 2017, genre: "Action/Crime", poster: `${posterBase}/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg` },
      { title: "Dark", year: 2017, genre: "Sci-Fi/Thriller", poster: `${posterBase}/5LoHuHWA4H8jElFlZDvsmU2n63b.jpg` },
      { title: "Ozark", year: 2017, genre: "Crime/Drama", poster: `${posterBase}/pCGyPVrI9Fzw6KENHlA0M0Kf6qG.jpg` },
      { title: "The Queen's Gambit", year: 2020, genre: "Drama", poster: `${posterBase}/zU0htwkhNvBQdVSIKB9s6MgHn6T.jpg` }
    ],
    action: [
      { title: "John Wick: Chapter 4", year: 2023, genre: "Action/Thriller", poster: `${posterBase}/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg` },
      { title: "Mission: Impossible - Dead Reckoning", year: 2023, genre: "Action/Adventure", poster: `${posterBase}/NNxYkU70HPurnNCSiCjYAmacwm.jpg` },
      { title: "The Equalizer 3", year: 2023, genre: "Action/Crime", poster: `${posterBase}/b0Ej6fnXAP8fK75hlyi2jKqdhHz.jpg` },
      { title: "Fast X", year: 2023, genre: "Action/Adventure", poster: `${posterBase}/fiVW06jE7z9YnO4trhaMEdclSiC.jpg` },
      { title: "Extraction 2", year: 2023, genre: "Action/Thriller", poster: `${posterBase}/7gKI9hpEMcZUQpNgKrkDzJpbnNS.jpg` },
      { title: "The Meg 2", year: 2023, genre: "Action/Sci-Fi", poster: `${posterBase}/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg` },
      { title: "Rebel Moon", year: 2023, genre: "Action/Sci-Fi", poster: `${posterBase}/ui4DrH1cKk2vkHshcUcGt2lKxCm.jpg` },
      { title: "Expendables 4", year: 2023, genre: "Action/Adventure", poster: `${posterBase}/iwsMu0ehRPbtaSxqiaUDQB9qMWT.jpg` },
      { title: "Blue Beetle", year: 2023, genre: "Action/Sci-Fi", poster: `${posterBase}/mXLOHHc1Zeuwsl4xYKjKh2280oL.jpg` },
      { title: "Gran Turismo", year: 2023, genre: "Action/Drama", poster: `${posterBase}/51tqzRtKMMZEYUpSYkrUE7v9ehm.jpg` }
    ],
    scifi: [
      { title: "Interstellar", year: 2014, genre: "Sci-Fi/Drama", poster: `${posterBase}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg` },
      { title: "The Matrix", year: 1999, genre: "Sci-Fi/Action", poster: `${posterBase}/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg` },
      { title: "Inception", year: 2010, genre: "Sci-Fi/Thriller", poster: `${posterBase}/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg` },
      { title: "Blade Runner 2049", year: 2017, genre: "Sci-Fi/Drama", poster: `${posterBase}/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg` },
      { title: "Ex Machina", year: 2014, genre: "Sci-Fi/Thriller", poster: `${posterBase}/btbRB7BrD887j5NrvjxceRDmaot.jpg` },
      { title: "Arrival", year: 2016, genre: "Sci-Fi/Drama", poster: `${posterBase}/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg` },
      { title: "The Martian", year: 2015, genre: "Sci-Fi/Adventure", poster: `${posterBase}/5BHuvQ6p9kfc091Z8RiFNhCwL4b.jpg` },
      { title: "Edge of Tomorrow", year: 2014, genre: "Sci-Fi/Action", poster: `${posterBase}/xjw5trHV7Mwo61P0aFTMU74KpWz.jpg` },
      { title: "Annihilation", year: 2018, genre: "Sci-Fi/Horror", poster: `${posterBase}/d3qcpfNwbAMCNqWDHzPQsUYiUgS.jpg` },
      { title: "Tenet", year: 2020, genre: "Sci-Fi/Action", poster: `${posterBase}/k68nPLbIST6NP96JmTxmZijEvCA.jpg` }
    ]
  };
}

// Fetch Top 10 from TMDB API (with fallback to hardcoded data)
ipcMain.handle('get-netflix-top10', async (event, category = 'movies') => {
  const tmdbApiKey = store.get('tmdbApiKey', '');
  const country = store.get('country', 'BE');
  
  // If no API key, return fallback data with flag
  if (!tmdbApiKey) {
    const fallbackData = getFallbackTop10Data();
    return {
      data: fallbackData[category] || fallbackData.movies,
      usingFallback: true
    };
  }
  
  try {
    const posterBase = 'https://image.tmdb.org/t/p/w500';
    let endpoint;
    
    // Map category to TMDB endpoint
    switch(category) {
      case 'movies':
        endpoint = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
        break;
      case 'series':
        endpoint = `https://api.themoviedb.org/3/tv/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
        break;
      case 'action':
        endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&region=${country}&with_genres=28&sort_by=popularity.desc&language=en-US&page=1`;
        break;
      case 'scifi':
        endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&region=${country}&with_genres=878&sort_by=popularity.desc&language=en-US&page=1`;
        break;
      default:
        endpoint = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
    }
    
    const response = await axios.get(endpoint);
    const results = response.data.results.slice(0, 10);
    
    // Format results and return with flag indicating live data
    return {
      data: results.map(item => {
        const isTV = category === 'series';
        return {
          title: isTV ? item.name : item.title,
          year: isTV ? 
            (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A') : 
            (item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'),
          genre: item.genre_ids ? getGenreNames(item.genre_ids, isTV) : 'N/A',
          poster: item.poster_path ? `${posterBase}${item.poster_path}` : ''
        };
      }),
      usingFallback: false
    };
  } catch (error) {
    console.error('Error fetching from TMDB:', error.message);
    // On error, return fallback data
    const fallbackData = getFallbackTop10Data();
    return {
      data: fallbackData[category] || fallbackData.movies,
      usingFallback: true,
      error: 'Could not connect to TMDB. Showing sample data.'
    };
  }
});

// Helper function to convert genre IDs to names
function getGenreNames(genreIds, isTV = false) {
  const movieGenres = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
  };
  
  const tvGenres = {
    10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids',
    9648: 'Mystery', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western'
  };
  
  const genres = isTV ? tvGenres : movieGenres;
  const names = genreIds.slice(0, 2).map(id => genres[id] || '').filter(Boolean);
  return names.join('/') || 'N/A';
}

// Get all Top 10 categories at once
ipcMain.handle('get-all-top10', async () => {
  const tmdbApiKey = store.get('tmdbApiKey', '');
  const country = store.get('country', 'BE');
  const categories = ['movies', 'series', 'action', 'scifi'];
  const results = {};
  
  // If no API key, return all fallback data
  if (!tmdbApiKey) {
    const fallbackData = getFallbackTop10Data();
    for (const category of categories) {
      results[category] = {
        data: fallbackData[category],
        usingFallback: true
      };
    }
    return results;
  }
  
  // Fetch data for each category
  for (const category of categories) {
    try {
      const posterBase = 'https://image.tmdb.org/t/p/w500';
      let endpoint;
      
      switch(category) {
        case 'movies':
          endpoint = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
          break;
        case 'series':
          endpoint = `https://api.themoviedb.org/3/tv/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
          break;
        case 'action':
          endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&region=${country}&with_genres=28&sort_by=popularity.desc&language=en-US&page=1`;
          break;
        case 'scifi':
          endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&region=${country}&with_genres=878&sort_by=popularity.desc&language=en-US&page=1`;
          break;
        default:
          endpoint = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
      }
      
      const response = await axios.get(endpoint);
      const items = response.data.results.slice(0, 10);
      
      // Format results
      results[category] = {
        data: items.map(item => {
          const isTV = category === 'series';
          return {
            title: isTV ? item.name : item.title,
            year: isTV ? 
              (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A') : 
              (item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'),
            genre: item.genre_ids ? getGenreNames(item.genre_ids, isTV) : 'N/A',
            poster: item.poster_path ? `${posterBase}${item.poster_path}` : ''
          };
        }),
        usingFallback: false
      };
    } catch (error) {
      console.error(`Error fetching ${category} from TMDB:`, error.message);
      // On error, return fallback data for this category
      const fallbackData = getFallbackTop10Data();
      results[category] = {
        data: fallbackData[category] || fallbackData.movies,
        usingFallback: true,
        error: 'Could not connect to TMDB. Showing sample data.'
      };
    }
  }
  
  return results;
});

// Open external links
ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});

// Get app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
