async function scan(term) {
    for (let i = 1; i <= 200; i++) {
        const open = await window.api.scanPort(i);
        if (open) {
            const d = document.createElement("div");
            d.innerText = "OPEN: " + i;
            term.appendChild(d);
        }
    }
}

module.exports = { scan };
