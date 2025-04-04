import { useState, useEffect } from "react";

/**
 * 스크립트 JSON 파일을 로드하는 커스텀 Hook.
 * @returns {{scriptData: Array, isLoadingScript: boolean}} 스크립트 데이터와 로딩 상태.
 */
const useScriptLoader = () => {
  const [scriptData, setScriptData] = useState([]);
  const [isLoadingScript, setIsLoadingScript] = useState(true);

  useEffect(() => {
    console.log("useScriptLoader: 스크립트 로딩 시작...");
    // Electron 환경 호환성을 위해 상대 경로 사용
    fetch("./script.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setScriptData(data);
        setIsLoadingScript(false);
        console.log("useScriptLoader: 스크립트 로딩 완료");
      })
      .catch((error) => {
        console.error("useScriptLoader: 스크립트 로딩 실패:", error);
        setIsLoadingScript(false); // 에러 발생 시에도 로딩 상태는 해제
      });
  }, []); // 마운트 시 1회 실행

  return { scriptData, isLoadingScript };
};

export default useScriptLoader;
