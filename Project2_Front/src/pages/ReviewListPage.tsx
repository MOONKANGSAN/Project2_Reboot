import { useState, useEffect, useMemo } from 'react';
import {
  fetchPublicReviews,
  fetchMyLikes,
  toggleReviewLike,
  type PublicReviewItem,
} from '@/api/reviewApi';
import ReviewCard from '@/components/ReviewCard/ReviewCard';
import ReviewDetailModal from '@/components/ReviewDetailModal/ReviewDetailModal';
import ReportModal from '@/components/ReportModal/ReportModal';
import './ReviewListPage.css';

// ── 상수
type CategoryKey = '전체' | '한식' | '일식' | '중식' | '양식' | '카페' | '분식';
const CATEGORIES: CategoryKey[] = ['전체', '한식', '일식', '중식', '양식', '카페', '분식'];
const PAGE_SIZE = 8;

// ── 메인 페이지
function ReviewListPage(): JSX.Element {
  const [items, setItems]               = useState<PublicReviewItem[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [category, setCategory]         = useState<CategoryKey>('전체');
  const [location, setLocation]         = useState<string>('전체');
  const [visibleCount, setVisibleCount]       = useState(PAGE_SIZE);
  const [modalItem, setModalItem]             = useState<PublicReviewItem | null>(null);
  const [reportTargetIdx, setReportTargetIdx] = useState<number | null>(null);

  // 로그인 세션
  const [userId, setUserId] = useState<string | null>(null);
  // 내가 좋아요한 리뷰 idx Set (빠른 조회용)
  const [likedSet, setLikedSet] = useState<Set<number>>(new Set());

  // 리뷰 목록 + 내 좋아요 목록 병렬 로드
  useEffect(() => {
    const sessionRaw = sessionStorage.getItem('userSession');
    const uid = sessionRaw ? JSON.parse(sessionRaw).userId : null;
    setUserId(uid);

    const reviewsPromise = fetchPublicReviews();
    const likesPromise   = uid ? fetchMyLikes(uid) : Promise.resolve([] as number[]);

    Promise.all([reviewsPromise, likesPromise])
      .then(([reviewRes, likedIdxList]) => {
        if (reviewRes.success) setItems(reviewRes.data);
        else setError('리뷰 목록을 불러오지 못했습니다.');
        setLikedSet(new Set(likedIdxList));
      })
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

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

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

      setItems(prev =>
        prev.map(item =>
          item.idx === reviewIdx ? { ...item, likeCount } : item
        )
      );
    } catch {
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="rvl-page">
      <div className="container">

        {/* 헤더 */}
        <div className="rvl-header">
          <h1 className="rvl-title">리뷰</h1>
          {!isLoading && !error && (
            <p className="rvl-count">총 <strong>{filtered.length}</strong>개의 리뷰</p>
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

export default ReviewListPage;
