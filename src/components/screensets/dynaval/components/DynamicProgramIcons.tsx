import React, { useState, useEffect } from 'react';
import { Search, Mail, Layers, GitBranch, DollarSign, FileText, MessageSquare, Image, Users, Heart, Warehouse, Languages } from 'lucide-react';
import DynavalChatScreenWrapper from '../screens/chat/ChatScreenWrapper';
import DynavalModels from '../screens/models/Models';
import SmartGallery from '../screens/gallery/SmartGallery';
import CorporateAIChatWrapper from '../screens/corporate-chat/CorporateAIChatWrapper';
import SmartHealth from '../screens/smart-health/SmartHealth';
import WarehouseManagement from '../screens/warehouse/WarehouseManagement';
import FullmixGitAssistant from '../../fullmix/screens/githelpers/GitAssistant';
import FullmixDocumentsProcessing from '../../fullmix/screens/docs_proc/DocumentsProcessing';
import AITranslator from '../screens/translator';

interface Program {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<Record<string, unknown>>;
}

interface DynamicProgramIconsProps {
  onProgramSelect: (programId: string) => void;
  selectedProgram?: string;
}

// Map program IDs to their configurations
const programConfigs: Record<string, Program> = {
  'chat': {
    id: 'chat',
    name: 'Chat',
    icon: MessageSquare,
    component: DynavalChatScreenWrapper
  },
  'models': {
    id: 'models',
    name: 'Model Manager',
    icon: Layers,
    component: DynavalModels
  },
  'git-assistant': {
    id: 'git-assistant',
    name: 'Git Assistant',
    icon: GitBranch,
    component: FullmixGitAssistant
  },
  'document-processor': {
    id: 'document-processor',
    name: 'Document Processor',
    icon: FileText,
    component: FullmixDocumentsProcessing
  },
  'smart-gallery': {
    id: 'smart-gallery',
    name: 'Smart Gallery',
    icon: Image,
    component: SmartGallery
  },
  'corporate-ai-chat': {
    id: 'corporate-ai-chat',
    name: 'Corporate AI Chat',
    icon: Users,
    component: CorporateAIChatWrapper
  },
  'smart-health': {
    id: 'smart-health',
    name: 'Smart Health',
    icon: Heart,
    component: SmartHealth
  },
  'warehouse-management': {
    id: 'warehouse-management',
    name: 'Warehouse Management',
    icon: Warehouse,
    component: WarehouseManagement
  },
  'ai-translator': {
    id: 'ai-translator',
    name: 'AI Translator',
    icon: Languages,
    component: AITranslator,
  },
};

export const DynamicProgramIcons: React.FC<DynamicProgramIconsProps> = ({
  onProgramSelect,
  selectedProgram
}) => {
  const [installedPrograms, setInstalledPrograms] = useState<string[]>([]);

  // Load installed programs from localStorage
  useEffect(() => {
    const loadInstalledPrograms = () => {
      const stored = localStorage.getItem('dynaval_installed_programs');
      if (stored) {
        try {
          setInstalledPrograms(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse installed programs:', error);
        }
      }
    };

    loadInstalledPrograms();

    // Listen for storage changes to update when programs are installed/uninstalled
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dynaval_installed_programs') {
        loadInstalledPrograms();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events for same-tab updates
    const handleProgramUpdate = () => {
      loadInstalledPrograms();
    };

    window.addEventListener('programsUpdated', handleProgramUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('programsUpdated', handleProgramUpdate);
    };
  }, []);

  // Get installed program configurations
  const installedProgramConfigs = installedPrograms
    .map(id => programConfigs[id])
    .filter(Boolean);

  if (installedProgramConfigs.length === 0) {
    return null;
  }

  return (
    <>
      {installedProgramConfigs.map(program => {
        const IconComponent = program.icon;
        const isSelected = selectedProgram === program.id;

        return (
          <button
            key={program.id}
            onClick={() => onProgramSelect(program.id)}
            className={`flex items-center gap-3 rounded-lg transition-colors px-3 py-3 hx-left-menu-item w-full ${
              isSelected ? 'bg-blue-600 text-white' : ''
            }`}
            title={program.name}
          >
            <IconComponent size={20} className="flex-shrink-0" />
            <span className="text-sm ease-in-out truncate">{program.name}</span>
          </button>
        );
      })}
    </>
  );
};

// Export program configurations for use in other components
export { programConfigs };

export default DynamicProgramIcons;
