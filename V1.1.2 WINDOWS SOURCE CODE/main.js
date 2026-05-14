const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const boot = require('./boot');
const commands = require('./commands');
const pipelines = require('./pipelines');

let mainWindow;
global.mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'),
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

// === IPC Command Hook ===
ipcMain.on("run-command", async (event, cmd) => {
  try {
    const [name, ...args] = cmd.split(" ");
    if (commands.commands[name]) {
      const result = await commands.commands[name](...args);
      event.sender.send("command-result", result);
    } else {
      event.sender.send("command-result", { error: `Unknown command: ${name}` });
    }
  } catch (err) {
    event.sender.send("command-result", { error: err.message });
  }
});

// === Boot Sequence ===
app.on('ready', () => {
  boot.startBootSequence(createWindow);
});

// === Lifecycle Management ===
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
