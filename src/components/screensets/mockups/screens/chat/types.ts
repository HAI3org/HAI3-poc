// API Schema types matching the backend

// System Prompt schema
export interface SystemPrompt {
  $schema: string;
  auto_update: boolean;
  content: string;
  created_at: number;
  file_path: string;
  id: string;
  is_default: boolean;
  is_global: boolean;
  name: string;
  ui_meta: string;
  updated_at: number;
  user_id: string;
}

// Chat Thread schema
export interface ChatThread {
  $schema: string;
  created_at: number;
  group_id: string;
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  is_pinned: boolean;
  is_public: boolean;
  is_temporary: boolean;
  last_msg_at: number;
  size_chars: number;
  size_tokens: number;
  system_prompts: SystemPrompt[];
  tenant_id: string;
  title: string;
  updated_at: number;
  user_id: string;
}

// Chat Thread API Response
export interface ChatThreadAPIResponse {
  $schema: string;
  order: string;
  page_number: number;
  page_size: number;
  threads: ChatThread[];
  total: number;
}

// Chat Message schema
export interface ChatMessage {
  $schema: string;
  attached_file_extension: string | null;
  attached_file_name: string | null;
  chars_per_sec: number;
  completed: boolean;
  content: string;
  created_at: number;
  error: string | null;
  finish_reason: string;
  full_content_length: number;
  id: string;
  is_file_attachment: boolean;
  is_truncated: boolean;
  like: number;
  max_tokens: number;
  model_name: string | null;
  original_file_size: number;
  role: string;
  size_chars: number;
  size_tokens: number;
  temperature: number;
  thread_id: string;
  tokens_per_sec: number;
  truncated_content_length: number;
  updated_at: number;
  user_id: string;
}

// Chat Message API Response
export interface ChatMessageAPIResponse {
  $schema: string;
  messages: ChatMessage[];
  order: string;
  page_number: number;
  page_size: number;
  total: number;
}

// Legacy types for backward compatibility (transitional)
export interface ChatTitle {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
}

export interface Message {
  id: string; // UUID
  type: 'user' | 'assistant';
  content: string;
  files?: AttachedFile[];
  timestamp: Date;
}

export interface AttachedFile {
  id: string; // UUID
  name: string;
  size: number;
  type: string;
  file?: File;
  path?: string;
  external?: boolean;
}

export interface Context {
  id: string;
  name: string;
  color: string;
}

// Component Props Interfaces
export interface ChatHistoryProps {
  isOpen: boolean;
  onChatSelect: (chatId: string) => void;
  selectedChatId: string | null;
  chatThreads?: ChatTitle[]; // Optional - if provided, won't call useChatThreads
  onNewChat?: (chat: ChatTitle) => void;
  onDeleteChat?: (chat: ChatTitle) => void;
  onTitleUpdate?: (chatId: string, newTitle: string) => void;
  showContent: boolean;
  isChatTemporary?: (chatId: string) => boolean;
}

export interface ChatHistoryRef {
  updateChatTitle: (chatId: string, newTitle: string) => void;
  removeChatFromList: (chatId: string) => void;
  getChatTitles: () => ChatTitle[];
  getCurrentChat: () => ChatTitle | undefined;
}

export interface ChatScreenProps {
  toggleChatTemporary?: (chatId: string) => void;
  isChatTemporary?: (chatId: string) => boolean;
  currentChatId?: string;
  chatData?: { [key: string]: Message[] };
  onNewChat?: () => void;
  onSwitchToChat?: (chatId: string) => void;
}

export interface ChatScreenRef {
  resetMessages: (newMessages: Message[]) => void;
  loadMessages: (msgs: Message[], chatId: string) => void;
  attachExternalFile: (file: { path: string; name?: string }) => void;
  newChat: () => void;
  switchToChat: (chatId: string) => void;
}

export interface ChatTitleEditorProps {
  currentScreenset: string;
  activeTab: string;
}

// Wrapper Props
export interface ChatHistoryWrapperProps {
  isOpen?: boolean;
  onNewChat?: (chat: ChatTitle) => void;
  onDeleteChat?: (chat: ChatTitle) => void;
  onTitleUpdate?: (chatId: string, newTitle: string) => void;
  showContent?: boolean;
  isChatTemporary?: (chatId: string) => boolean;
}

export interface ChatScreenWrapperProps {
  toggleChatTemporary?: (chatId: string) => void;
  isChatTemporary?: (chatId: string) => boolean;
  chatData?: { [key: string]: Message[] };
  onNewChat?: () => void;
  onSwitchToChat?: (chatId: string) => void;
  [key: string]: unknown;
}
