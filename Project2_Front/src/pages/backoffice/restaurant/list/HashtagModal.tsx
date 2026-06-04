import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import type { HashtagItem } from './hashtagTypes';
import { fetchHashtags, addHashtag, updateHashtag, removeHashtag } from './hashtagApi';
import './HashtagModal.css';

interface Props {
  restaurantIdx: number;
  restaurantName: string;
  onClose: () => void;
}

function HashtagModal({ restaurantIdx, restaurantName, onClose }: Props): JSX.Element {
  const [tags, setTags] = useState<HashtagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 수정 모드 상태
  const [editingRhIdx, setEditingRhIdx] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 삭제 처리 중인 idx 집합
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // 추가 입력
  const [addInput, setAddInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const addInputRef = useRef<HTMLInputElement>(null);

  // 마운트 시 해시태그 목록 조회
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetchHashtags(restaurantIdx);
        if (res.success) setTags(res.data);
      } catch {
        // 조회 실패 시 빈 목록 유지
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [restaurantIdx]);

  // 오버레이 클릭으로 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose();
  };

  // ── 수정 ──
  const startEdit = (tag: HashtagItem): void => {
    setEditingRhIdx(tag.restaurantHashtagIdx);
    setEditingValue(tag.name);
  };

  const cancelEdit = (): void => {
    setEditingRhIdx(null);
    setEditingValue('');
  };

  const handleSaveEdit = async (tag: HashtagItem): Promise<void> => {
    const trimmed = editingValue.trim();
    if (!trimmed || trimmed === tag.name) {
      cancelEdit();
      return;
    }
    setIsSaving(true);
    try {
      const res = await updateHashtag(tag.hashtagIdx, trimmed);
      if (res.success) {
        setTags((prev) =>
          prev.map((t) =>
            t.restaurantHashtagIdx === tag.restaurantHashtagIdx
              ? { ...t, name: trimmed }
              : t
          )
        );
        cancelEdit();
      } else {
        alert('수정 실패: ' + (res.message ?? '알 수 없는 오류'));
      }
    } catch {
      alert('서버에 연결할 수 없습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditKeyDown = (e: KeyboardEvent, tag: HashtagItem): void => {
    if (e.key === 'Enter') handleSaveEdit(tag);
    if (e.key === 'Escape') cancelEdit();
  };

  // ── 삭제 ──
  const handleDelete = async (tag: HashtagItem): Promise<void> => {
    if (!window.confirm(`#${tag.name} 태그를 삭제하시겠습니까?`)) return;
    setDeletingIds((prev) => new Set([...prev, tag.restaurantHashtagIdx]));
    try {
      const res = await removeHashtag(tag.restaurantHashtagIdx);
      if (res.success) {
        setTags((prev) =>
          prev.filter((t) => t.restaurantHashtagIdx !== tag.restaurantHashtagIdx)
        );
      } else {
        alert('삭제 실패: ' + (res.message ?? '알 수 없는 오류'));
      }
    } catch {
      alert('서버에 연결할 수 없습니다.');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(tag.restaurantHashtagIdx);
        return next;
      });
    }
  };

  // ── 추가 ──
  const handleAdd = async (): Promise<void> => {
    const trimmed = addInput.trim();
    if (!trimmed) {
      setAddError('태그 이름을 입력해주세요.');
      return;
    }
    setAddError('');
    setIsAdding(true);
    try {
      const res = await addHashtag(restaurantIdx, trimmed);
      if (res.success && res.data) {
        setTags((prev) => [...prev, res.data!]);
        setAddInput('');
        addInputRef.current?.focus();
      } else {
        setAddError(res.message ?? '등록에 실패했습니다.');
      }
    } catch {
      setAddError('서버에 연결할 수 없습니다.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="bo-modal-overlay" onClick={handleOverlayClick}>
      <div className="bo-modal" role="dialog" aria-modal="true">

        {/* 헤더 */}
        <div className="bo-modal__header">
          <div>
            <p className="bo-modal__title">해시태그 관리</p>
            <p className="bo-modal__subtitle">{restaurantName}</p>
          </div>
          <button className="bo-modal__close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        {/* 바디 */}
        <div className="bo-modal__body">

          {/* 등록된 태그 목록 */}
          <div>
            <p className="bo-modal__section-title">등록된 태그 ({tags.length})</p>

            {isLoading ? (
              <p className="bo-modal__loading">불러오는 중...</p>
            ) : tags.length === 0 ? (
              <p className="bo-modal__empty">등록된 해시태그가 없습니다.</p>
            ) : (
              <div className="bo-modal__tag-list">
                {tags.map((tag) => {
                  const isEditing = editingRhIdx === tag.restaurantHashtagIdx;
                  const isDeleting = deletingIds.has(tag.restaurantHashtagIdx);

                  return (
                    <div key={tag.restaurantHashtagIdx} className="bo-modal__tag-row">
                      {isEditing ? (
                        <>
                          <input
                            className="bo-modal__tag-edit-input"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, tag)}
                            autoFocus
                            disabled={isSaving}
                          />
                          <button
                            className="bo-modal__icon-btn bo-modal__icon-btn--save"
                            onClick={() => handleSaveEdit(tag)}
                            disabled={isSaving}
                          >
                            저장
                          </button>
                          <button
                            className="bo-modal__icon-btn bo-modal__icon-btn--cancel"
                            onClick={cancelEdit}
                            disabled={isSaving}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="bo-modal__tag-name">{tag.name}</span>
                          <button
                            className="bo-modal__icon-btn bo-modal__icon-btn--edit"
                            onClick={() => startEdit(tag)}
                            disabled={isDeleting || editingRhIdx !== null}
                            title="수정"
                          >
                            ✎
                          </button>
                          <button
                            className="bo-modal__icon-btn bo-modal__icon-btn--delete"
                            onClick={() => handleDelete(tag)}
                            disabled={isDeleting || editingRhIdx !== null}
                            title="삭제"
                          >
                            {isDeleting ? '…' : '✕'}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 태그 추가 */}
          <div>
            <p className="bo-modal__section-title">태그 추가</p>
            <div className="bo-modal__add-row">
              <input
                ref={addInputRef}
                className="bo-modal__add-input"
                value={addInput}
                onChange={(e) => { setAddInput(e.target.value); setAddError(''); }}
                onKeyDown={handleAddKeyDown}
                placeholder="태그명 입력 (예: 가성비, 혼밥)"
                disabled={isAdding}
                maxLength={30}
              />
              <button
                className="bo-modal__add-btn"
                onClick={handleAdd}
                disabled={isAdding || !addInput.trim()}
              >
                {isAdding ? '추가 중...' : '+ 추가'}
              </button>
            </div>
            {addError && <p className="bo-modal__error">{addError}</p>}
          </div>

        </div>
      </div>
    </div>
  );
}

export default HashtagModal;
