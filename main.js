const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const electronReload = require('electron-reload');
const express = require('express');
const expressApp = express();
expressApp.use(express.json());
const cors = require('cors');
expressApp.use(cors());
expressApp.use(express.urlencoded({ extended: true }));


const SERVER_PORT = 3636;

expressApp.post('/submit-api-key', (req, res) => {
  const apiKey = req.body.apiKey;
  if (apiKey) {
    try {
      fs.writeFileSync(path.join(__dirname, 'welcome.txt'), apiKey);
      fs.renameSync(
        path.join(__dirname, 'welcome.txt'),
        path.join(__dirname, 'index.txt')
      );
      console.log('API key saved successfully');
      if (mainWindow) {
        mainWindow.loadFile('index.html');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
    }
    
  }
});

expressApp.listen(SERVER_PORT, () => {
  console.log(`Express server running on http://localhost:${SERVER_PORT}`);
});


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
