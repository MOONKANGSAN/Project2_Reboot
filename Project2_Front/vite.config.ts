import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // Docker 컨테이너 외부(호스트 브라우저)에서 접근 허용
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    // '@/' 경로 별칭을 src/ 디렉토리로 매핑
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
