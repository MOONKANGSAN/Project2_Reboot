# 백오피스 로그인 프로세스

## 디렉토리 구조

```
pages/backoffice/login/
├── types.ts                  # 타입 정의
├── validators.ts             # 폼 유효성 검증
├── api.ts                    # 백엔드 API 호출
├── BackofficeLoginHeader.tsx # 헤더 UI 컴포넌트
├── Backofficeloginform.tsx   # 폼 UI 컴포넌트
├── BackofficeLoginPage.tsx   # 컨테이너 (상태·로직 담당)
├── BackofficeLoginPage.css   # 스타일
└── index.tsx                 # 라우터 진입점 (re-export)
```

---

## 전체 흐름

```
사용자 입력
    │
    ▼
[BackofficeLoginPage.tsx]  ← 상태(formData, errors, isSubmitting) 관리
    │
    ├── UI 렌더링
    │     ├── BackofficeLoginHeader.tsx  (뱃지·타이틀 표시)
    │     └── Backofficeloginform.tsx   (입력 필드·버튼 렌더링)
    │
    └── 폼 제출 시 handleSubmit() 실행
          │
          ▼
    [1단계] 클라이언트 검증 (validators.ts)
          │  실패 → errors 상태 업데이트 → 폼에 에러 메시지 표시, 중단
          │  통과 ↓
          ▼
    [2단계] API 호출 (api.ts)
          │  POST http://localhost:8080/api/backoffice/login
          │  Body: { id, password }
          │
          ├── 성공 (success: true)
          │     └── [3단계] 세션 저장 → sessionStorage
          │                 └── [4단계] /backoffice 로 navigate
          │
          └── 실패
                ├── HTTP 401  → alert (아이디/비밀번호 오류 또는 비활성 계정)
                ├── HTTP 500  → alert (서버 오류)
                └── 네트워크  → alert (서버 연결 불가)
```

---

## 단계별 상세 설명

### 1단계 — 클라이언트 검증 (`validators.ts`)

제출 버튼을 누르면 API 호출 전에 먼저 클라이언트에서 검증한다.

| 필드 | 검증 조건 | 에러 메시지 |
|---|---|---|
| `id` | 빈 값 여부 | 아이디를 입력해주세요. |
| `password` | 빈 값 여부 | 비밀번호를 입력해주세요. |

- `validateLoginForm()` — 전체 폼을 한 번에 검증해 `FormErrors` 객체 반환
- `hasErrors()` — 에러가 하나라도 있으면 `true` 반환 → API 호출 중단

> 입력 중 실시간 에러 해제: 각 필드를 수정하면 해당 필드의 에러만 즉시 제거된다.  
> (`handleChange` 내 `setErrors((prev) => ({ ...prev, [name]: undefined }))`)

---

### 2단계 — API 호출 (`api.ts`)

```
POST http://localhost:8080/api/backoffice/login

Request Body
  { "id": "admin01", "password": "평문비밀번호" }

Response (성공)
  { "success": true, "message": "로그인 성공", "id": "admin01", "level": 2 }

Response (실패 · HTTP 401)
  { "success": false, "message": "아이디 또는 비밀번호가 올바르지 않거나 비활성화된 계정입니다." }
```

- axios 인스턴스(`apiClient`)를 모듈 상단에 생성해 재사용한다.
- 컴포넌트에서 axios를 직접 쓰지 않고 `loginBackofficeUser()` 함수만 호출한다.
- 백엔드는 BCrypt로 비밀번호를 검증하고, 계정 `state === 0`이면 401을 반환한다.

---

### 3단계 — 세션 저장

로그인 성공 후 `sessionStorage`에 세션 정보를 JSON으로 저장한다.

```ts
// 저장 키: 'backofficeSession'
{
  id: "admin01",       // 관리자 아이디
  level: 2,            // 권한 레벨 (1=일반, 2=상위, 3=최고)
  loginTime: "2026-06-06T10:00:00.000Z"  // ISO 8601
}
```

- `sessionStorage` 사용 이유: 탭을 닫으면 자동 만료, `localStorage`보다 보안에 유리하다.
- 이 세션은 `BackofficeProtectedRoute`에서 읽어 인증 여부를 판단한다.
- 로그아웃 시 `sessionStorage.removeItem('backofficeSession')`으로 제거한다.

---

### 4단계 — 라우팅

| 조건 | 이동 경로 |
|---|---|
| 로그인 성공 | `/backoffice` (→ BackofficeProtectedRoute가 `/backoffice/main`으로 처리) |
| 미인증 상태로 보호 경로 접근 | `/backoffice/login` 으로 리다이렉트 |
| 계정 생성 링크 클릭 | `/backoffice/signup` |

---

## 컴포넌트 역할 분리

| 파일 | 역할 | 가지는 것 |
|---|---|---|
| `BackofficeLoginPage.tsx` | 컨테이너 | 상태(`useState`), 이벤트 핸들러, API 호출 |
| `Backofficeloginform.tsx` | UI | Props로 받은 값 렌더링만 담당, 자체 상태 없음 |
| `BackofficeLoginHeader.tsx` | UI | 정적 헤더, Props 없음 |
| `validators.ts` | 순수 함수 | 입력값 → 에러 문자열, 사이드이펙트 없음 |
| `api.ts` | 인프라 | axios 인스턴스, HTTP 통신만 담당 |
| `types.ts` | 타입 | 인터페이스만 export, 로직 없음 |

---

## 타입 정의 (`types.ts`)

```ts
// 폼 입력 상태
interface BackofficeLoginFormData {
  id: string;
  password: string;
}

// 필드별 에러 메시지 (undefined = 에러 없음)
interface FormErrors {
  id?: string;
  password?: string;
}

// 백엔드 응답 구조 (POST /api/backoffice/login)
interface BackofficeLoginApiResponse {
  success: boolean;
  message: string;
  id?: string;      // 성공 시에만 포함
  level?: number;   // 성공 시에만 포함
}

// sessionStorage에 저장되는 세션 구조
interface BackofficeSession {
  id: string;
  level: number;
  loginTime: string; // ISO 8601
}
```

---

## 에러 처리 흐름

```
API 에러 발생
    │
    ├── error.response?.status === 401
    │     └── 백엔드 메시지 우선 표시
    │         없으면 → "아이디 또는 비밀번호를 확인해주세요."
    │
    ├── error.response?.status === 500
    │     └── "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    │
    └── 그 외 (네트워크 단절, ERR_CONNECTION_REFUSED 등)
          └── "서버에 연결할 수 없습니다."
```

`finally` 블록에서 `isSubmitting = false`로 항상 복구해 버튼 비활성 상태가 영구적으로 유지되는 것을 방지한다.
