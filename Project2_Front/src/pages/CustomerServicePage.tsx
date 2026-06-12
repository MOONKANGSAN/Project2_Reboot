import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { fetchMyInquiries, INQUIRY_STATES, type InquiryListItem } from '@/api/inquiryApi';
import HashtagInput from '@/pages/backoffice/restaurant/HashtagInput';
import { validateRestaurantForm, hasErrors } from '@/pages/backoffice/restaurant/register/validators';
import type { RestaurantRegisterFormData, FormErrors } from '@/pages/backoffice/restaurant/register/types';
import type { PriceRange } from '@/types/index';
import KakaoAddressSearch from '@/components/KakaoAddressSearch/KakaoAddressSearch';
import './CustomerServicePage.css';

const BACKEND = 'http://localhost:8080';

type TabKey = 'inquiries' | 'register' | 'faqs';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'inquiries', label: '문의 내역' },
  { key: 'register',  label: '점포 등록 신청' },
  { key: 'faqs',      label: 'FAQs' },
];

const CATEGORIES = ['한식', '일식', '중식', '양식', '카페', '분식'] as const;
const PRICE_RANGES: PriceRange[] = ['₩', '₩₩', '₩₩₩', '₩₩₩₩'];
const MAX_IMAGES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const INITIAL_FORM: RestaurantRegisterFormData = {
  name: '', category: '', address: '', location: '',
  phone: '', priceRange: '', description: '', hashtags: [],
  lat: null, lng: null,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// ──────────────────────────────────────────
// 탭 1 — 문의 내역
// ──────────────────────────────────────────
function InquiriesTab({ userId }: { userId: string }): JSX.Element {
  const navigate = useNavigate();
  const [items,   setItems]   = useState<InquiryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetchMyInquiries(userId)
      .then(res => {
        if (res.success) setItems(res.data);
        else setError('문의 내역을 불러오지 못했습니다.');
      })
      .catch(() => setError('서버에 연결할 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="cs-tab-content">
      <div className="cs-tab-header">
        <p className="cs-tab-desc">접수하신 문의 내역을 확인할 수 있습니다.</p>
        <button className="cs-primary-btn" onClick={() => navigate('/inquiry/write')}>
          + 문의 작성
        </button>
      </div>

      {loading ? (
        <div className="cs-status"><div className="cs-spinner" /><p>불러오는 중...</p></div>
      ) : error ? (
        <div className="cs-status cs-status--error">{error}</div>
      ) : items.length === 0 ? (
        <div className="cs-empty">
          <p className="cs-empty__msg">접수된 문의가 없습니다.</p>
          <button className="cs-empty__btn" onClick={() => navigate('/inquiry/write')}>
            첫 문의 작성하기
          </button>
        </div>
      ) : (
        <ul className="cs-inquiry-list">
          {items.map(item => {
            const st = INQUIRY_STATES[item.state] ?? { label: '알 수 없음', color: '#9ca3af' };
            return (
              <li key={item.idx} className="cs-inquiry-item">
                <div className="cs-inquiry-item__top">
                  <span className="cs-inquiry-item__type">{item.inquiryTypeName}</span>
                  <span className="cs-inquiry-item__state" style={{ color: st.color }}>{st.label}</span>
                </div>
                <div className="cs-inquiry-item__title-row">
                  {item.isPublic === 0 && <span className="cs-inquiry-item__lock">🔒</span>}
                  <p className="cs-inquiry-item__title">{item.title}</p>
                  {item.hasAnswer && <span className="cs-inquiry-item__answered">답변완료</span>}
                </div>
                <p className="cs-inquiry-item__date">{formatDate(item.regDate)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// 탭 2 — 점포 등록 신청
// ──────────────────────────────────────────
function RegisterTab(): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData,     setFormData]     = useState<RestaurantRegisterFormData>(INITIAL_FORM);
  const [errors,       setErrors]       = useState<FormErrors>({});
  const [imageFiles,   setImageFiles]   = useState<File[]>([]);
  const [previewUrls,  setPreviewUrls]  = useState<string[]>([]);
  const [imgError,     setImgError]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  useEffect(() => () => previewUrls.forEach(URL.revokeObjectURL), [previewUrls]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    setImgError('');
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    const remaining = MAX_IMAGES - imageFiles.length;
    if (remaining <= 0) { setImgError(`이미지는 최대 ${MAX_IMAGES}개까지 등록 가능합니다.`); return; }

    const valid: File[] = [];
    for (const file of selected.slice(0, remaining)) {
      if (!ALLOWED_TYPES.includes(file.type)) { setImgError('JPG, PNG, WEBP, GIF만 가능합니다.'); continue; }
      if (file.size > 10 * 1024 * 1024)       { setImgError('각 이미지는 10MB 이하여야 합니다.');  continue; }
      valid.push(file);
    }
    setImageFiles(prev  => [...prev,  ...valid]);
    setPreviewUrls(prev => [...prev,  ...valid.map(f => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageRemove = (i: number): void => {
    URL.revokeObjectURL(previewUrls[i]);
    setImageFiles(prev  => prev.filter((_, idx) => idx !== i));
    setPreviewUrls(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newErrors = validateRestaurantForm(formData);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;

    setIsSubmitting(true);
    try {
      // 1단계: 점포 신청 정보 전송
      const { data } = await axios.post(`${BACKEND}/api/restaurants/request`, {
        name:        formData.name,
        category:    formData.category,
        address:     formData.address,
        location:    formData.location,
        phone:       formData.phone,
        priceRange:  formData.priceRange || null,
        description: formData.description || null,
        latitude:    formData.lat,
        longitude:   formData.lng,
        hashtags:    formData.hashtags.length > 0 ? formData.hashtags : null,
      });

      if (!data.success) { alert(data.message); return; }

      // 2단계: 이미지가 있으면 업로드
      if (imageFiles.length > 0) {
        const form = new FormData();
        form.append('restaurantIdx', String(data.idx));
        imageFiles.forEach(f => form.append('images', f));
        await axios.post(`${BACKEND}/api/backoffice/restaurant/img/upload`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.message ?? '서버에 연결할 수 없습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="cs-tab-content">
        <div className="cs-submitted">
          <div className="cs-submitted__icon">✅</div>
          <h3 className="cs-submitted__title">신청이 접수되었습니다</h3>
          <p className="cs-submitted__desc">
            검토 후 영업일 기준 3~5일 내에 등록 처리됩니다.<br />
            문의 사항은 문의 내역 탭을 이용해 주세요.
          </p>
          <button className="cs-primary-btn" onClick={() => { setSubmitted(false); setFormData(INITIAL_FORM); setImageFiles([]); setPreviewUrls([]); }}>
            추가 신청하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-tab-content">
      <p className="cs-tab-desc">
        등록을 원하는 점포 정보를 입력해 주세요. 검토 후 영업일 기준 3~5일 내에 등록됩니다.
      </p>

      <form className="cs-form" onSubmit={handleSubmit} noValidate>

        {/* 점포명 + 카테고리 */}
        <div className="cs-form-row">
          <div className="cs-form-group">
            <label className="cs-label">점포명 <span className="cs-required">*</span></label>
            <input name="name" value={formData.name} onChange={handleChange}
              className={`cs-input ${errors.name ? 'cs-input--error' : ''}`}
              placeholder="점포명을 입력하세요" />
            {errors.name && <p className="cs-error">{errors.name}</p>}
          </div>

          <div className="cs-form-group">
            <label className="cs-label">카테고리 <span className="cs-required">*</span></label>
            <select name="category" value={formData.category} onChange={handleChange}
              className={`cs-select ${errors.category ? 'cs-input--error' : ''}`}>
              <option value="">카테고리 선택</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="cs-error">{errors.category}</p>}
          </div>
        </div>

        {/* 주소 검색 (카카오 지도) */}
        <div className="cs-form-group">
          <label className="cs-label">주소 <span className="cs-required">*</span></label>
          <KakaoAddressSearch
            value={formData.address}
            inputClassName={`cs-input${errors.address ? ' cs-input--error' : ''}`}
            onSelect={({ address, location, lat, lng }) => {
              setFormData(prev => ({ ...prev, address, location, lat, lng }));
              setErrors(prev => ({ ...prev, address: undefined, location: undefined }));
            }}
          />
          {errors.address && <p className="cs-error">{errors.address}</p>}
        </div>

        {/* 지역명 + 전화번호 */}
        <div className="cs-form-row">
          <div className="cs-form-group">
            <label className="cs-label">
              지역명 <span className="cs-required">*</span>
              <span className="cs-label-hint"> 주소 검색 시 자동 입력</span>
            </label>
            <input name="location" value={formData.location} onChange={handleChange}
              className={`cs-input ${errors.location ? 'cs-input--error' : ''}`}
              placeholder="예: 해운대구" />
            {errors.location && <p className="cs-error">{errors.location}</p>}
          </div>

          <div className="cs-form-group">
            <label className="cs-label">전화번호 <span className="cs-required">*</span></label>
            <input name="phone" value={formData.phone} onChange={handleChange}
              className={`cs-input ${errors.phone ? 'cs-input--error' : ''}`}
              placeholder="예: 051-123-4567" />
            {errors.phone && <p className="cs-error">{errors.phone}</p>}
          </div>
        </div>

        {/* 가격대 */}
        <div className="cs-form-group">
          <label className="cs-label">가격대</label>
          <div className="cs-price-group">
            {PRICE_RANGES.map(p => (
              <label key={p} className={`cs-price-opt ${formData.priceRange === p ? 'cs-price-opt--active' : ''}`}>
                <input type="radio" name="priceRange" value={p}
                  checked={formData.priceRange === p} onChange={handleChange}
                  className="cs-price-radio" />
                {p}
              </label>
            ))}
          </div>
        </div>

        {/* 소개글 */}
        <div className="cs-form-group">
          <label className="cs-label">소개글</label>
          <textarea name="description" value={formData.description} onChange={handleChange}
            className="cs-textarea" rows={4}
            placeholder="점포 소개글을 입력하세요 (선택)" />
        </div>

        {/* 해시태그 */}
        <div className="cs-form-group">
          <label className="cs-label">해시태그</label>
          <HashtagInput
            tags={formData.hashtags}
            onChange={tags => setFormData(prev => ({ ...prev, hashtags: tags }))}
          />
        </div>

        {/* 이미지 업로드 */}
        <div className="cs-form-group">
          <label className="cs-label">
            점포 이미지
            <span className="cs-label-hint"> 최대 {MAX_IMAGES}장 · JPG, PNG, WEBP · 각 10MB 이하</span>
          </label>

          {previewUrls.length > 0 ? (
            <div className="cs-img-grid">
              {previewUrls.map((url, i) => (
                <div key={url} className="cs-img-item">
                  <img src={url} alt={`미리보기 ${i + 1}`} className="cs-img-thumb" />
                  {i === 0 && <span className="cs-img-badge">대표</span>}
                  <button type="button" className="cs-img-remove" onClick={() => handleImageRemove(i)}>✕</button>
                </div>
              ))}
              {imageFiles.length < MAX_IMAGES && (
                <button type="button" className="cs-img-add" onClick={() => fileInputRef.current?.click()}>
                  <span>+</span><span>추가</span>
                </button>
              )}
            </div>
          ) : (
            <button type="button" className="cs-img-dropzone" onClick={() => fileInputRef.current?.click()}>
              <span className="cs-img-dropzone__icon">🖼</span>
              <span className="cs-img-dropzone__text">클릭하여 이미지 선택</span>
              <span className="cs-img-dropzone__hint">첫 번째 이미지가 대표 이미지로 설정됩니다</span>
            </button>
          )}

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            multiple onChange={handleImageSelect} className="cs-file-hidden" />
          {imgError && <p className="cs-error">{imgError}</p>}
        </div>

        <div className="cs-form-actions">
          <button type="submit" className="cs-primary-btn cs-primary-btn--full" disabled={isSubmitting}>
            {isSubmitting ? '신청 중...' : '점포 등록 신청'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────
// 탭 3 — FAQs
// ──────────────────────────────────────────
const FAQ_ITEMS = [
  { q: '맛지도는 어떤 서비스인가요?',
    a: '맛지도는 전국 맛집 정보와 솔직한 리뷰를 모아볼 수 있는 맛집 탐색 서비스입니다. 음식 카테고리별 필터, 별점, 해시태그 검색으로 원하는 맛집을 쉽게 찾을 수 있습니다.' },
  { q: '리뷰는 어떻게 작성하나요?',
    a: '로그인 후 상단 "+ 리뷰 쓰기" 버튼을 클릭하거나, 점포 상세 페이지에서 리뷰 작성이 가능합니다. 별점(1~5점)과 텍스트, 사진(1장)을 함께 남길 수 있습니다.' },
  { q: '점포 등록 신청 후 얼마나 걸리나요?',
    a: '신청 접수 후 영업일 기준 3~5일 이내에 검토가 완료됩니다. 검토 결과는 고객문의를 통해 확인하실 수 있습니다.' },
  { q: '잘못된 점포 정보는 어떻게 수정하나요?',
    a: '문의 내역 탭에서 "점포 정보 수정 요청" 문의를 작성해 주세요. 점포명, 주소, 전화번호 등 수정이 필요한 내용을 함께 기재해 주시면 빠르게 처리해 드립니다.' },
  { q: '리뷰를 삭제하고 싶어요.',
    a: '현재 고객이 직접 리뷰를 삭제하는 기능은 지원하지 않습니다. 삭제가 필요한 경우 고객 문의를 통해 요청해 주시면 검토 후 처리해 드립니다.' },
  { q: '회원 탈퇴는 어떻게 하나요?',
    a: '현재 앱 내 회원 탈퇴 기능은 준비 중입니다. 탈퇴를 원하시면 고객 문의(유형: 회원/계정 문의)로 요청해 주세요.' },
];

function FaqsTab(): JSX.Element {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="cs-tab-content">
      <p className="cs-tab-desc">자주 묻는 질문을 모아두었습니다.</p>
      <ul className="cs-faq-list">
        {FAQ_ITEMS.map((item, i) => (
          <li key={i} className={`cs-faq-item ${openIdx === i ? 'cs-faq-item--open' : ''}`}>
            <button className="cs-faq-q" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span>Q. {item.q}</span>
              <span className="cs-faq-arrow">{openIdx === i ? '▲' : '▼'}</span>
            </button>
            {openIdx === i && <div className="cs-faq-a">A. {item.a}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ──────────────────────────────────────────
// 메인 페이지
// ──────────────────────────────────────────
function CustomerServicePage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  const activeTab = (searchParams.get('tab') as TabKey) ?? 'inquiries';

  useEffect(() => {
    const raw = sessionStorage.getItem('userSession');
    if (!raw) {
      alert('로그인이 필요합니다.');
      navigate('/');
      return;
    }
    setUserId(JSON.parse(raw).userId);
  }, [navigate]);

  const handleTabChange = (key: TabKey): void => {
    setSearchParams({ tab: key });
  };

  if (!userId) return <></>;

  return (
    <div className="cs-page">
      <div className="container">

        {/* 페이지 헤더 */}
        <div className="cs-header">
          <h1 className="cs-title">고객센터</h1>
          <p className="cs-subtitle">궁금한 점이 있으신가요? 무엇이든 도와드리겠습니다.</p>
        </div>

        {/* 탭 */}
        <div className="cs-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`cs-tab ${activeTab === tab.key ? 'cs-tab--active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 내용 */}
        {activeTab === 'inquiries' && <InquiriesTab userId={userId} />}
        {activeTab === 'register'  && <RegisterTab />}
        {activeTab === 'faqs'      && <FaqsTab />}

      </div>
    </div>
  );
}

export default CustomerServicePage;
