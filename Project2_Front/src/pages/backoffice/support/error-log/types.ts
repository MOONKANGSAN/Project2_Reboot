// 에러 로그 관련 타입 정의

export type LogLevel = 'ERROR' | 'WARN' | 'INFO';
export type LogLevelFilter = '전체' | LogLevel;

export interface ErrorLogItem {
  idx: number;
  level: LogLevel;
  message: string;
  path: string;         // 요청 URL 또는 컴포넌트 경로
  stackTrace?: string;  // 상세 스택 트레이스 (선택)
  userId?: string;      // 발생 시 로그인 유저
  userAgent?: string;   // 브라우저/환경 정보
  regDate: string;      // ISO 날짜 문자열
}

export interface ErrorLogListResponse {
  success: boolean;
  message?: string;
  data: ErrorLogItem[];
  total: number;
}
