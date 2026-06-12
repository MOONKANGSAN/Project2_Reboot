import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { RestaurantEditFormData, FormErrors, RestaurantCategory } from './types';
import type { PriceRange } from '@/types/index';
import { validateRestaurantEditForm, hasErrors } from './validators';
import {
  fetchRestaurantDetail,
  fetchRestaurantHashtagNames,
  updateRestaurant,
  fetchRestaurantImages,
  deleteRestaurantImage,
  uploadRestaurantImages,
  type RestaurantImageItem,
} from './api';
import HashtagInput from '../HashtagInput';
import KakaoAddressSearch from '@/components/KakaoAddressSearch/KakaoAddressSearch';
import '../register/BackofficeRestaurantRegisterPage.css';

const BACKEND        = 'http://localhost:8080';
const CATEGORIES: RestaurantCategory[] = ['한식', '일식', '중식', '양식', '카페', '분식'];
const PRICE_RANGES: PriceRange[]       = ['₩', '₩₩', '₩₩₩', '₩₩₩₩'];
const MAX_IMAGES     = 5;
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EMPTY_FORM: RestaurantEditFormData = {
  name: '', category: '', address: '', location: '',
  phone: '', priceRange: '', description: '', hashtags: [],
  lat: null, lng: null,
};

function BackofficeRestaurantEditPage(): JSX.Element {
  const navigate = useNavigate();
  const { idx }  = useParams<{ idx: string }>();

  const [formData,     setFormData]     = useState<RestaurantEditFormData>(EMPTY_FORM);
  const [errors,       setErrors]       = useState<FormErrors>({});
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError,    setLoadError]    = useState<string | null>(null);

  // 기존 이미지 (DB에서 로드)
  const [existingImages,    setExistingImages]    = useState<RestaurantImageItem[]>([]);
  const [representativeIdx, setRepresentativeIdx] = useState<number | null>(null);
  const [deletingIds,       setDeletingIds]       = useState<Set<number>>(new Set());

  // 새로 추가할 이미지 (submit 시 업로드)
  const [newImageFiles,   setNewImageFiles]   = useState<File[]>([]);
  const [newPreviewUrls,  setNewPreviewUrls]  = useState<string[]>([]);
  const [imgError,        setImgError]        = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 총 이미지 수 (기존 + 신규)
  const totalImages = existingImages.length + newImageFiles.length;

  // 점포 정보 + 해시태그 + 이미지 병렬 로드
  useEffect(() => {
    if (!idx) return;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const numIdx = Number(idx);
        const [detailRes, hashtagNames, images] = await Promise.all([
          fetchRestaurantDetail(numIdx),
          fetchRestaurantHashtagNames(numIdx),
          fetchRestaurantImages(numIdx),
        ]);

        if (detailRes.success && detailRes.data) {
          const d = detailRes.data;
          setFormData({
            name:        d.name,
            category:    (d.category as RestaurantCategory) || '',
            address:     d.address,
            location:    d.location,
            phone:       d.phone,
            priceRange:  (d.priceRange as PriceRange) || '',
            description: d.description ?? '',
            hashtags:    hashtagNames,
            lat:         d.latitude  ?? null,
            lng:         d.longitude ?? null,
          });
          setRepresentativeIdx(d.imgIdx ?? null);
        } else {
          setLoadError(detailRes.message ?? '점포 정보를 불러오는데 실패했습니다.');
        }
        setExistingImages(images);
      } catch {
        setLoadError('서버에 연결할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [idx]);

  // objectURL 메모리 해제
  useEffect(() => {
    return () => newPreviewUrls.forEach(URL.revokeObjectURL);
  }, [newPreviewUrls]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // 기존 이미지 삭제 (즉시 API 호출)
  const handleDeleteExisting = async (imgIdx: number): Promise<void> => {
    if (deletingIds.has(imgIdx)) return;
    if (!confirm('이미지를 삭제하시겠습니까?')) return;

    setDeletingIds(prev => new Set([...prev, imgIdx]));
    try {
      await deleteRestaurantImage(imgIdx);
      setExistingImages(prev => prev.filter(img => img.idx !== imgIdx));
      // 대표 이미지였으면 다음 이미지로 자동 재지정 (서버가 처리, 로컬도 반영)
      if (representativeIdx === imgIdx) {
        const remaining = existingImages.filter(img => img.idx !== imgIdx);
        setRepresentativeIdx(remaining.length > 0 ? remaining[0].idx : null);
      }
    } catch {
      alert('이미지 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(imgIdx);
        return next;
      });
    }
  };

  // 새 이미지 파일 선택
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    setImgError('');
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    const remaining = MAX_IMAGES - totalImages;
    if (remaining <= 0) {
      setImgError(`이미지는 최대 ${MAX_IMAGES}개까지 등록 가능합니다.`);
      return;
    }

    const valid: File[] = [];
    for (const file of selected.slice(0, remaining)) {
      if (!ALLOWED_TYPES.includes(file.type)) { setImgError('JPG, PNG, WEBP, GIF만 가능합니다.'); continue; }
      if (file.size > 10 * 1024 * 1024)       { setImgError('각 이미지는 10MB 이하여야 합니다.');  continue; }
      valid.push(file);
    }

    setNewImageFiles(prev  => [...prev,  ...valid]);
    setNewPreviewUrls(prev => [...prev,  ...valid.map(f => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 새 이미지 미리보기 제거 (업로드 전 취소)
  const handleRemoveNew = (i: number): void => {
    URL.revokeObjectURL(newPreviewUrls[i]);
    setNewImageFiles(prev  => prev.filter((_, j) => j !== i));
    setNewPreviewUrls(prev => prev.filter((_, j) => j !== i));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newErrors = validateRestaurantEditForm(formData);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;

    setIsSubmitting(true);
    try {
      const data = await updateRestaurant(Number(idx), formData);
      if (!data.success) { alert('수정 실패: ' + data.message); return; }

      // 새 이미지가 있으면 업로드
      if (newImageFiles.length > 0) {
        const imgResult = await uploadRestaurantImages(Number(idx), newImageFiles);
        if (!imgResult.success) {
          alert(`점포 수정 완료.\n이미지 업로드 실패: ${imgResult.message}`);
          navigate('/backoffice/restaurant/list');
          return;
        }
      }

      alert(`점포 [${data.name}] 정보가 수정되었습니다.`);
      navigate('/backoffice/restaurant/list');
    } catch (error: any) {
      if (error.response?.data?.message) alert('수정 실패: ' + error.response.data.message);
      else if (error.response?.status === 500) alert('서버 오류가 발생했습니다.');
      else alert('서버에 연결할 수 없습니다.');
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

          {/* 점포명 + 카테고리 */}
          <div className="bo-form-row">
            <div className="bo-form-group">
              <label className="bo-form-label">점포명 <span className="bo-required">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className={`bo-form-input ${errors.name ? 'bo-form-input--error' : ''}`}
                placeholder="점포명을 입력하세요" />
              {errors.name && <p className="bo-error-message">{errors.name}</p>}
            </div>
            <div className="bo-form-group">
              <label className="bo-form-label">카테고리 <span className="bo-required">*</span></label>
              <select name="category" value={formData.category} onChange={handleChange}
                className={`bo-form-select ${errors.category ? 'bo-form-input--error' : ''}`}>
                <option value="">카테고리 선택</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="bo-error-message">{errors.category}</p>}
            </div>
          </div>

          {/* 주소 */}
          <div className="bo-form-group">
            <label className="bo-form-label">주소 <span className="bo-required">*</span></label>
            <KakaoAddressSearch
              value={formData.address}
              inputClassName={`bo-form-input${errors.address ? ' bo-form-input--error' : ''}`}
              onSelect={({ address, location, lat, lng }) => {
                setFormData(prev => ({ ...prev, address, location, lat, lng }));
                setErrors(prev => ({ ...prev, address: undefined, location: undefined }));
              }}
            />
            {errors.address && <p className="bo-error-message">{errors.address}</p>}
          </div>

          {/* 지역명 + 전화번호 */}
          <div className="bo-form-row">
            <div className="bo-form-group">
              <label className="bo-form-label">
                지역명 <span className="bo-required">*</span>
                <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--bo-text-muted)', marginLeft: '6px' }}>주소 검색 시 자동 입력</span>
              </label>
              <input type="text" name="location" value={formData.location} onChange={handleChange}
                className={`bo-form-input ${errors.location ? 'bo-form-input--error' : ''}`}
                placeholder="예: 강남구, 해운대구" />
              {errors.location && <p className="bo-error-message">{errors.location}</p>}
            </div>
            <div className="bo-form-group">
              <label className="bo-form-label">전화번호 <span className="bo-required">*</span></label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                className={`bo-form-input ${errors.phone ? 'bo-form-input--error' : ''}`}
                placeholder="예: 02-1234-5678" />
              {errors.phone && <p className="bo-error-message">{errors.phone}</p>}
            </div>
          </div>

          {/* 가격대 */}
          <div className="bo-form-group bo-form-group--half">
            <label className="bo-form-label">가격대</label>
            <div className="bo-price-group">
              {PRICE_RANGES.map(p => (
                <label key={p} className={`bo-price-option ${formData.priceRange === p ? 'is-selected' : ''}`}>
                  <input type="radio" name="priceRange" value={p}
                    checked={formData.priceRange === p} onChange={handleChange}
                    className="bo-price-radio" />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* 소개글 */}
          <div className="bo-form-group">
            <label className="bo-form-label">소개글</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              className="bo-form-textarea" placeholder="점포 소개글을 입력하세요 (선택)" rows={4} />
          </div>

          {/* 해시태그 */}
          <div className="bo-form-group">
            <label className="bo-form-label">해시태그</label>
            <HashtagInput
              tags={formData.hashtags}
              onChange={tags => setFormData(prev => ({ ...prev, hashtags: tags }))}
            />
          </div>

          {/* 이미지 관리 */}
          <div className="bo-form-group">
            <label className="bo-form-label">
              점포 이미지
              <span className="bo-img-limit-hint">최대 {MAX_IMAGES}장 · JPG, PNG, WEBP, GIF · 각 10MB 이하</span>
            </label>

            {/* 기존 이미지 + 신규 미리보기 통합 그리드 */}
            {(existingImages.length > 0 || newPreviewUrls.length > 0) ? (
              <div className="bo-img-preview-grid">

                {/* 기존 이미지 (DB 저장됨) */}
                {existingImages.map(img => (
                  <div key={img.idx} className="bo-img-preview-item">
                    <img
                      src={`${BACKEND}${img.imgUrl}`}
                      alt="점포 이미지"
                      className="bo-img-preview-thumb"
                    />
                    {img.idx === representativeIdx && (
                      <span className="bo-img-representative-badge">대표</span>
                    )}
                    <button
                      type="button"
                      className="bo-img-remove-btn"
                      onClick={() => handleDeleteExisting(img.idx)}
                      disabled={deletingIds.has(img.idx)}
                      title="이미지 삭제"
                    >
                      {deletingIds.has(img.idx) ? '…' : '✕'}
                    </button>
                  </div>
                ))}

                {/* 신규 이미지 미리보기 (아직 미업로드) */}
                {newPreviewUrls.map((url, i) => (
                  <div key={url} className="bo-img-preview-item">
                    <img src={url} alt={`신규 ${i + 1}`} className="bo-img-preview-thumb" />
                    <span className="bo-img-representative-badge" style={{ background: '#3b82f6' }}>NEW</span>
                    <button type="button" className="bo-img-remove-btn"
                      onClick={() => handleRemoveNew(i)} title="추가 취소">
                      ✕
                    </button>
                  </div>
                ))}

                {/* 추가 버튼 */}
                {totalImages < MAX_IMAGES && (
                  <button type="button" className="bo-img-add-more-btn"
                    onClick={() => fileInputRef.current?.click()}>
                    <span className="bo-img-add-more-icon">+</span>
                    <span>추가</span>
                  </button>
                )}
              </div>
            ) : (
              // 이미지가 하나도 없으면 드롭존
              <button type="button" className="bo-img-dropzone"
                onClick={() => fileInputRef.current?.click()}>
                <span className="bo-img-dropzone-icon">🖼</span>
                <span className="bo-img-dropzone-text">클릭하여 이미지 선택</span>
                <span className="bo-img-dropzone-hint">첫 번째 이미지가 대표 이미지로 설정됩니다</span>
              </button>
            )}

            <input ref={fileInputRef} type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple onChange={handleImageSelect}
              className="bo-img-file-input" />

            {imgError && <p className="bo-error-message">{imgError}</p>}
          </div>

          {/* 버튼 */}
          <div className="bo-register-actions">
            <button type="button" className="bo-btn-cancel"
              onClick={() => navigate('/backoffice/restaurant/list')}>
              취소
            </button>
            <button type="submit" className="bo-btn-submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '수정 저장'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default BackofficeRestaurantEditPage;
