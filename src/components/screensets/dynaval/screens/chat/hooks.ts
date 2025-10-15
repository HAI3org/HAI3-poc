import { useState, useEffect, useCallback } from 'react';
import { useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  dispatchChatTitleTyping,
  dispatchChatTitleUpdate,
  dispatchChatSelectionChange
} from './utils';
import { STORAGE_KEYS, DRAG_DISTANCE_THRESHOLD } from './constants';
import { ChatTitle, Message, ChatFolder } from './types';
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

      setChatThreads(prev => {
        const updated = [newThread, ...prev];
        console.log('🆕 Updated chatThreads list:', updated.map(t => ({ id: t.id, title: t.title })));
        return updated;
      });

      // Dispatch targeted new chat event (no reload, just add to other instances)
      console.log('🆕 Dispatching new-chat-created event for other hook instances');
      window.dispatchEvent(new CustomEvent('new-chat-created', {
        detail: { newChat: newThread }
      }));

      console.log('🆕 New chat thread created and added to list - SHOULD TRIGGER SELECTION');
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
    if (availableChats.length > 0) {
      const isCurrentSelectionValid = selectedChatId && availableChats.some(chat => chat.id === selectedChatId);
      // Check if current selection is valid
      if (!selectedChatId || !isCurrentSelectionValid) {
        // Select first available chat from content.ts
        const firstChatId = availableChats[0].id;
        console.log('🎯 AUTO-SELECTING first chat (invalid/missing selection):', firstChatId);
        setSelectedChatId(firstChatId);
        localStorage.setItem(STORAGE_KEYS.SELECTED_CHAT_ID, firstChatId);
        dispatchChatSelectionChange(screensetKey, firstChatId);
      } else if (selectedChatId) {
        // Current selection is valid, dispatch it
        console.log('🎯 KEEPING current selection (valid):', selectedChatId);
        dispatchChatSelectionChange(screensetKey, selectedChatId);
      }
    } else {
      console.log('🎯 No chats available yet, waiting...');
    }
  }, [availableChats, selectedChatId, screensetKey]);

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

// Folder management hook
export const useFolders = () => {
  const [folders, setFolders] = useState<ChatFolder[]>(() => {
    // Initialize with General folder if not exists
    const saved = localStorage.getItem('chat_folders');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed : [{ id: 'general', name: 'General', created_at: Date.now(), chat_ids: [] }];
    }
    return [{ id: 'general', name: 'General', created_at: Date.now(), chat_ids: [] }];
  });

  // Save folders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chat_folders', JSON.stringify(folders));
  }, [folders]);

  // Create a new folder
  const createFolder = useCallback(async (name: string): Promise<ChatFolder> => {
    const newFolder: ChatFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      created_at: Date.now(),
      chat_ids: []
    };

    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  }, []);

  // Delete a folder and move its chats to General
  const deleteFolder = useCallback(async (folderId: string): Promise<void> => {
    if (folderId === 'general') {
      throw new Error('Cannot delete the General folder');
    }

    setFolders(prev => {
      const folderToDelete = prev.find(f => f.id === folderId);
      if (folderToDelete && folderToDelete.chat_ids.length > 0) {
        // Move all chats to General folder
        const generalFolder = prev.find(f => f.id === 'general');
        if (generalFolder) {
          generalFolder.chat_ids.push(...folderToDelete.chat_ids);
        }
      }
      return prev.filter(f => f.id !== folderId);
    });
  }, []);

  // Rename a folder
  const renameFolder = useCallback(async (folderId: string, newName: string): Promise<void> => {
    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, name: newName.trim() }
        : folder
    ));
  }, []);

  // Move a chat to a folder
  const moveChatToFolder = useCallback(async (chatId: string, targetFolderId: string | null): Promise<void> => {
    setFolders(prev => {
      const newFolders = prev.map(folder => ({
        ...folder,
        chat_ids: folder.chat_ids.filter(id => id !== chatId)
      }));

      const targetFolder = newFolders.find(f => f.id === (targetFolderId || 'general'));
      if (targetFolder && !targetFolder.chat_ids.includes(chatId)) {
        targetFolder.chat_ids.push(chatId);
      }

      return newFolders;
    });
  }, []);

  // Get chats for a specific folder
  const getChatsByFolder = useCallback((folderId: string, allChats: ChatTitle[]): ChatTitle[] => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return [];

    return allChats.filter(chat => folder.chat_ids.includes(chat.id));
  }, [folders]);

  // Initialize existing chats in General folder
  const initializeChatsInGeneral = useCallback((chatIds: string[]) => {
    setFolders(prev => {
      const generalFolder = prev.find(f => f.id === 'general');
      if (generalFolder) {
        const newChatIds = chatIds.filter(id => !prev.some(f => f.chat_ids.includes(id)));
        if (newChatIds.length > 0) {
          return prev.map(folder =>
            folder.id === 'general'
              ? { ...folder, chat_ids: [...folder.chat_ids, ...newChatIds] }
              : folder
          );
        }
      }
      return prev;
    });
  }, []);

  return {
    folders,
    createFolder,
    deleteFolder,
    renameFolder,
    moveChatToFolder,
    getChatsByFolder,
    initializeChatsInGeneral
  };
};

// This hook is no longer used - replaced with direct useEffect in ChatHistory
