import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// 로컬 script.json 파일의 엔딩 데이터 구조 정의 (예시)
// 실제 script.json 구조에 맞게 조정 필요
interface EndingData {
  type: string; // 엔딩 타입 (e.g., "normal", "hidden")
  title?: string; // 엔딩 제목 (선택적)
  message: string; // 엔딩 메시지
  image_url?: string; // 엔딩 이미지 URL (선택적)
}

// script.json 파일 내 엔딩 데이터 구조 정의 (예시)
interface ScriptEndingsData {
  [endingType: string]: EndingData;
}

// script.json 파일 전체 구조에 endings 포함 가정
interface ScriptData {
  // episodes: { ... }; // 기존 에피소드 데이터
  endings: ScriptEndingsData; // 엔딩 데이터 추가
}

const EndingScene: React.FC = () => { // Props 제거
  const location = useLocation(); // useLocation 훅 사용
  const navigate = useNavigate(); // useNavigate 훅 사용
  // state에서 endingType 가져오기 (타입 단언 및 기본값 설정)
  const endingType = (location.state as { endingType?: string })?.endingType;

  const [ending, setEnding] = useState<EndingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // endingType이 유효할 때만 데이터 로드 시도
    if (!endingType) {
      setIsLoading(false);
      setError('엔딩 타입을 찾을 수 없습니다.');
      console.error('Ending type not found in location state');
      return;
    }

    const loadEndingData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // public/script.json 파일 fetch
        const response = await fetch('/script.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch script.json: ${response.statusText}`);
        }
        // script.json 전체 데이터 로드 (endings 포함 가정)
        const scriptData: ScriptData = await response.json();

        // script.json에서 해당 endingType의 데이터 찾기 (endingType이 string임을 보장)
        const data = scriptData.endings?.[endingType];

        if (data) {
          setEnding(data);
          console.log('EndingScene: Ending loaded successfully from script.json:', data);
        } else {
          throw new Error(`'${endingType}' 타입의 엔딩을 script.json에서 찾을 수 없습니다.`);
        }
      } catch (err: any) {
        console.error('Error loading ending from script.json:', err);
        setError(`엔딩 정보를 불러오는 중 오류 발생: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadEndingData(); // 함수 이름 수정: fetchEnding -> loadEndingData

  }, [endingType]); // endingType이 변경될 때마다 엔딩 다시 로드

  // 타이틀 화면으로 돌아가는 함수
  const handleGoToTitle = () => {
    navigate('/title'); // 타이틀 화면 경로로 이동
  };

  return (
    <div className="ending-scene">
      {isLoading && <p>엔딩을 불러오는 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {ending && !isLoading && !error && (
        <div>
          {ending.title && <h1>{ending.title}</h1>}
          {ending.image_url && <img src={ending.image_url} alt={ending.title || 'Ending Image'} />}
          <p>{ending.message}</p>
          <button onClick={handleGoToTitle}>타이틀로 돌아가기</button> {/* 버튼 추가 */}
        </div>
      )}
    </div>
  );
};

export default EndingScene;
