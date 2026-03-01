import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import READMEForge from "./READMEForge.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <READMEForge />
  </StrictMode>
);
