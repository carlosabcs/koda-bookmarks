import React from "react";

export const PageContextChip = () => {
	const [pageInfo, setPageInfo] = React.useState({ title: "", url: "" });

	React.useEffect(() => {
		setPageInfo({
			title: document.title || "Unknown Title",
			// Just show domain and path (no https://)
			url: window.location.hostname + window.location.pathname,
		});
	}, []);

	return (
		<div className="mb-4 mx-auto max-w-fit px-4 py-2.5 bg-surface-container/90 backdrop-blur-2xl rounded-full shadow-lg ring-1 ring-outline-variant/20 flex items-center gap-3">
			{/* Bookmark Icon SVG */}
			<div className="text-primary shrink-0">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M17 3H7C5.9 3 5.01 3.9 5.01 5L5 21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" />
				</svg>
			</div>

			{/* Title and URL */}
			<div className="flex flex-col max-w-[450px]">
				<span className="text-on-surface text-sm font-semibold truncate leading-tight">
					{pageInfo.title}
				</span>
				<span className="text-on-surface-variant text-xs truncate leading-tight mt-0.5">
					{pageInfo.url}
				</span>
			</div>
		</div>
	);
};
