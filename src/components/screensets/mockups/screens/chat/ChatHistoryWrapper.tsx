import React from 'react';
import ChatHistory from './ChatHistory';
import { ChatHistoryWrapperProps } from './types';
import { useMenuState, useChatSelection, useChatThreads } from './hooks';
import { SCREENSET_KEY } from './constants';

const ChatHistoryWrapper: React.FC<ChatHistoryWrapperProps> = (props) => {
  const { isMenuOpen, showContent } = useMenuState(SCREENSET_KEY);
  const { chatThreads } = useChatThreads();
  const { selectedChatId, handleChatSelect } = useChatSelection(SCREENSET_KEY, chatThreads);

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
        />
      )}
    </div>
  );
};

export default ChatHistoryWrapper;
