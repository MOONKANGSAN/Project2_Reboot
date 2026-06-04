import { useState, KeyboardEvent } from 'react';
import './HashtagInput.css';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

const MAX_TAG_LENGTH = 30;

function HashtagInput({ tags, onChange, maxTags = 10 }: Props): JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const addTag = (): void => {
    // # 접두사 자동 제거 후 정규화
    const trimmed = inputValue.trim().replace(/^#/, '');
    if (!trimmed) return;

    if (trimmed.length > MAX_TAG_LENGTH) {
      setError(`태그는 ${MAX_TAG_LENGTH}자 이하여야 합니다.`);
      return;
    }
    if (tags.includes(trimmed)) {
      setError('이미 추가된 태그입니다.');
      return;
    }
    if (tags.length >= maxTags) {
      setError(`태그는 최대 ${maxTags}개까지 추가할 수 있습니다.`);
      return;
    }

    onChange([...tags, trimmed]);
    setInputValue('');
    setError('');
  };

  const removeTag = (index: number): void => {
    onChange(tags.filter((_, i) => i !== index));
    setError('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 폼 제출 방지
      addTag();
    }
  };

  return (
    <div>
      {/* 등록된 태그 칩 */}
      {tags.length > 0 && (
        <div className="bo-tag-chip-list">
          {tags.map((tag, i) => (
            <span key={i} className="bo-tag-chip">
              {tag}
              <button
                type="button"
                className="bo-tag-chip-remove"
                onClick={() => removeTag(i)}
                title="태그 제거"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 입력 영역 */}
      <div className="bo-tag-input-row">
        <input
          type="text"
          className="bo-tag-input"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="태그명 입력 후 Enter 또는 + 버튼 (예: 가성비, 혼밥)"
          maxLength={MAX_TAG_LENGTH + 1}
          disabled={tags.length >= maxTags}
        />
        <button
          type="button"
          className="bo-tag-add-btn"
          onClick={addTag}
          disabled={!inputValue.trim() || tags.length >= maxTags}
        >
          + 추가
        </button>
      </div>

      {/* 태그 수 안내 */}
      <p className="bo-tag-count-hint">
        {tags.length}/{maxTags}개 등록됨 · 동일한 태그는 DB에 1건만 저장됩니다
      </p>

      {/* 에러 메시지 */}
      {error && <p className="bo-error-message">{error}</p>}
    </div>
  );
}

export default HashtagInput;
