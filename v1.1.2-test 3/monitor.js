const os = require('os');

function load() {
    return os.loadavg();
}

module.exports = { load };
