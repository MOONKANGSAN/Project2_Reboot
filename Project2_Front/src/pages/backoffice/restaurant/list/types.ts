// 점포 목록 조회 응답 아이템 타입
export interface RestaurantListItem {
  idx: number;
  name: string;
  category: string;
  address: string;
  location: string;
  phone: string;
  priceRange: string | null;
  description: string | null;
  imageUrl: string | null;
  state: number;
  regDate: string;
}

// 점포 목록 API 응답 타입
export interface RestaurantListApiResponse {
  success: boolean;
  message?: string;
  data: RestaurantListItem[];
  total: number;
}

// 상태 토글 API 응답 타입
export interface StateToggleApiResponse {
  success: boolean;
  message?: string;
  idx?: number;
  state?: number;
}

// 필터 상태 타입
export type CategoryFilter = '전체' | '한식' | '일식' | '중식' | '양식' | '카페' | '분식';
export type StateFilter = '전체' | '활성' | '비활성';
