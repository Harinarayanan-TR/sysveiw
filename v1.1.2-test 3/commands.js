const ports = require('./ports');
const panic = require('./panic');
const bug = require('./bugcheck');

async function run(cmd, term) {

    if (cmd === "sys.info") {
        const info = window.api.sysinfo();
        append(term, JSON.stringify(info, null, 2));
    }

    else if (cmd.startsWith("cmd ")) {
        const res = await window.api.execCMD(cmd.slice(4));
        append(term, res);
    }

    else if (cmd.startsWith("ps ")) {
        const res = await window.api.execPS(cmd.slice(3));
        append(term, res);
    }

    else if (cmd === "port.scan") {
        await ports.scan(term);
    }

    else if (cmd === "panic.test") {
        panic.start(true);
    }

    else if (cmd === "bug.check") {
        bug.run(term);
    }

    else {
        append(term, "Unknown command");
    }
}

function append(term, text) {
    const div = document.createElement("div");
    div.innerText = text;
    term.appendChild(div);
}

module.exports = { run };
