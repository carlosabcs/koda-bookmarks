export const ACTIONS = {
	TOGGLE_KODA: "TOGGLE_KODA",
	GET_BOOKMARKS_FOLDERS: "GET_BOOKMARKS_FOLDERS",
} as const;

export type ExtensionMessage =
	| { action: typeof ACTIONS.TOGGLE_KODA }
	| { action: typeof ACTIONS.GET_BOOKMARKS_FOLDERS };

export interface FolderItem {
	id: string;
	path: string;
}
