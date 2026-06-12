// 카카오 지도 + Daum 우편번호 기반 주소 검색 컴포넌트
// 주소 입력칸 클릭 → Daum Postcode 팝업 → 선택 시 주소·지역명 콜백 + 미니 지도 마커
import { useEffect, useState } from 'react';
import './KakaoAddressSearch.css';

export interface AddressResult {
  address:  string;       // 도로명 주소
  location: string;       // 시/군/구 (예: "해운대구")
  lat:      number | null; // 위도 (Kakao Maps Geocoder 결과)
  lng:      number | null; // 경도
}

interface Props {
  value:           string;
  onSelect:        (result: AddressResult) => void;
  inputClassName?: string; // 백오피스: "bo-form-input", 고객: "cs-input" 등
  hasError?:       boolean;
}

// 스크립트 태그가 없을 때만 DOM에 삽입 — 콜백 없음, 로드 상태 추적 없음
function injectScriptOnce(src: string): void {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement('script');
  s.src   = src;
  s.async = true;
  document.head.appendChild(s);
}

function extractLocation(data: DaumPostcodeData): string {
  return data.sigungu || data.sido || '';
}

function KakaoAddressSearch({ value, onSelect, inputClassName, hasError }: Props): JSX.Element {
  const [selected, setSelected] = useState(false); // 주소 선택 완료 여부

  const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY as string;

  // 스크립트 삽입만 — 로드 완료를 기다리지 않음
  useEffect(() => {
    injectScriptOnce('//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js');
    injectScriptOnce(
      `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPostcode = (): void => {
    if (!window.daum?.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        const address  = data.roadAddress || data.jibunAddress;
        const location = extractLocation(data);

        // Kakao Maps SDK가 준비된 경우 좌표 추출 후 콜백, 아니면 null로 즉시 반환
        const geocodeAndSelect = (): void => {
          new window.kakao.maps.services.Geocoder().addressSearch(
            address,
            (result: any[], status: string) => {
              const ok = status === window.kakao.maps.services.Status.OK;
              onSelect({
                address,
                location,
                lat: ok ? Number(result[0].y) : null,
                lng: ok ? Number(result[0].x) : null,
              });
              setSelected(true);
            }
          );
        };

        if (window.kakao?.maps) {
          if (window.kakao.maps.services) {
            geocodeAndSelect();
          } else {
            window.kakao.maps.load(geocodeAndSelect);
          }
        } else {
          onSelect({ address, location, lat: null, lng: null });
          setSelected(true);
        }
      },
    }).open();
  };

  const resolvedInputClass = inputClassName
    ? inputClassName
    : `kas-input${hasError ? ' kas-input--error' : ''}`;

  return (
    <div className="kas-wrap">
      <input
        type="text"
        className={`kas-clickable ${resolvedInputClass}`}
        value={value}
        readOnly
        onClick={openPostcode}
        placeholder="클릭하여 주소를 검색하세요"
      />
      {selected && value && (
        <p className="kas-selected-hint">📍 {value}</p>
      )}
    </div>
  );
}

export default KakaoAddressSearch;
