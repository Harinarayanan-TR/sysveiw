#!/bin/bash

# Sysveiw v1.1.3 Linux Installer
# This script sets up Sysveiw with all dependencies and creates system integration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="sysveiw"
APP_VERSION="1.1.3"
INSTALL_DIR="${1:-$HOME/.local/opt/sysveiw}"
BIN_DIR="${HOME}/.local/bin"
DESKTOP_DIR="${HOME}/.local/share/applications"
ICON_DIR="${HOME}/.local/share/icons/hicolor/256x256/apps"

# Track installation steps for rollback
INSTALLED_STEPS=()

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Rollback on failure
rollback() {
    print_error "Installation failed. Rolling back changes..."

    for step in "${INSTALLED_STEPS[@]}"; do
        case "$step" in
            launcher)
                rm -f "$BIN_DIR/sysveiw"
                print_status "Removed launcher"
                ;;
            desktop)
                rm -f "$DESKTOP_DIR/sysveiw.desktop"
                rm -f "$ICON_DIR/sysveiw.png"
                print_status "Removed desktop entry and icon"
                ;;
            install_dir)
                rm -rf "$INSTALL_DIR"
                print_status "Removed installation directory"
                ;;
        esac
    done

    print_error "Rollback complete. Installation was not successful."
    exit 1
}

# Trap unexpected errors
trap 'rollback' ERR

# Check for required dependencies
check_dependencies() {
    print_status "Checking system dependencies..."

    local missing_deps=()

    # Check for Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("nodejs")
    else
        local node_version
        node_version=$(node -v)
        print_success "Node.js installed: $node_version"

        # Warn if Node.js version is too old (require >= 14)
        local node_major
        node_major=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
        if [ "$node_major" -lt 14 ]; then
            print_warning "Node.js $node_version may be too old. Version 14 or higher is recommended."
        fi
    fi

    # Check for npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    else
        local npm_version
        npm_version=$(npm -v)
        print_success "npm installed: v$npm_version"
    fi

    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Attempting to install missing dependencies..."

        if command -v apt-get &> /dev/null; then
            sudo apt-get update -qq
            sudo apt-get install -y nodejs npm
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y nodejs npm
        elif command -v pacman &> /dev/null; then
            sudo pacman -S --noconfirm nodejs npm
        elif command -v zypper &> /dev/null; then
            sudo zypper install -y nodejs npm
        else
            print_error "Could not automatically install dependencies."
            print_error "Please install 'nodejs' and 'npm' manually, then re-run this installer."
            return 1
        fi
    fi

    # Verify electron is available or will be pulled in via npm install
    if npm list electron --prefix "$SCRIPT_DIR" &> /dev/null 2>&1; then
        print_success "Electron is available in project"
    else
        print_warning "Electron not found yet — it will be installed via npm"
    fi

    print_success "All system dependencies satisfied"
    return 0
}

