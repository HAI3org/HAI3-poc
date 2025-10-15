import React, { useEffect, useState } from 'react';
import ChatHistory from './ChatHistory';
import { ChatHistoryWrapperProps } from './types';
import { useMenuState, useChatSelection, useChatThreads } from './hooks';
import { SCREENSET_KEY } from './constants';

const ChatHistoryWrapper: React.FC<ChatHistoryWrapperProps> = (props) => {
  const { isMenuOpen, showContent } = useMenuState(SCREENSET_KEY);
  const { chatThreads } = useChatThreads();
  const { selectedChatId, handleChatSelect } = useChatSelection(SCREENSET_KEY, chatThreads);

  // Local temporary status map loaded from storage
  const [tempMap, setTempMap] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${SCREENSET_KEY}-temp-chats`);
      if (raw) setTempMap(JSON.parse(raw));
    } catch {}

    const handleTempToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.screensetKey === SCREENSET_KEY) {
        setTempMap(prev => {
          const next = { ...prev, [customEvent.detail.chatId]: !!customEvent.detail.isTemporary };
          try { localStorage.setItem(`${SCREENSET_KEY}-temp-chats`, JSON.stringify(next)); } catch {}
          return next;
        });
      }
    };

    window.addEventListener('chat-temp-toggle', handleTempToggle);
    return () => window.removeEventListener('chat-temp-toggle', handleTempToggle);
  }, []);

  const isChatTemporary = (chatId: string): boolean => !!tempMap[chatId];

  console.log('🎯 ChatHistoryWrapper: Rendering with chatThreads:', {
    count: chatThreads.length,
    ids: chatThreads.map(t => t.id),
    selectedChatId
  });

  return (
    <div
      className="transition-all duration-200 overflow-hidden hx-secondary-menu flex flex-col h-screen pt-6 flex-shrink-0"
      style={{ width: isMenuOpen ? '280px' : '0px' }}
    >
      {showContent && (
        <ChatHistory
          {...props}
          isOpen={isMenuOpen}
          showContent={showContent}
          selectedChatId={selectedChatId}
          chatThreads={chatThreads}
          onChatSelect={handleChatSelect}
          isChatTemporary={isChatTemporary}
        />
      )}
    </div>
  );
};

export default ChatHistoryWrapper;
