import { useState, useEffect, useCallback } from 'react';
import { useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  dispatchChatTitleTyping,
  dispatchChatTitleUpdate,
  dispatchChatSelectionChange
} from './utils';
import { STORAGE_KEYS, DRAG_DISTANCE_THRESHOLD, SCREENSET_KEY } from './constants';
import { ChatTitle, Message } from './types';
import { chatAPI } from './api';

// Chat threads management hook with API
export const useChatThreads = () => {
  const [chatThreads, setChatThreads] = useState<ChatTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load chat threads from API
  const loadChatThreads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const threads = await chatAPI.getChatThreads();
      setChatThreads(threads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat threads');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new chat thread
  const createChatThread = useCallback(async (title?: string) => {
    try {
      console.log('🆕 Creating new chat thread with title:', title);
      const newThread = await chatAPI.createChatThread(title);
      console.log('🆕 New chat thread received from API:', newThread);
      // Do NOT add to local list yet; it's temporary and should be hidden until activation
      console.log('🆕 New chat thread created (temporary). Not adding to list until activation.');
      return newThread;
    } catch (err) {
      console.error('🆕 Failed to create chat thread:', err);
      setError(err instanceof Error ? err.message : 'Failed to create chat thread');
      throw err;
    }
  }, []);

  // Update chat title
  const updateChatTitle = useCallback(async (chatId: string, newTitle: string) => {
    try {
      await chatAPI.updateChatTitle(chatId, newTitle);
      setChatThreads(prev => prev.map(chat =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chat title');
      throw err;
    }
  }, []);

  // Delete chat thread
  const deleteChatThread = useCallback(async (chatId: string) => {
    try {
      await chatAPI.deleteChatThread(chatId);
      setChatThreads(prev => prev.filter(chat => chat.id !== chatId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat thread');
      throw err;
    }
  }, []);

  // Reorder chat threads (client-side only, no API call needed)
  const reorderChatThreads = useCallback((reorderedThreads: ChatTitle[]) => {
    setChatThreads(reorderedThreads);
  }, []);

  // Update a specific chat title locally (for immediate UI feedback)
  const updateChatTitleLocal = useCallback((chatId: string, newTitle: string) => {
    setChatThreads(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  }, []);

  // Initial load
  useEffect(() => {
    loadChatThreads();
  }, [loadChatThreads]);

  // Listen for new chat creation events (without full reload)
  useEffect(() => {
    const handleNewChatCreated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newChat = customEvent.detail?.newChat;
      if (newChat) {
        console.log('🆕 Received new chat creation event:', newChat);
        setChatThreads(prev => {
          // Check if chat already exists to avoid duplicates
          if (prev.some(chat => chat.id === newChat.id)) {
            console.log('🆕 Chat already exists, skipping:', newChat.id);
            return prev;
          }
          console.log('🆕 Adding new chat to list:', newChat.id);
          return [newChat, ...prev];
        });
      }
    };

    window.addEventListener('new-chat-created', handleNewChatCreated);
    return () => {
      window.removeEventListener('new-chat-created', handleNewChatCreated);
    };
  }, []);

  // Listen for chat activation (first user message) to refresh list so it appears in Recent Chats
  useEffect(() => {
    const handleActivated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const activatedChatId = customEvent.detail?.chatId as string | undefined;
      if (activatedChatId) {
        console.log('⚡ Chat activated (first message), refreshing threads:', activatedChatId);
        loadChatThreads();
      }
    };

    window.addEventListener('chat-activated', handleActivated);
    return () => {
      window.removeEventListener('chat-activated', handleActivated);
    };
  }, [loadChatThreads]);


  // Auto-refresh timestamps every minute for recent chats
  useEffect(() => {
    const refreshTimestamps = () => {
      console.log('🕒 Refreshing timestamps for recent chats...');
      setChatThreads(prev => [...prev]); // Force re-render to update timestamps
    };

    const interval = setInterval(refreshTimestamps, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  return {
    chatThreads,
    setChatThreads,
    loading,
    error,
    createChatThread,
    updateChatTitle,
    deleteChatThread,
    reorderChatThreads,
    updateChatTitleLocal,
    refreshChatThreads: loadChatThreads
  };
};

// Chat messages management hook with API
export const useChatMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('💬 useChatMessages hook called with chatId:', chatId);

  // Load messages for a specific chat
  const loadMessages = useCallback(async (targetChatId: string) => {
    if (!targetChatId) return;

    console.log('💬 loadMessages called for chatId:', targetChatId);

    try {
      setLoading(true);
      setError(null);
      const chatMessages = await chatAPI.getChatMessages(targetChatId);
      console.log('💬 loadMessages received messages:', chatMessages.length, 'for chatId:', targetChatId);
      setMessages(chatMessages);
    } catch (err) {
      console.error('💬 loadMessages error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add message to chat
  const addMessage = useCallback(async (content: string, type: 'user' | 'assistant', files?: any[]) => {
    if (!chatId) return;

    try {
      const newMessage = await chatAPI.addMessage(chatId, {
        type,
        content,
        files: files || []
      });
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add message');
      throw err;
    }
  }, [chatId]);

  // Send user message and get LLM response
  const sendMessageWithResponse = useCallback(async (content: string, files?: any[]) => {
    if (!chatId) return;

    try {
      setError(null);

      // Add user message first
      const userMessage = await addMessage(content, 'user', files);
      // Notify system that this chat received user activity; if it was temporary, it becomes visible
      try {
        window.dispatchEvent(new CustomEvent('chat-activated', { detail: { chatId } }));
      } catch {}
      // Allow Recent Chats to auto-select now that chat is activated
      try {
        localStorage.removeItem(`${SCREENSET_KEY}-suppress-auto-select`);
      } catch {}

      // Generate and add LLM response
      const assistantMessage = await chatAPI.generateResponse(chatId, content);

      // Update local state with the assistant response
      setMessages(prev => [...prev, assistantMessage]);

      return { userMessage, assistantMessage };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, [chatId, addMessage]);

  // Regenerate from a specific message: trim from that message (inclusive->previous user), then re-generate assistant reply
  const regenerateFromMessage = useCallback(async (messageId: string) => {
    if (!chatId) return;
    try {
      setError(null);
      // Ask API to trim messages and return the user message content used for regeneration
      const result = await chatAPI.trimMessagesFrom(chatId, messageId);
      if (!result) return;

      // Reload messages after trimming
      await loadMessages(chatId);

      // Generate assistant response based on that user content
      const assistantMessage = await chatAPI.generateResponse(chatId, result.userMessageContent);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate');
      throw err;
    }
  }, [chatId, loadMessages]);

  // Load messages when chatId changes
  useEffect(() => {
    console.log('💬 useChatMessages useEffect triggered, chatId:', chatId);
    if (chatId) {
      loadMessages(chatId);
    } else {
      console.log('💬 Clearing messages (no chatId)');
      setMessages([]);
    }
  }, [chatId, loadMessages]);

  return {
    messages,
    setMessages,
    loading,
    error,
    addMessage,
    sendMessageWithResponse,
    regenerateFromMessage,
    refreshMessages: () => chatId ? loadMessages(chatId) : Promise.resolve()
  };
};

// Drag and drop sensors hook
export const useDragSensors = () => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_DISTANCE_THRESHOLD,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
};

// Menu state management hook
export const useMenuState = (screensetKey: string) => {
  const tabId = 'chat'; // This component is only used for the chat tab

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MENU_OPEN);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [showContent, setShowContent] = useState<boolean>(isMenuOpen);

  // Effect to sync state with HAI3Core button and listen for toggle events
  useEffect(() => {
    // Announce initial state
    window.dispatchEvent(new CustomEvent('second-layer-menu-state-change', {
      detail: { screensetKey, tabId, isOpen: isMenuOpen }
    }));

    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.screensetKey === screensetKey && customEvent.detail.tabId === tabId) {
        setIsMenuOpen(prev => !prev);
      }
    };

    window.addEventListener('toggle-second-layer-menu', handleToggle);

    return () => {
      window.removeEventListener('toggle-second-layer-menu', handleToggle);
    };
  }, [screensetKey, tabId, isMenuOpen]); // Re-run if isMenuOpen changes to announce new state

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU_OPEN, JSON.stringify(isMenuOpen));
    window.dispatchEvent(new CustomEvent('second-layer-menu-state-change', {
      detail: { screensetKey, tabId, isOpen: isMenuOpen }
    }));
  }, [isMenuOpen, screensetKey, tabId]);

  useEffect(() => {
    if (!isMenuOpen) {
      setShowContent(false);
    } else {
      const timer = setTimeout(() => setShowContent(true), 75);
      return () => clearTimeout(timer);
    }
  }, [isMenuOpen]);

  return { isMenuOpen, setIsMenuOpen, showContent };
};

// Chat selection management hook - simplified (only for localStorage persistence)
export const useChatSelection = (screensetKey: string, availableChats: ChatTitle[] = []) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(() => {
    // Only try to restore from localStorage if we have chats
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_CHAT_ID);
    return saved || null;
  });

  // Validate and sync selection when chats are available
  useEffect(() => {
    const suppress = localStorage.getItem(`${screensetKey}-suppress-auto-select`) === 'true';
    if (suppress) {
      // While suppressed, ensure nothing is selected in Recent Chats
      if (selectedChatId !== null) {
        console.log('🛑 Auto-select suppressed: clearing selection');
        setSelectedChatId(null);
      }
      return;
    }

    if (availableChats.length > 0) {
      const isCurrentSelectionValid = selectedChatId && availableChats.some(chat => chat.id === selectedChatId);
      if (!selectedChatId || !isCurrentSelectionValid) {
        // Select first available chat
        const firstChatId = availableChats[0].id;
        console.log('🎯 AUTO-SELECTING first chat (invalid/missing selection):', firstChatId);
        setSelectedChatId(firstChatId);
        localStorage.setItem(STORAGE_KEYS.SELECTED_CHAT_ID, firstChatId);
        dispatchChatSelectionChange(screensetKey, firstChatId);
      } else if (selectedChatId) {
        console.log('🎯 KEEPING current selection (valid):', selectedChatId);
        dispatchChatSelectionChange(screensetKey, selectedChatId);
      }
    } else {
      console.log('🎯 No chats available yet, waiting...');
    }
  }, [availableChats, selectedChatId, screensetKey]);

  // Allow external clear of selection (e.g., when starting a temporary chat)
  useEffect(() => {
    const handleClear = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.screensetKey === screensetKey) {
        console.log('🧹 Clearing Recent Chats selection by request');
        setSelectedChatId(null);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_CHAT_ID);
      }
    };
    window.addEventListener('clear-history-selection', handleClear);
    const handleSelect = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.screensetKey === screensetKey) {
        const targetId = customEvent.detail?.chatId as string | undefined;
        if (targetId) {
          console.log('✅ Forcing Recent Chats selection:', targetId);
          setSelectedChatId(targetId);
          localStorage.setItem(STORAGE_KEYS.SELECTED_CHAT_ID, targetId);
          dispatchChatSelectionChange(screensetKey, targetId);
        }
      }
    };
    window.addEventListener('select-history-chat', handleSelect);
    return () => {
      window.removeEventListener('clear-history-selection', handleClear);
      window.removeEventListener('select-history-chat', handleSelect);
    };
  }, [screensetKey]);

  const handleChatSelect = useCallback((chatId: string) => {
    console.log('🎯 useChatSelection: handleChatSelect called with:', chatId);
    console.log('🎯 useChatSelection: Current selectedChatId before change:', selectedChatId);
    setSelectedChatId(chatId);
    localStorage.setItem(STORAGE_KEYS.SELECTED_CHAT_ID, chatId);
    console.log('🎯 useChatSelection: Updated localStorage and state, dispatching event...');
    dispatchChatSelectionChange(screensetKey, chatId);
    console.log('🎯 useChatSelection: Selection change dispatched');
  }, [screensetKey, selectedChatId]);

  return { selectedChatId, setSelectedChatId, handleChatSelect };
};

