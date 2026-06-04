import axios from 'axios';
import type {
  HashtagListApiResponse,
  HashtagMutationApiResponse,
} from './hashtagTypes';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// 점포 해시태그 목록 조회
export const fetchHashtags = async (
  restaurantIdx: number
): Promise<HashtagListApiResponse> => {
  const res = await api.get<HashtagListApiResponse>(
    `/backoffice/restaurant/${restaurantIdx}/hashtag`
  );
  return res.data;
};

// 해시태그 등록
export const addHashtag = async (
  restaurantIdx: number,
  name: string
): Promise<HashtagMutationApiResponse> => {
  const res = await api.post<HashtagMutationApiResponse>(
    `/backoffice/restaurant/${restaurantIdx}/hashtag`,
    { name }
  );
  return res.data;
};

// 해시태그 이름 수정
export const updateHashtag = async (
  hashtagIdx: number,
  name: string
): Promise<HashtagMutationApiResponse> => {
  const res = await api.patch<HashtagMutationApiResponse>(
    `/backoffice/hashtag/${hashtagIdx}`,
    { name }
  );
  return res.data;
};

// 점포에서 해시태그 삭제
export const removeHashtag = async (
  restaurantHashtagIdx: number
): Promise<HashtagMutationApiResponse> => {
  const res = await api.delete<HashtagMutationApiResponse>(
    `/backoffice/restaurant/hashtag/${restaurantHashtagIdx}`
  );
  return res.data;
};
