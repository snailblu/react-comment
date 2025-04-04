import React from "react";
// import styles from './StoriesBar.module.css'; // 필요시 CSS 모듈 생성

interface StoryItem {
  id: string;
  nickname: string;
  profileImageUrl: string;
  isOwnStory?: boolean; // 자신의 스토리인지 여부
}

// 임시 스토리 데이터
const dummyStories: StoryItem[] = [
  {
    id: "myStory",
    nickname: "Your story",
    profileImageUrl: "/assets/dorim_smile.png",
    isOwnStory: true,
  },
  { id: "user1", nickname: "oliver", profileImageUrl: "/logo192.png" },
  { id: "user2", nickname: "andrew", profileImageUrl: "/logo192.png" },
  { id: "user3", nickname: "grace", profileImageUrl: "/logo192.png" },
  { id: "user4", nickname: "samuel", profileImageUrl: "/logo192.png" },
  { id: "user5", nickname: "maria", profileImageUrl: "/logo192.png" },
];

const StoriesBar: React.FC = () => {
  // TODO: 실제 스토리 데이터 로드 및 클릭 핸들러 구현
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border overflow-x-auto">
      {dummyStories.map((story) => (
        <div
          key={story.id}
          className="flex flex-col items-center flex-shrink-0 w-16"
        >
          <div
            className={`w-14 h-14 rounded-full p-0.5 border-2 ${
              story.isOwnStory ? "border-muted" : "border-pink-500"
            } flex items-center justify-center mb-1`}
          >
            <img
              src={story.profileImageUrl}
              alt={story.nickname}
              className="w-full h-full rounded-full object-cover"
            />
            {story.isOwnStory && (
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-background">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            )}
          </div>
          <span className="text-xs truncate w-full text-center">
            {story.nickname}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StoriesBar;
