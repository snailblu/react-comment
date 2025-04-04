import React from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { BarChart, ThumbsUp, ThumbsDown } from "lucide-react";
import styles from "./OpinionStats.module.css";

import { Opinion } from "../types";

interface OpinionStatsProps {
  opinion: Opinion; // Opinion 타입 사용
  attemptsLeft: number;
}

const OpinionStats: React.FC<OpinionStatsProps> = ({
  opinion,
  attemptsLeft,
}) => {
  const { t } = useTranslation("opinionStats"); // Initialize useTranslation
  const iconClassName = `${styles.icon} inline-block w-4 h-4 mr-1`;

  return (
    <div className={styles.opinionStatsContainer}>
      <h4 className={styles.title}>
        <BarChart className={iconClassName} aria-hidden="true" /> {t("title")}
      </h4>
      <ul className={styles.statsList}>
        <li className={styles.statItem}>
          <span className={styles.statLabel}>
            <ThumbsUp className={iconClassName} aria-hidden="true" />{" "}
            {t("positive")}
          </span>
          <span className={styles.statValue}>{opinion.positive}%</span>
        </li>
        <li className={styles.statItem}>
          <span className={styles.statLabel}>
            <ThumbsDown className={iconClassName} aria-hidden="true" />{" "}
            {t("negative")}
          </span>
          <span className={styles.statValue}>{opinion.negative}%</span>
        </li>
      </ul>
      {/* 누적 막대 그래프 컨테이너 (neutral 제거) */}
      <div className={styles.stackedBarContainer}>
        <div
          className={styles.positiveSection}
          style={{ width: `${opinion.positive}%` }}
        ></div>
        {/* neutralSection 제거 */}
        <div
          className={styles.negativeSection}
          style={{ width: `${opinion.negative}%` }}
        ></div>
      </div>
      {/* 남은 시도 횟수 표시 제거 */}
    </div>
  );
};

export default OpinionStats;
