#!/bin/bash

# Sysveiw v1.1.2 Linux Installer
# This script sets up Sysveiw with all dependencies and creates system integration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="sysveiw"
APP_VERSION="1.1.2"
INSTALL_DIR="${1:-$HOME/.local/opt/sysveiw}"
BIN_DIR="${HOME}/.local/bin"
DESKTOP_DIR="${HOME}/.local/share/applications"
ICON_DIR="${HOME}/.local/share/icons/hicolor/256x256/apps"

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

# Check for required dependencies
check_dependencies() {
    print_status "Checking system dependencies..."
    
    local missing_deps=()
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("nodejs")
    else
        local node_version=$(node -v)
        print_success "Node.js installed: $node_version"
    fi
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    else
        local npm_version=$(npm -v)
        print_success "npm installed: $npm_version"
    fi
    
    # Check for electron
    if ! npm list electron &> /dev/null; then
        print_warning "Electron not found in project, will be installed via npm"
    else
        print_success "Electron is available"
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Installing missing dependencies..."
        
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y nodejs npm
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y nodejs npm
        elif command -v pacman &> /dev/null; then
            sudo pacman -S --noconfirm nodejs npm
        elif command -v zypper &> /dev/null; then
            sudo zypper install -y nodejs npm
        else
            print_error "Could not automatically install dependencies. Please install nodejs and npm manually."
            return 1
        fi
    fi
    
    print_success "All system dependencies satisfied"
    return 0
}

# Install Node modules
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    cd "$SCRIPT_DIR"
    
    if [ -d "node_modules" ]; then
        print_warning "node_modules directory exists, updating packages..."
    fi
    
    npm install --production || {
        print_error "Failed to install npm dependencies"
        return 1
    }
    
    print_success "Node.js dependencies installed"
    return 0
}

# Build the Electron app
build_app() {
    print_status "Building Electron application..."
    
    cd "$SCRIPT_DIR"
    
    if command -v electron-builder &> /dev/null || npm list electron-builder &> /dev/null; then
        npm run dist || {
            print_error "Failed to build application"
            return 1
        }
        print_success "Application built successfully"
    else
        print_warning "electron-builder not found, skipping build. Use 'npm run dist' to build AppImage."
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
    
    print_success "Installation directories created"
}

