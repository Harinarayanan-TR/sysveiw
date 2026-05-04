const fs = require("fs");

function reportBug(err) {
  fs.appendFileSync("buglog.txt", err + "\n\n");
}

module.exports = { reportBug };
