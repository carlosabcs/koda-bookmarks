import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const KodaPalette = () => {
	// Aquí irá la lógica de estado y el buscador

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div className="w-[600px] bg-[#19191b] rounded-2xl shadow-2xl overflow-hidden text-white">
				{/* Luego implementaremos el diseño de Stitch aquí */}
				<div className="p-4 border-b border-gray-700/50">
					<input
						type="text"
						placeholder="Search Koda bookmarks..."
						className="w-full bg-transparent outline-none text-xl placeholder-gray-500"
					/>
				</div>
			</div>
		</div>
	);
};

// Lógica para inyectar React en el DOM de la página web
const rootElement = document.createElement("div");
rootElement.id = "koda-extension-root";
document.body.appendChild(rootElement);

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<KodaPalette />
	</React.StrictMode>,
);
