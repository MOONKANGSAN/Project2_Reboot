import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReviewListItem, StateFilter } from './types';
import { fetchReviewList, toggleReviewState } from './api';
import './BackofficeReviewListPage.css';

const PAGE_SIZE = 15;
const STATES: StateFilter[] = ['전체', '활성', '비활성'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function renderStars(rating: number): string {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('');
}

// 페이지네이션 컴포넌트
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps): JSX.Element {
  if (totalPages <= 1) return <></>;

  // 현재 페이지 기준 최대 5개 버튼 표시
  const WINDOW = 5;
  const half = Math.floor(WINDOW / 2);
  let start = Math.max(1, currentPage - half);
  let end   = Math.min(totalPages, start + WINDOW - 1);
  if (end - start + 1 < WINDOW) start = Math.max(1, end - WINDOW + 1);

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="bo-pagination">
      <button
        className="bo-page-btn bo-page-btn--nav"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        title="처음"
      >
        «
      </button>
      <button
        className="bo-page-btn bo-page-btn--nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="이전"
      >
        ‹
      </button>

      {start > 1 && <span className="bo-page-ellipsis">…</span>}

      {pages.map(p => (
        <button
          key={p}
          className={`bo-page-btn ${p === currentPage ? 'bo-page-btn--active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && <span className="bo-page-ellipsis">…</span>}

      <button
        className="bo-page-btn bo-page-btn--nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="다음"
      >
        ›
      </button>
      <button
        className="bo-page-btn bo-page-btn--nav"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        title="마지막"
      >
        »
      </button>
    </div>
  );
}

function BackofficeReviewListPage(): JSX.Element {
  const navigate = useNavigate();

  const [items, setItems]           = useState<ReviewListItem[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  const [stateFilter, setStateFilter] = useState<StateFilter>('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchReviewList()
      .then(res => {
        if (res.success) setItems(res.data);
        else setErrorMsg(res.message ?? '목록을 불러오는데 실패했습니다.');
      })
      .catch(() => setErrorMsg('서버에 연결할 수 없습니다.'))
      .finally(() => setIsLoading(false));
  }, []);

  // 필터·검색 바뀌면 1페이지로 초기화
  useEffect(() => { setCurrentPage(1); }, [stateFilter, searchKeyword]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const stateMatch =
        stateFilter === '전체' ||
        (stateFilter === '활성'   && item.state === 1) ||
        (stateFilter === '비활성' && item.state === 0);
      const keyword = searchKeyword.trim().toLowerCase();
      const keywordMatch =
        !keyword ||
        item.restaurantName.toLowerCase().includes(keyword) ||
        item.nickname.toLowerCase().includes(keyword);
      return stateMatch && keywordMatch;
    });
  }, [items, stateFilter, searchKeyword]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startNo     = (currentPage - 1) * PAGE_SIZE; // 전체 기준 순번 오프셋

  const handleStateToggle = async (e: React.MouseEvent, idx: number): Promise<void> => {
    e.stopPropagation();
    if (togglingIds.has(idx)) return;
    setTogglingIds(prev => new Set([...prev, idx]));
    try {
      const res = await toggleReviewState(idx);
      if (res.success && res.state !== undefined) {
        setItems(prev =>
          prev.map(item => item.idx === idx ? { ...item, state: res.state! } : item)
        );
      } else {
        alert('상태 변경 실패: ' + (res.message ?? '알 수 없는 오류'));
      }
    } catch {
      alert('서버에 연결할 수 없습니다.');
    } finally {
      setTogglingIds(prev => { const n = new Set(prev); n.delete(idx); return n; });
    }
  };

  return (
    <div className="bo-list-page">

      {/* 헤더 */}
      <div className="bo-list-header">
        <div>
          <h2 className="bo-list-title">리뷰 목록</h2>
          <p className="bo-list-subtitle">상태 버튼을 클릭하면 즉시 활성/비활성 전환됩니다.</p>
        </div>
      </div>

      {/* 툴바 */}
      <div className="bo-list-toolbar">
        {/* 검색 */}
        <div className="bo-search-wrap">
          <svg className="bo-search-icon" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="bo-search-input"
            type="text"
            placeholder="점포명 또는 작성자 검색"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
          />
          {searchKeyword && (
            <button className="bo-search-clear" onClick={() => setSearchKeyword('')}>✕</button>
          )}
        </div>

        <div className="bo-toolbar-divider" />

        {/* 상태 필터 */}
        <span className="bo-filter-label">상태</span>
        <div className="bo-filter-group">
          {STATES.map(st => (
            <button
              key={st}
              className={`bo-filter-btn ${stateFilter === st ? 'is-active' : ''}`}
              onClick={() => setStateFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        <span className="bo-list-count">총 {filtered.length}건</span>
      </div>

      {/* 테이블 카드 */}
      <div className="bo-list-card">
        {isLoading ? (
          <div className="bo-list-loading">불러오는 중...</div>
        ) : errorMsg ? (
          <div className="bo-list-error">{errorMsg}</div>
        ) : filtered.length === 0 ? (
          <div className="bo-list-empty">
            <span className="bo-list-empty__icon">📝</span>
            <p className="bo-list-empty__text">리뷰가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="bo-table-wrap">
              <table className="bo-table">
                <thead>
                  <tr>
                    <th className="col-idx">NO</th>
                    <th>점포명</th>
                    <th>작성자</th>
                    <th className="col-rating">별점</th>
                    <th className="col-content">내용</th>
                    <th className="col-like">좋아요</th>
                    <th className="col-image">이미지</th>
                    <th className="col-state">상태</th>
                    <th className="col-date">등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item, i) => (
                    <tr
                      key={item.idx}
                      className="bo-table-row--clickable"
                      onClick={() => navigate(`/restaurants/${item.restaurantIdx}`)}
                    >
                      <td className="col-idx">{startNo + i + 1}</td>
                      <td className="bo-cell-name">{item.restaurantName}</td>
                      <td>
                        <div className="bo-cell-author">
                          <span className="bo-author-avatar">{item.nickname.charAt(0)}</span>
                          {item.nickname}
                        </div>
                      </td>
                      <td className="col-rating">
                        <span className="bo-cell-stars">{renderStars(item.rating)}</span>
                        <span className="bo-cell-rating-num">{item.rating}</span>
                      </td>
                      <td className="col-content">
                        <span className="bo-cell-content">{item.content}</span>
                      </td>
                      <td className="col-like">{item.likeCount}</td>
                      <td className="col-image">
                        {item.hasImage
                          ? <span className="bo-badge-yes">있음</span>
                          : <span className="bo-badge-no">없음</span>
                        }
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {item.state === 1 ? (
                          <button
                            className="bo-state-btn bo-state-btn--active"
                            onClick={e => handleStateToggle(e, item.idx)}
                            disabled={togglingIds.has(item.idx)}
                            title="클릭하면 비활성으로 변경"
                          >
                            <span className="bo-state-btn__dot" />
                            {togglingIds.has(item.idx) ? '처리중...' : '활성'}
                          </button>
                        ) : (
                          <button
                            className="bo-state-btn bo-state-btn--inactive"
                            onClick={e => handleStateToggle(e, item.idx)}
                            disabled={togglingIds.has(item.idx)}
                            title="클릭하면 활성으로 변경"
                          >
                            <span className="bo-state-btn__dot" />
                            {togglingIds.has(item.idx) ? '처리중...' : '비활성'}
                          </button>
                        )}
                      </td>
                      <td className="col-date">{formatDate(item.regDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지 정보 + 페이지네이션 */}
            <div className="bo-pagination-wrap">
              <span className="bo-page-info">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length}건
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default BackofficeReviewListPage;
