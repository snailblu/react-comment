import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { HashRouter } from "react-router-dom";
import { Container } from "react-dom/client"; // Import Container type
import "./i18n"; // Import i18n configuration

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element"); // 루트 요소 확인 추가

const root = ReactDOM.createRoot(rootElement as Container); // 타입 단언(as Container) 또는 non-null assertion(!) 사용
root.render(
  <React.StrictMode>
    <React.Suspense fallback="loading...">
      {" "}
      {/* Add Suspense for translation loading */}
      <HashRouter>
        <App />
      </HashRouter>
    </React.Suspense>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log); // console.log 전달
