// 회원 목록 아이템 타입
export interface UserListItem {
  idx: number;
  userId: string;
  nickname: string;
  email: string;
  phoneNumber: string | null;
  state: number;
  regDate: string;
  editDate: string | null;
}

// 회원 목록 API 응답 타입
export interface UserListApiResponse {
  success: boolean;
  message?: string;
  data: UserListItem[];
  total: number;
}

// 상태 필터 타입
export type UserStateFilter = '전체' | '활성' | '비활성';
