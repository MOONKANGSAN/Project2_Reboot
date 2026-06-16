// 백오피스 고객문의 페이지: 전체 문의 목록 조회 및 처리 상태 관리
import { useState, useEffect, useMemo } from 'react';
import type { BackofficeInquiryItem, InquiryStateFilter } from './types';
import { fetchAllInquiries, updateInquiryState, submitInquiryAnswer } from './api';
import { INQUIRY_TYPES, INQUIRY_STATES } from '@/api/inquiryApi';
import './BackofficeInquiryPage.css';

const PAGE_SIZE = 15;

const STATE_FILTERS: InquiryStateFilter[] = ['전체', '대기중', '처리중', '완료', '기각'];

// 목 데이터 (백엔드 미연결 시 샘플 표시)
const MOCK_INQUIRIES: BackofficeInquiryItem[] = [
  { idx: 1, state: 0, stateName: '대기중', title: '비밀번호 변경이 안 됩니다', content: '비밀번호 변경 시도 시 계속 오류가 발생합니다.', isPublic: 1, inquiryType: 1, inquiryTypeName: '회원/계정 문의', hasAnswer: false, userId: 'user001', regDate: '2026-06-12T10:22:00' },
  { idx: 2, state: 1, stateName: '처리중', title: '작성한 리뷰가 삭제되었어요', content: '어제 작성한 리뷰가 오늘 확인하니 사라졌습니다.', isPublic: 1, inquiryType: 2, inquiryTypeName: '리뷰 관련', hasAnswer: false, userId: 'user002', regDate: '2026-06-11T14:05:00' },
  { idx: 3, state: 2, stateName: '완료', title: '앱 실행 시 흰 화면만 보입니다', content: '앱을 실행하면 흰 화면만 보이고 넘어가지 않아요.', isPublic: 1, inquiryType: 6, inquiryTypeName: '앱 오류/버그', hasAnswer: true, userId: 'user003', regDate: '2026-06-10T09:30:00' },
  { idx: 4, state: 0, stateName: '대기중', title: '맛집 정보 수정 요청', content: '○○식당의 영업시간 정보가 잘못되어 있습니다.', isPublic: 0, inquiryType: 3, inquiryTypeName: '맛집 정보', hasAnswer: false, userId: null, regDate: '2026-06-09T18:44:00' },
  { idx: 5, state: 3, stateName: '기각', title: '광고 제휴 문의', content: '저희 업체 광고 등록 가능한지 알고 싶습니다.', isPublic: 0, inquiryType: 8, inquiryTypeName: '제휴/광고', hasAnswer: false, userId: 'corp01', regDate: '2026-06-08T11:00:00' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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

// ── 문의 상세 + 답변 모달 ────────────────────────────────────────
interface InquiryDetailModalProps {
  item: BackofficeInquiryItem;
  onClose: () => void;
  onStateChange: (idx: number, newState: number) => void;
  onAnswerSubmit: (idx: number, answer: string, newState: number) => void;
}
function InquiryDetailModal({ item, onClose, onStateChange, onAnswerSubmit }: InquiryDetailModalProps): JSX.Element {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = async (newState: number) => {
    if (!answer.trim()) { alert('답변 내용을 입력하세요.'); return; }
    setIsSubmitting(true);
    try {
      await onAnswerSubmit(item.idx, answer, newState);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const stateInfo = INQUIRY_STATES[item.state];

  return (
    <div className="bo-modal-overlay" onClick={onClose}>
      <div className="bo-modal bo-modal--lg" onClick={e => e.stopPropagation()}>
        <div className="bo-modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="bo-inq-type-badge">{item.inquiryTypeName}</span>
            <h3 className="bo-modal__title">{item.title}</h3>
          </div>
          <button className="bo-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="bo-modal__body">
          {/* 문의 메타 정보 */}
          <div className="bo-inq-meta">
            <span className="bo-inq-meta__item">
              <span className="bo-inq-meta__label">작성자</span>
              {item.userId ?? '비회원'}
            </span>
            <span className="bo-inq-meta__item">
              <span className="bo-inq-meta__label">공개 여부</span>
              {item.isPublic === 1 ? '공개' : '비공개'}
            </span>
            <span className="bo-inq-meta__item">
              <span className="bo-inq-meta__label">등록일</span>
              {formatDate(item.regDate)}
            </span>
            <span className="bo-inq-meta__item">
              <span className="bo-inq-meta__label">처리 상태</span>
              <span className="bo-inq-state" style={{ color: stateInfo.color }}>{stateInfo.label}</span>
            </span>
          </div>

          {/* 문의 내용 */}
          <div className="bo-inq-content-box">
            <p className="bo-inq-content">{item.content}</p>
          </div>

          {/* 빠른 상태 변경 (처리중) */}
          {item.state === 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="bo-btn bo-btn--ghost bo-btn--sm" onClick={() => onStateChange(item.idx, 1)}>
                처리중으로 변경
              </button>
            </div>
          )}

          {/* 답변 입력 영역 */}
          <div className="bo-inq-answer-section">
            <p className="bo-inq-answer-label">
              {item.hasAnswer ? '기존 답변 덮어쓰기' : '답변 작성'}
            </p>
            <textarea
              className="bo-form-textarea"
              rows={5}
              placeholder="고객에게 전달할 답변을 입력하세요."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={item.state === 3}
            />
          </div>

          {/* 처리 버튼 */}
          <div className="bo-modal__footer">
            <button type="button" className="bo-btn bo-btn--ghost" onClick={onClose}>닫기</button>
            {item.state !== 3 && (
              <>
                <button className="bo-btn bo-btn--danger" disabled={isSubmitting} onClick={() => handleAnswer(3)}>
                  기각 처리
                </button>
                <button className="bo-btn bo-btn--primary" disabled={isSubmitting} onClick={() => handleAnswer(2)}>
                  {isSubmitting ? '처리중...' : '답변 완료'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 컴포넌트 ─────────────────────────────────────────
function BackofficeInquiryPage(): JSX.Element {
  const [items, setItems]             = useState<BackofficeInquiryItem[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [stateFilter, setStateFilter] = useState<InquiryStateFilter>('전체');
  const [typeFilter, setTypeFilter]   = useState<string>('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<BackofficeInquiryItem | null>(null);

  useEffect(() => {
    fetchAllInquiries()
      .then(res => { if (res.success) setItems(res.data); else setItems(MOCK_INQUIRIES); })
      .catch(() => setItems(MOCK_INQUIRIES))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { setCurrentPage(1); }, [stateFilter, typeFilter, searchKeyword]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const stateMatch =
        stateFilter === '전체' ||
        INQUIRY_STATES[item.state]?.label === stateFilter;
      const typeMatch  = typeFilter === '전체' || item.inquiryTypeName === typeFilter;
      const keyword    = searchKeyword.trim().toLowerCase();
      const kwMatch    = !keyword || item.title.toLowerCase().includes(keyword) || (item.userId ?? '').toLowerCase().includes(keyword);
      return stateMatch && typeMatch && kwMatch;
    });
  }, [items, stateFilter, typeFilter, searchKeyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 대기중 건수 계산
  const pendingCount = items.filter(i => i.state === 0).length;

  const handleStateChange = async (idx: number, newState: number) => {
    try { await updateInquiryState(idx, newState); } catch { /* 미연결 허용 */ }
    setItems(prev => prev.map(i => i.idx === idx
      ? { ...i, state: newState, stateName: INQUIRY_STATES[newState].label }
      : i
    ));
    if (selectedItem?.idx === idx) {
      setSelectedItem(prev => prev ? { ...prev, state: newState, stateName: INQUIRY_STATES[newState].label } : null);
    }
  };

  const handleAnswerSubmit = async (idx: number, answer: string, newState: number) => {
    try { await submitInquiryAnswer(idx, { answer, newState }); } catch { /* 미연결 허용 */ }
    setItems(prev => prev.map(i => i.idx === idx
      ? { ...i, state: newState, stateName: INQUIRY_STATES[newState].label, hasAnswer: true }
      : i
    ));
  };

  return (
    <div className="bo-list-page">

      {/* 헤더 */}
      <div className="bo-list-header">
        <div>
          <h2 className="bo-list-title">
            고객 문의사항
            {pendingCount > 0 && <span className="bo-inq-pending-badge">{pendingCount}건 대기</span>}
          </h2>
          <p className="bo-list-subtitle">행을 클릭하면 상세 내용과 답변 작성 화면이 표시됩니다.</p>
        </div>
      </div>

      {/* 툴바 */}
      <div className="bo-list-toolbar bo-list-toolbar--wrap">
        <div className="bo-search-wrap">
          <svg className="bo-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="bo-search-input" type="text" placeholder="제목 또는 작성자 검색" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
          {searchKeyword && <button className="bo-search-clear" onClick={() => setSearchKeyword('')}>✕</button>}
        </div>
        <div className="bo-toolbar-divider" />
        <span className="bo-filter-label">상태</span>
        <div className="bo-filter-group">
          {STATE_FILTERS.map(st => (
            <button key={st} className={`bo-filter-btn ${stateFilter === st ? 'is-active' : ''}`} onClick={() => setStateFilter(st)}>{st}</button>
          ))}
        </div>
        <div className="bo-toolbar-divider" />
        <span className="bo-filter-label">유형</span>
        <div className="bo-filter-group bo-filter-group--scroll">
          <button className={`bo-filter-btn ${typeFilter === '전체' ? 'is-active' : ''}`} onClick={() => setTypeFilter('전체')}>전체</button>
          {INQUIRY_TYPES.map(t => (
            <button key={t.value} className={`bo-filter-btn ${typeFilter === t.label ? 'is-active' : ''}`} onClick={() => setTypeFilter(t.label)}>{t.label}</button>
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
            <span className="bo-list-empty__icon">📩</span>
            <p className="bo-list-empty__text">문의사항이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="bo-table-wrap">
              <table className="bo-table">
                <thead>
                  <tr>
                    <th className="col-idx">NO</th>
                    <th className="col-inq-type">유형</th>
                    <th>제목</th>
                    <th className="col-inq-user">작성자</th>
                    <th className="col-inq-pub">공개</th>
                    <th className="col-inq-ans">답변</th>
                    <th className="col-inq-state">상태</th>
                    <th className="col-date">등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item, i) => {
                    const stateInfo = INQUIRY_STATES[item.state];
                    return (
                      <tr
                        key={item.idx}
                        className="bo-table-row--clickable"
                        onClick={() => setSelectedItem(item)}
                      >
                        <td className="col-idx">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                        <td className="col-inq-type">
                          <span className="bo-badge-category">{item.inquiryTypeName}</span>
                        </td>
                        <td>
                          <span className="bo-cell-content">{item.title}</span>
                        </td>
                        <td className="col-inq-user">{item.userId ?? '비회원'}</td>
                        <td className="col-inq-pub">
                          {item.isPublic === 1
                            ? <span className="bo-badge-yes">공개</span>
                            : <span className="bo-badge-no">비공개</span>}
                        </td>
                        <td className="col-inq-ans">
                          {item.hasAnswer
                            ? <span className="bo-badge-yes">완료</span>
                            : <span className="bo-badge-no">미답변</span>}
                        </td>
                        <td className="col-inq-state">
                          <span className="bo-inq-state" style={{ color: stateInfo.color }}>
                            {stateInfo.label}
                          </span>
                        </td>
                        <td className="col-date">{formatDate(item.regDate)}</td>
                      </tr>
                    );
                  })}
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

      {/* 문의 상세 모달 */}
      {selectedItem && (
        <InquiryDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onStateChange={handleStateChange}
          onAnswerSubmit={handleAnswerSubmit}
        />
      )}
    </div>
  );
}

export default BackofficeInquiryPage;
