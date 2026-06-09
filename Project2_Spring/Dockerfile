# =====================================================
# Project2_Spring — 개발용 Dockerfile
# 컨테이너 내부에서 Gradle로 직접 빌드 및 실행
# docker compose watch 의 sync+restart 액션과 연동됨
# =====================================================

FROM amazoncorretto:17-al2-jdk

WORKDIR /app

# ── 의존성 캐시 레이어 ──────────────────────────────
# gradlew, gradle 래퍼, 빌드 스크립트를 먼저 복사해
# 소스가 바뀌어도 의존성 다운로드 레이어는 재사용한다
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle .
COPY settings.gradle .

RUN chmod +x ./gradlew

# 의존성만 먼저 다운로드 (이 레이어는 build.gradle 변경 시에만 무효화됨)
RUN ./gradlew dependencies --no-daemon

# ── 소스 복사 ────────────────────────────────────────
COPY src/ src/

EXPOSE 8080

# bootRun: 컨테이너 시작 시 Gradle이 소스를 컴파일 후 실행
# sync+restart 발생 시 → 새 소스를 sync → 컨테이너 재시작 → 재컴파일
CMD ["./gradlew", "bootRun", "--no-daemon"]
