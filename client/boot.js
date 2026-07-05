const hashcheck = require('./hashcheck');
const bugdetector = require('./bugdetector');
const pipelines = require('./pipelines');
const commands = require('./commands');
const cloud = require('./cloud/client');

function announce(step) {
  console.log(step);
  if (pipelines && pipelines.p1 && typeof pipelines.p1.send === 'function') {
    pipelines.p1.send({ type: 'boot-message', msg: step });
  }
  if (global.mainWindow && !global.mainWindow.isDestroyed()) {
    global.mainWindow.webContents.send('boot-message', step);
  }
}

module.exports = {
  async startBootSequence(createWindow) {
    announce('Loading......');
    announce('Launching terminal UI...');
    createWindow();

    announce('=== Sysveiw v1.1.3 Cloud Client Boot Sequence ===');
    announce('Verifying integrity...');
    const verified = await hashcheck.verify();
    if (!verified) {
      announce('Integrity verification skipped or outdated manifest.');
    } else {
      announce('Hash verified successfully.');
    }

    announce('Initializing pipelines...');
    pipelines.init();
    announce('Pipelines P1, P2, P3 initialized.');

    announce('Activating local bug detector...');
    await bugdetector.init();
    announce('Bug detector active.');

    announce('Initializing cloud command interface...');
    commands.register();

    const connection = await cloud.checkConnection();
    global.cloudStatus = connection;
    if (connection.connected) {
      announce(`Cloud backend reachable at ${connection.backendUrl}`);
    } else {
      announce('COULD NOT CONNECT TO SERVER');
    }

    announce('=== Sysveiw bootup complete. Ready for commands. ===');
  }
};
