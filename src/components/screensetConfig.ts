import React from 'react';
import { MessageSquare, Search, Mail, GitBranch, Shield, Scale, Send, Cloud, Layers, BarChart2, ClipboardList, Server, Settings as SettingsIcon, BookOpen, FileText, Info, Grid, Layout, Home as HomeIcon, Zap, BarChart3 } from 'lucide-react';

// Import screenset-specific components
import BaselineHello from './screensets/_baseline/screens/hello/Hello';
import FullmixChatScreenWrapper from './screensets/fullmix/screens/chat/ChatScreenWrapper';
import FullmixChatHistoryWrapper from './screensets/fullmix/screens/chat/ChatHistoryWrapper';
import FullmixGitAssistant from './screensets/fullmix/screens/githelpers/GitAssistant';
import CommitDashboard from './screensets/fullmix/screens/githelpers/CommitDashboard';
import FullmixTelegram from './screensets/fullmix/screens/telegram/Telegram';
import FullmixHardwareWizard from './screensets/fullmix/screens/hw_wizard/HardwareWizard';
import FullmixDocumentsProcessing from './screensets/fullmix/screens/docs_proc/DocumentsProcessing';
import FullmixModels from './screensets/fullmix/screens/models/Models';
import FullmixAudit from './screensets/fullmix/screens/audit/Audit';
import FullmixSystemDetails from './screensets/fullmix/screens/sysinfo/SystemDetails';
import FullmixSettings from './screensets/fullmix/screens/settings/Settings';
import MockupsChatScreenWrapper from './screensets/mockups/screens/chat/ChatScreenWrapper';
import MockupsChatHistoryWrapper from './screensets/mockups/screens/chat/ChatHistoryWrapper';
import MockupsModels from './screensets/mockups/screens/models/Models';
import DraftsModels from './screensets/drafts/screens/models/Models';
import DraftsChatScreenWrapper from './screensets/drafts/screens/chat/ChatScreenWrapper';
import DraftsChatHistoryWrapper from './screensets/drafts/screens/chat/ChatHistoryWrapper';
// Drafts Chat 2
import DraftsChat2ScreenWrapper from './screensets/drafts/screens/chat 2/ChatScreenWrapper';
import DynavalChatScreenWrapper from './screensets/dynaval/screens/chat/ChatScreenWrapper';
import DynavalChatHistoryWrapper from './screensets/dynaval/screens/chat/ChatHistoryWrapper';
import ProgramMenuWrapper from './screensets/dynaval/components/ProgramMenuWrapper';



// Types for second-layer menu configuration
export interface SecondLayerMenuConfig {
  enabled: boolean;
  toggleTitle: string;
  collapsedTitle: string;
  renderer?: (props: Record<string, unknown>) => React.ReactNode;
}

// Types for screenset configuration
export interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<Record<string, unknown>>;
  section: 'top' | 'middle' | 'bottom';
  component: React.ComponentType<Record<string, unknown>>;
  secondLayerMenu?: SecondLayerMenuConfig;
}

export interface Screenset {
  id: string;
  name: string;
  description: string;
  defaultTab: string;
  menuItems: MenuItem[];
}

export interface ScreensetConfig {
  [key: string]: Screenset;
}

export interface MenuSections {
  top: MenuItem[];
  middle: MenuItem[];
  bottom: MenuItem[];
}

/**
 * Screenset Configuration System
 *
 * Each screenset defines:
 * - id: unique identifier
 * - name: display name
 * - description: description for the screenset selector
 * - defaultTab: which tab to show by default
 * - menuItems: array of menu items with their screens embedded
 */

