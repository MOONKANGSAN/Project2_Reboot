// 📁 src/pages/ProfilePage.tsx
// 역할: 로그인된 사용자의 프로필을 조회하고 수정하는 페이지
//       닉네임·전화번호·이메일 수정, 프로필 이미지 업로드(최대 8MB) 제공

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  fetchProfile,
  updateProfile,
  uploadProfileImage,
  type ProfileData,
} from '@/api/profileApi';
import './ProfilePage.css';

// ─────────────────────────────────────────
// 유효성 검증
// ─────────────────────────────────────────

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

function validateNickname(v: string): string | undefined {
  if (!v.trim()) return '닉네임을 입력해주세요.';
  if (v.trim().length < 2 || v.trim().length > 10) return '닉네임은 2~10자로 입력해주세요.';
  return undefined;
}

function validatePhone(v: string): string | undefined {
  if (!v.trim()) return '전화번호를 입력해주세요.';
  if (!/^010-\d{4}-\d{4}$/.test(v)) return '010-XXXX-XXXX 형식으로 입력해주세요.';
  return undefined;
}

const formatPhoneNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

function validateEmail(v: string): string | undefined {
  if (!v.trim()) return '이메일을 입력해주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return '올바른 이메일 형식이 아닙니다.';
  return undefined;
}

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────

