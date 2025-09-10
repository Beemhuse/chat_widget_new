import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "ChatWidget",
      fileName: "chat-widget",
      formats: ["iife"], // single self-contained script
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // pack everything together
      },
    },
  },
});
