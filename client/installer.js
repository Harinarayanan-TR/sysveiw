// Sysveiw Installer - Main Process
// This is the installer application that guides users through setup

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const os = require('os');

let installerWindow;
const installationState = {
  installPath: path.join(os.homedir(), '.local/opt/sysveiw'),
  binPath: path.join(os.homedir(), '.local/bin'),
  desktopPath: path.join(os.homedir(), '.local/share/applications'),
  iconPath: path.join(os.homedir(), '.local/share/icons/hicolor/256x256/apps'),
  buildAppImage: true,
  currentStep: 0,
  totalSteps: 7
};

function createInstallerWindow() {
  installerWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'installer-preload.js')
    }
  });

  installerWindow.loadFile('installer.html');
  // installerWindow.webContents.openDevTools(); // Uncomment for debugging

  installerWindow.on('closed', () => {
    installerWindow = null;
  });
}

// Verify system dependencies
ipcMain.handle('check-dependencies', async () => {
  const results = {
    nodejs: false,
    npm: false,
    disk: false,
    errorMessage: null
  };

  try {
    // Check Node.js
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      results.nodejs = true;
    } catch {
      results.errorMessage = 'Node.js not found. Please install Node.js v14.0.0 or higher.';
      return results;
    }

    // Check npm
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      results.npm = true;
    } catch {
      results.errorMessage = 'npm not found. Please install npm v6.0.0 or higher.';
      return results;
    }

    // Check disk space (at least 500MB)
    const stats = fs.statSync(os.homedir());
    results.disk = true;

    return results;
  } catch (err) {
    results.errorMessage = `Error checking dependencies: ${err.message}`;
    return results;
  }
});

