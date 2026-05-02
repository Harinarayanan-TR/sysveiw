# sysveiw
SysView is a cross-platform hybrid terminal and system utility built with Electron. It lets users run native OS commands, view system info, and use custom commands in a single interface. It offers both a Classic version without auto-updates and a modern version with OTA updates for flexibility.


---

## Features

- Run native OS commands (`run <command>`)
- Built-in commands (`help`, `sysinfo`, `clear`)
- Simple and fast terminal-style interface
- Cross-platform foundation (Windows, macOS, Linux)

---

## Versions

### SysView Classic (v1.1.1)
- No auto-updates
- Lightweight and stable
- Manual updates required

### SysView (v1.1.2+)
- Supports OTA (over-the-air) updates
- Automatically receives new features and fixes

AS OF 02-05-2026, OTA AND SUCH ONLINE FEATURES HAVE BEEN DELAYED. PLEASE REFER ISSUES FOR MORE INFORMATION.
---

## Installation

### Classic Version (v1.1.1)
Download the installer from the Releases section and install manually.

### OTA Version (v1.1.2+)
Install once, and updates will be delivered automatically.

---

## Development

### Prerequisites
- Node.js
- npm

### Setup

```bash
npm install
npm start
##BUILD
npm run build
| Command       | Description             |
| ------------- | ----------------------- |
| help          | List all commands       |
| sysinfo       | Show system information |
| run <command> | Execute OS command      |
| clear         | Clear terminal          |
