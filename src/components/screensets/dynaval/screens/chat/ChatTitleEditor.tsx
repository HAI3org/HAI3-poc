import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import { ChatTitleEditorProps } from './types';
import { useTitleEditing, useChatThreads } from './hooks';
import { SCREENSET_KEY } from './constants';
import { chatAPI } from './api';

const ChatTitleEditor: React.FC<ChatTitleEditorProps> = ({ currentScreenset, activeTab }) => {
  const [titleClickTimer, setTitleClickTimer] = useState<NodeJS.Timeout | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const { chatThreads } = useChatThreads();

  const {
    editingChatTitle,
    editedTitle,
    currentChatTitle,
    setEditedTitle,
    setCurrentChatTitle,
    startEditingTitle,
    saveEditedTitle,
    cancelEditingTitle
  } = useTitleEditing(SCREENSET_KEY, selectedChatId);

  // Initialize chat title when selectedChatId changes
  useEffect(() => {
    const initializeChatTitle = async () => {
      if (selectedChatId) {
        try {
          const chat = await chatAPI.getChatById(selectedChatId);
          if (chat) {
            setCurrentChatTitle(chat.title);
          }
        } catch (error) {
          console.error('Failed to get chat title:', error);
        }
      }
    };

    initializeChatTitle();
  }, [selectedChatId, setCurrentChatTitle]);

  // Listen for chat selection changes to update title
  useEffect(() => {
    const handleChatSelectionChange = async (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.screensetKey === SCREENSET_KEY) {
        const chatId = customEvent.detail.chatId;
        setSelectedChatId(chatId);

        try {
          const chat = await chatAPI.getChatById(chatId);
          if (chat) {
            setCurrentChatTitle(chat.title);
          }
        } catch (error) {
          console.error('Failed to get chat title on selection change:', error);
        }
      }
    };

    window.addEventListener('chat-selection-change', handleChatSelectionChange);
    return () => {
      window.removeEventListener('chat-selection-change', handleChatSelectionChange);
    };
  }, [setCurrentChatTitle]);

  // Initialize with first chat if none selected
  useEffect(() => {
    if (!selectedChatId && chatThreads.length > 0) {
      setSelectedChatId(chatThreads[0].id);
    }
  }, [selectedChatId, chatThreads]);

  // Listen for external chat title updates
  useEffect(() => {
    const handleChatTitleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.screensetKey !== currentScreenset) return;

      const { chatId, newTitle } = customEvent.detail as { chatId: string; newTitle: string };

      if (chatId === selectedChatId) {
        setCurrentChatTitle(newTitle);
      }
    };

    // Listen for real-time typing from history panel
    const handleTitleTyping = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.screensetKey === currentScreenset) {
        const { chatId, newTitle } = customEvent.detail;

        if (chatId === selectedChatId) {
          setEditedTitle(newTitle);
          setCurrentChatTitle(newTitle);
        }
      }
    };

    window.addEventListener('chat-title-update', handleChatTitleUpdate);
    window.addEventListener('chat-title-typing', handleTitleTyping);

    return () => {
      window.removeEventListener('chat-title-update', handleChatTitleUpdate);
      window.removeEventListener('chat-title-typing', handleTitleTyping);
    };
  }, [currentScreenset, selectedChatId, setEditedTitle, setCurrentChatTitle]);

  // Handle single click with delay to allow for double-click
  const handleTitleSingleClick = (): void => {
    if (titleClickTimer) {
      clearTimeout(titleClickTimer);
      setTitleClickTimer(null);
      return;
    }

    const timer = setTimeout(() => {
      startEditingTitle();
      setTitleClickTimer(null);
    }, 200);

    setTitleClickTimer(timer);
  };

  // Handle double click
  const handleTitleDoubleClick = (): void => {
    if (titleClickTimer) {
      clearTimeout(titleClickTimer);
      setTitleClickTimer(null);
    }
    startEditingTitle();
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (titleClickTimer) {
        clearTimeout(titleClickTimer);
      }
    };
  }, [titleClickTimer]);

  // Handle click outside to save editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('🎯 ChatTitleEditor: handleClickOutside triggered:', {
        editingChatTitle,
        hasEditing: !!editingChatTitle,
        targetElement: event.target,
        targetTagName: (event.target as Element)?.tagName,
        targetClassName: (event.target as Element)?.className
      });

      if (editingChatTitle) {
        const target = event.target as Element;

        // Check if click is outside the editing input and not on edit/action buttons
        const isClickOnInput = target.closest('input[type="text"]');
        const isClickOnSaveButton = target.closest('button[title="Save"]');
        const isClickOnCancelButton = target.closest('button[title="Cancel"]');
        const isClickOnEditButton = target.closest('button[title="Edit title"]');

        console.log('🎯 ChatTitleEditor: Click detection analysis:', {
          editingChatTitle,
          isClickOnInput: !!isClickOnInput,
          isClickOnSaveButton: !!isClickOnSaveButton,
          isClickOnCancelButton: !!isClickOnCancelButton,
          isClickOnEditButton: !!isClickOnEditButton,
          shouldSave: !isClickOnInput && !isClickOnSaveButton && !isClickOnCancelButton && !isClickOnEditButton
        });

        if (!isClickOnInput && !isClickOnSaveButton && !isClickOnCancelButton && !isClickOnEditButton) {
          console.log('🎯 ChatTitleEditor: Click outside detected - saving edit');
          saveEditedTitle();
        } else {
          console.log('🎯 ChatTitleEditor: Click inside edit area - not saving');
        }
      } else {
        console.log('🎯 ChatTitleEditor: No active editing, ignoring click');
      }
    };

    console.log('🎯 ChatTitleEditor: Adding click outside listener, editingChatTitle:', editingChatTitle);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      console.log('🎯 ChatTitleEditor: Removing click outside listener');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingChatTitle, saveEditedTitle]);

  // Only show for chat tab
  if (activeTab !== 'chat') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 group">
      {editingChatTitle ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => {
              const newTitle = e.target.value;
              setEditedTitle(newTitle);

              if (selectedChatId) {
                window.dispatchEvent(new CustomEvent('chat-title-typing', {
                  detail: { screensetKey: SCREENSET_KEY, chatId: selectedChatId, newTitle, source: 'main-edit' }
                }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                saveEditedTitle();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                cancelEditingTitle();
              }
            }}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-80"
            autoFocus
          />
          <button
            onClick={saveEditedTitle}
            className="text-green-600 hover:text-green-700 p-1"
            title="Save"
          >
            ✓
          </button>
          <button
            onClick={cancelEditingTitle}
            className="text-red-600 hover:text-red-700 p-1"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span
            className="text-lg cursor-pointer hx-title-hover transition-colors duration-200"
            onClick={handleTitleSingleClick}
            onDoubleClick={handleTitleDoubleClick}
            title="Click or double-click to edit chat title"
          >
            {currentChatTitle}
          </span>
          <button
            onClick={startEditingTitle}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded"
            title="Edit chat title"
          >
            <Edit3 size={14} className="text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatTitleEditor;
