// 📁 src/pages/backoffice/signup/BackofficeSignupForm.tsx
// 역할: 가입 폼 UI 전담 컴포넌트
//       입력 필드(아이디, 비밀번호, 비밀번호 확인, 레벨), 에러 메시지, 버튼 렌더링
//       상태·로직은 BackofficeSignupPage에서 관리하고 props로 전달받음

import { ChangeEvent, FormEvent } from 'react';
import type { BackofficeSignupFormData, FormErrors } from '@/pages/backoffice/signup/types';

// ── Props 타입 정의 ──
interface BackofficeSignupFormProps {
  // 현재 폼 입력 데이터
  formData: BackofficeSignupFormData;
  // 필드별 에러 메시지
  errors: FormErrors;
  // 제출 중 여부 (버튼 비활성화에 사용)
  isSubmitting: boolean;
  // 입력 변경 핸들러 (input, select 공용)
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  // 폼 제출 핸들러
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  // 로그인 페이지 이동 핸들러
  onNavigateToLogin: () => void;
}

function BackofficeSignupForm({
  formData,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  onNavigateToLogin,
}: BackofficeSignupFormProps): JSX.Element {
  return (
    <form onSubmit={onSubmit} className="bo-signup-form">

      {/* 아이디 입력 필드 */}
      <div className="bo-form-group">
        <label htmlFor="id" className="bo-form-label">
          아이디 <span className="bo-required">*</span>
        </label>
        <input
          type="text"
          id="id"
          name="id"
          value={formData.id}
          onChange={onChange}
          className={`bo-form-input ${errors.id ? 'bo-form-input--error' : ''}`}
          placeholder="4-20자, 영문 소문자 + 숫자"
          autoComplete="username"
        />
        {/* 에러 메시지: 에러가 있을 때만 렌더링 */}
        {errors.id && <p className="bo-error-message">{errors.id}</p>}
      </div>

      {/* 비밀번호 입력 필드 */}
      <div className="bo-form-group">
        <label htmlFor="password" className="bo-form-label">
          비밀번호 <span className="bo-required">*</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={onChange}
          className={`bo-form-input ${errors.password ? 'bo-form-input--error' : ''}`}
          placeholder="8-20자, 영문+숫자+특수문자"
          autoComplete="new-password"
        />
        {errors.password && <p className="bo-error-message">{errors.password}</p>}
      </div>

      {/* 비밀번호 확인 입력 필드 */}
      <div className="bo-form-group">
        <label htmlFor="passwordConfirm" className="bo-form-label">
          비밀번호 확인 <span className="bo-required">*</span>
        </label>
        <input
          type="password"
          id="passwordConfirm"
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={onChange}
          className={`bo-form-input ${errors.passwordConfirm ? 'bo-form-input--error' : ''}`}
          placeholder="비밀번호 재입력"
          autoComplete="new-password"
        />
        {errors.passwordConfirm && <p className="bo-error-message">{errors.passwordConfirm}</p>}
      </div>

      {/* 관리자 레벨 선택 셀렉트 */}
      <div className="bo-form-group">
        <label htmlFor="level" className="bo-form-label">관리자 레벨</label>
        <select
          id="level"
          name="level"
          value={formData.level}
          onChange={onChange}
          className="bo-form-select"
        >
          {/* level 1: 일반 관리자, level 2: 슈퍼 관리자 */}
          <option value="1">Level 1 — 일반 관리자</option>
          <option value="2">Level 2 — 슈퍼 관리자</option>
        </select>
      </div>

      {/* 계정 생성 제출 버튼 */}
      <button
        type="submit"
        className="bo-submit-button"
        disabled={isSubmitting}
      >
        {/* 제출 중일 때 텍스트 변경으로 피드백 제공 */}
        {isSubmitting ? '생성 중...' : '계정 생성'}
      </button>

      {/* 하단 로그인 페이지 이동 링크 */}
      <div className="bo-signup-footer">
        <p className="bo-footer-text">
          이미 계정이 있으신가요?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="bo-link-button"
          >
            로그인하기
          </button>
        </p>
      </div>

    </form>
  );
}

export default BackofficeSignupForm;