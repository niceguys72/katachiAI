const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const electronReload = require('electron-reload');

let mainWindow;

function getStartPage() {
  const welcomeFilePath = path.join(__dirname, 'welcome.txt');
  const indexFilePath = path.join(__dirname, 'index.txt');

  if (fs.existsSync(welcomeFilePath)) {
    return 'welcome.html';
  } else if (fs.existsSync(indexFilePath)) {
    return 'index.html';
  }
}

function createWindow() {
  const startPage = getStartPage();

  mainWindow = new BrowserWindow({
    width: 480,
    height: 720,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.setTitle('katachiAI');
  mainWindow.setIcon(path.join(__dirname, 'logo.png'));
  mainWindow.loadFile(startPage);
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.setTitle('katachiAI');
  });
}

// Enable live-reloading for the Electron app
electronReload(__dirname, {
  ignored: /node_modules|[\/\\]\./, // Ignore node_modules and hidden files
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
