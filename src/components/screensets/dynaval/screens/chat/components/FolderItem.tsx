import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { ChatFolder, ChatTitle } from '../types';
import { ChatItem } from './ChatItem';
import { SortableChatItem } from './SortableChatItem';

interface FolderItemProps {
  folder: ChatFolder;
  chats: ChatTitle[];
  selectedChatId: string | null;
  editingChatId: string | null;
  editedTitle: string;
  isChatTemporary?: (chatId: string) => boolean;
  onChatSelect: (chatId: string) => void;
  onDoubleClick: (chatId: string, currentTitle: string, e: React.MouseEvent) => void;
  onEditTitle: (chatId: string, currentTitle: string, e: React.MouseEvent) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleKeyPress: (e: React.KeyboardEvent, chatId: string) => void;
  onTitleBlur: (chatId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  dragHandleProps?: any;
}

export const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  chats,
  selectedChatId,
  editingChatId,
  editedTitle,
  isChatTemporary,
  onChatSelect,
  onDoubleClick,
  onEditTitle,
  onDeleteChat,
  onTitleChange,
  onTitleKeyPress,
  onTitleBlur,
  onRenameFolder,
  onDeleteFolder,
  dragHandleProps
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(folder.name);
  const [showActions, setShowActions] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: {
      type: 'folder',
      folder: folder
    }
  });

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingName(true);
    setEditedName(folder.name);
    setShowActions(false);
  };

  const handleSaveRename = () => {
    if (editedName.trim() && editedName.trim() !== folder.name) {
      onRenameFolder(folder.id, editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelRename = () => {
    setIsEditingName(false);
    setEditedName(folder.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  const handleDeleteFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteFolder(folder.id);
    setShowActions(false);
  };

  const chatCount = chats.length;
  const isEmpty = chatCount === 0;

  return (
    <div ref={setNodeRef} className={`folder-item ${isOver ? 'bg-blue-600/20 border-blue-400 border-2 border-dashed' : ''}`}>
      {/* Folder Header */}
      <div
        className="flex items-center justify-between p-2 hover:bg-gray-700/50 cursor-pointer group"
        onClick={handleToggleExpanded}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center flex-1 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpanded();
            }}
            className="p-1 hover:bg-gray-600 rounded mr-1"
          >
            {isExpanded ? (
              <ChevronDown size={14} className="text-gray-400" />
            ) : (
              <ChevronRight size={14} className="text-gray-400" />
            )}
          </button>
          
          {isExpanded ? (
            <FolderOpen size={16} className="text-blue-400 mr-2 flex-shrink-0" />
          ) : (
            <Folder size={16} className="text-blue-400 mr-2 flex-shrink-0" />
          )}
          
          {isEditingName ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSaveRename}
              onKeyDown={handleKeyPress}
              className="bg-gray-600 text-white px-2 py-1 rounded text-sm flex-1 min-w-0"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-gray-200 text-sm font-medium truncate flex-1">
              {folder.name}
            </span>
          )}
          
          {isEmpty && !isEditingName && (
            <span className="text-gray-500 text-xs ml-2">(empty)</span>
          )}
          
          {!isEmpty && !isEditingName && (
            <span className="text-gray-500 text-xs ml-2">({chatCount})</span>
          )}
        </div>

        {/* Folder Actions */}
        {showActions && !isEditingName && folder.id !== 'general' && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleStartRename}
              className="p-1 hover:bg-gray-600 rounded"
              title="Rename folder"
            >
              <Edit2 size={12} className="text-gray-400" />
            </button>
            <button
              onClick={handleDeleteFolder}
              className="p-1 hover:bg-gray-600 rounded"
              title="Delete folder"
            >
              <Trash2 size={12} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Folder Contents */}
      {isExpanded && (
        <div className="ml-4 border-l border-gray-600/50">
          {chats.map((chat) => (
            <div key={chat.id} className="ml-2">
              <SortableChatItem chat={chat}>
                {(dragHandleProps) => (
                  <ChatItem
                    chat={chat}
                    isSelected={selectedChatId === chat.id}
                    isEditing={editingChatId === chat.id}
                    editedTitle={editedTitle}
                    isChatTemporary={isChatTemporary}
                    onChatSelect={onChatSelect}
                    onDoubleClick={onDoubleClick}
                    onEditTitle={onEditTitle}
                    onDeleteChat={onDeleteChat}
                    onTitleChange={onTitleChange}
                    onTitleKeyPress={onTitleKeyPress}
                    onTitleBlur={onTitleBlur}
                    dragHandleProps={dragHandleProps}
                  />
                )}
              </SortableChatItem>
            </div>
          ))}
          
          {isEmpty && (
            <div className="ml-2 p-2 text-gray-500 text-sm italic">
              Drag chats here to organize them
            </div>
          )}
        </div>
      )}
    </div>
  );
};
