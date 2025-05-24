import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "/imports/ui/App";
import { Meteor } from "meteor/meteor";

Meteor.startup(() => {
  const container = document.getElementById("react-target");
  if (!container) {
    throw new Error("React root container element not found.");
  }
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});

