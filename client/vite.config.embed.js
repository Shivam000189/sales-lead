import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist-embed",
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "src/embed/widget.jsx"),
      name: "HeroCRMLeadWidget",
      fileName: () => "widget.js",
      formats: ["iife"],
    },
    rollupOptions: {
      // Bundle React and ReactDOM directly inside widget.js for zero host dependencies
    },
  },
});
