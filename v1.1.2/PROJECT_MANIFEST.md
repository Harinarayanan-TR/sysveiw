# PROJECT MANIFEST - Sysveiw v1.1.2 Linux Edition

## 📋 Project Overview

**Application Name**: Sysveiw v1.1.2  
**Platform Target**: Linux x64 (AppImage/Electron)  
**License**: Custom (Non-redistributable)  
**Developer**: Harinarayanan TR  
**Contact**: error40404.github@gmail.com  
**GitHub**: github.com/Harinarayanan-TR/sysveiw  
**Release Type**: Pro-Legacy CLI System Utility  
**Node.js Requirement**: v14.0.0+  
**Last Updated**: May 10, 2026  

---

## 📦 Project Structure

```
sysveiw/
│
├── 📄 Core Application Files
│   ├── main.js                  # Electron main process (UI bootstrap)
│   ├── renderer.js              # UI rendering and IPC handling
│   ├── index.html               # HTML interface template
│   ├── cli.js                   # CLI mode entry point
│   └── boot.js                  # Boot sequence orchestration
│
├── 💻 Command & Control System
│   ├── commands.js              # Command registry & execution engine
│   ├── pipelines.js             # Internal message pipelines (P1, P2, P3)
│   ├── panic.js                 # Error handling & recovery
│   ├── hashcheck.js             # Integrity verification
│   └── cli.js                   # CLI interface
│
├── 🔍 Monitoring & Detection
│   ├── bugdetector.js           # System monitoring & anomaly detection
│   ├── bugdb.js                 # Bug rules database
│   ├── bugalgo.js               # Detection algorithms & scanning
│   └── (Auto-recovery on detection)
│
├── 🎨 User Interface & Resources
│   ├── icon.png                 # Linux application icon (256x256)
│   ├── icon.ico                 # Windows icon (legacy support)
│   └── index.html               # Terminal UI HTML
│
├── 📦 Installation & Build
│   ├── package.json             # Project manifest & dependencies
│   ├── package-lock.json        # Dependency lock file
│   ├── install.sh               # Automated installer (bash)
│   ├── setup-wizard.sh          # Interactive setup wizard
│   └── node_modules/            # NPM dependencies (auto-created)
│
├── 📚 Documentation
│   ├── README.md                # Complete project documentation
│   ├── INSTALL.md               # Detailed installation guide
│   ├── license.txt              # Custom license terms
│   ├── PROJECT_MANIFEST.md      # This file
│   └── CHECKLIST.md             # Pre-deployment checklist
│
└── 🔧 Build Output (generated)
    └── dist/                    # Distribution builds
        └── Sysveiw v1.1.2-x86_64.AppImage  # Standalone executable

```

---

## 📋 File Inventory

### Core Application Files
| File | Size | Purpose |
|------|------|---------|
| `main.js` | ~4KB | Electron main process, window management, IPC setup |
| `renderer.js` | ~3KB | Frontend rendering, UI interactions, command display |
| `index.html` | ~0.3KB | HTML template for terminal interface |
| `cli.js` | ~0.8KB | Command-line interface for non-Electron mode |
| `boot.js` | ~1KB | Application boot sequence coordinator |

### Command System
| File | Size | Purpose |
|------|------|---------|
| `commands.js` | ~18KB | Command registry with 40+ built-in commands |
| `pipelines.js` | ~1KB | Message pipeline system (P1, P2, P3) |
| `panic.js` | ~0.5KB | Panic mode and error handling UI |
| `hashcheck.js` | ~0.5KB | Integrity verification |

### Monitoring & Detection
| File | Size | Purpose |
|------|------|---------|
| `bugdetector.js` | ~10KB | Continuous scanning and issue detection |
| `bugdb.js` | ~8KB | Database of 15 bug detection rules |
| `bugalgo.js` | ~8KB | Scanning algorithms and analysis |

### Resources
| File | Size | Purpose |
|------|------|---------|
| `icon.png` | ~50KB | Application icon for Linux (256x256) |
| `icon.ico` | ~50KB | Windows icon (legacy/compatibility) |

### Configuration & Build
| File | Size | Purpose |
|------|------|---------|
| `package.json` | ~1.5KB | Dependencies, scripts, build config |
| `package-lock.json` | ~40KB | Locked dependency versions |

### Installation & Setup
| File | Size | Purpose |
|------|------|---------|
| `install.sh` | ~11KB | Automated installation script |
| `setup-wizard.sh` | ~8.2KB | Interactive setup wizard |

### Documentation
| File | Size | Purpose |
|------|------|---------|
| `README.md` | ~12KB | Complete project documentation |
| `INSTALL.md` | ~10KB | Detailed installation instructions |
| `license.txt` | ~2KB | Custom license terms |
| `PROJECT_MANIFEST.md` | This file | Project structure & inventory |

---

## 🔧 Build Configuration

### Package.json Details

**Scripts**:
- `npm start` - Launch in development mode
- `npm run build` - Build application
- `npm run dist` - Build AppImage distribution
- `npm run pack` - Package without distribution

**Dependencies**:
- `systeminformation` (v5.31.5) - System info retrieval
- `fs-extra` (v11.2.0) - File system utilities

**Dev Dependencies**:
- `electron-builder` (v24.13.3) - Distribution builder
- `electron` (v29.0.0) - UI framework

**Build Configuration**:
- Platform: Linux x64
- Target: AppImage (standalone)
- Icon: icon.png (256x256)
- Output Directory: `dist/`
- App ID: `com.sysveiw.cli`
- Product Name: Sysveiw v1.1.2

---

## 🎯 Installation Paths

