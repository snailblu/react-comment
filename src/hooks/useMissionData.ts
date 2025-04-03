import { useState, useEffect } from "react";
import { Mission, Comment, Opinion } from "../types"; // 필요한 타입 import

interface UseMissionDataResult {
  missionData: Mission | null;
  initialComments: Comment[];
  initialOpinion: Opinion;
  initialLikes: number;
  initialDislikes: number;
  initialMonologue: string;
  totalAttempts: number;
  isLoading: boolean;
  error: string | null;
}

const useMissionData = (
  missionId: string | undefined
): UseMissionDataResult => {
  const [missionData, setMissionData] = useState<Mission | null>(null);
  const [initialComments, setInitialComments] = useState<Comment[]>([]);
  const [initialOpinion, setInitialOpinion] = useState<Opinion>({
    positive: 50,
    negative: 50,
  }); // 기본값 설정
  const [initialLikes, setInitialLikes] = useState(0);
  const [initialDislikes, setInitialDislikes] = useState(0);
  const [initialMonologue, setInitialMonologue] =
    useState("댓글을 달아 여론을 조작하자..."); // 기본값 설정
  const [totalAttempts, setTotalAttempts] = useState(5); // 기본값 설정
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!missionId) {
      setError("미션 ID가 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchMissionData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 상대 경로 사용
        const response = await fetch("missions.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allMissions: Record<string, Mission> = await response.json();
        const currentMission = allMissions[missionId];

        if (!currentMission) {
          throw new Error(`미션 데이터를 찾을 수 없습니다: ${missionId}`);
        }

        console.log(
          `useMissionData: Initializing with data for mission ${missionId}`,
          currentMission
        );
        setMissionData(currentMission);

        // 초기 상태 설정
        setInitialOpinion(
          currentMission.initialOpinion ?? { positive: 60, negative: 40 }
        ); // neutral 제거 및 기본값 조정
        setTotalAttempts(currentMission.totalAttempts ?? 5);
        setInitialMonologue(
          currentMission.initialMonologue ?? "댓글을 달아 여론을 조작하자..."
        );
        setInitialLikes(currentMission.initialLikes ?? 0);
        setInitialDislikes(currentMission.initialDislikes ?? 0);

        // 초기 댓글 설정 (유효성 검사 및 타입 변환)
        const loadedComments: Comment[] = (currentMission.initialComments ?? [])
          .filter((c) => c.id && c.content && c.created_at) // 필수 필드 확인
          .map(
            (c): Comment => ({
              id: c.id!,
              nickname: c.nickname,
              ip: c.ip,
              isReply: c.isReply,
              parentId: c.parentId, // parentId 추가
              content: c.content!,
              likes: c.likes ?? 0,
              is_player: c.is_player ?? false,
              created_at: c.created_at!,
            })
          );
        setInitialComments(loadedComments);
      } catch (err) {
        console.error("미션 데이터 로딩 실패:", err);
        setError(
          err instanceof Error
            ? err.message
            : "미션 데이터를 불러오는 데 실패했습니다."
        );
        setMissionData(null); // 오류 발생 시 데이터 초기화
        setInitialComments([]);
        setInitialOpinion({ positive: 50, negative: 50 });
        setInitialLikes(0);
        setInitialDislikes(0);
        setInitialMonologue("오류: 미션 데이터를 불러올 수 없습니다.");
        setTotalAttempts(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissionData();
  }, [missionId]);

  return {
    missionData,
    initialComments,
    initialOpinion,
    initialLikes,
    initialDislikes,
    initialMonologue,
    totalAttempts,
    isLoading,
    error,
  };
};

export default useMissionData;
