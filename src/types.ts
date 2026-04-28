export const ACTIONS = {
	TOGGLE_KODA: "TOGGLE_KODA",
	GET_BOOKMARKS_FOLDERS: "GET_BOOKMARKS_FOLDERS",
	CHECK_CURRENT_BOOKMARK: "CHECK_CURRENT_BOOKMARK",
} as const;

export type ExtensionMessage =
	| { action: typeof ACTIONS.TOGGLE_KODA }
	| { action: typeof ACTIONS.GET_BOOKMARKS_FOLDERS }
	| { action: typeof ACTIONS.CHECK_CURRENT_BOOKMARK; url: string };

export interface FolderItem {
	id: string;
	path: string;
}
