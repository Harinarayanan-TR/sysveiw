#!/bin/bash

# Sysveiw v1.1.2 — Interactive Installation Wizard

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Global state (never use $() for interactive functions) ────────────────────
INSTALL_PATH=""
FEATURES=""

# ── Helpers ───────────────────────────────────────────────────────────────────
banner() {
    clear
    echo -e "${CYAN}${BOLD}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║      🔧  SYSVEIW v1.1.2 — LINUX INSTALLATION WIZARD  🔧       ║
║                                                               ║
║              Pro-Legacy CLI System Utility                    ║
║                   For Linux Systems                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

progress() {
    # usage: progress <current> <total> <label>
    local cur=$1 total=$2 label=$3
    local width=40
    local pct=$(( cur * 100 / total ))
    local filled=$(( pct * width / 100 ))
    local empty=$(( width - filled ))

    printf "${BLUE}[${NC}"
    [ "$filled" -gt 0 ] && printf '%0.s=' $(seq 1 "$filled")
    [ "$empty"  -gt 0 ] && printf '%0.s-' $(seq 1 "$empty")
    printf "${BLUE}]${NC} %3d%% — %s\n" "$pct" "$label"
}

# ── Screen 1: Welcome ─────────────────────────────────────────────────────────
screen_welcome() {
    banner
    echo -e "${GREEN}${BOLD}Welcome to the Sysveiw Installation Wizard!${NC}"
    echo ""
    echo "This wizard will:"
    echo "  • Verify Node.js and npm are installed"
    echo "  • Copy Sysveiw to ~/.local/opt/sysveiw"
    echo "  • Install Electron and all npm dependencies"
    echo "  • Create a launcher command: sysveiw"
    echo "  • Add a desktop menu shortcut"
    echo "  • Ensure ~/.local/bin is in your PATH"
    echo ""
    read -rp "Press Enter to continue..."
}

# ── Screen 2: Install path ────────────────────────────────────────────────────
# IMPORTANT: sets global INSTALL_PATH — do NOT call inside $()
screen_select_path() {
    banner
    echo -e "${BOLD}Step 1 of 3 — Installation Location${NC}"
    echo ""

    local default="$HOME/.local/opt/sysveiw"
    echo "  Default: $default"
    echo ""
    read -rp "Use default location? (Y/n): " choice

    if [[ "$choice" =~ ^[Nn]$ ]]; then
        read -rp "Enter custom path: " custom
        if [[ -z "$custom" ]]; then
            echo -e "${YELLOW}No path entered — using default.${NC}"
            INSTALL_PATH="$default"
        else
            INSTALL_PATH="$custom"
        fi
    else
        INSTALL_PATH="$default"
    fi

    echo ""
    echo -e "${GREEN}✓ Install path:${NC} $INSTALL_PATH"
    sleep 1
}

# ── Screen 3: Feature selection ───────────────────────────────────────────────
# IMPORTANT: sets global FEATURES — do NOT call inside $()
screen_select_features() {
    banner
    echo -e "${BOLD}Step 2 of 3 — Optional Features${NC}"
    echo ""

    FEATURES=""

    read -rp "  Build AppImage after install? (y/N): " opt
    [[ "$opt" =~ ^[Yy]$ ]] && FEATURES="${FEATURES}build "

    read -rp "  Add desktop menu shortcut?   (Y/n): " opt
    [[ ! "$opt" =~ ^[Nn]$ ]] && FEATURES="${FEATURES}desktop "

    read -rp "  Add shell alias 'sysveiw'?   (Y/n): " opt
    [[ ! "$opt" =~ ^[Nn]$ ]] && FEATURES="${FEATURES}alias "

    read -rp "  Create uninstaller script?   (Y/n): " opt
    [[ ! "$opt" =~ ^[Nn]$ ]] && FEATURES="${FEATURES}uninstall "

    echo ""
    echo -e "${GREEN}✓ Features:${NC} ${FEATURES:-none}"
    sleep 1
}

# ── Screen 4: Confirm ─────────────────────────────────────────────────────────
screen_confirm() {
    banner
    echo -e "${BOLD}Step 3 of 3 — Confirm Installation${NC}"
    echo ""
    echo "  Install path : $INSTALL_PATH"
    echo "  Features     : ${FEATURES:-none}"
    echo ""
    read -rp "Proceed? (Y/n): " go
    if [[ "$go" =~ ^[Nn]$ ]]; then
        echo -e "\n${YELLOW}Installation cancelled.${NC}\n"
        exit 0
    fi
}

# ── Dependency check with progress bars ───────────────────────────────────────
screen_check_deps() {
    banner
    echo -e "${BOLD}Checking System Dependencies${NC}"
    echo ""

    # Node.js
    progress 1 4 "Node.js"
    if command -v node &>/dev/null; then
        echo -e "  ${GREEN}✓ Node.js $(node -v)${NC}"
    else
        echo -e "  ${YELLOW}⚠ Not found — installing...${NC}"
        if   command -v apt-get &>/dev/null; then sudo apt-get update -qq && sudo apt-get install -y nodejs npm
        elif command -v dnf     &>/dev/null; then sudo dnf install -y nodejs npm
        elif command -v pacman  &>/dev/null; then sudo pacman -S --noconfirm nodejs npm
        elif command -v zypper  &>/dev/null; then sudo zypper install -y nodejs npm
        else
            echo -e "  ${RED}✗ Cannot auto-install Node.js. Install it manually then re-run.${NC}"
            exit 1
        fi
        echo -e "  ${GREEN}✓ Node.js $(node -v)${NC}"
    fi
    echo ""

    # npm
    progress 2 4 "npm"
    if command -v npm &>/dev/null; then
        echo -e "  ${GREEN}✓ npm v$(npm -v)${NC}"
    else
        echo -e "  ${RED}✗ npm missing — install it manually and re-run.${NC}"
        exit 1
    fi
    echo ""

    # Electron (will be installed by npm — just inform)
    progress 3 4 "Electron"
    echo -e "  ${CYAN}ℹ Will be installed automatically via npm${NC}"
    echo ""

    # Build tools (optional)
    progress 4 4 "Build tools (optional)"
    if command -v gcc &>/dev/null; then
        echo -e "  ${GREEN}✓ Build tools available${NC}"
    else
        echo -e "  ${YELLOW}⚠ Not found — installing optional build tools...${NC}"
        if   command -v apt-get &>/dev/null; then sudo apt-get install -y build-essential &>/dev/null
        elif command -v dnf     &>/dev/null; then sudo dnf install -y make gcc gcc-c++ &>/dev/null
        elif command -v pacman  &>/dev/null; then sudo pacman -S --noconfirm base-devel &>/dev/null
        else echo -e "  ${YELLOW}  Skipped — unsupported package manager${NC}"
        fi
        echo -e "  ${GREEN}✓ Build tools ready${NC}"
    fi
    echo ""

    read -rp "Press Enter to begin installation..."
}

# ── Run install.sh ────────────────────────────────────────────────────────────
screen_run_install() {
    banner
    echo -e "${BOLD}Installing Sysveiw...${NC}"
    echo ""

    if [ ! -f "$SCRIPT_DIR/install.sh" ]; then
        echo -e "${RED}✗ install.sh not found in $SCRIPT_DIR${NC}"
        echo "  Make sure setup-wizard.sh and install.sh are in the same folder."
        exit 1
    fi

    # Run install.sh — pass install path as $1
    bash "$SCRIPT_DIR/install.sh" "$INSTALL_PATH" || {
        echo -e "${RED}✗ Installation failed. See errors above.${NC}"
        exit 1
    }

    # ── Optional: AppImage build
    if [[ "$FEATURES" == *"build"* ]]; then
        echo ""
        echo -e "${BOLD}Building AppImage...${NC}"
        cd "$INSTALL_PATH"
        npm run dist 2>&1 \
            && echo -e "${GREEN}✓ AppImage built${NC}" \
            || echo -e "${YELLOW}⚠ AppImage build failed — app still works via Electron${NC}"
    fi

    # ── Optional: shell alias
    if [[ "$FEATURES" == *"alias"* ]]; then
        echo ""
        echo -e "${BOLD}Adding shell alias...${NC}"
        local alias_line="alias sysveiw='$HOME/.local/bin/sysveiw'"
        local rc
        case "$(basename "${SHELL:-bash}")" in
            zsh)  rc="$HOME/.zshrc" ;;
            *)    rc="$HOME/.bashrc" ;;
        esac
        if ! grep -qF "$alias_line" "$rc" 2>/dev/null; then
            { echo ""; echo "# Added by Sysveiw installer"; echo "$alias_line"; } >> "$rc"
            echo -e "${GREEN}✓ Alias added to $rc${NC}"
        else
            echo -e "${CYAN}ℹ Alias already in $rc${NC}"
        fi
        echo "  Run: source $rc  (or open a new terminal)"
    fi
}

