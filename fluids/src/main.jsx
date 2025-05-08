import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/global/styles/index.scss";
import App from "./App.jsx";
import ScrollingApp from "@/templates/ScrollingApp";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ScrollingApp />
  </StrictMode>
);
