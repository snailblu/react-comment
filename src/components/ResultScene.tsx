import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Comment } from "../types";
import { generateAiFeedback } from "../services/geminiService"; // 피드백 생성 함수 import
import { useMissionStore } from "../stores/missionStore"; // 미션 데이터 가져오기 위해 추가

interface Feedback {
  npc_name: string;
  message: string;
}

const ResultScene: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  interface LocationState {
    missionId?: number; // missionId 타입을 number로 가정 (필요시 수정)
    success?: boolean;
    allComments?: Comment[];
    missionTitle?: string;
  }
  const {
    missionId,
    success: isSuccess = false,
    allComments = [],
    missionTitle = "알 수 없는 미션",
  } = (location.state as LocationState) || {};

  // missionStore에서 현재 미션 데이터 가져오기 (articleContent 필요)
  const currentMission = useMissionStore((state) => state.currentMission);

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingEnding, setIsCheckingEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCalledRef = useRef(false);

  // isLastMission을 컴포넌트 레벨에서 정의
  const isLastMission = missionId === 3; // 예시: missionId가 3이면 마지막 미션이라고 가정

  useEffect(() => {
    const fetchFeedback = async () => {
      // async 추가
      // 성공했을 때만 피드백을 가져옵니다.
      if (!isSuccess) {
        setIsLoading(false);
        return; // 실패 시 피드백 로드 안 함
      }
      // 미션 데이터가 없으면 피드백 생성 불가
      if (!currentMission) {
        setIsLoading(false);
        setError("현재 미션 정보를 찾을 수 없어 피드백을 생성할 수 없습니다.");
        console.error(
          "Current mission data not found in store for feedback generation."
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // generateAiFeedback 함수 호출
        console.log("Fetching AI feedback with data:", {
          missionTitle,
          articleContent: currentMission.articleContent,
          allComments,
          isSuccess,
        });
        const feedbackResult = await generateAiFeedback(
          missionTitle, // missionTitle 사용
          currentMission.articleContent ?? "", // missionStore에서 가져온 articleContent 사용
          allComments,
          isSuccess
        );
        console.log("AI Feedback Result:", feedbackResult);

        if (feedbackResult.error) {
          setError(feedbackResult.message); // 서비스 함수에서 반환된 오류 메시지 사용
        } else {
          setFeedback(feedbackResult); // 성공 시 피드백 상태 업데이트
        }
      } catch (err: any) {
        console.error("Error fetching feedback:", err);
        setError(`피드백 생성 중 오류 발생: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    // StrictMode에서 두 번 실행 방지 및 missionId 확인
    if (missionId !== undefined) {
      if (!fetchCalledRef.current) {
        fetchCalledRef.current = true;
        fetchFeedback();
      }
    } else {
      setIsLoading(false);
      setError("미션 ID를 찾을 수 없습니다.");
      console.error("Mission ID not found in location state");
    }
    // currentMission 추가
  }, [missionId, isSuccess, allComments, missionTitle, currentMission]);

  const handleProceed = async () => {
    if (isLastMission) {
      setIsCheckingEnding(true);
      setError(null);
      try {
        console.log("Checking final ending (placeholder)...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockEndingType = isSuccess ? "good" : "bad";
        console.log("Ending type determined (placeholder):", mockEndingType);
        navigate("/ending", { state: { endingType: mockEndingType } });
      } catch (err: any) {
        console.error("Error checking ending (placeholder):", err);
        setError(`최종 엔딩 확인 중 오류 발생 (임시): ${err.message}`);
        setIsCheckingEnding(false);
      }
    } else {
      console.log("Proceeding to next episode...");
      const nextMissionId = (missionId ?? 0) + 1;
      // 다음 미션 ID 전달 시 number 타입 확인
      navigate("/game", { state: { missionId: Number(nextMissionId) } });
    }
  };

  const renderContent = () => {
    if (error) {
      return <p className="text-red-500 p-4 text-center">{error}</p>;
    }

    if (isSuccess) {
      return (
        <>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-400">
              🎉 미션 성공 🎉
            </CardTitle>
            <CardDescription className="text-lg pt-2">
              축하합니다! 당신은 여론 조작에 성공했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2 pt-4 pb-4">
                <Skeleton className="h-4 w-1/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ) : feedback ? (
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1 text-gray-200">
                  {feedback.npc_name}의 메시지:
                </h3>
                <p className="text-base italic text-gray-300">
                  "{feedback.message}"
                </p>
              </div>
            ) : (
              // 피드백 로딩 실패 또는 없는 경우
              <p className="text-center text-muted-foreground">
                피드백을 가져오지 못했습니다.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {!isLoading && (
              <Button
                onClick={handleProceed}
                disabled={isCheckingEnding || isLoading}
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
            <CardTitle className="text-2xl font-bold text-red-500">
              미션 실패
            </CardTitle>
            <CardDescription className="text-lg pt-2">
              여론 조작에 실패했습니다. 다음 기회를 노려보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center">결과가 좋지 않습니다...</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={handleProceed}
              disabled={isCheckingEnding}
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
    <div className="bg-black text-white p-4 w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-lg bg-gray-900 border-gray-700 shadow-xl shadow-blue-500/20 rounded-lg">
        {renderContent()}
      </Card>
    </div>
  );
};

export default ResultScene;