// Title editing management hook
export const useTitleEditing = (screensetKey: string, currentChatId: string | null) => {
  const [editingChatTitle, setEditingChatTitle] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [currentChatTitle, setCurrentChatTitle] = useState<string>('New Chat');

  const startEditingTitle = useCallback(() => {
    setEditedTitle(currentChatTitle);
    setEditingChatTitle(true);
  }, [currentChatTitle]);

  const saveEditedTitle = useCallback(async () => {
    if (editedTitle.trim() && currentChatId) {
      try {
        const newTitle = editedTitle.trim();
        await chatAPI.updateChatTitle(currentChatId, newTitle);
        setCurrentChatTitle(newTitle);
        dispatchChatTitleUpdate(screensetKey, currentChatId, newTitle);
      } catch (error) {
        console.error('Failed to save title:', error);
        // Optionally show error to user
      }
    }
    setEditingChatTitle(false);
    setEditedTitle('');
  }, [editedTitle, screensetKey, currentChatId]);

  const cancelEditingTitle = useCallback(() => {
    setEditingChatTitle(false);
    setEditedTitle('');
  }, []);

  return {
    editingChatTitle,
    editedTitle,
    currentChatTitle,
    setEditedTitle,
    setCurrentChatTitle,
    startEditingTitle,
    saveEditedTitle,
    cancelEditingTitle
  };
};

