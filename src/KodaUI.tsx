import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ACTIONS, ExtensionMessage, FolderItem } from "./types";
import { flattenBookmarkFolders } from "./utils";

const KodaUI = () => {
	const [showKodaBookmarks, setShowKodaBookmarks] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [folders, setFolders] = React.useState<FolderItem[]>([]);

	const hasLoadedBookmarks = React.useRef(false);

	React.useEffect(() => {
		const messageListener = (message: ExtensionMessage) => {
			if (message.action !== ACTIONS.TOGGLE_KODA) {
				return;
			}
			setShowKodaBookmarks((prevState) => !prevState);
		};
		chrome.runtime.onMessage.addListener(messageListener);
		return () => {
			chrome.runtime.onMessage.removeListener(messageListener);
		};
	}, []);

	React.useEffect(() => {
		if (!showKodaBookmarks) {
			return;
		}
		const fetchBookmarks = async () => {
			const loadedBookmarks = await chrome.bookmarks.getTree();
			setFolders(flattenBookmarkFolders(loadedBookmarks));
		};
		fetchBookmarks();
	}, [showKodaBookmarks]);

	if (!showKodaBookmarks) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] bg-surface-container-lowest/40 backdrop-blur-md">
			{/* Main Palette Chassis */}
			<div className="w-[600px] bg-surface-container/80 backdrop-blur-2xl rounded-xl shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden text-on-surface">
				{/* Search Input Container */}
				<div className="p-3">
					<div className="bg-surface-container-high rounded-lg p-4 flex items-center transition-colors focus-within:bg-surface-container-highest">
						<input
							type="text"
							placeholder="Search Koda bookmarks..."
							className="w-full bg-transparent outline-none text-xl placeholder-on-surface-variant text-on-surface"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							autoFocus
						/>
					</div>
				</div>

				{/* Results will be rendered here later */}
			</div>
		</div>
	);
};

// Create a root element to inject our React application
const rootElement = document.createElement("div");
rootElement.id = "koda-extension-root";
document.body.appendChild(rootElement);

// Render the application
ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<KodaUI />
	</React.StrictMode>,
);
