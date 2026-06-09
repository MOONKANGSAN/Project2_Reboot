export interface ReportListItem {
  idx: number;
  reviewIdx: number;
  reviewContent: string;
  restaurantName: string;
  reporterNickname: string;
  reportType: string;       // ABUSE / IRRELEVANT / OBSCENE / ETC
  customContent: string | null;
  state: number;            // 0=대기중, 1=처리완료, 2=기각
  regDate: string;
}

export interface ReportListApiResponse {
  success: boolean;
  message?: string;
  data: ReportListItem[];
  total: number;
}

export interface StateUpdateApiResponse {
  success: boolean;
  message?: string;
  idx?: number;
  state?: number;
}

export const REPORT_TYPE_LABEL: Record<string, string> = {
  ABUSE:      '욕설/비난',
  IRRELEVANT: '무관한 내용',
  OBSCENE:    '선정적 표현',
  ETC:        '기타',
};

export const STATE_LABEL: Record<number, string> = {
  0: '대기중',
  1: '처리완료',
  2: '기각',
};

export type StateFilter = '전체' | '대기중' | '처리완료' | '기각';
