// 공지관리 및 FAQ 관련 타입 정의

export type NoticeTab = 'notice' | 'faq';

export interface NoticeItem {
  idx: number;
  title: string;
  content: string;
  state: number;      // 1=공개, 0=비공개
  isPinned: number;   // 1=상단고정, 0=일반
  regDate: string;
  updDate?: string;
}

export interface FaqItem {
  idx: number;
  category: string;
  question: string;
  answer: string;
  state: number;      // 1=공개, 0=비공개
  sortOrder: number;
  regDate: string;
  updDate?: string;
}

export interface NoticeListResponse {
  success: boolean;
  message?: string;
  data: NoticeItem[];
  total: number;
}

export interface FaqListResponse {
  success: boolean;
  message?: string;
  data: FaqItem[];
  total: number;
}

export interface NoticeSaveResponse {
  success: boolean;
  message?: string;
  idx?: number;
}

export interface NoticeFormData {
  title: string;
  content: string;
  state: number;
  isPinned: number;
}

export interface FaqFormData {
  category: string;
  question: string;
  answer: string;
  state: number;
  sortOrder: number;
}

export const FAQ_CATEGORIES = [
  '회원/계정', '리뷰 관련', '맛집 정보', '서비스 이용',
  '결제/환불', '앱 오류/버그', '개인정보', '제휴/광고', '기타',
];
