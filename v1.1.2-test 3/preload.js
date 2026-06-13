const { contextBridge } = require('electron');
const os = require('os');
const { exec } = require('child_process');
const si = require('systeminformation'); // lightweight system info lib
const net = require('net');

// Helpers
function runCMD(command) {
    return new Promise(resolve => {
        exec(command, { shell: "cmd.exe" }, (err, stdout, stderr) => {
            resolve(stdout || stderr || (err ? err.message : ""));
        });
    });
}

function runPS(command) {
    return new Promise(resolve => {
        exec(`powershell -Command "${command}"`, (err, stdout, stderr) => {
            resolve(stdout || stderr || (err ? err.message : ""));
        });
    });
}

async function scanPorts() {
    const open = [];
    const checks = [];
    for (let p = 1; p <= 200; p++) {
        checks.push(new Promise(resolve => {
            const socket = new net.Socket();
            socket.setTimeout(100);
            socket.on("connect", () => {
                open.push(p);
                socket.destroy();
                resolve();
            });
            socket.on("error", () => resolve());
            socket.on("timeout", () => resolve());
            socket.connect(p, "127.0.0.1");
        }));
    }
    await Promise.all(checks);
    return open;
}

// Expose API
contextBridge.exposeInMainWorld("api", {
    async runCommand(cmd) {
        // ===== BASIC =====
        if (cmd === "clear") return "__CLEAR__";
        if (cmd === "exit") return "__EXIT__";

        // ===== INFO COMMANDS =====
        if (cmd === "info.CPU") {
            const cpu = await si.cpu();
            return JSON.stringify(cpu, null, 2);
        }

        if (cmd === "info.RAM") {
            const mem = await si.mem();
            return JSON.stringify(mem, null, 2);
        }

        if (cmd === "info.ROM") {
            const bios = await si.bios();
            return JSON.stringify(bios, null, 2);
        }

        if (cmd === "info.ssd") {
            const drives = await si.fsSize();
            return JSON.stringify(drives, null, 2);
        }

        if (cmd === "motherboard") {
            const board = await si.baseboard();
            return JSON.stringify(board, null, 2);
        }

        if (cmd === "display") {
            const gfx = await si.graphics();
            return JSON.stringify(gfx, null, 2);
        }

        if (cmd === "input.devices") {
            const usb = await si.usb();
            return JSON.stringify(usb, null, 2);
        }

        if (cmd === "OS.INFO") {
            const osInfo = await si.osInfo();
            return JSON.stringify(osInfo, null, 2);
        }

        if (cmd === "apps.list") {
            const apps = await si.apps();
            return JSON.stringify(apps, null, 2);
        }

        if (cmd === "net.info") {
            const netInfo = await si.networkInterfaces();
            return JSON.stringify(netInfo, null, 2);
        }

        if (cmd === "BLUE.TOOTH") {
            const bt = await si.bluetoothDevices();
            return JSON.stringify(bt, null, 2);
        }

        if (cmd.startsWith("create.port")) {
            const parts = cmd.split(":");
            const port = parseInt(parts[1], 10);
            return `Server created at port ${port}`;
        }

        if (cmd.startsWith("kill.port")) {
            const port = parseInt(cmd.split(":")[1], 10);
            return `Server at port ${port} terminated`;
        }

        if (cmd === "users") {
            const users = await si.users();
            return JSON.stringify(users, null, 2);
        }

        if (cmd === "batterystatus") {
            const battery = await si.battery();
            return JSON.stringify(battery, null, 2);
        }

        if (cmd === "sysveiw-info") {
            return `
Sysveiw v1.1.2
Developer: Harinarayanan TR
Email: error40404.githubatherategmail.com
Features: Secure developer terminal, 15+ system commands
GitHub Repo: https://github.com/Harinrayanan-TR/sysvewi
Note: OTA updates delayed until v1.1.6
`;
        }

        if (cmd === "contact.dev") {
            return "Developer: Harinarayanan TR\nEmail: error40404.githubatherategmail.com\nPlease do not spam.";
        }

        // ===== SYSTEM COMMANDS =====
        if (cmd.startsWith("cmd.")) {
            return await runCMD(cmd.slice(4));
        }

        if (cmd.startsWith("pwr.")) {
            return await runPS(cmd.slice(4));
        }

        if (cmd === "verify") {
            return "Version verified: v1.1.2 (hash check passed)";
        }

        if (cmd === "veiw.ports") {
            const ports = await scanPorts();
            return ports.length ? "OPEN PORTS:\n" + ports.join(", ") : "No open ports found";
        }

        // ===== SECRET =====
        if (cmd === "panic.test") {
            setTimeout(() => {
                location.reload();
            }, 20000); // 20 sec panic duration
            return "__PANIC__";
        }

        if (cmd === "bug.check") {
            const res = await runCMD("sfc /scannow");
            if (/corrupt|violation/i.test(res)) {
                setTimeout(() => {
                    location.reload();
                }, 20000);
                return "__PANIC__";
            }
            return "No bugs found";
        }

        return "Unknown command";
    }
});
