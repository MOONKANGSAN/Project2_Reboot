// 📁 src/utils/errorLogger.ts
// 역할: 프론트엔드에서 발생한 에러를 Spring 백엔드로 전송하여 DB에 저장하는 공통 함수
//       모든 API 호출, 컴포넌트 에러 등에서 재사용 가능

import axios, { AxiosError } from 'axios';

// ─────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────

/**
 * 에러 유형 열거형
 * NETWORK: 네트워크 연결 오류
 * VALIDATION: 입력 검증 오류
 * SERVER: 서버 내부 오류 (5xx)
 * CLIENT: 클라이언트 요청 오류 (4xx)
 * UNKNOWN: 알 수 없는 오류
 */
export type ErrorType = 
  | 'NETWORK' 
  | 'VALIDATION' 
  | 'SERVER' 
  | 'CLIENT' 
  | 'UNKNOWN';

/**
 * 에러 로그 데이터 구조
 * Spring의 ErrorLogDto와 동일한 구조
 */
export interface ErrorLogData {
  errorSource: 'FRONTEND' | 'BACKEND';
  errorType: ErrorType;
  errorMessage: string;
  errorDetails?: string;
  statusCode?: number;
  requestUrl?: string;
  httpMethod?: string;
  requestBody?: string;
  userId?: string;
  userAgent?: string;
}


/** Spring API 에러 응답 본문 (4xx 등) */
interface ApiErrorResponseBody {
  message?: string;
  code?: number;
}

// ─────────────────────────────────────────
// API 클라이언트 설정
// ─────────────────────────────────────────

// Spring 백엔드 기본 URL
const API_BASE_URL = 'http://localhost:8080/api';

// 에러 로깅 전용 axios 인스턴스
const errorLogClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 에러 로깅은 5초 타임아웃
});

// ─────────────────────────────────────────
// 에러 로깅 함수
// ─────────────────────────────────────────

/**
 * 에러를 Spring 백엔드로 전송하여 DB에 저장
 * 
 * @param error - 발생한 에러 객체 (Error, AxiosError 등)
 * @param additionalInfo - 추가 정보 (선택사항)
 * @returns Promise<void>
 * 
 * @example
 * try {
 *   await axios.post('/api/user/signup', data);
 * } catch (error) {
 *   await logErrorToServer(error, { userId: 'user123' });
 *   throw error; // 에러를 다시 던져서 상위에서 처리
 * }
 */
export const logErrorToServer = async (
  error: any,
  additionalInfo?: {
    userId?: string;
    requestUrl?: string;
    requestBody?: any;
    httpMethod?: string;
  }
): Promise<void> => {
  try {
    // 에러 정보 추출 및 구조화
    const errorLogData = buildErrorLogData(error, additionalInfo);

    // Spring 백엔드로 에러 로그 전송
    // POST /api/error-log 엔드포인트 호출
    await errorLogClient.post('/error-log', errorLogData);

    // 개발 환경에서는 콘솔에도 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Logged to Server]', errorLogData);
    }
  } catch (loggingError) {
    // 에러 로깅 자체가 실패해도 앱이 중단되지 않도록 처리
    // 콘솔에만 출력하고 무시
    console.error('[Error Logging Failed]', loggingError);
  }
};

/**
 * 에러 객체로부터 ErrorLogData 구조 생성
 * 
 * @param error - 발생한 에러
 * @param additionalInfo - 추가 정보
 * @returns ErrorLogData 객체
 */
