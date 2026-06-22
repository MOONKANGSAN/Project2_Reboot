// 백오피스 고객문의 API 호출 함수
import axios from 'axios';
import type {
  BackofficeInquiryListResponse, InquiryAnswerRequest, InquiryStateUpdateResponse,
} from './types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// GET /api/backoffice/inquiry — 전체 문의 목록
export const fetchAllInquiries = async (): Promise<BackofficeInquiryListResponse> => {
  const res = await apiClient.get<BackofficeInquiryListResponse>('/backoffice/inquiry');
  return res.data;
};

// PATCH /api/backoffice/inquiry/:idx/state — 처리 상태 변경
export const updateInquiryState = async (idx: number, newState: number): Promise<InquiryStateUpdateResponse> => {
  const res = await apiClient.patch<InquiryStateUpdateResponse>(`/backoffice/inquiry/${idx}/state`, { newState });
  return res.data;
};

// POST /api/backoffice/inquiry/:idx/answer — 답변 등록
export const submitInquiryAnswer = async (idx: number, body: InquiryAnswerRequest): Promise<InquiryStateUpdateResponse> => {
  const res = await apiClient.post<InquiryStateUpdateResponse>(`/backoffice/inquiry/${idx}/answer`, body);
  return res.data;
};
