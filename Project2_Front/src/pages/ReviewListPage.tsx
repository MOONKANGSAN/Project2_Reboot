import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchPublicReviews,
  fetchMyLikes,
  toggleReviewLike,
  resolveImageUrl,
  type PublicReviewItem,
} from '@/api/reviewApi';
import ReviewDetailModal from '@/components/ReviewDetailModal/ReviewDetailModal';
import ReportModal, { SirenIcon } from '@/components/ReportModal/ReportModal';
import './ReviewListPage.css';

// ── 상수
type CategoryKey = '전체' | '한식' | '일식' | '중식' | '양식' | '카페' | '분식';
const CATEGORIES: CategoryKey[] = ['전체', '한식', '일식', '중식', '양식', '카페', '분식'];
const PAGE_SIZE = 8;

// ── 유틸
function renderStars(rating: number): string {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// ── 좋아요 하트 아이콘
function HeartIcon({ filled }: { filled: boolean }): JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ── 리뷰 카드
interface ReviewCardProps {
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

      {/* 사이렌 신고 버튼 (우측 상단) */}
      <button
        type="button"
        className="rv-report-btn"
        onClick={e => { e.stopPropagation(); onOpenReport(item.idx); }}
        aria-label="리뷰 신고"
        title="리뷰 신고"
      >
        <SirenIcon size={15} />
      </button>

      {/* 점포 정보 (클릭 → 점포 뷰) */}
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

        {/* 리뷰 텍스트 */}
        <p className="rv-card__content">{item.content}</p>

        {/* 리뷰 이미지 */}
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

      // likedSet 업데이트
      setLikedSet(prev => {
        const next = new Set(prev);
        if (state === 1) next.add(reviewIdx);
        else next.delete(reviewIdx);
        return next;
      });

      // 해당 리뷰의 likeCount 업데이트
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
