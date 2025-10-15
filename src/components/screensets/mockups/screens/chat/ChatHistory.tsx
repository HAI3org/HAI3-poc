import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { ConfirmationModal } from '../../../../common/Modal';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { ChatHistoryProps, ChatHistoryRef, ChatTitle } from './types';
import { SCREENSET_KEY, AUTO_SCROLL_DELAY } from './constants';
import {
  useChatThreads,
  useDragSensors
} from './hooks';
import { SortableChatItem } from './components/SortableChatItem';
import { ChatItem } from './components/ChatItem';

const ChatHistory = forwardRef<ChatHistoryRef, ChatHistoryProps>(({
  isOpen,
  onChatSelect,
  selectedChatId,
  chatThreads: propChatThreads,
  onNewChat,
  onDeleteChat,
  onTitleUpdate,
  showContent,
  isChatTemporary
}, ref) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [chatToDelete, setChatToDelete] = useState<ChatTitle | null>(null);

  // Local state for real-time title updates during typing
  const [liveTitle, setLiveTitle] = useState<{ chatId: string; title: string } | null>(null);

  const hookResult = useChatThreads();
  const {
    chatThreads: hookChatThreads,
    loading,
    error,
    createChatThread,
    updateChatTitle,
    deleteChatThread: apiDeleteChatThread,
    reorderChatThreads,
    updateChatTitleLocal
  } = hookResult;

  // Always use hook result for now to ensure creation works
  const chatThreads = hookChatThreads;

  console.log('🎯 ChatHistory: Using chatThreads from HOOK (always):', {
    hookCount: hookChatThreads.length,
    propCount: propChatThreads?.length || 0
  });

  const sensors = useDragSensors();

  // Listen for title typing events from the main title editor
  useEffect(() => {
    const handleTitleTyping = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.screensetKey === SCREENSET_KEY) {
        const { chatId, newTitle, source } = customEvent.detail;

        // Set live title for real-time visual feedback
        setLiveTitle({ chatId, title: newTitle });

        // Only update the input if the event comes from a different source (e.g., main title editor)
        // Don't update if we're the source to prevent circular updates
        if (editingChatId === chatId && source !== 'history-edit') {
          console.log('🎯 ChatHistory: Updating editedTitle from external source:', { chatId, newTitle, source });
          setEditedTitle(newTitle);
        } else {
          console.log('🎯 ChatHistory: Ignoring title typing event from same source:', { chatId, source, editingChatId });
        }
      }
    };

    window.addEventListener('chat-title-typing', handleTitleTyping);
    return () => {
      window.removeEventListener('chat-title-typing', handleTitleTyping);
    };
  }, [editingChatId, setEditedTitle]);

  // Listen for title update events (when title is actually saved)
  useEffect(() => {
    const handleTitleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.screensetKey === SCREENSET_KEY) {
        const { chatId, newTitle } = customEvent.detail;

        // Clear live title since the save is complete
        setLiveTitle(null);

        // Update the title locally without refreshing the entire list
        // The API has already been updated, so we just sync the UI immediately
        updateChatTitleLocal(chatId, newTitle);
      }
    };

    window.addEventListener('chat-title-update', handleTitleUpdate);
    return () => {
      window.removeEventListener('chat-title-update', handleTitleUpdate);
    };
  }, [updateChatTitleLocal]);

  // Auto-scroll to top when new chat is created
  const scrollToTop = () => {
    setTimeout(() => {
      const chatListContainer = document.querySelector('.chat-list-container');
      if (chatListContainer) {
        console.log('🎯 ChatHistory: Scrolling chat list to top for new chat');
        chatListContainer.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, AUTO_SCROLL_DELAY);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chatThreads.findIndex((item) => item.id === active.id);
      const newIndex = chatThreads.findIndex((item) => item.id === over.id);
      const reorderedItems = arrayMove(chatThreads, oldIndex, newIndex);
      reorderChatThreads(reorderedItems);
    }
  };

  const handleClick = (chatId: string) => {
    console.log('🎯 ChatHistory: handleClick called with chatId:', chatId);
    onChatSelect(chatId);
    // No scrolling when selecting existing threads - keep scroll position unchanged
  };

  const createNewChat = async (): Promise<void> => {
    try {
      console.log('🎯 ChatHistory: Starting to create new chat...');
      const newChat = await createChatThread('New Chat');
      console.log('🎯 ChatHistory: New chat created:', newChat);

      // Immediately force selection and localStorage update
      console.log('🎯 ChatHistory: IMMEDIATE selection of new chat ID:', newChat.id);
      localStorage.setItem(`${SCREENSET_KEY}_selected_chat_id`, newChat.id);
      onChatSelect(newChat.id);

      if (onNewChat) {
        console.log('🎯 ChatHistory: Calling onNewChat callback');
        onNewChat(newChat);
      } else {
        console.log('🎯 ChatHistory: No onNewChat callback provided');
      }

      scrollToTop();
      console.log('🎯 ChatHistory: New chat creation completed successfully');
    } catch (error) {
      console.error('🎯 ChatHistory: Failed to create new chat:', error);
      // Could show error notification to user
    }
  };

  // Handle chat deletion - show confirmation modal
  const deleteChat = (chatId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    const chatToDelete = chatThreads.find(chat => chat.id === chatId);
    if (chatToDelete) {
      setChatToDelete(chatToDelete);
      setShowDeleteModal(true);
    }
  };

  // Confirm deletion
  const confirmDelete = async (): Promise<void> => {
    if (chatToDelete) {
      try {
        await apiDeleteChatThread(chatToDelete.id);

        if (selectedChatId === chatToDelete.id && chatThreads.length > 1) {
          const remainingChats = chatThreads.filter(chat => chat.id !== chatToDelete.id);
          if (remainingChats.length > 0) {
            onChatSelect(remainingChats[0].id);
          }
        }

        if (onDeleteChat) {
          onDeleteChat(chatToDelete);
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
        // Could show error notification to user
      }
    }
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  const cancelDelete = (): void => {
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  // Handle inline title editing
  const startInlineEdit = (chatId: string, currentTitle: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    console.log('🎯 ChatHistory: Starting inline edit for:', { chatId, currentTitle });
    setEditingChatId(chatId);
    setEditedTitle(currentTitle);

    // Ensure edit state persists by preventing immediate save triggers
    setTimeout(() => {
      console.log('🎯 ChatHistory: Edit state stabilized for:', chatId);
    }, 100);
  };

  const saveInlineEdit = async (chatId: string): Promise<void> => {
    console.log('🎯 ChatHistory: saveInlineEdit called for:', {
      chatId,
      editedTitle,
      editingChatId,
      trimmedTitle: editedTitle.trim()
    });

    const trimmedTitle = editedTitle.trim();
    if (!trimmedTitle) {
      console.log('🎯 ChatHistory: Empty title, not saving');
      return;
    }

    try {
      console.log('🎯 ChatHistory: Updating chat title from', editedTitle, 'to', trimmedTitle);
      await updateChatTitle(chatId, trimmedTitle);

      if (onTitleUpdate) {
        onTitleUpdate(chatId, trimmedTitle);
      }
    } catch (error) {
      console.error('Failed to save title:', error);
      // Could show error notification to user
    }

    // Clear live title and editing state
    console.log('🎯 ChatHistory: Clearing edit state');
    setLiveTitle(null);
    setEditingChatId(null);
    setEditedTitle('');
  };

  const cancelInlineEdit = (): void => {
    console.log('🎯 ChatHistory: cancelInlineEdit called - clearing edit state');
    // Clear live title and editing state
    setLiveTitle(null);
    setEditingChatId(null);
    setEditedTitle('');
    console.log('🎯 ChatHistory: Edit state cleared');
  };

  // Handle click outside to cancel editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('🎯 ChatHistory: handleClickOutside triggered:', {
        editingChatId,
        hasEditingChat: !!editingChatId,
        targetElement: event.target,
        targetTagName: (event.target as Element)?.tagName,
        targetClassName: (event.target as Element)?.className
      });

      if (editingChatId) {
        const target = event.target as Element;

        // Check if click is outside the editing input and not on edit/action buttons
        const isClickOnInput = target.closest('input[type="text"]');
        const isClickOnEditButton = target.closest('button[title="Edit chat title"]');
        const isClickOnActionButton = target.closest('.chat-action-buttons');
        const isClickOnChatItem = target.closest('[data-chat-id]');

        console.log('🎯 ChatHistory: Click detection analysis:', {
          editingChatId,
          isClickOnInput: !!isClickOnInput,
          isClickOnEditButton: !!isClickOnEditButton,
          isClickOnActionButton: !!isClickOnActionButton,
          isClickOnChatItem: !!isClickOnChatItem,
          chatItemId: isClickOnChatItem?.getAttribute('data-chat-id'),
          shouldCancel: !isClickOnInput && !isClickOnEditButton && !isClickOnActionButton
        });

        if (!isClickOnInput && !isClickOnEditButton && !isClickOnActionButton) {
          console.log('🎯 ChatHistory: Click outside detected - saving edit');
          saveInlineEdit(editingChatId);
        } else {
          console.log('🎯 ChatHistory: Click inside edit area - not saving');
        }
      } else {
        console.log('🎯 ChatHistory: No active editing, ignoring click');
      }
    };

    console.log('🎯 ChatHistory: Adding click outside listener, editingChatId:', editingChatId);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      console.log('🎯 ChatHistory: Removing click outside listener');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingChatId]);

  const handleKeyPress = (e: React.KeyboardEvent, chatId: string): void => {
    console.log('🎯 ChatHistory: handleKeyPress triggered:', { key: e.key, chatId, editingChatId });
    if (e.key === 'Enter') {
      console.log('🎯 ChatHistory: Enter pressed - saving inline edit');
      saveInlineEdit(chatId);
    } else if (e.key === 'Escape') {
      console.log('🎯 ChatHistory: Escape pressed - canceling inline edit');
      cancelInlineEdit();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    console.log('🎯 ChatHistory: handleTitleChange:', {
      newTitle,
      previousEditedTitle: editedTitle,
      editingChatId
    });
    setEditedTitle(newTitle);

    if (editingChatId) {
      // Update live title for immediate visual feedback
      setLiveTitle({ chatId: editingChatId, title: newTitle });

      // Dispatch event for main title editor to sync
      window.dispatchEvent(new CustomEvent('chat-title-typing', {
        detail: { screensetKey: SCREENSET_KEY, chatId: editingChatId, newTitle, source: 'history-edit' }
      }));
    }
  };

  // Update chat title (used by imperative handle)
  const updateChatTitleImperative = async (chatId: string, newTitle: string): Promise<void> => {
    try {
      await updateChatTitle(chatId, newTitle.trim());
    } catch (error) {
      console.error('Failed to update chat title:', error);
    }
  };

  // Remove chat from list (used by imperative handle)
  const removeChatFromList = async (chatId: string): Promise<void> => {
    try {
      await apiDeleteChatThread(chatId);
    } catch (error) {
      console.error('Failed to remove chat from list:', error);
    }
  };

  // Apply live title updates for real-time feedback
  const threadsWithLiveUpdates = chatThreads.map(chat => {
    if (liveTitle && liveTitle.chatId === chat.id) {
      return { ...chat, title: liveTitle.title };
    }
    return chat;
  });

  console.log('🎯 ChatHistory: Rendering with threads:', {
    totalThreads: chatThreads.length,
    threadsWithLiveUpdates: threadsWithLiveUpdates.length,
    selectedChatId,
    threadIds: chatThreads.map(t => t.id),
    threadTitles: chatThreads.map(t => t.title)
  });

  // Filter chats based on search query
  const filteredChats = threadsWithLiveUpdates.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('🎯 ChatHistory: Filtered chats:', {
    filteredCount: filteredChats.length,
    filteredIds: filteredChats.map(c => c.id),
    searchQuery
  });

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateChatTitle: updateChatTitleImperative,
    removeChatFromList,
    getChatTitles: () => threadsWithLiveUpdates,
    getCurrentChat: () => threadsWithLiveUpdates.find(chat => chat.id === selectedChatId)
  }));

  if (!isOpen) return null;

  return (
    <>
      <div
        className="transition-all duration-200 overflow-hidden hx-secondary-menu flex flex-col h-screen flex-shrink-0"
        style={{ width: isOpen ? '280px' : '0px' }}
      >
        {showContent && (
          <>
            {loading && (
              <div className="p-4 text-center text-gray-400">
                Loading chats...
              </div>
            )}
            {error && (
              <div className="p-4 text-center text-red-400">
                Error: {error}
              </div>
            )}
            {!loading && !error && (
              <>
                {/* Chat List Header */}
                <div className="p-4 border-b hx-recent-chat-search">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white transition-opacity duration-75 ease-in-out">
                  Recent Chats
                </h2>
                <button
                  onClick={createNewChat}
                  className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                  title="New chat"
                >
                  <Plus size={16} className="text-gray-300" />
                </button>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm transition-opacity duration-75 ease-in-out"
                />
              </div>
            </div>

            {/* Chat List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredChats}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 overflow-y-auto chat-list-container">
                  {filteredChats.map((chat) => (
                    <SortableChatItem key={chat.id} chat={chat}>
                      {(dragHandleProps) => (
                        <ChatItem
                          chat={chat}
                          isSelected={selectedChatId === chat.id}
                          isEditing={editingChatId === chat.id}
                          editedTitle={editedTitle}
                          isChatTemporary={isChatTemporary}
                          onChatSelect={handleClick}
                          onDoubleClick={startInlineEdit}
                          onEditTitle={startInlineEdit}
                          onDeleteChat={deleteChat}
                          onTitleChange={handleTitleChange}
                          onTitleKeyPress={handleKeyPress}
                          onTitleBlur={saveInlineEdit}
                          dragHandleProps={dragHandleProps}
                        />
                      )}
                    </SortableChatItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
              </>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Chat"
        message={`Are you sure you want to delete "${chatToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonType="danger"
      />
    </>
  );
});

export default ChatHistory;
