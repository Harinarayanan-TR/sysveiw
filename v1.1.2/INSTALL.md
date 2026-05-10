# Sysveiw v1.1.2 - Linux Installation Guide

Welcome to **Sysveiw v1.1.2** - a Pro-Legacy CLI System Utility for Linux systems.

## 📋 System Requirements

- **OS**: Linux (Ubuntu, Debian, Fedora, Arch, openSUSE, or any systemd-based distribution)
- **Architecture**: x64 (64-bit)
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **RAM**: Minimum 512MB available
- **Disk Space**: ~500MB for full installation with node_modules

## 🚀 Quick Install

### Method 1: Interactive Setup Wizard (Recommended)

```bash
chmod +x setup-wizard.sh
./setup-wizard.sh
```

This interactive installer will:
- ✅ Check system dependencies
- ✅ Install Node.js and npm if needed
- ✅ Download and install application files
- ✅ Create desktop integration
- ✅ Generate system launcher
- ✅ Optional: Build AppImage for standalone execution

### Method 2: Automated Install Script

```bash
chmod +x install.sh
./install.sh
```

The automated installer handles everything without prompts.

### Method 3: Manual Installation

```bash
# 1. Install dependencies
sudo apt-get install -y nodejs npm
# or for Fedora: sudo dnf install -y nodejs npm
# or for Arch: sudo pacman -S nodejs npm

# 2. Install Node modules
npm install --production

# 3. Set up the application
mkdir -p ~/.local/opt/sysveiw
cp -r *.js *.html *.json *.png *.txt node_modules ~/.local/opt/sysveiw/

# 4. Create launcher
mkdir -p ~/.local/bin
cat > ~/.local/bin/sysveiw << 'EOF'
#!/bin/bash
electron ~/.local/opt/sysveiw/main.js "$@"
EOF
chmod +x ~/.local/bin/sysveiw

# 5. Add to PATH (if not already there)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## 🎯 What Gets Installed

After installation, you'll have:

```
~/.local/opt/sysveiw/          # Main application directory
├── main.js                    # Electron main process
├── renderer.js                # UI renderer process
├── index.html                 # Application interface
├── commands.js                # Command definitions
├── boot.js                    # Boot sequence
├── panic.js                   # Error handling
├── bugdetector.js             # System monitoring
├── *.js                       # Other modules
├── node_modules/              # Dependencies
├── package.json               # Project manifest
├── icon.png                   # Application icon
├── license.txt                # License information
└── uninstall.sh               # Uninstaller script