// Real-time title synchronization hook
export const useTitleSync = (screensetKey: string, currentChatId: string) => {
  const [editedTitle, setEditedTitle] = useState<string>('');

  useEffect(() => {
    const handleTitleTyping = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.screensetKey === screensetKey && customEvent.detail?.chatId === currentChatId) {
        setEditedTitle(customEvent.detail.newTitle);
      }
    };

    window.addEventListener('chat-title-typing', handleTitleTyping);
    return () => {
      window.removeEventListener('chat-title-typing', handleTitleTyping);
    };
  }, [screensetKey, currentChatId]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setEditedTitle(newTitle);
    dispatchChatTitleTyping(screensetKey, currentChatId, newTitle);
  }, [screensetKey, currentChatId]);

  const handleTitleSave = useCallback(async () => {
    if (currentChatId) {
      try {
        await chatAPI.updateChatTitle(currentChatId, editedTitle.trim());
        dispatchChatTitleUpdate(screensetKey, currentChatId, editedTitle.trim());
      } catch (error) {
        console.error('Failed to save title:', error);
      }
    }
  }, [screensetKey, currentChatId, editedTitle]);

  return { editedTitle, setEditedTitle, handleTitleChange, handleTitleSave };
};

// This hook is no longer used - replaced with direct useEffect in ChatHistory
