# ✅ Pre-Installation Checklist - Sysveiw v1.1.2 Linux Edition

This checklist helps ensure your system is ready for Sysveiw installation.

## System Requirements Checklist

### Operating System ✓
- [ ] Running a Linux distribution (Ubuntu, Debian, Fedora, Arch, openSUSE, etc.)
- [ ] 64-bit system (x86_64 / amd64)
- [ ] Recent kernel (3.0+) preferred but any modern kernel works
- [ ] systemd-based init system (standard on most distributions)

### Hardware ✓
- [ ] At least 512MB RAM available
- [ ] At least 500MB free disk space
- [ ] x64 processor

### Software Prerequisites ✓
- [ ] **Node.js v14.0.0+** - Check: `node --version`
- [ ] **npm v6.0.0+** - Check: `npm --version`
- [ ] **Git** (optional for cloning) - Check: `git --version`
- [ ] **wget or curl** (for downloading) - Check: `which wget` or `which curl`

### Environment Setup ✓
- [ ] Internet connection available
- [ ] Sufficient permissions (sudo access may be needed for system deps)
- [ ] `~/.local/bin` directory exists or will be created
- [ ] `~/.local/share/applications` accessible
- [ ] Able to make files executable (chmod)

---

## Pre-Download Checklist

### Verify Download
- [ ] Downloaded from official GitHub repository: https://github.com/Harinarayanan-TR/sysveiw
- [ ] File integrity verified (if checksum provided)
- [ ] Archive intact and not corrupted
- [ ] All expected files present

### Directory Preparation
- [ ] Create working directory:
  ```bash
  mkdir -p ~/projects/sysveiw
  cd ~/projects/sysveiw
  ```
- [ ] Extract/clone the repository
- [ ] Verify files exist:
  ```bash
  ls -la *.sh *.js *.md package.json
  ```

---

## Dependency Installation Checklist

### System Dependencies (One of the below)

#### Ubuntu/Debian
- [ ] Run: `sudo apt-get update && sudo apt-get install -y nodejs npm`
- [ ] Verify: `node -v && npm -v`

#### Fedora/RHEL/CentOS
- [ ] Run: `sudo dnf install -y nodejs npm`
- [ ] Verify: `node -v && npm -v`

#### Arch Linux
- [ ] Run: `sudo pacman -S nodejs npm`
- [ ] Verify: `node -v && npm -v`

#### openSUSE
- [ ] Run: `sudo zypper install -y nodejs npm`
- [ ] Verify: `node -v && npm -v`

#### Manual Installation
- [ ] If auto-install fails, install from: https://nodejs.org/
- [ ] Download v14.0.0 or higher
- [ ] Add to PATH if needed

### Version Verification
```bash
node --version    # Should be v14.0.0 or higher
npm --version     # Should be v6.0.0 or higher
npm list -g       # Verify npm installation
```

---

## Pre-Installation Script Preparation

### Make Scripts Executable
```bash
cd /path/to/sysveiw
chmod +x install.sh
chmod +x setup-wizard.sh
```

### Verify Scripts
- [ ] `install.sh` exists and is executable: `ls -la install.sh`
- [ ] `setup-wizard.sh` exists and is executable: `ls -la setup-wizard.sh`
- [ ] Both scripts are readable: `file *.sh`

### Test Script Access
```bash
# Test that scripts can be run (don't execute, just test)
bash -n install.sh        # No errors = ready
bash -n setup-wizard.sh   # No errors = ready
```

---

## Path & Environment Checklist

### PATH Configuration
- [ ] Check current PATH: `echo $PATH`
- [ ] Verify `~/.local/bin` is in PATH or can be added
- [ ] If not present, prepare to add to `~/.bashrc`:
  ```bash
  export PATH="$HOME/.local/bin:$PATH"
  ```

### Shell Verification
- [ ] Identify your shell: `echo $SHELL`
- [ ] Supported shells:
  - [ ] bash (recommended)
  - [ ] zsh
  - [ ] sh (minimal)
- [ ] Unsupported: csh, tcsh (may need adaptation)

### Directory Accessibility
```bash
# Verify directories can be created
mkdir -p ~/.local/bin
mkdir -p ~/.local/opt
mkdir -p ~/.local/share/applications
mkdir -p ~/.local/share/icons/hicolor/256x256/apps
```

---

## Disk Space & Permissions Checklist

### Available Disk Space
```bash
df -h ~      # Check home directory space
du -sh ~     # Check total home directory size
```
- [ ] At least 1GB free for safe installation
- [ ] Preferred: 2GB+ free

### Write Permissions
```bash
# Test write access to required directories
touch ~/.local/bin/test 2>/dev/null && rm ~/.local/bin/test && echo "OK" || echo "NO PERMISSION"
touch ~/.local/opt/test 2>/dev/null && rm ~/.local/opt/test && echo "OK" || echo "NO PERMISSION"
```
- [ ] Can write to ~/.local/bin
- [ ] Can write to ~/.local/opt
- [ ] Can write to ~/.local/share

### Ownership Verification
```bash
ls -la ~ | grep ".local"  # Should be owned by your user
```
- [ ] All `.local` directories owned by your user (not root)

---

## Backup & Safety Checklist