~/.local/bin/sysveiw          # Command launcher
~/.local/share/applications/sysveiw.desktop  # Menu entry
~/.local/share/icons/*/sysveiw.png           # Icon
```

## 🎮 Launch the Application

After installation, launch Sysveiw using any of these methods:

### Terminal
```bash
sysveiw
```

### Application Menu
Search for "Sysveiw" in your application menu/launcher

### Custom Directory
```bash
~/.local/bin/sysveiw
```

## 📦 Building AppImage (Standalone Package)

To create a self-contained AppImage file for distribution:

```bash
# Option 1: During installation
./setup-wizard.sh --build

# Option 2: After installation
cd ~/.local/opt/sysveiw
npm run dist

# This creates: dist/Sysveiw v1.1.2-x86_64.AppImage
```

You can then:
- **Share** the AppImage with others (no installation needed)
- **Make executable** and run directly: `chmod +x Sysveiw*.AppImage && ./Sysveiw*.AppImage`
- **Integrate** with desktop for single-click launch

## ⚙️ Available Commands

Once installed, you can use these CLI commands:

### System Information
```
sys.cpu          # CPU information
sys.ram          # Memory usage
sys.ssd          # Disk information
sys.gpu          # GPU information
sys.os           # OS information
sys.processes    # Running processes
sys.users        # Active users
```

### Native Command Execution
```
cmd "ls -la"              # Execute Linux command (bash)
pwr "echo Hello"          # Alternative command syntax
naitive "whoami"          # Native command (alias)
```

### Development Tools
```
dev.init project_name [--template=node|python] [--git]
dev.install package1 package2
dev.run
dev.clean [--deep]
dev.test
```

### Server Management
```
server.add myserver 3000 http
server.list
server.status
server.remove myserver
```

### Utility Commands
```
help             # Show all available commands
sysveiw-info     # Application information
panic.start      # Demo panic screen
```

## 🔧 Configuration & Environment

### Setting Custom Installation Path

```bash
./install.sh /opt/sysveiw
```

### Environment Variables

```bash
# Add to ~/.bashrc for custom behavior
export SYSVEIW_HOME=~/.local/opt/sysveiw
export NODE_ENV=production
```

### Ensuring PATH is Set

If `sysveiw` command doesn't work after installation:

```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$HOME/.local/bin:$PATH"

# Then reload shell
source ~/.bashrc
```

## 🔄 Updating Sysveiw

To update to the latest version:

```bash
cd ~/.local/opt/sysveiw
git pull origin main    # If installed from git
npm install --production
npm run dist            # Rebuild AppImage if desired
```

## 🗑️ Uninstallation

### Using Uninstaller Script
```bash
~/.local/opt/sysveiw/uninstall.sh
```

### Manual Removal
```bash
rm -f ~/.local/bin/sysveiw
rm -f ~/.local/share/applications/sysveiw.desktop
rm -f ~/.local/share/icons/*/sysveiw.png
rm -rf ~/.local/opt/sysveiw
```

## 🐛 Troubleshooting

### Issue: Command not found
**Solution**: Ensure `~/.local/bin` is in your PATH
```bash
echo $PATH | grep ~/.local/bin
# If not present, add to ~/.bashrc
export PATH="$HOME/.local/bin:$PATH"
```

### Issue: Cannot find Electron
**Solution**: Reinstall npm dependencies
```bash
cd ~/.local/opt/sysveiw
npm install --production
```

### Issue: Permission denied on launcher
**Solution**: Make scripts executable
```bash
chmod +x ~/.local/bin/sysveiw
chmod +x ~/.local/opt/sysveiw/uninstall.sh
```

### Issue: Desktop entry not showing
**Solution**: Update desktop database
```bash
update-desktop-database ~/.local/share/applications/
```

### Issue: Out of memory during build
**Solution**: Increase swap space or build without AppImage
```bash
# Just use the installed app without building AppImage
sysveiw
```

## 📊 System Integration

### Desktop Entry
The installer creates a `.desktop` file for your application menu:
- Category: System, Development, Utility
- Icon: High-resolution PNG (256x256)
- Launcher: Standard desktop environment integration

### Application Menu
After installation, Sysveiw appears in:
- GNOME Activities
- KDE Application Menu
- Application launchers (Rofi, Dmenu, etc.)

### Terminal Integration
```bash
# Add alias for faster access
echo "alias sysview='~/.local/bin/sysveiw'" >> ~/.bashrc
```

## 📞 Support & Feedback

- **GitHub Repository**: [Harinarayanan-TR/sysveiw](https://github.com/Harinarayanan-TR/sysveiw)
- **Developer**: Harinarayanan TR
- **Email**: error40404.github@gmail.com
- **License**: Custom License (see license.txt)

## 📝 Version Information

- **Application Version**: 1.1.2
- **Release**: Pro-Legacy
- **Platform**: Linux x64
- **Build Type**: AppImage / Electron
- **Node.js Support**: v14.0.0+

## 🎯 Next Steps

1. **Complete Installation**: Run `setup-wizard.sh` or `install.sh`
2. **Launch Application**: Type `sysveiw` or search in app menu
3. **Explore Commands**: Type `help` in the Sysveiw terminal
4. **Build AppImage**: Run `npm run dist` for standalone executable
5. **Configure**: Adjust settings and environment variables as needed

---

**Thank you for using Sysveiw v1.1.2!** 🎉
