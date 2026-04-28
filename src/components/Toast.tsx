import React from "react";

interface ToastProps {
	message: string;
	onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
	if (!message) return null;

	React.useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, 4000);
		return () => clearTimeout(timer);
	}, [message, onClose]);

	return (
		<div className="fixed bottom-6 right-6 z-[10000] flex items-center gap-3 bg-[#242424] text-white px-4 py-3.5 rounded-xl shadow-2xl ring-1 ring-white/10 transition-all duration-300">
			{/* Check Circle SVG */}
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="#A8C7FA"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
				<polyline points="22 4 12 14.01 9 11.01"></polyline>
			</svg>

			<span className="text-sm font-medium tracking-wide">{message}</span>

			<button
				onClick={onClose}
				className="ml-2 text-white/50 hover:text-white transition-colors outline-none"
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	);
};
