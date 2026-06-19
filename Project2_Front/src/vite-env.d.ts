/// <reference types="vite/client" />

// Daum 우편번호 API 데이터 타입 선언
interface DaumPostcodeData {
  roadAddress:  string;
  jibunAddress: string;
  sido:         string;
  sigungu:      string;
  zonecode:     string;
}

// window 전역 객체에 kakao, daum 네임스페이스 선언
interface Window {
  kakao: any;
  daum: {
    Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => {
      open: () => void;
    };
  };
}
