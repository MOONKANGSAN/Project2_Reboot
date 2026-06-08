# 백오피스 페이지 조립 구조

App.tsx를 진입점으로, 레이아웃 컴포넌트와 라우트가 어떻게 중첩되어 백오피스 페이지를 구성하는지 정리한 문서.

---

## 전체 라우팅 계층

```
<Routes>                                  ← App.tsx
  │
  ├── <Route element={<PublicLayout />}>  ← 고객용 (Navbar + Footer 포함)
  │     ├── /
  │     ├── /restaurants
  │     ├── /liked
  │     ├── /signup
  │     └── /* (404)
  │
  └── <Route path="/backoffice"           ← 백오피스 전용
            element={<BackofficeLayout />}>
        │
        ├── [공개] index  → BackofficeLoginPage
        ├── [공개] login  → BackofficeLoginPage
        ├── [공개] signup → BackofficeSignupPage
        │
        └── <Route element={<BackofficeProtectedRoute />}>  ← 인증 게이트
              ├── main                       → BackofficeMainPage
              ├── restaurant/register        → BackofficeRestaurantRegisterPage
              ├── restaurant/list            → BackofficeRestaurantListPage
              ├── restaurant/edit/:idx       → BackofficeRestaurantEditPage
              ├── restaurant/hashtag         → BackofficeHashtagListPage
              └── user/list                  → BackofficeUserListPage
```

---

## 레이아웃별 조립 방식

### 공개 라우트 (비로그인 허용)

```
BackofficeLayout
├── <header>  bo-topbar  "BACKOFFICE"
└── <div>     bo-layout__body
      ├── <aside>  bo-sidebar
      │     └── [비로그인 사이드바]
      │           ├── NavLink → /backoffice/login   "관리자 로그인"
      │           └── NavLink → /backoffice/signup  "관리자 가입"
      │
      └── <main>  bo-main-content
            └── <Outlet />  ← 여기에 페이지 컴포넌트 삽입
                  ├── /backoffice       → BackofficeLoginPage
                  ├── /backoffice/login → BackofficeLoginPage
                  └── /backoffice/signup → BackofficeSignupPage
```

### 보호 라우트 (로그인 필수)

```
BackofficeLayout
├── <header>  bo-topbar  "BACKOFFICE"
└── <div>     bo-layout__body
      ├── <aside>  bo-sidebar
      │     ├── [로그인 사이드바]
      │     │     ├── NavLink → /backoffice/main        "대시보드"
      │     │     ├── [구분선]
      │     │     ├── 점포 관리 (토글 아코디언)
      │     │     │     ├── /backoffice/restaurant/list      "점포 목록"
      │     │     │     ├── /backoffice/restaurant/register  "점포 등록"
      │     │     │     └── /backoffice/restaurant/hashtag   "해시태그 목록"
      │     │     ├── 리뷰 관리 (토글 아코디언)
      │     │     │     ├── /backoffice/review/list    "리뷰 목록"    [준비중]
      │     │     │     └── /backoffice/review/report  "신고 관리"   [준비중]
      │     │     ├── 유저 관리 (토글 아코디언)
      │     │     │     ├── /backoffice/user/list   "회원 목록"
      │     │     │     └── /backoffice/user/leave  "탈퇴 관리"  [준비중]
      │     │     └── 서비스 지원 (토글 아코디언)
      │     │           ├── /backoffice/support/error-log  "에러 로그"  [준비중]
      │     │           └── /backoffice/support/notice     "공지 관리"  [준비중]
      │     └── [하단 고정]
      │           └── 로그아웃 버튼
      │
      └── <main>  bo-main-content
            └── BackofficeProtectedRoute
                  └── <Outlet />  ← 여기에 페이지 컴포넌트 삽입
```

---

## BackofficeLayout 내부 구조

```
BackofficeLayout.tsx
│
├── 상태
│     ├── isLoggedIn  — sessionStorage에 'backofficeSession' 존재 여부
│     └── openSections (Set<SectionKey>)  — 현재 펼쳐진 사이드바 섹션
│
├── 사이드바 자동 오픈 (useEffect)
│     └── URL 경로 변경 감지 → 해당 섹션 자동 펼침
│           /backoffice/restaurant/* → 'restaurant' 섹션 오픈
│           /backoffice/review/*    → 'review' 섹션 오픈
│           /backoffice/user/*      → 'user' 섹션 오픈
│           /backoffice/support/*   → 'support' 섹션 오픈
│
├── 사이드바 렌더링 분기
│     ├── isLoggedIn === true  → 대시보드 + 4개 대분류 섹션 + 로그아웃
│     └── isLoggedIn === false → 관리자 로그인 + 관리자 가입만 표시
│
└── <Outlet />
      └── BackofficeProtectedRoute 또는 공개 페이지가 이 자리에 렌더링됨
```

---

## BackofficeProtectedRoute 동작

```
/backoffice/main 접근 시
        │
        ▼
BackofficeProtectedRoute
        │
        ├── sessionStorage.getItem('backofficeSession') === null ?
        │         └── YES → <Navigate to="/backoffice/login" replace />
        │                    (현재 히스토리 스택 교체, 뒤로가기로 돌아올 수 없음)
        │
        └── NO  → <Outlet />
                   └── 요청한 보호 페이지 렌더링
```

`replace` 옵션을 사용하기 때문에 미인증 접근 시 브라우저 히스토리에 해당 URL이 남지 않는다.

---

## 현재 등록된 라우트 목록

| URL 패턴 | 컴포넌트 | 인증 필요 | 비고 |
|---|---|---|---|
| `/backoffice` | BackofficeLoginPage | 불필요 | index 라우트 |
| `/backoffice/login` | BackofficeLoginPage | 불필요 | |
| `/backoffice/signup` | BackofficeSignupPage | 불필요 | |
| `/backoffice/main` | BackofficeMainPage | **필요** | |
| `/backoffice/restaurant/register` | BackofficeRestaurantRegisterPage | **필요** | |
| `/backoffice/restaurant/list` | BackofficeRestaurantListPage | **필요** | |
| `/backoffice/restaurant/edit/:idx` | BackofficeRestaurantEditPage | **필요** | 동적 파라미터 |
| `/backoffice/restaurant/hashtag` | BackofficeHashtagListPage | **필요** | |
| `/backoffice/user/list` | BackofficeUserListPage | **필요** | |

---

## 스타일 적용 범위

```
backoffice-tokens.css               ← BackofficeLayout이 import
      │
      └── .bo-root 에 CSS 변수 선언 (디자인 토큰)
            ├── 색상: --bo-bg-*, --bo-text-*, --bo-accent-*, --bo-error 등
            ├── 레이아웃: --bo-top-height (56px), --bo-side-width (220px)
            ├── 폰트: --bo-font (Pretendard)
            └── 트랜지션: --bo-transition (0.18s ease)

각 페이지 CSS (BackofficeLoginPage.css 등)
      └── var(--bo-*)를 참조하여 토큰 일관성 유지
          → BackofficeLayout이 .bo-root를 감싸고 있으므로
            하위 모든 페이지에서 변수 사용 가능
```

---

## 새 보호 라우트 추가 방법

1. `pages/backoffice/{기능}/` 폴더 생성 후 페이지 컴포넌트 작성
2. `App.tsx` — `<BackofficeProtectedRoute>` 블록 안에 `<Route>` 추가
3. `BackofficeLayout.tsx` — `NAV_SECTIONS` 배열에 항목 추가
