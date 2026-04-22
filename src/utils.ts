import { FolderItem } from "./types";

export const flattenBookmarkFolders = (
	nodes: chrome.bookmarks.BookmarkTreeNode[],
	parentPath: string = "",
): FolderItem[] => {
	return nodes.reduce<FolderItem[]>((acc, node) => {
		if (!node.children) return acc;

		// Chrome's absolute root node (id: "0") has an empty title.
		// We skip adding it to the path string.
		const currentPath = node.title
			? parentPath
				? `${parentPath} > ${node.title}`
				: node.title
			: parentPath;

		// Only push actual folders that have a name
		if (node.title) {
			acc.push({ id: node.id, path: currentPath });
		}
		// Recursively process the children of this folder
		acc.push(...flattenBookmarkFolders(node.children, currentPath));
		return acc;
	}, []);
};

/**
 * Checks if all characters of the query appear in the target string in the same order.
 * Example: query "wp" matches target "Wikipedia".
 */
export const fuzzySearch = (query: string, target: string): boolean => {
	const searchLower = query.toLowerCase();
	const targetLower = target.toLowerCase();
	let searchIndex = 0;
	let targetIndex = 0;
	while (searchIndex < searchLower.length && targetIndex < targetLower.length) {
		if (searchLower[searchIndex] === targetLower[targetIndex]) {
			searchIndex++;
		}
		targetIndex++;
	}
	return searchIndex === searchLower.length;
};
