// 📁 src/types/index.ts
// 역할: 앱 전체에서 공유하는 TypeScript 타입 및 인터페이스 정의
//       Spring API 응답 DTO 구조와 1:1 대응되도록 설계
//       백엔드 연동 시 이 파일의 타입을 기준으로 API 응답을 검증할 예정

// ─────────────────────────────────────────
// 네비게이션 관련 타입
// ─────────────────────────────────────────

// 개별 탭 메뉴 항목 데이터 구조
export interface NavTab {
  id: string;
  path: string;
  label: string;
}

// ─────────────────────────────────────────
// 카테고리 관련 타입
// ─────────────────────────────────────────

// 음식 카테고리 문자열 리터럴 유니온 - 필터, 뱃지 등에 재사용
export type FoodCategory =
  | "한식" | "일식" | "중식" | "양식" | "카페" | "분식" | "전체";

// 배너 카테고리 버튼 데이터 구조
export interface CategoryItem {
  id: string;
  emoji: string;
  label: FoodCategory;
}

// ─────────────────────────────────────────
// 맛집(Restaurant) 관련 타입
// ─────────────────────────────────────────

// 가격대 표시 리터럴 유니온
export type PriceRange = "₩" | "₩₩" | "₩₩₩" | "₩₩₩₩";

// 맛집 목록 카드용 기본 데이터 구조
// Spring API 예상 엔드포인트: GET /api/restaurants
export interface Restaurant {
  id: number;
  name: string;
  // FoodCategory에서 "전체"는 필터 전용이므로 제외
  category: Exclude<FoodCategory, "전체">;
  rating: number;       // 0.0 ~ 5.0
  reviewCount: number;
  location: string;
  distance: string;     // 예: "0.3km"
  tags: string[];
  priceRange: PriceRange;
  imageUrl: string;     // 추후 CDN/S3 URL로 교체
  isLiked: boolean;
  isHot: boolean;
  isNew: boolean;
  isTrending: boolean;
}

// ─────────────────────────────────────────
// 식당 상세(RestaurantDetail) 관련 타입
// ─────────────────────────────────────────

// 영업시간 단일 요일 항목
// Spring API: GET /api/restaurants/{id} 응답 내 포함 예정
export interface BusinessHour {
  day: string;       // 예: "월~금", "토", "일"
  hours: string;     // 예: "09:00 ~ 21:00"
  isClosed: boolean; // 정기 휴무 여부
}

// 메뉴 단일 항목
// Spring API: GET /api/restaurants/{id}/menus 예정
export interface MenuItem {
  id: number;
  name: string;
  price: number;           // 원 단위 정수
  description: string;
  isSignature: boolean;    // 시그니처 메뉴 여부 (뱃지 표시용)
  imageUrl?: string;       // 메뉴 이미지 (선택값 - 없으면 플레이스홀더 표시)
}

// 별점 분포 항목 - 상세 페이지 평점 분포 바 차트용
export interface RatingDistribution {
  star: number;  // 1 ~ 5
  count: number; // 해당 별점 리뷰 수
}

// 식당 상세 데이터 구조 - Restaurant를 extends하여 상세 전용 필드 추가
// Spring API 예상 엔드포인트: GET /api/restaurants/{id}
export interface RestaurantDetail extends Restaurant {
  address: string;                          // 상세 주소
  phone: string;                            // 전화번호
  description: string;                      // 식당 소개글
  businessHours: BusinessHour[];
  menus: MenuItem[];
  ratingDistribution: RatingDistribution[]; // 별점 1~5점 각 리뷰 수
  reviews: Review[];                        // 해당 식당 리뷰 목록
}

// ─────────────────────────────────────────
// 리뷰(Review) 관련 타입
// ─────────────────────────────────────────

// 리뷰 데이터 구조
// Spring API: GET /api/reviews/latest 또는 GET /api/restaurants/{id}/reviews 응답
export interface Review {
  id: number;
  restaurantId: number;
  restaurantName: string;
  restaurantCategory: Exclude<FoodCategory, "전체">;
  userNickname: string; // userName
  userAvatar: string;   // 이니셜 1~2자 (추후 프로필 이미지 URL로 교체)
  rating: number;       // 1 ~ 5 정수
  content: string;
  imageUrl: string;
  createdAt: string;    // ISO 날짜 문자열 "YYYY-MM-DD",date
  likeCount: number;    // likes
}

// ─────────────────────────────────────────
// 정렬 관련 타입
// ─────────────────────────────────────────

// 정렬 기준값 리터럴 유니온 - API 쿼리 파라미터로 전달될 값
export type SortKey = "rating" | "reviewCount" | "distance";

// 정렬 옵션 드롭다운 항목 데이터 구조
export interface SortOption {
  value: SortKey;
  label: string;
}

// ─────────────────────────────────────────
// 컴포넌트 Props 타입
// ─────────────────────────────────────────

// Navbar 컴포넌트 Props - 라우터 기반으로 변경되어 activeTab, onTabChange 제거
export interface NavbarProps {
  // 라우터가 URL을 관리하므로 더이상 tab 관련 props 불필요
}

// RestaurantCard 컴포넌트 Props
export interface RestaurantCardProps {
  restaurant: Restaurant;
  onLikeToggle: (id: number) => void;
}

// RestaurantList 컴포넌트 Props
export interface RestaurantListProps {
  // 전체 목록 페이지 여부 (false: 메인 홈 최대 6개, true: 전체 표시)
  showAll?: boolean;
  // 식당 카드 클릭 시 상세 페이지 전환 콜백 - 추후 라우터로 교체 예정
  onSelectRestaurant?: (id: number) => void;
}

// ReviewCard 컴포넌트 Props
export interface ReviewCardProps {
  review: Review;
}

// RestaurantDetailPage 컴포넌트 Props
export interface RestaurantDetailPageProps {
  restaurantId: number; // 조회할 식당 ID
  onBack: () => void;   // 뒤로가기 콜백 (목록 페이지로 복귀)
}

export interface Shop {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  location: string;
  distance: string;
  tags: string[];
  isHot: boolean;
  isNew: boolean;
}