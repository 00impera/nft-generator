import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/nft-generator/", // <-- matches your repo name
  plugins: [react()],
});

