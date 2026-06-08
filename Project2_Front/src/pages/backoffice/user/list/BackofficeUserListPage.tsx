import { useState, useEffect, useMemo, useRef } from 'react';
import type { UserListItem, UserStateFilter } from './types';
import { fetchUserList } from './api';
import './BackofficeUserListPage.css';

const STATE_FILTERS: UserStateFilter[] = ['전체', '활성', '비활성'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

function BackofficeUserListPage(): JSX.Element {
  const [items,      setItems]      = useState<UserListItem[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);

  // 검색 입력 (Enter 또는 버튼 클릭 시 API 호출)
  const [inputValue,    setInputValue]    = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  // 상태 필터 (프론트에서 즉시 적용)
  const [stateFilter, setStateFilter] = useState<UserStateFilter>('전체');

  const inputRef = useRef<HTMLInputElement>(null);

  // 검색어 변경 시 API 재호출
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetchUserList(searchKeyword || undefined);
        if (res.success) setItems(res.data);
        else setErrorMsg(res.message ?? '목록을 불러오는데 실패했습니다.');
      } catch {
        setErrorMsg('서버에 연결할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [searchKeyword]);

  // 상태 필터 (프론트 필터링)
  const filtered = useMemo(() => {
    if (stateFilter === '전체') return items;
    return items.filter(u =>
      stateFilter === '활성' ? u.state === 1 : u.state === 0
    );
  }, [items, stateFilter]);

  const handleSearch = () => setSearchKeyword(inputValue.trim());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleReset = () => {
    setInputValue('');
    setSearchKeyword('');
    inputRef.current?.focus();
  };

  return (
    <div className="bo-user-page">

      {/* 헤더 */}
      <div className="bo-user-header">
        <div>
          <h2 className="bo-user-title">회원 목록</h2>
          <p className="bo-user-subtitle">가입된 서비스 회원을 조회하고 관리하세요.</p>
        </div>
      </div>

      {/* 툴바 */}
      <div className="bo-user-toolbar">
        {/* 검색 */}
        <div className="bo-user-search-wrap">
          <span className="bo-user-search-icon">🔍</span>
          <input
            ref={inputRef}
            className="bo-user-search"
            type="text"
            placeholder="아이디 또는 닉네임 검색..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button className="bo-filter-btn" onClick={handleSearch}>검색</button>
        {searchKeyword && (
          <button className="bo-filter-btn" onClick={handleReset}>초기화</button>
        )}

        <div style={{ width: 1, height: 20, background: 'var(--bo-border)' }} />

        {/* 상태 필터 */}
        <span className="bo-filter-label">상태</span>
        <div className="bo-filter-group">
          {STATE_FILTERS.map(f => (
            <button
              key={f}
              className={`bo-filter-btn ${stateFilter === f ? 'is-active' : ''}`}
              onClick={() => setStateFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <span className="bo-user-count">총 {filtered.length}명</span>
      </div>

      {/* 테이블 카드 */}
      <div className="bo-user-card">
        {isLoading ? (
          <div className="bo-user-loading">불러오는 중...</div>
        ) : errorMsg ? (
          <div className="bo-user-error">{errorMsg}</div>
        ) : filtered.length === 0 ? (
          <div className="bo-user-empty">
            <span className="bo-user-empty__icon">👤</span>
            <p>
              {searchKeyword
                ? `"${searchKeyword}" 검색 결과가 없습니다.`
                : '가입된 회원이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="bo-user-table-wrap">
            <table className="bo-user-table">
              <thead>
                <tr>
                  <th className="col-no">NO</th>
                  <th>아이디</th>
                  <th>닉네임</th>
                  <th>이메일</th>
                  <th>전화번호</th>
                  <th>상태</th>
                  <th>가입일</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, index) => (
                  <tr key={user.idx}>
                    <td className="col-no">{index + 1}</td>
                    <td className="bo-user-cell-id">{user.userId}</td>
                    <td>{user.nickname}</td>
                    <td className="bo-user-cell-email">{user.email}</td>
                    <td className="bo-user-cell-phone">
                      {user.phoneNumber ?? '-'}
                    </td>
                    <td>
                      {user.state === 1 ? (
                        <span className="bo-user-state-badge bo-user-state-badge--active">
                          <span className="bo-user-state-badge__dot" />
                          활성
                        </span>
                      ) : (
                        <span className="bo-user-state-badge bo-user-state-badge--inactive">
                          <span className="bo-user-state-badge__dot" />
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="bo-user-cell-date">
                      {formatDate(user.regDate)}
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

export default BackofficeUserListPage;
