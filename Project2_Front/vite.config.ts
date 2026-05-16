import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // '@/' 경로 별칭을 src/ 디렉토리로 매핑
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