export const screensetConfig: ScreensetConfig = {
  '_baseline': {
    id: '_baseline',
    name: 'Baseline',
    description: 'Simple Hello World example',
    defaultTab: 'hello',
    menuItems: [
      {
        id: 'hello',
        title: 'Hello World',
        icon: MessageSquare,
        section: 'top',
        component: BaselineHello
      }
    ]
  },

  'fullmix': {
    id: 'fullmix',
    name: 'Full Mix',
    description: 'Complete feature set with all tools',
    defaultTab: 'chat',
    menuItems: [
      // Top section - Core features
      {
        id: 'chat',
        title: 'Chat',
        icon: MessageSquare,
        section: 'top',
        component: FullmixChatScreenWrapper,
        secondLayerMenu: {
          enabled: true,
          toggleTitle: 'Show chat history',
          collapsedTitle: 'Hide chat history',
          renderer: (props: any) => React.createElement(FullmixChatHistoryWrapper, props)
        }
      },
      { id: 'documents-processing', title: 'Documents Processing', icon: FileText, section: 'top', component: FullmixDocumentsProcessing },

      // Middle section - Assistants
      { id: 'git', title: 'Git Assistant', icon: GitBranch, section: 'middle', component: FullmixGitAssistant },
      { id: 'commit-dashboard', title: 'Commit Dashboard', icon: BarChart3, section: 'middle', component: CommitDashboard },
      { id: 'telegram', title: 'Telegram Assistant', icon: Send, section: 'middle', component: FullmixTelegram },

      // Bottom section - System & Config
      { id: 'models', title: 'Models', icon: Layers, section: 'bottom', component: FullmixModels },
      { id: 'audit', title: 'Audit', icon: ClipboardList, section: 'bottom', component: FullmixAudit },
      { id: 'system', title: 'System Details', icon: Server, section: 'bottom', component: FullmixSystemDetails },
      { id: 'api-server', title: 'Settings', icon: SettingsIcon, section: 'bottom', component: FullmixSettings },
      { id: 'hardware', title: 'Cloud GPU', icon: Cloud, section: 'bottom', component: FullmixHardwareWizard },
    ]
  },

  'mockups': {
    id: 'mockups',
    name: 'Mockups',
    description: 'Chat interface mockup',
    defaultTab: 'chat',
    menuItems: [
      {
        id: 'chat',
        title: 'Chat',
        icon: MessageSquare,
        section: 'top',
        component: MockupsChatScreenWrapper,
        secondLayerMenu: {
          enabled: true,
          toggleTitle: 'Show chat history',
          collapsedTitle: 'Hide chat history',
          renderer: (props: any) => React.createElement(MockupsChatHistoryWrapper, props)
        }
      },
      {
        id: 'models',
        title: 'Models',
        icon: Layers,
        section: 'top',
        component: MockupsModels
      }
    ]
  },

  'dynaval': {
    id: 'dynaval',
    name: 'Dynaval',
    description: 'Dynaval features',
    defaultTab: 'chat',
    menuItems: [
      {
        id: 'programs',
        title: 'Programs',
        icon: Grid,
        section: 'top',
        component: ProgramMenuWrapper
      },
      {
        id: 'chat',
        title: 'Chat',
        icon: MessageSquare,
        section: 'top',
        component: DynavalChatScreenWrapper,
        secondLayerMenu: {
          enabled: true,
          toggleTitle: 'Show chat history',
          collapsedTitle: 'Hide chat history',
          renderer: (props: any) => React.createElement(DynavalChatHistoryWrapper, props)
        }
      }
    ]
  },

  'drafts': {
    id: 'drafts',
    name: 'Drafts',
    description: 'Draft features and experimental components',
    defaultTab: 'home',
    menuItems: [
      // Top section - Core features
      {
        id: 'chat',
        title: 'Chat',
        icon: MessageSquare,
        section: 'top',
        component: DraftsChatScreenWrapper,
        secondLayerMenu: {
          enabled: true,
          toggleTitle: 'Show chat history',
          collapsedTitle: 'Hide chat history',
          renderer: (props: any) => React.createElement(DraftsChatHistoryWrapper, props)
        }
      },
      {
        id: 'chat2',
        title: 'Chat 2',
        icon: MessageSquare,
        section: 'top',
        component: DraftsChat2ScreenWrapper
      },
      // Bottom section - System & Config
      {
        id: 'models',
        title: 'Models',
        icon: Layers,
        section: 'bottom',
        component: DraftsModels
      },
    ]
  }
};

// Helper functions
export const getScreenset = (screensetId: string): Screenset => {
  return screensetConfig[screensetId] || screensetConfig._baseline;
};

export const getScreensetsList = (): Screenset[] => {
  return Object.values(screensetConfig);
};

export const getScreenseetMenuItems = (screensetId: string): MenuItem[] => {
  const screenset = getScreenset(screensetId);
  return screenset.menuItems || [];
};

export const getScreensetScreen = (screensetId: string, screenId: string): React.ComponentType<any> | null => {
  const screenset = getScreenset(screensetId);
  const menuItem = screenset.menuItems.find(item => item.id === screenId);
  return menuItem?.component || null;
};

export const getScreensetDefaultTab = (screensetId: string): string => {
  const screenset = getScreenset(screensetId);
  return screenset.defaultTab || 'chat';
};

export const getMenuItemSecondLayerConfig = (screensetId: string, menuItemId: string): SecondLayerMenuConfig | null => {
  const screenset = getScreenset(screensetId);
  const menuItem = screenset.menuItems.find(item => item.id === menuItemId);
  return menuItem?.secondLayerMenu || null;
};

// Group menu items by section for UI rendering
export const getMenuItemsBySection = (screensetId: string): MenuSections => {
  const menuItems = getScreenseetMenuItems(screensetId);

  const sections: MenuSections = {
    top: menuItems.filter(item => item.section === 'top'),
    middle: menuItems.filter(item => item.section === 'middle'),
    bottom: menuItems.filter(item => item.section === 'bottom')
  };

  return sections;
};
