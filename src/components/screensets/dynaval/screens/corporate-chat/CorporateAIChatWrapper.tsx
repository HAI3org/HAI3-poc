import React, { useState } from 'react';
import ChatLobby from './ChatLobby';
import CorporateAIChat from './CorporateAIChat';

interface CorporateAIChatWrapperProps {
  // Props that might be passed from the variant system
}

export const CorporateAIChatWrapper: React.FC<CorporateAIChatWrapperProps> = () => {
  const [currentView, setCurrentView] = useState<'lobby' | 'chat'>('lobby');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleJoinChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setCurrentView('chat');
  };

  const handleCreateChat = () => {
    // For now, just show a placeholder
    console.log('Create chat functionality to be implemented');
  };

  const handleBackToLobby = () => {
    setCurrentView('lobby');
    setSelectedChatId(null);
  };

  if (currentView === 'lobby') {
    return (
      <ChatLobby
        onJoinChat={handleJoinChat}
        onCreateChat={handleCreateChat}
        currentUserId="sarah-johnson"
      />
    );
  }

  return (
    <CorporateAIChat
      chatId={selectedChatId}
      onBackToLobby={handleBackToLobby}
    />
  );
};

export default CorporateAIChatWrapper;
