// 📁 src/pages/SignupPage.tsx
// 역할: 회원가입 페이지 컴포넌트
//       사용자 입력 폼, 유효성 검증, Spring API 연동
//       POST /api/user/signup 엔드포인트로 회원가입 데이터 전송

import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logErrorToServer } from '../utils/errorLogger';
import './SignupPage.css';

// ─────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────

// 회원가입 폼 데이터 구조
interface SignupFormData {
  userId: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  phoneNumber: string;
  email: string;
}

// 폼 필드별 에러 메시지 구조
interface FormErrors {
  userId?: string;
  password?: string;
  passwordConfirm?: string;
  nickname?: string;
  phoneNumber?: string;
  email?: string;
}

// Spring 백엔드 응답 타입
interface ApiResponse {
  success: boolean;
  message: string;
  userId?: string;
  nickname?: string;
}

// ─────────────────────────────────────────
// API 클라이언트 설정
// ─────────────────────────────────────────

// Spring 백엔드 주소
const API_BASE_URL = 'http://localhost:8080/api';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────
// 유효성 검증 함수들
// ─────────────────────────────────────────

// 아이디 검증: 4-20자, 영문 소문자 + 숫자 조합
const validateUserId = (userId: string): string | undefined => {
  if (!userId) return '아이디를 입력해주세요.';
  if (userId.length < 4 || userId.length > 20) {
    return '아이디는 4-20자로 입력해주세요.';
  }
  if (!/^[a-z0-9]+$/.test(userId)) {
    return '아이디는 영문 소문자와 숫자만 사용 가능합니다.';
  }
  return undefined;
};

// 비밀번호 검증: 8-20자, 영문+숫자+특수문자 조합
const validatePassword = (password: string): string | undefined => {
  if (!password) return '비밀번호를 입력해주세요.';
  if (password.length < 8 || password.length > 20) {
    return '비밀번호는 8-20자로 입력해주세요.';
  }
  if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/.test(password)) {
    return '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.';
  }
  return undefined;
};

// 비밀번호 확인 검증
const validatePasswordConfirm = (password: string, passwordConfirm: string): string | undefined => {
  if (!passwordConfirm) return '비밀번호 확인을 입력해주세요.';
  if (password !== passwordConfirm) {
    return '비밀번호가 일치하지 않습니다.';
  }
  return undefined;
};

// 닉네임 검증: 2-10자
const validateNickname = (nickname: string): string | undefined => {
  if (!nickname) return '닉네임을 입력해주세요.';
  if (nickname.length < 2 || nickname.length > 10) {
    return '닉네임은 2-10자로 입력해주세요.';
  }
  return undefined;
};

// 전화번호 검증: 010-XXXX-XXXX 형식
const validatePhoneNumber = (phoneNumber: string): string | undefined => {
  if (!phoneNumber) return '전화번호를 입력해주세요.';
  if (!/^010-\d{4}-\d{4}$/.test(phoneNumber)) {
    return '전화번호는 010-XXXX-XXXX 형식으로 입력해주세요.';
  }
  return undefined;
};

// 이메일 검증
const validateEmail = (email: string): string | undefined => {
  if (!email) return '이메일을 입력해주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return '올바른 이메일 형식이 아닙니다.';
  }
  return undefined;
};

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────

