import { useState } from "react";

import Renderer from "./renderer";

function App() {
  const [historyInput, setHistoryInput] = useState("");
  const [sliderValue, setSliderValue] = useState(0);

  return (
    <>
      <h1>Prototype Event History Renderer</h1>
      <div>
        <div>
          <h2>Output</h2>
          <Renderer historyString={historyInput} currentEventIndex={sliderValue} />
          <label>
            History Item No.: {sliderValue}
            <input type="range" min={0} value={sliderValue} onChange={(e) => setSliderValue(Number(e.target.value))} />
          </label>
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
