export const ACTIONS = {
	TOGGLE_KODA: "TOGGLE_KODA",
} as const;

export type ExtensionMessage = {
	action: keyof typeof ACTIONS;
};
