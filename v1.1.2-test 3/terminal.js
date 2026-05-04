import React, { useState } from "react";
import commands from "./commands";

export default function Terminal() {
  const [lines, setLines] = useState([]);

  async function handleCommand(cmd) {
    const result = await commands.run(cmd);
    setLines(prev => [...prev, { cmd, result }]);
  }

  return (
    <div className="terminal">
      {lines.map((line, i) => (
        <div key={i} className="output-line">
          <span className="prompt">PS C:\Sysveiw&gt; </span>
          <span>{line.cmd}</span>
          <div>{line.result}</div>
        </div>
      ))}
      <Prompt onSubmit={handleCommand} />
    </div>
  );
}

function Prompt({ onSubmit }) {
  const [text, setText] = useState("");

  async function handleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = text.trim();
      setText("");
      await onSubmit(cmd);
    }
  }

  return (
    <div className="prompt-line">
      <span className="prompt">PS C:\Sysveiw&gt; </span>
      <span
        className="cmd-input"
        contentEditable
        suppressContentEditableWarning
        onInput={e => setText(e.currentTarget.textContent)}
        onKeyDown={handleKey}
      />
    </div>
  );
}
