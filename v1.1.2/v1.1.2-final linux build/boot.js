const hashcheck = require('./hashcheck');
const bugdetector = require('./bugdetector');
const pipelines = require('./pipelines');
const commands = require('./commands');

function announce(step) {
  console.log(step); // console
  if (pipelines && pipelines.p1 && typeof pipelines.p1.send === 'function') {
    pipelines.p1.send({type: 'boot-message', msg: step});
  }
  if (global.mainWindow && !global.mainWindow.isDestroyed()) {
    global.mainWindow.webContents.send("boot-message", step); // UI
  }
}

module.exports = {
  async startBootSequence(createWindow) {
    // Step 0: Launch UI first so renderer is ready
    announce("Launching terminal UI...");
    createWindow();

    // Now the renderer exists, so all steps will be visible in both places
    announce("=== Sysveiw v1.1.2 Boot Sequence ===");

    // Step 1: Hash check
    announce("Verifying integrity...");
    const verified = await hashcheck.verify();
    if (!verified) {
      console.error("SYSVEIW COMPROMISED. RESTARTING TERMINAL IN 3...2...1...");
      process.exit(1);
    }
    announce("Hash verified successfully.");

    // Step 2: Initialize pipelines
    announce("Initializing pipelines...");
    pipelines.init();
    announce("Pipelines P1, P2, P3 initialized.");
    announce("Pipelines ready.");

    // Step 3: Start bug detector
    announce("Activating bug detector...");
    await bugdetector.init();
    announce("Bug detector active.");

    // Step 4: Register commands
    announce("Loading commands...");
    commands.register();
    announce("Commands loaded.");

    // Final message
    announce("=== Sysveiw bootup complete. Ready for commands. ===");
  }
};
