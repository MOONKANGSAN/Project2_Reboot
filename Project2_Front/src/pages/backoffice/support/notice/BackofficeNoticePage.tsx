// 공지관리 페이지: 공지사항 탭 + FAQ 탭 전환, 각 탭에서 CRUD 지원
import { useState, useEffect, useMemo } from 'react';
import type { NoticeTab, NoticeItem, FaqItem, NoticeFormData, FaqFormData } from './types';
import { FAQ_CATEGORIES } from './types';
import {
  fetchNoticeList, saveNotice, deleteNotice, toggleNoticeState,
  fetchFaqList, saveFaq, deleteFaq, toggleFaqState,
} from './api';
import './BackofficeNoticePage.css';

const PAGE_SIZE = 15;

// ── 목 데이터 (백엔드 미연결 시 보여줄 샘플) ──────────────────────
const MOCK_NOTICES: NoticeItem[] = [
  { idx: 1, title: '서비스 이용약관 개정 안내', content: '2026년 7월 1일부터 이용약관이 개정됩니다.', state: 1, isPinned: 1, regDate: '2026-06-01T09:00:00' },
  { idx: 2, title: '앱 업데이트 안내 (v2.1.0)', content: '새로운 기능이 추가되었습니다.', state: 1, isPinned: 0, regDate: '2026-05-20T14:00:00' },
  { idx: 3, title: '서버 점검 안내', content: '6월 15일 새벽 2~4시 점검 예정입니다.', state: 0, isPinned: 0, regDate: '2026-05-10T10:00:00' },
];

