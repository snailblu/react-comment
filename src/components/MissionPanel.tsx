import React, { useState, useEffect } from "react";
import {
  Target,
  Tags,
  ListChecks,
  Repeat,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
} from "lucide-react"; // Import icons including ThumbsUp/Down
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge"; // Import Badge
import { Separator } from "./ui/separator"; // Import Separator
import { Mission } from "../types"; // Import Mission from types (MissionData -> Mission)

interface MissionPanelProps {
  missionId: string | null; // Allow null missionId
  attemptsLeft?: number; // 남은 시도 횟수 (옵셔널)
  totalAttempts?: number; // 총 시도 횟수 (옵셔널)
}

// MissionData interface moved to src/types/index.ts

// props를 함수 인자에서 직접 구조 분해
const MissionPanel: React.FC<MissionPanelProps> = ({
  missionId,
  attemptsLeft,
  totalAttempts,
}) => {
  const [mission, setMission] = useState<Mission | null>(null); // missionData -> mission, MissionData -> Mission
  const [isLoading, setIsLoading] = useState(true);

  // Props 구조 분해는 위에서 처리했으므로 이 라인 제거

  useEffect(() => {
    const fetchMissionData = async () => {
      setIsLoading(true);
      setMission(null); // Reset mission data on new missionId (missionData -> mission)

      if (!missionId) {
        console.error("MissionPanel: missionId is null.");
        setIsLoading(false);
        return;
      }

      try {
        // 상대 경로 사용
        const response = await fetch("missions.json"); // Fetch from the new file
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allMissions: { [key: string]: Mission } = await response.json(); // MissionData -> Mission

        if (allMissions[missionId]) {
          console.log(
            `MissionPanel: Loaded data for mission ${missionId} from missions.json`
          );
          setMission(allMissions[missionId]); // missionData -> mission
        } else {
          console.error(
            `MissionPanel: Mission data for ${missionId} not found in missions.json.`
          );
        }
      } catch (error) {
        console.error(
          "MissionPanel: Failed to fetch or parse missions.json:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissionData();
  }, [missionId]);

  // // goal 객체를 문자열로 표시하는 함수는 더 이상 사용하지 않음
  // const formatGoal = (goal: any): string => { ... };

  // 목표 키에 따른 아이콘과 텍스트 매핑
  const getGoalDisplay = (key: string) => {
    switch (key.toLowerCase()) {
      case "positive":
        return { icon: ThumbsUp, text: "긍정적 반응", color: "text-green-600" };
      case "negative":
        return { icon: ThumbsDown, text: "부정적 반응", color: "text-red-600" };
      // 다른 목표 유형 추가 가능
      default:
        return { icon: HelpCircle, text: key, color: "text-muted-foreground" };
    }
  };

  if (isLoading) {
    // Use Skeleton component for loading state
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!mission) {
    // missionData -> mission
    // Display error within a Card for consistency
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">오류</CardTitle>
        </CardHeader>
        <CardContent>
          <p>미션 정보를 불러오는데 실패했거나 해당 미션을 찾을 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  // const goalString = formatGoal(mission.goal); // 더 이상 사용하지 않음

  return (
    <Card className="w-full shadow-lg border border-border/40">
      {" "}
      {/* Enhanced shadow and border */}
      <CardHeader className="pb-3">
        {" "}
        {/* Reduced bottom padding */}
        <CardTitle className="text-xl font-semibold tracking-tight">
          {" "}
          {/* Larger title, adjusted weight/tracking */}
          {mission.title || "제목 없음"}{" "}
          {/* Use title directly (missionData -> mission) */}
        </CardTitle>
      </CardHeader>
      <Separator /> {/* Separator without margin */}
      <CardContent className="pt-4 space-y-4 text-sm">
        {" "}
        {/* Adjusted padding and spacing */}
        {/* 목표 */}
        <div>
          <strong className="font-medium text-muted-foreground flex items-center">
            <Target className="inline-block mr-2 h-4 w-4" /> {/* Goal Icon */}
            목표 달성 조건:
          </strong>
          {/* 목표 항목들을 리스트로 표시 */}
          <div className="mt-2 pl-6 space-y-1">
            {mission.goal &&
              Object.entries(mission.goal).map(([key, value]) => {
                const {
                  icon: Icon,
                  text: goalText,
                  color,
                } = getGoalDisplay(key);
                return (
                  <div key={key} className={`flex items-center ${color}`}>
                    <Icon className="inline-block mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">{goalText}:</span>
                    <span className="ml-1">{value}% 이상</span>
                  </div>
                );
              })}
            {(!mission.goal || Object.keys(mission.goal).length === 0) && (
              <p className="text-muted-foreground">정의된 목표 없음</p>
            )}
          </div>
        </div>
        {/* 키워드 */}
        {mission.keywords &&
          mission.keywords.length > 0 && ( // missionData -> mission
            <div>
              <strong className="font-medium text-muted-foreground flex items-center">
                <Tags className="inline-block mr-2 h-4 w-4" />{" "}
                {/* Keywords Icon */}
                키워드:
              </strong>
              <div className="mt-2 flex flex-wrap justify-center gap-2 pl-6">
                {" "}
                {/* Indent content */}
                {mission.keywords.map(
                  (
                    keyword: string,
                    index: number // Add types (missionData -> mission)
                  ) => (
                    <Badge key={index} variant="secondary">
                      {" "}
                      {/* Changed variant for subtle look */}
                      {keyword}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
        {/* 조건 */}
        {mission.conditions &&
          mission.conditions.length > 0 && ( // missionData -> mission
            <div>
              <strong className="font-medium text-muted-foreground flex items-center">
                <ListChecks className="inline-block mr-2 h-4 w-4" />{" "}
                {/* Conditions Icon */}
                조건:
              </strong>
              <ul className="list-none pl-6 mt-1 space-y-1 text-foreground">
                {" "}
                {/* Indent content */}
                {mission.conditions.map(
                  (
                    condition: string,
                    index: number // Add types (missionData -> mission)
                  ) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2 text-muted-foreground">-</span>{" "}
                      {/* Custom bullet */}
                      {condition}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        {/* 턴 정보 표시 */}
        {typeof attemptsLeft === "number" &&
          typeof totalAttempts === "number" &&
          totalAttempts > 0 && (
            <div>
              <strong className="font-medium text-muted-foreground flex items-center">
                <Repeat className="inline-block mr-2 h-4 w-4" />{" "}
                {/* Turn Icon */}
                턴:
              </strong>
              <p className="mt-1 pl-6 text-foreground">
                {/* 현재 턴 계산: 총 턴 - 남은 턴 + 1 */}
                {totalAttempts - attemptsLeft + 1} / {totalAttempts} (
                {attemptsLeft} 남음) {/* 남은 턴 정보 추가 */}
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default MissionPanel;
