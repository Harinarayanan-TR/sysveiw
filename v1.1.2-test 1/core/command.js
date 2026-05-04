const os = require("os");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { forceUpdate } = require("../services/ota");

function streamExec(cmd, stream) {
  const p = exec(cmd);

  p.stdout.on("data", d => stream(d));
  p.stderr.on("data", d => stream(d));

  return "Running...\n";
}

const commands = {

  "sys.info": () => fs.readFileSync(
    path.join(__dirname, "../DOCUMENTATION/sysveiw.doc"),
    "utf-8"
  ) + "\n",

  "sys.usage": () => JSON.stringify({
    cpu: os.loadavg(),
    ram: ((os.totalmem() - os.freemem()) / 1e9).toFixed(2) + " GB"
  }, null, 2) + "\n",

  "sys.processes": (_, stream) => streamExec("tasklist", stream),

  "sys.kill": (pid) => {
    exec(`taskkill /PID ${pid} /F`);
    return "Killed\n";
  },

  "fs.list": (dir = ".", stream) => streamExec(`dir "${dir}"`, stream),

  "fs.read": (file) => fs.readFileSync(file, "utf-8") + "\n",

  "fs.write": (input) => {
    const [file, ...content] = input.split(" ");
    fs.writeFileSync(file, content.join(" "));
    return "Written\n";
  },

  "fs.delete": (file) => {
    fs.unlinkSync(file);
    return "Deleted\n";
  },

  "net.ping": (host, stream) => streamExec(`ping ${host}`, stream),

  "net.ip": (_, stream) => streamExec("ipconfig", stream),

  "app.version": () => "1.1.2\n",

  "app.update": () => {
    forceUpdate();
    return "Checking updates...\n";
  },

  "help": () => Object.keys(commands).join("\n") + "\n"
};

function runCommand(input, stream) {
  const [cmd, ...args] = input.split(" ");

  if (commands[cmd]) {
    return commands[cmd](args.join(" "), stream);
  }

  return "Command not found\n";
}

module.exports = { runCommand };
