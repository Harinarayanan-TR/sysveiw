module.exports = {
  trigger(logs) {
    console.log("=== PANIC SCREEN TRIGGERED ===");
    if (global.mainWindow && !global.mainWindow.isDestroyed()) {
      global.mainWindow.webContents.send("panic-trigger", logs);
    }
  },

  demo() {
    console.log("=== PANIC DEMO STARTED ===");
    if (global.mainWindow && !global.mainWindow.isDestroyed()) {
      global.mainWindow.webContents.send("panic-demo", { msg: "Demo panic screen active" });
    }
  }
};
