import axios from 'axios';
import type { HashtagMasterListApiResponse } from './types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// 해시태그 마스터 전체 목록 조회
export const fetchHashtagMasterList = async (): Promise<HashtagMasterListApiResponse> => {
  const response = await apiClient.get<HashtagMasterListApiResponse>(
    '/backoffice/hashtag/list'
  );
  return response.data;
};