function SignupPage(): JSX.Element {
  const navigate = useNavigate();

  // 폼 데이터 상태
  const [formData, setFormData] = useState<SignupFormData>({
    userId: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    phoneNumber: '',
    email: '',
  });

  // 에러 메시지 상태
  const [errors, setErrors] = useState<FormErrors>({});

  // 제출 중 상태 (중복 제출 방지)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 입력 필드 변경 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 입력 중 에러 메시지 초기화
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // 전체 폼 유효성 검증
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      userId: validateUserId(formData.userId),
      password: validatePassword(formData.password),
      passwordConfirm: validatePasswordConfirm(formData.password, formData.passwordConfirm),
      nickname: validateNickname(formData.nickname),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      email: validateEmail(formData.email),
    };

    setErrors(newErrors);

    // 에러가 하나라도 있으면 false 반환
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // 유효성 검증 실패 시 중단
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // ✨ Spring 백엔드 API 호출
      // POST /api/user/signup 엔드포인트로 데이터 전송
      const response = await apiClient.post<ApiResponse>('/user/signup', {
        userId: formData.userId,
        password: formData.password,
        nickname: formData.nickname,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });

      console.log('회원가입 성공:', response.data);

      // 성공 응답 확인
      if (response.data.success) {
        // 성공 알림
        alert(`${response.data.nickname}님 환영합니다!\n회원가입이 완료되었습니다.`);
        
        // 홈으로 이동
        navigate('/');
      } else {
        // 백엔드에서 반환한 에러 메시지
        await logErrorToServer(new Error(response.data.message), {
          userId: formData.userId,
          requestUrl: '/user/signup',
          httpMethod: 'POST',
          requestBody: {
            userId: formData.userId,
            password: formData.password,
            nickname: formData.nickname,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
          },
        });
        alert('1) 회원가입 실패: ' + response.data.message);
      }
    } catch (error: unknown) {
      console.error('회원가입 API 호출 실패:', error);

      await logErrorToServer(error, {
        userId: formData.userId,
        requestUrl: '/user/signup',
        httpMethod: 'POST',
        requestBody: {
          userId: formData.userId,
          password: formData.password,
          nickname: formData.nickname,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        },
      });

      // 에러 응답 처리
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        // 백엔드에서 반환한 에러 메시지 (아이디 중복, 이메일 중복 등)
        alert('2) 회원가입 실패: ' + error.response.data.message);
      } else if (axios.isAxiosError(error) && error.response?.status === 400) {
        // 400 Bad Request (유효하지 않은 데이터)
        alert('잘못된 입력 데이터입니다. 다시 확인해주세요.');
      } else if (axios.isAxiosError(error) && error.response?.status === 500) {
        // 500 Internal Server Error
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        // 네트워크 오류, 기타 에러
        alert('회원가입 중 오류가 발생했습니다.\n서버에 연결할 수 없습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* 헤더 */}
        <div className="signup-header">
          <h1 className="signup-title">회원가입</h1>
          <p className="signup-subtitle">맛지도와 함께 맛집 여행을 시작하세요!</p>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="signup-form">
          {/* 아이디 입력 */}
          <div className="form-group">
            <label htmlFor="userId" className="form-label">
              아이디 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className={`form-input ${errors.userId ? 'form-input--error' : ''}`}
              placeholder="4-20자, 영문 소문자와 숫자"
              autoComplete="username"
            />
            {errors.userId && <p className="error-message">{errors.userId}</p>}
          </div>

          {/* 비밀번호 입력 */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'form-input--error' : ''}`}
              placeholder="8-20자, 영문+숫자+특수문자"
              autoComplete="new-password"
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">
              비밀번호 확인 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              className={`form-input ${errors.passwordConfirm ? 'form-input--error' : ''}`}
              placeholder="비밀번호 재입력"
              autoComplete="new-password"
            />
            {errors.passwordConfirm && <p className="error-message">{errors.passwordConfirm}</p>}
          </div>

          {/* 닉네임 입력 */}
          <div className="form-group">
            <label htmlFor="nickname" className="form-label">
              닉네임 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className={`form-input ${errors.nickname ? 'form-input--error' : ''}`}
              placeholder="2-10자"
              autoComplete="nickname"
            />
            {errors.nickname && <p className="error-message">{errors.nickname}</p>}
          </div>

          {/* 전화번호 입력 */}
          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              전화번호 <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`form-input ${errors.phoneNumber ? 'form-input--error' : ''}`}
              placeholder="010-1234-5678"
              autoComplete="tel"
            />
            {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
          </div>

          {/* 이메일 입력 */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일 <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'form-input--error' : ''}`}
              placeholder="example@email.com"
              autoComplete="email"
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '가입 중...' : '가입하기'}
          </button>

          {/* 로그인 링크 */}
          <div className="signup-footer">
            <p className="footer-text">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="link-button"
              >
                로그인하기
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;