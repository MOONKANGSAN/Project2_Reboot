import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import RestaurantSearchInput, {
  type RestaurantSearchItem,
} from '@/components/RestaurantSearchInput/RestaurantSearchInput';
import './ReviewWritePage.css';

interface UserSession {
  userId: string;
  nickname: string;
}

// ── 별점 선택 컴포넌트
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }): JSX.Element {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="rw-stars" role="group" aria-label="별점 선택">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`rw-star ${n <= display ? 'rw-star--on' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`${n}점`}
        >
          ★
        </button>
      ))}
      <span className="rw-star-label">
        {display > 0 ? `${display}점` : '별점을 선택하세요'}
      </span>
    </div>
  );
}

// ── 메인 페이지
function ReviewWritePage(): JSX.Element {
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const presetIdx = params.get('restaurantIdx');

  const [session, setSession]                       = useState<UserSession | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantSearchItem | null>(null);
  const [rating, setRating]                         = useState(0);
  const [content, setContent]                       = useState('');
  const [imageFile, setImageFile]                   = useState<File | null>(null);
  const [imagePreview, setImagePreview]             = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting]             = useState(false);
  const [error, setError]                           = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 세션 확인
  useEffect(() => {
    const raw = sessionStorage.getItem('userSession');
    if (!raw) {
      alert('리뷰를 작성하려면 로그인이 필요합니다.');
      navigate('/');
      return;
    }
    setSession(JSON.parse(raw));
  }, [navigate]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = (): void => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!selectedRestaurant) { setError('점포를 선택해주세요.'); return; }
    if (rating === 0)        { setError('별점을 선택해주세요.'); return; }
    if (!content.trim())     { setError('리뷰 내용을 입력해주세요.'); return; }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append('restaurantIdx', String(selectedRestaurant.idx));
      form.append('userId',        session!.userId);
      form.append('rating',        String(rating));
      form.append('content',       content.trim());
      if (imageFile) form.append('image', imageFile);

      const { data } = await axios.post(`/api/reviews`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        alert('리뷰가 등록되었습니다!');
        if (presetIdx) navigate(`/restaurants/${presetIdx}`);
        else navigate('/reviews');
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? '서버에 연결할 수 없습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return <></>;

  return (
    <div className="rw-page">
      <div className="rw-container container">

        {/* 헤더 */}
        <div className="rw-header">
          <button className="rw-back" onClick={() => navigate(-1)}>← 뒤로</button>
          <h1 className="rw-title">리뷰 작성</h1>
          <p className="rw-subtitle">방문한 맛집의 솔직한 후기를 남겨보세요</p>
        </div>

        <form className="rw-card" onSubmit={handleSubmit} noValidate>

          {/* 점포 검색 선택 */}
          <div className="rw-field">
            <label className="rw-label">
              점포 선택 <span className="rw-required">*</span>
            </label>
            <RestaurantSearchInput
              selected={selectedRestaurant}
              onSelect={setSelectedRestaurant}
              hasError={!selectedRestaurant && !!error}
              presetIdx={presetIdx ? Number(presetIdx) : null}
            />
          </div>

          {/* 작성자 (읽기 전용) */}
          <div className="rw-field">
            <label className="rw-label">작성자</label>
            <div className="rw-readonly">
              <span className="rw-readonly__avatar">{session.nickname.charAt(0)}</span>
              <span className="rw-readonly__name">{session.nickname}</span>
            </div>
          </div>

          {/* 별점 */}
          <div className="rw-field">
            <label className="rw-label">
              별점 <span className="rw-required">*</span>
            </label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* 리뷰 내용 */}
          <div className="rw-field">
            <label className="rw-label">
              리뷰 내용 <span className="rw-required">*</span>
            </label>
            <textarea
              className={`rw-textarea ${!content.trim() && error ? 'rw-input--error' : ''}`}
              rows={5}
              placeholder="방문 후기를 자유롭게 작성해주세요 (맛, 서비스, 분위기 등)"
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={1000}
            />
            <p className="rw-char-count">{content.length} / 1000</p>
          </div>

          {/* 이미지 첨부 */}
          <div className="rw-field">
            <label className="rw-label">사진 첨부 <span className="rw-optional">(선택, 1장)</span></label>
            {imagePreview ? (
              <div className="rw-preview">
                <img src={imagePreview} alt="미리보기" className="rw-preview__img" />
                <button type="button" className="rw-preview__remove" onClick={handleImageRemove}>
                  ✕ 제거
                </button>
              </div>
            ) : (
              <button type="button" className="rw-upload-btn" onClick={() => fileInputRef.current?.click()}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>사진 선택</span>
                <span className="rw-upload-hint">JPG, PNG, WEBP (최대 10MB)</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="rw-file-hidden"
              onChange={handleImageChange}
            />
          </div>

          {error && <p className="rw-error">{error}</p>}

          <div className="rw-actions">
            <button type="button" className="rw-btn-cancel" onClick={() => navigate(-1)}>취소</button>
            <button type="submit" className="rw-btn-submit" disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '리뷰 등록'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ReviewWritePage;
