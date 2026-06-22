// 에러 로그 API 호출 함수
import axios from 'axios';
import type { ErrorLogListResponse } from './types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const fetchErrorLogs = async (): Promise<ErrorLogListResponse> => {
  const res = await apiClient.get<ErrorLogListResponse>('/backoffice/error-log');
  return res.data;
};

export const deleteErrorLog = async (idx: number): Promise<{ success: boolean; message?: string }> => {
  const res = await apiClient.delete(`/backoffice/error-log/${idx}`);
  return res.data;
};

export const clearErrorLogs = async (): Promise<{ success: boolean; message?: string }> => {
  const res = await apiClient.delete('/backoffice/error-log');
  return res.data;
};
