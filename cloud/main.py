import json
import os
import platform
import re
import shlex
import subprocess
import time

import psutil
import requests
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

API_KEY = os.getenv("SYSVEIW_API_KEY", "sv-c1-3a8f2d9e")
PORT = int(os.getenv("PORT", "3000"))

app = FastAPI(title="Sysveiw Cloud Backend", version="1.1.3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SANITIZE_RE = re.compile(r"[;&|<>$`]")


class CommandRequest(BaseModel):
    command: str = "help"
    args: list = []
    apiKey: Optional[str] = None


def validate_key(key: Optional[str]):
    if not key or key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: invalid API key")


def sanitize_input(text: str) -> str:
    return SANITIZE_RE.sub("", text)


def run_shell(cmd: str, timeout: int = 10) -> str:
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
        return (result.stdout or result.stderr or "").strip() or f"Executed: {cmd}"
    except subprocess.TimeoutExpired:
        return "Error: Command timed out"
    except Exception as e:
        return f"Error: {e}"


def run_shell_json(cmd: str, timeout: int = 10):
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
        if result.returncode != 0:
            return []
        return json.loads(result.stdout)
    except Exception:
        return []


def action_display(data):
    return {"action": "display", "data": data}


def action_exec(command: str):
    return {"action": "exec", "command": sanitize_input(command)}


def action_open(url: str):
    return {"action": "open", "url": url}


def action_benchmark(tests: list):
    return {"action": "benchmark", "tests": tests}


MAX_SAFE_INT = 2**53 - 1


def get_cpu():
    try:
        freq = psutil.cpu_freq()
        return {
            "manufacturer": platform.processor() or "unknown",
            "brand": platform.processor() or "unknown",
            "cores": psutil.cpu_count(logical=False) or os.cpu_count(),
            "logicalCores": psutil.cpu_count(logical=True) or os.cpu_count(),
            "physicalCores": psutil.cpu_count(logical=False) or os.cpu_count(),
            "speed": round(freq.current, 2) if freq else None,
            "maxSpeed": round(freq.max, 2) if freq and freq.max else None,
            "usage": psutil.cpu_percent(interval=0.2),
        }
    except Exception as e:
        return {
            "manufacturer": "unknown",
            "cores": os.cpu_count(),
            "usage": 0,
            "error": str(e),
        }


def get_ram():
    try:
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()
        return {
            "total": mem.total,
            "free": mem.free,
            "used": mem.used,
            "available": mem.available,
            "percent": mem.percent,
            "swapTotal": swap.total,
            "swapUsed": swap.used,
            "swapFree": swap.free,
        }
    except Exception as e:
        return {"total": 0, "used": 0, "free": 0, "error": str(e)}


def get_ssd():
    try:
        disks = run_shell_json("lsblk -J -o NAME,SIZE,TYPE,MOUNTPOINT,MODEL,ROTA 2>/dev/null")
        if not disks:
            disks = {"blockdevices": []}
        partitions = []
        for p in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(p.mountpoint)
                partitions.append(
                    {
                        "device": p.device,
                        "mountpoint": p.mountpoint,
                        "fstype": p.fstype,
                        "total": min(usage.total, MAX_SAFE_INT),
                        "used": min(usage.used, MAX_SAFE_INT),
                        "free": min(usage.free, MAX_SAFE_INT),
                        "percent": usage.percent,
                    }
                )
            except Exception:
                partitions.append(
                    {
                        "device": p.device,
                        "mountpoint": p.mountpoint,
                        "fstype": p.fstype,
                        "total": 0,
                        "used": 0,
                        "free": 0,
                        "percent": 0,
                    }
                )
        return {
            "disks": disks.get("blockdevices", []),
            "partitions": partitions,
        }
    except Exception as e:
        return {"disks": [], "partitions": [], "error": str(e)}


def get_gpu():
    try:
        controllers = []
        lspci = run_shell("lspci 2>/dev/null | grep -iE 'vga|3d|display' || true")
        if lspci and "Error" not in lspci:
            for line in lspci.split("\n"):
                line = line.strip()
                if line:
                    controllers.append({"model": line.split(":", 1)[-1].strip() if ":" in line else line})
        nvidia = run_shell("nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>/dev/null || true")
        if nvidia and "Error" not in nvidia and nvidia != "Executed:":
            for line in nvidia.split("\n"):
                line = line.strip()
                if line:
                    parts = line.split(",")
                    name = parts[0].strip() if parts else ""
                    mem = parts[1].strip() if len(parts) > 1 else ""
                    controllers.append({"model": name, "vram": mem, "vendor": "nvidia"})
        return {"controllers": controllers}
    except Exception as e:
        return {"controllers": [], "error": str(e)}


def get_os():
    try:
        boot_time = psutil.boot_time()
        uptime_seconds = int(time.time() - boot_time) if boot_time else 0
        return {
            "platform": platform.system(),
            "distro": platform.freedesktop_os_release().get("PRETTY_NAME", platform.system())
            if hasattr(platform, "freedesktop_os_release")
            else platform.system(),
            "release": platform.release(),
            "kernel": platform.release(),
            "arch": platform.machine(),
            "hostname": platform.node(),
            "uptime": uptime_seconds,
            "formattedUptime": f"{uptime_seconds // 3600}h {(uptime_seconds % 3600) // 60}m",
        }
    except Exception as e:
        return {
            "platform": platform.system(),
            "release": platform.release(),
            "arch": platform.machine(),
            "hostname": platform.node(),
            "error": str(e),
        }


def get_processes():
    try:
        processes = []
        for p in psutil.process_iter(["pid", "name", "status", "cpu_percent", "memory_percent", "create_time"]):
            try:
                pinfo = p.info
                processes.append(
                    {
                        "pid": pinfo["pid"],
                        "name": pinfo["name"] or "",
                        "status": pinfo["status"] or "",
                        "cpu": round(pinfo.get("cpu_percent", 0) or 0, 1),
                        "mem": round(pinfo.get("memory_percent", 0) or 0, 1),
                    }
                )
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        processes.sort(key=lambda x: x.get("cpu", 0), reverse=True)
        return {"all": len(psutil.pids()), "list": processes[:100]}
    except Exception as e:
        return {"all": 0, "list": [], "error": str(e)}


def get_users():
    try:
        return [
            {"name": u.name, "terminal": u.terminal or "", "host": u.host or "", "started": u.started}
            for u in psutil.users()
        ]
    except Exception:
        return []


def get_battery():
    try:
        bat = psutil.sensors_battery()
        if bat:
            return {"hasBattery": True, "percent": bat.percent, "charging": bat.power_plugged or False, "remaining": bat.secsleft if bat.secsleft != -1 else None}
        return {"hasBattery": False}
    except Exception:
        return {"hasBattery": False}


def get_network():
    try:
        addrs = psutil.net_if_addrs()
        stats = psutil.net_if_stats()
        interfaces = []
        for name, addr_list in addrs.items():
            iface = {"iface": name, "ipv4": "", "ipv6": "", "mac": "", "speed": None, "up": False}
            if name in stats:
                s = stats[name]
                iface["speed"] = s.speed
                iface["up"] = s.isup
            for addr in addr_list:
                if addr.family == 2:
                    iface["ipv4"] = addr.address
                elif addr.family == 23:
                    iface["ipv6"] = addr.address.split("%")[0]
                elif addr.family == 17:
                    iface["mac"] = addr.address
            interfaces.append(iface)
        return {"interfaces": interfaces}
    except Exception as e:
        return {"interfaces": [], "error": str(e)}


def get_bluetooth():
    try:
        devices = []
        raw = run_shell("hciconfig 2>/dev/null || bluetoothctl list 2>/dev/null || echo ''")
        if raw and "Error" not in raw:
            for line in raw.split("\n"):
                line = line.strip()
                if line:
                    devices.append({"device": line})
        return {"devices": devices}
    except Exception:
        return {"devices": []}


def get_fs():
    try:
        partitions = []
        for p in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(p.mountpoint)
                partitions.append(
                    {
                        "device": p.device,
                        "mountpoint": p.mountpoint,
                        "fstype": p.fstype,
                        "total": min(usage.total, MAX_SAFE_INT),
                        "used": min(usage.used, MAX_SAFE_INT),
                        "free": min(usage.free, MAX_SAFE_INT),
                        "percent": usage.percent,
                    }
                )
            except Exception:
                partitions.append(
                    {
                        "device": p.device,
                        "mountpoint": p.mountpoint,
                        "fstype": p.fstype,
                    }
                )
        return {"partitions": partitions}
    except Exception as e:
        return {"partitions": [], "error": str(e)}


def get_load():
    try:
        load_avg = psutil.getloadavg()
        cpu_percent = psutil.cpu_percent(interval=0.2)
        return {
            "currentLoad": cpu_percent,
            "load1": load_avg[0],
            "load5": load_avg[1],
            "load15": load_avg[2],
        }
    except Exception as e:
        return {"currentLoad": 0, "error": str(e)}


def get_uptime_local():
    try:
        boot_time = psutil.boot_time()
        secs = int(time.time() - boot_time) if boot_time else 0
        return {"uptime": secs, "formatted": f"{secs // 3600}h {(secs % 3600) // 60}m", "bootTime": int(boot_time) if boot_time else 0}
    except Exception:
        return {"uptime": 0, "formatted": "0h 0m"}


def get_temp():
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            main = None
            cores = []
            for name, entries in temps.items():
                for entry in entries:
                    if main is None:
                        main = entry.current
                    cores.append({"label": f"{name} {entry.label or ''}".strip(), "temp": entry.current, "high": entry.high or None})
            return {"main": main, "cores": cores, "max": max(c["temp"] for c in cores) if cores else None}
        sensors = run_shell("sensors -j 2>/dev/null || echo ''")
        if sensors and "Error" not in sensors:
            try:
                data = json.loads(sensors)
                cores = []
                main = None
                for chip, vals in data.items():
                    if isinstance(vals, dict):
                        for key, val in vals.items():
                            if isinstance(val, (int, float)):
                                if main is None:
                                    main = val
                                cores.append({"label": f"{chip} {key}", "temp": val})
                return {"main": main, "cores": cores, "max": max(c["temp"] for c in cores) if cores else None}
            except (json.JSONDecodeError, ValueError):
                pass
        return {"main": None, "cores": [], "max": None}
    except Exception:
        return {"main": None, "cores": [], "max": None}


def get_services():
    try:
        services = run_shell("systemctl list-units --type=service --no-pager --no-legend 2>/dev/null | head -100 || true")
        if services and "Error" not in services:
            items = []
            for line in services.split("\n"):
                line = line.strip()
                if line:
                    parts = line.split()
                    if len(parts) >= 3:
                        items.append({"name": parts[0], "load": parts[1], "active": parts[2], "sub": parts[3] if len(parts) > 3 else ""})
            return {"services": items, "total": len(items)}
        return {"services": [], "total": 0}
    except Exception:
        return {"services": [], "total": 0}


def get_scan():
    try:
        return {
            "cpu": get_cpu(),
            "ram": get_ram(),
            "os": get_os(),
            "disks": get_ssd(),
            "network": get_network(),
            "load": get_load(),
            "uptime": get_uptime_local(),
            "users": get_users(),
            "processes": get_processes(),
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/")
async def root():
    return {"service": "sysveiw-cloud", "version": "1.1.3"}


@app.get("/health")
async def health(x_api_key: Optional[str] = Header(None)):
    validate_key(x_api_key)
    return {"ok": True, "service": "sysveiw-cloud", "version": "1.1.3"}


@app.get("/api/command")
async def execute_command_get(
    command: str = "help",
    args: str = "",
    x_api_key: Optional[str] = Header(None),
):
    validate_key(x_api_key)
    parsed_args = shlex.split(args) if args else []
    return await _execute(command, parsed_args)


@app.post("/api/command")
async def execute_command_post(req: CommandRequest):
    validate_key(req.apiKey)
    return await _execute(req.command, req.args)


async def _execute(command: str, args: list):
    try:
        handler = REGISTRY.get(command)
        if handler:
            return handler(args)
        return action_display({"message": f"Cloud command '{command}' accepted.", "command": command, "args": args})
    except Exception as e:
        return {"error": str(e)}


REGISTRY = {
    "help": lambda args: action_display({"commands": sorted(REGISTRY.keys())}),
    "sysveiw-info": lambda args: action_display({
        "version": "1.1.3",
        "developer": "Harinarayanan TR",
        "contact": "error40404.github@gmail.com",
        "repo": "Harinarayanan-TR/sysveiw",
        "mode": "cloud-client",
        "architecture": "thin-client",
    }),
    "cmd": lambda args: action_display(run_shell(" ".join(args))) if args else {"error": 'Usage: cmd "<command>"'},
    "pwr": lambda args: action_display(run_shell(" ".join(args))) if args else {"error": 'Usage: pwr "<command>"'},
    "naitive": lambda args: action_display(run_shell(" ".join(args))) if args else {"error": 'Usage: naitive "<command>"'},
    "sandbox.exec": lambda args: action_display(run_shell(" ".join(args))) if args else {"error": 'Usage: sandbox.exec "<command>"'},
    "sys.cpu": lambda args: action_display(get_cpu()),
    "sys.ram": lambda args: action_display(get_ram()),
    "sys.ssd": lambda args: action_display(get_ssd()),
    "sys.gpu": lambda args: action_display(get_gpu()),
    "sys.os": lambda args: action_display(get_os()),
    "sys.processes": lambda args: action_display(get_processes()),
    "sys.users": lambda args: action_display(get_users()),
    "sys.battery": lambda args: action_display(get_battery()),
    "sys.network": lambda args: action_display(get_network()),
    "sys.bluetooth": lambda args: action_display(get_bluetooth()),
    "sys.fs": lambda args: action_display(get_fs()),
    "sys.load": lambda args: action_display(get_load()),
    "sys.uptime": lambda args: action_display(get_uptime_local()),
    "sys.temp": lambda args: action_display(get_temp()),
    "sys.services": lambda args: action_display(get_services()),
    "sys.scan": lambda args: action_display(get_scan()),
    "server.status": lambda args: action_display({"servers": {}, "message": "Server monitoring active"}),
    "server.list": lambda args: action_display({"servers": []}),
    "server.add": lambda args: action_display({
        "id": args[0], "port": int(args[1]), "protocol": args[2] if len(args) > 2 else "http", "status": "active"
    }) if len(args) >= 2 else {"error": "Usage: server.add <id> <port> [protocol]"},
    "server.remove": lambda args: action_display({"message": f"Server '{args[0]}' removed"}) if args else {"error": "Usage: server.remove <id>"},
    "dev.init": lambda args: action_display({
        "message": f"Project '{args[0]}' initialized.",
        "template": next((a.split("=")[1] for a in args[1:] if a.startswith("--template=")), "node"),
        "git": "--git" in args[1:],
    }) if args else {"error": "Usage: dev.init <projectName>"},
    "dev.install": lambda args: action_display({"message": f"Installing: {', '.join(args)}"}) if args else {"error": "Usage: dev.install <dependency>..."},
    "dev.run": lambda args: action_display({"message": "Project entry point ready"}),
    "dev.clean": lambda args: action_display({"message": "Cleaned", "removed": ["node_modules", "dist"]}),
    "dev.test": lambda args: action_display({"message": "Test execution started", "args": args}),
    "visitrepo": lambda args: action_open("https://github.com/Harinarayanan-TR/sysveiw"),
    "benchmark": lambda args: action_benchmark([
        {"name": "CPU (single-thread)", "command": "lscpu | head -20"},
        {"name": "Uptime", "command": "uptime"},
        {"name": "Memory", "command": "free -h"},
        {"name": "Disk", "command": "df -h /"},
        {"name": "Kernel", "command": "uname -a"},
    ]),
    "net.ping": lambda args: action_exec(f"ping -c 4 {sanitize_input(args[0])}") if args else {"error": "Usage: net.ping <host>"},
    "net.dns": lambda args: action_display(run_shell(f"nslookup {sanitize_input(args[0])} 2>/dev/null || dig {sanitize_input(args[0])} +short 2>/dev/null || echo 'DNS lookup failed'")) if args else {"error": "Usage: net.dns <domain>"},
    "net.port": lambda args: action_exec(f"curl -s -o /dev/null -w '%{{http_code}}' --connect-timeout 5 http://{sanitize_input(args[0])}:{sanitize_input(args[1])} 2>/dev/null || echo 'Port {sanitize_input(args[1])} unreachable'") if len(args) >= 2 else {"error": "Usage: net.port <host> <port>"},
    "net.route": lambda args: action_exec(f"traceroute -m 15 -w 2 {sanitize_input(args[0])} 2>&1 || tracepath {sanitize_input(args[0])} 2>&1 || echo 'Route tracing not available'") if args else {"error": "Usage: net.route <host>"},
    "net.public": lambda args: action_display(
        {"publicIP": run_shell("curl -s https://api.ipify.org 2>/dev/null || echo 'unavailable'")}
    ),
}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=PORT)
