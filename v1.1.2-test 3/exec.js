async function cmd(c) {
    return await window.api.execCMD(c);
}

async function ps(c) {
    return await window.api.execPS(c);
}

module.exports = { cmd, ps };
