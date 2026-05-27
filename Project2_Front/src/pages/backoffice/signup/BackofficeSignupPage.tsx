// 📁 src/pages/backoffice/signup/BackofficeSignupPage.tsx
// 역할: 백오피스 가입 페이지 컨테이너 컴포넌트
//       상태 관리, 이벤트 핸들링, API 호출 로직만 담당
//       UI 렌더링은 BackofficeSignupHeader, BackofficeSignupForm에 위임

import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// ── 분리된 모듈 import ──
import type { BackofficeSignupFormData, FormErrors } from '@/pages/backoffice/signup/types';
import { validateSignupForm, hasErrors } from '@/pages/backoffice/signup/validators';
import { signupBackofficeUser } from '@/pages/backoffice/signup/api';
import BackofficeSignupHeader from '@/pages/backoffice/signup/BackofficeSignupHeader';
import BackofficeSignupForm from '@/pages/backoffice/signup/BackofficeSignupForm';
import '@/pages/backoffice/signup/BackofficeSignupPage.css';

function BackofficeSignupPage(): JSX.Element {
  const navigate = useNavigate();

  // ── 폼 입력 데이터 상태 ──
  const [formData, setFormData] = useState<BackofficeSignupFormData>({
    id: '',
    password: '',
    passwordConfirm: '',
    level: '1', // 기본값: 일반관리자
  });

  // ── 필드별 에러 메시지 상태 ──
  const [errors, setErrors] = useState<FormErrors>({});

  // ── 제출 중 상태 (중복 제출 방지) ──
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ── 입력 변경 핸들러: input, select 공용 ──
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;

    // 입력값 상태 업데이트
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 입력 중 해당 필드 에러만 초기화 (다른 필드 에러는 유지)
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ── 폼 제출 핸들러 ──
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // validators.ts의 일괄 검증 함수 호출
    const newErrors = validateSignupForm(formData);
    setErrors(newErrors);

    // 에러가 하나라도 있으면 API 호출 중단
    if (hasErrors(newErrors)) return;

    setIsSubmitting(true);
    try {
      // api.ts의 가입 함수 호출 (axios 직접 사용하지 않음)
      const data = await signupBackofficeUser(formData.id, formData.password, formData.level);

      if (data.success) {
        alert(`관리자 계정 [${data.id}] 생성 완료\n레벨: ${data.level}`);
        // 가입 성공 후 백오피스 로그인 페이지로 이동
        navigate('/backoffice/login');
      } else {
        alert('가입 실패: ' + data.message);
      }
    } catch (error: any) {
      // 백엔드에서 반환한 에러 메시지 우선 표시 (아이디 중복 등)
      if (error.response?.data?.message) {
        alert('가입 실패: ' + error.response.data.message);
      } else if (error.response?.status === 500) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('서버에 연결할 수 없습니다.');
      }
    } finally {
      // 성공/실패 관계없이 제출 중 상태 해제
      setIsSubmitting(false);
    }
  };

  // ── 로그인 페이지 이동 핸들러 ──
  const handleNavigateToLogin = (): void => {
    navigate('/backoffice/login');
  };

  return (
    <div className="bo-signup-container">
      <div className="bo-signup-card">

        {/* 헤더: BACKOFFICE 뱃지 + 타이틀 + 서브타이틀 */}
        <BackofficeSignupHeader />

        {/* 폼: 입력 필드 + 버튼 + 로그인 링크 */}
        <BackofficeSignupForm
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onNavigateToLogin={handleNavigateToLogin}
        />

      </div>
    </div>
  );
}

export default BackofficeSignupPage;