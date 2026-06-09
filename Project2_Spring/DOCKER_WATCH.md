# 백엔드 Docker Watch 설정

## Dockerfile 변경 내용

### 기존 방식 (외부 빌드 필요)
```
1. 개발자가 로컬에서 ./gradlew bootJar 실행
2. build/libs/*.jar 파일 생성
3. Dockerfile이 JAR 파일을 COPY하여 이미지 생성
```

문제점: 코드 변경 시 JAR 재빌드 → docker compose up --build 를 매번 실행해야 함.

### 변경 후 방식 (컨테이너 내부 빌드)
```
1. Dockerfile에서 Gradle 래퍼를 COPY
2. RUN ./gradlew dependencies 로 의존성을 이미지 레이어에 캐시
3. COPY src/ 로 소스 복사
4. CMD ["./gradlew", "bootRun"] 로 컨테이너 시작 시 컴파일 + 실행
```

**로컬에서 `./gradlew bootJar` 를 실행할 필요가 없어집니다.**

---

## Dockerfile 레이어 전략

```dockerfile
COPY gradlew / gradle / build.gradle / settings.gradle
RUN ./gradlew dependencies   ← 이 레이어는 build.gradle이 변경될 때만 무효화
COPY src/                    ← 소스 변경 시 이 레이어부터 재실행
CMD ./gradlew bootRun        ← 컨테이너 시작 시마다 재컴파일
```

의존성 캐시 레이어가 분리되어 있어, 소스만 바꾸는 경우엔 `gradle dependencies` 단계를 건너뜁니다.

---

## watch 액션 설명

### `sync+restart` — 소스 변경 시

```
src/ 파일 변경 감지
    ↓
변경된 파일을 컨테이너 /app/src/ 로 동기화
    ↓
컨테이너 재시작 (docker stop + start)
    ↓
CMD 재실행: ./gradlew bootRun --no-daemon
    ↓
Gradle이 변경된 소스만 증분 컴파일
    ↓
Spring Boot 앱 재기동 (~30초)
```

`.class` 파일은 ignore 처리되어 동기화 대상에서 제외됩니다.

### `rebuild` — build.gradle 변경 시

새로운 의존성(라이브러리)을 추가하거나 플러그인을 변경할 경우 이미지를 처음부터 다시 빌드합니다.
`RUN ./gradlew dependencies` 레이어가 재실행되어 새 의존성을 다운로드합니다.

---

## gradle-cache 볼륨

```yaml
volumes:
  - gradle-cache:/root/.gradle
```

컨테이너가 재시작되어도 Gradle 홈 디렉토리(`~/.gradle`)가 Named Volume에 유지됩니다.
덕분에 재시작 시 이미 다운로드된 의존성을 재사용하여 빌드가 빠릅니다.

---

## 업로드 경로 변경

```properties
# 기존 (Windows 절대경로 — Docker에서 동작 안 함)
app.upload.restaurant.dir=C:/project2/uploads/restaurant

# 변경 후 (컨테이너 내부 경로 — Docker 볼륨과 연결)
app.upload.restaurant.dir=/app/uploads/restaurant
app.upload.review.dir=/app/uploads/review
```

`docker-compose.yml` 에서 `./uploads:/app/uploads` 볼륨이 마운트되므로
컨테이너가 재시작되어도 업로드된 이미지 파일이 호스트에 보존됩니다.

---

## DB healthcheck 연동

```yaml
depends_on:
  db:
    condition: service_healthy
```

DB 컨테이너가 `mysqladmin ping` 에 응답할 때까지 백엔드 시작을 대기합니다.
기존의 단순 `depends_on: - db` 는 컨테이너가 "시작됨" 상태만 확인했지만,
MySQL이 실제로 연결을 받을 준비가 될 때까지 기다리지 않았습니다.
