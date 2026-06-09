# Docker Compose Watch 설정 가이드

## 개요

`docker compose watch` 는 파일 변경을 감지해 컨테이너를 자동으로 동기화·재시작·재빌드하는 기능입니다.
매번 `docker compose down` → `up --build` 를 반복하지 않아도 코드 수정이 즉시 반영됩니다.

> 필요 버전: Docker Desktop 4.24+ 또는 Docker Engine + Compose Plugin v2.22+

---

## 명령어

```bash
# 최초 1회 — 이미지를 빌드하고 watch 모드로 시작
docker compose up -d --build
docker compose watch

# 또는 한 번에
docker compose watch --no-up   # 이미 실행 중일 때
```

`Ctrl+C` 로 watch 종료 (컨테이너는 계속 실행됨)

---

## 서비스별 watch 동작

### db (MySQL)
watch 설정 없음. 볼륨(`./mysql_data`)으로 데이터가 유지되며 재빌드 필요 없음.

### backend (Spring Boot)

| 변경 파일 | 액션 | 소요 시간 | 동작 |
|---|---|---|---|
| `Project2_Spring/src/**` | `sync+restart` | ~30초 | 소스 동기화 → 컨테이너 재시작 → `bootRun` 재컴파일 |
| `Project2_Spring/build.gradle` | `rebuild` | ~2분 | 이미지 전체 재빌드 (의존성 변경 시) |

### frontend (React / Vite)

| 변경 파일 | 액션 | 소요 시간 | 동작 |
|---|---|---|---|
| `Project2_Front/src/**` | `sync` | ~즉시 | 파일 동기화 → Vite HMR이 브라우저에 반영 |
| `Project2_Front/public/**` | `sync` | ~즉시 | 정적 파일 동기화 |
| `Project2_Front/package.json` | `rebuild` | ~1분 | 이미지 재빌드 (`npm ci` 재실행) |

---

## 접속 주소

| 서비스 | 주소 |
|---|---|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:8080 |
| DB | localhost:3307 |

---

## 주요 변경 사항 (기존 대비)

| 항목 | 기존 | 변경 후 |
|---|---|---|
| 백엔드 Dockerfile | 외부 빌드 JAR 복사 | 컨테이너 내부 Gradle 빌드 |
| 프론트 Dockerfile | Nginx 정적 빌드 | Vite dev 서버 |
| 프론트 포트 매핑 | `5173:80` | `5173:5173` |
| 업로드 경로 | Windows 절대경로 | `/app/uploads` (볼륨 마운트) |
| DB 의존성 체크 | 단순 `depends_on` | `healthcheck` 로 실제 준비 대기 |

---

## 볼륨 구조

```
project2/
├── mysql_data/        ← DB 데이터 (자동 생성)
└── uploads/
    ├── restaurant/    ← 점포 이미지
    └── review/        ← 리뷰 이미지
```

---

## 트러블슈팅

**`docker compose watch` 명령어를 찾을 수 없음**
```bash
# Docker Compose 플러그인 버전 확인
docker compose version
# 2.22.0 이상이어야 함
```

**백엔드 watch 후 DB 연결 실패**
- DB `healthcheck` 통과 전에 backend가 시작되는 경우 → 자동 재시도하므로 잠시 대기

**Vite HMR이 작동하지 않음**
- `vite.config.ts` 에 `host: '0.0.0.0'` 설정 확인
- 브라우저가 `localhost:5173` 에 접속하고 있는지 확인
