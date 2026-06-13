function start(auto) {
    document.body.innerHTML = "KERNEL PANIC\n";

    let t = 0;

    const i = setInterval(() => {
        t++;
        document.body.innerHTML += `FAIL ${t}\n`;

        if (auto && t > 30) {
            clearInterval(i);
            location.reload();
        }
    }, 1000);
}

module.exports = { start };
