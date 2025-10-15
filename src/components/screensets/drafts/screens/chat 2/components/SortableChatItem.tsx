import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableAttributes } from '@dnd-kit/core';
import { ChatTitle } from '../types';

interface SortableChatItemProps {
  chat: ChatTitle;
  children: (dragHandleProps: {
    ref: (element: HTMLElement | null) => void;
    listeners: Record<string, Function> | undefined;
    attributes: DraggableAttributes;
  }) => React.ReactNode;
}

export const SortableChatItem: React.FC<SortableChatItemProps> = ({ chat, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ ref: () => {}, listeners, attributes })}
    </div>
  );
};