# Verify required source files exist before copying
check_source_files() {
    print_status "Verifying source files..."

    local required_files=(
        "package.json"
        "main.js"
        "renderer.js"
        "index.html"
        "boot.js"
        "commands.js"
        "cloud/client.js"
        "pipelines.js"
        "panic.js"
        "bugdetector.js"
        "bugdb.js"
        "bugalgo.js"
        "hashcheck.js"
        "sandbox.js"
        "hash-manifest.json"
        "cli.js"
        "license.txt"
        "icon.png"
    )

    local missing_files=()

    for f in "${required_files[@]}"; do
        if [ ! -f "$SCRIPT_DIR/$f" ]; then
            missing_files+=("$f")
        fi
    done

    if [ ${#missing_files[@]} -gt 0 ]; then
        print_error "The following required source files are missing:"
        for f in "${missing_files[@]}"; do
            echo "    - $f"
        done
        print_error "Please ensure you are running the installer from the Sysveiw source directory."
        return 1
    fi

    print_success "All source files present"
    return 0
}

# Install Node modules
install_dependencies() {
    print_status "Installing Node.js dependencies..."

    cd "$SCRIPT_DIR"

    if [ -d "node_modules" ]; then
        print_warning "node_modules directory exists — updating packages..."
    fi

    npm install --production 2>&1 | tail -5 || {
        print_error "Failed to install npm dependencies"
        return 1
    }

    print_success "Node.js dependencies installed"
    return 0
}

# Build the Electron app
build_app() {
    print_status "Building Electron application (AppImage)..."

    cd "$SCRIPT_DIR"

    # Correctly detect electron-builder
    if npx electron-builder --version &> /dev/null 2>&1 || \
       node_modules/.bin/electron-builder --version &> /dev/null 2>&1; then
        npm run dist || {
            print_error "Failed to build application"
            return 1
        }
        print_success "Application built successfully"
    else
        print_warning "electron-builder not found. Skipping AppImage build."
        print_warning "To build later: cd $INSTALL_DIR && npm install && npm run dist"
    fi

    return 0
}

# Create installation directories
create_directories() {
    print_status "Creating installation directories..."

    mkdir -p "$INSTALL_DIR"
    mkdir -p "$BIN_DIR"
    mkdir -p "$DESKTOP_DIR"
    mkdir -p "$ICON_DIR"

    INSTALLED_STEPS+=("install_dir")
    print_success "Installation directories created"
}

# Copy app files
copy_app_files() {
    print_status "Copying application files to $INSTALL_DIR..."

    local files=(
    "package.json"
    "main.js"
    "renderer.js"
    "index.html"
    "boot.js"
    "commands.js"
    "cloud/client.js"
    "pipelines.js"
    "panic.js"
    "bugdetector.js"
    "bugdb.js"
    "bugalgo.js"
    "hashcheck.js"
    "sandbox.js"
    "hash-manifest.json"
    "cli.js"
    "license.txt"
    "icon.png"
    )

    mkdir -p "$INSTALL_DIR/cloud"

    for f in "${files[@]}"; do
        local dest="$INSTALL_DIR/$f"
        local dir_part=$(dirname "$dest")
        mkdir -p "$dir_part"
        cp "$SCRIPT_DIR/$f" "$dest" || {
            print_error "Failed to copy: $f"
            return 1
        }
    done

    # Copy node_modules if present
    if [ -d "$SCRIPT_DIR/node_modules" ]; then
        print_status "Copying node_modules (this may take a moment)..."
        cp -r "$SCRIPT_DIR/node_modules" "$INSTALL_DIR/" || {
            print_warning "Could not fully copy node_modules — running npm install in install dir instead"
            cd "$INSTALL_DIR" && npm install --production 2>&1 | tail -5
        }
    else
        print_warning "node_modules not found in source dir — installing in $INSTALL_DIR..."
        cd "$INSTALL_DIR" && npm install --production 2>&1 | tail -5
    fi

    # Copy built dist artifacts if present
    if [ -d "$SCRIPT_DIR/dist" ]; then
        print_status "Found dist directory, copying built artifacts..."
        cp -r "$SCRIPT_DIR/dist/"* "$INSTALL_DIR/" || print_warning "Could not copy all dist files"
    fi

    print_success "Application files copied"
    return 0
}

# Create launcher script
create_launcher() {
    print_status "Creating launcher script..."

    local launcher_script="$BIN_DIR/sysveiw"

    cat > "$launcher_script" << EOF
#!/bin/bash
# Sysveiw Launcher — auto-generated by installer
INSTALL_DIR="${INSTALL_DIR}"

# Prefer built AppImage
APPIMAGE=\$(find "\$INSTALL_DIR" -maxdepth 1 -name "Sysveiw*.AppImage" 2>/dev/null | head -1)

if [ -n "\$APPIMAGE" ] && [ -x "\$APPIMAGE" ]; then
    exec "\$APPIMAGE" "\$@"
elif [ -f "\$INSTALL_DIR/main.js" ] && command -v electron &> /dev/null; then
    exec electron "\$INSTALL_DIR/main.js" "\$@"
elif [ -f "\$INSTALL_DIR/main.js" ] && [ -x "\$INSTALL_DIR/node_modules/.bin/electron" ]; then
    exec "\$INSTALL_DIR/node_modules/.bin/electron" "\$INSTALL_DIR/main.js" "\$@"
else
    echo "Error: Sysveiw could not be launched."
    echo "No AppImage found and no electron binary available."
    echo "Try: cd $INSTALL_DIR && npm run dist"
    exit 1
fi
EOF

    chmod +x "$launcher_script"
    INSTALLED_STEPS+=("launcher")
    print_success "Launcher script created at $launcher_script"
}

# Create desktop entry
create_desktop_entry() {
    print_status "Creating desktop entry for application menu..."

    local desktop_file="$DESKTOP_DIR/sysveiw.desktop"
    local icon_path="$ICON_DIR/sysveiw.png"

    # Copy icon (source already validated by check_source_files)
    cp "$SCRIPT_DIR/icon.png" "$icon_path" || {
        print_warning "Could not install icon — desktop entry will use fallback icon"
    }

    cat > "$desktop_file" << EOF
[Desktop Entry]
Type=Application
Name=Sysveiw
GenericName=System Utility
Comment=Pro-Legacy CLI System Utility
Exec=$BIN_DIR/sysveiw
Icon=$icon_path
Categories=System;Development;Utility;
Terminal=false
Version=1.0
StartupNotify=true
StartupWMClass=Sysveiw
Keywords=system;monitor;cli;legacy;utility;
EOF

    chmod 644 "$desktop_file"
    INSTALLED_STEPS+=("desktop")
    print_success "Desktop entry created"

    # Update desktop database if available
    if command -v update-desktop-database &> /dev/null; then
        update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
    fi

    # Update icon cache if available
    if command -v gtk-update-icon-cache &> /dev/null; then
        gtk-update-icon-cache -f -t "${HOME}/.local/share/icons/hicolor" 2>/dev/null || true
    fi
}

# Ensure ~/.local/bin is on PATH
check_and_fix_path() {
    print_status "Checking PATH configuration..."

    if echo "$PATH" | grep -q "$BIN_DIR"; then
        print_success "~/.local/bin is already in PATH"
        return 0
    fi

    print_warning "~/.local/bin is not in your current PATH"

    local shell_rc=""
    if [ -n "$ZSH_VERSION" ] || [ "$(basename "$SHELL")" = "zsh" ]; then
        shell_rc="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ] || [ "$(basename "$SHELL")" = "bash" ]; then
        shell_rc="$HOME/.bashrc"
    else
        shell_rc="$HOME/.profile"
    fi

    local export_line='export PATH="$HOME/.local/bin:$PATH"'

    if ! grep -qF "$export_line" "$shell_rc" 2>/dev/null; then
        echo "" >> "$shell_rc"
        echo "# Added by Sysveiw installer" >> "$shell_rc"
        echo "$export_line" >> "$shell_rc"
        print_success "Added PATH export to $shell_rc"
        print_warning "Run 'source $shell_rc' or open a new terminal for changes to take effect"
    else
        print_success "PATH export already present in $shell_rc"
    fi
}

# Create uninstaller script
create_uninstaller() {
    print_status "Creating uninstaller script..."

    local uninstall_script="$INSTALL_DIR/uninstall.sh"

    cat > "$uninstall_script" << EOF
#!/bin/bash
# Sysveiw Uninstaller — auto-generated by installer

INSTALL_DIR="$INSTALL_DIR"
BIN_DIR="$BIN_DIR"
DESKTOP_DIR="$DESKTOP_DIR"
ICON_DIR="$ICON_DIR"

echo "Uninstalling Sysveiw v$APP_VERSION..."

rm -f "\$BIN_DIR/sysveiw"
echo "  [✓] Removed launcher"

rm -f "\$DESKTOP_DIR/sysveiw.desktop"
echo "  [✓] Removed desktop entry"

rm -f "\$ICON_DIR/sysveiw.png"
echo "  [✓] Removed icon"

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "\$DESKTOP_DIR" 2>/dev/null || true
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -f -t "\${HOME}/.local/share/icons/hicolor" 2>/dev/null || true
fi

rm -rf "\$INSTALL_DIR"
echo "  [✓] Removed installation directory"

echo ""
echo "Sysveiw has been fully uninstalled."
echo "You may also remove the PATH line from your shell config (~/.bashrc or ~/.zshrc) if desired."
EOF

    chmod +x "$uninstall_script"
    print_success "Uninstaller created at $uninstall_script"
}

# Print installation summary
print_summary() {
    local width=58
    local line
    line=$(printf '═%.0s' $(seq 1 $width))

    echo ""
    echo -e "${BLUE}╔${line}╗${NC}"
    printf "${BLUE}║${NC}  %-${width}s${BLUE}║${NC}\n" "Sysveiw v${APP_VERSION} Installation Complete"
    echo -e "${BLUE}╠${line}╣${NC}"
    printf "${BLUE}║${NC}  %-${width}s${BLUE}║${NC}\n" "Install Dir : $INSTALL_DIR"
    printf "${BLUE}║${NC}  %-${width}s${BLUE}║${NC}\n" "Launcher    : $BIN_DIR/sysveiw"
    printf "${BLUE}║${NC}  %-${width}s${BLUE}║${NC}\n" "Desktop     : $DESKTOP_DIR/sysveiw.desktop"
    printf "${BLUE}║${NC}  %-${width}s${BLUE}║${NC}\n" "Uninstaller : $INSTALL_DIR/uninstall.sh"
    echo -e "${BLUE}╠${line}╣${NC}"
    printf "${BLUE}║${NC}  ${GREEN}%-${width}s${NC}${BLUE}║${NC}\n" "Next Steps:"
    printf "${BLUE}║${NC}  %-${width}s${BLUE}║${NC}\n" "1. Launch: sysveiw"
    printf "${BLUE}║${NC}  %-${width}s${BLUE}║${NC}\n" "2. Or open 'Sysveiw' from your application menu"
    printf "${BLUE}║${NC}  %-${width}s${BLUE}║${NC}\n" "3. Build AppImage: cd $INSTALL_DIR && npm run dist"
    printf "${BLUE}║${NC}  %-${width}s${BLUE}║${NC}\n" "4. Uninstall: $INSTALL_DIR/uninstall.sh"
    echo -e "${BLUE}╚${line}╝${NC}"
    echo ""
}

# Main installation flow
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║          Sysveiw v${APP_VERSION} Linux Installer              ║"
    echo "║    Pro-Legacy CLI System Utility for Linux               ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    check_dependencies     || exit 1
    check_source_files     || exit 1
    create_directories
    install_dependencies   || rollback
    copy_app_files         || rollback
    create_launcher
    create_desktop_entry
    check_and_fix_path
    create_uninstaller

    # Optional: Build AppImage if --build flag passed
    if [ "${2:-}" = "--build" ]; then
        build_app || print_warning "AppImage build failed, but installation is otherwise complete"
    else
        print_status "Tip: To build an AppImage, run: cd $INSTALL_DIR && npm run dist"
    fi

    # Disable the ERR trap — installation succeeded
    trap - ERR

    print_summary
    print_success "Installation complete! Run 'sysveiw' to get started."
}

# Run main
main "$@"
