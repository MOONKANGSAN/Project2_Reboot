import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RestaurantListItem, CategoryFilter, StateFilter } from './types';
import { fetchRestaurantList, setRestaurantState } from './api';
import HashtagModal from './HashtagModal';
import './BackofficeRestaurantListPage.css';

const CATEGORIES: CategoryFilter[] = ['전체', '한식', '일식', '중식', '양식', '카페', '분식'];
const STATES: StateFilter[] = ['전체', '검토대기', '활성', '비활성'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

// 해시태그 모달 대상 점포 정보
interface HashtagModalTarget {
  restaurantIdx: number;
  restaurantName: string;
}

function BackofficeRestaurantListPage(): JSX.Element {
  const navigate = useNavigate();

  const [items, setItems] = useState<RestaurantListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  // 해시태그 모달 상태
  const [hashtagTarget, setHashtagTarget] = useState<HashtagModalTarget | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('전체');
  const [stateFilter, setStateFilter] = useState<StateFilter>('전체');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetchRestaurantList();
        if (res.success) setItems(res.data);
        else setErrorMsg(res.message ?? '목록을 불러오는데 실패했습니다.');
      } catch {
        setErrorMsg('서버에 연결할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch = categoryFilter === '전체' || item.category === categoryFilter;
      const stateMatch =
        stateFilter === '전체'   ||
        (stateFilter === '활성'    && item.state === 1) ||
        (stateFilter === '비활성'  && item.state === 0) ||
        (stateFilter === '검토대기' && item.state === 2);
      return categoryMatch && stateMatch;
    });
  }, [items, categoryFilter, stateFilter]);

  const handleRowClick = (idx: number): void => {
    navigate(`/backoffice/restaurant/edit/${idx}`);
  };

  const handleStateChange = async (
    e: React.MouseEvent,
    idx: number,
    newState: number
  ): Promise<void> => {
    e.stopPropagation();
    if (togglingIds.has(idx)) return;
    setTogglingIds((prev) => new Set([...prev, idx]));
    try {
      const res = await setRestaurantState(idx, newState);
      if (res.success && res.state !== undefined) {
        setItems((prev) =>
          prev.map((item) =>
            item.idx === idx ? { ...item, state: res.state! } : item
          )
        );
      } else {
        alert('상태 변경 실패: ' + (res.message ?? '알 수 없는 오류'));
      }
    } catch {
      alert('서버에 연결할 수 없습니다.');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  };

  // 해시태그 버튼 클릭 — 행 클릭 차단 후 모달 오픈
  const handleHashtagOpen = (
    e: React.MouseEvent,
    item: RestaurantListItem
  ): void => {
    e.stopPropagation();
    setHashtagTarget({ restaurantIdx: item.idx, restaurantName: item.name });
  };

  return (
    <div className="bo-list-page">

      <div className="bo-list-header">
        <div>
          <h2 className="bo-list-title">점포 목록</h2>
          <p className="bo-list-subtitle">행을 클릭하면 수정 페이지로 이동합니다.</p>
        </div>
        <button
          className="bo-btn-register"
          onClick={() => navigate('/backoffice/restaurant/register')}
        >
          + 점포 등록
        </button>
      </div>

      <div className="bo-list-toolbar">
        <span className="bo-filter-label">카테고리</span>
        <div className="bo-filter-group">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`bo-filter-btn ${categoryFilter === cat ? 'is-active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bo-toolbar-divider" />

        <span className="bo-filter-label">상태</span>
        <div className="bo-filter-group">
          {STATES.map((st) => (
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

      <div className="bo-list-card">
        {isLoading ? (
          <div className="bo-list-loading">불러오는 중...</div>
        ) : errorMsg ? (
          <div className="bo-list-error">{errorMsg}</div>
        ) : filtered.length === 0 ? (
          <div className="bo-list-empty">
            <span className="bo-list-empty__icon">🍽</span>
            <p className="bo-list-empty__text">등록된 점포가 없습니다.</p>
          </div>
        ) : (
          <div className="bo-table-wrap">
            <table className="bo-table">
              <thead>
                <tr>
                  <th className="col-idx">NO</th>
                  <th>점포명</th>
                  <th>카테고리</th>
                  <th>지역</th>
                  <th>전화번호</th>
                  <th>가격대</th>
                  <th>상태</th>
                  <th>등록일</th>
                  <th className="col-action">해시태그</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr
                    key={item.idx}
                    className="bo-table-row--clickable"
                    onClick={() => handleRowClick(item.idx)}
                  >
                    <td className="col-idx">{index + 1}</td>
                    <td className="bo-cell-name">{item.name}</td>
                    <td>
                      <span className="bo-badge-category">{item.category}</span>
                    </td>
                    <td>{item.location}</td>
                    <td>{item.phone}</td>
                    <td className="bo-cell-price">{item.priceRange ?? '-'}</td>
                    <td>
                      {item.state === 2 ? (
                        // 검토대기: 승인 / 거절 두 버튼
                        <div className="bo-state-actions">
                          <button
                            className="bo-state-btn bo-state-btn--pending"
                            disabled={togglingIds.has(item.idx)}
                            onClick={(e) => handleStateChange(e, item.idx, 1)}
                            title="승인 — 활성으로 전환"
                          >
                            <span className="bo-state-btn__dot" />
                            {togglingIds.has(item.idx) ? '처리중...' : '검토대기'}
                          </button>
                          <button
                            className="bo-state-btn bo-state-btn--approve"
                            disabled={togglingIds.has(item.idx)}
                            onClick={(e) => handleStateChange(e, item.idx, 1)}
                            title="승인"
                          >승인</button>
                          <button
                            className="bo-state-btn bo-state-btn--reject"
                            disabled={togglingIds.has(item.idx)}
                            onClick={(e) => handleStateChange(e, item.idx, 0)}
                            title="거절"
                          >거절</button>
                        </div>
                      ) : item.state === 1 ? (
                        <button
                          className="bo-state-btn bo-state-btn--active"
                          onClick={(e) => handleStateChange(e, item.idx, 0)}
                          disabled={togglingIds.has(item.idx)}
                          title="클릭하면 비활성으로 변경"
                        >
                          <span className="bo-state-btn__dot" />
                          {togglingIds.has(item.idx) ? '처리중...' : '활성'}
                        </button>
                      ) : (
                        <button
                          className="bo-state-btn bo-state-btn--inactive"
                          onClick={(e) => handleStateChange(e, item.idx, 1)}
                          disabled={togglingIds.has(item.idx)}
                          title="클릭하면 활성으로 변경"
                        >
                          <span className="bo-state-btn__dot" />
                          {togglingIds.has(item.idx) ? '처리중...' : '비활성'}
                        </button>
                      )}
                    </td>
                    <td className="bo-cell-date">{formatDate(item.regDate)}</td>
                    <td>
                      <button
                        className="bo-hashtag-btn"
                        onClick={(e) => handleHashtagOpen(e, item)}
                        title="해시태그 관리"
                      >
                        # 태그
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 해시태그 관리 모달 */}
      {hashtagTarget && (
        <HashtagModal
          restaurantIdx={hashtagTarget.restaurantIdx}
          restaurantName={hashtagTarget.restaurantName}
          onClose={() => setHashtagTarget(null)}
        />
      )}

    </div>
  );
}

export default BackofficeRestaurantListPage;
