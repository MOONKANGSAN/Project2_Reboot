import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 서버 포트
    port: 5173,
    // 프록시 설정으로 CORS 우회
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
