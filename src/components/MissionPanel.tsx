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

  // Remove "테스트 미션: " prefix if it exists
  const displayTitle = missionData.title?.startsWith('테스트 미션: ')
    ? missionData.title.substring('테스트 미션: '.length)
    : missionData.title;

  return (
    <Card className="w-full shadow-lg border border-border/40"> {/* Enhanced shadow and border */}
      <CardHeader className="pb-3"> {/* Reduced bottom padding */}
        <CardTitle className="text-xl font-semibold tracking-tight"> {/* Larger title, adjusted weight/tracking */}
          {displayTitle || '제목 없음'} {/* Display title without prefix */}
        </CardTitle>
      </CardHeader>
      <Separator /> {/* Separator without margin */}
      <CardContent className="pt-4 space-y-4 text-sm"> {/* Adjusted padding and spacing */}
        <div>
          <strong className="font-medium text-muted-foreground">목표:</strong> {/* Use theme color for label */}
          <p className="mt-1 text-foreground">{goalString}</p> {/* Ensure value text color */}
        </div>
        {missionData.keywords && missionData.keywords.length > 0 && (
          <div>
            <strong className="font-medium text-muted-foreground">키워드:</strong>
            <div className="mt-2 flex flex-wrap justify-center gap-2"> {/* Centered keywords */}
              {missionData.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline"> {/* Changed variant for subtle look */}
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {missionData.conditions && missionData.conditions.length > 0 && (
          <div>
            <strong className="font-medium text-muted-foreground">조건:</strong>
            <ul className="list-none pl-4 mt-1 space-y-1 text-foreground"> {/* Removed list-disc and list-inside, added list-none */}
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
