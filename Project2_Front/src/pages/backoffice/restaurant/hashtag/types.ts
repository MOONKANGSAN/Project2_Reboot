// 해시태그 마스터 아이템
export interface HashtagMasterItem {
  idx: number;
  name: string;
  useCount: number;
  regDate: string;
}

// 해시태그 마스터 목록 API 응답
export interface HashtagMasterListApiResponse {
  success: boolean;
  message?: string;
  data: HashtagMasterItem[];
  total: number;
}
