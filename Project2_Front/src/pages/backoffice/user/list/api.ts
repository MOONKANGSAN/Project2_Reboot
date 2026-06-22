import axios from 'axios';
import type { UserListApiResponse } from './types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// 회원 목록 조회 (keyword 없으면 전체, 있으면 아이디·닉네임 검색)
export const fetchUserList = async (keyword?: string): Promise<UserListApiResponse> => {
  const response = await apiClient.get<UserListApiResponse>('/backoffice/user/list', {
    params: keyword ? { keyword } : {},
  });
  return response.data;
};
