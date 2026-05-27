// 📁 src/pages/backoffice/signup/api.ts
// 역할: 백오피스 가입 관련 API 호출 함수 모음
//       axios 인스턴스 생성 및 POST /api/backoffice/signup 호출 담당
//       컴포넌트에서 직접 axios를 사용하지 않고 이 함수만 호출

import axios from 'axios';
import type { BackofficeSignupApiResponse } from '@/pages/backoffice/signup/types.ts';

// ── axios 인스턴스: Spring 백엔드 공통 설정 ──
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── 관리자 계정 가입 요청 ──
// POST /api/backoffice/signup
// level: string → number 변환 후 전송
export const signupBackofficeUser = async (
  id: string,
  password: string,
  level: string
): Promise<BackofficeSignupApiResponse> => {
  const response = await apiClient.post<BackofficeSignupApiResponse>('/backoffice/signup', {
    id,
    password,
    level: parseInt(level, 10), // select 값(string) → number 변환
  });
  return response.data;
};