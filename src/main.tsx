import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeTheme } from "./context/ThemeContext";

// Initialize theme before React renders to prevent flash
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
