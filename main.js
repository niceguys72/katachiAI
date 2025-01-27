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
expressApp.use(express.static('public'))

const SERVER_PORT = 3636;

expressApp.get('/main-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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
        const newWindow = createWindow();
        mainWindow.close();
        mainWindow = newWindow;
      }
      res.sendStatus(200);
    } catch (error) {
      console.log('Error saving API key:', error);
      res.sendStatus(500);
    }
  }
});

expressApp.listen(SERVER_PORT, () => {
  console.log(`Express server running on http://localhost:${SERVER_PORT}`);
});

let mainWindow;

function createWindow() {
  const window = new BrowserWindow({
    width: 480,
    height: 720,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  window.setTitle('katachiAI');
  window.setIcon(path.join(__dirname, 'logo.png'));

  // Load appropriate content based on file existence
  if (fs.existsSync(path.join(__dirname, 'welcome.txt'))) {
    window.loadFile(path.join(__dirname, 'welcome.html'));
  } else {
    // Load main page through Express server
    window.loadURL(`http://localhost:${SERVER_PORT}/main-page`);
  }

  window.webContents.once('did-finish-load', () => {
    window.setTitle('katachiAI');
  });

  return window;
}

electronReload(__dirname, {
  ignored: /node_modules|[\/\\]\./,
});

app.on('ready', () => {
  mainWindow = createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});