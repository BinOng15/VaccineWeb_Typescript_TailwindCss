import { createRoot } from "react-dom/client";
import { StrictMode } from "react"; // Import StrictMode
import Router from "./router/router";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
