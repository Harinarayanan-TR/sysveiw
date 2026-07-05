const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const boot = require('./boot');
const commands = require('./commands');

let mainWindow;
global.mainWindow = null;
global.cloudStatus = { connected: false, checkedAt: 0 };
global.appVersion = '1.1.3';

function parseCommandString(cmd) {
  const tokens = [];
  const regex = /[^\s"']+|"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g;
  let match;
  while ((match = regex.exec(cmd))) {
    tokens.push(match[1] || match[2] || match[0]);
  }
  return tokens;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Sysveiw v1.1.3',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
    global.mainWindow = null;
  });

  global.mainWindow = mainWindow;
}

ipcMain.on('run-command', async (event, cmd) => {
  try {
    const [name, ...args] = parseCommandString(cmd);
    if (!name) {
      event.sender.send('command-result', { error: 'No command provided' });
      return;
    }

    if (commands.commands[name]) {
      const result = await commands.commands[name](...args);
      event.sender.send('command-result', result);
    } else {
      event.sender.send('command-result', { error: `Unknown command: ${name}` });
    }
  } catch (err) {
    event.sender.send('command-result', { error: err.message });
  }
});

app.on('ready', () => {
  app.setName('Sysveiw');
  boot.startBootSequence(createWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
