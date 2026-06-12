import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchRestaurantDetail,
  fetchRestaurantReviews,
  resolveImageUrl,
  type PublicRestaurantDetail,
  type RestaurantReviewItem,
} from '@/api/publicRestaurantApi';
import {
  fetchMyLikes,
  toggleReviewLike,
  type PublicReviewItem,
} from '@/api/reviewApi';
import ReviewCard from '@/components/ReviewCard/ReviewCard';
import ReviewDetailModal from '@/components/ReviewDetailModal/ReviewDetailModal';
import ReportModal from '@/components/ReportModal/ReportModal';
import './RestaurantDetailPage.css';

// 카카오맵 웹사이트 URL 생성 — 좌표 있으면 핀 직접 지정, 없으면 주소 검색
function buildKakaoMapUrl(name: string, address: string, lat?: number | null, lng?: number | null): string {
  if (lat != null && lng != null) {
    return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
  }
  return `https://map.kakao.com/?q=${encodeURIComponent(address)}`;
}

// 히어로 별점 렌더링 (소수점 반별 지원)
function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return Array.from({ length: 5 }, (_, i) => {
    if (i < full) return '★';
    if (i === full && half) return '✮';
    return '☆';
  }).join('');
}

const CATEGORY_COLORS: Record<string, string> = {
  한식: '#e8470a', 일식: '#3b82f6', 중식: '#ef4444',
  양식: '#8b5cf6', 카페: '#f59e0b', 분식: '#10b981',
};

// RestaurantReviewItem → PublicReviewItem 변환 (공유 ReviewCard에 주입)
function toPublicItem(rv: RestaurantReviewItem, restaurant: PublicRestaurantDetail): PublicReviewItem {
  return {
    idx:                rv.idx,
    restaurantIdx:      restaurant.idx,
    restaurantName:     restaurant.name,
    restaurantCategory: restaurant.category,
    restaurantLocation: restaurant.location,
    restaurantImageUrl: restaurant.imageUrl,
    nickname:           rv.nickname,
    rating:             rv.rating,
    content:            rv.content,
    likeCount:          rv.likeCount,
    imageUrl:           rv.imageUrl,
    regDate:            rv.regDate,
  };
}

