// Constants for the chat module

export const SCREENSET_KEY = 'fullmix';

export const STORAGE_KEYS = {
  CHAT_ORDER: `${SCREENSET_KEY}-chat-order`,
  CHAT_TITLES: `${SCREENSET_KEY}-chat-titles`,
  SELECTED_CHAT_ID: `${SCREENSET_KEY}-selected-chat-id`,
  MENU_OPEN: `${SCREENSET_KEY}-chat-history-menu-open`,
} as const;

// Default chat data moved to content.ts

export const AVAILABLE_CONTEXTS = [
  { id: '1', name: 'context 1', color: 'bg-yellow-400' },
  { id: '2', name: 'Work 1', color: 'bg-black' },
  { id: '3', name: 'Hobby', color: 'bg-blue-600' },
  { id: '4', name: 'Test', color: 'bg-cyan-400' },
  { id: '5', name: 'Cooking.', color: 'bg-purple-400' },
  { id: '6', name: 'Books', color: 'bg-yellow-600' },
  { id: '7', name: 'Private docs', color: 'bg-red-500' }
] as const;

export const AVAILABLE_MODELS = [
  'bartowski/deepseek-r1-distill-qwen-32b',
  'codellama-70b-hf-mlx',
  'codellama-70b-python-hf-mlx',
  'deepseek-coder-33b-instruct-hf-mlx',
  'deepseek-coder-v2-lite-instruct',
  'deepseek-r1-distill-qwen-32b-mlx@4bit',
  'deepseek-r1-distill-qwen-32b-mlx@8bit',
  'deepseek-v3',
  'distilgpt2',
  // Cloud models
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'claude-3-opus',
  'gemini-pro'
] as const;

export const DRAG_DISTANCE_THRESHOLD = 8;
export const INPUT_ANIMATION_DELAY = 75;
export const AUTO_SCROLL_DELAY = 100;
