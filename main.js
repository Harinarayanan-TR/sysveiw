const { app, BrowserWindow, ipcMain } = require("electron");
const os = require("os");
const { exec } = require("child_process");
const http = require("http");

let mainWindow;
let serverRunning = false;

// WINDOW
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(createWindow);

// ================= COMMAND SYSTEM =================

ipcMain.on("command", (event, cmd) => {
  cmd = cmd.trim();

  // HELP
  if (cmd === "help") {
    event.reply("output", `
AVAILABLE COMMANDS:

sysinfo         → System specs
processes       → List running processes
shutup,nerd X   → Kill process (example: chrome.exe)
start.geek      → Restart UI
server          → Start local OTA server
netinfo         → Show IP addresses
disk            → Disk info
clear           → Clear screen
update          → Check updates
exit            → Close app
    `);
  }

  // SYSINFO
  else if (cmd === "sysinfo") {
    const info = `
OS: ${os.type()} ${os.release()}
CPU: ${os.cpus()[0].model}
RAM: ${(os.totalmem() / 1e9).toFixed(2)} GB
FREE RAM: ${(os.freemem() / 1e9).toFixed(2)} GB
UPTIME: ${(os.uptime() / 60).toFixed(2)} mins
ARCH: ${os.arch()}
    `;
    event.reply("output", info);
  }

  // PROCESS LIST
  else if (cmd === "processes") {
    exec("tasklist", (err, stdout) => {
      if (err) return event.reply("output", "Error getting processes");
      event.reply("output", stdout);
    });
  }

  // SAFE KILL
  else if (cmd.startsWith("shutup,nerd")) {
    const parts = cmd.split(" ");
    const proc = parts[1];

    if (!proc) {
      return event.reply("output", "Usage: shutup,nerd <process.exe>");
    }

    exec(`taskkill /IM ${proc} /F`, (err) => {
      if (err) return event.reply("output", "Failed or access denied");
      event.reply("output", `Killed: ${proc}`);
    });
  }

  // RESTART UI
  else if (cmd === "start.geek") {
    mainWindow.reload();
  }

  // LOCAL SERVER
  else if (cmd === "server") {
    if (serverRunning) {
      return event.reply("output", "Server already running.");
    }

    const server = http.createServer((req, res) => {
      res.writeHead(200);
      res.end("SysView OTA Server Running");
    });

    server.listen(3000, () => {
      serverRunning = true;
      event.reply("output", "Server running at http://localhost:3000");
    });
  }

  // NETWORK
  else if (cmd === "netinfo") {
    const nets = os.networkInterfaces();
    let out = "";

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === "IPv4") {
          out += `${name}: ${net.address}\n`;
        }
      }
    }

    event.reply("output", out);
  }

  // DISK
  else if (cmd === "disk") {
    exec("wmic logicaldisk get size,freespace,caption", (err, stdout) => {
      if (err) return event.reply("output", "Disk read error");
      event.reply("output", stdout);
    });
  }

  // CLEAR
  else if (cmd === "clear") {
    event.reply("clear");
  }

  // UPDATE (placeholder)
  else if (cmd === "update") {
    event.reply("output", "Checking for updates (OTA coming next)...");
  }

  // EXIT
  else if (cmd === "exit") {
    app.quit();
  }

  // UNKNOWN
  else {
    event.reply("output", "Unknown command. Type 'help'");
  }
});
