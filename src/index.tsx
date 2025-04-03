import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// BrowserRouter 대신 HashRouter 임포트
import { HashRouter } from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext"; // Import SettingsProvider
import { Container } from "react-dom/client"; // Import Container type

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element"); // 루트 요소 확인 추가

const root = ReactDOM.createRoot(rootElement as Container); // 타입 단언(as Container) 또는 non-null assertion(!) 사용
root.render(
  <React.StrictMode>
    {/* BrowserRouter 대신 HashRouter 사용 */}
    <HashRouter>
      {/* Wrap App with SettingsProvider */}
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log); // console.log 전달
