import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./flows/intro/styles.css";
import "./flows/escape-room/styles.css";
import "./worlds/adi-expedition/styles.css";

const baseUrl = import.meta.env.BASE_URL;
document.documentElement.style.setProperty(
  "--app-pointer-cursor",
  `url("${baseUrl}images/pointer.png"), auto`
);
document.documentElement.style.setProperty(
  "--adi-map-background-image",
  `url("${baseUrl}images/worlds/adi-expedition/map.png")`
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