# Copy app files
copy_app_files() {
    print_status "Copying application files to $INSTALL_DIR..."
    
    # Copy package files
    cp package.json "$INSTALL_DIR/"
    cp main.js "$INSTALL_DIR/"
    cp renderer.js "$INSTALL_DIR/"
    cp index.html "$INSTALL_DIR/"
    cp boot.js "$INSTALL_DIR/"
    cp commands.js "$INSTALL_DIR/"
    cp pipelines.js "$INSTALL_DIR/"
    cp panic.js "$INSTALL_DIR/"
    cp bugdetector.js "$INSTALL_DIR/"
    cp bugdb.js "$INSTALL_DIR/"
    cp bugalgo.js "$INSTALL_DIR/"
    cp hashcheck.js "$INSTALL_DIR/"
    cp cli.js "$INSTALL_DIR/"
    cp license.txt "$INSTALL_DIR/"
    cp icon.png "$INSTALL_DIR/"
    
    # Copy node_modules if it exists
    if [ -d "node_modules" ]; then
        cp -r node_modules "$INSTALL_DIR/" 2>/dev/null || print_warning "Could not copy all node_modules"
    fi
    
    # Copy dist if it exists (built AppImage or binaries)
    if [ -d "dist" ]; then
        print_status "Found dist directory, copying built artifacts..."
        cp -r dist/* "$INSTALL_DIR/" 2>/dev/null || print_warning "Could not copy all dist files"
    fi
    
    print_success "Application files copied"
}

# Create launcher script
create_launcher() {
    print_status "Creating launcher script..."
    
    local launcher_script="$BIN_DIR/sysveiw"
    
    cat > "$launcher_script" << 'EOF'
#!/bin/bash
# Sysveiw Launcher
INSTALL_DIR="${HOME}/.local/opt/sysveiw"

# Check if built AppImage exists
if [ -f "$INSTALL_DIR/Sysveiw v1.1.2"*.AppImage ]; then
    # Run built AppImage
    "$INSTALL_DIR"/Sysveiw\ v1.1.2*.AppImage "$@"
elif [ -f "$INSTALL_DIR/main.js" ] && command -v electron &> /dev/null; then
    # Run with system electron if AppImage not built
    electron "$INSTALL_DIR/main.js" "$@"
else
    echo "Error: Sysveiw not properly installed. Please run the installer again."
    exit 1
fi
EOF
    
    chmod +x "$launcher_script"
    print_success "Launcher script created at $launcher_script"
}

# Create desktop entry
create_desktop_entry() {
    print_status "Creating desktop entry for application menu..."
    
    local desktop_file="$DESKTOP_DIR/sysveiw.desktop"
    local icon_path="$ICON_DIR/sysveiw.png"
    
    # Copy icon
    cp "$SCRIPT_DIR/icon.png" "$icon_path"
    
    cat > "$desktop_file" << EOF
[Desktop Entry]
Type=Application
Name=Sysveiw
Comment=Pro-Legacy CLI System Utility
Exec=$BIN_DIR/sysveiw
Icon=sysveiw
Categories=System;Development;Utility;
Terminal=false
Version=1.0
StartupNotify=true
StartupWMClass=Sysveiw
EOF
    
    chmod 644 "$desktop_file"
    print_success "Desktop entry created"
    
    # Update desktop database if available
    if command -v update-desktop-database &> /dev/null; then
        update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
    fi
}

# Create uninstaller script
create_uninstaller() {
    print_status "Creating uninstaller script..."
    
    local uninstall_script="$INSTALL_DIR/uninstall.sh"
    
    cat > "$uninstall_script" << EOF
#!/bin/bash
# Sysveiw Uninstaller

INSTALL_DIR="$INSTALL_DIR"
BIN_DIR="$BIN_DIR"
DESKTOP_DIR="$DESKTOP_DIR"
ICON_DIR="$ICON_DIR"

echo "Uninstalling Sysveiw..."

# Remove launcher
rm -f "\$BIN_DIR/sysveiw"

# Remove desktop entry
rm -f "\$DESKTOP_DIR/sysveiw.desktop"

# Remove icon
rm -f "\$ICON_DIR/sysveiw.png"

# Remove installation directory
rm -rf "\$INSTALL_DIR"

echo "Sysveiw has been uninstalled."
echo "To remove all remaining files, run: rm -rf ~/.local/opt/sysveiw"
EOF
    
    chmod +x "$uninstall_script"
    print_success "Uninstaller script created"
}

# Print installation summary
print_summary() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}       Sysveiw v$APP_VERSION Installation Complete    ${BLUE}║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC}  Installation Directory: $INSTALL_DIR"
    echo -e "${BLUE}║${NC}  Launcher: $BIN_DIR/sysveiw"
    echo -e "${BLUE}║${NC}  Desktop Entry: $DESKTOP_DIR/sysveiw.desktop"
    echo -e "${BLUE}║${NC}  Uninstaller: $INSTALL_DIR/uninstall.sh"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}Next Steps:${NC}"
    echo -e "${BLUE}║${NC}  1. To launch the app: sysveiw"
    echo -e "${BLUE}║${NC}  2. Or click Sysveiw in your application menu"
    echo -e "${BLUE}║${NC}  3. To build AppImage: cd $INSTALL_DIR && npm run dist"
    echo -e "${BLUE}║${NC}  4. To uninstall: $INSTALL_DIR/uninstall.sh"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC}  ${YELLOW}Important:${NC} Make sure ~/.local/bin is in your PATH"
    echo -e "${BLUE}║${NC}  Add to ~/.bashrc if needed:"
    echo -e "${BLUE}║${NC}  export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Main installation flow
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║         Sysveiw v$APP_VERSION Linux Installer        ║"
    echo "║   Pro-Legacy CLI System Utility for Linux             ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Execute installation steps
    check_dependencies || exit 1
    create_directories
    install_dependencies || exit 1
    copy_app_files || exit 1
    create_launcher
    create_desktop_entry
    create_uninstaller
    
    # Optional: Build AppImage if requested
    if [ "$2" = "--build" ]; then
        build_app || print_warning "Failed to build AppImage, but installation is complete"
    else
        print_status "To build AppImage, run: $INSTALL_DIR && npm run dist"
    fi
    
    print_summary
    print_success "Installation complete!"
}

# Run main function
main "$@"
