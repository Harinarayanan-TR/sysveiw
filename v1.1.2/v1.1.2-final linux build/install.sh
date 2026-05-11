#!/bin/bash

# Sysveiw v1.1.2 — Linux Installer
# Installs the Electron GUI app and creates system integration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_VERSION="1.1.2"
INSTALL_DIR="${1:-$HOME/.local/opt/sysveiw}"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/256x256/apps"

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${BLUE}[*]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
fail() { echo -e "${RED}[✗]${NC} $1"; }

# ── Rollback ─────────────────────────────────────────────────────────────────
ROLLBACK_ITEMS=()

rollback() {
    echo ""
    fail "An error occurred. Rolling back..."
    for item in "${ROLLBACK_ITEMS[@]}"; do
        rm -rf "$item" 2>/dev/null && echo "  removed: $item"
    done
    fail "Installation failed and has been rolled back."
    exit 1
}

trap rollback ERR

# ── Step 1: System dependencies ──────────────────────────────────────────────
check_system_deps() {
    info "Checking system dependencies..."

    local missing=()
    command -v node &>/dev/null || missing+=("nodejs")
    command -v npm  &>/dev/null || missing+=("npm")

    if [ ${#missing[@]} -gt 0 ]; then
        warn "Missing: ${missing[*]} — attempting to install..."
        if   command -v apt-get &>/dev/null; then
            sudo apt-get update -qq && sudo apt-get install -y nodejs npm
        elif command -v dnf     &>/dev/null; then
            sudo dnf install -y nodejs npm
        elif command -v pacman  &>/dev/null; then
            sudo pacman -S --noconfirm nodejs npm
        elif command -v zypper  &>/dev/null; then
            sudo zypper install -y nodejs npm
        else
            fail "Cannot auto-install Node.js. Install nodejs + npm manually then re-run."
            exit 1
        fi
    fi

    local node_major
    node_major=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
    if [ "$node_major" -lt 14 ]; then
        warn "Node.js $(node -v) is older than v14 — upgrade recommended for Electron."
    fi

    ok "Node.js $(node -v)"
    ok "npm v$(npm -v)"
}

# ── Step 2: Verify all source files are present ───────────────────────────────
check_source_files() {
    info "Verifying source files..."

    # Every file that must exist in the source directory
    local required=(
        "boot.js"
        "bugalgo.js"
        "bugdb.js"
        "bugdetector.js"
        "cli.js"
        "commands.js"
        "hashcheck.js"
        "icon.png"
        "index.html"
        "installer.js"
        "license.txt"
        "main.js"
        "package.json"
        "panic.js"
        "pipelines.js"
        "renderer.js"
    )

    local missing=()
    for f in "${required[@]}"; do
        [ -f "$SCRIPT_DIR/$f" ] || missing+=("$f")
    done

    if [ ${#missing[@]} -gt 0 ]; then
        fail "Missing required source files — run installer from the Sysveiw folder:"
        for f in "${missing[@]}"; do
            echo "    • $f"
        done
        exit 1
    fi

    ok "All source files present"
}

# ── Step 3: Create directories ────────────────────────────────────────────────
create_dirs() {
    info "Creating installation directories..."
    mkdir -p "$INSTALL_DIR" "$BIN_DIR" "$DESKTOP_DIR" "$ICON_DIR"
    ROLLBACK_ITEMS+=("$INSTALL_DIR")
    ok "Directories ready"
}

# ── Step 4: Copy application files ───────────────────────────────────────────
copy_files() {
    info "Copying application files to $INSTALL_DIR..."

    # All source files to copy (docs/md files excluded — not needed at runtime)
    local files=(
        "boot.js"
        "bugalgo.js"
        "bugdb.js"
        "bugdetector.js"
        "cli.js"
        "commands.js"
        "hashcheck.js"
        "icon.png"
        "icon.ico"
        "index.html"
        "installer.js"
        "license.txt"
        "main.js"
        "package.json"
        "package-lock.json"
        "panic.js"
        "pipelines.js"
        "renderer.js"
    )

    for f in "${files[@]}"; do
        # icon.ico is optional — skip if missing without failing
        if [ "$f" = "icon.ico" ] && [ ! -f "$SCRIPT_DIR/$f" ]; then
            continue
        fi
        cp "$SCRIPT_DIR/$f" "$INSTALL_DIR/" || {
            fail "Failed to copy: $f"
            exit 1
        }
    done

    ok "Application files copied"
}

# ── Step 5: Install npm dependencies + ensure Electron is present ─────────────
install_npm_deps() {
    info "Installing npm dependencies (including Electron)..."
    cd "$INSTALL_DIR"

    # Install everything — dev deps included so electron is always pulled in
    npm install 2>&1 | grep -E "^(added|warn|npm ERR)" || true

    # Confirm electron binary is actually there
    local electron_bin="$INSTALL_DIR/node_modules/.bin/electron"

    if [ ! -x "$electron_bin" ]; then
        warn "Electron not found after npm install — installing it explicitly..."
        npm install --save-dev electron 2>&1 | grep -E "^(added|warn|npm ERR)" || true
    fi

    if [ ! -x "$electron_bin" ]; then
        fail "Electron could not be installed."
        fail "Check your internet connection, then try: cd $INSTALL_DIR && npm install"
        exit 1
    fi

    ok "Electron ready: $electron_bin"
    ok "All npm dependencies installed"
}

# ── Step 6: Create the launcher ───────────────────────────────────────────────
create_launcher() {
    info "Creating launcher..."

    # Write the launcher with INSTALL_DIR baked in at install time
    cat > "$BIN_DIR/sysveiw" << LAUNCHER
#!/bin/bash
# Sysveiw v${APP_VERSION} Launcher — generated by installer

INSTALL_DIR="${INSTALL_DIR}"
ELECTRON="\$INSTALL_DIR/node_modules/.bin/electron"
MAIN="\$INSTALL_DIR/main.js"

# Sanity check
if [ ! -f "\$MAIN" ]; then
    echo "Error: \$MAIN not found. Re-run the installer."
    exit 1
fi

# Prefer locally installed electron (always reliable)
if [ -x "\$ELECTRON" ]; then
    exec "\$ELECTRON" "\$MAIN" "\$@"

# Fall back to system electron if somehow available
elif command -v electron &>/dev/null; then
    exec electron "\$MAIN" "\$@"

# Nothing works — clear error
else
    echo "Error: Electron not found."
    echo "Fix it by running:"
    echo "  cd \$INSTALL_DIR && npm install"
    exit 1
fi
LAUNCHER

    chmod +x "$BIN_DIR/sysveiw"
    ROLLBACK_ITEMS+=("$BIN_DIR/sysveiw")
    ok "Launcher created: $BIN_DIR/sysveiw"
}

# ── Step 7: Desktop entry (app menu shortcut) ─────────────────────────────────
create_desktop_entry() {
    info "Creating desktop entry..."

    cp "$SCRIPT_DIR/icon.png" "$ICON_DIR/sysveiw.png" 2>/dev/null \
        || warn "Icon copy failed — desktop entry will show a generic icon"

    cat > "$DESKTOP_DIR/sysveiw.desktop" << DESKTOP
[Desktop Entry]
Type=Application
Name=Sysveiw
GenericName=System Utility
Comment=Pro-Legacy CLI System Utility
Exec=${BIN_DIR}/sysveiw
Icon=${ICON_DIR}/sysveiw.png
Categories=System;Development;Utility;
Terminal=false
StartupNotify=true
StartupWMClass=Sysveiw
Keywords=system;monitor;cli;utility;
DESKTOP

    chmod 644 "$DESKTOP_DIR/sysveiw.desktop"
    ROLLBACK_ITEMS+=("$DESKTOP_DIR/sysveiw.desktop" "$ICON_DIR/sysveiw.png")

    command -v update-desktop-database &>/dev/null \
        && update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
    command -v gtk-update-icon-cache &>/dev/null \
        && gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true

    ok "Desktop entry created"
}

# ── Step 8: Make sure ~/.local/bin is on PATH ─────────────────────────────────
ensure_path() {
    if echo "$PATH" | grep -q "$BIN_DIR"; then
        ok "~/.local/bin is already in PATH"
        return
    fi

    warn "~/.local/bin is not in PATH — adding it now..."

    local rc
    case "$(basename "${SHELL:-bash}")" in
        zsh)  rc="$HOME/.zshrc" ;;
        fish) rc="$HOME/.config/fish/config.fish" ;;
        *)    rc="$HOME/.bashrc" ;;
    esac

    local line='export PATH="$HOME/.local/bin:$PATH"'
    if ! grep -qF "$line" "$rc" 2>/dev/null; then
        { echo ""; echo "# Added by Sysveiw installer"; echo "$line"; } >> "$rc"
        ok "PATH export added to $rc"
        warn "Run: source $rc  (or open a new terminal) for the change to take effect"
    else
        ok "PATH line already in $rc"
    fi
}

# ── Step 9: Uninstaller ───────────────────────────────────────────────────────
create_uninstaller() {
    info "Creating uninstaller..."

    cat > "$INSTALL_DIR/uninstall.sh" << UNINSTALL
#!/bin/bash
# Sysveiw Uninstaller

echo "Uninstalling Sysveiw v${APP_VERSION}..."

rm -f  "${BIN_DIR}/sysveiw"          && echo "  [✓] Removed launcher"
rm -f  "${DESKTOP_DIR}/sysveiw.desktop" && echo "  [✓] Removed desktop entry"
rm -f  "${ICON_DIR}/sysveiw.png"     && echo "  [✓] Removed icon"

command -v update-desktop-database &>/dev/null \
    && update-desktop-database "${DESKTOP_DIR}" 2>/dev/null || true
command -v gtk-update-icon-cache &>/dev/null \
    && gtk-update-icon-cache -f -t "\$HOME/.local/share/icons/hicolor" 2>/dev/null || true

rm -rf "${INSTALL_DIR}"              && echo "  [✓] Removed install directory"

echo ""
echo "Sysveiw has been fully uninstalled."
echo "You can also remove the PATH line from ~/.bashrc or ~/.zshrc if desired."
UNINSTALL

    chmod +x "$INSTALL_DIR/uninstall.sh"
    ok "Uninstaller created: $INSTALL_DIR/uninstall.sh"
}

# ── Summary ───────────────────────────────────────────────────────────────────
print_summary() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
    printf  "${BLUE}║${NC}  %-56s${BLUE}║${NC}\n" "Sysveiw v${APP_VERSION} — Installation Complete"
    echo -e "${BLUE}╠══════════════════════════════════════════════════════════╣${NC}"
    printf  "${BLUE}║${NC}  %-56s${BLUE}║${NC}\n" "Installed to : $INSTALL_DIR"
    printf  "${BLUE}║${NC}  %-56s${BLUE}║${NC}\n" "Launcher     : $BIN_DIR/sysveiw"
    printf  "${BLUE}║${NC}  %-56s${BLUE}║${NC}\n" "Uninstaller  : $INSTALL_DIR/uninstall.sh"
    echo -e "${BLUE}╠══════════════════════════════════════════════════════════╣${NC}"
    printf  "${BLUE}║${NC}  %-56s${BLUE}║${NC}\n" "▶  Run:  sysveiw"
    printf  "${BLUE}║${NC}  %-56s${BLUE}║${NC}\n" "   Or open Sysveiw from your application menu"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║         Sysveiw v${APP_VERSION} Linux Installer               ║"
    echo "║    Pro-Legacy CLI System Utility for Linux               ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    check_system_deps
    check_source_files
    create_dirs
    copy_files
    install_npm_deps      # installs all deps + guarantees electron exists
    create_launcher
    create_desktop_entry
    ensure_path
    create_uninstaller

    # Optional AppImage build
    if [ "${2:-}" = "--build" ]; then
        info "Building AppImage..."
        cd "$INSTALL_DIR"
        npm run dist 2>&1 || warn "AppImage build failed — app still works fine via electron"
    fi

    trap - ERR  # all done, disable rollback
    print_summary
    ok "Done! Run: sysveiw"
}

main "$@"
