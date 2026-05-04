const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

const { initSequence } = require("./runtime/init");
const { handleInput } = require("./core/engine");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.loadFile("ui/index.html");
  return win;
}

app.whenReady().then(async () => {
  const window = createWindow();

  const init = await initSequence((msg) => {
    window.webContents.send("terminal:data", msg + "\n");
  });

  if (init.online) {
    autoUpdater.checkForUpdates();
  }
});

// OTA EVENTS
autoUpdater.on("update-available", () => {
  win.webContents.send("terminal:data", "Update found. Downloading...\n");
  autoUpdater.downloadUpdate();
});

autoUpdater.on("update-downloaded", () => {
  win.webContents.send("terminal:data", "Update ready. Restarting...\n");
  autoUpdater.quitAndInstall();
});

// COMMAND EXECUTION STREAM
ipcMain.handle("run-command", (event, input) => {
  return new Promise((resolve) => {
    const output = handleInput(input, (data) => {
      event.sender.send("terminal:data", data);
    });

    resolve(output);
  });
});