function RestaurantDetailPage(): JSX.Element {
  const { idx } = useParams<{ idx: string }>();
  const navigate = useNavigate();

  const [data, setData]           = useState<PublicRestaurantDetail | null>(null);
  const [reviews, setReviews]     = useState<RestaurantReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // 좋아요 상태
  const [userId, setUserId]   = useState<string | null>(null);
  const [likedSet, setLikedSet] = useState<Set<number>>(new Set());

  // 모달 상태
  const [modalItem, setModalItem]             = useState<PublicReviewItem | null>(null);
  const [reportTargetIdx, setReportTargetIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!idx) return;

    const sessionRaw = sessionStorage.getItem('userSession');
    const uid = sessionRaw ? JSON.parse(sessionRaw).userId : null;
    setUserId(uid);

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [detailRes, reviewRes, likedIdxList] = await Promise.all([
          fetchRestaurantDetail(Number(idx)),
          fetchRestaurantReviews(Number(idx), 3),
          uid ? fetchMyLikes(uid) : Promise.resolve([] as number[]),
        ]);
        if (detailRes.success) setData(detailRes.data);
        else setError('점포 정보를 불러오지 못했습니다.');
        if (reviewRes.success) setReviews(reviewRes.data);
        setLikedSet(new Set(likedIdxList));
      } catch {
        setError('서버에 연결할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idx]);

  // 좋아요 토글 핸들러
  const handleToggleLike = async (reviewIdx: number): Promise<void> => {
    if (!userId) {
      alert('좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }
    try {
      const { state, likeCount } = await toggleReviewLike(reviewIdx, userId);

      setLikedSet(prev => {
        const next = new Set(prev);
        if (state === 1) next.add(reviewIdx);
        else next.delete(reviewIdx);
        return next;
      });

      // 리뷰 목록 likeCount 반영
      setReviews(prev =>
        prev.map(rv => rv.idx === reviewIdx ? { ...rv, likeCount } : rv)
      );

      // 열려 있는 모달 아이템에도 반영
      setModalItem(prev =>
        prev?.idx === reviewIdx ? { ...prev, likeCount } : prev
      );
    } catch {
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="rdp-status">
        <div className="rdp-spinner" />
        <p>불러오는 중...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rdp-status rdp-status--error">
        <p>{error ?? '점포를 찾을 수 없습니다.'}</p>
        <button className="rdp-back-btn" onClick={() => navigate('/restaurants')}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const heroImageUrl = resolveImageUrl(data.imageUrl);
  const bgColor      = CATEGORY_COLORS[data.category] ?? '#6b7280';
  const hasRating    = data.avgRating !== null;

  // 공유 ReviewCard에 넘길 PublicReviewItem 형태로 변환
  const reviewItems: PublicReviewItem[] = reviews.map(rv => toPublicItem(rv, data));

  return (
    <div className="rdp">

      {/* ── 히어로 ── */}
      <div className="rdp-hero">
        {heroImageUrl ? (
          <img src={heroImageUrl} alt={data.name} className="rdp-hero__img" />
        ) : (
          <div className="rdp-hero__placeholder" style={{ backgroundColor: bgColor }}>
            <span className="rdp-hero__placeholder-char">{data.name.charAt(0)}</span>
          </div>
        )}
        <div className="rdp-hero__overlay" />
        <div id="rdp_herow" className="rdp-hero__content container">
          <button className="rdp-hero__back" onClick={() => navigate(-1)}>← 뒤로</button>
          <span className="rdp-hero__category">{data.category}</span>
          <h1 className="rdp-hero__name">{data.name}</h1>
          <div className="rdp-hero__meta">
            {hasRating ? (
              <span className="rdp-hero__rating">
                <span className="rdp-stars">{renderStars(data.avgRating!)}</span>
                <span className="rdp-rating-num">{data.avgRating!.toFixed(1)}</span>
              </span>
            ) : (
              <span className="rdp-hero__no-rating">평가 없음</span>
            )}
            {data.priceRange && <span className="rdp-hero__price">{data.priceRange}</span>}
            <span className="rdp-hero__location">📍 {data.location}</span>
          </div>
          {data.hashtags.length > 0 && (
            <div className="rdp-hero__tags">
              {data.hashtags.map(tag => (
                <span key={tag} className="rdp-hero__tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 본문 ── */}
      <div id="rdp_bodyw" className="rdp-body container">

        <section className="rdp-main">

          {data.description && (
            <div className="rdp-section">
              <h2 className="rdp-section__title">점포 소개</h2>
              <p className="rdp-description">{data.description}</p>
            </div>
          )}

          {/* 리뷰 섹션 */}
          <div className="rdp-section">
            <h2 className="rdp-section__title">
              리뷰
              {hasRating && (
                <span className="rdp-review-score">{data.avgRating!.toFixed(1)}</span>
              )}
            </h2>

            {reviewItems.length === 0 ? (
              <div className="rdp-review-empty">
                <p className="rdp-review-empty__text">아직 등록된 리뷰가 없습니다.</p>
                <button
                  className="rdp-review-write-btn"
                  onClick={() => navigate(`/reviews/write?restaurantIdx=${data.idx}`)}
                >
                  리뷰 작성하기
                </button>
              </div>
            ) : (
              <>
                {/* 좋아요 많은순 상위 3개 — 가로 균등 분할 그리드 */}
                <div className="rdp-review-grid">
                  {reviewItems.map(item => (
                    <ReviewCard
                      key={item.idx}
                      item={item}
                      isLiked={likedSet.has(item.idx)}
                      onToggleLike={handleToggleLike}
                      onOpenDetail={setModalItem}
                      onOpenReport={setReportTargetIdx}
                    />
                  ))}
                </div>

                <div className="rdp-review-actions">
                  <button
                    className="rdp-review-write-btn"
                    onClick={() => navigate(`/reviews/write?restaurantIdx=${data.idx}`)}
                  >
                    리뷰 작성하기
                  </button>
                  <button
                    className="rdp-review-more-btn"
                    onClick={() => navigate('/reviews')}
                  >
                    전체 리뷰 보기 →
                  </button>
                </div>
              </>
            )}
          </div>

        </section>

        {/* 우측 사이드바 */}
        <aside className="rdp-sidebar">
          <div className="rdp-info-card">
            <h3 className="rdp-info-card__title">기본 정보</h3>
            <ul className="rdp-info-list">
              <li className="rdp-info-item">
                <span className="rdp-info-icon">📍</span>
                <div className="rdp-info-address-wrap">
                  <p className="rdp-info-label">주소</p>
                  <p className="rdp-info-value">{data.address}</p>
                  <button
                    className="rdp-map-btn"
                    onClick={() => window.open(buildKakaoMapUrl(data.name, data.address, data.latitude, data.longitude), '_blank')}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    지도 보기
                  </button>
                </div>
              </li>
              <li className="rdp-info-item">
                <span className="rdp-info-icon">📞</span>
                <div>
                  <p className="rdp-info-label">전화번호</p>
                  <a href={`tel:${data.phone}`} className="rdp-info-value rdp-info-value--link">
                    {data.phone}
                  </a>
                </div>
              </li>
              <li className="rdp-info-item">
                <span className="rdp-info-icon">🍽</span>
                <div>
                  <p className="rdp-info-label">카테고리</p>
                  <p className="rdp-info-value">{data.category}</p>
                </div>
              </li>
              {data.priceRange && (
                <li className="rdp-info-item">
                  <span className="rdp-info-icon">💰</span>
                  <div>
                    <p className="rdp-info-label">가격대</p>
                    <p className="rdp-info-value">{data.priceRange}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </aside>

      </div>

      {/* 리뷰 상세 모달 */}
      <ReviewDetailModal
        item={modalItem}
        isLiked={modalItem ? likedSet.has(modalItem.idx) : false}
        onClose={() => setModalItem(null)}
        onToggleLike={handleToggleLike}
      />

      {/* 신고 모달 */}
      <ReportModal
        reviewIdx={reportTargetIdx}
        onClose={() => setReportTargetIdx(null)}
      />

    </div>
  );
}

export default RestaurantDetailPage;
