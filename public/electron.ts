import { app, BrowserWindow } from "electron"; // Use import instead of require
import * as path from "path"; // Use import instead of require

function createWindow(): void {
  // Add return type void
  // 브라우저 창 생성
  const mainWindow = new BrowserWindow({
    width: 1280, // GameViewport 기준 너비
    height: 720, // GameViewport 기준 높이
    webPreferences: {
      nodeIntegration: true, // 필요한 경우 true로 설정 (보안 고려 필요)
      contextIsolation: false, // 필요한 경우 false로 설정 (보안 고려 필요)
      webSecurity: false, // 로컬 리소스 로드 허용 (보안 주의)
      // preload: path.join(__dirname, 'preload.js') // 필요시 preload 스크립트 지정
    },
  });

  // React 앱 로드
  // 개발 모드에서는 React 개발 서버 URL 로드
  // 프로덕션 모드에서는 빌드된 index.html 파일 로드
  const startUrl: string = !app.isPackaged // Add type annotation
    ? "http://localhost:3000"
    : // app.getAppPath()를 사용하여 경로 구성
      `file://${path.join(app.getAppPath(), "build", "index.html")}`;
  mainWindow.loadURL(startUrl);

  // 개발자 도구 열기 (항상)
  mainWindow.webContents.openDevTools();
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
