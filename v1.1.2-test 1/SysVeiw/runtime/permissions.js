const restricted = ["sys.kill", "fs.delete"];

function requestPermission(cmd) {
  if (!restricted.includes(cmd)) return true;
  return confirm(`Allow ${cmd}?`);
}

module.exports = { requestPermission };
