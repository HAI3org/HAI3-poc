import React, { useState, useEffect } from 'react';
import ChatScreen from './ChatScreen';
import { ChatScreenWrapperProps, Message } from './types';
import { useChatThreads, useChatMessages } from './hooks';
import { SCREENSET_KEY } from './constants';
import { dispatchChatSelectionChange } from './utils';

const ChatScreenWrapper: React.FC<ChatScreenWrapperProps> = (props) => {
  const { chatThreads, createChatThread } = useChatThreads();
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
        console.log('🖥️ ChatScreenWrapper: Ignoring event - wrong variant key');
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

  // Ensure localStorage has titles for all chats but DO NOT overwrite user-edited local titles
  useEffect(() => {
    try {
      if (chatThreads && chatThreads.length > 0) {
        const key = `${SCREENSET_KEY}-chat-titles`;
        const existing = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, string>;
        let changed = false;
        chatThreads.forEach(t => {
          if (!(t.id in existing)) {
            existing[t.id] = t.title;
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(key, JSON.stringify(existing));
        }
      }
    } catch {}
  }, [chatThreads]);

  // When selection changes, always dispatch title from localStorage (source of truth for UI)
  useEffect(() => {
    if (!currentChatId) return;
    try {
      const key = `${SCREENSET_KEY}-chat-titles`;
      const map = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, string>;
      const curTitle = map[currentChatId];
      if (curTitle) {
        window.dispatchEvent(new CustomEvent('chat-title-update', {
          detail: { screensetKey: SCREENSET_KEY, chatId: currentChatId, newTitle: curTitle }
        }));
      }
    } catch {}
  }, [currentChatId]);

  // (Removed overwrite-prone effect that reset localStorage titles)

  const { messages, sendMessageWithResponse, regenerateFromMessage } = useChatMessages(currentChatId);

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

  // Handler: Start New Chat
  const handleStartNewChat = async () => {
    try {
      // If current chat exists and has no messages, don't create another empty chat
      if (currentChatId && messages && messages.length === 0) {
        console.log('Start New Chat: Current chat is already empty, not creating a new one.');
        return;
      }
      // Suppress auto-select in Recent Chats and clear current selection until user sends first message
      try {
        localStorage.setItem(`${SCREENSET_KEY}-suppress-auto-select`, 'true');
        window.dispatchEvent(new CustomEvent('clear-history-selection', { detail: { screensetKey: SCREENSET_KEY } }));
      } catch {}
      const newChat = await createChatThread('New Chat');
      // Persist initial title to localStorage
      try {
        const key = `${SCREENSET_KEY}-chat-titles`;
        const map = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, string>;
        map[newChat.id] = newChat.title;
        localStorage.setItem(key, JSON.stringify(map));
      } catch {}
      // Broadcast title update so header reflects immediately
      window.dispatchEvent(new CustomEvent('chat-title-update', {
        detail: { screensetKey: SCREENSET_KEY, chatId: newChat.id, newTitle: newChat.title }
      }));
      // Select the new chat only in the screen (do not select in Recent Chats yet)
      setCurrentChatId(newChat.id);
    } catch (e) {
      console.error('Failed to start new chat:', e);
    }
  };

  return (
    <ChatScreen
      {...props}
      currentChatId={currentChatId || undefined}
      chatData={chatData}
      sendMessage={sendMessageWithResponse}
      regenerateFromMessage={regenerateFromMessage}
      toggleChatTemporary={toggleChatTemporary}
      isChatTemporary={isChatTemporary}
      onNewChat={handleStartNewChat}
    />
  );
};

export default ChatScreenWrapper;
