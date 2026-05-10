const { exec } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const si = require('systeminformation');
const http = require('http');
const panic = require('./panic');
const pipelines = require('./pipelines');

let servers = {};
let commandCache = [];

const SERVER_STATE_FILE = "server_state.json";
const SERVER_MEMORY_FILE = "server_memory.json";
const COMMAND_CACHE_JSON = "command_cache.json";
const COMMAND_CACHE_BIN = "command_cache.bin";

function cacheCommand(cmd, args, result) {
  try {
    if (!cmd || typeof cmd !== 'string') {
      throw new Error("Invalid command name");
    }
    
    const entry = { cmd, args, result, ts: Date.now() };
    commandCache.push(entry);

    fs.writeFileSync(COMMAND_CACHE_JSON, JSON.stringify(commandCache, null, 2));
    fs.writeFileSync(COMMAND_CACHE_BIN, Buffer.from(JSON.stringify(commandCache)));
  } catch (err) {
    console.error("Cache write failed:", err.message);
  }
}

function loadServerState() {
  try {
    if (fs.existsSync(SERVER_STATE_FILE)) {
      const data = fs.readFileSync(SERVER_STATE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        servers = parsed;
        console.log(`Loaded server state for ${Object.keys(servers).length} server(s)`);
      }
    }
  } catch (err) {
    console.error("Failed to load server state:", err.message);
    servers = {};
  }
}

function saveServerState() {
  try {
    const sanitized = {};
    for (const [key, value] of Object.entries(servers)) {
      if (typeof key === 'string' && value) {
        sanitized[key] = {
          id: value.id || key,
          port: value.port,
          protocol: value.protocol || 'http',
          status: value.status || 'unknown',
          createdAt: value.createdAt || Date.now(),
          lastActivity: value.lastActivity || Date.now(),
          metadata: value.metadata || {}
        };
      }
    }
    fs.writeFileSync(SERVER_STATE_FILE, JSON.stringify(sanitized, null, 2));
    fs.writeFileSync(SERVER_MEMORY_FILE, JSON.stringify({
      totalServers: Object.keys(servers).length,
      timestamp: Date.now(),
      servers: sanitized
    }, null, 2));
  } catch (err) {
    console.error("Failed to save server state:", err.message);
  }
}

function addServer(id, port, protocol = 'http', metadata = {}) {
  try {
    if (!id || typeof id !== 'string' || !port || isNaN(port)) {
      throw new Error("Invalid server id or port");
    }
    servers[id] = {
      id,
      port: parseInt(port),
      protocol,
      status: 'active',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      metadata
    };
    saveServerState();
    return servers[id];
  } catch (err) {
    console.error("Failed to add server:", err.message);
    return null;
  }
}

function removeServer(id) {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error("Invalid server id");
    }
    const existed = servers[id];
    delete servers[id];
    saveServerState();
    return existed ? true : false;
  } catch (err) {
    console.error("Failed to remove server:", err.message);
    return false;
  }
}

function getServerStatus(id) {
  try {
    if (!id) {
      return servers;
    }
    return servers[id] || null;
  } catch (err) {
    console.error("Failed to get server status:", err.message);
    return null;
  }
}

