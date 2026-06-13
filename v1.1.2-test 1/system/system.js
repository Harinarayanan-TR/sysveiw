const os = require("os");
const { exec } = require("child_process");

function cpu() {
  return os.cpus()[0].model;
}

function ram() {
  return (os.totalmem() / 1e9).toFixed(2) + " GB";
}

function uptime() {
  return os.uptime();
}

function network() {
  return JSON.stringify(os.networkInterfaces(), null, 2);
}

function liveStats() {
  const cpus = os.cpus();

  let total = 0, idle = 0;

  cpus.forEach(core => {
    for (let t in core.times) total += core.times[t];
    idle += core.times.idle;
  });

  return {
    cpu: 100 - Math.floor((idle / total) * 100)
  };
}

function native(cmd) {
  return new Promise(res => {
    exec(cmd, { shell: "powershell.exe" },
      (err, out, stderr) => res(out || stderr || err));
  });
}

module.exports = {
  cpu,
  ram,
  uptime,
  network,
  liveStats,
  native
};
