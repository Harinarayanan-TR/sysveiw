THE DOWNLOAD SERVER HAS BEEN UPDATED AND YOU CAN NOW DOWNLOAD THE LATEST VERSIONS FROM THEIR.
DEVELOPMENT OF V1.1.3 FOR WINDOWS IS EXPECTED TO FINISH IN UNDER 2 WEEKS.

# Sysveiw v1.1.3

[![Version](https://img.shields.io/badge/version-1.1.3-blue)](https://github.com/Harinarayanan-TR/sysveiw)
[![Platform](https://img.shields.io/badge/platform-Linux-green)](https://github.com/Harinarayanan-TR/sysveiw)
[![Python](https://img.shields.io/badge/python-3.12+-blue)](https://python.org)

Sysveiw is a **thin-client terminal utility** with a cloud-deployed backend.
The local Electron app provides the terminal UI, sandboxed execution,
and anomaly detection — **zero command logic lives on the client**.
Every command is proxied to the cloud backend which returns action directives
(`display`, `exec`, `open`, `benchmark`) for the client to dispatch locally.

## Architecture

```
┌─────────────────────┐     HTTPS + X-Api-Key      ┌─────────────────────┐
│  Client (Electron)   │ ───────────────────────▶   │  Cloud Backend      │
│                      │                            │  (Python / FastAPI) │
│  boot.js             │    POST /api/command       │                     │
│  commands.js         │    { command, args,        │  All sys.*          │
│  sandbox.js          │      apiKey }              │  cmd, pwr, naitive  │
│  bugdetector.js      │                            │  visitrepo          │
│  hashcheck.js         │    ◀───────────────────────│  benchmark, net.*   │
│  pipelines.js        │     action: "display"      │  server.*, dev.*    │
│  panic.js            │     action: "exec"         │                     │
│  cloud/client.js     │     action: "open"         │  Deployed at:       │
│                      │     action: "benchmark"    │  sysveiw-cloud-     │
│  AppImage ~78MB      │                            │  backend.onrender.. │
└─────────────────────┘                            └─────────────────────┘
```

## Structure

```
sysveiw/
├── client/              # Electron thin client
│   ├── main.js          # Electron main process + IPC
│   ├── renderer.js      # Terminal UI (HTML + IPC)
│   ├── commands.js      # Cloud proxy + action dispatcher
│   ├── boot.js          # Boot sequence (hash check, connect, init)
│   ├── sandbox.js       # Whitelist-based local command executor
│   ├── bugdetector.js   # Anomaly and bug scanning
│   ├── bugdb.js         # Bug database
│   ├── bugalgo.js       # Bug detection algorithms
│   ├── pipelines.js     # Internal message pipelines (P1-P3)
│   ├── panic.js         # Error/panic handler
│   ├── hashcheck.js     # SHA256 integrity verification
│   ├── hash-manifest.json
│   ├── config.json      # Cloud backend URL override
│   ├── cloud/client.js  # HTTP(S) client with API key auth
│   └── dist/            # AppImage build output (gitignored)
│
├── cloud/               # Cloud backend (deployable)
│   ├── main.py          # FastAPI server (all commands)
│   ├── requirements.txt # Pinned Python deps
│   ├── Dockerfile       # Production container
│   ├── docker-compose.yml
│   └── .env.example     # Env var template
│
├── README.md
├── license.md
├── security.md
└── .gitignore
```

## Commands

**System:** `sys.cpu`, `sys.ram`, `sys.ssd`, `sys.gpu`, `sys.os`,
`sys.processes`, `sys.users`, `sys.battery`, `sys.network`, `sys.bluetooth`,
`sys.fs`, `sys.load`, `sys.uptime`, `sys.temp`, `sys.services`, `sys.scan`

**Network:** `net.ping <host>`, `net.dns <domain>`, `net.port <host> <port>`,
`net.route <host>`, `net.public`

**Shell:** `cmd "<cmd>"`, `pwr "<cmd>"`, `naitive "<cmd>"`,
`sandbox.exec "<cmd>"`

**Dev:** `dev.init <project>`, `dev.install <pkg>`, `dev.run`, `dev.clean`,
`dev.test`

**Server:** `server.add <id> <port>`, `server.list`, `server.status`,
`server.remove`

**Other:** `help`, `sysveiw-info`, `visitrepo`, `benchmark`, `panic.start`

## Quick Start (Development)

```bash
# 1. Start the cloud backend locally
cd cloud
pip install -r requirements.txt
SYSVEIW_API_KEY=sv-c1-3a8f2d9e python main.py

# 2. In another terminal, start the client
cd client
npm install
ELECTRON_DISABLE_SANDBOX=1 npm start
```

## Building the AppImage

```bash
cd client
npm run build
# Output: client/dist/Sysveiw v1.1.3-1.1.3.AppImage (~78MB)
```

### Running the AppImage

```bash
ELECTRON_DISABLE_SANDBOX=1 ./client/dist/Sysveiw\ v1.1.3-1.1.3.AppImage
```

If FUSE is missing (Ubuntu 24.04+):
```bash
sudo apt install libfuse2
# Or extract & run (no sudo):
./Sysveiw\ v1.1.3-1.1.3.AppImage --appimage-extract
ELECTRON_DISABLE_SANDBOX=1 ./squashfs-root/AppRun
```

## Configuration

| File | Purpose |
|------|---------|
| `client/config.json` | Cloud backend URL (default: `http://localhost:3000`) |
| `client/hash-manifest.json` | SHA256 hashes for integrity check |

**Environment variables:**
- `SYSVEIW_CLOUD_URL` — override cloud backend URL
- `SYSVEIW_API_KEY` — API key for cloud auth (default: `sv-c1-3a8f2d9e`)
- `ELECTRON_DISABLE_SANDBOX=1` — required for AppImage on most systems

## Cloud Deployment

The Python backend deploys anywhere that supports Docker:

```bash
cd cloud
docker compose up -d --build
# or manually:
pip install -r requirements.txt && python main.py
```

The production cloud is live at:
```
https://sysveiw-cloud-backend.onrender.com
```

Set `client/config.json` to point your client to any cloud instance.

## Requirements

- **Client:** Linux x64, ~150MB disk
- **Cloud:** Python 3.12+, or Docker
- **Node.js v18+** (for client development only)

## Security

See `security.md`. All client-cloud communication uses API key
authentication over HTTPS. The local sandbox restricts execution
to an allowlist of ~40 safe commands.

## Author

**Harinarayanan TR** — error40404.github@gmail.com
