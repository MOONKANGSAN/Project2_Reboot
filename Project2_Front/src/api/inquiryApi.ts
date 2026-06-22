import axios from 'axios';

const BACKEND_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// 문의 유형 1~9 정의
export const INQUIRY_TYPES: { value: number; label: string }[] = [
  { value: 1, label: '회원/계정 문의' },
  { value: 2, label: '리뷰 관련'     },
  { value: 3, label: '맛집 정보'     },
  { value: 4, label: '서비스 이용'   },
  { value: 5, label: '결제/환불'     },
  { value: 6, label: '앱 오류/버그'  },
  { value: 7, label: '개인정보 처리' },
  { value: 8, label: '제휴/광고'     },
  { value: 9, label: '기타'          },
];

// 처리 상태 정의
export const INQUIRY_STATES: Record<number, { label: string; color: string }> = {
  0: { label: '대기중', color: '#9ca3af' },
  1: { label: '처리중', color: '#f59e0b' },
  2: { label: '완료',   color: '#10b981' },
  3: { label: '기각',   color: '#ef4444' },
};

export interface InquiryWriteRequest {
  userId:      string | null;
  title:       string;
  content:     string;
  isPublic:    number; // 0 or 1
  inquiryType: number; // 1~9
  password:    string | null;
}

export interface InquiryListItem {
  idx:             number;
  state:           number;
  stateName:       string;
  title:           string;
  isPublic:        number;
  inquiryType:     number;
  inquiryTypeName: string;
  hasAnswer:       boolean;
  regDate:         string;
}

export interface InquiryListResponse {
  success: boolean;
  data:    InquiryListItem[];
  total:   number;
}

// POST /api/inquiry — 문의 작성
export const submitInquiry = async (body: InquiryWriteRequest): Promise<{ success: boolean; inquiryIdx?: number; message?: string }> => {
  const res = await apiClient.post('/inquiry', body);
  return res.data;
};

// GET /api/inquiry/my?userId=xxx — 내 문의 목록
export const fetchMyInquiries = async (userId: string): Promise<InquiryListResponse> => {
  const res = await apiClient.get<InquiryListResponse>('/inquiry/my', { params: { userId } });
  return res.data;
};

// GET /api/inquiry/public — 공개 문의 목록
export const fetchPublicInquiries = async (): Promise<InquiryListResponse> => {
  const res = await apiClient.get<InquiryListResponse>('/inquiry/public');
  return res.data;
};
