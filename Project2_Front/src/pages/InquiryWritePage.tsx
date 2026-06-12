import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitInquiry, INQUIRY_TYPES } from '@/api/inquiryApi';
import './InquiryWritePage.css';

interface UserSession {
  userId:   string;
  nickname: string;
}

function InquiryWritePage(): JSX.Element {
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(null);

  const [title,       setTitle]       = useState('');
  const [content,     setContent]     = useState('');
  const [inquiryType, setInquiryType] = useState<number>(1);
  const [isPublic,    setIsPublic]    = useState<number>(1);
  const [password,    setPassword]    = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,       setError]       = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('userSession');
    if (!raw) {
      alert('문의를 작성하려면 로그인이 필요합니다.');
      navigate('/');
      return;
    }
    setSession(JSON.parse(raw));
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!title.trim())   { setError('제목을 입력해주세요.');       return; }
    if (!content.trim()) { setError('문의 내용을 입력해주세요.');   return; }
    if (isPublic === 0 && !password.trim()) {
      setError('비공개 문의는 비밀번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitInquiry({
        userId:      session?.userId ?? null,
        title:       title.trim(),
        content:     content.trim(),
        isPublic,
        inquiryType,
        password:    isPublic === 0 ? password.trim() : null,
      });

      if (res.success) {
        alert('문의가 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.');
        navigate('/inquiry');
      } else {
        setError(res.message ?? '접수 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? '서버에 연결할 수 없습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return <></>;

  return (
    <div className="iq-page">
      <div className="iq-container container">

        {/* 헤더 */}
        <div className="iq-header">
          <button className="iq-back" onClick={() => navigate(-1)}>← 뒤로</button>
          <h1 className="iq-title">고객 문의</h1>
          <p className="iq-subtitle">불편하신 점이나 궁금한 사항을 남겨주세요</p>
        </div>

        <form className="iq-card" onSubmit={handleSubmit} noValidate>

          {/* 작성자 (읽기 전용) */}
          <div className="iq-field">
            <label className="iq-label">작성자</label>
            <div className="iq-readonly">
              <span className="iq-readonly__avatar">{session.nickname.charAt(0)}</span>
              <span className="iq-readonly__name">{session.nickname}</span>
            </div>
          </div>

          {/* 문의 유형 */}
          <div className="iq-field">
            <label className="iq-label">
              문의 유형 <span className="iq-required">*</span>
            </label>
            <select
              className="iq-select"
              value={inquiryType}
              onChange={e => setInquiryType(Number(e.target.value))}
            >
              {INQUIRY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div className="iq-field">
            <label className="iq-label">
              제목 <span className="iq-required">*</span>
            </label>
            <input
              type="text"
              className="iq-input"
              placeholder="문의 제목을 입력하세요 (최대 100자)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* 문의 내용 */}
          <div className="iq-field">
            <label className="iq-label">
              문의 내용 <span className="iq-required">*</span>
            </label>
            <textarea
              className="iq-textarea"
              rows={7}
              placeholder="문의 내용을 자세하게 작성해주세요"
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={2000}
            />
            <p className="iq-char-count">{content.length} / 2000</p>
          </div>

          {/* 공개 여부 */}
          <div className="iq-field">
            <label className="iq-label">공개 여부</label>
            <div className="iq-radio-group">
              <label className="iq-radio">
                <input
                  type="radio"
                  value={1}
                  checked={isPublic === 1}
                  onChange={() => { setIsPublic(1); setPassword(''); }}
                />
                <span>공개</span>
              </label>
              <label className="iq-radio">
                <input
                  type="radio"
                  value={0}
                  checked={isPublic === 0}
                  onChange={() => setIsPublic(0)}
                />
                <span>비공개</span>
              </label>
            </div>
          </div>

          {/* 비공개 비밀번호 — 비공개 선택 시만 표시 */}
          {isPublic === 0 && (
            <div className="iq-field">
              <label className="iq-label">
                비밀번호 <span className="iq-required">*</span>
                <span className="iq-hint"> (문의 내역 조회 시 필요)</span>
              </label>
              <input
                type="password"
                className="iq-input"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={e => setPassword(e.target.value)}
                maxLength={20}
              />
            </div>
          )}

          {error && <p className="iq-error">{error}</p>}

          <div className="iq-actions">
            <button type="button" className="iq-btn-cancel" onClick={() => navigate(-1)}>
              취소
            </button>
            <button type="submit" className="iq-btn-submit" disabled={isSubmitting}>
              {isSubmitting ? '접수 중...' : '문의 접수'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default InquiryWritePage;
