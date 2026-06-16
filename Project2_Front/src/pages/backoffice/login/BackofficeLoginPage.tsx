import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import type { BackofficeLoginFormData, FormErrors, BackofficeSession } from '@/pages/backoffice/login/types';
import { validateLoginForm, hasErrors } from '@/pages/backoffice/login/validators';
import { loginBackofficeUser } from '@/pages/backoffice/login/api';
import BackofficeLoginHeader from '@/pages/backoffice/login/BackofficeLoginHeader';
import BackofficeLoginForm from '@/pages/backoffice/login/Backofficeloginform';
import '@/pages/backoffice/login/BackofficeLoginPage.css';

function BackofficeLoginPage(): JSX.Element {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<BackofficeLoginFormData>({
    id: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const newErrors = validateLoginForm(formData);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;

    setIsSubmitting(true);
    try {
      const data = await loginBackofficeUser(formData.id, formData.password);

      if (data.success && data.id && data.level !== undefined) {
        const session: BackofficeSession = {
          id: data.id,
          level: data.level,
          loginTime: new Date().toISOString(),
        };
        sessionStorage.setItem('backofficeSession', JSON.stringify(session));
        // 로그인 성공 시 대시보드로 바로 이동
        navigate('/backoffice/main');
      } else {
        alert('로그인 실패: ' + data.message);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('로그인 실패: ' + (error.response.data?.message ?? '아이디 또는 비밀번호를 확인해주세요.'));
      } else if (error.response?.status === 500) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('서버에 연결할 수 없습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToSignup = (): void => {
    navigate('/backoffice/signup');
  };

  return (
    <div className="bo-login-container">
      <div className="bo-login-card">
        <BackofficeLoginHeader />
        <BackofficeLoginForm
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onNavigateToSignup={handleNavigateToSignup}
        />
      </div>
    </div>
  );
}

export default BackofficeLoginPage;
