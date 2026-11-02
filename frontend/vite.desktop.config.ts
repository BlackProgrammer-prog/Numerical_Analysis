import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: fileURLToPath(new URL("./desktop", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // The desktop frontend and API share the embedded server's random local port.
  define: { "import.meta.env.VITE_API_URL": JSON.stringify("") },
  build: {
    outDir: fileURLToPath(new URL("./desktop-dist", import.meta.url)),
    emptyOutDir: true,
  },
});