const MOCK_FAQS: FaqItem[] = [
  { idx: 1, category: '회원/계정', question: '비밀번호를 잊어버렸어요.', answer: '로그인 화면 하단의 "비밀번호 찾기"를 이용해주세요.', state: 1, sortOrder: 1, regDate: '2026-04-01T09:00:00' },
  { idx: 2, category: '리뷰 관련', question: '작성한 리뷰를 수정할 수 있나요?', answer: '리뷰 작성 후 7일 이내에 수정 가능합니다.', state: 1, sortOrder: 2, regDate: '2026-04-02T09:00:00' },
  { idx: 3, category: '앱 오류/버그', question: '앱이 갑자기 종료됩니다.', answer: '앱 최신 버전으로 업데이트 후 재시도해 주세요. 지속된다면 고객센터로 문의 바랍니다.', state: 1, sortOrder: 3, regDate: '2026-04-03T09:00:00' },
  { idx: 4, category: '맛집 정보', question: '맛집 정보가 잘못되어 있어요.', answer: '맛집 상세페이지의 "정보 수정 제안" 버튼을 이용하거나 고객센터로 제보해 주세요.', state: 1, sortOrder: 4, regDate: '2026-04-04T09:00:00' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
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

// ── 공지 추가/편집 모달 ─────────────────────────────────────────
interface NoticeModalProps {
  item: NoticeItem | null;
  onClose: () => void;
  onSave: (form: NoticeFormData, idx?: number) => void;
}
function NoticeModal({ item, onClose, onSave }: NoticeModalProps): JSX.Element {
  const [form, setForm] = useState<NoticeFormData>({
    title: item?.title ?? '',
    content: item?.content ?? '',
    state: item?.state ?? 1,
    isPinned: item?.isPinned ?? 0,
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { alert('제목과 내용을 입력하세요.'); return; }
    onSave(form, item?.idx);
  };
  return (
    <div className="bo-modal-overlay" onClick={onClose}>
      <div className="bo-modal" onClick={e => e.stopPropagation()}>
        <div className="bo-modal__header">
          <h3 className="bo-modal__title">{item ? '공지 수정' : '공지 추가'}</h3>
          <button className="bo-modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="bo-modal__body">
          <label className="bo-form-label">제목</label>
          <input className="bo-form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="공지 제목을 입력하세요" maxLength={200} />
          <label className="bo-form-label">내용</label>
          <textarea className="bo-form-textarea" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="공지 내용을 입력하세요" rows={6} />
          <div className="bo-form-row">
            <label className="bo-form-label">공개 상태</label>
            <select className="bo-form-select" value={form.state} onChange={e => setForm(p => ({ ...p, state: Number(e.target.value) }))}>
              <option value={1}>공개</option>
              <option value={0}>비공개</option>
            </select>
            <label className="bo-form-label" style={{ marginLeft: 16 }}>상단 고정</label>
            <select className="bo-form-select" value={form.isPinned} onChange={e => setForm(p => ({ ...p, isPinned: Number(e.target.value) }))}>
              <option value={0}>일반</option>
              <option value={1}>고정</option>
            </select>
          </div>
          <div className="bo-modal__footer">
            <button type="button" className="bo-btn bo-btn--ghost" onClick={onClose}>취소</button>
            <button type="submit" className="bo-btn bo-btn--primary">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── FAQ 추가/편집 모달 ───────────────────────────────────────────
interface FaqModalProps {
  item: FaqItem | null;
  onClose: () => void;
  onSave: (form: FaqFormData, idx?: number) => void;
}
function FaqModal({ item, onClose, onSave }: FaqModalProps): JSX.Element {
  const [form, setForm] = useState<FaqFormData>({
    category: item?.category ?? FAQ_CATEGORIES[0],
    question: item?.question ?? '',
    answer: item?.answer ?? '',
    state: item?.state ?? 1,
    sortOrder: item?.sortOrder ?? 1,
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) { alert('질문과 답변을 입력하세요.'); return; }
    onSave(form, item?.idx);
  };
  return (
    <div className="bo-modal-overlay" onClick={onClose}>
      <div className="bo-modal" onClick={e => e.stopPropagation()}>
        <div className="bo-modal__header">
          <h3 className="bo-modal__title">{item ? 'FAQ 수정' : 'FAQ 추가'}</h3>
          <button className="bo-modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="bo-modal__body">
          <div className="bo-form-row">
            <label className="bo-form-label">카테고리</label>
            <select className="bo-form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {FAQ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="bo-form-label" style={{ marginLeft: 16 }}>노출 순서</label>
            <input className="bo-form-input bo-form-input--sm" type="number" min={1} value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: Number(e.target.value) }))} />
          </div>
          <label className="bo-form-label">질문</label>
          <input className="bo-form-input" value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} placeholder="FAQ 질문을 입력하세요" maxLength={300} />
          <label className="bo-form-label">답변</label>
          <textarea className="bo-form-textarea" value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} placeholder="FAQ 답변을 입력하세요" rows={6} />
          <div className="bo-form-row">
            <label className="bo-form-label">공개 상태</label>
            <select className="bo-form-select" value={form.state} onChange={e => setForm(p => ({ ...p, state: Number(e.target.value) }))}>
              <option value={1}>공개</option>
              <option value={0}>비공개</option>
            </select>
          </div>
          <div className="bo-modal__footer">
            <button type="button" className="bo-btn bo-btn--ghost" onClick={onClose}>취소</button>
            <button type="submit" className="bo-btn bo-btn--primary">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 메인 페이지 컴포넌트 ─────────────────────────────────────────
function BackofficeNoticePage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<NoticeTab>('notice');

  // 공지사항 상태
  const [notices, setNotices]           = useState<NoticeItem[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(true);
  const [noticeError, setNoticeError]   = useState<string | null>(null);
  const [noticeSearch, setNoticeSearch] = useState('');
  const [noticePage, setNoticePage]     = useState(1);
  const [noticeModal, setNoticeModal]   = useState<{ open: boolean; item: NoticeItem | null }>({ open: false, item: null });

  // FAQ 상태
  const [faqs, setFaqs]             = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError]     = useState<string | null>(null);
  const [faqSearch, setFaqSearch]   = useState('');
  const [faqCategory, setFaqCategory] = useState('전체');
  const [faqPage, setFaqPage]       = useState(1);
  const [faqModal, setFaqModal]     = useState<{ open: boolean; item: FaqItem | null }>({ open: false, item: null });

  // 공지사항 불러오기
  useEffect(() => {
    fetchNoticeList()
      .then(res => { if (res.success) setNotices(res.data); else setNoticeError(res.message ?? '불러오기 실패'); })
      .catch(() => {
        // 백엔드 미연결 시 목 데이터 사용
        setNotices(MOCK_NOTICES);
      })
      .finally(() => setNoticeLoading(false));
  }, []);

  // FAQ 불러오기
  useEffect(() => {
    fetchFaqList()
      .then(res => { if (res.success) setFaqs(res.data); else setFaqError(res.message ?? '불러오기 실패'); })
      .catch(() => {
        // 백엔드 미연결 시 목 데이터 사용
        setFaqs(MOCK_FAQS);
      })
      .finally(() => setFaqLoading(false));
  }, []);

  // ── 공지사항 필터 ──
  const filteredNotices = useMemo(() =>
    notices.filter(n => !noticeSearch.trim() || n.title.toLowerCase().includes(noticeSearch.toLowerCase())),
    [notices, noticeSearch]
  );
  const noticeTotalPages = Math.max(1, Math.ceil(filteredNotices.length / PAGE_SIZE));
  const noticePageItems  = filteredNotices.slice((noticePage - 1) * PAGE_SIZE, noticePage * PAGE_SIZE);

  // ── FAQ 필터 ──
  const filteredFaqs = useMemo(() =>
    faqs.filter(f => {
      const catMatch = faqCategory === '전체' || f.category === faqCategory;
      const keyword  = faqSearch.trim().toLowerCase();
      const kwMatch  = !keyword || f.question.toLowerCase().includes(keyword) || f.answer.toLowerCase().includes(keyword);
      return catMatch && kwMatch;
    }),
    [faqs, faqSearch, faqCategory]
  );
  const faqTotalPages = Math.max(1, Math.ceil(filteredFaqs.length / PAGE_SIZE));
  const faqPageItems  = filteredFaqs.slice((faqPage - 1) * PAGE_SIZE, faqPage * PAGE_SIZE);

  // ── 공지 저장 ──
  const handleNoticeSave = async (form: NoticeFormData, idx?: number) => {
    try {
      const res = await saveNotice(form, idx);
      if (res.success || true) {
        if (idx) {
          setNotices(prev => prev.map(n => n.idx === idx ? { ...n, ...form } : n));
        } else {
          const newItem: NoticeItem = { idx: Date.now(), ...form, regDate: new Date().toISOString() };
          setNotices(prev => [newItem, ...prev]);
        }
        setNoticeModal({ open: false, item: null });
      } else {
        alert('저장 실패: ' + (res.message ?? '오류'));
      }
    } catch {
      // 백엔드 미연결 시 로컬 상태만 업데이트
      if (idx) {
        setNotices(prev => prev.map(n => n.idx === idx ? { ...n, ...form } : n));
      } else {
        const newItem: NoticeItem = { idx: Date.now(), ...form, regDate: new Date().toISOString() };
        setNotices(prev => [newItem, ...prev]);
      }
      setNoticeModal({ open: false, item: null });
    }
  };

  // ── 공지 삭제 ──
  const handleNoticeDelete = async (idx: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try { await deleteNotice(idx); } catch { /* 미연결 허용 */ }
    setNotices(prev => prev.filter(n => n.idx !== idx));
  };

  // ── 공지 상태 토글 ──
  const handleNoticeToggle = async (idx: number) => {
    try { await toggleNoticeState(idx); } catch { /* 미연결 허용 */ }
    setNotices(prev => prev.map(n => n.idx === idx ? { ...n, state: n.state === 1 ? 0 : 1 } : n));
  };

  // ── FAQ 저장 ──
  const handleFaqSave = async (form: FaqFormData, idx?: number) => {
    try { await saveFaq(form, idx); } catch { /* 미연결 허용 */ }
    if (idx) {
      setFaqs(prev => prev.map(f => f.idx === idx ? { ...f, ...form } : f));
    } else {
      const newItem: FaqItem = { idx: Date.now(), ...form, regDate: new Date().toISOString() };
      setFaqs(prev => [newItem, ...prev]);
    }
    setFaqModal({ open: false, item: null });
  };

  // ── FAQ 삭제 ──
  const handleFaqDelete = async (idx: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try { await deleteFaq(idx); } catch { /* 미연결 허용 */ }
    setFaqs(prev => prev.filter(f => f.idx !== idx));
  };

  // ── FAQ 상태 토글 ──
  const handleFaqToggle = async (idx: number) => {
    try { await toggleFaqState(idx); } catch { /* 미연결 허용 */ }
    setFaqs(prev => prev.map(f => f.idx === idx ? { ...f, state: f.state === 1 ? 0 : 1 } : f));
  };

  return (
    <div className="bo-list-page">

      {/* 페이지 헤더 */}
      <div className="bo-list-header">
        <div>
          <h2 className="bo-list-title">공지 관리</h2>
          <p className="bo-list-subtitle">공지사항과 FAQ를 관리합니다.</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="bo-notice-tabs">
        <button
          className={`bo-notice-tab ${activeTab === 'notice' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('notice')}
        >
          공지사항
          <span className="bo-notice-tab__count">{notices.length}</span>
        </button>
        <button
          className={`bo-notice-tab ${activeTab === 'faq' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          FAQ
          <span className="bo-notice-tab__count">{faqs.length}</span>
        </button>
      </div>

      {/* ══════════════════════ 공지사항 탭 ══════════════════════ */}
      {activeTab === 'notice' && (
        <>
          <div className="bo-list-toolbar">
            <div className="bo-search-wrap">
              <svg className="bo-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input className="bo-search-input" type="text" placeholder="제목 검색" value={noticeSearch} onChange={e => { setNoticeSearch(e.target.value); setNoticePage(1); }} />
              {noticeSearch && <button className="bo-search-clear" onClick={() => setNoticeSearch('')}>✕</button>}
            </div>
            <span className="bo-list-count">총 {filteredNotices.length}건</span>
            <button className="bo-btn bo-btn--primary bo-btn--sm" style={{ marginLeft: 'auto' }} onClick={() => setNoticeModal({ open: true, item: null })}>
              + 공지 추가
            </button>
          </div>

          <div className="bo-list-card">
            {noticeLoading ? (
              <div className="bo-list-loading">불러오는 중...</div>
            ) : noticeError ? (
              <div className="bo-list-error">{noticeError}</div>
            ) : filteredNotices.length === 0 ? (
              <div className="bo-list-empty">
                <span className="bo-list-empty__icon">📢</span>
                <p className="bo-list-empty__text">등록된 공지사항이 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="bo-table-wrap">
                  <table className="bo-table">
                    <thead>
                      <tr>
                        <th className="col-idx">NO</th>
                        <th>제목</th>
                        <th className="col-pin">고정</th>
                        <th className="col-state">상태</th>
                        <th className="col-date">등록일</th>
                        <th className="col-actions">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {noticePageItems.map((item, i) => (
                        <tr key={item.idx}>
                          <td className="col-idx">{(noticePage - 1) * PAGE_SIZE + i + 1}</td>
                          <td>
                            <span className="bo-cell-title">
                              {item.isPinned === 1 && <span className="bo-badge-pin">📌</span>}
                              {item.title}
                            </span>
                          </td>
                          <td className="col-pin">
                            {item.isPinned === 1
                              ? <span className="bo-badge-yes">고정</span>
                              : <span className="bo-badge-no">일반</span>}
                          </td>
                          <td className="col-state">
                            <button
                              className={`bo-state-btn ${item.state === 1 ? 'bo-state-btn--active' : 'bo-state-btn--inactive'}`}
                              onClick={() => handleNoticeToggle(item.idx)}
                              title="클릭하면 상태 전환"
                            >
                              <span className="bo-state-btn__dot" />
                              {item.state === 1 ? '공개' : '비공개'}
                            </button>
                          </td>
                          <td className="col-date">{formatDate(item.regDate)}</td>
                          <td className="col-actions">
                            <div className="bo-action-btns">
                              <button className="bo-btn bo-btn--ghost bo-btn--xs" onClick={() => setNoticeModal({ open: true, item })}>편집</button>
                              <button className="bo-btn bo-btn--danger bo-btn--xs" onClick={() => handleNoticeDelete(item.idx)}>삭제</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bo-pagination-wrap">
                  <span className="bo-page-info">{(noticePage - 1) * PAGE_SIZE + 1}–{Math.min(noticePage * PAGE_SIZE, filteredNotices.length)} / {filteredNotices.length}건</span>
                  <Pagination currentPage={noticePage} totalPages={noticeTotalPages} onPageChange={setNoticePage} />
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ══════════════════════ FAQ 탭 ══════════════════════ */}
      {activeTab === 'faq' && (
        <>
          <div className="bo-list-toolbar">
            <div className="bo-search-wrap">
              <svg className="bo-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input className="bo-search-input" type="text" placeholder="질문/답변 검색" value={faqSearch} onChange={e => { setFaqSearch(e.target.value); setFaqPage(1); }} />
              {faqSearch && <button className="bo-search-clear" onClick={() => setFaqSearch('')}>✕</button>}
            </div>
            <div className="bo-toolbar-divider" />
            <span className="bo-filter-label">카테고리</span>
            <div className="bo-filter-group bo-filter-group--scroll">
              {['전체', ...FAQ_CATEGORIES].map(c => (
                <button key={c} className={`bo-filter-btn ${faqCategory === c ? 'is-active' : ''}`} onClick={() => { setFaqCategory(c); setFaqPage(1); }}>{c}</button>
              ))}
            </div>
            <span className="bo-list-count">총 {filteredFaqs.length}건</span>
            <button className="bo-btn bo-btn--primary bo-btn--sm" style={{ marginLeft: 'auto' }} onClick={() => setFaqModal({ open: true, item: null })}>
              + FAQ 추가
            </button>
          </div>

          <div className="bo-list-card">
            {faqLoading ? (
              <div className="bo-list-loading">불러오는 중...</div>
            ) : faqError ? (
              <div className="bo-list-error">{faqError}</div>
            ) : filteredFaqs.length === 0 ? (
              <div className="bo-list-empty">
                <span className="bo-list-empty__icon">❓</span>
                <p className="bo-list-empty__text">등록된 FAQ가 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="bo-table-wrap">
                  <table className="bo-table">
                    <thead>
                      <tr>
                        <th className="col-idx">NO</th>
                        <th className="col-faq-cat">카테고리</th>
                        <th>질문</th>
                        <th className="col-faq-ans">답변 미리보기</th>
                        <th className="col-state">상태</th>
                        <th className="col-date">등록일</th>
                        <th className="col-actions">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faqPageItems.map((item, i) => (
                        <tr key={item.idx}>
                          <td className="col-idx">{(faqPage - 1) * PAGE_SIZE + i + 1}</td>
                          <td className="col-faq-cat">
                            <span className="bo-badge-category">{item.category}</span>
                          </td>
                          <td><span className="bo-cell-content">{item.question}</span></td>
                          <td className="col-faq-ans"><span className="bo-cell-content">{item.answer}</span></td>
                          <td className="col-state">
                            <button
                              className={`bo-state-btn ${item.state === 1 ? 'bo-state-btn--active' : 'bo-state-btn--inactive'}`}
                              onClick={() => handleFaqToggle(item.idx)}
                              title="클릭하면 상태 전환"
                            >
                              <span className="bo-state-btn__dot" />
                              {item.state === 1 ? '공개' : '비공개'}
                            </button>
                          </td>
                          <td className="col-date">{formatDate(item.regDate)}</td>
                          <td className="col-actions">
                            <div className="bo-action-btns">
                              <button className="bo-btn bo-btn--ghost bo-btn--xs" onClick={() => setFaqModal({ open: true, item })}>편집</button>
                              <button className="bo-btn bo-btn--danger bo-btn--xs" onClick={() => handleFaqDelete(item.idx)}>삭제</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bo-pagination-wrap">
                  <span className="bo-page-info">{(faqPage - 1) * PAGE_SIZE + 1}–{Math.min(faqPage * PAGE_SIZE, filteredFaqs.length)} / {filteredFaqs.length}건</span>
                  <Pagination currentPage={faqPage} totalPages={faqTotalPages} onPageChange={setFaqPage} />
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* 모달 */}
      {noticeModal.open && (
        <NoticeModal item={noticeModal.item} onClose={() => setNoticeModal({ open: false, item: null })} onSave={handleNoticeSave} />
      )}
      {faqModal.open && (
        <FaqModal item={faqModal.item} onClose={() => setFaqModal({ open: false, item: null })} onSave={handleFaqSave} />
      )}
    </div>
  );
}

export default BackofficeNoticePage;
