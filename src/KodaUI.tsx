import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ACTIONS, ExtensionMessage } from "./types";

const KodaUI = () => {
	const [showKodaBookmarks, setShowKodaBookmarks] = React.useState(false);

	React.useEffect(() => {
		const startKodaBookmarks = (message: ExtensionMessage) => {
			if (message.action !== ACTIONS.TOGGLE_KODA) {
				return;
			}
			setShowKodaBookmarks((prevState) => !prevState);
		};
		chrome.runtime.onMessage.addListener(startKodaBookmarks);
		return () => chrome.runtime.onMessage.removeListener(startKodaBookmarks);
	}, []);

	if (!showKodaBookmarks) {
		return <></>;
	}

	return (
		<div className="fixed inset-0 z-9999 flex items-start justify-center pt-[20vh] bg-surface-container-lowest/40 backdrop-blur-md">
			{/* Main Palette Chassis */}
			<div className="w-150 bg-surface-container/80 backdrop-blur-2xl rounded-xl shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden text-on-surface">
				{/* Search Input Area */}
				<div className="p-4">
					<input
						type="text"
						placeholder="Search Koda bookmarks..."
						className="w-full bg-transparent outline-none text-xl placeholder-on-surface-variant"
					/>
				</div>
			</div>
		</div>
	);
};

// Inject React into the active tab's DOM
const rootElement = document.createElement("div");
rootElement.id = "koda-extension-root";
document.body.appendChild(rootElement);

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<KodaUI />
	</React.StrictMode>,
);
