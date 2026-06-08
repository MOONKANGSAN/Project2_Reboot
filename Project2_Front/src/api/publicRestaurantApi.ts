import axios from 'axios';

// 백엔드 베이스 URL (이미지 등 정적 리소스 경로에도 사용)
export const BACKEND_BASE_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// DB에 저장된 상대경로(/uploads/...)를 절대 URL로 변환
export const resolveImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;   // 이미 절대 URL
  return `${BACKEND_BASE_URL}${url}`;       // 상대경로 → 백엔드 URL 추가
};

// 공개 API — 맛집 목록 응답 아이템 타입
export interface PublicRestaurantItem {
  idx: number;
  name: string;
  category: string;
  avgRating: number | null;
  reviewCount: number;
  location: string;
  priceRange: string | null;
  imageUrl: string | null;
  hashtags: string[];
  regDate: string;
}

export interface PublicRestaurantListResponse {
  success: boolean;
  data: PublicRestaurantItem[];
  total: number;
}

// GET /api/restaurants — 활성 점포 목록 (최신 등록순)
export const fetchPublicRestaurants = async (): Promise<PublicRestaurantListResponse> => {
  const response = await apiClient.get<PublicRestaurantListResponse>('/restaurants');
  return response.data;
};

// 점포 상세 응답 타입
export interface PublicRestaurantDetail {
  idx: number;
  name: string;
  category: string;
  address: string;
  location: string;
  phone: string;
  priceRange: string | null;
  description: string | null;
  imageUrl: string | null;
  avgRating: number | null;
  hashtags: string[];
  regDate: string;
}

export interface PublicRestaurantDetailResponse {
  success: boolean;
  data: PublicRestaurantDetail;
}

// GET /api/restaurants/:idx — 점포 상세 조회
export const fetchRestaurantDetail = async (idx: number): Promise<PublicRestaurantDetailResponse> => {
  const response = await apiClient.get<PublicRestaurantDetailResponse>(`/restaurants/${idx}`);
  return response.data;
};
