// src/config/characterSprites.ts
import dorimSmile from "../assets/dorim_smile.png";
import dorimSad from "../assets/dorim_sad.png";

// 캐릭터 스프라이트 타입 정의
interface CharacterSpriteMap {
  [characterName: string]: {
    [expression: string]: string; // expression은 문자열 키, 값은 이미지 경로(string)
  };
}

export const characterSprites: CharacterSpriteMap = {
  앨리스: {
    // 기존 앨리스 정의 (테스트용으로 남겨두거나 삭제 가능)
    normal: dorimSad,
    happy: dorimSmile,
  },
  도림: {
    // 도림 캐릭터 추가
    normal: dorimSad, // 기본 표정 (일단 sad 이미지 사용, 필요시 변경)
    sad: dorimSad,
    smile: dorimSmile,
    // 필요에 따라 다른 표정 추가
  },
  세영: {
    // 세영 캐릭터 스프라이트 추가 (필요하다면)
    // 예시: normal: 'path/to/seyoung_normal.png'
  },
  // 다른 캐릭터 추가 가능
};

// 캐릭터 이미지 URL을 가져오는 유틸리티 함수 (StoryScene에서 이동)
export const getCharacterImageUrl = (
  characterName: string | undefined | null,
  expression: string | undefined | null
): string => {
  // 반환 타입을 string으로 변경 (null 대신 기본 경로 반환)
  const defaultIconPath = "/default_profile_icon.png"; // 기본 아이콘 경로

  if (!characterName || !(characterName in characterSprites))
    return defaultIconPath; // 캐릭터 이름 없으면 기본 아이콘

  const characterSpriteSet = characterSprites[characterName];
  if (!characterSpriteSet) return defaultIconPath; // 캐릭터 세트 없으면 기본 아이콘

  const currentExpression = expression || "normal";
  // expression에 해당하는 스프라이트 반환, 없으면 'normal' 반환, 그것도 없으면 기본 아이콘 반환
  return (
    characterSpriteSet[currentExpression] ||
    characterSpriteSet["normal"] ||
    defaultIconPath
  );
};
