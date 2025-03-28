import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge"; // Import Badge
import { Separator } from "./ui/separator"; // Import Separator

interface MissionPanelProps {
  missionId: string | null; // Allow null missionId
}

interface MissionData {
  title: string | null;
  goal: any | null; // JSONB 타입, 구체적인 구조 정의 필요
  keywords: string[] | null;
  conditions: string[] | null;
  max_attempts: number | null;
}

const MissionPanel: React.FC<MissionPanelProps> = ({ missionId }) => {
  const [missionData, setMissionData] = useState<MissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMissionData = async () => {
      setIsLoading(true);
      console.log(`MissionPanel: Fetching data for mission ${missionId}`);
      try {
        const { data, error } = await supabase
          .from('missions')
          .select('title, goal, keywords, conditions, max_attempts')
          .eq('id', missionId)
          .single();

        if (error) throw error;
        setMissionData(data);
        console.log('MissionPanel: Mission data loaded:', data);
      } catch (error) {
        console.error('Error fetching mission data:', error);
        setMissionData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (missionId) {
      fetchMissionData();
    } else {
      setIsLoading(false); // missionId 없으면 로딩 중단
      setMissionData(null);
    }
  }, [missionId]);

  // goal 객체를 문자열로 표시 (개선된 버전)
  const formatGoal = (goal: any): string => {
    if (!goal) return 'N/A';
    try {
      // goal이 객체 형태라고 가정
      return Object.entries(goal)
        .map(([key, value]) => `${key}: ${value}%`)
        .join(', ');
    } catch (e) {
      console.error("Error formatting goal:", e);
      return '형식 오류'; // 또는 다른 에러 메시지
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

  if (!missionData) {
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

  const goalString = formatGoal(missionData.goal);

  return (
    <Card className="w-full shadow-md"> {/* Add shadow for better visual separation */}
      <CardHeader>
        <CardTitle className="text-lg font-bold"> {/* Adjust title size and weight */}
          미션: {missionData.title || '제목 없음'}
        </CardTitle>
      </CardHeader>
      <Separator className="my-2" /> {/* Add separator after header */}
      <CardContent className="space-y-3 text-sm"> {/* Adjust spacing and text size */}
        <div>
          <strong className="font-semibold text-gray-700 dark:text-gray-300">목표:</strong> {/* Style label */}
          <span className="ml-2">{goalString}</span> {/* Add margin */}
        </div>
        {missionData.keywords && missionData.keywords.length > 0 && (
          <div>
            <strong className="font-semibold text-gray-700 dark:text-gray-300">키워드:</strong>
            <div className="mt-1 flex flex-wrap gap-1"> {/* Use flex-wrap for badges */}
              {missionData.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary"> {/* Use Badge component */}
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {missionData.conditions && missionData.conditions.length > 0 && (
          <div>
            <strong className="font-semibold text-gray-700 dark:text-gray-300">조건:</strong>
            <ul className="list-disc list-inside ml-4 mt-1"> {/* Use list for conditions */}
              {missionData.conditions.map((condition, index) => (
                <li key={index}>{condition}</li>
              ))}
            </ul>
          </div>
        )}
        {/* max_attempts는 CommentScene에서 관리하므로 여기서는 표시하지 않을 수 있음 */}
      </CardContent>
    </Card>
  );
};

export default MissionPanel;
