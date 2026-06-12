// 📁 src/components/LatestReviews/LatestReviews.tsx
// 역할: 메인 페이지의 "최신 리뷰" 섹션 — ReviewListPage와 동일한 패턴으로 DB에서 조회

import { useState, useEffect } from 'react';
import {
  fetchLatestReviews,
  fetchMyLikes,
  toggleReviewLike,
  type PublicReviewItem,
} from '@/api/reviewApi';
import ReviewCard from '@/components/ReviewCard/ReviewCard';
import ReviewDetailModal from '@/components/ReviewDetailModal/ReviewDetailModal';
import ReportModal from '@/components/ReportModal/ReportModal';
import './LatestReviews.css';

function LatestReviews(): JSX.Element {
  const [items, setItems]       = useState<PublicReviewItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [userId, setUserId]     = useState<string | null>(null);
  const [likedSet, setLikedSet] = useState<Set<number>>(new Set());

  const [modalItem, setModalItem]             = useState<PublicReviewItem | null>(null);
  const [reportTargetIdx, setReportTargetIdx] = useState<number | null>(null);

  useEffect(() => {
    const sessionRaw = sessionStorage.getItem('userSession');
    const uid = sessionRaw ? JSON.parse(sessionRaw).userId : null;
    setUserId(uid);

    const reviewsPromise = fetchLatestReviews(4);
    const likesPromise   = uid ? fetchMyLikes(uid) : Promise.resolve([] as number[]);

    Promise.all([reviewsPromise, likesPromise])
      .then(([reviewRes, likedIdxList]) => {
        if (reviewRes.success) setItems(reviewRes.data);
        else setError('리뷰를 불러오지 못했습니다.');
        setLikedSet(new Set(likedIdxList));
      })
      .catch(() => setError('서버에 연결할 수 없습니다.'))
      .finally(() => setLoading(false));
  }, []);

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
      setItems(prev =>
        prev.map(item => item.idx === reviewIdx ? { ...item, likeCount } : item)
      );
    } catch {
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <section className="section latest-reviews">
      <div className="container">

        <div className="section-header latest-reviews__header">
          <h2 className="section-title">최신 리뷰</h2>
          <p className="section-subtitle">방금 올라온 따끈따끈한 맛집 후기</p>
          <button className="btn-outline latest-reviews__more-btn">
            전체 보기 →
          </button>
        </div>

        <div className="latest-reviews__list">
          {loading && <p className="latest-reviews__status">불러오는 중...</p>}
          {error   && <p className="latest-reviews__status latest-reviews__status--error">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="latest-reviews__status">등록된 리뷰가 없습니다.</p>
          )}
          {items.map(item => (
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
    </section>
  );
}

export default LatestReviews;
