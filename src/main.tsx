import React from "react";
import ReactDOM from "react-dom/client";
import { KodaUI } from "./components/KodaUI";

// The ?inline suffix tells Vite to process the CSS (Tailwind)
// and return it as a raw string instead of injecting it into the page <head>
import tailwindStyles from "./index.css?inline";

const host = document.createElement("div");
host.id = "koda-extension-host";
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
