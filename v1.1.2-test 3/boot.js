function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function run() {
    const boot = document.getElementById("boot");

    boot.innerHTML = "SYSVEIW........\n";
    boot.innerHTML += "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
    boot.innerHTML += "v1.1.2";

    await delay(2000);

    boot.innerHTML += "\nLoading core...";
    await delay(800);

    boot.innerHTML += "\nBinding system...";
    await delay(800);

    boot.style.display = "none";
    document.getElementById("terminal").style.display = "block";
}

module.exports = { run };
