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
        // Docker 환경: 컨테이너 서비스 이름으로 접근 (localhost:8080은 컨테이너 내부 자신을 가리킴)
        target: 'http://backend:8080',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        // 업로드 이미지 정적 리소스도 백엔드로 프록시 (WebMvcConfig에서 파일 서빙)
        target: 'http://backend:8080',
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
