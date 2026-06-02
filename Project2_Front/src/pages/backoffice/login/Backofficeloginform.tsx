// 📁 src/pages/backoffice/login/BackofficeLoginForm.tsx
// 역할: 로그인 폼 UI 전담 컴포넌트
//       입력 필드(아이디, 비밀번호), 에러 메시지, 버튼, 가입링크 렌더링

import { ChangeEvent, FormEvent } from 'react';
import type { BackofficeLoginFormData, FormErrors } from './types';

// ── Props 타입 정의 ──
interface BackofficeLoginFormProps {
  // 현재 폼 입력 데이터
  formData: BackofficeLoginFormData;
  // 필드별 에러 메시지
  errors: FormErrors;
  // 제출 중 여부 (버튼 비활성화에 사용)
  isSubmitting: boolean;
  // 입력 변경 핸들러
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  // 폼 제출 핸들러
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  // 가입 페이지 이동 핸들러
  onNavigateToSignup: () => void;
}

function BackofficeLoginForm({
  formData,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  onNavigateToSignup,
}: BackofficeLoginFormProps): JSX.Element {
  return (
    <form onSubmit={onSubmit} className="bo-login-form">

      {/* 아이디 입력 필드 */}
      <div className="bo-form-group">
        <label htmlFor="id" className="bo-form-label">
          아이디
        </label>
        <input
          type="text"
          id="id"
          name="id"
          value={formData.id}
          onChange={onChange}
          className={`bo-form-input ${errors.id ? 'bo-form-input--error' : ''}`}
          placeholder="관리자 아이디"
          autoComplete="username"
        />
        {/* 에러 메시지: 에러가 있을 때만 렌더링 */}
        {errors.id && <p className="bo-error-message">{errors.id}</p>}
      </div>

      {/* 비밀번호 입력 필드 */}
      <div className="bo-form-group">
        <label htmlFor="password" className="bo-form-label">
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={onChange}
          className={`bo-form-input ${errors.password ? 'bo-form-input--error' : ''}`}
          placeholder="관리자 비밀번호"
          autoComplete="current-password"
        />
        {errors.password && <p className="bo-error-message">{errors.password}</p>}
      </div>

      {/* 로그인 제출 버튼 */}
      <button
        type="submit"
        className="bo-submit-button"
        disabled={isSubmitting}
      >
        {/* 제출 중일 때 텍스트 변경으로 피드백 제공 */}
        {isSubmitting ? '로그인 중...' : '로그인'}
      </button>

      {/* 하단 가입 페이지 이동 링크 */}
      <div className="bo-login-footer">
        <p className="bo-footer-text">
          아직 계정이 없으신가요?{' '}
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="bo-link-button"
          >
            계정 생성하기
          </button>
        </p>
      </div>

    </form>
  );
}

export default BackofficeLoginForm;