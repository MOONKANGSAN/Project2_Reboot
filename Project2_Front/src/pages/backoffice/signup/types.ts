// 📁 src/pages/backoffice/signup/types.ts
// 역할: 백오피스 가입 페이지 전체에서 공유하는 타입 정의
//       validators, api, 컴포넌트 모두 이 파일에서 타입을 import

// ── 폼 입력 데이터 구조 ──
// select(level)는 DOM에서 string으로 오므로 string 타입 유지 후 API 호출 시 변환
export interface BackofficeSignupFormData {
    id: string;
    password: string;
    passwordConfirm: string;
    level: string;
  }
  
  // ── 필드별 에러 메시지 구조 ──
  // undefined = 에러 없음, string = 에러 메시지
  export interface FormErrors {
    id?: string;
    password?: string;
    passwordConfirm?: string;
  }
  
  // ── Spring 백엔드 응답 구조 ──
  // POST /api/backoffice/signup 응답 타입
  export interface BackofficeSignupApiResponse {
    success: boolean;
    message: string;
    id?: string;
    level?: number;
    regDate?: string;
  }