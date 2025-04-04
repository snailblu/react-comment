import React from "react";
import { Mission } from "../types"; // Mission 타입 사용
import InstagramPost from "./InstagramPost"; // InstagramPost 컴포넌트 import
// import styles from './InstagramFeed.module.css'; // 필요시 CSS 모듈 생성

interface InstagramFeedProps {
  missionData: Mission | null; // missionData prop 추가
  // TODO: 댓글 데이터 등 필요한 다른 props 추가 가능
}

const InstagramFeed: React.FC<InstagramFeedProps> = ({ missionData }) => {
  if (!missionData) {
    // 미션 데이터가 없으면 아무것도 렌더링하지 않거나 로딩/오류 상태 표시
    return (
      <div className="p-3 text-center text-muted-foreground">
        미션 데이터를 불러오는 중...
      </div>
    );
  }

  // 단일 InstagramPost 렌더링
  return (
    <div className="p-3">
      {" "}
      {/* 패딩 조정 */}
      <InstagramPost
        // InstagramPostProps에 맞게 props 전달
        nickname={missionData.nickname || "익명"} // TODO: missionData에 nickname 필드 추가 필요 (임시로 '익명' 사용)
        profileImageUrl={undefined} // TODO: missionData에 profileImageUrl 필드 추가 필요
        imageUrl={
          missionData.articleImage
            ? `/${missionData.articleImage}` // /assets/ 제거, public 루트 기준 경로 사용
            : undefined
        }
        caption={missionData.articleContent || ""}
        // likes prop 제거
        createdAt={missionData.articleCreatedAt || new Date().toISOString()}
        missionId={missionData.id} // missionId 전달
        // comments prop은 Post 내부에서 store를 사용하므로 전달 X
      />
    </div>
  );
};

export default InstagramFeed;
