import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
// import styles from './MissionPanel.module.css';

interface MissionPanelProps {
  missionId: string;
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

  if (isLoading) {
    return <div>Loading mission info...</div>;
  }

  if (!missionData) {
    return <div>Error loading mission info or mission not found.</div>;
  }

  // goal 객체를 문자열로 표시 (예시)
  const goalString = missionData.goal ? Object.entries(missionData.goal).map(([key, value]) => `${key}: ${value}%`).join(', ') : 'N/A';

  return (
    <div /* className={styles.missionPanel} */>
      <h3>미션: {missionData.title || '제목 없음'}</h3>
      <p><strong>목표:</strong> {goalString}</p>
      {missionData.keywords && missionData.keywords.length > 0 && (
        <p><strong>키워드:</strong> {missionData.keywords.join(', ')}</p>
      )}
      {missionData.conditions && missionData.conditions.length > 0 && (
        <p><strong>조건:</strong> {missionData.conditions.join(', ')}</p>
      )}
      {/* max_attempts는 CommentScene에서 관리하므로 여기서는 표시하지 않을 수 있음 */}
    </div>
  );
};

export default MissionPanel;
