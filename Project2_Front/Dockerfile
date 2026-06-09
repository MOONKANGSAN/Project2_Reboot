# =====================================================
# Project2_Front — 개발용 Dockerfile
# Vite 개발 서버를 컨테이너 내부에서 직접 실행
# docker compose watch 의 sync 액션으로 HMR 활성화
# =====================================================

FROM node:22-alpine

WORKDIR /app

# ── 의존성 캐시 레이어 ──────────────────────────────
# package*.json 을 먼저 복사해 소스 변경 시 npm ci 레이어 재사용
COPY package*.json ./

RUN npm ci

# ── 소스 복사 ────────────────────────────────────────
COPY . .

EXPOSE 5173

# --host 0.0.0.0: 컨테이너 외부(호스트 브라우저)에서 접근 허용
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
