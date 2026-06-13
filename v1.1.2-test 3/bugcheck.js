const panic = require('./panic');

async function run(term) {
    const res = await window.api.execCMD("sfc /scannow");

    if (res.includes("corrupt")) {
        panic.start(false);
    } else {
        const d = document.createElement("div");
        d.innerText = "No bugs found";
        term.appendChild(d);
    }
}

module.exports = { run };
