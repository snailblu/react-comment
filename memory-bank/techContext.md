# 기술 컨텍스트 (Tech Context)

_이 문서는 사용된 기술, 개발 설정, 기술적 제약 조건, 종속성 및 도구 사용 패턴을 설명합니다._

## 기술 스택

- **프로그래밍 언어:** TypeScript
- **프레임워크/라이브러리 (프론트엔드):** React, React Router, Howler.js (오디오)
- **UI 라이브러리/프레임워크:** Tailwind CSS, Radix UI (shadcn/ui 기반으로 추정), CSS Modules, Lucide Icons
- **상태 관리:** React Context API, Custom Hooks
- **백엔드/API:** Vercel Serverless Functions (Node.js), Google Gemini API
- **데이터베이스:** 해당 없음 (데이터는 `public/` 내 JSON 파일로 관리되는 것으로 보임)
- **인프라/호스팅:** Vercel (Serverless Functions 및 프론트엔드 호스팅 가능성 높음)
- **기타 주요 도구:** uuid

## 개발 환경 설정

- **기반:** Create React App (CRA)
- **실행:** `npm start` (개발 서버), `npm run build` (프로덕션 빌드)
- **패키지 관리:** npm
- **코드 린팅 및 포맷팅 규칙:** ESLint (CRA 기본 설정), Prettier (설치되지 않았으나 CRA/Tailwind 환경에서 일반적으로 사용됨)
- **테스트 실행 방법:** `npm test` (Jest 및 React Testing Library 사용)

## 기술적 제약 조건

- 웹 브라우저 환경에서 실행
- Google Gemini API 사용량 및 응답 시간에 대한 의존성
- Vercel Serverless Functions 실행 환경 제약 (시간 제한 등)
- Create React App의 구성 제한 (eject하지 않는 이상)

## 주요 종속성

- **React Ecosystem:** `react`, `react-dom`, `react-router-dom`, `react-scripts`
- **UI & Styling:** `tailwindcss`, `@radix-ui/*`, `lucide-react`, `clsx`, `tailwind-merge`
- **AI:** `@google/generative-ai`
- **Audio:** `howler`
- **Serverless:** `@vercel/node` (개발 의존성)
- **Utilities:** `uuid`
- 버전 관리는 `package.json` 및 `package-lock.json`을 통해 npm으로 관리됩니다.
- Gemini API 키 관리가 필요합니다 (`dotenv` 사용).

## 도구 사용 패턴

- **버전 관리:** Git (`.gitignore` 파일 존재)
- **프로젝트 관리:** 명시되지 않음
- **CI/CD:** 명시되지 않음 (Vercel 사용 시 자동 배포 가능성 있음)
- **모니터링/로깅:** 명시되지 않음
- **개발 워크플로우:** CRA 스크립트 (`start`, `build`, `test`) 기반
