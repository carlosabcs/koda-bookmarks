import { ACTIONS, ExtensionMessage } from "./types";
import { flattenBookmarkFolders } from "./utils";

const KODA_COMMAND = "open-koda";

const getCurrentTabAndSendMessage = async (payload: ExtensionMessage) => {
	const [tab] = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});

	if (!tab || !tab.id) {
		return;
	}

	try {
		await chrome.tabs.sendMessage(tab.id, payload);
	} catch (error) {
		console.warn("Koda: Cannot wake up on this page (restricted URL).");
	}
};

chrome.commands.onCommand.addListener((command) => {
	if (command !== KODA_COMMAND) {
		return;
	}
	console.log("Command detected! Waking up Koda... 🐾");
	getCurrentTabAndSendMessage({ action: ACTIONS.TOGGLE_KODA });
});

chrome.runtime.onMessage.addListener(
	(message: ExtensionMessage, sender, sendResponse) => {
		if (message.action === ACTIONS.GET_BOOKMARKS_FOLDERS) {
			chrome.bookmarks.getTree().then((loadedBookmarks) => {
				sendResponse(flattenBookmarkFolders(loadedBookmarks));
			});
			return true;
		}

		if (message.action === ACTIONS.CHECK_CURRENT_BOOKMARK) {
			chrome.bookmarks.search({ url: message.url }).then(async (results) => {
				if (results.length > 0) {
					const bookmark = results[0];
					// Get the parent folder to display where it is currently saved
					const parent = await chrome.bookmarks.get(bookmark.parentId || "");
					sendResponse({
						exists: true,
						folderName: parent[0]?.title || "Bookmarks Bar",
						title: bookmark.title,
					});
				} else {
					sendResponse({ exists: false });
				}
			});
			return true;
		}
	},
);
