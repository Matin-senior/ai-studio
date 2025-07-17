//ai_studio - Copy/src-electron/electron.js
// ======================= IMPORTS =======================
const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater'); // ✅ ۱. ماژول آپدیت خودکار اضافه شد
const path = require('path');
const fs = require('fs');
const si = require('systeminformation');
const openDevtools = true;

// یک تابع ساده برای لاگ در فایل
const logToFile = (message) => {
  const logPath = path.join(app.getPath('userData'), 'log.txt');
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
};

// ======================= HELPERS =======================
// ... (تمام توابع کمکی شما بدون تغییر در اینجا قرار می‌گیرند)
// --- File Helpers ---
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};
// --- Chat Database Helpers ---
function getDbPath(userDataPath) {
  return path.join(userDataPath, 'chats-database.json');
}
function readDatabase(dbPath) {
  try {
    if (!fs.existsSync(dbPath)) {
      const initialData = { chats: {} };
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(dbPath);
    const parsedData = data.toString().trim() ? JSON.parse(data) : { chats: {} };
    if (!parsedData.chats) {
      parsedData.chats = {};
    }
    return parsedData;
  } catch (error) {
    console.error('Error reading database:', error);
    return { chats: {} };
  }
}
function writeDatabase(dbPath, data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
  }
}
// --- Settings Helpers ---
function getSettingsPath(userDataPath) {
  return path.join(userDataPath, 'settings.json');
}
function getDefaultSettings() {
  return {  general: {  language: 'en',  notifications: { desktop: true, sound: false, email: true },  autoSave: true,  startupBehavior: 'last-session'  },  'ai-models': {  temperature: 0.7,  maxTokens: 2048,  topP: 0.9,  frequencyPenalty: 0.0,  presencePenalty: 0.0,  responseFormat: 'markdown',  streamResponse: true,  contextWindow: 4096,  systemPrompt: 'You are a helpful AI assistant. Provide accurate, concise, and helpful responses to user queries. When writing code, use proper syntax highlighting and explain complex concepts clearly.',  fallbackModel: 'gpt-3.5-turbo',  retryAttempts: 3  },  interface: {  fontSize: 'medium',  fontFamily: 'inter',  lineHeight: 'normal',  chatDensity: 'comfortable',  sidebarWidth: 'medium',  showLineNumbers: true,  wordWrap: true,  minimap: false,  animations: true,  reducedMotion: false,  highContrast: false,  focusMode: false,  compactMode: false,  showTimestamps: true,  showAvatars: true,  messageGrouping: true  },  connections: {  apiKeys: {  openai: '',  anthropic: '',  google: '',  huggingface: ''  },  webhooks: {  enabled: false,  url: '',  secret: ''  },  proxy: {  enabled: false,  host: '',  port: '',  username: '',  password: ''  },  timeout: 30,  retryDelay: 1000,  maxConcurrentRequests: 5  },  advanced: {  debug: {  enabled: false,  logLevel: 'info',  showNetworkRequests: false,  showPerformanceMetrics: false  },  performance: {  enableCaching: true,  cacheSize: 100,  preloadModels: false,  optimizeMemory: true,  enableGPUAcceleration: false  },  experimental: {  betaFeatures: false,  advancedPrompting: false,  multiModalSupport: false,  voiceInteraction: false  },  security: {  enableTelemetry: true,  allowRemoteConnections: false,  requireAuthentication: false,  encryptLocalData: true  }  }
  };
}
function deepMerge(target, source) {
  for (const key in source) {
    if (
      source[key] && typeof source[key] === 'object' &&
      !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object'
    ) {
      target[key] = deepMerge({ ...target[key] }, source[key]);
    } else if (!(key in target)) {
      target[key] = source[key];
    }
  }
  return target;
}
function readSettings(settingsPath) {
  try {
    const defaultSettings = getDefaultSettings();
    let userSettings = {};
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      if (!data.trim()) {
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
        return defaultSettings;
      }
      userSettings = JSON.parse(data);
    }
    const merged = deepMerge({ ...userSettings }, defaultSettings);
    if (JSON.stringify(merged) !== JSON.stringify(userSettings)) {
      fs.writeFileSync(settingsPath, JSON.stringify(merged, null, 2));
    }
    return merged;
  } catch (error) {
    console.error('Error reading settings:', error);
    return getDefaultSettings();
  }
}
function writeSettings(settingsPath, settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error writing settings:', error);
  }
}


