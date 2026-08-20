// 📁 src/pages/MyLikedPage.tsx
// 역할: 로그인 사용자가 좋아요한 리뷰 목록 페이지
//       좋아요 취소 시 목록에서 즉시 제거, 페이지당 9개 번호 페이지네이션

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchMyLikedReviews,
  toggleReviewLike,
  type PublicReviewItem,
} from '@/api/reviewApi';
import ReviewCard from '@/components/ReviewCard/ReviewCard';
import ReviewDetailModal from '@/components/ReviewDetailModal/ReviewDetailModal';
import ReportModal from '@/components/ReportModal/ReportModal';
import './MyLikedPage.css';

const PAGE_SIZE = 9;

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function MyLikedPage(): JSX.Element {
  const navigate = useNavigate();

  const sessionRaw = sessionStorage.getItem('userSession');
  const session    = sessionRaw ? JSON.parse(sessionRaw) : null;
  const userId: string | null = session?.userId ?? null;

  const [items, setItems]         = useState<PublicReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  // 좋아요 상태는 전체가 liked=true이므로 Set으로 초기화 후 유지
  const [likedSet, setLikedSet]   = useState<Set<number>>(new Set());
  const [page, setPage]           = useState(1);

  const [modalItem, setModalItem]             = useState<PublicReviewItem | null>(null);
  const [reportTargetIdx, setReportTargetIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) { navigate('/'); return; }

    fetchMyLikedReviews(userId)
      .then(res => {
        if (res.success) {
          setItems(res.data);
          setLikedSet(new Set(res.data.map(r => r.idx)));
        } else {
          setError('좋아요 기록을 불러오지 못했습니다.');
        }
      })
      .catch(() => setError('서버에 연결할 수 없습니다.'))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [items, safePage],
  );

  // 좋아요 토글 — 취소하면 목록에서 즉시 제거
  const handleToggleLike = async (reviewIdx: number): Promise<void> => {
    if (!userId) return;
    try {
      const { state, likeCount } = await toggleReviewLike(reviewIdx, userId);

      if (state === 0) {
        // 좋아요 취소 → 목록에서 제거
        setItems(prev => {
          const next = prev.filter(item => item.idx !== reviewIdx);
          // 현재 페이지가 비어버리면 앞 페이지로 이동
          const newTotal = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
          if (safePage > newTotal) setPage(newTotal);
          return next;
        });
        setLikedSet(prev => { const next = new Set(prev); next.delete(reviewIdx); return next; });
      } else {
        // 재좋아요 (상세 모달에서 다시 누른 경우) → likeCount만 갱신
        setItems(prev =>
          prev.map(item => item.idx === reviewIdx ? { ...item, likeCount } : item),
        );
        setLikedSet(prev => new Set([...prev, reviewIdx]));
      }
    } catch {
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const goPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = buildPageNumbers(safePage, totalPages);

  return (
    <div className="mlk-page">
      <div className="container">

        {/* 헤더 */}
        <div className="mlk-header">
          <div className="mlk-header__left">
            <h1 className="mlk-title">좋아요 기록</h1>
            {!isLoading && !error && (
              <p className="mlk-count">
                총 <strong>{items.length}</strong>개의 리뷰
              </p>
            )}
          </div>
        </div>

        {/* 본문 */}
        {isLoading ? (
          <div className="mlk-status">
            <div className="mlk-spinner" />
            <p>불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="mlk-status mlk-status--error">{error}</div>
        ) : items.length === 0 ? (
          <div className="mlk-empty">
            <p className="mlk-empty__icon">♡</p>
            <p className="mlk-empty__text">아직 좋아요한 리뷰가 없습니다.</p>
            <button
              className="mlk-empty__btn"
              onClick={() => navigate('/reviews')}
            >
              리뷰 둘러보기
            </button>
          </div>
        ) : (
          <>
            <div className="mlk-grid">
              {pageItems.map(item => (
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

            {totalPages > 1 && (
              <nav className="mlk-pagination" aria-label="페이지 이동">
                <button
                  className="mlk-page-btn mlk-page-btn--arrow"
                  onClick={() => goPage(safePage - 1)}
                  disabled={safePage === 1}
                  aria-label="이전 페이지"
                >
                  ‹
                </button>

                {pageNumbers.map((p, i) =>
                  p === '...' ? (
                    <span key={`e-${i}`} className="mlk-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`mlk-page-btn ${safePage === p ? 'mlk-page-btn--active' : ''}`}
                      onClick={() => goPage(p as number)}
                      aria-current={safePage === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  className="mlk-page-btn mlk-page-btn--arrow"
                  onClick={() => goPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  aria-label="다음 페이지"
                >
                  ›
                </button>
              </nav>
            )}
          </>
        )}

      </div>

      <ReviewDetailModal
        item={modalItem}
        isLiked={modalItem ? likedSet.has(modalItem.idx) : false}
        onClose={() => setModalItem(null)}
        onToggleLike={handleToggleLike}
      />

      <ReportModal
        reviewIdx={reportTargetIdx}
        onClose={() => setReportTargetIdx(null)}
      />
    </div>
  );
}

export default MyLikedPage;
