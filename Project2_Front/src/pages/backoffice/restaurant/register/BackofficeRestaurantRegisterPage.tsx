import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RestaurantRegisterFormData, FormErrors, RestaurantCategory } from './types';
import type { PriceRange } from '@/types/index';
import { validateRestaurantForm, hasErrors } from './validators';
import { registerRestaurant } from './api';
import './BackofficeRestaurantRegisterPage.css';

const CATEGORIES: RestaurantCategory[] = ['한식', '일식', '중식', '양식', '카페', '분식'];
const PRICE_RANGES: PriceRange[] = ['₩', '₩₩', '₩₩₩', '₩₩₩₩'];

const INITIAL_FORM: RestaurantRegisterFormData = {
  name: '',
  category: '',
  address: '',
  location: '',
  phone: '',
  priceRange: '',
  description: '',
};

function BackofficeRestaurantRegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RestaurantRegisterFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newErrors = validateRestaurantForm(formData);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;

    setIsSubmitting(true);
    try {
      const data = await registerRestaurant(formData);
      if (data.success) {
        alert(`점포 [${data.name}] 등록이 완료되었습니다.`);
        navigate('/backoffice/restaurant/list');
      } else {
        alert('등록 실패: ' + data.message);
      }
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
