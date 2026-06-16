// 공지관리 / FAQ API 호출 함수
import axios from 'axios';
import type {
  NoticeListResponse, FaqListResponse, NoticeSaveResponse,
  NoticeFormData, FaqFormData,
} from './types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── 공지사항 ──────────────────────────────────
export const fetchNoticeList = async (): Promise<NoticeListResponse> => {
  const res = await apiClient.get<NoticeListResponse>('/backoffice/notice');
  return res.data;
};

export const saveNotice = async (body: NoticeFormData, idx?: number): Promise<NoticeSaveResponse> => {
  if (idx) {
    const res = await apiClient.put<NoticeSaveResponse>(`/backoffice/notice/${idx}`, body);
    return res.data;
  }
  const res = await apiClient.post<NoticeSaveResponse>('/backoffice/notice', body);
  return res.data;
};

export const deleteNotice = async (idx: number): Promise<NoticeSaveResponse> => {
  const res = await apiClient.delete<NoticeSaveResponse>(`/backoffice/notice/${idx}`);
  return res.data;
};

export const toggleNoticeState = async (idx: number): Promise<NoticeSaveResponse> => {
  const res = await apiClient.patch<NoticeSaveResponse>(`/backoffice/notice/${idx}/toggle`);
  return res.data;
};

// ── FAQ ──────────────────────────────────────
export const fetchFaqList = async (): Promise<FaqListResponse> => {
  const res = await apiClient.get<FaqListResponse>('/backoffice/faq');
  return res.data;
};

export const saveFaq = async (body: FaqFormData, idx?: number): Promise<NoticeSaveResponse> => {
  if (idx) {
    const res = await apiClient.put<NoticeSaveResponse>(`/backoffice/faq/${idx}`, body);
    return res.data;
  }
  const res = await apiClient.post<NoticeSaveResponse>('/backoffice/faq', body);
  return res.data;
};

export const deleteFaq = async (idx: number): Promise<NoticeSaveResponse> => {
  const res = await apiClient.delete<NoticeSaveResponse>(`/backoffice/faq/${idx}`);
  return res.data;
};

export const toggleFaqState = async (idx: number): Promise<NoticeSaveResponse> => {
  const res = await apiClient.patch<NoticeSaveResponse>(`/backoffice/faq/${idx}/toggle`);
  return res.data;
};
