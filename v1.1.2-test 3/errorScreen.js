function show() {
    document.body.innerHTML = "";
    const div = document.createElement("div");

    div.style.color = "red";
    div.style.padding = "20px";
    div.innerText = "ERROR. COULD NOT LOAD SYSVEIW.\nPLEASE RESTART THE TERMINAL.";

    document.body.appendChild(div);
}

module.exports = { show };
