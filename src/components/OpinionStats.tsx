import React from 'react';
import styles from './OpinionStats.module.css'; // CSS 모듈 import

interface OpinionStatsProps {
  opinion: {
    positive: number;
    negative: number;
    neutral: number;
  };
  attemptsLeft: number;
}

const OpinionStats: React.FC<OpinionStatsProps> = ({ opinion, attemptsLeft }) => {
  return (
    <div className={styles.opinionStatsContainer}>
      <h4 className={styles.title}>📊 현재 여론</h4>
      <ul className={styles.statsList}>
        <li className={styles.statItem}>
          <span className={styles.statLabel}>
            <span className={styles.emoji}>👍</span> 긍정
          </span>
          <span className={styles.statValue}>{opinion.positive}%</span>
        </li>
        {/* 중립 항목을 긍정 다음으로 이동 */}
        <li className={styles.statItem}>
          <span className={styles.statLabel}>
            <span className={styles.emoji}>😐</span> 중립
          </span>
          <span className={styles.statValue}>{opinion.neutral}%</span>
        </li>
        <li className={styles.statItem}>
          <span className={styles.statLabel}>
            <span className={styles.emoji}>👎</span> 부정
          </span>
          <span className={styles.statValue}>{opinion.negative}%</span>
        </li>
      </ul>
      {/* 누적 막대 그래프 컨테이너 */}
      <div className={styles.stackedBarContainer}>
        <div className={styles.positiveSection} style={{ width: `${opinion.positive}%` }}></div>
        <div className={styles.neutralSection} style={{ width: `${opinion.neutral}%` }}></div>
        <div className={styles.negativeSection} style={{ width: `${opinion.negative}%` }}></div>
      </div>
      <div className={styles.attempts}>
        남은 시도: <span className={styles.attemptsValue}>{attemptsLeft}회</span>
      </div>
    </div>
  );
};

export default OpinionStats;
