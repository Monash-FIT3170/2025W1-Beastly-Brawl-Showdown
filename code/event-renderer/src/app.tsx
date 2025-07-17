import { useState } from "react";

import Renderer from "./renderer";

function App() {
  const [historyInput, setHistoryInput] = useState("");

  return (
    <>
      <h1>Prototype Event History Renderer</h1>
      <div>
        <div>
          <h2>Output</h2>
          <Renderer historyString={historyInput} />
        </div>
        <div>
          <h2>Input</h2>
          <textarea value={historyInput} onChange={(e) => setHistoryInput(e.target.value)} />
        </div>
      </div>
    </>
  );
}

export default App;
