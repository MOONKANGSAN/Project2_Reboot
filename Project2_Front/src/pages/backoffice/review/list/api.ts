import axios from 'axios';
import type { ReviewListApiResponse, StateToggleApiResponse } from './types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// 전체 리뷰 목록 조회 (백오피스용)
export const fetchReviewList = async (): Promise<ReviewListApiResponse> => {
  const response = await apiClient.get<ReviewListApiResponse>('/reviews/admin');
  return response.data;
};

// 리뷰 상태 토글 (1→0, 0→1)
export const toggleReviewState = async (idx: number): Promise<StateToggleApiResponse> => {
  const response = await apiClient.patch<StateToggleApiResponse>(`/reviews/${idx}/state`);
  return response.data;
};