module.exports = {
  register() {
    loadServerState();
    
    this.commands = {
      // === Core Utility Commands ===
      help: () => {
        try {
          const result = Object.keys(this.commands).filter(c => c !== 'panic.start').join(", ");
          cacheCommand("help", [], result);
          pipelines.p1.send({type: 'command', cmd: 'help', result});
          return result;
        } catch (err) {
          console.error("Help command failed:", err.message);
          return {error: err.message};
        }
      },

      "sysveiw-info": () => {
        try {
          const result = {
            version: "1.1.2 (Pro-Legacy)",
            developer: "Harinarayanan TR",
            contact: "error40404.github@gmail.com",
            repo: "Harinarayanan-TR/sysveiw"
          };
          cacheCommand("sysveiw-info", [], result);
          pipelines.p1.send({type: 'command', cmd: 'sysveiw-info', result});
          return result;
        } catch (err) {
          console.error("Sysveiw-info command failed:", err.message);
          return {error: err.message};
        }
      },

      // === Native Command Routing ===
      "cmd": async (command) => {
        try {
          if (!command) {
            return {error: "Usage: cmd \"<command>\""};
          }
          command = command.replace(/^"|"$/g, '');
          return new Promise((resolve) => {
            exec(command, { shell: '/bin/bash' }, (err, stdout, stderr) => {
              let result = `Executed: ${command}\n`;
              if (err) {
                result += `Error: ${err.message}\n${stderr}`;
              } else {
                result += stdout;
              }
              resolve(result);
            });
          });
        } catch (err) {
          console.error("Cmd command failed:", err.message);
          return {error: err.message};
        }
      },

      "pwr": async (command) => {
        try {
          if (!command) {
            return {error: "Usage: pwr \"<command>\""};
          }
          command = command.replace(/^"|"$/g, '');
          return new Promise((resolve) => {
            exec(command, { shell: '/bin/bash' }, (err, stdout, stderr) => {
              let result = `Executed: ${command}\n`;
              if (err) {
                result += `Error: ${err.message}\n${stderr}`;
              } else {
                result += stdout;
              }
              resolve(result);
            });
          });
        } catch (err) {
          console.error("Pwr command failed:", err.message);
          return {error: err.message};
        }
      },

      "naitive": async (command) => {
        try {
          if (!command) {
            return {error: "Usage: naitive \"<command>\""};
          }
          command = command.replace(/^"|"$/g, '');
          return new Promise((resolve) => {
            exec(command, { shell: '/bin/bash' }, (err, stdout, stderr) => {
              let result = `Executed: ${command}\n`;
              if (err) {
                result += `Error: ${err.message}\n${stderr}`;
              } else {
                result += stdout;
              }
              resolve(result);
            });
          });
        } catch (err) {
          console.error("Naitive command failed:", err.message);
          return {error: err.message};
        }
      },

      // Ghost command
      "panic.start": () => {
        try {
          panic.demo();
          cacheCommand("panic.start", [], "Panic demo triggered");
          pipelines.p1.send({type: 'command', cmd: 'panic.start', result: "Panic demo triggered"});
          return "Panic demo triggered";
        } catch (err) {
          console.error("Panic command failed:", err.message);
          return {error: err.message};
        }
      },

      // === Server Commands ===
      "server.status": () => {
        try {
          const status = getServerStatus();
          cacheCommand("server.status", [], status);
          pipelines.p2.send({type: 'command', cmd: 'server.status', result: status});
          return status;
        } catch (err) {
          console.error("Server status command failed:", err.message);
          return {error: err.message};
        }
      },

      "server.list": () => {
        try {
          const list = Object.values(getServerStatus()).map(s => ({
            id: s.id,
            port: s.port,
            status: s.status,
            protocol: s.protocol,
            createdAt: new Date(s.createdAt).toISOString(),
            lastActivity: new Date(s.lastActivity).toISOString()
          }));
          cacheCommand("server.list", [], list);
          pipelines.p2.send({type: 'command', cmd: 'server.list', result: list});
          return list;
        } catch (err) {
          console.error("Server list command failed:", err.message);
          return {error: err.message};
        }
      },

      "server.add": (id, port, protocol = 'http') => {
        try {
          if (!id || !port) {
            return {error: "Usage: server.add <id> <port> [protocol]"};
          }
          const result = addServer(id, port, protocol);
          if (result) {
            cacheCommand("server.add", [id, port, protocol], result);
            pipelines.p2.send({type: 'command', cmd: 'server.add', result});
            return result;
          } else {
            return {error: "Failed to add server"};
          }
        } catch (err) {
          console.error("Server add command failed:", err.message);
          return {error: err.message};
        }
      },

      "server.remove": (id) => {
        try {
          if (!id) {
            return {error: "Usage: server.remove <id>"};
          }
          const success = removeServer(id);
          const result = success ? `Server ${id} removed` : `Server ${id} not found`;
          cacheCommand("server.remove", [id], result);
          pipelines.p2.send({type: 'command', cmd: 'server.remove', result});
          return result;
        } catch (err) {
          console.error("Server remove command failed:", err.message);
          return {error: err.message};
        }
      },

      // === Developer Commands ===
      "dev.init": async (projectName, ...args) => {
        try {
          if (!projectName) {
            return {error: "Usage: dev.init <projectName> [--template=node|python] [--git]"};
          }
          const templateArg = args.find(a => a.startsWith("--template="));
          const gitArg = args.includes("--git");
          const template = templateArg ? templateArg.split("=")[1] : "node";

          fs.ensureDirSync(projectName);
          fs.writeFileSync(`${projectName}/README.md`, `# ${projectName}\nGenerated by Sysveiw dev.init`);
          if (template === "node") {
            fs.writeFileSync(`${projectName}/index.js`, `console.log("Hello from ${projectName}");`);
            fs.writeFileSync(`${projectName}/package.json`, JSON.stringify({ name: projectName, version: "1.0.0" }, null, 2));
          } else if (template === "python") {
            fs.writeFileSync(`${projectName}/main.py`, `print("Hello from ${projectName}")`);
          } else {
            return {error: "Unknown template: " + template};
          }
          if (gitArg) {
            exec(`cd ${projectName} && git init`, (err) => {
              if (err) console.error("Git init failed:", err.message);
            });
          }
          const result = `Project ${projectName} initialized with template ${template}.`;
          cacheCommand("dev.init", [projectName, ...args], result);
          pipelines.p2.send({type: 'command', cmd: 'dev.init', result});
          return result;
        } catch (err) {
          console.error("Dev init command failed:", err.message);
          return {error: err.message};
        }
      },

      "dev.install": async (...deps) => {
        try {
          if (!deps || deps.length === 0) {
            return {error: "Usage: dev.install <dependency> [dependency2] ..."};
          }
          const cwd = process.cwd();
          return new Promise((resolve) => {
            if (fs.existsSync(`${cwd}/package.json`)) {
              exec(`npm install ${deps.join(" ")}`, (err, out) => {
                const result = (err ? `Error: ${err.message}` : out) || "Installation completed";
                cacheCommand("dev.install", deps, result);
                pipelines.p2.send({type: 'command', cmd: 'dev.install', result});
                resolve(result);
              });
            } else if (fs.existsSync(`${cwd}/requirements.txt`)) {
              exec(`pip install ${deps.join(" ")}`, (err, out) => {
                const result = (err ? `Error: ${err.message}` : out) || "Installation completed";
                cacheCommand("dev.install", deps, result);
                pipelines.p2.send({type: 'command', cmd: 'dev.install', result});
                resolve(result);
              });
            } else {
              const result = "Unknown project type.";
              cacheCommand("dev.install", deps, result);
              pipelines.p2.send({type: 'command', cmd: 'dev.install', result});
              resolve(result);
            }
          });
        } catch (err) {
          console.error("Dev install command failed:", err.message);
          return {error: err.message};
        }
      },

      "dev.run": async (...args) => {
        try {
          const cwd = process.cwd();
          return new Promise((resolve) => {
            if (fs.existsSync(`${cwd}/index.js`)) {
              exec(`node index.js`, (err, out) => {
                const result = (err ? `Error: ${err.message}` : out) || "Execution completed";
                cacheCommand("dev.run", args, result);
                pipelines.p2.send({type: 'command', cmd: 'dev.run', result});
                resolve(result);
              });
            } else if (fs.existsSync(`${cwd}/main.py`)) {
              exec(`python main.py`, (err, out) => {
                const result = (err ? `Error: ${err.message}` : out) || "Execution completed";
                cacheCommand("dev.run", args, result);
                pipelines.p2.send({type: 'command', cmd: 'dev.run', result});
                resolve(result);
              });
            } else {
              const result = "No entry point found.";
              cacheCommand("dev.run", args, result);
              pipelines.p2.send({type: 'command', cmd: 'dev.run', result});
              resolve(result);
            }
          });
        } catch (err) {
          console.error("Dev run command failed:", err.message);
          return {error: err.message};
        }
      },

      "dev.clean": async (...args) => {
        try {
          const cwd = process.cwd();
          const removed = [];
          
          if (fs.existsSync(`${cwd}/node_modules`)) {
            fs.removeSync(`${cwd}/node_modules`);
            removed.push("node_modules");
          }
          if (fs.existsSync(`${cwd}/dist`)) {
            fs.removeSync(`${cwd}/dist`);
            removed.push("dist");
          }
          if (fs.existsSync(`${cwd}/__pycache__`)) {
            fs.removeSync(`${cwd}/__pycache__`);
            removed.push("__pycache__");
          }
          if (args.includes("--deep")) {
            if (fs.existsSync(`${cwd}/logs`)) {
              fs.removeSync(`${cwd}/logs`);
              removed.push("logs");
            }
          }
          const result = `Project cleaned. Removed: ${removed.join(", ") || "nothing"}`;
          cacheCommand("dev.clean", args, result);
          pipelines.p2.send({type: 'command', cmd: 'dev.clean', result});
          return result;
        } catch (err) {
          console.error("Dev clean command failed:", err.message);
          return {error: err.message};
        }
      },

      "dev.test": async (...args) => {
        try {
          const cwd = process.cwd();
          return new Promise((resolve) => {
            if (fs.existsSync(`${cwd}/package.json`)) {
              exec(`npm test ${args.join(" ")}`, (err, out) => {
                const result = (err ? `Error: ${err.message}` : out) || "Tests completed";
                cacheCommand("dev.test", args, result);
                pipelines.p2.send({type: 'command', cmd: 'dev.test', result});
                resolve(result);
              });
            } else if (fs.existsSync(`${cwd}/pytest.ini`) || fs.existsSync(`${cwd}/tests`)) {
              exec(`pytest ${args.join(" ")}`, (err, out) => {
                const result = (err ? `Error: ${err.message}` : out) || "Tests completed";
                cacheCommand("dev.test", args, result);
                pipelines.p2.send({type: 'command', cmd: 'dev.test', result});
                resolve(result);
              });
            } else {
              const result = "No test framework detected.";
              cacheCommand("dev.test", args, result);
              pipelines.p2.send({type: 'command', cmd: 'dev.test', result});
              resolve(result);
            }
          });
        } catch (err) {
          console.error("Dev test command failed:", err.message);
          return {error: err.message};
        }
      },

      // === Custom Commands (System Info, Integrity, Health) ===
      "sys.cpu": async () => {
        try {
          const data = await si.cpu();
          cacheCommand("sys.cpu", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.cpu', result: data});
          return data;
        } catch (err) {
          console.error("CPU info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.ram": async () => {
        try {
          const data = await si.mem();
          cacheCommand("sys.ram", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.ram', result: data});
          return data;
        } catch (err) {
          console.error("RAM info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.ssd": async () => {
        try {
          const data = await si.diskLayout();
          cacheCommand("sys.ssd", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.ssd', result: data});
          return data;
        } catch (err) {
          console.error("SSD info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.gpu": async () => {
        try {
          const data = await si.graphics();
          cacheCommand("sys.gpu", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.gpu', result: data});
          return data;
        } catch (err) {
          console.error("GPU info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.os": async () => {
        try {
          const data = await si.osInfo();
          cacheCommand("sys.os", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.os', result: data});
          return data;
        } catch (err) {
          console.error("OS info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.processes": async () => {
        try {
          const data = await si.processes();
          cacheCommand("sys.processes", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.processes', result: data});
          return data;
        } catch (err) {
          console.error("Processes info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.users": async () => {
        try {
          const data = await si.users();
          cacheCommand("sys.users", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.users', result: data});
          return data;
        } catch (err) {
          console.error("Users info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.battery": async () => {
        try {
          const data = await si.battery();
          cacheCommand("sys.battery", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.battery', result: data});
          return data;
        } catch (err) {
          console.error("Battery info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.network": async () => {
        try {
          const data = await si.networkInterfaces();
          cacheCommand("sys.network", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.network', result: data});
          return data;
        } catch (err) {
          console.error("Network info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.bluetooth": async () => {
        try {
          const data = await si.bluetoothDevices();
          cacheCommand("sys.bluetooth", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.bluetooth', result: data});
          return data;
        } catch (err) {
          console.error("Bluetooth info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.fs": async () => {
        try {
          const data = await si.fsSize();
          cacheCommand("sys.fs", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.fs', result: data});
          return data;
        } catch (err) {
          console.error("Filesystem info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.fsHealth": async () => {
        try {
          const data = await si.blockDevices();
          cacheCommand("sys.fsHealth", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.fsHealth', result: data});
          return data;
        } catch (err) {
          console.error("Filesystem health check failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.load": async () => {
        try {
          const data = await si.currentLoad();
          cacheCommand("sys.load", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.load', result: data});
          return data;
        } catch (err) {
          console.error("Load info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.uptime": async () => {
        try {
          const data = os.uptime();
          cacheCommand("sys.uptime", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.uptime', result: data});
          return data;
        } catch (err) {
          console.error("Uptime info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.temp": async () => {
        try {
          const data = await si.cpuTemperature();
          cacheCommand("sys.temp", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.temp', result: data});
          return data;
        } catch (err) {
          console.error("Temperature info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.services": async () => {
        try {
          const data = await si.services('*');
          cacheCommand("sys.services", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.services', result: data});
          return data;
        } catch (err) {
          console.error("Services info failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.scan": async () => {
        try {
          const data = await si.getStaticData();
          cacheCommand("sys.scan", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.scan', result: data});
          return data;
        } catch (err) {
          console.error("System scan failed:", err.message);
          return {error: err.message};
        }
      },

      "sys.integrity": async () => {
        try {
          const data = await si.fsSize();
          cacheCommand("sys.integrity", [], data);
          pipelines.p2.send({type: 'command', cmd: 'sys.integrity', result: data});
          return data;
        } catch (err) {
          console.error("Disk integrity check failed:", err.message);
          return {error: err.message};
        }
      }
    };
  }
};