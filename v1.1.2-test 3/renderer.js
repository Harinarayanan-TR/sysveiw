import React from "react";
import { createRoot } from "react-dom/client";
import Terminal from "./terminal";

async function bootSequence() {
  const boot = document.getElementById("boot");
  boot.innerText = "Launching terminal...........";
  await delay(700);

  boot.innerText += "\nConnecting to system...........";
  await window.api.runCommand("cmd echo connected");

  boot.innerText += "\nLoading commands...........";
  await delay(700);

  boot.innerText += "\n\nSYSVEIW INITIALISED\n\nv1.1.2";

  await new Promise(r => setTimeout(r, 1500));

  boot.style.display = "none";
  const root = createRoot(document.getElementById("root"));
  root.render(<Terminal />);
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

bootSequence();
