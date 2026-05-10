# 🎯 START HERE - Sysveiw v1.1.2 Linux Installation

Welcome! This file guides you through everything you need to know to get Sysveiw up and running on your Linux system.

---

## ⚡ 5-Minute Quick Start

### Step 1: Verify System Readiness (2 min)
```bash
# Check if you have Node.js and npm
node --version    # Should show v14.0.0 or higher
npm --version     # Should show v6.0.0 or higher

# If not installed, run one of these:
# Ubuntu/Debian:
sudo apt-get install -y nodejs npm

# Fedora:
sudo dnf install -y nodejs npm

# Arch:
sudo pacman -S nodejs npm

# openSUSE:
sudo zypper install -y nodejs npm
```

### Step 2: Navigate to Project Directory (1 min)
```bash
# Go to where you downloaded/extracted Sysveiw
cd /path/to/sysveiw
```

### Step 3: Run the Installer (2 min)
```bash
# Make scripts executable (if not already)
chmod +x setup-wizard.sh install.sh

# Run the interactive setup wizard (RECOMMENDED)
./setup-wizard.sh

# OR use the automated installer
./install.sh
```

### Step 4: Launch Sysveiw
```bash
# After installation completes
sysveiw
```

**That's it!** ✅ You now have Sysveiw installed and running.

---

## 📚 Which Guide Should You Read?

Choose based on your situation:

### 👶 First Time Users
**Read**: [CHECKLIST.md](CHECKLIST.md)
- Verify your system is ready
- Understand the installation process
- Check you have all requirements
- **Estimated Time**: 5-10 minutes

### 🚀 Ready to Install?
**Read**: [INSTALL.md](INSTALL.md)
- Three installation methods explained
- Step-by-step instructions
- Troubleshooting guide
- **Choose One**:
  1. Interactive Setup Wizard (easiest)
  2. Automated Script (faster)
  3. Manual (full control)

### 📖 How Do I Use It?
**Read**: [README.md](README.md)
- All available commands explained
- Feature overview
- Usage examples
- Tips and tricks

### 🔧 What's Inside?
**Read**: [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md)
- Complete file inventory
- Project structure
- Technical details
- System requirements

