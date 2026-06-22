import axios from 'axios';
import type { BackofficeLoginApiResponse } from '@/pages/backoffice/login/types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const loginBackofficeUser = async (
  id: string,
  password: string
): Promise<BackofficeLoginApiResponse> => {
  const response = await apiClient.post<BackofficeLoginApiResponse>('/backoffice/login', {
    id,
    password,
  });
  return response.data;
};
