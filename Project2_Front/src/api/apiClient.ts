import axios from 'axios';

// 백엔드 주소 설정 (Spring Boot 기본 포트 8080)
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 맛집 관련 API 함수들
export const shopApi = {
  getNearbyShops: () => apiClient.get('/shops/nearby'),
  getRecentReviews: () => apiClient.get('/reviews/recent'),
};

export default apiClient;