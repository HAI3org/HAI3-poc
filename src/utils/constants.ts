// Available context items for the dropdown
export interface ContextItem {
  id: string;
  name: string;
  color: string;
}

export const availableContexts: ContextItem[] = [
  { id: '1', name: 'context 1', color: 'bg-yellow-400' },
  { id: '2', name: 'Work 1', color: 'bg-black' },
  { id: '3', name: 'Hobby', color: 'bg-blue-600' },
  { id: '4', name: 'Test', color: 'bg-cyan-400' },
  { id: '5', name: 'Cooking.', color: 'bg-purple-400' },
  { id: '6', name: 'Books', color: 'bg-yellow-600' },
  { id: '7', name: 'Private docs', color: 'bg-red-500' }
];

// Available models for the dropdown
export const availableModels: string[] = [
  'bartowski/deepseek-r1-distill-qwen-32b',
  'codellama-70b-hf-mlx',
  'codellama-70b-python-hf-mlx',
  'deepseek-coder-33b-instruct-hf-mlx',
  'deepseek-coder-v2-lite-instruct',
  'deepseek-r1-distill-qwen-32b-mlx@4bit',
  'deepseek-r1-distill-qwen-32b-mlx@8bit',
  'deepseek-v3',
  'distilgpt2'
];
