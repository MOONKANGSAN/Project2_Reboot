import { useState, useEffect, useMemo } from 'react';
import type { ReportListItem, StateFilter } from './types';
import { REPORT_TYPE_LABEL, STATE_LABEL } from './types';
import { fetchReportList, updateReportState } from './api';
import './BackofficeReviewReportPage.css';

const PAGE_SIZE = 15;
const STATE_FILTERS: StateFilter[] = ['전체', '대기중', '처리완료', '기각'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 페이지네이션 (리뷰 목록과 동일 패턴)
function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number; totalPages: number; onPageChange: (p: number) => void;
}): JSX.Element {
  if (totalPages <= 1) return <></>;
  const WINDOW = 5;
  const half   = Math.floor(WINDOW / 2);
  let start    = Math.max(1, currentPage - half);
  let end      = Math.min(totalPages, start + WINDOW - 1);
  if (end - start + 1 < WINDOW) start = Math.max(1, end - WINDOW + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return (
    <div className="bo-pagination">
      <button className="bo-page-btn bo-page-btn--nav" onClick={() => onPageChange(1)} disabled={currentPage === 1}>«</button>
      <button className="bo-page-btn bo-page-btn--nav" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
      {start > 1 && <span className="bo-page-ellipsis">…</span>}
      {pages.map(p => (
        <button key={p} className={`bo-page-btn ${p === currentPage ? 'bo-page-btn--active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      {end < totalPages && <span className="bo-page-ellipsis">…</span>}
      <button className="bo-page-btn bo-page-btn--nav" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
      <button className="bo-page-btn bo-page-btn--nav" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>»</button>
    </div>
  );
}

function BackofficeReviewReportPage(): JSX.Element {
  const [items, setItems]             = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [stateFilter, setStateFilter] = useState<StateFilter>('전체');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchReportList()
      .then(res => {
        if (res.success) setItems(res.data);
        else setErrorMsg(res.message ?? '목록을 불러오는데 실패했습니다.');
      })
      .catch(() => setErrorMsg('서버에 연결할 수 없습니다.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { setCurrentPage(1); }, [stateFilter]);

  const filtered = useMemo(() => {
    if (stateFilter === '전체') return items;
    const stateNum = stateFilter === '대기중' ? 0 : stateFilter === '처리완료' ? 1 : 2;
    return items.filter(item => item.state === stateNum);
  }, [items, stateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startNo    = (currentPage - 1) * PAGE_SIZE;

  const handleStateUpdate = async (idx: number, newState: number): Promise<void> => {
    if (processingIds.has(idx)) return;
    setProcessingIds(prev => new Set([...prev, idx]));
    try {
      const res = await updateReportState(idx, newState);
      if (res.success && res.state !== undefined) {
        setItems(prev => prev.map(item => item.idx === idx ? { ...item, state: res.state! } : item));
      } else {
        alert('상태 변경 실패: ' + (res.message ?? '알 수 없는 오류'));
      }
    } catch {
      alert('서버에 연결할 수 없습니다.');
    } finally {
      setProcessingIds(prev => { const n = new Set(prev); n.delete(idx); return n; });
    }
  };

  // 신고 유형 한글 레이블 + 기타 내용 표시
  const renderReportType = (item: ReportListItem): JSX.Element => (
    <div className="bo-report-type-cell">
      <span className={`bo-report-type-badge bo-report-type-badge--${item.reportType.toLowerCase()}`}>
        {REPORT_TYPE_LABEL[item.reportType] ?? item.reportType}
      </span>
      {item.customContent && (
        <span className="bo-report-custom" title={item.customContent}>
          {item.customContent}
        </span>
      )}
    </div>
  );

  // 처리 상태 버튼 렌더링
  const renderStateActions = (item: ReportListItem): JSX.Element => {
    const isProcessing = processingIds.has(item.idx);
    if (item.state === 0) {
      // 대기중: 처리완료 / 기각 버튼
      return (
        <div className="bo-report-actions">
          <button
            className="bo-action-btn bo-action-btn--resolve"
            onClick={() => handleStateUpdate(item.idx, 1)}
            disabled={isProcessing}
          >
            {isProcessing ? '...' : '처리완료'}
          </button>
          <button
            className="bo-action-btn bo-action-btn--reject"
            onClick={() => handleStateUpdate(item.idx, 2)}
            disabled={isProcessing}
          >
            {isProcessing ? '...' : '기각'}
          </button>
        </div>
      );
    }
    // 처리완료 or 기각: 상태 뱃지 + 되돌리기 버튼
    return (
      <div className="bo-report-actions">
        <span className={`bo-state-badge bo-state-badge--${item.state === 1 ? 'resolved' : 'rejected'}`}>
          {STATE_LABEL[item.state]}
        </span>
        <button
          className="bo-action-btn bo-action-btn--reset"
          onClick={() => handleStateUpdate(item.idx, 0)}
          disabled={isProcessing}
          title="대기중으로 되돌리기"
        >
          {isProcessing ? '...' : '↩'}
        </button>
      </div>
    );
  };

  return (
    <div className="bo-list-page">

      {/* 헤더 */}
      <div className="bo-list-header">
        <div>
          <h2 className="bo-list-title">신고 관리</h2>
          <p className="bo-list-subtitle">대기중 신고를 검토하고 처리완료 또는 기각으로 변경하세요.</p>
        </div>
      </div>

      {/* 툴바 */}
      <div className="bo-list-toolbar">
        <span className="bo-filter-label">상태</span>
        <div className="bo-filter-group">
          {STATE_FILTERS.map(sf => (
            <button
              key={sf}
              className={`bo-filter-btn ${stateFilter === sf ? 'is-active' : ''}`}
              onClick={() => setStateFilter(sf)}
            >
              {sf}
              {sf !== '전체' && (
                <span className="bo-filter-count">
                  {sf === '대기중'   ? items.filter(i => i.state === 0).length :
                   sf === '처리완료' ? items.filter(i => i.state === 1).length :
                                       items.filter(i => i.state === 2).length}
                </span>
              )}
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
            <span className="bo-list-empty__icon">📋</span>
            <p className="bo-list-empty__text">신고 내역이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="bo-table-wrap">
              <table className="bo-table">
                <thead>
                  <tr>
                    <th className="col-idx">NO</th>
                    <th className="col-date">신고일</th>
                    <th>점포명</th>
                    <th className="col-review-content">리뷰 내용</th>
                    <th className="col-report-type">신고 유형</th>
                    <th>신고자</th>
                    <th className="col-report-state">처리</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item, i) => (
                    <tr key={item.idx} className={item.state === 0 ? 'bo-row--pending' : ''}>
                      <td className="col-idx">{startNo + i + 1}</td>
                      <td className="col-date">{formatDate(item.regDate)}</td>
                      <td>
                        <span className="bo-cell-name">{item.restaurantName}</span>
                      </td>
                      <td className="col-review-content">
                        <span className="bo-cell-content">{item.reviewContent}</span>
                      </td>
                      <td className="col-report-type">{renderReportType(item)}</td>
                      <td>{item.reporterNickname}</td>
                      <td className="col-report-state">{renderStateActions(item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bo-pagination-wrap">
              <span className="bo-page-info">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length}건
              </span>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default BackofficeReviewReportPage;
