const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  run: (cmd) => ipcRenderer.invoke("run-command", cmd),
  onData: (cb) => ipcRenderer.on("terminal:data", (_, data) => cb(data))
});
