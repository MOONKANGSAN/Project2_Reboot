import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchRestaurantDetail,
  resolveImageUrl,
  type PublicRestaurantDetail,
} from '@/api/publicRestaurantApi';
import './RestaurantDetailPage.css';

// 별점 → 별 문자열
function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return Array.from({ length: 5 }, (_, i) => {
    if (i < full) return '★';
    if (i === full && half) return '✮';
    return '☆';
  }).join('');
}

// 카테고리별 플레이스홀더 색상
const CATEGORY_COLORS: Record<string, string> = {
  한식: '#e8470a', 일식: '#3b82f6', 중식: '#ef4444',
  양식: '#8b5cf6', 카페: '#f59e0b', 분식: '#10b981',
};

function RestaurantDetailPage(): JSX.Element {
  const { idx } = useParams<{ idx: string }>();
  const navigate = useNavigate();

  const [data, setData]         = useState<PublicRestaurantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!idx) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchRestaurantDetail(Number(idx));
        if (res.success) setData(res.data);
        else setError('점포 정보를 불러오지 못했습니다.');
      } catch {
        setError('서버에 연결할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idx]);

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

  const imageUrl     = resolveImageUrl(data.imageUrl);
  const bgColor      = CATEGORY_COLORS[data.category] ?? '#6b7280';
  const hasRating    = data.avgRating !== null;

  return (
    <div className="rdp">

      {/* ── 히어로 영역 ── */}
      <div className="rdp-hero">
        {imageUrl ? (
          <img src={imageUrl} alt={data.name} className="rdp-hero__img" />
        ) : (
          <div className="rdp-hero__placeholder" style={{ backgroundColor: bgColor }}>
            <span className="rdp-hero__placeholder-char">{data.name.charAt(0)}</span>
          </div>
        )}
        <div className="rdp-hero__overlay" />

        {/* 히어로 위에 올라오는 핵심 정보 */}
        <div className="rdp-hero__content container">
          <button className="rdp-hero__back" onClick={() => navigate(-1)}>
            ← 뒤로
          </button>
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
            {data.priceRange && (
              <span className="rdp-hero__price">{data.priceRange}</span>
            )}
            <span className="rdp-hero__location">📍 {data.location}</span>
          </div>

          {/* 해시태그 */}
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
      <div className="rdp-body container">

        {/* 좌측: 소개글 */}
        <section className="rdp-main">

          {data.description && (
            <div className="rdp-section">
              <h2 className="rdp-section__title">점포 소개</h2>
              <p className="rdp-description">{data.description}</p>
            </div>
          )}

          {/* 리뷰 섹션 placeholder */}
          <div className="rdp-section">
            <h2 className="rdp-section__title">
              리뷰
              {hasRating && (
                <span className="rdp-review-score">{data.avgRating!.toFixed(1)}</span>
              )}
            </h2>
            <div className="rdp-review-empty">
              <p className="rdp-review-empty__text">아직 등록된 리뷰가 없습니다.</p>
              <button
                className="rdp-review-write-btn"
                onClick={() => navigate(`/reviews/write?restaurantIdx=${data.idx}`)}
              >
                리뷰 작성하기
              </button>
            </div>
          </div>

        </section>

        {/* 우측: 기본 정보 사이드바 */}
        <aside className="rdp-sidebar">
          <div className="rdp-info-card">
            <h3 className="rdp-info-card__title">기본 정보</h3>

            <ul className="rdp-info-list">
              <li className="rdp-info-item">
                <span className="rdp-info-icon">📍</span>
                <div>
                  <p className="rdp-info-label">주소</p>
                  <p className="rdp-info-value">{data.address}</p>
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
    </div>
  );
}

export default RestaurantDetailPage;
