import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { KodaUI } from "./components/KodaUI";

const rootElement = document.createElement("div");
rootElement.id = "koda-bookmarks-extension-root";
document.body.appendChild(rootElement);

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<KodaUI />
	</React.StrictMode>,
);
