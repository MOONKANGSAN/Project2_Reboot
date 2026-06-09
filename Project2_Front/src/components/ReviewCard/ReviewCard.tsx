// 리뷰 카드 공유 컴포넌트 — ReviewListPage, RestaurantDetailPage 모두에서 사용
import { useNavigate } from 'react-router-dom';
import { resolveImageUrl, type PublicReviewItem } from '@/api/reviewApi';
import { SirenIcon } from '@/components/ReportModal/ReportModal';
import './ReviewCard.css';

// 정수 별점 → 별 문자열 변환
function renderStars(rating: number): string {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 좋아요 하트 아이콘
function HeartIcon({ filled }: { filled: boolean }): JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export interface ReviewCardProps {
  item: PublicReviewItem;
  isLiked: boolean;
  onToggleLike: (reviewIdx: number) => void;
  onOpenDetail: (item: PublicReviewItem) => void;
  onOpenReport: (reviewIdx: number) => void;
}

function ReviewCard({ item, isLiked, onToggleLike, onOpenDetail, onOpenReport }: ReviewCardProps): JSX.Element {
  const navigate      = useNavigate();
  const reviewImg     = resolveImageUrl(item.imageUrl);
  const restaurantImg = resolveImageUrl(item.restaurantImageUrl);

  return (
    <article className="rv-card rv-card--clickable" onClick={() => onOpenDetail(item)} style={{ position: 'relative' }}>

      {/* 우측 상단 신고 버튼 */}
      <button
        type="button"
        className="rv-report-btn"
        onClick={e => { e.stopPropagation(); onOpenReport(item.idx); }}
        aria-label="리뷰 신고"
        title="리뷰 신고"
      >
        <SirenIcon size={15} />
      </button>

      {/* 점포 정보 — 클릭 시 점포 뷰 이동 */}
      <div
        className="rv-card__restaurant"
        onClick={e => { e.stopPropagation(); navigate(`/restaurants/${item.restaurantIdx}`); }}
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

      {/* 리뷰 본문 */}
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

        {/* 리뷰 텍스트 — 3줄 말줄임 */}
        <p className="rv-card__content">{item.content}</p>

        {/* 리뷰 이미지 (선택) */}
        {reviewImg && (
          <div className="rv-card__img-wrap">
            <img src={reviewImg} alt="리뷰 이미지" className="rv-card__img" />
          </div>
        )}

        {/* 좋아요 버튼 */}
        <div className="rv-card__footer">
          <button
            type="button"
            className={`rv-like-btn ${isLiked ? 'rv-like-btn--active' : ''}`}
            onClick={e => { e.stopPropagation(); onToggleLike(item.idx); }}
            aria-label={isLiked ? '좋아요 취소' : '좋아요'}
          >
            <HeartIcon filled={isLiked} />
            <span>{item.likeCount}</span>
          </button>
        </div>

      </div>
    </article>
  );
}

export default ReviewCard;
