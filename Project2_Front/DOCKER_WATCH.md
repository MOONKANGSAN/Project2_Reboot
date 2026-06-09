# 프론트엔드 Docker Watch 설정

## Dockerfile 변경 내용

### 기존 방식 (Nginx 프로덕션 빌드)
```
1. Node.js 컨테이너에서 npm run build → /app/dist 생성
2. Nginx 컨테이너로 dist 파일 복사
3. Nginx가 정적 파일 서빙 (포트 80)
```

문제점: 소스 변경 시 전체 `npm run build` → 이미지 재빌드 필요.
HMR(Hot Module Replacement)이 동작하지 않음.

### 변경 후 방식 (Vite dev 서버)
```
1. Node.js 컨테이너에서 npm run dev 실행
2. Vite dev 서버가 직접 소스를 서빙 (포트 5173)
3. 소스 변경 시 Vite HMR이 브라우저에 즉시 반영
```

**별도 빌드 과정 없이 저장 즉시 브라우저가 업데이트됩니다.**

---

## Dockerfile 레이어 전략

```dockerfile
COPY package*.json ./
RUN npm ci                ← 이 레이어는 package.json 변경 시에만 무효화
COPY . .
CMD npm run dev -- --host 0.0.0.0
```

---

## `--host 0.0.0.0` 옵션

Vite dev 서버의 기본 설정은 `localhost`(컨테이너 내부)만 수신합니다.
`--host 0.0.0.0` 을 지정하면 모든 네트워크 인터페이스에서 수신하므로
호스트 브라우저에서 `http://localhost:5173` 으로 접근할 수 있습니다.

`vite.config.ts` 에도 동일하게 설정되어 있습니다:
```typescript
server: {
  host: '0.0.0.0',
  port: 5173,
}
```

---

## watch 액션 설명

### `sync` — 소스 변경 시 (재시작 없음)

```
src/ 파일 변경 감지
    ↓
변경된 파일을 컨테이너 /app/src/ 로 동기화 (복사)
    ↓
Vite의 파일 감시자(FSWatcher)가 변경 감지
    ↓
HMR: 변경된 모듈만 브라우저에 전송
    ↓
브라우저가 페이지 새로고침 없이 즉시 반영
```

**컨테이너 재시작이 없어 반영 속도가 매우 빠릅니다 (~즉시).**

### `rebuild` — package.json 변경 시

새로운 npm 패키지를 설치(`npm install xxx`)한 후 `package.json`이 변경되면
이미지를 재빌드하여 `npm ci` 를 다시 실행합니다.

---

## 포트 변경

| 항목 | 기존 | 변경 후 | 이유 |
|---|---|---|---|
| 컨테이너 포트 | 80 (Nginx) | 5173 (Vite) | dev 서버 포트로 변경 |
| 호스트 매핑 | `5173:80` | `5173:5173` | 동일 포트로 단순화 |

---

## HMR(Hot Module Replacement) 동작 범위

| 변경 유형 | HMR 동작 | 설명 |
|---|---|---|
| React 컴포넌트 (.tsx) | ✅ 즉시 반영 | 상태(state) 유지하며 컴포넌트만 교체 |
| CSS 파일 | ✅ 즉시 반영 | 페이지 깜빡임 없이 스타일 변경 |
| `vite.config.ts` | ⚠️ 재시작 필요 | Vite 설정 변경 |
| `package.json` | 🔄 이미지 재빌드 | watch `rebuild` 트리거 |

---

## 주의사항

프로덕션 배포 시에는 기존 Nginx 방식이 더 적합합니다.
이 Dockerfile은 개발 편의성에 최적화되어 있습니다.
배포가 필요하다면 별도의 `Dockerfile.prod` 를 생성하는 것을 권장합니다.
