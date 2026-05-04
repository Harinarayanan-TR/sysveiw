const { autoUpdater } = require("electron-updater");

function forceUpdate() {
  autoUpdater.checkForUpdates();
}

module.exports = { forceUpdate };
