import { useState, useCallback } from 'react';

interface UseStoryUIStateReturn {
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  notificationMessage: string;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  showPhoneChat: boolean;
  togglePhoneChat: () => void;
}

const useStoryUIState = (): UseStoryUIStateReturn => {
  const [showSettings, setShowSettings] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showPhoneChat, setShowPhoneChat] = useState(false);

  const togglePhoneChat = useCallback(() => {
    setShowPhoneChat(prevShow => !prevShow);
  }, []);

  return {
    showSettings,
    setShowSettings,
    notificationMessage,
    setNotificationMessage,
    showPhoneChat,
    togglePhoneChat,
  };
};

export default useStoryUIState;
