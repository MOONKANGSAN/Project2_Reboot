// Kakao Maps SDK / Daum Postcode 전역 타입 선언
// window.kakao, window.daum 사용 시 TypeScript 에러 방지

interface DaumPostcodeData {
  address:      string; // 도로명 주소
  jibunAddress: string; // 지번 주소
  roadAddress:  string; // 도로명 주소 (address와 동일)
  sido:         string; // 시/도 (예: "부산광역시")
  sigungu:      string; // 시/군/구 (예: "해운대구")
  bname:        string; // 법정동 (예: "좌동")
  zonecode:     string; // 우편번호
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void;
  width?:  number | string;
  height?: number | string;
}

interface DaumPostcodeConstructor {
  new (options: DaumPostcodeOptions): { open: () => void };
}

declare global {
  interface Window {
    kakao: any;
    daum: {
      Postcode: DaumPostcodeConstructor;
    };
  }
}

export {};
