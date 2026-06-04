import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { RestaurantEditFormData, FormErrors, RestaurantCategory } from './types';
import type { PriceRange } from '@/types/index';
import { validateRestaurantEditForm, hasErrors } from './validators';
import { fetchRestaurantDetail, fetchRestaurantHashtagNames, updateRestaurant } from './api';
import HashtagInput from '../HashtagInput';
import '../register/BackofficeRestaurantRegisterPage.css';

const CATEGORIES: RestaurantCategory[] = ['한식', '일식', '중식', '양식', '카페', '분식'];
const PRICE_RANGES: PriceRange[] = ['₩', '₩₩', '₩₩₩', '₩₩₩₩'];

const EMPTY_FORM: RestaurantEditFormData = {
  name: '',
  category: '',
  address: '',
  location: '',
  phone: '',
  priceRange: '',
  description: '',
  hashtags: [],
};

function BackofficeRestaurantEditPage(): JSX.Element {
  const navigate = useNavigate();
  const { idx } = useParams<{ idx: string }>();

  const [formData, setFormData] = useState<RestaurantEditFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 점포 정보 + 현재 해시태그 병렬 조회
  useEffect(() => {
    if (!idx) return;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const numIdx = Number(idx);
        const [detailRes, hashtagNames] = await Promise.all([
          fetchRestaurantDetail(numIdx),
          fetchRestaurantHashtagNames(numIdx),
        ]);

        if (detailRes.success && detailRes.data) {
          const d = detailRes.data;
          setFormData({
            name: d.name,
            category: (d.category as RestaurantCategory) || '',
            address: d.address,
            location: d.location,
            phone: d.phone,
            priceRange: (d.priceRange as PriceRange) || '',
            description: d.description ?? '',
            hashtags: hashtagNames,
          });
        } else {
          setLoadError(detailRes.message ?? '점포 정보를 불러오는데 실패했습니다.');
        }
      } catch {
        setLoadError('서버에 연결할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idx]);

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
    const newErrors = validateRestaurantEditForm(formData);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;

    setIsSubmitting(true);
    try {
      const data = await updateRestaurant(Number(idx), formData);
      if (data.success) {
        alert(`점포 [${data.name}] 정보가 수정되었습니다.`);
        navigate('/backoffice/restaurant/list');
      } else {
        alert('수정 실패: ' + data.message);
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert('수정 실패: ' + error.response.data.message);
      } else if (error.response?.status === 500) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('서버에 연결할 수 없습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bo-register-page">
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--bo-text-muted)' }}>
          불러오는 중...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bo-register-page">
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--bo-error)' }}>
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="bo-register-page">

      <div className="bo-register-header">
        <div>
          <h2 className="bo-register-title">점포 수정</h2>
          <p className="bo-register-subtitle">점포 정보를 수정하고 저장하세요. (No. {idx})</p>
        </div>
      </div>

      <div className="bo-register-card">
        <form onSubmit={handleSubmit} className="bo-register-form">

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
              placeholder="상세 주소를 입력하세요"
            />
            {errors.address && <p className="bo-error-message">{errors.address}</p>}
          </div>

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
                placeholder="지역명 (예: 강남, 홍대)"
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

          <div className="bo-form-group bo-form-group--half">
            <label className="bo-form-label">가격대</label>
            <div className="bo-price-group">
              {PRICE_RANGES.map((p) => (
                <label
                  key={p}
                  className={`bo-price-option ${formData.priceRange === p ? 'is-selected' : ''}`}
                >
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

          {/* 해시태그 */}
          <div className="bo-form-group">
            <label className="bo-form-label">해시태그</label>
            <HashtagInput
              tags={formData.hashtags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, hashtags: tags }))}
            />
          </div>

          <div className="bo-register-actions">
            <button
              type="button"
              className="bo-btn-cancel"
              onClick={() => navigate('/backoffice/restaurant/list')}
            >
              취소
            </button>
            <button
              type="submit"
              className="bo-btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '수정 저장'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default BackofficeRestaurantEditPage;