### Default Installation Directory
```
~/.local/opt/sysveiw/
├── main.js
├── renderer.js
├── commands.js
├── node_modules/
├── icon.png
└── [all other files]
```

### Launcher Location
```
~/.local/bin/sysveiw  # Terminal command
```

### Desktop Integration
```
~/.local/share/applications/sysveiw.desktop
~/.local/share/icons/hicolor/256x256/apps/sysveiw.png
```

### AppImage Distribution
```
dist/Sysveiw v1.1.2-x86_64.AppImage  # Standalone executable
```

---

## 🔄 Linux Platform Migration Changes

### What Changed from Windows Version

| Aspect | Windows Version | Linux Version |
|--------|-----------------|---------------|
| **Build Target** | NSIS Installer | AppImage |
| **Icon** | icon.ico | icon.png |
| **Shell Routing** | `cmd /c` & `powershell -Command` | `/bin/bash` |
| **Native Commands** | cmd, pwr | cmd, pwr, naitive (all bash) |
| **Desktop Entry** | Start Menu, Shortcuts | .desktop file + menu |
| **Installation** | installer.nsh | install.sh, setup-wizard.sh |
| **Package Manager** | npm + electron-builder | npm + electron-builder |
| **Launcher** | Direct executable | ~/.local/bin/sysveiw |
| **Icon Path** | icon.ico | icon.png |

### Key Implementation Details

1. **Command Parsing**: Enhanced quoted-command parser in `main.js` and `cli.js`
2. **Shell Routing**: All native commands route through `/bin/bash`
3. **Electron Windows**: Icon path updated to use `icon.png`
4. **Desktop Integration**: Creates `.desktop` file for application menu
5. **Dependencies**: Removed Windows-specific native dependencies

---

## 📊 System Requirements

### Minimum
- **OS**: Linux (any distribution with systemd)
- **Arch**: x86_64 (64-bit)
- **RAM**: 512MB available
- **Disk**: 500MB (with node_modules)
- **Node.js**: v14.0.0+
- **npm**: v6.0.0+

### Recommended
- **RAM**: 2GB+
- **Disk**: 1GB+ SSD
- **Node.js**: v16.0.0+
- **npm**: v8.0.0+

---

## 🎮 Command Categories

### System Information (7 commands)
```
sys.cpu, sys.ram, sys.ssd, sys.gpu, sys.os, sys.processes, sys.users
```

### Native Shell Routing (3 commands)
```
cmd, pwr, naitive
```

### Development Tools (5 commands)
```
dev.init, dev.install, dev.run, dev.clean, dev.test
```

### Server Management (4 commands)
```
server.add, server.list, server.status, server.remove
```

### Utility (3 commands)
```
help, sysveiw-info, panic.start
```

**Total**: 22 built-in commands

---

## 🔍 Quality Assurance

### Syntax Verification ✅
- All JavaScript files validated for syntax
- package.json validated (JSON schema)
- HTML template validated

### Dependencies ✅
- All npm packages pinned to versions
- No missing require() targets
- Production-only dependencies selected

### Platform Compatibility ✅
- Linux shell commands (bash)
- No Windows-only APIs used
- Standard Node.js modules only

### Error Handling ✅
- Try-catch blocks in all command handlers
- Graceful error messages
- Bug detection & auto-recovery

### User Interface ✅
- Terminal-style green-on-black theme
- Responsive table formatting
- Command history caching

---

## 🚀 Installation Verification

After installation, verify with:

```bash
# 1. Check launcher exists
ls -la ~/.local/bin/sysveiw

# 2. Check installation directory
ls -la ~/.local/opt/sysveiw/

# 3. Test launch
~/.local/bin/sysveiw

# 4. Test command
echo "help" | ~/.local/opt/sysveiw/cli.js

# 5. Check desktop entry
cat ~/.local/share/applications/sysveiw.desktop

# 6. Verify icon
file ~/.local/share/icons/*/sysveiw.png
```

---

## 📝 Deployment Checklist

- [x] All JavaScript files syntactically valid
- [x] package.json properly configured for Linux
- [x] Icon files present (icon.png for Linux)
- [x] Windows-specific code removed/replaced
- [x] Shell routing updated to use bash
- [x] Install script created and tested
- [x] Setup wizard implemented with options
- [x] Desktop entry generation enabled
- [x] Uninstaller script generation enabled
- [x] Documentation complete (README + INSTALL)
- [x] Project manifest created
- [x] Installer scripts executable (chmod +x)
- [x] AppImage build configuration set
- [x] Command parsing enhanced for quoted args
- [x] Error handling comprehensive
- [x] No hardcoded Windows paths
- [x] PATH integration documented

---

## 🔗 Key Links

- **GitHub Repository**: https://github.com/Harinarayanan-TR/sysveiw
- **Installation Guide**: See INSTALL.md
- **Documentation**: See README.md
- **License**: See license.txt

---

## 📞 Support & Maintenance

**Developer**: Harinarayanan TR  
**Email**: error40404.github@gmail.com  
**Version**: 1.1.2 (Pro-Legacy)  
**Platform**: Linux x64  
**Build System**: Electron + electron-builder  

---

## 📄 Version History

### v1.1.2 (Linux Edition)
- ✅ Ported to Linux with AppImage build
- ✅ Shell routing updated for bash
- ✅ Interactive installer added
- ✅ Desktop integration included
- ✅ Comprehensive documentation

### v1.1.2 (Original Windows)
- Initial stable release for Windows
- NSIS installer
- PowerShell & CMD routing

---

**Generated**: May 10, 2026  
**Status**: Complete & Ready for Deployment  
**Next Step**: Run `./setup-wizard.sh` to install
