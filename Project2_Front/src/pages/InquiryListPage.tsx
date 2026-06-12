import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyInquiries, INQUIRY_STATES, type InquiryListItem } from '@/api/inquiryApi';
import './InquiryListPage.css';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function InquiryListPage(): JSX.Element {
  const navigate = useNavigate();
  const [items,     setItems]     = useState<InquiryListItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('userSession');
    if (!raw) {
      alert('로그인이 필요합니다.');
      navigate('/');
      return;
    }
    const { userId } = JSON.parse(raw);

    fetchMyInquiries(userId)
      .then(res => {
        if (res.success) setItems(res.data);
        else setError('문의 내역을 불러오지 못했습니다.');
      })
      .catch(() => setError('서버에 연결할 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="iql-page">
      <div className="container">

        {/* 헤더 */}
        <div className="iql-header">
          <div>
            <h1 className="iql-title">내 문의 내역</h1>
            {!loading && !error && (
              <p className="iql-count">총 <strong>{items.length}</strong>건</p>
            )}
          </div>
          <button
            className="iql-write-btn"
            onClick={() => navigate('/inquiry/write')}
          >
            + 문의 작성
          </button>
        </div>

        {/* 목록 */}
        {loading ? (
          <div className="iql-status">
            <div className="iql-spinner" />
            <p>불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="iql-status iql-status--error">{error}</div>
        ) : items.length === 0 ? (
          <div className="iql-empty">
            <p className="iql-empty__msg">접수된 문의가 없습니다.</p>
            <button
              className="iql-empty__btn"
              onClick={() => navigate('/inquiry/write')}
            >
              첫 문의 작성하기
            </button>
          </div>
        ) : (
          <ul className="iql-list">
            {items.map(item => {
              const stateInfo = INQUIRY_STATES[item.state] ?? { label: '알 수 없음', color: '#9ca3af' };
              return (
                <li key={item.idx} className="iql-item">
                  <div className="iql-item__top">
                    <span className="iql-item__type">{item.inquiryTypeName}</span>
                    <span
                      className="iql-item__state"
                      style={{ color: stateInfo.color }}
                    >
                      {stateInfo.label}
                    </span>
                  </div>

                  <div className="iql-item__title-row">
                    {item.isPublic === 0 && (
                      <span className="iql-item__lock" title="비공개">🔒</span>
                    )}
                    <p className="iql-item__title">{item.title}</p>
                    {item.hasAnswer && (
                      <span className="iql-item__answered">답변완료</span>
                    )}
                  </div>

                  <p className="iql-item__date">{formatDate(item.regDate)}</p>
                </li>
              );
            })}
          </ul>
        )}

      </div>
    </div>
  );
}

export default InquiryListPage;
