import { Meteor } from "meteor/meteor";
import React from "react";
import { createRoot } from "react-dom/client";
import { renderRoutes } from "../imports/routes";

Meteor.startup(() => {
  const rootElement = document.getElementById("react-target");
  const root = createRoot(rootElement);
  root.render(renderRoutes());
});
