import axios from 'axios';
import type { RestaurantListApiResponse, StateToggleApiResponse } from './types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// 점포 전체 목록 조회
export const fetchRestaurantList = async (): Promise<RestaurantListApiResponse> => {
  const response = await apiClient.get<RestaurantListApiResponse>(
    '/backoffice/restaurant/list'
  );
  return response.data;
};

// 점포 상태 토글 (1→0, 0→1)
export const toggleRestaurantState = async (idx: number): Promise<StateToggleApiResponse> => {
  const response = await apiClient.patch<StateToggleApiResponse>(
    `/backoffice/restaurant/${idx}/state`
  );
  return response.data;
};
