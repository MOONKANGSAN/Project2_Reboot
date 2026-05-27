// 📁 src/pages/backoffice/signup/validators.ts
// 역할: 가입 폼 각 필드의 유효성 검증 순수 함수 모음
//       UI 컴포넌트와 완전히 분리되어 단독 테스트 가능
//       반환값: undefined(통과) | string(에러 메시지)

import type { BackofficeSignupFormData, FormErrors } from '@/pages/backoffice/signup/types';

// ── 아이디: 4-20자, 영문 소문자 + 숫자만 허용 ──
export const validateId = (id: string): string | undefined => {
  if (!id) return '아이디를 입력해주세요.';
  if (id.length < 4 || id.length > 20) return '아이디는 4-20자로 입력해주세요.';
  if (!/^[a-z0-9]+$/.test(id)) return '영문 소문자와 숫자만 사용 가능합니다.';
  return undefined;
};

// ── 비밀번호: 8-20자, 영문+숫자+특수문자 모두 포함 ──
export const validatePassword = (pw: string): string | undefined => {
  if (!pw) return '비밀번호를 입력해주세요.';
  if (pw.length < 8 || pw.length > 20) return '비밀번호는 8-20자로 입력해주세요.';
  if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/.test(pw))
    return '영문, 숫자, 특수문자를 모두 포함해야 합니다.';
  return undefined;
};

// ── 비밀번호 확인: 원본 비밀번호와 일치 여부 ──
export const validatePasswordConfirm = (pw: string, confirm: string): string | undefined => {
  if (!confirm) return '비밀번호 확인을 입력해주세요.';
  if (pw !== confirm) return '비밀번호가 일치하지 않습니다.';
  return undefined;
};

// ── 전체 폼 일괄 검증 ──
// 모든 필드를 한 번에 검증하여 FormErrors 객체로 반환
// 반환된 객체의 모든 값이 undefined이면 검증 통과
export const validateSignupForm = (formData: BackofficeSignupFormData): FormErrors => {
  return {
    id: validateId(formData.id),
    password: validatePassword(formData.password),
    passwordConfirm: validatePasswordConfirm(formData.password, formData.passwordConfirm),
  };
};

// ── 검증 결과에 에러가 하나라도 있는지 확인 ──
export const hasErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some((e) => e !== undefined);
};