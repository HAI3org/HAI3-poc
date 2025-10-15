import React from 'react';
import { FileText, Folder, Languages, Sparkles, Database } from 'lucide-react';

type Tab = 'translate' | 'analyze' | 'improve' | 'styles';

interface TranslatorTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TranslatorTabs: React.FC<TranslatorTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        type="button"
        onClick={() => onTabChange('translate')}
        className={`flex items-center px-4 py-2 text-sm font-medium ${
          activeTab === 'translate'
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <Languages className="mr-2 h-4 w-4" />
        <span>Translate</span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange('analyze')}
        className={`flex items-center px-4 py-2 text-sm font-medium ${
          activeTab === 'analyze'
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <Folder className="mr-2 h-4 w-4" />
        <span>File Analysis</span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange('improve')}
        className={`flex items-center px-4 py-2 text-sm font-medium ${
          activeTab === 'improve'
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        <span>Improve Text</span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange('styles')}
        className={`flex items-center px-4 py-2 text-sm font-medium ${
          activeTab === 'styles'
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <Database className="mr-2 h-4 w-4" />
        <span>Translation Styles</span>
      </button>
    </div>
  );
};

export default TranslatorTabs;
