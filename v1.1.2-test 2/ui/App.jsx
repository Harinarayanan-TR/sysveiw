import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [output, setOutput] = useState("Welcome to Sysveiw v1.1.2");

  const runCommand = async (cmd) => {
    const res = await window.api.runCommand(cmd); // bridge to Node
    setOutput(res);
  };

  return (
    <div className="app">
      <h1>Sysveiw v1.1.2</h1>
      <input type="text" placeholder="Enter command..." 
             onKeyDown={(e) => e.key === 'Enter' && runCommand(e.target.value)} />
      <pre>{output}</pre>
    </div>
  );
}
