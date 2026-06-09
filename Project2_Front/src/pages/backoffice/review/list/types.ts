export interface ReviewListItem {
  idx: number;
  restaurantIdx: number;
  restaurantName: string;
  nickname: string;
  rating: number;
  content: string;
  likeCount: number;
  hasImage: boolean;
  state: number;        // 1=활성, 0=비활성
  regDate: string;
}

export interface ReviewListApiResponse {
  success: boolean;
  message?: string;
  data: ReviewListItem[];
  total: number;
}

export interface StateToggleApiResponse {
  success: boolean;
  message?: string;
  idx?: number;
  state?: number;
}

export type StateFilter = '전체' | '활성' | '비활성';
