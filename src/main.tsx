import React from "react";
import ReactDOM from "react-dom/client";
import { KodaUI } from "./components/KodaUI";

// The ?inline suffix tells Vite to process the CSS (Tailwind)
// and return it as a raw string instead of injecting it into the page <head>
import tailwindStyles from "./index.css?inline";

const host = document.createElement("div");
host.id = "koda-extension-host";

// For sites like YouTube
host.style.position = "fixed";
host.style.inset = "0";
host.style.zIndex = "2147483647"; // Max z-index
host.style.pointerEvents = "none"; // Allows clicking through the host while Koda is hidden

// FIX: Force the base font size to 16px. This prevents sites like YouTube
// (which change the root font size to 10px) from shrinking Tailwind's 'rem' units.
host.style.fontSize = "16px";

// Prevent keystrokes from leaking to the underlying page (Fixes GitHub/Twitter hotkeys)
host.addEventListener("keydown", (e) => e.stopPropagation());
host.addEventListener("keyup", (e) => e.stopPropagation());
host.addEventListener("keypress", (e) => e.stopPropagation());

document.body.appendChild(host);

// Create a Shadow DOM host element
const shadowRoot = host.attachShadow({ mode: "open" });

// Inject our compiled Tailwind CSS securely inside the Shadow DOM
const styleElement = document.createElement("style");
styleElement.textContent = tailwindStyles;
shadowRoot.appendChild(styleElement);

// Create the root element for React *inside* the Shadow DOM
const rootElement = document.createElement("div");
rootElement.id = "koda-extension-root";
shadowRoot.appendChild(rootElement);

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<KodaUI />
	</React.StrictMode>,
);
