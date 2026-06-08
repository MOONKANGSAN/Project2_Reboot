import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchPublicReviews,
  resolveImageUrl,
  type PublicReviewItem,
} from '@/api/reviewApi';
import './ReviewListPage.css';

// ── 상수
type CategoryKey = '전체' | '한식' | '일식' | '중식' | '양식' | '카페' | '분식';
const CATEGORIES: CategoryKey[] = ['전체', '한식', '일식', '중식', '양식', '카페', '분식'];
const PAGE_SIZE = 8;

// ── 별점 → 별 문자열
function renderStars(rating: number): string {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('');
}

// ── 날짜 포맷 (reg_date 기준)
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// ── 리뷰 카드
function ReviewCard({ item }: { item: PublicReviewItem }): JSX.Element {
  const navigate       = useNavigate();
  const reviewImg      = resolveImageUrl(item.imageUrl);
  const restaurantImg  = resolveImageUrl(item.restaurantImageUrl);

  return (
    <article className="rv-card">

      {/* 카드 상단: 점포 정보 */}
      <div
        className="rv-card__restaurant"
        onClick={() => navigate(`/restaurants/${item.restaurantIdx}`)}
        role="button"
        tabIndex={0}
      >
        <div className="rv-card__restaurant-thumb">
          {restaurantImg ? (
            <img src={restaurantImg} alt={item.restaurantName} />
          ) : (
            <div className="rv-card__restaurant-thumb-placeholder">
              {item.restaurantName.charAt(0)}
            </div>
          )}
        </div>
        <div className="rv-card__restaurant-info">
          <span className="rv-card__restaurant-name">{item.restaurantName}</span>
          <div className="rv-card__restaurant-meta">
            <span className="rv-card__category-badge">{item.restaurantCategory}</span>
            <span className="rv-card__location">📍 {item.restaurantLocation}</span>
          </div>
        </div>
        <span className="rv-card__arrow">›</span>
      </div>

      <div className="rv-card__divider" />

      {/* 카드 본문: 리뷰 내용 */}
      <div className="rv-card__body">

        {/* 작성자 + 별점 + 날짜 */}
        <div className="rv-card__meta-row">
          <div className="rv-card__author">
            <span className="rv-card__avatar">{item.nickname.charAt(0)}</span>
            <span className="rv-card__nickname">{item.nickname}</span>
          </div>
          <span className="rv-card__stars">{renderStars(item.rating)}</span>
          <span className="rv-card__rating-num">{item.rating}.0</span>
          <span className="rv-card__date">{formatDate(item.regDate)}</span>
        </div>

        {/* 리뷰 텍스트 */}
        <p className="rv-card__content">{item.content}</p>

        {/* 리뷰 이미지 */}
        {reviewImg && (
          <div className="rv-card__img-wrap">
            <img src={reviewImg} alt="리뷰 이미지" className="rv-card__img" />
          </div>
        )}

        {/* 좋아요 */}
        <div className="rv-card__footer">
          <span className="rv-card__likes">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {item.likeCount}
          </span>
        </div>

      </div>
    </article>
  );
}

// ── 메인 페이지
function ReviewListPage(): JSX.Element {
  const [items, setItems]         = useState<PublicReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [category, setCategory]   = useState<CategoryKey>('전체');
  const [location, setLocation]   = useState<string>('전체');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchPublicReviews()
      .then(res => { if (res.success) setItems(res.data); else setError('리뷰 목록을 불러오지 못했습니다.'); })
      .catch(() => setError('서버에 연결할 수 없습니다.'))
      .finally(() => setIsLoading(false));
  }, []);

  // 필터 바뀌면 표시 개수 초기화
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [category, location]);

  // 지역 옵션 동적 추출
  const locationOptions = useMemo(() => {
    const locs = Array.from(new Set(items.map(r => r.restaurantLocation))).sort();
    return ['전체', ...locs];
  }, [items]);

  // 필터 적용
  const filtered = useMemo(() => {
    let list = [...items];
    if (category !== '전체') list = list.filter(r => r.restaurantCategory === category);
    if (location !== '전체') list = list.filter(r => r.restaurantLocation === location);
    return list;
  }, [items, category, location]);

  const visible    = filtered.slice(0, visibleCount);
  const hasMore    = visibleCount < filtered.length;

  return (
    <div className="rvl-page">
      <div className="container">

        {/* 헤더 */}
        <div className="rvl-header">
          <h1 className="rvl-title">리뷰</h1>
          {!isLoading && !error && (
            <p className="rvl-count">
              총 <strong>{filtered.length}</strong>개의 리뷰
            </p>
          )}
        </div>

        {/* 필터 바 */}
        <div className="rvl-filters">
          <div className="rvl-filter-row">
            <span className="rvl-filter-label">종류</span>
            <div className="rvl-chips">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`rvl-chip ${category === cat ? 'rvl-chip--active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {locationOptions.length > 1 && (
            <div className="rvl-filter-row">
              <span className="rvl-filter-label">지역</span>
              <div className="rvl-chips rvl-chips--scroll">
                {locationOptions.map(loc => (
                  <button
                    key={loc}
                    className={`rvl-chip ${location === loc ? 'rvl-chip--active' : ''}`}
                    onClick={() => setLocation(loc)}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 카드 그리드 */}
        {isLoading ? (
          <div className="rvl-status">
            <div className="rvl-spinner" />
            <p>불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="rvl-status rvl-status--error">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="rvl-status">조건에 맞는 리뷰가 없습니다.</div>
        ) : (
          <>
            <div className="rvl-grid">
              {visible.map(item => (
                <ReviewCard key={item.idx} item={item} />
              ))}
            </div>

            {/* 더보기 버튼 */}
            {hasMore && (
              <div className="rvl-more">
                <button
                  className="rvl-more-btn"
                  onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                >
                  더보기 ({filtered.length - visibleCount}개 남음)
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default ReviewListPage;
