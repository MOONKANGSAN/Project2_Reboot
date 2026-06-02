// 📁 src/pages/backoffice/login/validators.ts
// 역할: 로그인 폼 유효성 검증 순수 함수

import type { BackofficeLoginFormData, FormErrors } from '@/pages/backoffice/login/types';

// ── 아이디: 필수 입력 ──
export const validateId = (id: string): string | undefined => {
  if (!id) return '아이디를 입력해주세요.';
  if (id.length < 1) return '아이디를 입력해주세요.';
  return undefined;
};

// ── 비밀번호: 필수 입력 ──
export const validatePassword = (password: string): string | undefined => {
  if (!password) return '비밀번호를 입력해주세요.';
  if (password.length < 1) return '비밀번호를 입력해주세요.';
  return undefined;
};

// ── 전체 폼 일괄 검증 ──
export const validateLoginForm = (formData: BackofficeLoginFormData): FormErrors => {
  return {
    id: validateId(formData.id),
    password: validatePassword(formData.password),
  };
};

// ── 검증 결과에 에러가 있는지 확인 ──
export const hasErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some((e) => e !== undefined);
};