import React, { useState, useEffect, useRef } from "react"; // useRef import 추가
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card"; // 경로 수정
import { Button } from "./ui/button"; // 경로 수정
import { Skeleton } from "./ui/skeleton"; // 경로 수정
// Gemini SDK import 제거
import { Comment } from "../types"; // Comment 타입 import 추가

// 클라이언트 측 Gemini API 설정 제거

interface Feedback {
  npc_name: string;
  message: string;
}

const ResultScene: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // location.state 타입 정의 확장 (playerComments 대신 allComments 사용)
  interface LocationState {
    missionId?: number;
    success?: boolean;
    allComments?: Comment[]; // 전체 댓글 배열 추가
    missionTitle?: string; // 미션 제목 추가
  }
  const {
    missionId,
    success: isSuccess = false,
    allComments = [],
    missionTitle = "알 수 없는 미션",
  } = (location.state as LocationState) || {}; // missionTitle 추가 및 기본값 설정

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingEnding, setIsCheckingEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCalledRef = useRef(false); // API 호출 플래그 Ref 추가

  // isLastMission을 컴포넌트 레벨에서 정의
  const isLastMission = missionId === 3; // 예시: missionId가 3이면 마지막 미션이라고 가정

  useEffect(() => {
    const fetchFeedback = () => {
      // async 제거
      // 성공했을 때만 피드백을 가져옵니다.
      if (!isSuccess) {
        setIsLoading(false);
        return; // 실패 시 피드백 로드 안 함
      }

      setIsLoading(true);
      setError(null);
      // 클라이언트 측 API 키 확인 제거

      // TODO: 피드백 생성 로직을 서버리스 함수로 이전해야 합니다.
      // 임시로 로딩 상태만 해제하고 플레이스홀더 피드백 설정
      setTimeout(() => {
        // 비동기 처리를 모방하기 위해 setTimeout 사용
        if (isSuccess) {
          setFeedback({ npc_name: "X", message: "미션 성공! (임시 피드백)" });
        }
        setIsLoading(false);
      }, 500); // 0.5초 딜레이

      // Gemini API 호출 로직 (try...catch 블록) 완전 제거
    };

    // StrictMode에서 두 번 실행 방지 로직 추가
    if (missionId !== undefined) {
      if (!fetchCalledRef.current) {
        fetchCalledRef.current = true; // 호출 플래그 설정
        fetchFeedback();
      }
    } else {
      setIsLoading(false);
      setError("미션 ID를 찾을 수 없습니다.");
      console.error("Mission ID not found in location state");
    }
  }, [missionId, isSuccess, allComments, missionTitle]); // allComments, missionTitle 의존성 추가

  const handleProceed = async () => {
    // 컴포넌트 레벨의 isLastMission 사용
    if (isLastMission) {
      setIsCheckingEnding(true);
      setError(null);
      try {
        console.log("Checking final ending (placeholder)...");
        // TODO: 클라이언트 측 엔딩 확인 로직 구현 (게임 상태 기반)
        await new Promise((resolve) => setTimeout(resolve, 500));
        // 성공/실패 및 게임 진행 상황에 따라 엔딩 타입 결정
        const mockEndingType = isSuccess ? "good" : "bad"; // 성공/실패에 따른 임시 엔딩 타입

        console.log("Ending type determined (placeholder):", mockEndingType);
        navigate("/ending", { state: { endingType: mockEndingType } });
      } catch (err: any) {
        console.error("Error checking ending (placeholder):", err);
        setError(`최종 엔딩 확인 중 오류 발생 (임시): ${err.message}`);
        setIsCheckingEnding(false);
      }
    } else {
      // 마지막 미션이 아니면 다음 에피소드로 이동
      console.log("Proceeding to next episode...");
      // TODO: 실제 다음 에피소드 ID 전달 로직 구현
      const nextMissionId = (missionId ?? 0) + 1;
      // 다음 미션으로 이동 시 isSuccess 상태는 초기화되거나 CommentScene에서 다시 결정됨
      navigate("/game", { state: { missionId: nextMissionId } }); // 다음 미션 ID 전달 (예시)
    }
  };

  const renderContent = () => {
    if (error) {
      return <p className="text-red-500 p-4 text-center">{error}</p>; // 에러 메시지 스타일링 추가
    }

    if (isSuccess) {
      return (
        <>
          <CardHeader className="text-center">
            {" "}
            {/* text-center 추가 */}
            <CardTitle className="text-2xl font-bold text-green-400">
              🎉 미션 성공 🎉
            </CardTitle>
            <CardDescription className="text-lg pt-2">
              {" "}
              {/* text-center 제거 (CardHeader에서 처리) */}
              축하합니다! 당신은 여론 조작에 성공했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2 pt-4 pb-4">
                {" "}
                {/* 로딩 스켈레톤 패딩 추가 */}
                <Skeleton className="h-4 w-1/4 mx-auto" /> {/* 중앙 정렬 */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" /> {/* 중앙 정렬 */}
              </div>
            ) : feedback ? (
              <div className="text-center">
                {" "}
                {/* 피드백 텍스트 중앙 정렬 */}
                <h3 className="font-semibold text-lg mb-1 text-gray-200">
                  {feedback.npc_name}의 메시지:
                </h3>{" "}
                {/* 텍스트 색상 변경 */}
                <p className="text-base italic text-gray-300">
                  "{feedback.message}"
                </p>{" "}
                {/* 텍스트 색상 변경 */}
              </div>
            ) : (
              <p className="text-center">피드백을 기다리는 중...</p> // 피드백 로딩 전 상태
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {/* 로딩 중이 아닐 때만 버튼 표시 */}
            {!isLoading && (
              <Button
                onClick={handleProceed}
                disabled={isCheckingEnding || isLoading}
                // 픽셀 아트 스타일 적용 (TitleScreen 버튼 스타일 참고)
                className="px-8 py-3 bg-primary text-primary-foreground border border-border hover:bg-accent hover:text-accent-foreground active:translate-y-px transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                {isCheckingEnding
                  ? "엔딩 확인 중..."
                  : isLastMission
                  ? "최종 결과 보기"
                  : "다음 에피소드로"}
              </Button>
            )}
          </CardFooter>
        </>
      );
    } else {
      // 미션 실패 시나리오
      return (
        <>
          <CardHeader className="text-center">
            {" "}
            {/* text-center 추가 */}
            <CardTitle className="text-2xl font-bold text-red-500">
              미션 실패
            </CardTitle>
            <CardDescription className="text-lg pt-2">
              {" "}
              {/* text-center 제거 */}
              여론 조작에 실패했습니다. 다음 기회를 노려보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 실패 시 피드백은 없거나 다른 내용 표시 가능 */}
            <p className="text-center">결과가 좋지 않습니다...</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={handleProceed}
              disabled={isCheckingEnding}
              // 픽셀 아트 스타일 적용
              className="px-8 py-3 bg-primary text-primary-foreground border border-border hover:bg-accent hover:text-accent-foreground active:translate-y-px transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              {isCheckingEnding
                ? "엔딩 확인 중..."
                : isLastMission
                ? "최종 결과 보기"
                : "다음 에피소드로"}
            </Button>
          </CardFooter>
        </>
      );
    }
  };

  return (
    // GameViewport가 중앙 정렬을 담당하므로, 여기서는 배경색과 패딩만 유지
    <div className="bg-black text-white p-4 w-full h-full flex items-center justify-center">
      {" "}
      {/* flex, items-center, justify-center 추가하여 카드 자체를 중앙 정렬 */}
      {/* 카드 너비 조정 및 그림자 효과 개선 */}
      {/* w-full h-full 추가하여 ResultScene이 GameViewport의 전체 영역을 차지하도록 함 */}
      <Card className="w-full max-w-lg bg-gray-900 border-gray-700 shadow-xl shadow-blue-500/20 rounded-lg">
        {renderContent()}
      </Card>
    </div>
  );
};

export default ResultScene;