function ProfilePage(): JSX.Element {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 세션에서 userId 가져오기
  const sessionRaw = sessionStorage.getItem('userSession');
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  const userId: string | null = session?.userId ?? null;

  // ── 폼 상태
  const [form, setForm] = useState({ nickname: '', phoneNumber: '', email: '' });
  const [errors, setErrors] = useState<{ nickname?: string; phoneNumber?: string; email?: string }>({});

  // ── 이미지 상태
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imageError, setImageError]     = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // ── 전체 상태
  const [pageLoading, setPageLoading]   = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg]     = useState<string | null>(null);
  const [serverError, setServerError]   = useState<string | null>(null);

  // ─────────────────────────────────────────
  // 초기 데이터 로드
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    fetchProfile(userId)
      .then((res) => {
        if (res.success && res.data) {
          const d: ProfileData = res.data;
          setForm({
            nickname:    d.nickname    ?? '',
            phoneNumber: d.phoneNumber ?? '',
            email:       d.email       ?? '',
          });
          if (d.profileImageUrl) setPreviewUrl(d.profileImageUrl);
        }
      })
      .catch(() => {
        // API 연동 전이라면 세션 정보로 초기값 채움
        setForm((prev) => ({ ...prev, nickname: session?.nickname ?? '' }));
      })
      .finally(() => setPageLoading(false));
  }, [userId]);

  // ─────────────────────────────────────────
  // 이미지 선택 처리
  // ─────────────────────────────────────────
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('이미지 파일은 최대 8MB까지 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('이미지 파일(JPG, PNG, GIF 등)만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    setImageError(null);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ─────────────────────────────────────────
  // 이미지 업로드 실행
  // ─────────────────────────────────────────
  const handleImageUpload = async (): Promise<void> => {
    if (!imageFile || !userId) return;
    setImageUploading(true);
    setImageError(null);
    try {
      const res = await uploadProfileImage(userId, imageFile);
      if (res.success) {
        setSuccessMsg('프로필 이미지가 변경되었습니다.');
        setImageFile(null);
        if (res.data?.imageUrl) {
          setPreviewUrl(res.data.imageUrl);
          // sessionStorage 갱신 후 Navbar에 변경 알림
          const updatedSession = { ...session, profileImageUrl: res.data.imageUrl };
          sessionStorage.setItem('userSession', JSON.stringify(updatedSession));
          window.dispatchEvent(new CustomEvent('sessionUpdated'));
        }
      } else {
        setImageError(res.message ?? '이미지 업로드에 실패했습니다.');
      }
    } catch {
      setImageError('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setImageUploading(false);
    }
  };

  // ─────────────────────────────────────────
  // 폼 입력 처리
  // ─────────────────────────────────────────
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const formatted = name === 'phoneNumber' ? formatPhoneNumber(value) : value;
    setForm((prev) => ({ ...prev, [name]: formatted }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccessMsg(null);
    setServerError(null);
  };

  // ─────────────────────────────────────────
  // 폼 제출 처리
  // ─────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const newErrors = {
      nickname:    validateNickname(form.nickname),
      phoneNumber: validatePhone(form.phoneNumber),
      email:       validateEmail(form.email),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setIsSubmitting(true);
    setSuccessMsg(null);
    setServerError(null);

    try {
      const res = await updateProfile({
        userId:      userId!,
        nickname:    form.nickname.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email:       form.email.trim(),
      });

      if (res.success) {
        // 세션의 닉네임 동기화
        const updated = { ...session, nickname: form.nickname.trim() };
        sessionStorage.setItem('userSession', JSON.stringify(updated));
        setSuccessMsg('프로필이 성공적으로 저장되었습니다.');
      } else {
        setServerError(res.message ?? '저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">불러오는 중...</div>
      </div>
    );
  }

  const avatarChar = form.nickname?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* ── 카드 헤더 */}
        <div className="profile-card__header">
          <h1 className="profile-card__title">내 프로필</h1>
          <p className="profile-card__subtitle">기본 정보를 수정할 수 있습니다.</p>
        </div>

        {/* ── 프로필 이미지 영역 */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrap">
            {previewUrl ? (
              <img src={previewUrl} alt="프로필 이미지" className="profile-avatar__img" />
            ) : (
              <div className="profile-avatar__placeholder">
                <span className="profile-avatar__char">{avatarChar}</span>
              </div>
            )}

            {/* 카메라 아이콘 오버레이 — 클릭 시 파일 선택 */}
            <button
              type="button"
              className="profile-avatar__edit-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="프로필 이미지 변경"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>

          {/* 숨겨진 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="profile-avatar__input"
            onChange={handleImageChange}
          />

          <p className="profile-avatar__hint">최대 8MB · JPG, PNG, GIF</p>

          {imageError && (
            <p className="profile-avatar__error">{imageError}</p>
          )}

          {/* 이미지가 선택된 경우에만 업로드 버튼 표시 */}
          {imageFile && (
            <button
              type="button"
              className="profile-avatar__upload-btn"
              onClick={handleImageUpload}
              disabled={imageUploading}
            >
              {imageUploading ? '업로드 중...' : '이미지 저장'}
            </button>
          )}
        </div>

        {/* ── 구분선 */}
        <div className="profile-divider" />

        {/* ── 프로필 수정 폼 */}
        <form onSubmit={handleSubmit} className="profile-form" noValidate>

          {/* 아이디 (읽기 전용) */}
          <div className="profile-form__group">
            <label className="profile-form__label">아이디</label>
            <input
              type="text"
              className="profile-form__input profile-form__input--readonly"
              value={userId ?? ''}
              readOnly
            />
          </div>

          {/* 닉네임 */}
          <div className="profile-form__group">
            <label htmlFor="nickname" className="profile-form__label">
              닉네임 <span className="profile-form__required">*</span>
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              className={`profile-form__input ${errors.nickname ? 'profile-form__input--error' : ''}`}
              value={form.nickname}
              onChange={handleChange}
              placeholder="2~10자"
              autoComplete="nickname"
            />
            {errors.nickname && (
              <p className="profile-form__error-msg">{errors.nickname}</p>
            )}
          </div>

          {/* 전화번호 */}
          <div className="profile-form__group">
            <label htmlFor="phoneNumber" className="profile-form__label">
              전화번호 <span className="profile-form__required">*</span>
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              className={`profile-form__input ${errors.phoneNumber ? 'profile-form__input--error' : ''}`}
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="010-1234-5678"
              autoComplete="tel"
            />
            {errors.phoneNumber && (
              <p className="profile-form__error-msg">{errors.phoneNumber}</p>
            )}
          </div>

          {/* 이메일 */}
          <div className="profile-form__group">
            <label htmlFor="email" className="profile-form__label">
              이메일 <span className="profile-form__required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`profile-form__input ${errors.email ? 'profile-form__input--error' : ''}`}
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="profile-form__error-msg">{errors.email}</p>
            )}
          </div>

          {/* 서버 에러 메시지 */}
          {serverError && (
            <div className="profile-form__server-error">{serverError}</div>
          )}

          {/* 성공 메시지 */}
          {successMsg && (
            <div className="profile-form__success-msg">{successMsg}</div>
          )}

          {/* 액션 버튼 */}
          <div className="profile-form__actions">
            <button
              type="button"
              className="profile-form__cancel-btn"
              onClick={() => navigate(-1)}
            >
              취소
            </button>
            <button
              type="submit"
              className="profile-form__submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
