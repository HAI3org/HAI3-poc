import { STORAGE_KEYS } from './constants';
import { ChatTitle } from './types';

// Storage utilities
export const loadChatOrder = (): Record<string, number> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAT_ORDER);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const saveChatOrder = (titles: ChatTitle[]): void => {
  const orderMap = titles.reduce((acc, chat, i) => ({ ...acc, [chat.id]: i }), {});
  localStorage.setItem(STORAGE_KEYS.CHAT_ORDER, JSON.stringify(orderMap));
};

// Chat title functions removed - now handled by API using content.ts data

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType: string): 'Image' | 'FileText' | 'File' => {
  if (fileType.startsWith('image/')) return 'Image';
  if (fileType.includes('text') || fileType.includes('document')) return 'FileText';
  return 'File';
};

// Model utilities
export const isCloudModel = (modelName: string): boolean => {
  const cloudPatterns = [
    'gpt-', 'claude-', 'gemini-', 'anthropic-', 'openai-',
    'api', 'remote', 'cloud', 'azure-', 'aws-', 'google-'
  ];

  const localIndicators = [
    'mlx', '@4bit', '@8bit', '@q4', '@q8', 'gguf', 'ggml',
    '-hf-', 'instruct', 'chat', 'local'
  ];

  const lowerModelName = modelName.toLowerCase();

  // If it has local indicators, it's definitely local
  if (localIndicators.some(indicator => lowerModelName.includes(indicator))) {
    return false;
  }

  // Check for cloud patterns
  return cloudPatterns.some(pattern => lowerModelName.includes(pattern));
};

export const getModelEnvironment = (modelName: string) => {
  const isCloud = isCloudModel(modelName);
  return {
    icon: isCloud ? 'Cloud' : 'Monitor',
    label: isCloud ? 'Cloud' : 'Local PC',
    color: isCloud ? 'text-blue-500' : 'text-green-600'
  };
};

// Text utilities
export const autoResize = (value: string): number => {
  const lines = value.split('\n').length;
  return Math.min(Math.max(lines, 1), 14); // Min 1, max 14 rows
};

// Clipboard utilities
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

// Event utilities
export const dispatchChatTitleTyping = (screensetKey: string, chatId: string, newTitle: string): void => {
  window.dispatchEvent(new CustomEvent('chat-title-typing', {
    detail: { screensetKey, chatId, newTitle }
  }));
};

export const dispatchChatTitleUpdate = (screensetKey: string, chatId: string, newTitle: string): void => {
  window.dispatchEvent(new CustomEvent('chat-title-update', {
    detail: { screensetKey, chatId, newTitle }
  }));
};

export const dispatchChatSelectionChange = (screensetKey: string, chatId: string): void => {
  console.log('📡 Dispatching chat-selection-change:', { screensetKey, chatId });
  window.dispatchEvent(new CustomEvent('chat-selection-change', {
    detail: { screensetKey, chatId }
  }));
};
