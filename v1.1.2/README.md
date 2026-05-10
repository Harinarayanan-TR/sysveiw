# Sysveiw v1.1.2 - Pro-Legacy CLI System Utility

![Version](https://img.shields.io/badge/version-1.1.2-blue)
![Platform](https://img.shields.io/badge/platform-Linux-green)
![License](https://img.shields.io/badge/license-Custom-red)
![Node.js](https://img.shields.io/badge/node.js-v14%2B-success)

Sysveiw is a powerful, cross-platform CLI system utility application built with Electron. It provides a comprehensive terminal interface for system information, command execution, server management, and development utilities—all through an intuitive, retro-styled terminal UI.

## ✨ Features

### 🖥️ System Information
- **CPU Information**: Real-time processor details and usage
- **Memory (RAM) Stats**: Current and historical memory consumption
- **Disk & SSD Information**: Storage capacity and health data
- **GPU Information**: Graphics processor details
- **OS Information**: Operating system and kernel details
- **Process Monitoring**: Active processes and system load
- **User Information**: Active user sessions

### 🔌 Command Execution
Execute any Linux shell command directly through the Sysveiw interface:
```
cmd "ls -la"
pwr "grep pattern file.txt"
naitive "ps aux | grep process"
```

### 🌐 Server Management
Manage multiple servers and ports:
```
server.add webserver 3000 http
server.list
server.status
server.remove webserver
```

### 👨‍💻 Development Tools
Built-in project scaffolding and management:
```
dev.init myproject --template=node --git
dev.install express axios
dev.run
dev.clean --deep
dev.test
```

### 🛡️ System Monitoring
- **Bug Detection**: Continuous monitoring for system anomalies
- **Memory Monitoring**: Tracks memory usage and detects leaks
- **Pipeline Monitoring**: Monitors internal data pipelines
- **Auto-Recovery**: Automatic module restart on detection of issues
- **Panic Handling**: Graceful error recovery with panic mode

### 📊 Data Caching
- Automatic command result caching
- History tracking with timestamps
- Report generation (JSON and binary formats)
- Server state persistence

## 🚀 Installation

### Quick Start (Recommended)
```bash
git clone https://github.com/Harinarayanan-TR/sysveiw.git
cd sysveiw
chmod +x setup-wizard.sh
./setup-wizard.sh
```

### Automated Installation
```bash
chmod +x install.sh
./install.sh
```

### Full Installation Guide
See [INSTALL.md](INSTALL.md) for detailed installation instructions for all Linux distributions.

## 🎮 Usage

### Launch the Application
```bash
sysveiw
```

### Available Commands

**System Information Commands:**
```
sys.cpu                    # Display CPU information
sys.ram                    # Display RAM usage
sys.ssd                    # Display disk information
sys.gpu                    # Display GPU information
sys.os                     # Display OS information
sys.processes              # Display running processes
sys.users                  # Display active users
```

**Command Execution:**
```
cmd "<linux-command>"      # Execute any bash command
pwr "<command>"            # Alternative shell execution
naitive "<command>"        # Native terminal routing
```

**Development Commands:**
```
dev.init <project> [--template=node|python] [--git]
dev.install <package1> <package2> ...
dev.run
dev.clean [--deep]
dev.test [args...]
```

**Server Management:**
```
server.add <id> <port> [protocol]
server.list
server.status [id]
server.remove <id>
```

**Utility Commands:**
```
help                       # List all commands
sysveiw-info               # Application information
panic.start                # Trigger panic demo
```

## 🏗️ Project Structure

```
sysveiw/
├── main.js                 # Electron main process
├── renderer.js             # UI rendering logic
├── cli.js                  # CLI interface
├── boot.js                 # Boot sequence
├── commands.js             # Command registry and execution
├── pipelines.js            # Internal message pipelines
├── bugdetector.js          # System monitoring and bug detection
├── bugdb.js                # Bug database and rules
├── bugalgo.js              # Bug detection algorithms
├── panic.js                # Error handling and panic mode
├── hashcheck.js            # Integrity verification
├── index.html              # HTML interface
├── package.json            # Project dependencies
├── install.sh              # Automated installer
├── setup-wizard.sh         # Interactive setup wizard
├── INSTALL.md              # Installation guide
├── README.md               # This file
├── icon.png                # Application icon
└── license.txt             # License information
```

## 🔨 Development

### Prerequisites
- Node.js v14.0.0 or higher
- npm v6.0.0 or higher
- Git

### Setup Development Environment
```bash
git clone https://github.com/Harinarayanan-TR/sysveiw.git
cd sysveiw
npm install
```

### Run in Development Mode
```bash
npm start
```

### Build AppImage
```bash
npm run dist
```

This creates a standalone, self-contained Linux executable that requires no installation.

### Build Options
```bash
npm run build              # Build application
npm run dist               # Build distribution (AppImage)
npm run pack               # Package without distributing
```

## 📦 AppImage Build

To create a standalone AppImage for easy distribution:

```bash
npm run dist
```

The AppImage will be created in the `dist/` directory:
- **Filename**: `Sysveiw v1.1.2-x86_64.AppImage`
- **Size**: ~80-120 MB (includes Electron and all dependencies)
- **Compatibility**: Works on most Linux distributions

### Using AppImage
```bash
# Make executable
chmod +x Sysveiw\ v1.1.2-x86_64.AppImage

# Run
./Sysveiw\ v1.1.2-x86_64.AppImage

# Or integrate with your system
sudo cp Sysveiw\ v1.1.2-x86_64.AppImage /opt/sysveiw
sudo ln -s /opt/sysveiw /usr/local/bin/sysveiw
```

## 🔒 Security & Integrity

- **Hash Verification**: Application integrity is verified on startup
- **Command Validation**: All commands are validated before execution
- **Panic Mode**: Automatic recovery from critical errors
- **Isolation**: Commands run in isolated child processes

## 📝 Logging & Reporting

All command execution and system events are logged:
- **command_cache.json**: Command history with results
- **server_state.json**: Server configuration state
- **bug_reports.json**: Detected issues and anomalies
- **server_memory.json**: Server memory snapshot

## 🐛 Bug Detection & Recovery

Sysveiw includes an advanced monitoring system that:
1. **Detects Issues**: Scans for syntax errors, memory leaks, pipeline overloads
2. **Logs Events**: Records all detected anomalies
3. **Attempts Recovery**: Automatically restarts affected modules
4. **Escalates**: Triggers panic mode if recovery fails
5. **Generates Reports**: Creates detailed bug reports for analysis

## 🎨 User Interface

### Terminal-Style Interface
- Green monospace terminal font (Consolas)
- Black background for reduced eye strain
- Real-time command output with formatted tables
- Responsive to all screen sizes
- Copy-paste support for results

### Visual Feedback
- Green prompt (`>`) indicating ready state
- Color-coded error messages (red)
- Table-formatted data output
- Progress indicators for long operations

## 🔄 System Integration

### Desktop Entry
Creates a `.desktop` entry for application menu integration:
- Searchable in GNOME Activities
- Available in KDE Application Menu
- Works with all modern Linux desktop environments

### Command Launcher
Installs `sysveiw` command for terminal execution:
```bash
sysveiw
```

### Application Menu
Accessible via:
- Application launcher (Activities, Menu)
- Terminal command
- Custom shortcuts

## ⚙️ Configuration

### Environment Variables
```bash
# Node environment
export NODE_ENV=production

# Custom installation path
export SYSVEIW_HOME=~/.local/opt/sysveiw

# Electron debugging
export DEBUG=sysveiw:*
```

### Custom Installation Path
```bash
./install.sh /opt/custom/path
```

## 📊 Performance

- **Memory**: ~200-300 MB at idle
- **CPU**: Minimal usage when idle
- **Startup Time**: ~2-3 seconds
- **Command Execution**: < 1 second for most operations

## 🔗 Dependencies

### Production Dependencies
- **systeminformation** (v5.31.5): System information retrieval
- **fs-extra** (v11.2.0): File system utilities
- **electron** (v29.0.0): Framework
- **electron-builder** (v24.13.3): Distribution builder

### Built-in Node Modules
- `child_process`: Command execution
- `http`: Server management
- `fs`: File operations
- `path`: Path utilities
- `os`: OS information
- `crypto`: Hash verification
- `vm`: JavaScript validation

## 📜 License

This project is licensed under a **Custom License**. See [license.txt](license.txt) for full terms.

**Usage Rights**: 
- Personal use: ✅ Allowed
- Commercial use: ⚠️ Contact developer
- Redistribution: ❌ Not permitted
- Modification: ⚠️ Allowed for personal use only

## 👨‍💻 Author

**Harinarayanan TR**
- Email: error40404.github@gmail.com
- GitHub: [@Harinarayanan-TR](https://github.com/Harinarayanan-TR)
- Repository: [sysveiw](https://github.com/Harinarayanan-TR/sysveiw)

## 🙏 Contributing

Community contributions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Reporting Issues

Found a bug? Please report it:
1. Check existing issues first
2. Include system information
3. Provide clear reproduction steps
4. Attach relevant logs if available

## 🎯 Roadmap

- [ ] Windows 11+ native build support
- [ ] macOS support
- [ ] Web-based UI variant
- [ ] Plugin system for custom commands
- [ ] Advanced network diagnostics
- [ ] Cloud server management integration
- [ ] Mobile companion app

## ❓ FAQ

**Q: Is Sysveiw stable?**
A: Yes! v1.1.2 is a stable release with comprehensive error handling.

**Q: Does it work on all Linux distributions?**
A: Yes! It works on Ubuntu, Debian, Fedora, Arch, openSUSE, and any systemd-based Linux.

**Q: Can I run arbitrary commands?**
A: Yes! Use the `cmd`, `pwr`, or `naitive` commands to execute any shell command.

**Q: Does it require root/sudo?**
A: No, but some commands may require elevated privileges.

**Q: How much disk space does it need?**
A: ~500MB for full installation with dependencies. AppImage is ~100MB.

**Q: Can I create custom commands?**
A: Yes! Edit `commands.js` to add custom command handlers.

**Q: Is there a dark mode?**
A: The interface is already dark (black background, green text).

## 📞 Support

For support, documentation, and updates:
- **GitHub Issues**: [Report bugs](https://github.com/Harinarayanan-TR/sysveiw/issues)
- **Email**: error40404.github@gmail.com
- **Installation Help**: See [INSTALL.md](INSTALL.md)

---

## 🎉 Quick Start Commands

After installation, try these commands:

```
sysveiw              # Launch the app
help                 # See all available commands
sys.cpu              # Check CPU info
cmd "uname -a"       # Show system details
dev.init test        # Create a test project
server.add test 8000 # Add a test server
```

---

**Made with ❤️ by Harinarayanan TR**

*Sysveiw v1.1.2 - Pro-Legacy CLI System Utility for Linux*