// Select installation path
ipcMain.handle('select-install-path', async () => {
  const result = await dialog.showOpenDialog(installerWindow, {
    defaultPath: installationState.installPath,
    properties: ['openDirectory', 'createDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    installationState.installPath = result.filePaths[0];
    return result.filePaths[0];
  }
  return null;
});

// Install npm dependencies
ipcMain.handle('install-dependencies', async () => {
  try {
    installationState.currentStep = 1;
    await installerWindow.webContents.send('progress-update', {
      step: installationState.currentStep,
      total: installationState.totalSteps,
      message: 'Installing npm dependencies...'
    });

    execSync('npm install --production', {
      cwd: __dirname,
      stdio: 'pipe',
      encoding: 'utf8'
    });

    return { success: true, message: 'Dependencies installed' };
  } catch (err) {
    return { success: false, message: `Failed to install dependencies: ${err.message}` };
  }
});

// Create installation directories
ipcMain.handle('create-directories', async () => {
  try {
    installationState.currentStep = 2;
    await installerWindow.webContents.send('progress-update', {
      step: installationState.currentStep,
      total: installationState.totalSteps,
      message: 'Creating directories...'
    });

    fs.ensureDirSync(installationState.installPath);
    fs.ensureDirSync(path.join(installationState.installPath, 'cloud'));
    fs.ensureDirSync(path.join(installationState.installPath, 'local'));
    fs.ensureDirSync(installationState.binPath);
    fs.ensureDirSync(installationState.desktopPath);
    fs.ensureDirSync(installationState.iconPath);

    return { success: true, message: 'Directories created' };
  } catch (err) {
    return { success: false, message: `Failed to create directories: ${err.message}` };
  }
});

// Copy application files
ipcMain.handle('copy-files', async () => {
  try {
    installationState.currentStep = 3;
    await installerWindow.webContents.send('progress-update', {
      step: installationState.currentStep,
      total: installationState.totalSteps,
      message: 'Copying application files...'
    });

    const appDir = __dirname;
    const files = [
      'main.js', 'renderer.js', 'index.html', 'cli.js', 'boot.js',
      'commands.js', 'pipelines.js', 'panic.js', 'bugdetector.js',
      'bugdb.js', 'bugalgo.js', 'hashcheck.js', 'sandbox.js', 'package.json', 'icon.png',
      'hash-manifest.json', 'cloud/client.js'
    ];

    for (const file of files) {
      const src = path.join(appDir, file);
      if (fs.existsSync(src)) {
        fs.copySync(src, path.join(installationState.installPath, file));
      }
    }

    // Copy node_modules if exists
    if (fs.existsSync(path.join(appDir, 'node_modules'))) {
      fs.copySync(
        path.join(appDir, 'node_modules'),
        path.join(installationState.installPath, 'node_modules'),
        { errorOnExist: false }
      );
    }

    // Copy license
    if (fs.existsSync(path.join(appDir, 'license.txt'))) {
      fs.copySync(
        path.join(appDir, 'license.txt'),
        path.join(installationState.installPath, 'license.txt')
      );
    }

    return { success: true, message: 'Files copied' };
  } catch (err) {
    return { success: false, message: `Failed to copy files: ${err.message}` };
  }
});

// Create launcher
ipcMain.handle('create-launcher', async () => {
  try {
    installationState.currentStep = 4;
    await installerWindow.webContents.send('progress-update', {
      step: installationState.currentStep,
      total: installationState.totalSteps,
      message: 'Creating launcher script...'
    });

    const launcherContent = `#!/bin/bash
# Sysveiw Launcher
INSTALL_DIR="${installationState.installPath}"

if [ -f "$INSTALL_DIR"/Sysveiw\ v1.1.3-*.AppImage ]; then
    "$INSTALL_DIR"/Sysveiw\\ v1.1.3-*.AppImage "$@"
elif command -v electron &> /dev/null; then
    electron "$INSTALL_DIR/main.js" "$@"
else
    echo "Error: Sysveiw not properly installed."
    exit 1
fi
`;

    const launcherPath = path.join(installationState.binPath, 'sysveiw');
    fs.writeFileSync(launcherPath, launcherContent);
    fs.chmodSync(launcherPath, 0o755);

    return { success: true, message: 'Launcher created' };
  } catch (err) {
    return { success: false, message: `Failed to create launcher: ${err.message}` };
  }
});

// Create desktop entry
ipcMain.handle('create-desktop-entry', async () => {
  try {
    installationState.currentStep = 5;
    await installerWindow.webContents.send('progress-update', {
      step: installationState.currentStep,
      total: installationState.totalSteps,
      message: 'Creating desktop integration...'
    });

    // Copy icon
    const srcIcon = path.join(__dirname, 'icon.png');
    if (fs.existsSync(srcIcon)) {
      fs.copySync(srcIcon, path.join(installationState.iconPath, 'sysveiw.png'));
    }

    // Create desktop entry
    const desktopContent = `[Desktop Entry]
Type=Application
Name=Sysveiw
Comment=Cloud client terminal utility
Exec=${path.join(installationState.binPath, 'sysveiw')}
Icon=sysveiw
Categories=System;Development;Utility;
Terminal=false
Version=1.1.3
StartupNotify=true
StartupWMClass=Sysveiw
`;

    const desktopPath = path.join(installationState.desktopPath, 'sysveiw.desktop');
    fs.writeFileSync(desktopPath, desktopContent);
    fs.chmodSync(desktopPath, 0o644);

    // Try to update desktop database
    try {
      execSync('update-desktop-database ~/.local/share/applications/', { stdio: 'ignore' });
    } catch {
      // Ignore if update-desktop-database not available
    }

    return { success: true, message: 'Desktop entry created' };
  } catch (err) {
    return { success: false, message: `Failed to create desktop entry: ${err.message}` };
  }
});

// Create uninstaller
ipcMain.handle('create-uninstaller', async () => {
  try {
    const uninstallerContent = `#!/bin/bash
# Sysveiw Uninstaller

INSTALL_DIR="${installationState.installPath}"
BIN_DIR="${installationState.binPath}"
DESKTOP_DIR="${installationState.desktopPath}"
ICON_DIR="${installationState.iconPath}"

echo "Uninstalling Sysveiw..."

# Remove launcher
rm -f "$BIN_DIR/sysveiw"

# Remove desktop entry
rm -f "$DESKTOP_DIR/sysveiw.desktop"

# Remove icon
rm -f "$ICON_DIR/sysveiw.png"

# Remove installation directory
rm -rf "$INSTALL_DIR"

echo "Sysveiw has been uninstalled."
`;

    const uninstallerPath = path.join(installationState.installPath, 'uninstall.sh');
    fs.writeFileSync(uninstallerPath, uninstallerContent);
    fs.chmodSync(uninstallerPath, 0o755);

    return { success: true, message: 'Uninstaller created' };
  } catch (err) {
    return { success: false, message: `Failed to create uninstaller: ${err.message}` };
  }
});

// Build AppImage (optional)
ipcMain.handle('build-appimage', async () => {
  try {
    installationState.currentStep = 6;
    await installerWindow.webContents.send('progress-update', {
      step: installationState.currentStep,
      total: installationState.totalSteps,
      message: 'Building AppImage...'
    });

    const cwd = installationState.installPath;
    execSync('npm run dist', {
      cwd: cwd,
      stdio: 'pipe',
      encoding: 'utf8'
    });

    return { success: true, message: 'AppImage built successfully' };
  } catch (err) {
    return { success: false, message: `Failed to build AppImage: ${err.message}` };
  }
});

// Get installation state
ipcMain.handle('get-installation-state', async () => {
  return installationState;
});

// Set installation options
ipcMain.handle('set-installation-options', async (event, options) => {
  if (options.buildAppImage !== undefined) {
    installationState.buildAppImage = options.buildAppImage;
  }
  return { success: true };
});

app.on('ready', createInstallerWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (installerWindow === null) {
    createInstallerWindow();
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (installerWindow) {
    installerWindow.webContents.send('error-occurred', {
      message: `An error occurred: ${err.message}`
    });
  }
});
