// 백오피스 고객문의 관련 타입 정의

export type InquiryStateFilter = '전체' | '대기중' | '처리중' | '완료' | '기각';
export type InquiryTypeFilter  = '전체' | string;

export interface BackofficeInquiryItem {
  idx:             number;
  state:           number;      // 0=대기중, 1=처리중, 2=완료, 3=기각
  stateName:       string;
  title:           string;
  content:         string;
  isPublic:        number;      // 1=공개, 0=비공개
  inquiryType:     number;
  inquiryTypeName: string;
  hasAnswer:       boolean;
  userId:          string | null;
  regDate:         string;
}

export interface BackofficeInquiryListResponse {
  success: boolean;
  message?: string;
  data: BackofficeInquiryItem[];
  total: number;
}

export interface InquiryAnswerRequest {
  answer:   string;
  newState: number;  // 2=완료, 3=기각
}

export interface InquiryStateUpdateResponse {
  success: boolean;
  message?: string;
}
