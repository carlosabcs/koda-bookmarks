import React from "react";

interface PageContextChipProps {
	pageInfo: { title: string; url: string };
	setPageInfo: React.Dispatch<
		React.SetStateAction<{ title: string; url: string }>
	>;
}

export const PageContextChip: React.FC<PageContextChipProps> = ({
	pageInfo,
	setPageInfo,
}) => {
	return (
		<div className="mb-4 mx-auto w-[600px] px-6 py-3.5 bg-surface-container-high rounded-3xl shadow-lg ring-1 ring-outline-variant/20 flex items-center gap-4 pointer-events-auto">
			{/* Bookmark Icon SVG */}
			<div className="text-primary flex-shrink-0">
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M17 3H7C5.9 3 5.01 3.9 5.01 5L5 21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" />
				</svg>
			</div>

			<div className="flex flex-col w-full gap-0.5 overflow-hidden">
				<input
					type="text"
					value={pageInfo.title}
					onChange={(e) => setPageInfo({ ...pageInfo, title: e.target.value })}
					className="bg-transparent outline-none text-on-surface text-sm font-semibold w-full truncate placeholder-on-surface-variant focus:text-primary transition-colors"
					placeholder="Bookmark Title"
				/>
				<input
					type="text"
					value={pageInfo.url}
					onChange={(e) => setPageInfo({ ...pageInfo, url: e.target.value })}
					className="bg-transparent outline-none text-on-surface-variant text-xs w-full truncate placeholder-on-surface-variant/50 focus:text-primary transition-colors"
					placeholder="Bookmark URL"
				/>
			</div>
		</div>
	);
};
