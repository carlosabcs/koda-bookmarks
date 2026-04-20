chrome.commands.onCommand.addListener(async (command) => {
	if (command === "open-koda") {
		console.log("Command detected! Waking up Koda... 🐾");

		// 1. Get the active tab in the current window
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		// 2. Send a message to that tab's Content Script
		if (tab && tab.id) {
			chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_KODA" });
		}
	}
});
