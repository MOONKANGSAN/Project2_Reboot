# 1단계: 빌드 스테이지
# Node.js 22 버전 사용 (package-lock.json의 엔진 호환성 고려)
FROM node:22-alpine AS build-stage

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치 (캐시 활용을 위해 먼저 복사)
COPY package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 2단계: 실행 스테이지 (Nginx)

FROM nginx:alpine
# 커스텀 설정 파일을 복사
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./dist /usr/share/nginx/html

# 빌드 스테이지에서 생성된 dist 폴더를 Nginx 기본 서빙 디렉토리로 복사
# Vite의 기본 빌드 결과물은 dist 폴더에 생성됩니다.
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Nginx 기본 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]