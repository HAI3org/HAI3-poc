import React from 'react';
import { Edit3, Trash2, Clock } from 'lucide-react';
import { ChatTitle } from '../types';

interface ChatItemProps {
  chat: ChatTitle;
  isSelected: boolean;
  isEditing: boolean;
  editedTitle: string;
  isChatTemporary?: (chatId: string) => boolean;
  onChatSelect: (chatId: string) => void;
  onDoubleClick: (chatId: string, title: string, e: React.MouseEvent) => void;
  onEditTitle: (chatId: string, title: string, e: React.MouseEvent) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleKeyPress: (e: React.KeyboardEvent, chatId: string) => void;
  onTitleBlur: (chatId: string) => void;
  dragHandleProps: any;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  isSelected,
  isEditing,
  editedTitle,
  isChatTemporary,
  onChatSelect,
  onDoubleClick,
  onEditTitle,
  onDeleteChat,
  onTitleChange,
  onTitleKeyPress,
  onTitleBlur,
  dragHandleProps
}) => {
  console.log('🎯 ChatItem: Rendering chat item:', {
    chatId: chat.id,
    title: chat.title,
    isSelected,
    isEditing,
    timestamp: chat.timestamp,
    preview: chat.preview
  });
  return (
    <div
      data-chat-id={chat.id}
      className={`relative group hx-menu-item transition-colors duration-200 ${
        isSelected ? 'hx-menu-item-selected' : ''
      }`}
    >
      <div
        {...dragHandleProps.listeners}
        onClick={(e) => {
          console.log('🎯 ChatItem: onClick triggered for chat:', {
            chatId: chat.id,
            chatTitle: chat.title,
            isEditing,
            isSelected
          });
          if (!isEditing) {
            console.log('🎯 ChatItem: Calling onChatSelect for:', chat.id);
            onChatSelect(chat.id);
          } else {
            console.log('🎯 ChatItem: Click ignored - chat is in editing mode');
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!isEditing) {
            onDoubleClick(chat.id, chat.title, e);
          }
        }}
        onKeyDown={(e) => {
          if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onChatSelect(chat.id);
          }
        }}
        className="w-full p-4 text-left relative cursor-grab active:cursor-grabbing"
        style={{ paddingRight: '10px' }}
      >
        <div className="flex items-start justify-between mb-1">
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={onTitleChange}
              onKeyDown={(e) => onTitleKeyPress(e, chat.id)}
              onBlur={(e) => {
                // Prevent immediate blur if it's caused by the edit button click
                if (e.relatedTarget?.closest('button[title="Edit chat title"]')) {
                  console.log('🎯 ChatItem: Preventing immediate blur from edit button');
                  return;
                }
                onTitleBlur(chat.id);
              }}
              className="flex-1 px-2 py-1 text-sm bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
              ref={(input) => {
                if (input) {
                  // Delayed focus to prevent race condition (no text selection)
                  setTimeout(() => {
                    input.focus();
                    // Position cursor at end of text instead of selecting all
                    input.setSelectionRange(input.value.length, input.value.length);
                  }, 50);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3
              className="font-medium text-sm truncate pr-2 transition-opacity duration-200"
              title="Double-click to edit title"
            >
              {chat.title}
            </h3>
          )}

          {/* Right side - timestamp or action buttons */}
          <div className="flex items-center gap-1 ml-2">
            {/* Temporary chat indicator */}
            {isChatTemporary && isChatTemporary(chat.id) && (
              <div className="flex items-center" title="Temporary chat">
                <Clock size={12} className="text-orange-400 opacity-80" />
              </div>
            )}

            {/* Timestamp - hidden on hover */}
            <span className="text-xs whitespace-nowrap group-hover:opacity-0 transition-opacity duration-200 opacity-60">
              {chat.timestamp}
            </span>

            {/* Action buttons - shown on hover, positioned over timestamp */}
            <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 chat-action-buttons">
              <button
                onClick={(e) => {
                  console.log('🎯 ChatItem: Edit button clicked for chat:', chat.id);
                  e.preventDefault();
                  e.stopPropagation();
                  onEditTitle(chat.id, chat.title, e);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-600 rounded transition-colors duration-200 bg-gray-800 transform hover:scale-110"
                title="Edit chat title"
              >
                <Edit3 size={12} className="text-gray-300" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteChat(chat.id, e);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1 hover:bg-red-700 rounded transition-colors duration-200 bg-gray-800 transform hover:scale-110"
                title="Delete chat"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs truncate transition-opacity duration-200">
          {chat.preview}
        </p>
      </div>
    </div>
  );
};
