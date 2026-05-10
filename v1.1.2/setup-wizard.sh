#!/bin/bash

# Sysveiw Installation Setup Wizard
# Interactive installation with progress tracking and options

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Progress bar
show_progress() {
    local current=$1
    local total=$2
    local label=$3
    local width=40
    local percent=$((current * 100 / total))
    local filled=$((percent * width / 100))
    
    printf "${BLUE}[${NC}"
    printf "%${filled}s" | tr ' ' '='
    printf "%$((width - filled))s" | tr ' ' '-'
    printf "${BLUE}]${NC} %d%% - %s\n" "$percent" "$label"
}

# Interactive menu
show_menu() {
    clear
    echo -e "${CYAN}${BOLD}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║       🔧  SYSVEIW v1.1.2 - LINUX INSTALLATION WIZARD  🔧      ║
║                                                               ║
║              Pro-Legacy CLI System Utility                    ║
║                   For Linux Systems                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Welcome screen
welcome() {
    show_menu
    echo -e "${GREEN}Welcome to the Sysveiw Installation Wizard!${NC}\n"
    echo "This installer will:"
    echo "  • Check system dependencies (Node.js, npm)"
    echo "  • Install required packages"
    echo "  • Set up the application in ~/.local/opt/sysveiw"
    echo "  • Create desktop integration (menu shortcuts)"
    echo "  • Generate system launcher"
    echo ""
    read -p "Press Enter to continue..."
}

# Installation path selection
select_install_path() {
    show_menu
    echo -e "${BOLD}Installation Location:${NC}\n"
    
    local default_path="$HOME/.local/opt/sysveiw"
    
    echo "Default path: $default_path"
    echo ""
    read -p "Use default location? (Y/n): " -r choice
    
    if [[ $choice =~ ^[Nn]$ ]]; then
        read -p "Enter custom installation path: " custom_path
        if [[ -z "$custom_path" ]]; then
            echo "Invalid path, using default..."
            echo "$default_path"
        else
            echo "$custom_path"
        fi
    else
        echo "$default_path"
    fi
}

# Feature selection
select_features() {
    show_menu
    echo -e "${BOLD}Optional Features:${NC}\n"
    
    local features=""
    
    read -p "Build AppImage? (y/N): " -r build_appimage
    if [[ $build_appimage =~ ^[Yy]$ ]]; then
        features="${features}build "
    fi
    
    read -p "Create desktop shortcut? (Y/n): " -r create_desktop
    if [[ ! $create_desktop =~ ^[Nn]$ ]]; then
        features="${features}desktop "
    fi
    
    read -p "Create terminal alias? (Y/n): " -r create_alias
    if [[ ! $create_alias =~ ^[Nn]$ ]]; then
        features="${features}alias "
    fi
    
    read -p "Create uninstaller? (Y/n): " -r create_uninstaller
    if [[ ! $create_uninstaller =~ ^[Nn]$ ]]; then
        features="${features}uninstall "
    fi
    
    echo "$features"
}

# Check and install dependencies
check_and_install_deps() {
    show_menu
    echo -e "${BOLD}Checking System Dependencies:${NC}\n"
    
    local step=1
    
    # Node.js check
    show_progress $step 4 "Checking Node.js..."
    if command -v node &> /dev/null; then
        echo -e "${GREEN}✓ Node.js found: $(node -v)${NC}\n"
    else
        echo -e "${YELLOW}⚠ Node.js not found${NC}"
        echo "Installing Node.js..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update -qq
            sudo apt-get install -y nodejs npm > /dev/null 2>&1
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y nodejs npm > /dev/null 2>&1
        elif command -v pacman &> /dev/null; then
            sudo pacman -S --noconfirm nodejs npm > /dev/null 2>&1
        fi
        echo -e "${GREEN}✓ Node.js installed${NC}\n"
    fi
    
    step=$((step + 1))
    
    # npm check
    show_progress $step 4 "Checking npm..."
    if command -v npm &> /dev/null; then
        echo -e "${GREEN}✓ npm found: $(npm -v)${NC}\n"
    else
        echo -e "${YELLOW}⚠ npm installation required${NC}\n"
    fi
    
    step=$((step + 1))
    
    # Electron-builder check
    show_progress $step 4 "Checking electron-builder..."
    echo -e "${CYAN}Will be installed with npm dependencies${NC}\n"
    
    step=$((step + 1))
    
    # Build tools check
    show_progress $step 4 "Checking build tools..."
    if command -v gcc &> /dev/null; then
        echo -e "${GREEN}✓ Build tools available${NC}\n"
    else
        echo -e "${YELLOW}⚠ Optional: Installing build tools for better compatibility...${NC}"
        if command -v apt-get &> /dev/null; then
            sudo apt-get install -y build-essential > /dev/null 2>&1
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y make gcc g++ > /dev/null 2>&1
        fi
        echo -e "${GREEN}✓ Build tools ready${NC}\n"
    fi
}

# Install npm dependencies
install_npm_deps() {
    show_menu
    echo -e "${BOLD}Installing npm Dependencies:${NC}\n"
    
    cd "$SCRIPT_DIR"
    
    echo "This may take a few minutes..."
    echo ""
    
    npm install --production 2>&1 | while IFS= read -r line; do
        if [[ $line == *"added"* ]]; then
            echo -e "${GREEN}✓ $line${NC}"
        elif [[ $line == *"ERR!"* ]]; then
            echo -e "${RED}✗ $line${NC}"
        fi
    done
    
    echo -e "\n${GREEN}✓ Dependencies installed${NC}\n"
}

# Run the actual installer
run_installer() {
    local install_path=$1
    local features=$2
    
    show_menu
    echo -e "${BOLD}Running Installation:${NC}\n"
    
    bash "$SCRIPT_DIR/install.sh" "$install_path" || {
        echo -e "${RED}Installation failed!${NC}"
        return 1
    }
    
    # Handle optional features
    if [[ $features == *"build"* ]]; then
        echo -e "\n${BOLD}Building AppImage:${NC}"
        cd "$install_path"
        npm run dist || echo -e "${YELLOW}AppImage build skipped${NC}"
    fi
    
    if [[ $features == *"alias"* ]]; then
        echo -e "\n${BOLD}Creating terminal alias:${NC}"
        echo "alias sysveiw='~/.local/bin/sysveiw'" >> ~/.bashrc
        echo -e "${GREEN}✓ Added 'sysveiw' command to ~/.bashrc${NC}"
        echo "Run: source ~/.bashrc"
    fi
}

# Summary and completion
show_summary() {
    show_menu
    echo -e "${GREEN}${BOLD}✓ Installation Successful!${NC}\n"
    
    echo -e "${BOLD}Quick Start:${NC}"
    echo "  1. Launch the app: sysveiw"
    echo "  2. Or open it from your application menu"
    echo ""
    echo -e "${BOLD}Useful Commands:${NC}"
    echo "  sysveiw              - Start the application"
    echo "  help                 - List all available commands"
    echo "  sysveiw-info         - Show app information"
    echo "  sys.cpu              - Check CPU information"
    echo "  sys.ram              - Check RAM usage"
    echo ""
    echo -e "${YELLOW}Pro Tips:${NC}"
    echo "  • Use 'cmd \"<command>\"' to run any Linux command"
    echo "  • Use 'naitive \"<command>\"' as an alias"
    echo "  • Type 'dev.init <project>' to scaffold new projects"
    echo ""
    echo -e "${BOLD}Support & Documentation:${NC}"
    echo "  GitHub: Harinarayanan-TR/sysveiw"
    echo "  License: Custom (see license.txt)"
    echo ""
}

# Error handler
error_exit() {
    echo -e "\n${RED}${BOLD}✗ Installation Error: $1${NC}\n"
    exit 1
}

# Main wizard flow
main() {
    welcome
    
    local install_path=$(select_install_path)
    local features=$(select_features)
    
    read -p "Ready to install? (Y/n): " -r proceed
    [[ $proceed =~ ^[Nn]$ ]] && error_exit "Installation cancelled"
    
    check_and_install_deps
    install_npm_deps
    run_installer "$install_path" "$features"
    show_summary
    
    echo -e "${GREEN}${BOLD}Thank you for using Sysveiw!${NC}\n"
}

# Run wizard
main "$@"
