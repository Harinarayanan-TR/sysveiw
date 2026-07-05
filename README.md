# Sysveiw v1.1.3

[![Version](https://img.shields.io/badge/version-1.1.3-blue)](https://github.com/Harinarayanan-TR/sysveiw)
[![Platform](https://img.shields.io/badge/platform-Linux-green)](https://github.com/Harinarayanan-TR/sysveiw)
[![Node.js](https://img.shields.io/badge/node.js-v14%2B-success)](https://nodejs.org)

Sysveiw is a thin-client terminal utility with cloud architecture.
The local Electron app connects to a cloud backend that provides
command execution, system information, and development tools.

## Structure

```
sysveiw/
├── client/          # Electron thin client (local)
│   ├── main.js      # Electron main process
│   ├── renderer.js  # Terminal UI renderer
│   ├── commands.js  # Cloud-proxied commands
│   ├── cli.js       # CLI mode (no GUI)
│   ├── boot.js      # Boot sequence
│   ├── sandbox.js   # Sandboxed command execution
│   ├── bugdetector.js, bugdb.js, bugalgo.js  # Bug detection
│   ├── pipelines.js # Message pipelines
│   ├── panic.js     # Error handling
│   ├── hashcheck.js # Integrity verification
│   ├── installer.js # GUI installer
│   ├── install.sh / setup-wizard.sh  # Linux installers
│   └── cloud/client.js  # Cloud connection library
│
├── cloud/           # Cloud backend (deployable)
│   ├── server.js    # Node.js cloud server
│   ├── main.py      # Python FastAPI server
│   ├── client.js    # Cloud client library
│   └── package.json / requirements.txt
│
├── README.md        # This file
├── license.md       # Custom license
├── security.md      # Security policy
└── .gitignore
```

## Setup

### Local Development

```bash
# Terminal 1: Start cloud backend (Node.js)
cd cloud && npm install && npm start

# Terminal 2: Start cloud backend (Python - alternative)
cd cloud && pip install -r requirements.txt && python main.py

# Terminal 3: Start client
cd client && npm install && npm start
```

### Install on System

```bash
cd client
chmod +x install.sh setup-wizard.sh
./setup-wizard.sh    # Interactive
# OR ./install.sh    # Automated
```

### Build AppImage

```bash
cd client && npm run dist
```

## Cloud Backend

The cloud backend is available in two implementations:

- **Node.js** (`cloud/server.js`): Uses `systeminformation` + `child_process`
- **Python** (`cloud/main.py`): Uses `FastAPI` + `psutil`

Both provide the same API endpoints:
- `GET /health` - Health check
- `POST /api/command` - Execute command (JSON: `{ command, args }`)

## Requirements

- Node.js v14+
- npm v6+
- Linux x64
- ~500MB disk space

## Author

**Harinarayanan TR** - error40404.github@gmail.com
