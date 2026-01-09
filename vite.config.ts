import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	base: "/pixel-ribbit/",
	build: {
		sourcemap: true,
	},
	plugins: [
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "apple-touch-icon.png"],
			manifest: {
				name: "Pixel Ribbit",
				short_name: "Ribbit",
				start_url: ".",
				scope: ".",
				display: "standalone",
				orientation: "portrait",
				background_color: "#3c4048",
				theme_color: "#313338",
				icons: [
					{
						src: "icons/icon-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "icons/icon-512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "icons/icon-512-maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
		}),
	],
});
