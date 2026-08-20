// 📁 src/api/profileApi.ts
// 역할: 사용자 프로필 조회, 수정, 이미지 업로드 API

import axios from 'axios';

const apiClient = axios.create({ baseURL: '/api' });

export interface ProfileData {
  userId: string;
  nickname: string;
  phoneNumber: string;
  email: string;
  profileImageUrl?: string;
}

export interface ProfileUpdateRequest {
  userId: string;
  nickname: string;
  phoneNumber: string;
  email: string;
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}

// 프로필 조회
export async function fetchProfile(userId: string): Promise<ApiResponse<ProfileData>> {
  const res = await apiClient.get<ApiResponse<ProfileData>>(`/user/profile/${userId}`);
  return res.data;
}

// 프로필 수정 (닉네임, 전화번호, 이메일)
export async function updateProfile(body: ProfileUpdateRequest): Promise<ApiResponse> {
  const res = await apiClient.put<ApiResponse>('/user/profile', body);
  return res.data;
}

// 프로필 이미지 업로드 (multipart/form-data)
export async function uploadProfileImage(
  userId: string,
  file: File,
): Promise<ApiResponse<{ imageUrl: string }>> {
  const form = new FormData();
  form.append('userId', userId);
  form.append('profileImage', file);
  const res = await apiClient.post<ApiResponse<{ imageUrl: string }>>(
    '/user/profile/image',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data;
}
