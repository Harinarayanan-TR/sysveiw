const system = require('./system');
const native = require('./native');
const info = require('./info');
const updater = require('./updater');
const diagnostics = require('./diagnostics');
const recommender = require('./recommender');

const commands = {
  help: () => console.log(Object.keys(commands).join(", ")),
  "native.help": native.help,
  "sysveiw-info": info.info,
  "sysveiw.dev": info.dev,
  update: updater.update,
  "test.hardware": diagnostics.hardware,
  "test.software": diagnostics.software,
  "which.software": recommender.whichSoftware,
  ...system,
  ...native
};

async function runCommand(cmd) {
  const [command, ...args] = cmd.split(" ");
  if (commands[command]) {
    await commands[command](args.join(" "));
  } else {
    console.log(`Unknown command: ${command}`);
  }
}

module.exports = { runCommand };
