import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./ui/card"; // 경로 수정
import { Button } from "./ui/button"; // 경로 수정
import { Skeleton } from "./ui/skeleton"; // 경로 수정

interface Feedback {
  npc_name: string;
  message: string;
}

const ResultScene: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const missionId = (location.state as { missionId?: number })?.missionId;
  // CommentScene에서 전달된 'success' 상태를 읽어옵니다. 명시적으로 true가 아니면 실패로 간주합니다.
  const isSuccess = (location.state as { success?: boolean })?.success === true;

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingEnding, setIsCheckingEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // isLastMission을 컴포넌트 레벨에서 정의
  const isLastMission = missionId === 3; // 예시: missionId가 3이면 마지막 미션이라고 가정

  useEffect(() => {
    const fetchFeedback = async () => {
      // 성공했을 때만 피드백을 가져옵니다.
      if (!isSuccess) {
        setIsLoading(false);
        return; // 실패 시 피드백 로드 안 함
      }

      setIsLoading(true);
      setError(null);
      try {
        // TODO: 클라이언트 측에서 LLM API 직접 호출 로직 구현 (미션 결과 데이터 포함)
        console.log('ResultScene: Fetching feedback (placeholder)...');
        // 임시 목업 데이터 설정 (성공 시나리오)
        await new Promise(resolve => setTimeout(resolve, 1500)); // 가짜 로딩 시간 증가
        const mockFeedback: Feedback = {
          npc_name: "X (클라이언트)", // NPC 이름 명확히
          message: "훌륭하군. 키워드를 제대로 활용한 데다가 광고모델은 오히려 피해자라는 여론을 불러일으켰군. …너는 여론조작의 천재야." // 예시 메시지 사용
        };
        setFeedback(mockFeedback);

      } catch (err: any) {
        console.error('Error fetching feedback (placeholder):', err);
        setError(`피드백을 불러오는 중 오류 발생 (임시): ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (missionId !== undefined) {
      fetchFeedback();
    } else {
      setIsLoading(false);
      setError('미션 ID를 찾을 수 없습니다.');
      console.error('Mission ID not found in location state');
    }
  }, [missionId, isSuccess]); // isSuccess도 의존성 배열에 추가

  const handleProceed = async () => {
    // 컴포넌트 레벨의 isLastMission 사용
    if (isLastMission) {
      setIsCheckingEnding(true);
      setError(null);
      try {
        console.log('Checking final ending (placeholder)...');
        // TODO: 클라이언트 측 엔딩 확인 로직 구현 (게임 상태 기반)
        await new Promise(resolve => setTimeout(resolve, 500));
        // 성공/실패 및 게임 진행 상황에 따라 엔딩 타입 결정
        const mockEndingType = isSuccess ? "good" : "bad"; // 성공/실패에 따른 임시 엔딩 타입

        console.log('Ending type determined (placeholder):', mockEndingType);
        navigate('/ending', { state: { endingType: mockEndingType } });

      } catch (err: any) {
        console.error('Error checking ending (placeholder):', err);
        setError(`최종 엔딩 확인 중 오류 발생 (임시): ${err.message}`);
        setIsCheckingEnding(false);
      }
    } else {
      // 마지막 미션이 아니면 다음 에피소드로 이동
      console.log('Proceeding to next episode...');
      // TODO: 실제 다음 에피소드 ID 전달 로직 구현
      const nextMissionId = (missionId ?? 0) + 1;
      // 다음 미션으로 이동 시 isSuccess 상태는 초기화되거나 CommentScene에서 다시 결정됨
      navigate('/game', { state: { missionId: nextMissionId } }); // 다음 미션 ID 전달 (예시)
    }
  };

  const renderContent = () => {
    if (error) {
      return <p className="text-red-500 p-4 text-center">{error}</p>; // 에러 메시지 스타일링 추가
    }

    if (isSuccess) {
      return (
        <>
          <CardHeader className="text-center"> {/* text-center 추가 */}
            <CardTitle className="text-2xl font-bold text-green-400">
              🎉 미션 성공 🎉
            </CardTitle>
            <CardDescription className="text-lg pt-2"> {/* text-center 제거 (CardHeader에서 처리) */}
              축하합니다! 당신은 여론 조작에 성공했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2 pt-4 pb-4"> {/* 로딩 스켈레톤 패딩 추가 */}
                <Skeleton className="h-4 w-1/4 mx-auto" /> {/* 중앙 정렬 */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" /> {/* 중앙 정렬 */}
              </div>
             ) : feedback ? (
               <div className="text-center"> {/* 피드백 텍스트 중앙 정렬 */}
                 <h3 className="font-semibold text-lg mb-1 text-gray-200">{feedback.npc_name}의 메시지:</h3> {/* 텍스트 색상 변경 */}
                 <p className="text-base italic text-gray-300">"{feedback.message}"</p> {/* 텍스트 색상 변경 */}
               </div>
             ) : (
               <p className="text-center">피드백을 기다리는 중...</p> // 피드백 로딩 전 상태
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {/* 로딩 중이 아닐 때만 버튼 표시 */}
            {!isLoading && (
                 <Button onClick={handleProceed} disabled={isCheckingEnding || isLoading}>
                 {isCheckingEnding ? '엔딩 확인 중...' : (isLastMission ? '최종 결과 보기' : '다음 에피소드로')}
               </Button>
            )}
          </CardFooter>
        </>
      );
    } else {
      // 미션 실패 시나리오
      return (
        <>
          <CardHeader className="text-center"> {/* text-center 추가 */}
            <CardTitle className="text-2xl font-bold text-red-500">
              미션 실패
            </CardTitle>
            <CardDescription className="text-lg pt-2"> {/* text-center 제거 */}
              여론 조작에 실패했습니다. 다음 기회를 노려보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 실패 시 피드백은 없거나 다른 내용 표시 가능 */}
            <p className="text-center">결과가 좋지 않습니다...</p>
          </CardContent>
          <CardFooter className="flex justify-center">
             <Button onClick={handleProceed} disabled={isCheckingEnding}>
               {isCheckingEnding ? '엔딩 확인 중...' : (isLastMission ? '최종 결과 보기' : '다음 에피소드로')}
             </Button>
          </CardFooter>
        </>
      );
    }
  };

  return (
    // 전체 화면을 검은색 배경으로 채우고 내용을 중앙 정렬
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      {/* 카드 너비 조정 및 그림자 효과 개선 */}
      <Card className="w-full max-w-lg bg-gray-900 border-gray-700 shadow-xl shadow-blue-500/20 rounded-lg">
        {renderContent()}
      </Card>
    </div>
  );
};

export default ResultScene;
