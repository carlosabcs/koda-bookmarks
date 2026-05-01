import React from "react";
import { ACTIONS, ExtensionMessage, FolderItem } from "../types";
import { PageContextChip } from "./PageContextChip";
import { Toast } from "./Toast";
import { fuzzySearch } from "../utils";

export const KodaUI = () => {
	const [showKodaBookmarks, setShowKodaBookmarks] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [folders, setFolders] = React.useState<FolderItem[]>([]);
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const [toastMessage, setToastMessage] = React.useState("");

	const [pageInfo, setPageInfo] = React.useState({ title: "", url: "" });
	const [existingContext, setExistingContext] = React.useState({
		exists: false,
		folderName: "",
		id: "",
	});
	const [pendingFolderName, setPendingFolderName] = React.useState<
		string | null
	>(null);

	const listContainerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const messageListener = (message: ExtensionMessage) => {
			if (message.action !== ACTIONS.TOGGLE_KODA) return;
			setShowKodaBookmarks((prevState) => !prevState);
		};
		chrome.runtime.onMessage.addListener(messageListener);
		return () => chrome.runtime.onMessage.removeListener(messageListener);
	}, []);

	React.useEffect(() => {
		if (!showKodaBookmarks) {
			setSearchQuery("");
			setSelectedIndex(0);
			setPendingFolderName(null);
			setExistingContext({ exists: false, folderName: "", id: "" });
			return;
		}

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const currentUrl = window.location.href;
		setPageInfo({
			title: document.title || "Unknown Title",
			url: currentUrl,
		});

		const fetchFolders = async () => {
			const response = await chrome.runtime.sendMessage({
				action: ACTIONS.GET_BOOKMARKS_FOLDERS,
			});
			setFolders(response);
		};

		const checkExistingBookmark = async () => {
			const response = await chrome.runtime.sendMessage({
				action: ACTIONS.CHECK_CURRENT_BOOKMARK,
				url: currentUrl,
			});
			if (!response || !response.exists) return;

			setExistingContext({
				exists: true,
				folderName: response.folderName,
				id: response.id,
			});
			if (response.title) {
				setPageInfo((prev) => ({ ...prev, title: response.title }));
			}
		};

		fetchFolders();
		checkExistingBookmark();

		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [showKodaBookmarks]);

	React.useEffect(() => {
		const handleGlobalKeyDown = async (e: KeyboardEvent) => {
			// 1. ESC Key: Close or go back
			if (e.key === "Escape") {
				if (pendingFolderName) {
					setPendingFolderName(null);
					setSearchQuery("");
					return;
				}
				setShowKodaBookmarks(false);
				return;
			}

			// 2. DELETE Key: Remove existing bookmark (Cmd/Ctrl + Backspace)
			if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") {
				if (!existingContext.exists || !existingContext.id) return;

				e.preventDefault();
				await chrome.runtime.sendMessage({
					action: ACTIONS.DELETE_BOOKMARK,
					payload: { id: existingContext.id },
				});

				setToastMessage("Bookmark removed successfully");
				setShowKodaBookmarks(false);
				return;
			}

			// 3. TAB Key: Focus Trap
			if (e.key === "Tab") {
				const root = document.getElementById("koda-extension-host")?.shadowRoot;
				if (!root) return;

				const focusables = Array.from(root.querySelectorAll("input"));
				if (focusables.length === 0) return;

				const activeElement = root.activeElement as HTMLElement;
				const currentIndex = focusables.indexOf(
					activeElement as HTMLInputElement,
				);

				e.preventDefault();

				if (e.shiftKey) {
					const prev =
						currentIndex > 0 ? currentIndex - 1 : focusables.length - 1;
					focusables[prev].focus();
				} else {
					const next =
						currentIndex < focusables.length - 1 ? currentIndex + 1 : 0;
					focusables[next].focus();
				}
			}
		};

		if (!showKodaBookmarks) return;

		window.addEventListener("keydown", handleGlobalKeyDown, true);
		return () =>
			window.removeEventListener("keydown", handleGlobalKeyDown, true);
	}, [showKodaBookmarks, pendingFolderName, existingContext]);

	React.useEffect(() => {
		if (!listContainerRef.current) return;
		const activeElement = listContainerRef.current.children[
			selectedIndex
		] as HTMLElement;
		if (!activeElement) return;

		activeElement.scrollIntoView({ block: "nearest" });
	}, [selectedIndex]);

	React.useEffect(() => {
		setSelectedIndex(0);
	}, [searchQuery, pendingFolderName]);

	const filteredFolders = React.useMemo(() => {
		if (!searchQuery.trim()) return folders;
		return folders.filter((folder) => fuzzySearch(searchQuery, folder.path));
	}, [folders, searchQuery]);

	const exactMatchExists = filteredFolders.some(
		(folder) => folder.path.toLowerCase() === searchQuery.trim().toLowerCase(),
	);

	const showCreateOption =
		!pendingFolderName && searchQuery.trim().length > 0 && !exactMatchExists;
	const totalSelectableItems =
		filteredFolders.length + (showCreateOption ? 1 : 0);

	const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) =>
				prev < totalSelectableItems - 1 ? prev + 1 : prev,
			);
			return;
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
			return;
		}

		if (e.key === "Enter") {
			e.preventDefault();

			if (pendingFolderName) {
				const selectedParent = filteredFolders[selectedIndex];
				if (!selectedParent) return;

				await chrome.runtime.sendMessage({
					action: ACTIONS.CREATE_FOLDER_AND_SAVE,
					payload: {
						parentId: selectedParent.id,
						folderName: pendingFolderName,
						title: pageInfo.title,
						url: pageInfo.url,
						existingId: existingContext.id || undefined,
					},
				});

				setToastMessage(
					existingContext.exists
						? "Bookmark updated successfully"
						: "Bookmark created successfully",
				);
				setShowKodaBookmarks(false);
				return;
			}

			if (showCreateOption && selectedIndex === totalSelectableItems - 1) {
				setPendingFolderName(searchQuery.trim());
				setSearchQuery("");
				return;
			}

			const selectedFolder = filteredFolders[selectedIndex];
			if (!selectedFolder) return;

			await chrome.runtime.sendMessage({
				action: ACTIONS.SAVE_BOOKMARK,
				payload: {
					parentId: selectedFolder.id,
					title: pageInfo.title,
					url: pageInfo.url,
					existingId: existingContext.id || undefined,
				},
			});

			setToastMessage(
				existingContext.exists
					? "Bookmark moved successfully"
					: "Bookmark saved successfully",
			);
			setShowKodaBookmarks(false);
		}
	};

	const getSubtitle = () => {
		if (pendingFolderName)
			return `Select parent folder for '${pendingFolderName}'`;
		if (existingContext.exists)
			return "Please select the folder to move the bookmark";
		return "Please select the folder to save the bookmark";
	};

	return (
		<>
			<Toast message={toastMessage} onClose={() => setToastMessage("")} />

			{showKodaBookmarks && (
				<div
					className="fixed inset-0 z-[9999] flex flex-col items-center pt-[15vh] bg-surface-container-lowest/40 backdrop-blur-md pointer-events-auto font-sans text-base antialiased text-left tracking-normal leading-normal"
					onClick={() => setShowKodaBookmarks(false)}
				>
					<div onClick={(e) => e.stopPropagation()}>
						<PageContextChip
							pageInfo={pageInfo}
							setPageInfo={setPageInfo}
							existingContext={existingContext}
						/>
					</div>

					<div
						className="w-[600px] bg-surface-container/80 backdrop-blur-2xl rounded-xl shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden flex flex-col max-h-[70vh]"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-3 shrink-0">
							<div className="bg-surface-container-high rounded-lg p-4 flex items-center">
								<input
									type="text"
									placeholder={
										pendingFolderName
											? "Search parent folder..."
											: "Search Koda bookmarks..."
									}
									className="w-full bg-transparent outline-none text-xl placeholder-on-surface-variant text-on-surface"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={handleKeyDown}
									autoFocus
								/>
							</div>
						</div>

						<div className="px-4 pb-4 overflow-y-auto flex-1 relative">
							<div className="text-xs font-semibold tracking-wider text-on-surface-variant uppercase mb-3 px-2 sticky top-0 bg-surface-container/95 backdrop-blur py-1 z-10">
								{getSubtitle()}
							</div>

							<div className="flex flex-col gap-1" ref={listContainerRef}>
								{filteredFolders.map((folder, index) => {
									const isSelected = index === selectedIndex;
									return (
										<div
											key={folder.id}
											className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 scroll-mt-10 ${
												isSelected
													? "bg-teal-600 text-white shadow-md ring-1 ring-teal-500/50"
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
												<span className="ml-auto text-[10px] font-bold tracking-widest uppercase opacity-90">
													Jump
												</span>
											)}
										</div>
									);
								})}

								{showCreateOption && (
									<div
										className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 mt-2 scroll-mt-10 ${
											selectedIndex === filteredFolders.length
												? "bg-teal-600 text-white shadow-md ring-1 ring-teal-500/50"
												: "text-on-surface hover:bg-surface-bright"
										}`}
										onMouseEnter={() =>
											setSelectedIndex(filteredFolders.length)
										}
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
											<span className="ml-auto text-[10px] font-bold tracking-widest uppercase opacity-90">
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
								{existingContext.exists && (
									<div className="flex items-center gap-1.5">
										<span className="bg-surface-bright px-1.5 py-0.5 rounded shadow-sm font-mono">
											⌘/CTRL+⌫
										</span>
										<span>DELETE</span>
									</div>
								)}
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
										{showCreateOption &&
										selectedIndex === totalSelectableItems - 1
											? "CONTINUE"
											: "SAVE"}
									</span>
								</div>
								<div className="flex items-center gap-1.5">
									<span className="bg-surface-bright px-1.5 py-0.5 rounded shadow-sm font-mono">
										ESC
									</span>
									<span>{pendingFolderName ? "BACK" : "CLOSE"}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
