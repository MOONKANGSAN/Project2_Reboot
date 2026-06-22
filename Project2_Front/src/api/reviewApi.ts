import axios from 'axios';
import { BACKEND_BASE_URL, resolveImageUrl } from './publicRestaurantApi';

export { resolveImageUrl };

const apiClient = axios.create({
  baseURL: '/api',
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

// GET /api/reviews/latest?limit=N — 메인 페이지용 최신 리뷰 (건수 제한)
export const fetchLatestReviews = async (limit = 4): Promise<PublicReviewListResponse> => {
  const response = await apiClient.get<PublicReviewListResponse>('/reviews/latest', { params: { limit } });
  return response.data;
};

// GET /api/reviews/my-likes?userId=xxx — 내가 좋아요(state=1)한 리뷰 idx 목록
export const fetchMyLikes = async (userId: string): Promise<number[]> => {
  const response = await apiClient.get<{ success: boolean; likedIdxList: number[] }>(
    '/reviews/my-likes',
    { params: { userId } }
  );
  return response.data.likedIdxList ?? [];
};

// POST /api/reviews/{reviewIdx}/like — 좋아요 토글 (state: 0↔1)
export const toggleReviewLike = async (
  reviewIdx: number,
  userId: string
): Promise<{ state: number; likeCount: number }> => {
  const response = await apiClient.post<{ success: boolean; state: number; likeCount: number }>(
    `/reviews/${reviewIdx}/like`,
    { userId }
  );
  return { state: response.data.state, likeCount: response.data.likeCount };
};
