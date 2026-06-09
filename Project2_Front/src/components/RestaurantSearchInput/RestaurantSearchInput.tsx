import { useState, useEffect, useRef, ChangeEvent } from 'react';
import axios from 'axios';
import './RestaurantSearchInput.css';

const BACKEND = 'http://localhost:8080';
const DEBOUNCE_MS = 300;

export interface RestaurantSearchItem {
  idx: number;
  name: string;
  category: string;
  location: string;
}

interface Props {
  selected: RestaurantSearchItem | null;
  onSelect: (item: RestaurantSearchItem | null) => void;
  hasError?: boolean;
  // 초기 점포 idx 주입 (점포 뷰에서 진입 시 자동 선택)
  presetIdx?: number | null;
}

function RestaurantSearchInput({ selected, onSelect, hasError, presetIdx }: Props): JSX.Element {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<RestaurantSearchItem[]>([]);
  const [isOpen, setIsOpen]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1); // 키보드 탐색용

  const wrapRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // presetIdx: 진입 시 점포 자동 조회 후 선택
  useEffect(() => {
    if (!presetIdx || selected) return;
    axios
      .get(`${BACKEND}/api/restaurants/search?keyword=`)
      .then(() => {
        // idx로 직접 상세 조회
        axios.get(`${BACKEND}/api/restaurants/${presetIdx}`)
          .then(res => {
            if (res.data.success) {
              const d = res.data.data;
              onSelect({ idx: d.idx, name: d.name, category: d.category, location: d.location });
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, [presetIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // 쿼리 변경 → 디바운스 후 API 호출
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await axios.get<{ success: boolean; data: RestaurantSearchItem[] }>(
          `${BACKEND}/api/restaurants/search`,
          { params: { keyword: query.trim() } }
        );
        if (res.data.success) {
          setResults(res.data.data);
          setIsOpen(true);
          setActiveIdx(-1);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const handleSelect = (item: RestaurantSearchItem): void => {
    onSelect(item);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = (): void => {
    onSelect(null);
    setQuery('');
    setResults([]);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  // 키보드: 위아래 탐색 + Enter 선택 + Esc 닫기
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // 선택된 상태
  if (selected) {
    return (
      <div className={`rsi-selected ${hasError ? 'rsi-selected--error' : ''}`}>
        <div className="rsi-selected__info">
          <span className="rsi-selected__name">{selected.name}</span>
          <div className="rsi-selected__meta">
            <span className="rsi-selected__category">{selected.category}</span>
            <span className="rsi-selected__dot">·</span>
            <span className="rsi-selected__location">📍 {selected.location}</span>
          </div>
        </div>
        <button type="button" className="rsi-selected__clear" onClick={handleClear} aria-label="선택 해제">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="rsi-wrap" ref={wrapRef}>
      {/* 검색 입력창 */}
      <div className={`rsi-input-wrap ${hasError ? 'rsi-input-wrap--error' : ''} ${isOpen ? 'rsi-input-wrap--open' : ''}`}>
        <svg className="rsi-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          className="rsi-input"
          type="text"
          placeholder="점포명 또는 지역명으로 검색"
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          autoComplete="off"
        />
        {isLoading && <div className="rsi-spinner" />}
        {query && !isLoading && (
          <button type="button" className="rsi-clear-btn" onClick={() => setQuery('')} aria-label="지우기">✕</button>
        )}
      </div>

      {/* 드롭다운 */}
      {isOpen && (
        <ul className="rsi-dropdown" role="listbox">
          {results.length === 0 ? (
            <li className="rsi-dropdown__empty">검색 결과가 없습니다</li>
          ) : (
            results.map((item, i) => (
              <li
                key={item.idx}
                className={`rsi-dropdown__item ${i === activeIdx ? 'rsi-dropdown__item--active' : ''}`}
                role="option"
                aria-selected={i === activeIdx}
                onMouseDown={() => handleSelect(item)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                <span className="rsi-dropdown__name">{highlightMatch(item.name, query)}</span>
                <div className="rsi-dropdown__meta">
                  <span className="rsi-dropdown__category">{item.category}</span>
                  <span className="rsi-dropdown__dot">·</span>
                  <span className="rsi-dropdown__location">📍 {item.location}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// 검색어 강조 표시
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="rsi-highlight">{part}</mark>
      : part
  );
}

export default RestaurantSearchInput;
