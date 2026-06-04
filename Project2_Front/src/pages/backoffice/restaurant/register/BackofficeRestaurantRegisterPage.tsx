import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RestaurantRegisterFormData, FormErrors, RestaurantCategory } from './types';
import type { PriceRange } from '@/types/index';
import { validateRestaurantForm, hasErrors } from './validators';
import { registerRestaurant, uploadRestaurantImages } from './api';
import HashtagInput from '../HashtagInput';
import './BackofficeRestaurantRegisterPage.css';

const CATEGORIES: RestaurantCategory[] = ['한식', '일식', '중식', '양식', '카페', '분식'];
const PRICE_RANGES: PriceRange[] = ['₩', '₩₩', '₩₩₩', '₩₩₩₩'];
const MAX_IMAGES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const INITIAL_FORM: RestaurantRegisterFormData = {
  name: '',
  category: '',
  address: '',
  location: '',
  phone: '',
  priceRange: '',
  description: '',
  hashtags: [],
};

function BackofficeRestaurantRegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<RestaurantRegisterFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 선택된 이미지 파일 목록
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // 미리보기 URL 목록 (objectURL)
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imgError, setImgError] = useState<string>('');

  // 컴포넌트 언마운트 시 objectURL 해제 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // 이미지 파일 선택 처리
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    setImgError('');
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    const remaining = MAX_IMAGES - imageFiles.length;
    if (remaining <= 0) {
      setImgError(`이미지는 최대 ${MAX_IMAGES}개까지 등록 가능합니다.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of selected.slice(0, remaining)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setImgError('JPG, PNG, WEBP, GIF 형식만 업로드 가능합니다.');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setImgError('각 이미지는 10MB 이하여야 합니다.');
        continue;
      }
      validFiles.push(file);
    }

    const newUrls = validFiles.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...newUrls]);

    // 같은 파일 재선택 허용을 위해 input 초기화
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 개별 이미지 제거
  const handleImageRemove = (index: number): void => {
    URL.revokeObjectURL(previewUrls[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setImgError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newErrors = validateRestaurantForm(formData);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;

    setIsSubmitting(true);
    try {
      // 1단계: 점포 정보 등록
      const data = await registerRestaurant(formData);
      if (!data.success) {
        alert('등록 실패: ' + data.message);
        return;
      }

      const restaurantIdx = data.idx!;

      // 2단계: 이미지가 있으면 업로드
      if (imageFiles.length > 0) {
        const imgResult = await uploadRestaurantImages(restaurantIdx, imageFiles);
        if (!imgResult.success) {
          // 점포는 등록됐지만 이미지 실패 — 목록으로 가되 안내
          alert(`점포 [${data.name}] 등록 완료.\n이미지 업로드 실패: ${imgResult.message}`);
          navigate('/backoffice/restaurant/list');
          return;
        }
      }

      alert(`점포 [${data.name}] 등록이 완료되었습니다.`);
      navigate('/backoffice/restaurant/list');

    } catch (error: any) {
      if (error.response?.data?.message) {
        alert('등록 실패: ' + error.response.data.message);
      } else if (error.response?.status === 500) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('서버에 연결할 수 없습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bo-register-page">

      {/* 페이지 헤더 */}
      <div className="bo-register-header">
        <div>
          <h2 className="bo-register-title">점포 등록</h2>
          <p className="bo-register-subtitle">새 점포 정보를 입력하고 등록하세요.</p>
        </div>
      </div>

      {/* 등록 폼 카드 */}
      <div className="bo-register-card">
        <form onSubmit={handleSubmit} className="bo-register-form">

          {/* 1행: 점포명 + 카테고리 */}
          <div className="bo-form-row">
            <div className="bo-form-group">
              <label className="bo-form-label">
                점포명 <span className="bo-required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`bo-form-input ${errors.name ? 'bo-form-input--error' : ''}`}
                placeholder="점포명을 입력하세요"
              />
              {errors.name && <p className="bo-error-message">{errors.name}</p>}
            </div>

            <div className="bo-form-group">
              <label className="bo-form-label">
                카테고리 <span className="bo-required">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`bo-form-select ${errors.category ? 'bo-form-input--error' : ''}`}
              >
                <option value="">카테고리 선택</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="bo-error-message">{errors.category}</p>}
            </div>
          </div>

          {/* 2행: 주소 */}
          <div className="bo-form-group">
            <label className="bo-form-label">
              주소 <span className="bo-required">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`bo-form-input ${errors.address ? 'bo-form-input--error' : ''}`}
              placeholder="상세 주소를 입력하세요 (예: 서울 강남구 테헤란로 123)"
            />
            {errors.address && <p className="bo-error-message">{errors.address}</p>}
          </div>

          {/* 3행: 지역명 + 전화번호 */}
          <div className="bo-form-row">
            <div className="bo-form-group">
              <label className="bo-form-label">
                지역명 <span className="bo-required">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`bo-form-input ${errors.location ? 'bo-form-input--error' : ''}`}
                placeholder="지역명 (예: 강남, 홍대, 신촌)"
              />
              {errors.location && <p className="bo-error-message">{errors.location}</p>}
            </div>

            <div className="bo-form-group">
              <label className="bo-form-label">
                전화번호 <span className="bo-required">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`bo-form-input ${errors.phone ? 'bo-form-input--error' : ''}`}
                placeholder="예: 02-1234-5678"
              />
              {errors.phone && <p className="bo-error-message">{errors.phone}</p>}
            </div>
          </div>

          {/* 4행: 가격대 */}
          <div className="bo-form-group bo-form-group--half">
            <label className="bo-form-label">가격대</label>
            <div className="bo-price-group">
              {PRICE_RANGES.map((p) => (
                <label key={p} className={`bo-price-option ${formData.priceRange === p ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="priceRange"
                    value={p}
                    checked={formData.priceRange === p}
                    onChange={handleChange}
                    className="bo-price-radio"
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* 5행: 소개글 */}
          <div className="bo-form-group">
            <label className="bo-form-label">소개글</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="bo-form-textarea"
              placeholder="점포 소개글을 입력하세요 (선택)"
              rows={4}
            />
          </div>

          {/* 6행: 해시태그 */}
          <div className="bo-form-group">
            <label className="bo-form-label">해시태그</label>
            <HashtagInput
              tags={formData.hashtags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, hashtags: tags }))}
            />
          </div>

          {/* 7행: 이미지 업로드 */}
          <div className="bo-form-group">
            <label className="bo-form-label">
              점포 이미지
              <span className="bo-img-limit-hint">최대 {MAX_IMAGES}장 · JPG, PNG, WEBP, GIF · 각 10MB 이하</span>
            </label>

            {/* 미리보기 그리드 */}
            {previewUrls.length > 0 && (
              <div className="bo-img-preview-grid">
                {previewUrls.map((url, idx) => (
                  <div key={url} className="bo-img-preview-item">
                    <img src={url} alt={`미리보기 ${idx + 1}`} className="bo-img-preview-thumb" />
                    {idx === 0 && (
                      <span className="bo-img-representative-badge">대표</span>
                    )}
                    <button
                      type="button"
                      className="bo-img-remove-btn"
                      onClick={() => handleImageRemove(idx)}
                      title="이미지 제거"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* 추가 버튼 (최대 미만일 때만 표시) */}
                {imageFiles.length < MAX_IMAGES && (
                  <button
                    type="button"
                    className="bo-img-add-more-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="bo-img-add-more-icon">+</span>
                    <span>추가</span>
                  </button>
                )}
              </div>
            )}

            {/* 이미지가 없을 때 드롭존 */}
            {previewUrls.length === 0 && (
              <button
                type="button"
                className="bo-img-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="bo-img-dropzone-icon">🖼</span>
                <span className="bo-img-dropzone-text">클릭하여 이미지 선택</span>
                <span className="bo-img-dropzone-hint">첫 번째 이미지가 대표 이미지로 설정됩니다</span>
              </button>
            )}

            {/* 숨겨진 파일 input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleImageSelect}
              className="bo-img-file-input"
            />

            {imgError && <p className="bo-error-message">{imgError}</p>}
          </div>

          {/* 버튼 */}
          <div className="bo-register-actions">
            <button
              type="button"
              className="bo-btn-cancel"
              onClick={() => navigate('/backoffice/main')}
            >
              취소
            </button>
            <button
              type="submit"
              className="bo-btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '점포 등록'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default BackofficeRestaurantRegisterPage;
