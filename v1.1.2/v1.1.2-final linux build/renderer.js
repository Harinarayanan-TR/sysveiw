const { ipcRenderer } = require('electron');

function newPrompt() {
  const terminal = document.getElementById("terminal");
  const line = document.createElement("div");
  line.className = "prompt-line";
  line.innerHTML = `<span style="color:#0f0;">&gt; </span><span class="input" contenteditable="true" spellcheck="false"></span>`;
  terminal.appendChild(line);

  const input = line.querySelector(".input");
  input.focus();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = input.innerText.trim();
      if (cmd) {
        input.setAttribute("contenteditable", "false");
        ipcRenderer.send("run-command", cmd);
      }
    }
  });
}

// === Boot Messages ===
ipcRenderer.on("boot-message", (event, msg) => {
  const terminal = document.getElementById("terminal");
  const line = document.createElement("div");
  line.style.color = "#0f0"; // green text for boot
  line.innerText = msg;
  terminal.appendChild(line);

  // Spawn first prompt only after boot completes
  if (msg.includes("=== Sysveiw bootup complete")) {
    newPrompt();
  }
});

// === Command Results ===
ipcRenderer.on("command-result", (event, result) => {
  const terminal = document.getElementById("terminal");
  const outputLine = document.createElement("div");

  if (result && result.error) {
    outputLine.innerHTML = `<span style="color:red;">${result.error}</span>`;
  } else if (Array.isArray(result) && result.length > 0) {
    let table = "<table border='1' style='width:100%;color:#0f0;font-family:Consolas;'>";
    table += "<tr>";
    Object.keys(result[0]).forEach(key => table += `<th>${key}</th>`);
    table += "</tr>";
    result.forEach(row => {
      table += "<tr>";
      Object.values(row).forEach(val => table += `<td>${val}</td>`);
      table += "</tr>";
    });
    table += "</table>";
    outputLine.innerHTML = table;
  } else {
    outputLine.innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
  }

  terminal.appendChild(outputLine);
  newPrompt();
});

// === Panic Overlay ===
ipcRenderer.on("panic-trigger", (event, logs) => {
  const terminal = document.getElementById("terminal");
  const overlay = document.createElement("div");
  overlay.style.cssText = "background:#1c1c1c;color:#ff4444;font-family:Consolas;position:absolute;top:0;left:0;width:100%;height:100%;padding:20px;";
  overlay.innerHTML = `
    <h1>!!! SYSVEIW PANIC SCREEN !!!</h1>
    <p>Critical error detected. Attempting recovery...</p>
    <pre>${JSON.stringify(logs, null, 2)}</pre>
    <p id="panicStatus">Restart attempts will be made every 3 seconds.</p>
  `;
  terminal.appendChild(overlay);

  let elapsed = 0;
  const interval = setInterval(() => {
    const status = document.getElementById("panicStatus");
    if (status) status.innerText = `Restart attempt at ${elapsed}s...`;
    elapsed += 3;
    if (elapsed >= 30) {
      clearInterval(interval);
      overlay.remove();
      console.log("Persistent error. Restarting Sysveiw app...");
      location.reload();
    }
  }, 3000);
});

// === Panic Demo ===
ipcRenderer.on("panic-demo", (event, data) => {
  const terminal = document.getElementById("terminal");
  const overlay = document.createElement("div");
  overlay.style.cssText = "background:#1c1c1c;color:#ff4444;font-family:Consolas;position:absolute;top:0;left:0;width:100%;height:100%;padding:20px;";
  overlay.innerHTML = `
    <h1>!!! SYSVEIW PANIC DEMO !!!</h1>
    <p>${data.msg}</p>
  `;
  terminal.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    console.log("=== PANIC DEMO COMPLETE ===");
  }, 30000);
});
