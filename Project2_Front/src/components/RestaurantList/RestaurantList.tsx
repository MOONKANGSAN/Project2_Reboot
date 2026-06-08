import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchPublicRestaurants,
  resolveImageUrl,
  type PublicRestaurantItem,
} from '@/api/publicRestaurantApi';
import type { FoodCategory } from '../../types';
import './RestaurantList.css';

// 카테고리 필터 옵션
const FILTER_OPTIONS: FoodCategory[] = ['전체', '한식', '일식', '중식', '양식', '카페', '분식'];

// 정렬 옵션 (별점 데이터가 없는 초기엔 최신순 고정)
type SortKey = 'newest' | 'rating';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: '최신 등록순' },
  { value: 'rating', label: '별점 높은순' },
];

// 별점 → 별 문자열 변환 (반별 포함)
function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return Array.from({ length: 5 }, (_, i) => {
    if (i < full) return '★';
    if (i === full && half) return '✮';
    return '☆';
  }).join('');
}

// 등록일 기준 7일 이내이면 NEW
function isNewRestaurant(regDate: string): boolean {
  const diff = Date.now() - new Date(regDate).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}

// 이미지 없을 때 카테고리별 플레이스홀더 색상
const CATEGORY_COLORS: Record<string, string> = {
  한식: '#e8470a',
  일식: '#3b82f6',
  중식: '#ef4444',
  양식: '#8b5cf6',
  카페: '#f59e0b',
  분식: '#10b981',
};

// 개별 맛집 카드
function RestaurantCard({ item, onClick }: { item: PublicRestaurantItem; onClick: () => void }): JSX.Element {
  const isNew = isNewRestaurant(item.regDate);
  const isHot = item.avgRating !== null && item.avgRating >= 4.5;
  const hasRating = item.avgRating !== null;
  const bgColor = CATEGORY_COLORS[item.category] ?? '#6b7280';
  // 상대경로를 절대 URL로 변환 (백엔드 정적 리소스 경로 처리)
  const resolvedImageUrl = resolveImageUrl(item.imageUrl);

  return (
    <article className="restaurant-card restaurant-card--clickable" onClick={onClick}>
      {/* 이미지 영역 */}
      <div className="restaurant-card__image-wrap">
        {resolvedImageUrl ? (
          <img
            src={resolvedImageUrl}
            alt={item.name}
            className="restaurant-card__image"
          />
        ) : (
          <div
            className="restaurant-card__image-placeholder"
            style={{ backgroundColor: bgColor }}
          >
            <span className="restaurant-card__image-placeholder-text">
              {item.name.charAt(0)}
            </span>
          </div>
        )}

        {/* NEW 뱃지 */}
        {isNew && (
          <span className="restaurant-card__badge restaurant-card__badge--new">NEW</span>
        )}

        {/* HOT 뱃지 */}
        {isHot && (
          <span className="restaurant-card__badge restaurant-card__badge--hot">🔥 HOT</span>
        )}
      </div>

      {/* 카드 정보 */}
      <div className="restaurant-card__info">
        {/* 카테고리 + 가격대 */}
        <div className="restaurant-card__tags">
          <span className="badge">{item.category}</span>
          {item.priceRange && (
            <span className="restaurant-card__price">{item.priceRange}</span>
          )}
        </div>

        {/* 맛집 이름 */}
        <h3 className="restaurant-card__name">{item.name}</h3>

        {/* 별점 */}
        <div className="restaurant-card__rating-row">
          {hasRating ? (
            <>
              <span className="star-rating">{renderStars(item.avgRating!)}</span>
              <span className="restaurant-card__rating-num">
                {item.avgRating!.toFixed(1)}
              </span>
            </>
          ) : (
            <span className="restaurant-card__no-rating">평가 없음</span>
          )}
        </div>

        {/* 위치 */}
        <div className="restaurant-card__location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>{item.location}</span>
        </div>

        {/* 해시태그 */}
        {item.hashtags.length > 0 && (
          <div className="restaurant-card__tag-list">
            {item.hashtags.slice(0, 3).map((tag) => (
              <span key={tag} className="restaurant-card__tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// 맛집 리스트 메인 컴포넌트
function RestaurantList({ showAll = false }: { showAll?: boolean }): JSX.Element {
  const navigate = useNavigate();
  const [items, setItems] = useState<PublicRestaurantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<FoodCategory>('전체');
  const [sortBy, setSortBy] = useState<SortKey>('newest');

  // 마운트 시 API 조회
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetchPublicRestaurants();
        if (res.success) setItems(res.data);
        else setErrorMsg('맛집 목록을 불러오는데 실패했습니다.');
      } catch {
        setErrorMsg('서버에 연결할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // 카테고리 필터 + 정렬 적용
  const displayList = useMemo(() => {
    let list = activeFilter === '전체'
      ? [...items]
      : items.filter((r) => r.category === activeFilter);

    if (sortBy === 'rating') {
      list.sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
    }
    // 'newest'는 API가 이미 최신순으로 반환

    return showAll ? list : list.slice(0, 6);
  }, [items, activeFilter, sortBy, showAll]);

  return (
    <section className="section restaurant-list">
      <div className="container">

        {/* 섹션 헤더 */}
        <div className="section-header">
          <h2 className="section-title">
            {showAll ? '맛집 탐색' : '등록된 맛집'}
          </h2>
          <p className="section-subtitle">
            {showAll ? '다양한 맛집을 찾아보세요' : '새롭게 등록된 맛집을 만나보세요'}
          </p>
        </div>

        {/* 필터 & 정렬 */}
        <div className="restaurant-list__controls">
          <div className="restaurant-list__filters">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter}
                className={`restaurant-list__filter-btn ${
                  activeFilter === filter ? 'restaurant-list__filter-btn--active' : ''
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <select
            className="restaurant-list__sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* 본문 */}
        {isLoading ? (
          <div className="restaurant-list__status">불러오는 중...</div>
        ) : errorMsg ? (
          <div className="restaurant-list__status restaurant-list__status--error">
            {errorMsg}
          </div>
        ) : displayList.length === 0 ? (
          <div className="restaurant-list__status">
            {activeFilter === '전체'
              ? '등록된 맛집이 없습니다.'
              : `${activeFilter} 카테고리에 등록된 맛집이 없습니다.`}
          </div>
        ) : (
          <div className="restaurant-list__grid">
            {displayList.map((item) => (
              <RestaurantCard
                key={item.idx}
                item={item}
                onClick={() => navigate(`/restaurants/${item.idx}`)}
              />
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {!showAll && !isLoading && !errorMsg && displayList.length > 0 && (
          <div className="restaurant-list__more">
            <button className="btn-outline">맛집 더 보기</button>
          </div>
        )}

      </div>
    </section>
  );
}

export default RestaurantList;
