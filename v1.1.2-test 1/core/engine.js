const { runCommand } = require("./commands");
const { requestPermission } = require("../runtime/permissions");
const { reportBug } = require("../runtime/bugreport");

function handleInput(input, stream) {
  try {
    const cmd = input.split(" ")[0];

    if (!requestPermission(cmd)) {
      return "Permission denied\n";
    }

    return runCommand(input, stream);

  } catch (err) {
    reportBug(err.stack);
    return "Error logged\n";
  }
}

module.exports = { handleInput };
