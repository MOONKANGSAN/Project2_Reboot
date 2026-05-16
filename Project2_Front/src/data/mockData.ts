// 📁 src/data/mockData.ts
// 역할: 백엔드 연동 전 UI 개발에 사용할 하드코딩 목업 데이터
//       타입을 명시하여 데이터 형태가 Spring API 응답 DTO와 일치하도록 강제
//       API 연결 시 이 파일의 import를 axios/fetch 호출로 교체하면 됨

import type { Restaurant, Review } from "@/types";

// ── 맛집 목록 데이터 ──
// Spring API 예상 엔드포인트: GET /api/restaurants
// Restaurant[] 타입 명시로 데이터 누락/오탈자를 컴파일 타임에 감지
export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 1,
    name: "고향집 순두부",
    category: "한식",
    rating: 4.8,
    reviewCount: 312,
    location: "부산 해운대구",
    distance: "0.3km",
    tags: ["순두부찌개", "된장찌개", "아침식사"],
    priceRange: "₩",
    // 추후 실제 이미지 URL로 교체 (예: CDN 또는 S3 URL)
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80",
    isLiked: false,
    isHot : true,
    isNew: false,
    isTrending: true,
  },
  {
    id: 2,
    name: "스시료코 광안점",
    category: "일식",
    rating: 4.6,
    reviewCount: 187,
    location: "부산 수영구",
    distance: "1.2km",
    tags: ["오마카세", "연어", "방문객추천"],
    priceRange: "₩₩₩",
    imageUrl: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80",
    isLiked: true,
    isHot : true,
    isNew: true,
    isTrending: false,
  },
  {
    id: 3,
    name: "나폴리 피자 & 파스타",
    category: "양식",
    rating: 4.5,
    reviewCount: 224,
    location: "부산 남구",
    distance: "2.1km",
    tags: ["화덕피자", "파스타", "데이트"],
    priceRange: "₩₩",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
    isLiked: false,
    isHot : false,
    isNew: false,
    isTrending: true,
  },
  {
    id: 4,
    name: "시장 국밥",
    category: "한식",
    rating: 4.9,
    reviewCount: 541,
    location: "부산 동래구",
    distance: "3.0km",
    tags: ["돼지국밥", "가성비", "현지인맛집"],
    priceRange: "₩",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80",
    isLiked: true,
    isHot : false,
    isNew: false,
    isTrending: true,
  },
  {
    id: 5,
    name: "블루문 카페",
    category: "카페",
    rating: 4.4,
    reviewCount: 96,
    location: "부산 기장군",
    distance: "4.5km",
    tags: ["오션뷰", "브런치", "인스타감성"],
    priceRange: "₩₩",
    imageUrl: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=400&q=80",
    isLiked: false,
    isHot : true,
    isNew: true,
    isTrending: false,
  },
  {
    id: 6,
    name: "홍대 분식 부산점",
    category: "분식",
    rating: 4.3,
    reviewCount: 158,
    location: "부산 부산진구",
    distance: "1.8km",
    tags: ["떡볶이", "순대", "야식"],
    priceRange: "₩",
    imageUrl: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400&q=80",
    isLiked: false,
    isHot : false,
    isNew: false,
    isTrending: false,
  },
];

// ── 최신 리뷰 데이터 ──
// Spring API 예상 엔드포인트: GET /api/reviews/latest?limit=4
// Review[] 타입 명시로 필드 구조를 엄격하게 관리
export const MOCK_LATEST_REVIEWS: Review[] = [
  {
    id: 101,
    restaurantId: 1,
    restaurantName: "어쩔어쩔쩔",
    restaurantCategory: "한식",
    userNickname: "먹킹부산",
    userAvatar: "먹",
    rating: 5,
    content:
      "진짜 오래된 단골집인데 갈 때마다 맛이 한결같아요. 순두부찌개 국물이 깊고 진해서 아침에 해장하기 딱 좋습니다. 인심도 좋고 가격도 저렴해서 자주 방문하게 됩니다.",
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&q=80",
    createdAt: "2025-04-18",
    likeCount: 24,
  },
  {
    id: 102,
    restaurantId: 2,
    restaurantName: "스시료코 광안점",
    restaurantCategory: "일식",
    userNickname: "일식매니아",
    userAvatar: "일",
    rating: 4,
    content:
      "오마카세 코스가 합리적인 가격에 퀄리티가 정말 좋아요. 연어 품질이 특히 인상적이었고 셰프님이 재료 설명도 친절하게 해주셨어요. 기념일 방문 추천합니다.",
    imageUrl: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=300&q=80",
    createdAt: "2025-04-17",
    likeCount: 18,
  },
  {
    id: 103,
    restaurantId: 3,
    restaurantName: "나폴리 피자 & 파스타",
    restaurantCategory: "양식",
    userNickname: "피자러버",
    userAvatar: "피",
    rating: 5,
    content:
      "화덕에서 구운 나폴리 피자 진짜 최고예요! 도우 가장자리가 바삭하면서도 쫀득한 게 이탈리아 현지 느낌이 납니다. 와인 페어링도 추천해 주셔서 좋았어요.",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80",
    createdAt: "2025-04-16",
    likeCount: 31,
  },
  {
    id: 104,
    restaurantId: 4,
    restaurantName: "시장 국밥",
    restaurantCategory: "한식",
    userNickname: "부산토박이",
    userAvatar: "부",
    rating: 5,
    content:
      "30년 전통의 진짜 부산 돼지국밥입니다. 관광객들도 많이 오는데 맛은 변함없이 훌륭해요. 이른 아침부터 장사하셔서 해장하기 너무 좋고 가성비는 최고입니다.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&q=80",
    createdAt: "2025-04-15",
    likeCount: 47,
  },
];

// ── 좋아요 누른 맛집 데이터 ──
// Spring API 예상 엔드포인트: GET /api/users/{userId}/likes
// 현재는 MOCK_RESTAURANTS에서 isLiked=true인 항목을 필터링
export const MOCK_LIKED_RESTAURANTS: Restaurant[] = MOCK_RESTAURANTS.filter(
  (r: Restaurant) => r.isLiked
);