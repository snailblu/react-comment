import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase'; // Supabase 클라이언트 import, 확장자 제거
import { useLocation, useNavigate } from 'react-router-dom'; // useLocation, useNavigate 추가

interface EndingData {
  id: number;
  type: string;
  title: string | null;
  message: string;
  image_url: string | null;
  created_at: string;
}

// EndingSceneProps 제거

const EndingScene: React.FC = () => { // Props 제거
  const location = useLocation(); // useLocation 훅 사용
  const navigate = useNavigate(); // useNavigate 훅 사용
  // state에서 endingType 가져오기 (타입 단언 및 기본값 설정)
  const endingType = (location.state as { endingType?: string })?.endingType;

  const [ending, setEnding] = useState<EndingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnding = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('endings')
          .select('*')
          .eq('type', endingType)
          .limit(1) // 해당 타입의 첫 번째 엔딩만 가져옴
          .single(); // 단일 결과 기대

        if (fetchError) {
          // 'PGRST116' 코드는 결과가 없을 때 발생
          if (fetchError.code === 'PGRST116') {
            throw new Error(`'${endingType}' 타입의 엔딩을 찾을 수 없습니다.`);
          }
          throw fetchError;
        }

        if (data) {
          setEnding(data as EndingData);
        } else {
          // single() 사용 시 data가 null이고 에러가 없으면 결과가 없는 것
           throw new Error(`'${endingType}' 타입의 엔딩을 찾을 수 없습니다.`);
        }
      } catch (err: any) {
        console.error('Error fetching ending:', err);
        setError(`엔딩 정보를 불러오는 중 오류 발생: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    // endingType이 유효할 때만 fetchEnding 호출
    if (endingType) {
      fetchEnding();
    } else {
      // endingType이 없으면 로딩 상태 해제 및 에러 설정
      setIsLoading(false);
      setError('엔딩 타입을 찾을 수 없습니다.');
      console.error('Ending type not found in location state');
    }
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
