// 점포 위치를 카카오 지도로 보여주는 팝업 모달
// lat/lng가 있으면 바로 표시, 없으면 address로 Geocoding
import { useEffect, useRef } from 'react';
import './KakaoMapModal.css';

interface Props {
  open:    boolean;
  onClose: () => void;
  name:    string;
  address: string;
  lat?:    number | null;
  lng?:    number | null;
}

const API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY as string;

function injectScriptOnce(src: string): void {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement('script');
  s.src   = src;
  s.async = true;
  document.head.appendChild(s);
}

function KakaoMapModal({ open, onClose, name, address, lat, lng }: Props): JSX.Element | null {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    injectScriptOnce(
      `//dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&autoload=false&libraries=services`
    );

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const draw = (coords: any): void => {
      if (cancelled || !mapRef.current) return;

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: coords,
        level:  4,
      });

      new window.kakao.maps.Marker({ map, position: coords });

      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:6px 12px;font-size:13px;font-weight:700;white-space:nowrap">${name}</div>`,
      });
      infowindow.open(map, new window.kakao.maps.Marker({ map, position: coords }));
    };

    const initMap = (): void => {
      if (lat != null && lng != null) {
        draw(new window.kakao.maps.LatLng(lat, lng));
      } else {
        new window.kakao.maps.services.Geocoder().addressSearch(
          address,
          (result: any[], status: string) => {
            if (!cancelled && status === window.kakao.maps.services.Status.OK) {
              draw(new window.kakao.maps.LatLng(Number(result[0].y), Number(result[0].x)));
            }
          }
        );
      }
    };

    const tryInit = (): void => {
      if (cancelled) return;
      // kakao 네임스페이스 자체가 없으면 스크립트 로딩 대기
      if (!window.kakao) {
        timeoutId = setTimeout(tryInit, 200);
        return;
      }
      // autoload=false: kakao.maps 네임스페이스는 있지만 Map 클래스가 없으면 load() 호출
      if (window.kakao.maps?.Map) {
        initMap();
      } else {
        window.kakao.maps.load(initMap);
      }
    };

    // DOM 렌더링 후 초기화
    timeoutId = setTimeout(tryInit, 80);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [open, lat, lng, address, name]);

  if (!open) return null;

  return (
    <div className="kmm-overlay" onClick={onClose}>
      <div className="kmm-modal" onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="kmm-header">
          <div className="kmm-header__info">
            <h3 className="kmm-header__name">{name}</h3>
            <p className="kmm-header__address">📍 {address}</p>
          </div>
          <button className="kmm-close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        {/* 지도 */}
        <div ref={mapRef} className="kmm-map" />

      </div>
    </div>
  );
}

export default KakaoMapModal;
