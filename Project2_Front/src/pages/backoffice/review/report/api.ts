import axios from 'axios';
import type { ReportListApiResponse, StateUpdateApiResponse } from './types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// 신고 목록 조회
export const fetchReportList = async (): Promise<ReportListApiResponse> => {
  const response = await apiClient.get<ReportListApiResponse>('/backoffice/review-reports');
  return response.data;
};

// 신고 처리 상태 변경 (0=대기중, 1=처리완료, 2=기각)
export const updateReportState = async (
  idx: number,
  state: number
): Promise<StateUpdateApiResponse> => {
  const response = await apiClient.patch<StateUpdateApiResponse>(
    `/backoffice/review-reports/${idx}/state`,
    { state }
  );
  return response.data;
};
