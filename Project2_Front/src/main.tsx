import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";

// React 18 createRoot API로 앱을 #root DOM에 마운트
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* BrowserRouter: 클라이언트 사이드 라우팅 제공 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
