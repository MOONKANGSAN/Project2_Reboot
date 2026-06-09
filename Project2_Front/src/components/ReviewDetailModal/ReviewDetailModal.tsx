import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveImageUrl, type PublicReviewItem } from '@/api/reviewApi';
import ReportModal, { SirenIcon } from '@/components/ReportModal/ReportModal';
import './ReviewDetailModal.css';

interface ReviewDetailModalProps {
  item: PublicReviewItem | null;
  isLiked: boolean;
  onClose: () => void;
  onToggleLike: (reviewIdx: number) => void;
}

function renderStars(rating: number): string {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function ReviewDetailModal({ item, isLiked, onClose, onToggleLike }: ReviewDetailModalProps): JSX.Element | null {
  const navigate = useNavigate();
  const isOpen   = item !== null;
  const [reportTargetIdx, setReportTargetIdx] = useState<number | null>(null);

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // 열려 있는 동안 배경 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!item) return null;

  const reviewImg     = resolveImageUrl(item.imageUrl);
  const restaurantImg = resolveImageUrl(item.restaurantImageUrl);

  const handleRestaurantClick = (): void => {
    onClose();
    navigate(`/restaurants/${item.restaurantIdx}`);
  };

  return (
    // 백드롭 — 클릭 시 모달 닫기
    <div className="rdm-backdrop" onClick={onClose} aria-modal="true" role="dialog">

      {/* 카드 — 버블링 차단 */}
      <div className="rdm-card" onClick={e => e.stopPropagation()}>

        {/* 상단 버튼 행: 신고 + 닫기 */}
        <div className="rdm-top-bar">
          <button
            className="rdm-report-btn"
            onClick={() => setReportTargetIdx(item.idx)}
            aria-label="신고"
            title="이 리뷰 신고하기"
          >
            <SirenIcon size={15} />
            신고
          </button>
          <button className="rdm-close" onClick={onClose} aria-label="닫기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── 점포 정보 (클릭 → 점포 상세 이동) ── */}
        <div className="rdm-restaurant" onClick={handleRestaurantClick} role="button" tabIndex={0}>
          <div className="rdm-restaurant__thumb">
            {restaurantImg ? (
              <img src={restaurantImg} alt={item.restaurantName} />
            ) : (
              <div className="rdm-restaurant__thumb-placeholder">
                {item.restaurantName.charAt(0)}
              </div>
            )}
          </div>
          <div className="rdm-restaurant__info">
            <span className="rdm-restaurant__name">{item.restaurantName}</span>
            <div className="rdm-restaurant__meta">
              <span className="rdm-category">{item.restaurantCategory}</span>
              <span className="rdm-dot">·</span>
              <span className="rdm-location">📍 {item.restaurantLocation}</span>
            </div>
          </div>
          <span className="rdm-restaurant__arrow">›</span>
        </div>

        <div className="rdm-divider" />

        {/* ── 리뷰 본문 ── */}
        <div className="rdm-body">

          {/* 작성자 + 별점 + 날짜 */}
          <div className="rdm-meta-row">
            <div className="rdm-author">
              <span className="rdm-avatar">{item.nickname.charAt(0)}</span>
              <span className="rdm-nickname">{item.nickname}</span>
            </div>
            <div className="rdm-rating-date">
              <span className="rdm-stars">{renderStars(item.rating)}</span>
              <span className="rdm-rating-num">{item.rating}.0</span>
              <span className="rdm-date">{formatDate(item.regDate)}</span>
            </div>
          </div>

          {/* 리뷰 이미지 */}
          {reviewImg && (
            <div className="rdm-img-wrap">
              <img src={reviewImg} alt="리뷰 이미지" className="rdm-img" />
            </div>
          )}

          {/* 리뷰 내용 전체 */}
          <p className="rdm-content">{item.content}</p>

        </div>

        <div className="rdm-divider" />

        {/* ── 하단: 좋아요 ── */}
        <div className="rdm-footer">
          <button
            type="button"
            className={`rdm-like-btn ${isLiked ? 'rdm-like-btn--active' : ''}`}
            onClick={() => onToggleLike(item.idx)}
            aria-label={isLiked ? '좋아요 취소' : '좋아요'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{item.likeCount}</span>
          </button>
        </div>

      </div>

      {/* 신고 모달 (z-index 1100으로 상세 모달 위에 표시) */}
      <ReportModal
        reviewIdx={reportTargetIdx}
        onClose={() => setReportTargetIdx(null)}
      />
    </div>
  );
}

export default ReviewDetailModal;
