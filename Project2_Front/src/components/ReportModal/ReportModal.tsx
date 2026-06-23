import { useState, useEffect } from 'react';
import axios from 'axios';
import './ReportModal.css';

export const REPORT_TYPES = [
  { value: 'ABUSE',      label: '지나친 욕설 혹은 일방적인 비난' },
  { value: 'IRRELEVANT', label: '리뷰 내용과 점포의 특성이 무관함' },
  { value: 'OBSCENE',    label: '선정적인 표현 사용' },
  { value: 'ETC',        label: '기타 (직접 입력)' },
] as const;

export type ReportTypeValue = typeof REPORT_TYPES[number]['value'];

interface ReportModalProps {
  reviewIdx: number | null;   // null 이면 닫힌 상태
  onClose: () => void;
}

function ReportModal({ reviewIdx, onClose }: ReportModalProps): JSX.Element | null {
  const isOpen = reviewIdx !== null;

  const [selectedType, setSelectedType]  = useState<ReportTypeValue | ''>('');
  const [customContent, setCustomContent] = useState('');
  const [isSubmitting, setIsSubmitting]  = useState(false);
  const [errorMsg, setErrorMsg]          = useState('');
  const [isDone, setIsDone]              = useState(false);

  // 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedType('');
      setCustomContent('');
      setErrorMsg('');
      setIsDone(false);
    }
  }, [isOpen]);

  // ESC 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sessionRaw = sessionStorage.getItem('userSession');
  const userId     = sessionRaw ? JSON.parse(sessionRaw).userId : null;

  const handleSubmit = async (): Promise<void> => {
    if (!userId) { setErrorMsg('로그인 후 신고할 수 있습니다.'); return; }
    if (!selectedType) { setErrorMsg('신고 유형을 선택해주세요.'); return; }
    if (selectedType === 'ETC' && !customContent.trim()) {
      setErrorMsg('신고 내용을 직접 입력해주세요.'); return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const { data } = await axios.post(`/api/reviews/${reviewIdx}/report`, {
        userId,
        reportType: selectedType,
        customContent: customContent.trim() || null,
      });

      if (data.success) setIsDone(true);
      else setErrorMsg(data.message);

    } catch (err: any) {
      setErrorMsg(err.response?.data?.message ?? '서버에 연결할 수 없습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rpm-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div className="rpm-card" onClick={e => e.stopPropagation()}>

        {/* 닫기 버튼 */}
        <button className="rpm-close" onClick={onClose} aria-label="닫기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {isDone ? (
          /* ── 접수 완료 상태 ── */
          <div className="rpm-done">
            <div className="rpm-done__icon">✅</div>
            <p className="rpm-done__title">신고가 접수되었습니다</p>
            <p className="rpm-done__desc">검토 후 적절한 조치를 취하겠습니다.</p>
            <button className="rpm-btn-confirm" onClick={onClose}>확인</button>
          </div>
        ) : (
          <>
            {/* ── 헤더 ── */}
            <div className="rpm-header">
              <div className="rpm-siren-icon">
                <SirenIcon size={28} color="#ef4444" />
              </div>
              <h3 className="rpm-title">리뷰 신고</h3>
              <p className="rpm-subtitle">신고 사유를 선택해주세요</p>
            </div>

            {/* ── 신고 유형 선택 ── */}
            <div className="rpm-type-list">
              {REPORT_TYPES.map(type => (
                <label
                  key={type.value}
                  className={`rpm-type-item ${selectedType === type.value ? 'is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={() => { setSelectedType(type.value); setErrorMsg(''); }}
                    className="rpm-radio"
                  />
                  <span className="rpm-type-label">{type.label}</span>
                </label>
              ))}
            </div>

            {/* 기타 직접 입력 */}
            {selectedType === 'ETC' && (
              <textarea
                className="rpm-custom-textarea"
                placeholder="신고 내용을 직접 입력해주세요 (최대 200자)"
                value={customContent}
                onChange={e => { setCustomContent(e.target.value); setErrorMsg(''); }}
                maxLength={200}
                rows={3}
              />
            )}

            {/* 에러 메시지 */}
            {errorMsg && <p className="rpm-error">{errorMsg}</p>}

            {/* 버튼 영역 */}
            <div className="rpm-actions">
              <button type="button" className="rpm-btn-cancel" onClick={onClose}>취소</button>
              <button
                type="button"
                className="rpm-btn-submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? '신고 중...' : '신고하기'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ── 사이렌 아이콘 SVG
export function SirenIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* 사이렌 몸체 */}
      <path d="M12 2a4 4 0 0 1 4 4v6H8V6a4 4 0 0 1 4-4z" />
      {/* 빛 광선 (좌우 위) */}
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="19.78" y1="4.22" x2="18.36" y2="5.64" />
      <line x1="2"     y1="10"   x2="4"    y2="10" />
      <line x1="22"    y1="10"   x2="20"   y2="10" />
      {/* 베이스 */}
      <rect x="6" y="12" width="12" height="3" rx="1" />
      <line x1="8" y1="15" x2="8"  y2="18" />
      <line x1="16" y1="15" x2="16" y2="18" />
      <line x1="6" y1="18" x2="18" y2="18" />
    </svg>
  );
}

export default ReportModal;
