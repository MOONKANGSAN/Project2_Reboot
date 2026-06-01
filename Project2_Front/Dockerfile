# ==========================================
# 1단계: 빌드 스테이지
# ==========================================
# Node.js 22 버전 사용 (package-lock.json의 엔진 호환성 고려)
FROM node:22-alpine AS build-stage

# 컨테이너 내부에 독립된 작업 디렉토리를 생성하고 이동합니다.
WORKDIR /app

# npm 라이브러리 설치를 위해 패키지 목록 파일들을 먼저 복사합니다. (캐시 효율화)
COPY package*.json ./

# 정의된 프론트엔드 의존성 라이브러리들을 컨테이너 내부에 설치합니다.
RUN npm ci

# 리액트 프로젝트의 모든 소스 코드를 컨테이너 내부로 복사합니다.
COPY . .

# ★ 외부 리눅스가 아닌, 도커 컨테이너 내부 환경에서 리액트 빌드를 수행하여 /app/dist 폴더를 생성합니다.
RUN npm run build


# ==========================================
# 2단계: 실행 스테이지 (Nginx)
# ==========================================
FROM nginx:alpine

# 개발자가 작성한 Nginx 커스텀 설정 파일을 컨테이너 내부의 설정 경로로 복사합니다.
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# ★ 핵심 수정: 에러를 유발하던 'COPY ./dist ...' 라인을 완전히 제거했습니다.
# 1단계(build-stage)의 /app/dist 경로에서 생성된 완성본 파일을 Nginx의 웹 서빙 디렉토리로 안전하게 가져옵니다.
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Nginx가 브라우저의 요청을 받을 기본 포트(80번)를 외부로 노출합니다.
EXPOSE 80

# Nginx 웹 서버를 포그라운드(전면)에서 지속적으로 실행하여 컨테이너가 유지되도록 합니다.
CMD ["nginx", "-g", "daemon off;"]
