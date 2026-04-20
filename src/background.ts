import { ACTIONS } from "./types";

const KODA_COMMAND = "open-koda";

chrome.commands.onCommand.addListener(async (command) => {
	if (command === KODA_COMMAND) {
		console.log("Command detected! Waking up Koda... 🐾");

		// 1. Get the active tab in the current window
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		// 2. Send a message to that tab's Content Script
		if (tab && tab.id) {
			chrome.tabs.sendMessage(tab.id, { action: ACTIONS.TOGGLE_KODA });
		}
	}
});
