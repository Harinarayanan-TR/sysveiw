#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
APPIMAGE="$DIR/dist/Sysveiw v1.1.3-1.1.3.AppImage"

if [ ! -f "$APPIMAGE" ]; then
    echo "AppImage not found at $APPIMAGE"
    echo "Run 'npm run build' first."
    exit 1
fi

export ELECTRON_DISABLE_SANDBOX=1
chmod +x "$APPIMAGE" 2>/dev/null

if command -v fuse >/dev/null 2>&1 && [ -f /usr/lib/x86_64-linux-gnu/libfuse.so.2 ] || [ -f /usr/lib/libfuse.so.2 ]; then
    exec "$APPIMAGE" "$@"
fi

if command -v fuse3 >/dev/null 2>&1 && [ -f /usr/lib/x86_64-linux-gnu/libfuse3.so.1 ] || [ -f /usr/lib/libfuse3.so.1 ]; then
    exec "$APPIMAGE" "$@"
fi

echo "FUSE not found. Extracting AppImage..."
EXTRACT_DIR="/tmp/sysveiw-extracted"
rm -rf "$EXTRACT_DIR"
"$APPIMAGE" --appimage-extract --dest "$EXTRACT_DIR" 2>/dev/null || "$APPIMAGE" --appimage-extract 2>/dev/null

if [ -d "$EXTRACT_DIR" ] && [ -f "$EXTRACT_DIR/AppRun" ]; then
    exec "$EXTRACT_DIR/AppRun" "$@"
elif [ -d "squashfs-root" ] && [ -f "squashfs-root/AppRun" ]; then
    exec "squashfs-root/AppRun" "$@"
else
    echo "Failed to extract AppImage. Install libfuse2:"
    echo "  sudo apt install libfuse2"
    exit 1
fi
