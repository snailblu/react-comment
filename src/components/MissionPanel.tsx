import React from "react"; // useState, useEffect 제거
import {
  Target,
  Tags,
  ListChecks,
  Repeat,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
} from "lucide-react"; // Import icons including ThumbsUp/Down
import { useTranslation } from "react-i18next"; // Import useTranslation
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Mission } from "../types";

interface MissionPanelProps {
  // Receive mission data and loading state as props
  mission: Mission | null;
  isLoading: boolean;
  attemptsLeft?: number;
  totalAttempts?: number;
}

// props를 함수 인자에서 직접 구조 분해
const MissionPanel: React.FC<MissionPanelProps> = ({
  mission, // Use mission prop
  isLoading, // Use isLoading prop
  attemptsLeft,
  totalAttempts,
}) => {
  const { t } = useTranslation("missionPanel"); // Initialize useTranslation

  // Remove internal state and useEffect for data fetching

  // 목표 키에 따른 아이콘과 텍스트 매핑
  const getGoalDisplay = (key: string) => {
    switch (key.toLowerCase()) {
      case "positive":
        // Translate goal text if needed, currently empty
        return {
          icon: ThumbsUp,
          text: t("goalPositive"),
          color: "text-green-600",
        };
      case "negative":
        return {
          icon: ThumbsDown,
          text: t("goalNegative"),
          color: "text-red-600",
        };
      // 다른 목표 유형 추가 가능
      default:
        return {
          icon: HelpCircle,
          text: t(key, { defaultValue: key }),
          color: "text-muted-foreground",
        }; // Translate key with fallback
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
    // Display error within a Card for consistency
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t("errorTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("errorMessage")}</p>
        </CardContent>
      </Card>
    );
  }

  // const goalString = formatGoal(mission.goal); // 더 이상 사용하지 않음

  return (
    <Card className="w-full shadow-lg border border-border/40">
      {" "}
      {/* Enhanced shadow and border */}
      <CardHeader className="pb-2">
        {" "}
        {/* Padding 줄임 */} {/* Reduced bottom padding */}
        <CardTitle className="text-lg font-semibold tracking-tight">
          {" "}
          {/* text-xl -> text-lg */}{" "}
          {/* Larger title, adjusted weight/tracking */}
          {mission.title || "제목 없음"}{" "}
          {/* Use title directly (missionData -> mission) */}
        </CardTitle>
      </CardHeader>
      <Separator /> {/* Separator without margin */}
      <CardContent className="pt-3 space-y-3 text-sm">
        {" "}
        {/* Padding 및 space 줄임 */} {/* Adjusted padding and spacing */}
        {/* 목표 */}
        <div>
          <strong className="font-medium text-muted-foreground flex items-center">
            {" "}
            {/* font-normal -> font-medium */}{" "}
            {/* font-medium -> font-normal */}
            <Target className="inline-block mr-1 h-4 w-4" />{" "}
            {/* 아이콘 간격 줄임 */}
            {t("goalLabel")} {/* Use translation key */}
          </strong>
          {/* 목표 항목들을 리스트로 표시 */}
          <div className="mt-1 pl-4 space-y-0.5">
            {" "}
            {/* Padding, margin, space 줄임 */}
            {mission.goal &&
              Object.entries(mission.goal).map(([key, value]) => {
                const {
                  icon: Icon,
                  text: goalText,
                  color,
                } = getGoalDisplay(key);
                return (
                  <div key={key} className={`flex items-center ${color}`}>
                    <Icon className="inline-block mr-1 h-4 w-4 flex-shrink-0" />{" "}
                    {/* 아이콘 간격 줄임 */}
                    <span className="font-medium">{goalText}:</span>
                    <span className="ml-1">{value}%+</span>
                  </div>
                );
              })}
            {(!mission.goal || Object.keys(mission.goal).length === 0) && (
              <p className="text-muted-foreground">{t("noGoalDefined")}</p>
            )}
          </div>
        </div>
        {/* 키워드 */}
        {mission.keywords &&
          mission.keywords.length > 0 && ( // missionData -> mission
            <div>
              <strong className="font-medium text-muted-foreground flex items-center">
                {" "}
                {/* font-normal -> font-medium */}{" "}
                {/* font-medium -> font-normal */}
                <Tags className="inline-block mr-1 h-4 w-4" />{" "}
                {/* 아이콘 간격 줄임 */}
                {t("keywordsLabel")} {/* Use translation key */}
              </strong>
              <div className="mt-1 flex flex-wrap justify-start gap-1 pl-4">
                {" "}
                {/* Padding, margin, gap 줄임, justify-start */}{" "}
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
                {" "}
                {/* font-normal -> font-medium */}{" "}
                {/* font-medium -> font-normal */}
                <ListChecks className="inline-block mr-1 h-4 w-4" />{" "}
                {/* 아이콘 간격 줄임 */}
                {t("conditionsLabel")} {/* Use translation key */}
              </strong>
              <ul className="list-none pl-4 mt-1 space-y-0.5 text-foreground">
                {" "}
                {/* Padding, margin, space 줄임 */} {/* Indent content */}
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
                {" "}
                {/* font-normal -> font-medium */}{" "}
                {/* font-medium -> font-normal */}
                <Repeat className="inline-block mr-1 h-4 w-4" />{" "}
                {/* 아이콘 간격 줄임 */}
                {t("turnLabel")} {/* Use translation key */}
              </strong>
              <p className="mt-1 pl-4 text-foreground">
                {" "}
                {/* Padding, margin 줄임 */}
                {/* 현재 턴 계산: 총 턴 - 남은 턴 + 1 */}
                {totalAttempts - attemptsLeft + 1} / {totalAttempts} (
                {t("turnsLeft", { count: attemptsLeft })}){" "}
                {/* Use translation key with count */}
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default MissionPanel;
