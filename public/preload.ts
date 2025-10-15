import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface for type safety
export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  getSystemStats: () => Promise<{
    totalMem: number;
    freeMem: number;
    load1: number;
    load5: number;
    load15: number;
    cores: number;
    platform: string;
  }>;
  getAppPath: () => Promise<{
    app: string;
    userData: string;
    public: string;
    current: string;
  }>;
  revealInFolder: (filePath: string) => Promise<boolean>;
  openPath: (filePath: string) => Promise<string>;
  send: (channel: string, data?: any) => void;
  onNewChat: (callback: (event: any) => void) => void;
  removeAllListeners: (channel: string) => void;
}

// Extend the Window interface to include our API
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app-version'),
  getPlatform: (): Promise<string> => ipcRenderer.invoke('platform'),
  getSystemStats: (): Promise<{
    totalMem: number;
    freeMem: number;
    load1: number;
    load5: number;
    load15: number;
    cores: number;
    platform: string;
  }> => ipcRenderer.invoke('system-stats'),
  getAppPath: (): Promise<{
    app: string;
    userData: string;
    public: string;
    current: string;
  }> => ipcRenderer.invoke('get-app-path'),

  // File operations
  revealInFolder: (filePath: string): Promise<boolean> => ipcRenderer.invoke('reveal-in-folder', filePath),
  openPath: (filePath: string): Promise<string> => ipcRenderer.invoke('open-path', filePath),

  // Add the missing send method
  send: (channel: string, data?: any): void => {
    // Whitelist channels for security
    const validChannels = ['new-chat', 'message-send'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  // Listen for menu events
  onNewChat: (callback: (event: any) => void): void => {
    ipcRenderer.on('new-chat', callback);
  },

  // Remove listeners
  removeAllListeners: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel);
  }
});
