import React from "react";
import { ACTIONS, ExtensionMessage, FolderItem } from "../types";
import { PageContextChip } from "./PageContextChip";

export const KodaUI = () => {
	const [showKodaBookmarks, setShowKodaBookmarks] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [folders, setFolders] = React.useState<FolderItem[]>([]);

	React.useEffect(() => {
		const messageListener = (message: ExtensionMessage) => {
			if (message.action === ACTIONS.TOGGLE_KODA) {
				setShowKodaBookmarks((prevState) => !prevState);
			}
		};
		chrome.runtime.onMessage.addListener(messageListener);
		return () => chrome.runtime.onMessage.removeListener(messageListener);
	}, []);

	React.useEffect(() => {
		if (!showKodaBookmarks) {
			return;
		}
		const fetchFolders = async () => {
			const response = await chrome.runtime.sendMessage({
				action: ACTIONS.GET_BOOKMARKS_FOLDERS,
			});
			setFolders(response);
		};
		fetchFolders();
	}, [showKodaBookmarks]);

	if (!showKodaBookmarks) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[9999] flex flex-col items-center pt-[15vh] bg-surface-container-lowest/40 backdrop-blur-md">
			<PageContextChip />

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
