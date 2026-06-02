// 📁 src/pages/backoffice/login/types.ts
// 역할: 백오피스 로그인 페이지 전체에서 공유하는 타입 정의

// ── 로그인 폼 입력 데이터 구조 ──
export interface BackofficeLoginFormData {
    id: string;
    password: string;
  }
  
  // ── 필드별 에러 메시지 구조 ──
  export interface FormErrors {
    id?: string;
    password?: string;
  }
  
  // ── Spring 백엔드 응답 구조 ──
  // POST /api/backoffice/login 응답 타입
  export interface BackofficeLoginApiResponse {
    success: boolean;
    message: string;
    id?: string;
    level?: number;
  }
  
  // ── 로그인 성공 후 저장할 세션 정보 ──
  export interface BackofficeSession {
    id: string;
    level: number;
    loginTime: string;
  }