import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userId: string, nickname: string) => void;
}

interface FormData {
  userId: string;
  password: string;
}

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps): JSX.Element | null {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({ userId: '', password: '' });
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 열릴 때마다 폼 초기화 + 첫 입력 필드 포커스
  useEffect(() => {
    if (isOpen) {
      setFormData({ userId: '', password: '' });
      setErrorMsg('');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // 모달 열릴 때 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.userId.trim()) { setErrorMsg('아이디를 입력해주세요.'); return; }
    if (!formData.password.trim()) { setErrorMsg('비밀번호를 입력해주세요.'); return; }

    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post('/user/login', {
        userId: formData.userId,
        password: formData.password,
      });

      if (data.success) {
        onLoginSuccess(data.userId, data.nickname);
        onClose();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setErrorMsg(msg ?? '서버에 연결할 수 없습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateSignup = (): void => {
    onClose();
    navigate('/signup');
  };

  return (
    // 백드롭 — 클릭 시 모달 닫기
    <div className="lm-backdrop" onClick={onClose} aria-modal="true" role="dialog">

      {/* 카드 — 이벤트 버블링 차단 */}
      <div className="lm-card" onClick={e => e.stopPropagation()}>

        {/* 닫기 버튼 */}
        <button className="lm-close" onClick={onClose} aria-label="닫기">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* 헤더 */}
        <div className="lm-header">
          <div className="lm-logo">🍽</div>
          <h2 className="lm-title">로그인</h2>
          <p className="lm-subtitle">맛지도에 오신 것을 환영합니다</p>
        </div>

        {/* 폼 */}
        <form className="lm-form" onSubmit={handleSubmit} noValidate>

          <div className="lm-field">
            <label className="lm-label" htmlFor="lm-userId">아이디</label>
            <input
              ref={inputRef}
              id="lm-userId"
              className={`lm-input ${errorMsg ? 'lm-input--error' : ''}`}
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
            />
          </div>

          <div className="lm-field">
            <label className="lm-label" htmlFor="lm-password">비밀번호</label>
            <input
              id="lm-password"
              className={`lm-input ${errorMsg ? 'lm-input--error' : ''}`}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
          </div>

          {/* 에러 메시지 */}
          {errorMsg && (
            <p className="lm-error">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="lm-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 하단 회원가입 링크 */}
        <div className="lm-footer">
          <span className="lm-footer-text">아직 계정이 없으신가요?</span>
          <button className="lm-footer-link" onClick={handleNavigateSignup}>
            회원가입
          </button>
        </div>

      </div>
    </div>
  );
}

export default LoginModal;
