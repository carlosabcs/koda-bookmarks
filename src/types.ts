export const ACTIONS = {
	TOGGLE_KODA: "TOGGLE_KODA",
	GET_BOOKMARKS_FOLDERS: "GET_BOOKMARKS_FOLDERS",
	CHECK_CURRENT_BOOKMARK: "CHECK_CURRENT_BOOKMARK",
	SAVE_BOOKMARK: "SAVE_BOOKMARK",
	CREATE_FOLDER_AND_SAVE: "CREATE_FOLDER_AND_SAVE",
} as const;

export type ExtensionMessage =
	| { action: typeof ACTIONS.TOGGLE_KODA }
	| { action: typeof ACTIONS.GET_BOOKMARKS_FOLDERS }
	| { action: typeof ACTIONS.CHECK_CURRENT_BOOKMARK; url: string }
	| {
			action: typeof ACTIONS.SAVE_BOOKMARK;
			payload: {
				parentId: string;
				title: string;
				url: string;
				existingId?: string;
			};
	  }
	| {
			action: typeof ACTIONS.CREATE_FOLDER_AND_SAVE;
			payload: {
				folderName: string;
				title: string;
				url: string;
				existingId?: string;
			};
	  };

export interface FolderItem {
	id: string;
	path: string;
}
