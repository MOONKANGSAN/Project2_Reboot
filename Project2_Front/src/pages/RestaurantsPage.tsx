import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  fetchPublicRestaurants,
  resolveImageUrl,
  type PublicRestaurantItem,
} from '@/api/publicRestaurantApi';
import './RestaurantsPage.css';

// ── 타입
type SortKey = 'reviewCount' | 'rating' | 'newest';
type CategoryKey = '전체' | '한식' | '일식' | '중식' | '양식' | '카페' | '분식';

const CATEGORIES: CategoryKey[] = ['전체', '한식', '일식', '중식', '양식', '카페', '분식'];
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'reviewCount', label: '리뷰 많은순' },
  { key: 'rating',      label: '별점 높은순' },
  { key: 'newest',      label: '최신 등록순' },
];

const CATEGORY_COLORS: Record<string, string> = {
  한식: '#e8470a', 일식: '#3b82f6', 중식: '#ef4444',
  양식: '#8b5cf6', 카페: '#f59e0b', 분식: '#10b981',
};

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return Array.from({ length: 5 }, (_, i) => {
    if (i < full) return '★';
    if (i === full && half) return '✮';
    return '☆';
  }).join('');
}

// ── 가로형 카드 (썸네일 왼쪽 + 정보 오른쪽)
function RestaurantRowCard({ item }: { item: PublicRestaurantItem }): JSX.Element {
  const navigate = useNavigate();
  const imageUrl = resolveImageUrl(item.imageUrl);
  const bgColor  = CATEGORY_COLORS[item.category] ?? '#6b7280';
  const isNew    = Date.now() - new Date(item.regDate).getTime() < 7 * 24 * 60 * 60 * 1000;
  const isHot    = item.avgRating !== null && item.avgRating >= 4.5;

  return (
    <article className="rl-card" onClick={() => navigate(`/restaurants/${item.idx}`)}>

      {/* 썸네일 */}
      <div className="rl-card__thumb-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="rl-card__thumb" />
        ) : (
          <div className="rl-card__thumb-placeholder" style={{ backgroundColor: bgColor }}>
            <span>{item.name.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="rl-card__body">
        <div className="rl-card__top">
          <span className="rl-card__category">{item.category}</span>
          <div className="rl-card__badges">
            {isHot && <span className="rl-badge rl-badge--hot">🔥 HOT</span>}
            {isNew && <span className="rl-badge rl-badge--new">NEW</span>}
          </div>
        </div>

        <h3 className="rl-card__name">{item.name}</h3>

        <div className="rl-card__meta">
          {item.avgRating !== null ? (
            <span className="rl-card__rating">
              <span className="rl-card__stars">{renderStars(item.avgRating)}</span>
              <span className="rl-card__rating-num">{item.avgRating.toFixed(1)}</span>
            </span>
          ) : (
            <span className="rl-card__no-rating">평가 없음</span>
          )}
          <span className="rl-card__dot">·</span>
          <span className="rl-card__review-count">리뷰 {item.reviewCount}개</span>
        </div>

        <div className="rl-card__location">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>{item.location}</span>
          {item.priceRange && <><span className="rl-card__dot">·</span><span>{item.priceRange}</span></>}
        </div>

        {item.hashtags.length > 0 && (
          <div className="rl-card__tags">
            {item.hashtags.slice(0, 3).map(tag => (
              <span key={tag} className="rl-card__tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ── 메인 페이지
function RestaurantsPage(): JSX.Element {
  const [searchParams] = useSearchParams();

  const [items, setItems]         = useState<PublicRestaurantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [sortBy, setSortBy]       = useState<SortKey>('reviewCount');
  const [category, setCategory]   = useState<CategoryKey>('전체');
  const [location, setLocation]   = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 배너에서 넘어온 keyword / category 쿼리파라미터를 초기 상태에 반영
  useEffect(() => {
    const keyword = searchParams.get('keyword') ?? '';
    const cat = searchParams.get('category') as CategoryKey | null;
    if (keyword) setSearchQuery(keyword);
    if (cat && CATEGORIES.includes(cat)) setCategory(cat);
  }, []);

  // 데이터 로드
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchPublicRestaurants();
        if (res.success) setItems(res.data);
        else setError('맛집 목록을 불러오지 못했습니다.');
      } catch {
        setError('서버에 연결할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // 지역 목록 동적 추출
  const locationOptions = useMemo(() => {
    const locs = Array.from(new Set(items.map(r => r.location))).sort();
    return ['전체', ...locs];
  }, [items]);

  // 검색 + 필터 + 정렬 적용
  const displayList = useMemo(() => {
    let list = [...items];
    if (searchQuery.trim())
      list = list.filter(r => r.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));
    if (category !== '전체') list = list.filter(r => r.category === category);
    if (location !== '전체') list = list.filter(r => r.location === location);
    if (sortBy === 'reviewCount') list.sort((a, b) => b.reviewCount - a.reviewCount);
    else if (sortBy === 'rating')  list.sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
    return list;
  }, [items, category, location, sortBy, searchQuery]);

  return (
    <div className="rl-page">
      <div className="container">

        {/* 페이지 헤더 */}
        <div className="rl-header">
          <h1 className="rl-header__title">맛집 탐색</h1>
          {!isLoading && !error && (
            <p className="rl-header__count">
              총 <strong>{displayList.length}</strong>개의 맛집
            </p>
          )}
        </div>

        {/* 검색 + 필터 패널 */}
        <div className="rl-filters">

          {/* 점포명 검색 */}
          <div className="rl-search-wrap">
            <svg className="rl-search-icon" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="rl-search-input"
              placeholder="점포명으로 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="rl-search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {/* 정렬 */}
          <div className="rl-filter-row">
            <span className="rl-filter-label">정렬</span>
            <div className="rl-chips">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  className={`rl-chip ${sortBy === opt.key ? 'rl-chip--active' : ''}`}
                  onClick={() => setSortBy(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 카테고리 */}
          <div className="rl-filter-row">
            <span className="rl-filter-label">종류</span>
            <div className="rl-chips rl-chips--scroll">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`rl-chip ${category === cat ? 'rl-chip--active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 지역 */}
          {locationOptions.length > 1 && (
            <div className="rl-filter-row">
              <span className="rl-filter-label">지역</span>
              <div className="rl-chips rl-chips--scroll">
                {locationOptions.map(loc => (
                  <button
                    key={loc}
                    className={`rl-chip ${location === loc ? 'rl-chip--active' : ''}`}
                    onClick={() => setLocation(loc)}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 리스트 */}
        <div className="rl-body">
          {isLoading ? (
            <div className="rl-status">
              <div className="rl-spinner" />
              <p>불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="rl-status rl-status--error">{error}</div>
          ) : displayList.length === 0 ? (
            <div className="rl-status">조건에 맞는 맛집이 없습니다.</div>
          ) : (
            <ul className="rl-list">
              {displayList.map(item => (
                <li key={item.idx}>
                  <RestaurantRowCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

export default RestaurantsPage;
