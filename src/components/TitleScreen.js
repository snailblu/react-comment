import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TitleScreen.module.css';

function TitleScreen() {
  return (
    <div className={styles.titleScreen}>
      <h1 className={styles.title}>My Visual Novel</h1>
      <nav className={styles.menu}>
        <Link to="/game" className={styles.menuButton}>
          게임 시작
        </Link>
        {/* 선택 사항: 불러오기, 설정 버튼 */}
        {/* <button className={styles.menuButton} disabled>불러오기</button> */}
        {/* <button className={styles.menuButton} disabled>설정</button> */}
      </nav>
    </div>
  );
}

export default TitleScreen;
