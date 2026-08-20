// 📁 src/pages/MyReviewPage.tsx
// 역할: 로그인 사용자가 작성한 리뷰만 조회하는 내 리뷰 관리 페이지
//       페이지당 9개, 번호 페이지네이션 제공

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchMyReviews,
  fetchMyLikes,
  toggleReviewLike,
  type PublicReviewItem,
} from '@/api/reviewApi';
import ReviewCard from '@/components/ReviewCard/ReviewCard';
import ReviewDetailModal from '@/components/ReviewDetailModal/ReviewDetailModal';
import ReportModal from '@/components/ReportModal/ReportModal';
import './MyReviewPage.css';

const PAGE_SIZE = 9;

// 페이지 번호 배열 생성 — 총 페이지가 많을 때 앞뒤 생략(...)
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

function MyReviewPage(): JSX.Element {
  const navigate = useNavigate();

  const sessionRaw = sessionStorage.getItem('userSession');
  const session    = sessionRaw ? JSON.parse(sessionRaw) : null;
  const userId: string | null = session?.userId ?? null;

  const [items, setItems]     = useState<PublicReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [likedSet, setLikedSet]   = useState<Set<number>>(new Set());
  const [page, setPage]           = useState(1);

  const [modalItem, setModalItem]             = useState<PublicReviewItem | null>(null);
  const [reportTargetIdx, setReportTargetIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) { navigate('/'); return; }

    const reviewsPromise = fetchMyReviews(userId);
    const likesPromise   = fetchMyLikes(userId);

    Promise.all([reviewsPromise, likesPromise])
      .then(([reviewRes, likedIdxList]) => {
        if (reviewRes.success) setItems(reviewRes.data);
        else setError('리뷰를 불러오지 못했습니다.');
        setLikedSet(new Set(likedIdxList));
      })
      .catch(() => setError('서버에 연결할 수 없습니다.'))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  // 페이지가 범위를 벗어나지 않도록 보정
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [items, safePage],
  );

  const handleToggleLike = async (reviewIdx: number): Promise<void> => {
    if (!userId) return;
    try {
      const { state, likeCount } = await toggleReviewLike(reviewIdx, userId);
      setLikedSet(prev => {
        const next = new Set(prev);
        if (state === 1) next.add(reviewIdx); else next.delete(reviewIdx);
        return next;
      });
      setItems(prev =>
        prev.map(item => item.idx === reviewIdx ? { ...item, likeCount } : item),
      );
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
    <div className="mrv-page">
      <div className="container">

        {/* 헤더 */}
        <div className="mrv-header">
          <div className="mrv-header__left">
            <h1 className="mrv-title">내 리뷰 관리</h1>
            {!isLoading && !error && (
              <p className="mrv-count">
                총 <strong>{items.length}</strong>개의 리뷰
              </p>
            )}
          </div>
          <button
            className="mrv-write-btn"
            onClick={() => navigate('/reviews/write')}
          >
            + 리뷰 작성
          </button>
        </div>

        {/* 본문 */}
        {isLoading ? (
          <div className="mrv-status">
            <div className="mrv-spinner" />
            <p>불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="mrv-status mrv-status--error">{error}</div>
        ) : items.length === 0 ? (
          <div className="mrv-empty">
            <p className="mrv-empty__text">아직 작성한 리뷰가 없습니다.</p>
            <button
              className="mrv-empty__btn"
              onClick={() => navigate('/restaurants')}
            >
              맛집 둘러보기
            </button>
          </div>
        ) : (
          <>
            {/* 카드 그리드 */}
            <div className="mrv-grid">
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

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <nav className="mrv-pagination" aria-label="페이지 이동">
                <button
                  className="mrv-page-btn mrv-page-btn--arrow"
                  onClick={() => goPage(safePage - 1)}
                  disabled={safePage === 1}
                  aria-label="이전 페이지"
                >
                  ‹
                </button>

                {pageNumbers.map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="mrv-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`mrv-page-btn ${safePage === p ? 'mrv-page-btn--active' : ''}`}
                      onClick={() => goPage(p as number)}
                      aria-current={safePage === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  className="mrv-page-btn mrv-page-btn--arrow"
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

export default MyReviewPage;
