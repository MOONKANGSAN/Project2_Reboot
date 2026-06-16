// 에러 로그 페이지: 서비스에서 발생한 에러/경고/정보 로그를 목록으로 조회
import { useState, useEffect, useMemo } from 'react';
import type { ErrorLogItem, LogLevelFilter } from './types';
import { fetchErrorLogs, deleteErrorLog, clearErrorLogs } from './api';
import './BackofficeErrorLogPage.css';

const PAGE_SIZE = 20;
const LEVEL_FILTERS: LogLevelFilter[] = ['전체', 'ERROR', 'WARN', 'INFO'];

// 목 데이터 (백엔드 미연결 시 샘플 표시)
const MOCK_LOGS: ErrorLogItem[] = [
  { idx: 1,  level: 'ERROR', message: 'Cannot read properties of undefined (reading "idx")', path: '/api/restaurant/999', stackTrace: 'TypeError: Cannot read properties of undefined\n  at RestaurantService.getById (RestaurantService.java:45)\n  at RestaurantController.get (RestaurantController.java:88)', userId: 'admin01', regDate: '2026-06-12T08:32:11' },
  { idx: 2,  level: 'ERROR', message: 'DB connection timeout after 30000ms', path: '/api/review/list', stackTrace: 'Connection timeout: HikariPool-1 - Connection is not available\n  at DataSource.getConnection (HikariDataSource.java:128)', regDate: '2026-06-12T07:10:05' },
  { idx: 3,  level: 'WARN',  message: 'Slow query detected: 2340ms on fetchRestaurantList', path: '/api/restaurant/list', regDate: '2026-06-11T22:55:40' },
  { idx: 4,  level: 'WARN',  message: 'Rate limit approaching for IP 192.168.1.101 (85/100)', path: '/api/inquiry', regDate: '2026-06-11T19:22:18' },
  { idx: 5,  level: 'INFO',  message: 'Admin login: admin01 from 192.168.1.10', path: '/api/backoffice/login', userId: 'admin01', regDate: '2026-06-11T09:00:01' },
  { idx: 6,  level: 'ERROR', message: 'NullPointerException in ReviewService.toggleState', path: '/api/review/123/toggle', stackTrace: 'java.lang.NullPointerException\n  at ReviewService.toggleState (ReviewService.java:102)', regDate: '2026-06-10T15:47:33' },
  { idx: 7,  level: 'INFO',  message: 'Scheduled job: nightly stats aggregation completed (0.8s)', path: '/scheduler/stats', regDate: '2026-06-10T03:00:01' },
  { idx: 8,  level: 'WARN',  message: 'Image upload size exceeded soft limit: 4.8MB', path: '/api/restaurant/register', userId: 'admin02', regDate: '2026-06-09T14:33:22' },
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

// ── 페이지네이션 ─────────────────────────────────────────────────
interface PaginationProps { currentPage: number; totalPages: number; onPageChange: (p: number) => void; }
function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps): JSX.Element {
  if (totalPages <= 1) return <></>;
  const WINDOW = 5, half = Math.floor(WINDOW / 2);
  let start = Math.max(1, currentPage - half);
  let end   = Math.min(totalPages, start + WINDOW - 1);
  if (end - start + 1 < WINDOW) start = Math.max(1, end - WINDOW + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return (
    <div className="bo-pagination">
      <button className="bo-page-btn bo-page-btn--nav" onClick={() => onPageChange(1)} disabled={currentPage === 1}>«</button>
      <button className="bo-page-btn bo-page-btn--nav" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
      {start > 1 && <span className="bo-page-ellipsis">…</span>}
      {pages.map(p => <button key={p} className={`bo-page-btn ${p === currentPage ? 'bo-page-btn--active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>)}
      {end < totalPages && <span className="bo-page-ellipsis">…</span>}
      <button className="bo-page-btn bo-page-btn--nav" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
      <button className="bo-page-btn bo-page-btn--nav" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>»</button>
    </div>
  );
}

// ── 상세 슬라이더 (스택 트레이스 표시) ─────────────────────────
interface DetailPanelProps { item: ErrorLogItem; onClose: () => void; }
function DetailPanel({ item, onClose }: DetailPanelProps): JSX.Element {
  return (
    <div className="bo-detail-overlay" onClick={onClose}>
      <div className="bo-detail-panel" onClick={e => e.stopPropagation()}>
        <div className="bo-detail-panel__header">
          <div className="bo-detail-panel__title-row">
            <span className={`bo-log-level bo-log-level--${item.level.toLowerCase()}`}>{item.level}</span>
            <span className="bo-detail-panel__title">로그 상세</span>
          </div>
          <button className="bo-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="bo-detail-panel__body">
          <div className="bo-detail-row">
            <span className="bo-detail-label">발생 시각</span>
            <span className="bo-detail-value">{formatDateTime(item.regDate)}</span>
          </div>
          <div className="bo-detail-row">
            <span className="bo-detail-label">경로</span>
            <span className="bo-detail-value bo-detail-value--code">{item.path}</span>
          </div>
          {item.userId && (
            <div className="bo-detail-row">
              <span className="bo-detail-label">사용자</span>
              <span className="bo-detail-value">{item.userId}</span>
            </div>
          )}
          <div className="bo-detail-row bo-detail-row--block">
            <span className="bo-detail-label">메시지</span>
            <pre className="bo-detail-code">{item.message}</pre>
          </div>
          {item.stackTrace && (
            <div className="bo-detail-row bo-detail-row--block">
              <span className="bo-detail-label">스택 트레이스</span>
              <pre className="bo-detail-code bo-detail-code--stack">{item.stackTrace}</pre>
            </div>
          )}
          {item.userAgent && (
            <div className="bo-detail-row">
              <span className="bo-detail-label">UserAgent</span>
              <span className="bo-detail-value bo-detail-value--code">{item.userAgent}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 컴포넌트 ─────────────────────────────────────────
function BackofficeErrorLogPage(): JSX.Element {
  const [logs, setLogs]             = useState<ErrorLogItem[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [levelFilter, setLevelFilter] = useState<LogLevelFilter>('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [selectedLog, setSelectedLog]   = useState<ErrorLogItem | null>(null);

  useEffect(() => {
    fetchErrorLogs()
      .then(res => { if (res.success) setLogs(res.data); else setLogs(MOCK_LOGS); })
      .catch(() => setLogs(MOCK_LOGS))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { setCurrentPage(1); }, [levelFilter, searchKeyword]);

  const filtered = useMemo(() => {
    return logs.filter(log => {
      const levelMatch = levelFilter === '전체' || log.level === levelFilter;
      const keyword    = searchKeyword.trim().toLowerCase();
      const kwMatch    = !keyword || log.message.toLowerCase().includes(keyword) || log.path.toLowerCase().includes(keyword);
      return levelMatch && kwMatch;
    });
  }, [logs, levelFilter, searchKeyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const errorCount = logs.filter(l => l.level === 'ERROR').length;
  const warnCount  = logs.filter(l => l.level === 'WARN').length;

  const handleDelete = async (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    if (!confirm('이 로그를 삭제하시겠습니까?')) return;
    try { await deleteErrorLog(idx); } catch { /* 미연결 허용 */ }
    setLogs(prev => prev.filter(l => l.idx !== idx));
    if (selectedLog?.idx === idx) setSelectedLog(null);
  };

  const handleClearAll = async () => {
    if (!confirm('모든 로그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try { await clearErrorLogs(); } catch { /* 미연결 허용 */ }
    setLogs([]);
    setSelectedLog(null);
  };

  return (
    <div className="bo-list-page">

      {/* 헤더 */}
      <div className="bo-list-header">
        <div>
          <h2 className="bo-list-title">에러 로그</h2>
          <p className="bo-list-subtitle">서비스에서 발생한 오류 및 경고 로그를 확인합니다.</p>
        </div>
        <button className="bo-btn bo-btn--danger bo-btn--sm" onClick={handleClearAll} style={{ marginLeft: 'auto' }}>
          전체 삭제
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="bo-log-summary">
        <div className="bo-log-summary__card bo-log-summary__card--error">
          <span className="bo-log-summary__label">ERROR</span>
          <span className="bo-log-summary__value">{errorCount}</span>
        </div>
        <div className="bo-log-summary__card bo-log-summary__card--warn">
          <span className="bo-log-summary__label">WARN</span>
          <span className="bo-log-summary__value">{warnCount}</span>
        </div>
        <div className="bo-log-summary__card bo-log-summary__card--total">
          <span className="bo-log-summary__label">전체</span>
          <span className="bo-log-summary__value">{logs.length}</span>
        </div>
      </div>

      {/* 툴바 */}
      <div className="bo-list-toolbar">
        <div className="bo-search-wrap">
          <svg className="bo-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="bo-search-input" type="text" placeholder="메시지 또는 경로 검색" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
          {searchKeyword && <button className="bo-search-clear" onClick={() => setSearchKeyword('')}>✕</button>}
        </div>
        <div className="bo-toolbar-divider" />
        <span className="bo-filter-label">레벨</span>
        <div className="bo-filter-group">
          {LEVEL_FILTERS.map(lv => (
            <button key={lv} className={`bo-filter-btn ${levelFilter === lv ? 'is-active' : ''} ${lv !== '전체' ? `bo-filter-btn--${lv.toLowerCase()}` : ''}`} onClick={() => setLevelFilter(lv)}>
              {lv}
            </button>
          ))}
        </div>
        <span className="bo-list-count">총 {filtered.length}건</span>
      </div>

      {/* 테이블 */}
      <div className="bo-list-card">
        {isLoading ? (
          <div className="bo-list-loading">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="bo-list-empty">
            <span className="bo-list-empty__icon">✅</span>
            <p className="bo-list-empty__text">로그가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="bo-table-wrap">
              <table className="bo-table">
                <thead>
                  <tr>
                    <th className="col-idx">NO</th>
                    <th className="col-log-level">레벨</th>
                    <th>메시지</th>
                    <th className="col-log-path">경로</th>
                    <th className="col-log-user">사용자</th>
                    <th className="col-date">발생 시각</th>
                    <th className="col-actions">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((log, i) => (
                    <tr
                      key={log.idx}
                      className="bo-table-row--clickable"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="col-idx">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="col-log-level">
                        <span className={`bo-log-level bo-log-level--${log.level.toLowerCase()}`}>{log.level}</span>
                      </td>
                      <td>
                        <span className="bo-cell-content">{log.message}</span>
                        {log.stackTrace && <span className="bo-log-stack-hint" title="스택 트레이스 있음">📋</span>}
                      </td>
                      <td className="col-log-path">
                        <span className="bo-log-path">{log.path}</span>
                      </td>
                      <td className="col-log-user">{log.userId ?? '-'}</td>
                      <td className="col-date">{formatDateTime(log.regDate)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="bo-btn bo-btn--danger bo-btn--xs" onClick={e => handleDelete(e, log.idx)}>삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bo-pagination-wrap">
              <span className="bo-page-info">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length}건</span>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>

      {/* 상세 패널 */}
      {selectedLog && <DetailPanel item={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}

export default BackofficeErrorLogPage;