const buildErrorLogData = (
  error: any,
  additionalInfo?: {
    userId?: string;
    requestUrl?: string;
    requestBody?: any;
    httpMethod?: string;
  }
): ErrorLogData => {
  // 기본 에러 로그 데이터 구조
  const errorLogData: ErrorLogData = {
    errorSource: 'FRONTEND',
    errorType: 'UNKNOWN',
    errorMessage: '알 수 없는 에러가 발생했습니다.',
    userAgent: navigator.userAgent, // 브라우저 정보
  };

  // Axios 에러인 경우
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponseBody>;

    // HTTP 상태 코드
    errorLogData.statusCode = axiosError.response?.status;

    // 에러 유형 결정
    if (!axiosError.response) {
      // 네트워크 에러 (서버 응답 없음)
      errorLogData.errorType = 'NETWORK';
      errorLogData.errorMessage = '네트워크 연결 오류가 발생했습니다.';
    } else if (axiosError.response.status >= 500) {
      // 서버 에러 (5xx)
      errorLogData.errorType = 'SERVER';
      errorLogData.errorMessage = '서버 오류가 발생했습니다.';
    } else if (axiosError.response.status >= 400) {
      // 클라이언트 에러 (4xx)
      errorLogData.errorType = 'CLIENT';
      errorLogData.errorMessage = 
        axiosError.response.data?.message || 
        '요청 처리 중 오류가 발생했습니다.';
    }

    // 요청 URL 및 메서드
    errorLogData.requestUrl = axiosError.config?.url;
    errorLogData.httpMethod = axiosError.config?.method?.toUpperCase();

    // 요청 본문 (민감 정보 제외)
    if (axiosError.config?.data) {
      try {
        const requestData = JSON.parse(axiosError.config.data);
        // 비밀번호, 토큰 등 민감 정보 제거
        const sanitizedData = sanitizeRequestBody(requestData);
        errorLogData.requestBody = JSON.stringify(sanitizedData);
      } catch {
        errorLogData.requestBody = axiosError.config.data;
      }
    }

    // 에러 상세 정보 (스택 트레이스)
    errorLogData.errorDetails = JSON.stringify({
      message: axiosError.message,
      stack: axiosError.stack,
      response: axiosError.response?.data,
    });
  } 
  // 일반 JavaScript Error인 경우
  else if (error instanceof Error) {
    errorLogData.errorType = 'CLIENT';
    errorLogData.errorMessage = error.message;
    errorLogData.errorDetails = JSON.stringify({
      message: error.message,
      stack: error.stack,
    });
  } 
  // 기타 에러 (문자열, 객체 등)
  else {
    errorLogData.errorMessage = String(error);
    errorLogData.errorDetails = JSON.stringify(error);
  }

  // 추가 정보 병합
  if (additionalInfo) {
    errorLogData.userId = additionalInfo.userId;
    errorLogData.requestUrl = additionalInfo.requestUrl || errorLogData.requestUrl;
    errorLogData.httpMethod = additionalInfo.httpMethod || errorLogData.httpMethod;

    if (additionalInfo.requestBody) {
      const sanitized = sanitizeRequestBody(additionalInfo.requestBody);
      errorLogData.requestBody = JSON.stringify(sanitized);
    }
  }

  return errorLogData;
};

/**
 * 요청 본문에서 민감한 정보 제거
 * 비밀번호, 토큰, 개인정보 등을 '***'로 치환
 * 
 * @param data - 원본 요청 데이터
 * @returns 민감 정보가 제거된 데이터
 */
const sanitizeRequestBody = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // 민감한 필드명 목록
  const sensitiveFields = [
    'password',
    'passwordConfirm',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'cardNumber',
    'cvv',
    'ssn',
  ];

  // 객체 복사
  const sanitized = { ...data };

  // 민감 필드 마스킹
  Object.keys(sanitized).forEach((key) => {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '***';
    }
  });

  return sanitized;
};

// ─────────────────────────────────────────
// React 컴포넌트에서 사용할 에러 바운더리 헬퍼
// ─────────────────────────────────────────

/**
 * React 컴포넌트 렌더링 에러를 로깅
 * ErrorBoundary 컴포넌트에서 사용
 * 
 * @param error - 발생한 에러
 * @param errorInfo - React 에러 정보 (componentStack)
 * @param userId - 사용자 ID (선택)
 */
export const logReactError = async (
  error: Error,
  errorInfo: { componentStack: string },
  userId?: string
): Promise<void> => {
  const errorLogData: ErrorLogData = {
    errorSource: 'FRONTEND',
    errorType: 'CLIENT',
    errorMessage: `React Rendering Error: ${error.message}`,
    errorDetails: JSON.stringify({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    }),
    userId,
    userAgent: navigator.userAgent,
  };

  try {
    await errorLogClient.post('/error-log', errorLogData);
    console.error('[React Error Logged]', errorLogData);
  } catch (loggingError) {
    console.error('[React Error Logging Failed]', loggingError);
  }
};

// ─────────────────────────────────────────
// 전역 에러 핸들러 설정 (선택 사항)
// ─────────────────────────────────────────

/**
 * 전역 에러 핸들러 초기화
 * 앱 시작 시 한 번만 호출 (main.tsx에서)
 * 브라우저의 unhandledRejection 등을 자동으로 로깅
 */
export const initGlobalErrorHandler = (): void => {
  // Promise rejection 에러 처리
  window.addEventListener('unhandledrejection', (event) => {
    logErrorToServer(event.reason, {
      requestUrl: window.location.href,
    });
  });

  // 일반 JavaScript 에러 처리
  window.addEventListener('error', (event) => {
    logErrorToServer(event.error, {
      requestUrl: window.location.href,
    });
  });

  console.log('[Global Error Handler Initialized]');
};