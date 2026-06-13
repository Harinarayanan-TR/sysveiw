const input = document.getElementById("input");
const output = document.getElementById("output");

window.api.onData((data) => {
  output.textContent += data;
});

input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const cmd = input.value;
    output.textContent += `> ${cmd}\n`;

    const res = await window.api.run(cmd);
    if (res) output.textContent += res;

    input.value = "";
  }
});

// SHORTCUTS
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "l") output.textContent = "";
  if (e.ctrlKey && e.key === "u") window.api.run("app.update");
});
