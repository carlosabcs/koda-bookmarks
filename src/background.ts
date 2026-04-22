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
			// 1. Fetch data asynchronously
			chrome.bookmarks.getTree().then((loadedBookmarks) => {
				// 2. Send the flattened array directly back to the requester
				sendResponse(flattenBookmarkFolders(loadedBookmarks));
			});
			// 3. Return true to indicate we will call sendResponse asynchronously
			return true;
		}
	},
);