// ======================= MAIN WINDOW =======================
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0F172A',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.setMenu(null);

  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:5173');
    if (openDevtools) {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  } else {
    win.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  }

  // ... (تمام ipcMain handler های شما بدون تغییر در اینجا قرار می‌گیرند)
  // ----------- Window Events -----------
  ipcMain.on('minimize-app', () => win.minimize());
  ipcMain.on('maximize-app', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on('close-app', () => win.close());

  // ----------- System Info -----------
  ipcMain.handle('get-gpu-info', async () => {
    const data = await si.graphics();
    const controller = data.controllers?.[0];
    return {
      name: controller?.model || '---',
      memory: controller?.vram ? controller.vram + 'MB' : '---',
      compatibility: controller?.vendor || '---',
      status: controller ? 'Compatible' : 'Unknown'
    };
  });
  ipcMain.handle('get-ram-info', async () => {
    const data = await si.mem();
    return {
      total: (data.total / (1024 ** 3)).toFixed(1) + 'GB',
      used: (data.active / (1024 ** 3)).toFixed(1) + 'GB',
      available: (data.available / (1024 ** 3)).toFixed(1) + 'GB',
      usedPercentage: Math.round((data.active / data.total) * 100)
    };
  });
  ipcMain.handle('get-storage-info', async () => {
    const data = await si.fsSize();
    const total = data.reduce((sum, d) => sum + d.size, 0);
    const used = data.reduce((sum, d) => sum + d.used, 0);
    return {
      total: (total / (1024 ** 3)).toFixed(1) + 'GB',
      used: (used / (1024 ** 3)).toFixed(1) + 'GB',
      available: ((total - used) / (1024 ** 3)).toFixed(1) + 'GB',
      usedPercentage: Math.round((used / total) * 100)
    };
  });

  // ----------- User Files -----------
  const userDataPath = app.getPath('userData');
  const userFilesPath = path.join(userDataPath, 'UserFiles');
  if (!fs.existsSync(userFilesPath)) {
    fs.mkdirSync(userFilesPath, { recursive: true });
  }
  ipcMain.handle('app:get-user-files-path', () => userFilesPath);
  ipcMain.handle('path:dirname', (event, aPath) => path.dirname(aPath));
  ipcMain.handle('files:get-all', async (event, directoryPath) => {
    try {
      const items = fs.readdirSync(directoryPath);
      return items.map(item => {
        const itemPath = path.join(directoryPath, item);
        const stats = fs.statSync(itemPath);
        return {
          name: item,
          path: itemPath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      });
    } catch (error) {
      console.error(`Error reading directory ${directoryPath}:`, error);
      return [];
    }
  });
  ipcMain.handle('files:read-as-base64', async (event, filePath) => {
    try {
      const data = fs.readFileSync(filePath, 'base64');
      const mimeType = getMimeType(filePath);
      return `data:${mimeType};base64,${data}`;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return null;
    }
  });
  ipcMain.handle('files:upload', async (event, { name, data, parentPath }) => {
    try {
      const filePath = path.join(parentPath, name);
      fs.writeFileSync(filePath, Buffer.from(data));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle('files:move', async (event, sourcePath, targetFolderPath) => {
    try {
      const destPath = path.join(targetFolderPath, path.basename(sourcePath));
      if (fs.existsSync(destPath)) {
        return { success: false, error: 'A file or folder with the same name already exists in the target folder.' };
      }
      fs.renameSync(sourcePath, destPath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle('files:create-folder', async (event, { folderName, parentPath }) => {
    try {
      const folderPath = path.join(parentPath, folderName);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        return { success: true };
      } else {
        return { success: false, error: 'Folder already exists.' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ----------- Chat Data Management -----------
  const dbPath = getDbPath(userDataPath);
  
  ipcMain.handle('chats:get-all', () => {
    const db = readDatabase(dbPath);
    return Object.values(db.chats || {});
  });

  ipcMain.handle('messages:get-by-chat-id', (event, chatId) => {
    const db = readDatabase(dbPath);
    return db.chats?.[chatId]?.messages || [];
  });

  ipcMain.handle('chats:create', (event, data) => {
    console.log('--- [IPC] Received "chats:create" ---');
    console.log('Raw data object received:', data);

    let chatTitle = 'Untitled Chat';
    if (typeof data.title === 'string') {
        chatTitle = data.title;
    } else if (typeof data.title === 'object' && data.title !== null && typeof data.title.title === 'string') {
        chatTitle = data.title.title;
    } else {
        console.error('Could not extract a valid title string from received data:', data);
    }
    
    console.log('Final extracted title:', chatTitle);

    const db = readDatabase(dbPath);
    const newChatId = `chat-${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: chatTitle,
      messages: [],
      lastMessage: "No messages yet.",
      timestamp: new Date().toISOString(),
      messageCount: 0,
    };
    if (!db.chats) db.chats = {};
    db.chats[newChatId] = newChat;
    writeDatabase(dbPath, db);
    
    console.log('Successfully created and saved new chat:', newChat.id);
    return newChat;
  });
  
  ipcMain.handle('messages:add', (event, { chatId, content, attachments, code, assistantResponseContent, modelId }) => {
    const db = readDatabase(dbPath);
    if (!db.chats || !db.chats[chatId]) {
      return { success: false, error: 'Chat not found or database not initialized correctly.' };
    }

    const userMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      content: String(content),
      timestamp: new Date().toISOString(),
      attachments: attachments || [],
      code: code || ''
    };
    db.chats[chatId].messages.push(userMessage);

    let assistantContent = assistantResponseContent;

    if (assistantContent === undefined || assistantContent === null) {
        if (modelId && !modelId.startsWith('ollama-')) {
            // Placeholder for Cloud LLM integration
            assistantContent = `Processing your request for "${String(content).substring(0, 30)}..." via Electron with model: ${modelId}... (Cloud API not yet implemented)`;
        } else {
            assistantContent = `[No assistant response provided and no cloud model specified or handled.]`;
            console.warn('Frontend did not provide assistantResponseContent and no cloud model was specified. Using placeholder.');
        }
    }

    const assistantResponse = {
      id: `msg-${Date.now()}-assistant`,
      type: 'assistant',
      content: String(assistantContent),
      timestamp: new Date().toISOString(),
      attachments: []
    };
    db.chats[chatId].messages.push(assistantResponse);

    db.chats[chatId].lastMessage = String(content);
    db.chats[chatId].messageCount = db.chats[chatId].messages.length;
    db.chats[chatId].timestamp = new Date().toISOString();
    
    writeDatabase(dbPath, db);
    return { success: true, userMessage, assistantResponse };
  });

  ipcMain.handle('chats:delete', (event, chatId) => {
    const db = readDatabase(dbPath);
    if (db.chats?.[chatId]) {
      delete db.chats[chatId];
      writeDatabase(dbPath, db);
      return { success: true };
    }
    return { success: false, error: 'Chat not found' };
  });

  ipcMain.handle('chats:rename', (event, { chatId, newTitle }) => {
    const db = readDatabase(dbPath);
    if (db.chats?.[chatId]) {
      db.chats[chatId].title = String(newTitle);
      db.chats[chatId].timestamp = new Date().toISOString();
      writeDatabase(dbPath, db);
      return { success: true, updatedChat: db.chats[chatId] };
    }
    return { success: false, error: 'Chat not found' };
  });

  // ----------- App Settings -----------
  const settingsPath = getSettingsPath(userDataPath);
  ipcMain.handle('settings:get', () => {
    return readSettings(settingsPath);
  });
  ipcMain.handle('settings:set', (event, newSettings) => {
    const currentSettings = readSettings(settingsPath);
    let mergedSettings = { ...currentSettings };
    for (const key of Object.keys(newSettings)) {
      if (key in currentSettings) {
        if (
          typeof currentSettings[key] === 'object' &&
          typeof newSettings[key] === 'object' &&
          !Array.isArray(currentSettings[key])
        ) {
          mergedSettings[key] = deepMerge({ ...currentSettings[key] }, newSettings[key]);
        } else {
          mergedSettings[key] = newSettings[key];
        }
      }
    }
    writeSettings(settingsPath, mergedSettings);
    return { success: true };
  });

  // ✅ New IPC handler to fetch online Ollama models
  ipcMain.handle('models:fetch-online-ollama', async () => {
    try {
      // ✅ Corrected URL: Removed Markdown formatting
      const response = await fetch('https://ollama.com/api/tags');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { success: true, data: data.models };
    } catch (error) {
      console.error('Error fetching online Ollama models in main process:', error);
      return { success: false, error: error.message };
    }
  });


  // ✅ ۲. کد مربوط به آپدیت خودکار در اینجا اضافه می‌شود
  autoUpdater.checkForUpdatesAndNotify();
}

// ======================= APP LIFECYCLE =======================
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});