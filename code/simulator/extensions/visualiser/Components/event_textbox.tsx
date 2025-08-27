import React, { useState } from "react";
import { Turn } from "@beastly-brawl-showdown/sim-core/event/Turn";

interface EventTextBoxProps {
  onEventsSubmit: (events: string) => void;
}

const EventTextBox: React.FC<EventTextBoxProps> = ({ onEventsSubmit }) => {
  const [input, setInput] = useState("");

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const parsedEvents = JSON.parse(input);
    onEventsSubmit(parsedEvents);
  } catch (error) {
    alert("Invalid JSON! Please check your input.");
  }
};
  return (
  <form
    onSubmit={handleSubmit}
    style={{
      position: "absolute",
      bottom: "50px",
      left: "20px",
    }}
  >
    <h3>Enter Battle Events</h3>
    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      rows={6}
      cols={50}
      placeholder="Type your events here..."
    />
    <br />
    <button type="submit">Load Events</button>
  </form>
  )
};

export default EventTextBox;


