import axios from 'axios';
import { BACKEND_BASE_URL, resolveImageUrl } from './publicRestaurantApi';

export { resolveImageUrl };

const apiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

export interface PublicReviewItem {
  idx: number;
  restaurantIdx: number;
  restaurantName: string;
  restaurantCategory: string;
  restaurantLocation: string;
  restaurantImageUrl: string | null;
  nickname: string;
  rating: number;
  content: string;
  likeCount: number;
  imageUrl: string | null;
  regDate: string;
}

export interface PublicReviewListResponse {
  success: boolean;
  data: PublicReviewItem[];
  total: number;
}

// GET /api/reviews — 공개 리뷰 목록 (최신순)
export const fetchPublicReviews = async (): Promise<PublicReviewListResponse> => {
  const response = await apiClient.get<PublicReviewListResponse>('/reviews');
  return response.data;
};
