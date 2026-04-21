import { FolderItem } from "./types";

export const flattenBookmarkFolders = (
	nodes: chrome.bookmarks.BookmarkTreeNode[],
	parentPath: string = "",
): FolderItem[] => {
	return nodes.reduce<FolderItem[]>((acc, node) => {
		if (node.children) {
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
		}
		return acc;
	}, []);
};
