import React, { useState, useEffect } from 'react';
import ChatScreen from './ChatScreen';
import { ChatScreenWrapperProps, Message } from './types';
import { useChatThreads, useChatMessages } from './hooks';
import { SCREENSET_KEY } from './constants';
import { dispatchChatSelectionChange } from './utils';

const ChatScreenWrapper: React.FC<ChatScreenWrapperProps> = (props) => {
  const { chatThreads } = useChatThreads();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  // Local temporary status state (moved from core)
  const [chatTemporaryStatus, setChatTemporaryStatus] = useState<{ [key: string]: boolean }>({});
  // Load initial map from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${SCREENSET_KEY}-temp-chats`);
      if (raw) setChatTemporaryStatus(JSON.parse(raw));
    } catch {}
  }, []);

  const persistTempMap = (map: { [key: string]: boolean }) => {
    try {
      localStorage.setItem(`${SCREENSET_KEY}-temp-chats`, JSON.stringify(map));
    } catch {}
  };

  const toggleChatTemporary = (chatId: string): void => {
    setChatTemporaryStatus(prev => {
      const next = { ...prev, [chatId]: !prev[chatId] };
      persistTempMap(next);
      // Notify others (e.g., ChatHistory)
      window.dispatchEvent(new CustomEvent('chat-temp-toggle', {
        detail: { screensetKey: SCREENSET_KEY, chatId, isTemporary: !!next[chatId] }
      }));
      return next;
    });
  };
  const isChatTemporary = (chatId: string): boolean => !!chatTemporaryStatus[chatId];

  // Listen for chat selection changes from ChatHistory
  useEffect(() => {
    const handleChatSelectionChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🖥️ ChatScreenWrapper received selection change:', customEvent.detail);
      console.log('🖥️ ChatScreenWrapper current state before change:', { currentChatId, chatThreadsCount: chatThreads.length });
      if (customEvent.detail?.screensetKey === SCREENSET_KEY) {
        console.log('🖥️ Setting currentChatId to:', customEvent.detail.chatId);
        setCurrentChatId(customEvent.detail.chatId);
        console.log('🖥️ ChatScreenWrapper: currentChatId updated');
      } else {
        console.log('🖥️ ChatScreenWrapper: Ignoring event - wrong screenset key');
      }
    };

    window.addEventListener('chat-selection-change', handleChatSelectionChange);
    return () => {
      window.removeEventListener('chat-selection-change', handleChatSelectionChange);
    };
  }, [currentChatId, chatThreads.length]);

  // Set initial chat when threads are loaded (only if none selected)
  useEffect(() => {
    console.log('🖥️ ChatScreenWrapper initialization effect:', {
      currentChatId,
      chatThreadsCount: chatThreads.length,
      chatThreads: chatThreads.map(t => ({ id: t.id, title: t.title }))
    });

    if (!currentChatId && chatThreads.length > 0) {
      const firstThreadId = chatThreads[0].id;
      console.log('🖥️ Initializing with first thread:', firstThreadId);
      setCurrentChatId(firstThreadId);
      // Dispatch the selection change so other components know about it
      dispatchChatSelectionChange(SCREENSET_KEY, firstThreadId);
    }
  }, [currentChatId, chatThreads]);

  // Ensure localStorage chat title map matches API/mock chatThreads and update header title
  useEffect(() => {
    try {
      if (chatThreads && chatThreads.length > 0) {
        const key = `${SCREENSET_KEY}-chat-titles`;
        const map: Record<string, string> = {};
        chatThreads.forEach(t => { map[t.id] = t.title; });
        localStorage.setItem(key, JSON.stringify(map));
        if (currentChatId) {
          const curTitle = map[currentChatId];
          if (curTitle) {
            window.dispatchEvent(new CustomEvent('chat-title-update', {
              detail: { screensetKey: SCREENSET_KEY, chatId: currentChatId, newTitle: curTitle }
            }));
          }
        }
      }
    } catch {}
  }, [chatThreads, currentChatId]);

  const { messages, sendMessageWithResponse } = useChatMessages(currentChatId);

  console.log('🖥️ ChatScreenWrapper RENDER state:', {
    currentChatId,
    messagesCount: messages.length,
    chatThreadsCount: chatThreads.length,
    firstThreadId: chatThreads.length > 0 ? chatThreads[0].id : 'none',
    messages: messages.map(m => ({ id: m.id, type: m.type, content: m.content.substring(0, 50) + '...' }))
  });

  // Create chat data in the format expected by ChatScreen
  const chatData: { [key: string]: Message[] } = {};
  if (currentChatId) {
    chatData[currentChatId] = messages;
  }

  return (
    <ChatScreen
      {...props}
      currentChatId={currentChatId || undefined}
      chatData={chatData}
      sendMessage={sendMessageWithResponse}
      toggleChatTemporary={toggleChatTemporary}
      isChatTemporary={isChatTemporary}
    />
  );
};

export default ChatScreenWrapper;
