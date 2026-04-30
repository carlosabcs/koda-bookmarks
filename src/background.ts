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
					const parent = await chrome.bookmarks.get(bookmark.parentId || "");
					sendResponse({
						exists: true,
						folderName: parent[0]?.title || "Bookmarks Bar",
						title: bookmark.title,
						id: bookmark.id, // We need this ID to update/move it later
					});
					return;
				}
				sendResponse({ exists: false });
			});
			return true;
		}

		if (message.action === ACTIONS.SAVE_BOOKMARK) {
			const { parentId, title, url, existingId } = message.payload;

			if (existingId) {
				// Update title/url, then move to the new folder
				chrome.bookmarks.update(existingId, { title, url }).then(() => {
					chrome.bookmarks
						.move(existingId, { parentId })
						.then(() => sendResponse({ success: true }));
				});
				return true;
			}
			// Create entirely new bookmark
			chrome.bookmarks
				.create({ parentId, title, url })
				.then(() => sendResponse({ success: true }));
			return true;
		}

		if (message.action === ACTIONS.CREATE_FOLDER_AND_SAVE) {
			const { folderName, title, url, existingId } = message.payload;

			// Default to creating new folders in the Bookmarks Bar (id: "1")
			chrome.bookmarks
				.create({ parentId: "1", title: folderName })
				.then((newFolder) => {
					if (existingId) {
						chrome.bookmarks.update(existingId, { title, url }).then(() => {
							chrome.bookmarks
								.move(existingId, { parentId: newFolder.id })
								.then(() => sendResponse({ success: true }));
						});
						return true;
					}
					chrome.bookmarks
						.create({ parentId: newFolder.id, title, url })
						.then(() => sendResponse({ success: true }));
				});
			return true;
		}
	},
);
