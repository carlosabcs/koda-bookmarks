import React from "react";
import { ACTIONS, ExtensionMessage, FolderItem } from "../types";
import { PageContextChip } from "./PageContextChip";
import { fuzzySearch } from "../utils";

export const KodaUI = () => {
	const [showKodaBookmarks, setShowKodaBookmarks] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [folders, setFolders] = React.useState<FolderItem[]>([]);
	const [selectedIndex, setSelectedIndex] = React.useState(0);

	// State for the current page, hoisted from the Chip
	const [pageInfo, setPageInfo] = React.useState({ title: "", url: "" });

	// Reference for the list container (used for autoscroll)
	const listContainerRef = React.useRef<HTMLDivElement>(null);

	// Listen for background messages (Command to open)
	React.useEffect(() => {
		const messageListener = (message: ExtensionMessage) => {
			if (message.action === ACTIONS.TOGGLE_KODA) {
				setShowKodaBookmarks((prevState) => !prevState);
			}
		};
		chrome.runtime.onMessage.addListener(messageListener);
		return () => chrome.runtime.onMessage.removeListener(messageListener);
	}, []);

	// Initialize or clear data when Koda opens or closes
	React.useEffect(() => {
		if (!showKodaBookmarks) {
			setSearchQuery("");
			setSelectedIndex(0);
			return;
		}

		// Lock back page scroll
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		// Get current page data
		setPageInfo({
			title: document.title || "Unknown Title",
			url: window.location.href,
		});

		// Get folders
		const fetchFolders = async () => {
			const response = await chrome.runtime.sendMessage({
				action: ACTIONS.GET_BOOKMARKS_FOLDERS,
			});
			setFolders(response);
		};
		fetchFolders();

		return () => {
			// Restore page scroll on close
			document.body.style.overflow = originalOverflow;
		};
	}, [showKodaBookmarks]);

	// Global ESC key to close
	React.useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setShowKodaBookmarks(false);
		};
		if (showKodaBookmarks) {
			window.addEventListener("keydown", handleGlobalKeyDown);
		}
		return () => window.removeEventListener("keydown", handleGlobalKeyDown);
	}, [showKodaBookmarks]);

	// Handle autoscroll to the selected element
	React.useEffect(() => {
		if (listContainerRef.current) {
			const activeElement = listContainerRef.current.children[
				selectedIndex
			] as HTMLElement;
			if (activeElement) {
				activeElement.scrollIntoView({ block: "nearest" });
			}
		}
	}, [selectedIndex]);

	// Reset selected index when search changes
	React.useEffect(() => {
		setSelectedIndex(0);
	}, [searchQuery]);

	const filteredFolders = React.useMemo(() => {
		if (!searchQuery.trim()) return folders;
		return folders.filter((folder) => fuzzySearch(searchQuery, folder.path));
	}, [folders, searchQuery]);

	const exactMatchExists = filteredFolders.some(
		(folder) => folder.path.toLowerCase() === searchQuery.trim().toLowerCase(),
	);

	const showCreateOption = searchQuery.trim().length > 0 && !exactMatchExists;
	const totalSelectableItems =
		filteredFolders.length + (showCreateOption ? 1 : 0);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) =>
				prev < totalSelectableItems - 1 ? prev + 1 : prev,
			);
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
		}
		if (e.key === "Enter") {
			e.preventDefault();
			if (showCreateOption && selectedIndex === totalSelectableItems - 1) {
				console.log("Saving URL:", pageInfo.url, "Title:", pageInfo.title);
				console.log("Triggered: Create new folder ->", searchQuery);
				return;
			}
			if (filteredFolders[selectedIndex]) {
				console.log("Saving URL:", pageInfo.url, "Title:", pageInfo.title);
				console.log(
					"Triggered: Save to folder ->",
					filteredFolders[selectedIndex].path,
				);
			}
		}
	};

	if (!showKodaBookmarks) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-[9999] flex flex-col items-center pt-[15vh] bg-surface-container-lowest/40 backdrop-blur-md pointer-events-auto font-sans text-base antialiased text-left tracking-normal leading-normal"
			onClick={() => setShowKodaBookmarks(false)} // Close modal on outside click
		>
			{/* Container to stop click propagation to the Chip */}
			<div onClick={(e) => e.stopPropagation()}>
				<PageContextChip pageInfo={pageInfo} setPageInfo={setPageInfo} />
			</div>

			{/* Main Palette Chassis */}
			<div
				className="w-[600px] bg-surface-container/80 backdrop-blur-2xl rounded-xl shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden flex flex-col max-h-[70vh]"
				onClick={(e) => e.stopPropagation()} // Prevent clicks here from closing the UI
			>
				{/* Search Input Container */}
				<div className="p-3 shrink-0">
					<div className="bg-surface-container-high rounded-lg p-4 flex items-center">
						<input
							type="text"
							placeholder="Search Koda bookmarks..."
							className="w-full bg-transparent outline-none text-xl placeholder-on-surface-variant text-on-surface"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={handleKeyDown}
							autoFocus
						/>
					</div>
				</div>

				{/* Results Area */}
				<div className="px-4 pb-4 overflow-y-auto flex-1 relative">
					<div className="text-xs font-semibold tracking-wider text-on-surface-variant uppercase mb-3 px-2 sticky top-0 bg-surface-container/95 backdrop-blur py-1 z-10">
						Please select the folder to save the bookmark
					</div>

					<div className="flex flex-col gap-1" ref={listContainerRef}>
						{filteredFolders.map((folder, index) => {
							const isSelected = index === selectedIndex;
							return (
								<div
									key={folder.id}
									className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
										isSelected
											? "bg-primary-container text-white"
											: "text-on-surface hover:bg-surface-bright"
									}`}
									onMouseEnter={() => setSelectedIndex(index)}
								>
									<svg
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="currentColor"
										className={
											isSelected ? "text-white" : "text-on-surface-variant"
										}
									>
										<path d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" />
									</svg>
									<span className="truncate">{folder.path}</span>
									{isSelected && (
										<span className="ml-auto text-[10px] font-bold tracking-widest uppercase opacity-70">
											Jump
										</span>
									)}
								</div>
							);
						})}

						{/* Dynamic "Create" Item */}
						{showCreateOption && (
							<div
								className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mt-2 ${
									selectedIndex === filteredFolders.length
										? "bg-primary-container text-white"
										: "text-on-surface hover:bg-surface-bright"
								}`}
								onMouseEnter={() => setSelectedIndex(filteredFolders.length)}
							>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="currentColor"
									className={
										selectedIndex === filteredFolders.length
											? "text-white"
											: "text-on-surface-variant"
									}
								>
									<path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
								</svg>
								<span className="truncate">Create '{searchQuery}'</span>
								{selectedIndex === filteredFolders.length && (
									<span className="ml-auto text-[10px] font-bold tracking-widest uppercase opacity-70">
										Create & Save
									</span>
								)}
							</div>
						)}
					</div>
				</div>

				<div className="shrink-0 flex items-center justify-between px-4 py-3 bg-surface-container-highest/30 border-t border-outline-variant/10 text-[10px] text-on-surface-variant font-medium tracking-wide">
					<span>V1.0.0</span>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1.5">
							<span className="bg-surface-bright px-1.5 py-0.5 rounded shadow-sm font-mono">
								↑↓
							</span>
							<span>NAVIGATE</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span className="bg-surface-bright px-1.5 py-0.5 rounded shadow-sm font-mono">
								↵
							</span>
							<span>
								{showCreateOption && selectedIndex === totalSelectableItems - 1
									? "CREATE & SAVE"
									: "SAVE"}
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span className="bg-surface-bright px-1.5 py-0.5 rounded shadow-sm font-mono">
								ESC
							</span>
							<span>CLOSE</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
