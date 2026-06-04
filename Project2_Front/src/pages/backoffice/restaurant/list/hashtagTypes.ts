// 해시태그 응답 아이템
export interface HashtagItem {
  restaurantHashtagIdx: number;
  hashtagIdx: number;
  name: string;
  state: number;
  regDate: string;
}

// 해시태그 목록 API 응답
export interface HashtagListApiResponse {
  success: boolean;
  message?: string;
  data: HashtagItem[];
}

// 해시태그 단건 작업 API 응답 (등록/수정/삭제 공통)
export interface HashtagMutationApiResponse {
  success: boolean;
  message?: string;
  data?: HashtagItem;
}
