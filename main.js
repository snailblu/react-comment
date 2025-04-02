const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev"); // 개발 모드 확인 유틸리티 설치 필요

function createWindow() {
  // 브라우저 창 생성
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // 필요한 경우 true로 설정 (보안 고려 필요)
      contextIsolation: false, // 필요한 경우 false로 설정 (보안 고려 필요)
      // preload: path.join(__dirname, 'preload.js') // 필요시 preload 스크립트 지정
    },
  });

  // React 앱 로드
  // 개발 모드에서는 React 개발 서버 URL 로드
  // 프로덕션 모드에서는 빌드된 index.html 파일 로드
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}` // CRA 빌드 출력 경로 기준
  );

  // 개발자 도구 열기 (개발 모드에서만)
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Electron 앱이 준비되면 창 생성
app.whenReady().then(() => {
  createWindow();

  // macOS에서 dock 아이콘 클릭 시 창 다시 생성
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 모든 창이 닫혔을 때 앱 종료 (macOS 제외)
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
