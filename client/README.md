# Sysveiw v1.1.3 — Cloud Client Terminal Utility

Sysveiw is a **thin-client terminal** — the local app provides the UI, sandbox,
and bug detection; all command logic lives on the cloud backend.

## Architecture

```
┌──────────────────┐     HTTP/JSON (X-Api-Key)     ┌──────────────────┐
│  Client          │ ──────────────────────────▶   │  Cloud Backend   │
│  (Electron)      │ ◀─────────────────────────────│  (Python/FastAPI) │
│  - Terminal      │    action: display / exec     │  - All sys.*     │
│  - Bug Detection │    action: open / benchmark   │  - cmd/pwr       │
│  - Sandbox       │                               │  - visitrepo     │
│  - Integrity     │                               │  - net.*         │
│    Verification  │                               │  - server.*      │
└──────────────────┘                               └──────────────────┘
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

## Quick Start

```bash
# Install dependencies
npm install

# Start the client (connect to cloud at client/config.json URL)
npm start
```

## Build AppImage

```bash
npm run build
# Output: dist/Sysveiw v1.1.3-1.1.3.AppImage
```

### Run AppImage

```bash
# Direct (Sandbox env disables Chrome sandbox for AppImage compat):
ELECTRON_DISABLE_SANDBOX=1 ./dist/Sysveiw\ v1.1.3-1.1.3.AppImage

# Or use the wrapper script (handles FUSE + sandbox + extraction):
./run-sysveiw.sh

# If FUSE missing (Ubuntu 24.04+), extract and run:
./dist/Sysveiw\ v1.1.3-1.1.3.AppImage --appimage-extract
ELECTRON_DISABLE_SANDBOX=1 ./squashfs-root/AppRun
```

## Configuration

| File | Purpose |
|------|---------|
| `config.json` | Cloud backend URL (default: `http://localhost:3000`) |
| `hash-manifest.json` | SHA256 hashes for integrity check |

Environment variables: `SYSVEIW_CLOUD_URL`, `SYSVEIW_API_KEY`

## Security

See `SECURITY.md`.
