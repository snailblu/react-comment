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
        <li className={styles.statItem}>
          <span className={styles.statLabel}>
            <span className={styles.emoji}>👎</span> 부정
          </span>
          <span className={styles.statValue}>{opinion.negative}%</span>
        </li>
        <li className={styles.statItem}>
          <span className={styles.statLabel}>
            <span className={styles.emoji}>😐</span> 중립
          </span>
          <span className={styles.statValue}>{opinion.neutral}%</span>
        </li>
      </ul>
      <div className={styles.attempts}>
        남은 시도: <span className={styles.attemptsValue}>{attemptsLeft}회</span>
      </div>
    </div>
  );
};

export default OpinionStats;
