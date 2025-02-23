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
expressApp.engine('html', require('ejs').renderFile);

const SERVER_PORT = 3636;

let newWindow = null;

expressApp.post('/new', (req, res) => {
  if (newWindow && !newWindow.isDestroyed()) {
    newWindow.focus();
    return
  }

  newWindow = new BrowserWindow({
    width: 480,
    height: 720,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });
  newWindow.loadFile(path.join(__dirname, 'new.html'));
  newWindow.setTitle('Create a deck!');

  newWindow.on('closed', () => {
    newWindow = null;
  });
});

expressApp.get('/main-page', (req, res) => {
  const folderPath = path.join(__dirname, 'decks');
  let folderLength = 0;

  try {
    const files = fs.readdirSync(folderPath);
    folderLength = files.length;
  } catch (error) {
    console.error('Error reading the folder:', error);
  }
  
  res.render(path.join(__dirname, 'index.html'), { folderLength });
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