# ── Final summary ─────────────────────────────────────────────────────────────
screen_summary() {
    banner
    echo -e "${GREEN}${BOLD}✓ Sysveiw v1.1.2 Installed Successfully!${NC}"
    echo ""
    echo -e "${BOLD}How to launch:${NC}"
    echo "  • Terminal : sysveiw"
    echo "  • App menu : search for 'Sysveiw'"
    echo ""
    echo -e "${BOLD}Built-in commands (inside the app):${NC}"
    echo "  help              List all commands"
    echo "  sys.cpu           CPU information"
    echo "  sys.ram           RAM usage"
    echo "  sysveiw-info      App information"
    echo "  cmd \"<command>\"   Run any Linux command"
    echo "  dev.init <name>   Scaffold a new project"
    echo ""
    echo -e "${BOLD}Uninstall:${NC}"
    echo "  $INSTALL_PATH/uninstall.sh"
    echo ""
    echo -e "${BOLD}Support:${NC}"
    echo "  GitHub: Harinarayanan-TR/sysveiw"
    echo ""
    echo -e "${GREEN}${BOLD}Thank you for using Sysveiw!${NC}"
    echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
    screen_welcome
    screen_select_path      # sets $INSTALL_PATH
    screen_select_features  # sets $FEATURES
    screen_confirm
    screen_check_deps
    screen_run_install
    screen_summary
}

main "$@"
