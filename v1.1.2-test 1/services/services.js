const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");
const fetch = require("node-fetch");

const REPO = "YOUR_GITHUB_USERNAME/sysview";
const TOKEN = "YOUR_GITHUB_TOKEN";

function initUpdater() {

  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdates();

  autoUpdater.on("update-available", async () => {
    const res = await dialog.showMessageBox({
      message: "Update available. Install?",
      buttons: ["Yes", "Later"]
    });

    if (res.response === 0) autoUpdater.downloadUpdate();
  });

  autoUpdater.on("update-downloaded", () => {
    autoUpdater.quitAndInstall();
  });
}

// 🔥 AUTO ISSUE REPORT
async function report(error) {

  try {
    await fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: "POST",
      headers: {
        "Authorization": `token ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "Auto Error Report",
        body: error
      })
    });
  } catch {}
}

module.exports = { initUpdater, report };