### Before Installation
- [ ] If upgrading, backup existing installation:
  ```bash
  cp -r ~/.local/opt/sysveiw ~/.local/opt/sysveiw.backup
  ```
- [ ] Have uninstall command ready:
  ```bash
  ~/.local/opt/sysveiw/uninstall.sh
  ```

### System Backup
- [ ] Consider system snapshot/backup before major changes
- [ ] Have recovery plan if something goes wrong
- [ ] Know how to revert ~/.bashrc changes if needed

---

## Network & Download Checklist

### Internet Connectivity
- [ ] Stable internet connection available
- [ ] npm registry accessible: `npm ping` (should respond quickly)
- [ ] Can reach GitHub if cloning: `ping -c 1 github.com`

### Network Configuration
- [ ] No corporate firewall blocking node/npm
- [ ] No VPN issues with package downloads
- [ ] Sufficient bandwidth for ~300MB download (with dependencies)

### Download Verification
```bash
# Test downloads work
npm config get registry  # Should show npm registry
npm search express       # Quick test of npm connectivity
```

---

## Installation Method Selection

Choose your installation method:

### Method 1: Interactive Setup Wizard (Recommended)
- [ ] Best for first-time users
- [ ] Includes dependency checking
- [ ] Optional feature selection
- [ ] Progress indicators
- **Command**: `./setup-wizard.sh`

### Method 2: Automated Script
- [ ] Faster, fewer prompts
- [ ] Still installs everything needed
- [ ] Good for scripted deployments
- **Command**: `./install.sh`

### Method 3: Manual Installation
- [ ] Maximum control
- [ ] For advanced users
- [ ] See INSTALL.md Step 4 (Manual Installation)

**Selected Method**: _______________

---

## Final Pre-Installation Verification

### Complete File Inventory
```bash
ls -la | grep -E "\.js$|\.json$|\.html$|\.sh$|\.md$|\.txt$|\.png$"
```

Verify these files exist:
- [ ] main.js
- [ ] renderer.js
- [ ] cli.js
- [ ] commands.js
- [ ] boot.js
- [ ] package.json
- [ ] install.sh (executable)
- [ ] setup-wizard.sh (executable)
- [ ] INSTALL.md
- [ ] README.md
- [ ] icon.png

### Configuration Review
```bash
cat package.json | grep -A5 '"build"'
```
- [ ] Build target is "linux"
- [ ] Icon is "icon.png"
- [ ] Target is "AppImage"
- [ ] Scripts look correct

### Ready to Install?
- [ ] All system requirements met
- [ ] All files present and intact
- [ ] All scripts executable
- [ ] Internet working
- [ ] Disk space available
- [ ] Permissions verified
- [ ] Backup considered (if upgrading)

---

## Installation Execution

### Option A: Interactive Setup Wizard
```bash
./setup-wizard.sh
# Follow on-screen prompts
```

**Time**: ~5-10 minutes (includes downloads)

### Option B: Automated Installation
```bash
./install.sh
# Runs without prompts
```

**Time**: ~5-10 minutes

### Option C: Manual Installation
See INSTALL.md Section 3 for detailed manual steps

**Time**: ~15-20 minutes

---

## Post-Installation Verification

After running the installer, verify installation:

```bash
# 1. Check installation directory
ls -la ~/.local/opt/sysveiw/

# 2. Verify launcher exists
which sysveiw
ls -la ~/.local/bin/sysveiw

# 3. Check desktop entry
cat ~/.local/share/applications/sysveiw.desktop

# 4. Test launch
sysveiw &

# 5. Try a command
# In the Sysveiw terminal, type: help
```

### Troubleshooting Quick Links
See INSTALL.md "Troubleshooting" section if:
- [ ] Command not found
- [ ] Cannot find Electron
- [ ] Permission denied
- [ ] Desktop entry missing
- [ ] Out of memory

---

## Quick Start After Installation

Once installed successfully:

1. **Launch the app**:
   ```bash
   sysveiw
   ```

2. **Try basic commands**:
   ```
   help              # List all commands
   sysveiw-info      # Show app info
   sys.cpu           # Check CPU
   cmd "uname -a"    # Execute shell command
   ```

3. **Build AppImage** (optional):
   ```bash
   cd ~/.local/opt/sysveiw
   npm run dist
   # Creates standalone executable in dist/
   ```

---

## Checklist Sign-Off

| Item | Status | Date |
|------|--------|------|
| System requirements verified | ☐ | _____ |
| Dependencies installed | ☐ | _____ |
| Scripts prepared | ☐ | _____ |
| Installation method selected | ☐ | _____ |
| Ready to install | ☐ | _____ |
| Installation complete | ☐ | _____ |
| Post-install verification done | ☐ | _____ |

---

## Support Resources

If you encounter issues:

1. **Check Logs**: Look in ~/.local/opt/sysveiw/ for log files
2. **Read Documentation**: See INSTALL.md and README.md
3. **Report Issues**: GitHub issues at Harinarayanan-TR/sysveiw
4. **Contact**: error40404.github@gmail.com
LINUX VERSION WAS FULLY DRAFTED WITH AI
---

**Last Updated**: May 10, 2026  
**Version**: Sysveiw v1.1.2 Linux Edition  
**Status**: Ready for Installation

🎉 **You're ready to install Sysveiw!**
