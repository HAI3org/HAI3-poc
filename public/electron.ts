import { app, BrowserWindow, Menu, ipcMain, shell } from 'electron';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

// More reliable isDev detection - check if build directory exists
const buildPath = path.join(__dirname, '../build/index.html');
const actualIsDev = !fs.existsSync(buildPath);

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
    center: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    icon: path.join(__dirname, 'icon.png') // Add your app icon here
  });

  // Load the app
  const startUrl = actualIsDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  console.log('Loading URL:', startUrl);
  console.log('actualIsDev:', actualIsDev);
  console.log('buildPath exists:', fs.existsSync(buildPath));
  console.log('NODE_ENV:', process.env.NODE_ENV);

  // Load the URL and handle success/failure
  mainWindow.loadURL(startUrl)
    .then(() => {
      console.log('Successfully loaded URL:', startUrl);
    })
    .catch((err: Error) => {
      console.error('Failed to load URL:', err);
      // Try loading a fallback
      if (actualIsDev) {
        setTimeout(() => {
          console.log('Retrying to load URL...');
          mainWindow?.loadURL(startUrl);
        }, 2000);
      }
    });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    console.log('Window is ready to show');
    mainWindow?.show();
    mainWindow?.focus();

    // Bring to front on macOS
    if (process.platform === 'darwin') {
      app.dock.show();
    }

    // Open DevTools in development
    if (actualIsDev) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // Add additional debugging
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM is ready');
  });

  // Handle load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode: number, errorDescription: string, validatedURL: string) => {
    console.error('Failed to load page:', errorCode, errorDescription, validatedURL);
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          actualIsDev
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws://localhost:* wss://localhost:*; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' ws://localhost:* wss://localhost:* http://localhost:*;"
            : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; object-src 'none';"
        ]
      }
    });
  });

  // Create application menu
  createMenu();
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Chat',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('new-chat');
          }
        },
        { type: 'separator' },
        {
          label: 'Close Window',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: 'About ' + app.getName(), role: 'about' },
        { type: 'separator' },
        { label: 'Services', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: 'Hide ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideOthers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    });

    // Window menu
    template[4].submenu = [
      { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
      { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
      { label: 'Zoom', role: 'zoom' },
      { type: 'separator' },
      { label: 'Bring All to Front', role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
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

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

// IPC handlers
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('platform', () => {
  return process.platform;
});

// Get application path for resource access
ipcMain.handle('get-app-path', () => {
  return {
    app: app.getAppPath(),
    userData: app.getPath('userData'),
    public: path.join(__dirname, '../public'),
    current: __dirname
  };
});

// Reveal a file in the OS file manager (Finder on macOS)
ipcMain.handle('reveal-in-folder', (event, filePath: string) => {
  try {
    if (!filePath || typeof filePath !== 'string') return false;
    shell.showItemInFolder(filePath);
    return true;
  } catch (e) {
    console.error('reveal-in-folder failed', e);
    return false;
  }
});

// Open a file or application by path (may prompt OS)
ipcMain.handle('open-path', async (event, filePath: string) => {
  try {
    if (!filePath || typeof filePath !== 'string') return 'No path';
    const result = await shell.openPath(filePath);
    return result; // empty string on success
  } catch (e) {
    console.error('open-path failed', e);
    return (e as Error)?.message || 'error';
  }
});

// Basic system stats: total/free memory and load average
ipcMain.handle('system-stats', () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const load = os.loadavg?.() || [0, 0, 0];
  const cores = os.cpus?.().length || 1;
  return {
    totalMem,
    freeMem,
    load1: load[0] || 0,
    load5: load[1] || 0,
    load15: load[2] || 0,
    cores,
    platform: process.platform,
  };
});
