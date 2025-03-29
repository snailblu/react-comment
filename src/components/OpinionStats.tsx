import React from 'react';
import { BarChart, ThumbsUp, ThumbsDown } from 'lucide-react'; // lucide-react 아이콘 import
import styles from './OpinionStats.module.css'; // CSS 모듈 import

import { Opinion } from '../types'; // Opinion 타입 import

interface OpinionStatsProps {
  opinion: Opinion; // Opinion 타입 사용
  attemptsLeft: number;
}

const OpinionStats: React.FC<OpinionStatsProps> = ({ opinion, attemptsLeft }) => {
  // 아이콘 스타일을 위한 기본 클래스 (필요에 따라 OpinionStats.module.css에서 조정 가능)
  const iconClassName = `${styles.icon} inline-block w-4 h-4 mr-1`; // 예시 크기 및 마진

  return (
    <div className={styles.opinionStatsContainer}>
      {/* h4 태그 안에 아이콘 추가 */}
      <h4 className={styles.title}>
        <BarChart className={iconClassName} aria-hidden="true" /> 현재 여론
      </h4>
      <ul className={styles.statsList}>
        <li className={styles.statItem}>
          <span className={styles.statLabel}>
            {/* 이모지 대신 ThumbsUp 아이콘 사용 */}
            <ThumbsUp className={iconClassName} aria-hidden="true" /> 긍정
          </span>
          <span className={styles.statValue}>{opinion.positive}%</span>
        </li>
        {/* 중립 항목 제거 */}
        <li className={styles.statItem}>
          <span className={styles.statLabel}>
            {/* 이모지 대신 ThumbsDown 아이콘 사용 */}
            <ThumbsDown className={iconClassName} aria-hidden="true" /> 부정
          </span>
          <span className={styles.statValue}>{opinion.negative}%</span>
        </li>
      </ul>
      {/* 누적 막대 그래프 컨테이너 (neutral 제거) */}
      <div className={styles.stackedBarContainer}>
        <div className={styles.positiveSection} style={{ width: `${opinion.positive}%` }}></div>
        {/* neutralSection 제거 */}
        <div className={styles.negativeSection} style={{ width: `${opinion.negative}%` }}></div>
      </div>
      {/* 남은 시도 횟수 표시 제거 */}
    </div>
  );
};

export default OpinionStats;
