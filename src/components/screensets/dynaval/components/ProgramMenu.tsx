import React, { useState } from 'react';
import { Search, Mail, Layers, GitBranch, DollarSign, FileText, MessageSquare, Image, Users, Heart, Warehouse, Package, X, Check, Download, Info, Languages } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  isInstalled: boolean;
  version?: string;
  category: 'productivity' | 'development' | 'communication' | 'utilities' | 'media' | 'health' | 'business';
}

interface ProgramMenuProps {
  onProgramInstall: (programId: string) => void;
  onProgramUninstall: (programId: string) => void;
  installedPrograms: string[];
  onClose: () => void;
}

// Available programs that can be installed
const availablePrograms: Program[] = [
  {
    id: 'chat',
    name: 'Chat',
    description: 'AI-powered chat interface for conversations and assistance',
    icon: ({ size = 20, className = '' }) => <div className={`w-${size/4} h-${size/4} ${className} bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold`}>C</div>,
    isInstalled: true, // Pre-installed by default
    category: 'communication'
  },
  {
    id: 'search',
    name: 'Search Assistant',
    description: 'Advanced search and information retrieval tool',
    icon: ({ size = 20, className = '' }) => <div className={`w-${size/4} h-${size/4} ${className} bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold`}>S</div>,
    isInstalled: false,
    category: 'productivity'
  },
  {
    id: 'emails',
    name: 'Email Manager',
    description: 'Intelligent email processing and management',
    icon: ({ size = 20, className = '' }) => <div className={`w-${size/4} h-${size/4} ${className} bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold`}>E</div>,
    isInstalled: false,
    category: 'communication'
  },
  {
    id: 'models',
    name: 'Model Manager',
    description: 'AI model configuration and management',
    icon: ({ size = 20, className = '' }) => <div className={`w-${size/4} h-${size/4} ${className} bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold`}>M</div>,
    isInstalled: false,
    category: 'development'
  },
  {
    id: 'git-assistant',
    name: 'Git Assistant',
    description: 'Git repository management and automation',
    icon: ({ size = 20, className = '' }) => <div className={`w-${size/4} h-${size/4} ${className} bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold`}>G</div>,
    isInstalled: false,
    category: 'development'
  },
  {
    id: 'finance-tools',
    name: 'Finance Tools',
    description: 'Financial analysis and compliance tools',
    icon: ({ size = 20, className = '' }) => <div className={`w-${size/4} h-${size/4} ${className} bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold`}>F</div>,
    isInstalled: false,
    category: 'productivity'
  },
  {
    id: 'document-processor',
    name: 'Document Processor',
    description: 'Advanced document analysis and processing',
    icon: ({ size = 20, className = '' }) => <div className={`w-${size/4} h-${size/4} ${className} bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold`}>D</div>,
    isInstalled: false,
    category: 'productivity'
  },
  {
    id: 'smart-gallery',
    name: 'Smart Gallery',
    description: 'AI-powered image gallery with smart categorization and search',
    icon: ({ size = 20, className = '' }) => <div className={`w-${size/4} h-${size/4} ${className} bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold`}>G</div>,
    isInstalled: false,
    category: 'media'
  },
  {
    id: 'corporate-ai-chat',
    name: 'Corporate AI Chat',
    description: 'Multi-agent AI chat for team collaboration with DeepSeek, ChatGPT, Gemini and more',
    icon: ({ size = 20, className = '' }) => <div className={`w-${size/4} h-${size/4} ${className} bg-indigo-500 rounded flex items-center justify-center text-white text-xs font-bold`}>C</div>,
    isInstalled: false,
    category: 'communication'
  },
  {
    id: 'smart-health',
    name: 'Smart Health',
    description: 'AI-powered health tracking with symptom analysis, medication management, and health insights',
    icon: ({ size = 20, className = '' }) => <Heart size={size} className={className} />,
    isInstalled: false,
    category: 'health'
  },
  {
    id: 'warehouse-management',
    name: 'Warehouse Management',
    description: 'Comprehensive inventory tracking, invoice processing, and AI-powered warehouse analytics',
    icon: Warehouse,
    isInstalled: false,
    category: 'business'
  },
  {
    id: 'ai-translator',
    name: 'AI Translator',
    description: 'Advanced translation tool with language detection, document support, and style customization',
    icon: Languages,
    isInstalled: false,
    category: 'utilities'
  },
];

export const ProgramMenu: React.FC<ProgramMenuProps> = ({
  onProgramInstall,
  onProgramUninstall,
  installedPrograms,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Update program installation status
  const programs = availablePrograms.map(program => ({
    ...program,
    isInstalled: installedPrograms.includes(program.id)
  }));

  const categories = [
    { key: 'all', label: 'All Programs' },
    { key: 'productivity', label: 'Productivity' },
    { key: 'development', label: 'Development' },
    { key: 'communication', label: 'Communication' },
    { key: 'utilities', label: 'Utilities' },
    { key: 'media', label: 'Media' },
    { key: 'health', label: 'Health' },
    { key: 'business', label: 'Business' }
  ];  

  const filteredPrograms = selectedCategory === 'all' 
    ? programs 
    : programs.filter(p => p.category === selectedCategory);

  const handleInstall = (programId: string) => {
    onProgramInstall(programId);
  };

  const handleUninstall = (programId: string) => {
    onProgramUninstall(programId);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <Package size={24} className="text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Program Store</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Program List */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrograms.map(program => (
                <div
                  key={program.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <program.icon size={32} className="flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-white">{program.name}</h3>
                        <span className="text-xs text-gray-400 capitalize">
                          {program.category}
                        </span>
                      </div>
                    </div>
                    {program.isInstalled && (
                      <div className="flex items-center gap-1 text-green-400">
                        <Check size={16} />
                        <span className="text-xs">Installed</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-4">{program.description}</p>
                  
                  <div className="flex justify-end">
                    {program.isInstalled ? (
                      <button
                        onClick={() => handleUninstall(program.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Uninstall
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInstall(program.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                      >
                        <Download size={16} />
                        Install
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700 bg-gray-750">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Info size={16} />
              <span>
                {installedPrograms.length} of {availablePrograms.length} programs installed
              </span>
            </div>
          </div>
    </div>
  );
};
