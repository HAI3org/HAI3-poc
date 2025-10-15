import type { LucideIcon } from 'lucide-react';

export interface LocalModel {
  id: string;
  name: string;
  vendor: string;
  loaded: boolean;
  shortlisted: boolean;
  size: string;
  vramGB: number;
  tokensPerSec: number;
  messages: number;
  lastUsed: string;
}

export interface CloudModel {
  id: string;
  name: string;
  vendor: string;
  loaded: boolean;
  shortlisted: boolean;
  cost: string;
  speed: string;
  quality: number;
}

export type Model = LocalModel | CloudModel;

export interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const sampleLocalModels: LocalModel[] = [
  {
    id: 'local1',
    name: 'Llama 3 70B',
    vendor: 'Meta',
    loaded: true,
    shortlisted: true,
    size: '70B',
    vramGB: 64,
    tokensPerSec: 62,
    messages: 147,
    lastUsed: '5m ago'
  },
  {
    id: 'local2',
    name: 'Mixtral 8x7B',
    vendor: 'Mistral AI',
    loaded: true,
    shortlisted: false,
    size: '8x7B',
    vramGB: 32,
    tokensPerSec: 75,
    messages: 205,
    lastUsed: '14m ago'
  },
  {
    id: 'local3',
    name: 'CodeLlama 34B',
    vendor: 'Meta',
    loaded: false,
    shortlisted: true,
    size: '34B',
    vramGB: 0,
    tokensPerSec: 0,
    messages: 0,
    lastUsed: 'Never'
  },
  {
    id: 'local4',
    name: 'Vicuna 13B',
    vendor: 'LMSYS',
    loaded: false,
    shortlisted: false,
    size: '13B',
    vramGB: 0,
    tokensPerSec: 0,
    messages: 0,
    lastUsed: 'Never'
  }
];

export const sampleCloudModels: CloudModel[] = [
  {
    id: 'cloud1',
    name: 'GPT-4 Turbo',
    vendor: 'OpenAI',
    loaded: false,
    shortlisted: true,
    cost: '$0.030',
    speed: '85 t/s',
    quality: 95
  },
  {
    id: 'cloud2',
    name: 'Claude 3 Opus',
    vendor: 'Anthropic',
    loaded: false,
    shortlisted: true,
    cost: '$0.075',
    speed: '78 t/s',
    quality: 97
  },
  {
    id: 'cloud3',
    name: 'Gemini Pro',
    vendor: 'Google',
    loaded: false,
    shortlisted: false,
    cost: '$0.025',
    speed: '90 t/s',
    quality: 89
  }
];
