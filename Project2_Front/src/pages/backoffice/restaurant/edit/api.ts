import axios from 'axios';
import type {
  RestaurantEditFormData,
  RestaurantEditApiResponse,
  RestaurantDetailApiResponse,
} from './types';

const BACKEND = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: `${BACKEND}/api`,
  headers: { 'Content-Type': 'application/json' },
});

export interface RestaurantImageItem {
  idx:      number;
  imgUrl:   string; // /uploads/restaurant/...
  imgOrder: number;
  state:    number;
}

// GET /api/backoffice/restaurant/img/list?restaurantIdx=N — 이미지 목록
export const fetchRestaurantImages = async (
  restaurantIdx: number
): Promise<RestaurantImageItem[]> => {
  const res = await apiClient.get<{ success: boolean; data: RestaurantImageItem[] }>(
    '/backoffice/restaurant/img/list',
    { params: { restaurantIdx } }
  );
  return res.data.success ? res.data.data : [];
};

// DELETE /api/backoffice/restaurant/img/{imgIdx} — 이미지 삭제
export const deleteRestaurantImage = async (imgIdx: number): Promise<void> => {
  await apiClient.delete(`/backoffice/restaurant/img/${imgIdx}`);
};

// POST /api/backoffice/restaurant/img/upload — 이미지 업로드 (multipart)
export const uploadRestaurantImages = async (
  restaurantIdx: number,
  files: File[]
): Promise<{ success: boolean; message: string }> => {
  const form = new FormData();
  form.append('restaurantIdx', String(restaurantIdx));
  files.forEach(f => form.append('images', f));
  const res = await axios.post(
    `${BACKEND}/api/backoffice/restaurant/img/upload`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
};

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
      latitude:  data.lat,
      longitude: data.lng,
      hashtags: data.hashtags,
    }
  );
  return response.data;
};