### 📊 What Was Changed?
**Read**: [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- Windows → Linux conversion details
- Delivery checklist
- What's included
- Quality assurance info

---

## 🎮 Quick Command Reference

Once installed, try these commands:

```
help                        # List all commands
sysveiw-info                # App information
sys.cpu                     # CPU information
sys.ram                     # Memory usage
sys.ssd                     # Disk info
cmd "ls -la"                # Run any Linux command
dev.init myproject          # Create new project
server.add myserver 3000    # Manage servers
```

Type these directly in the Sysveiw terminal.

---

## 📋 Pre-Installation Checklist

Before you start, verify:

- [ ] **Linux System**: Running Ubuntu, Debian, Fedora, Arch, openSUSE, or similar
- [ ] **64-bit**: Running x86_64 (check with: `uname -m`)
- [ ] **Node.js**: Installed v14.0.0+ (check with: `node --version`)
- [ ] **npm**: Installed v6.0.0+ (check with: `npm --version`)
- [ ] **Disk Space**: At least 500MB free
- [ ] **RAM**: At least 512MB available
- [ ] **Internet**: Active connection for downloading dependencies

**Missing something?** Run the interactive wizard - it can auto-install missing dependencies!

---

## 🚀 Installation Options

### Option 1: Interactive Setup Wizard (RECOMMENDED)
```bash
./setup-wizard.sh
```
✅ **Best for**: First-time users  
✅ **Pros**: Guided experience, checks dependencies, shows progress  
✅ **Cons**: More steps  
⏱️ **Time**: 5-10 minutes

### Option 2: Automated Installer
```bash
./install.sh
```
✅ **Best for**: Experienced users  
✅ **Pros**: Fast, minimal prompts  
✅ **Cons**: Less guidance  
⏱️ **Time**: 5-10 minutes

### Option 3: Manual Installation
See [INSTALL.md](INSTALL.md) section 3  
✅ **Best for**: Advanced users who want control  
✅ **Pros**: Full control  
✅ **Cons**: Requires manual steps  
⏱️ **Time**: 15-20 minutes

---

## 🎯 Step-by-Step: Interactive Wizard Installation

### 1. Start the Wizard
```bash
./setup-wizard.sh
```

### 2. Follow the On-Screen Prompts
The wizard will:
- Welcome you
- Ask for installation location
- Offer optional features
- Check dependencies
- Install Node packages
- Set up the application
- Create desktop shortcuts
- Finish and show next steps

### 3. Launch When Complete
```bash
sysveiw
```

### 4. Try Your First Command
```
> help
```

That's it! You're ready to use Sysveiw.

---

## ❓ Common Questions

### Q: What if I don't have Node.js?
**A**: The installer will ask to install it automatically. Just say yes!

### Q: Where does it get installed?
**A**: In `~/.local/opt/sysveiw/` (your user's home directory)

### Q: Can I install it to a different location?
**A**: Yes! Run: `./install.sh /custom/path`

### Q: Can I uninstall it?
**A**: Yes! Run: `~/.local/opt/sysveiw/uninstall.sh`

### Q: Does it work on all Linux distributions?
**A**: Yes! It works on Ubuntu, Debian, Fedora, Arch, openSUSE, and others.

### Q: How do I update it?
**A**: Remove the old version and run the installer again. OR run `npm install` in the installation directory.

### Q: What's an AppImage?
**A**: A standalone executable that doesn't need installation. You can build one with `npm run dist` after installation.

### Q: Can I run commands without the GUI?
**A**: Yes! Use the CLI mode. See [README.md](README.md) for details.

---

## 🐛 Something Went Wrong?

### Common Issues

**Issue**: "command not found: sysveiw"
```bash
# Solution: Check if ~/.local/bin is in your PATH
echo $PATH | grep ~/.local/bin

# If not present, add to ~/.bashrc
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Issue**: "Permission denied" when running installer
```bash
# Solution: Make the script executable
chmod +x install.sh setup-wizard.sh
./setup-wizard.sh
```

**Issue**: "Cannot find electron"
```bash
# Solution: Reinstall dependencies
cd ~/.local/opt/sysveiw
npm install --production
```

**Issue**: Not enough disk space
```bash
# Solution: Check available space
df -h ~
# You need at least 500MB

# Or skip node_modules: see INSTALL.md manual method
```

### Need More Help?
1. **Check**: [INSTALL.md](INSTALL.md) - Troubleshooting section
2. **Read**: [CHECKLIST.md](CHECKLIST.md) - Pre-installation requirements
3. **Contact**: error40404.github@gmail.com
4. **Report**: GitHub issues at Harinarayanan-TR/sysveiw

---

## 📱 System Information Commands

Once installed, check your system:

```
sys.cpu           # Processor information
sys.ram           # Memory/RAM usage
sys.ssd           # Disk/storage information
sys.gpu           # Graphics card information
sys.os            # Operating system details
sys.processes     # Running processes
sys.users         # Active users
```

Example:
```
> sys.cpu
> sys.ram
> cmd "uname -a"
```

---

## 🎨 Terminal Interface

When Sysveiw launches, you'll see:
- **Green text** on black background (retro terminal style)
- **`> ` prompt** ready for commands
- **Type commands** and press Enter
- **Results displayed** as formatted output

```
> help
[list of all available commands]

> sys.cpu
[CPU information in table format]

> cmd "whoami"
[your username printed]
```

---

## 🔄 What's Next?

### Immediate (After Installation)
1. ✅ Launch: `sysveiw`
2. ✅ Try: `help`
3. ✅ Explore: `sys.cpu`, `sys.ram`, etc.

### Short Term
1. 📖 Read: [README.md](README.md) for all commands
2. 🧪 Test: Each command type
3. 💻 Try: Shell routing with `cmd "ls -la"`

### Medium Term
1. 📦 Build: `npm run dist` for AppImage
2. 🛠️ Customize: Add custom commands
3. 📤 Share: Distribute AppImage to others

### Long Term
1. 🔍 Monitor: Use for system monitoring
2. 🚀 Develop: Use dev.init for projects
3. 🌐 Manage: Handle servers with server.* commands

---

## 📊 Installation Checklist

- [ ] Read this START_HERE.md
- [ ] Verify system with CHECKLIST.md
- [ ] Run `./setup-wizard.sh`
- [ ] Installation completes successfully
- [ ] Launch with `sysveiw`
- [ ] Type `help` to see commands
- [ ] Try a few system info commands
- [ ] Read README.md for detailed usage
- [ ] Build AppImage (optional)

---

## 💡 Pro Tips

1. **Add alias** for faster launch:
   ```bash
   echo "alias sysview='sysveiw'" >> ~/.bashrc
   source ~/.bashrc
   # Then just type: sysview
   ```

2. **Create keyboard shortcut** (desktop environment specific):
   - GNOME: Settings → Keyboard → Shortcuts
   - KDE: Settings → Keyboard Shortcuts
   - Others: Check your DE documentation

3. **Build AppImage** for portable version:
   ```bash
   cd ~/.local/opt/sysveiw
   npm run dist
   # Shareable executable in dist/
   ```

4. **Use in scripts**:
   ```bash
   sysveiw << EOF
   sys.cpu
   sys.ram
   EOF
   ```

5. **Run specific command from CLI**:
   ```bash
   echo "sys.cpu" | ~/.local/opt/sysveiw/cli.js
   ```

---

## 📞 Getting Help

**Resources**:
- 📖 [README.md](README.md) - Complete documentation
- 🛠️ [INSTALL.md](INSTALL.md) - Installation help
- ✅ [CHECKLIST.md](CHECKLIST.md) - Verify system
- 📋 [PROJECT_MANIFEST.md](PROJECT_MANIFEST.md) - Technical details
- 📊 [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - What's included

**Contact**:
- 📧 Email: error40404.github@gmail.com
- 🐙 GitHub: https://github.com/Harinarayanan-TR/sysveiw
- 🐛 Issues: GitHub issues page

---

## 🎉 Ready?

You have everything you need! Here's the quickest path:

1. Run: `./setup-wizard.sh`
2. Follow prompts (installer auto-handles everything)
3. Launch: `sysveiw`
4. Type: `help`
5. Explore!

**Questions?** Check the relevant guide above.  
**Issues?** See troubleshooting section.  
**Ready to start?** Run the installer now! 🚀

---

## 📝 Document Guide

```
START_HERE.md ← You are here
    ↓
CHECKLIST.md (verify system ready)
    ↓
setup-wizard.sh OR install.sh (choose installer)
    ↓
Application installed! → README.md (how to use)
    ↓
INSTALL.md (if you have issues)
    ↓
PROJECT_MANIFEST.md (if you're curious about structure)
```

---

**🎯 NEXT STEP**: Run `./setup-wizard.sh` to begin installation!

**Questions?** Refer to the guides above or contact error40404.github@gmail.com

**Version**: Sysveiw v1.1.2 Pro-Legacy Linux Edition  
**Status**: Ready for Installation  
**Created**: May 10, 2026
