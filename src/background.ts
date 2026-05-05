import { ACTIONS, ExtensionMessage } from "./types";
import { flattenBookmarkFolders } from "./utils";

const KODA_COMMAND = "open-koda";

const getCurrentTabAndSendMessage = async (payload: ExtensionMessage) => {
	const [tab] = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});

	if (!tab || !tab.id) return;

	try {
		await chrome.tabs.sendMessage(tab.id, payload);
	} catch (error) {
		console.warn("Koda: Cannot wake up on this page (restricted URL).");
	}
};

const toggleKodaWithShortcutCheck = async () => {
	const commands = await chrome.commands.getAll();
	const kodaCmd = commands.find((c) => c.name === KODA_COMMAND);
	const isShortcutMissing = !kodaCmd || !kodaCmd.shortcut;

	getCurrentTabAndSendMessage({
		action: ACTIONS.TOGGLE_KODA,
		isShortcutMissing,
	});
};

chrome.action.onClicked.addListener(() => {
	toggleKodaWithShortcutCheck();
});

chrome.commands.onCommand.addListener((command) => {
	if (command === KODA_COMMAND) {
		toggleKodaWithShortcutCheck();
	}
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
				if (results.length === 0) {
					sendResponse({ exists: false });
					return;
				}

				const bookmark = results[0];
				const parent = await chrome.bookmarks.get(bookmark.parentId || "");

				sendResponse({
					exists: true,
					folderName: parent[0]?.title || "Bookmarks Bar",
					title: bookmark.title,
					id: bookmark.id,
				});
			});
			return true;
		}

		if (message.action === ACTIONS.SAVE_BOOKMARK) {
			const { parentId, title, url, existingId } = message.payload;

			if (existingId) {
				chrome.bookmarks.update(existingId, { title, url }).then(() => {
					chrome.bookmarks
						.move(existingId, { parentId })
						.then(() => sendResponse({ success: true }));
				});
				return true;
			}

			chrome.bookmarks
				.create({ parentId, title, url })
				.then(() => sendResponse({ success: true }));
			return true;
		}

		if (message.action === ACTIONS.CREATE_FOLDER_AND_SAVE) {
			const { parentId, folderName, title, url, existingId } = message.payload;

			chrome.bookmarks
				.create({ parentId, title: folderName })
				.then((newFolder) => {
					if (existingId) {
						chrome.bookmarks.update(existingId, { title, url }).then(() => {
							chrome.bookmarks
								.move(existingId, { parentId: newFolder.id })
								.then(() => sendResponse({ success: true }));
						});
						return;
					}

					chrome.bookmarks
						.create({ parentId: newFolder.id, title, url })
						.then(() => sendResponse({ success: true }));
				});
			return true;
		}

		if (message.action === ACTIONS.DELETE_BOOKMARK) {
			chrome.bookmarks.remove(message.payload.id).then(() => {
				sendResponse({ success: true });
			});
			return true;
		}

		if (message.action === ACTIONS.OPEN_SETTINGS) {
			chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
			return true;
		}
	},
);
