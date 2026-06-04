import { useState, useEffect, useMemo } from 'react';
import type { HashtagMasterItem } from './types';
import { fetchHashtagMasterList } from './api';
import './BackofficeHashtagListPage.css';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

function BackofficeHashtagListPage(): JSX.Element {
  const [items, setItems] = useState<HashtagMasterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetchHashtagMasterList();
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

  // 검색 필터
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^#/, '');
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, searchQuery]);

  // 사용 횟수 최대값 (바 너비 계산용)
  const maxCount = useMemo(
    () => Math.max(...items.map((i) => i.useCount), 1),
    [items]
  );

  return (
    <div className="bo-hashtag-page">

      {/* 헤더 */}
      <div className="bo-hashtag-header">
        <div>
          <h2 className="bo-hashtag-title">해시태그 목록</h2>
          <p className="bo-hashtag-subtitle">
            등록된 해시태그 마스터 데이터입니다. 각 점포의 태그는 점포 목록에서 관리하세요.
          </p>
        </div>
      </div>

      {/* 검색 툴바 */}
      <div className="bo-hashtag-toolbar">
        <div className="bo-hashtag-search-wrap">
          <span className="bo-hashtag-search-icon">#</span>
          <input
            className="bo-hashtag-search"
            type="text"
            placeholder="태그명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="bo-hashtag-count">총 {filtered.length}개</span>
      </div>

      {/* 테이블 카드 */}
      <div className="bo-hashtag-card">
        {isLoading ? (
          <div className="bo-hashtag-loading">불러오는 중...</div>
        ) : errorMsg ? (
          <div className="bo-hashtag-error">{errorMsg}</div>
        ) : filtered.length === 0 ? (
          <div className="bo-hashtag-empty">
            <span className="bo-hashtag-empty__icon">🏷</span>
            <p className="bo-hashtag-empty__text">
              {searchQuery ? `"${searchQuery}"에 해당하는 태그가 없습니다.` : '등록된 해시태그가 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="bo-hashtag-table-wrap">
            <table className="bo-hashtag-table">
              <thead>
                <tr>
                  <th className="col-no">NO</th>
                  <th>태그명</th>
                  <th>사용 점포 수</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr key={item.idx}>
                    <td className="col-no">{index + 1}</td>
                    <td>
                      <span className="bo-hashtag-cell-name">{item.name}</span>
                    </td>
                    <td>
                      <div className="bo-hashtag-count-bar-wrap">
                        <span
                          className={
                            item.useCount > 0
                              ? 'bo-hashtag-cell-count'
                              : 'bo-hashtag-cell-count bo-hashtag-cell-count-zero'
                          }
                        >
                          {item.useCount}
                        </span>
                        <div className="bo-hashtag-count-bar">
                          <div
                            className="bo-hashtag-count-bar__fill"
                            style={{ width: `${(item.useCount / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="bo-hashtag-cell-date">
                      {item.regDate ? formatDate(item.regDate) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default BackofficeHashtagListPage;
