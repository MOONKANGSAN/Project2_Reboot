import axios from 'axios';
import type {
  RestaurantEditFormData,
  RestaurantEditApiResponse,
  RestaurantDetailApiResponse,
} from './types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// 단일 점포 데이터 조회 (수정 페이지 초기값)
export const fetchRestaurantDetail = async (
  idx: number
): Promise<RestaurantDetailApiResponse> => {
  const response = await apiClient.get<RestaurantDetailApiResponse>(
    `/backoffice/restaurant/${idx}`
  );
  return response.data;
};

// 점포에 현재 등록된 해시태그 이름 목록 조회 (수정 페이지 초기값)
export const fetchRestaurantHashtagNames = async (idx: number): Promise<string[]> => {
  const response = await apiClient.get<{
    success: boolean;
    data: { name: string }[];
  }>(`/backoffice/restaurant/${idx}/hashtag`);
  return response.data.success
    ? response.data.data.map((h) => h.name)
    : [];
};

// 점포 정보 수정 (해시태그 포함)
export const updateRestaurant = async (
  idx: number,
  data: RestaurantEditFormData
): Promise<RestaurantEditApiResponse> => {
  const response = await apiClient.patch<RestaurantEditApiResponse>(
    `/backoffice/restaurant/${idx}`,
    {
      name: data.name,
      category: data.category,
      address: data.address,
      location: data.location,
      phone: data.phone,
      priceRange: data.priceRange || null,
      description: data.description || null,
      imageUrl: null,
      hashtags: data.hashtags,
    }
  );
  return response.data;
};
