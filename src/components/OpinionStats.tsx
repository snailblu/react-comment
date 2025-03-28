import React from 'react';
// import styles from './OpinionStats.module.css';

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
    <div /* className={styles.opinionStatsContainer} */>
      <h4>현재 여론</h4>
      {/* TODO: 시각적인 그래프나 바 형태로 표시하면 더 좋음 */}
      <p>긍정: {opinion.positive}%</p>
      <p>부정: {opinion.negative}%</p>
      <p>중립: {opinion.neutral}%</p>
      <p>남은 시도: {attemptsLeft}회</p>
    </div>
  );
};

export default OpinionStats;
