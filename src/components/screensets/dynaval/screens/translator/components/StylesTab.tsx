import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Database, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  X
} from 'lucide-react';
import { 
  CustomTranslationStyle, 
  TranslationConflict 
} from '../types/translationStyle';
import { TranslationStyleDatabase } from '../utils/translationStyleProcessor';
import StyleManager from './StyleManager';
import DatabaseViewer from './DatabaseViewer';

interface StylesTabProps {
  currentLanguagePair: { source: string; target: string };
  onStyleSelected?: (style: CustomTranslationStyle | null) => void;
}

const StylesTab: React.FC<StylesTabProps> = ({
  currentLanguagePair,
  onStyleSelected
}) => {
  const [styles, setStyles] = useState<CustomTranslationStyle[]>([]);
  const [showStyleManager, setShowStyleManager] = useState(false);
  const [showDatabaseViewer, setShowDatabaseViewer] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<CustomTranslationStyle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = () => {
    const allStyles = TranslationStyleDatabase.getAllStyles();
    setStyles(allStyles);
  };

  const handleStyleCreated = (newStyle: CustomTranslationStyle) => {
    setStyles(prev => [...prev, newStyle]);
    setShowStyleManager(false);
  };

  const handleStyleUpdated = (updatedStyle: CustomTranslationStyle) => {
    setStyles(prev => prev.map(style => 
      style.id === updatedStyle.id ? updatedStyle : style
    ));
    if (selectedStyle?.id === updatedStyle.id) {
      setSelectedStyle(updatedStyle);
    }
  };

  const handleDeleteStyle = (styleId: string) => {
    if (!confirm('Are you sure you want to delete this translation style? This action cannot be undone.')) {
      return;
    }
    
    TranslationStyleDatabase.deleteStyle(styleId);
    setStyles(prev => prev.filter(style => style.id !== styleId));
    if (selectedStyle?.id === styleId) {
      setSelectedStyle(null);
      setShowDatabaseViewer(false);
    }
  };

  const handleViewDatabase = (style: CustomTranslationStyle) => {
    setSelectedStyle(style);
    setShowDatabaseViewer(true);
  };

  const filteredStyles = styles.filter(style => {
    const matchesSearch = searchQuery === '' || 
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLanguage = filterLanguage === 'all' || 
      `${style.sourceLanguage}-${style.targetLanguage}` === filterLanguage;
    
    return matchesSearch && matchesLanguage;
  });

  const languagePairs = Array.from(new Set(styles.map(style => 
    `${style.sourceLanguage}-${style.targetLanguage}`
  )));

  const getStatusColor = (style: CustomTranslationStyle) => {
    if (!style.isActive) return 'text-gray-500';
    if (style.statistics.totalConflicts > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (style: CustomTranslationStyle) => {
    if (!style.isActive) return null;
    if (style.statistics.totalConflicts > 0) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Database className="w-6 h-6 mr-2" />
            Translation Styles
          </h2>
          <p className="text-gray-600 mt-1">
            Manage custom translation styles and databases
          </p>
        </div>
        <button
          onClick={() => setShowStyleManager(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Style
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Languages</option>
            {languagePairs.map(pair => (
              <option key={pair} value={pair}>
                {pair.replace('-', ' → ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{styles.length}</div>
          <div className="text-sm text-blue-700">Total Styles</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {styles.filter(s => s.isActive).length}
          </div>
          <div className="text-sm text-green-700">Active Styles</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {styles.reduce((sum, s) => sum + s.statistics.totalConflicts, 0)}
          </div>
          <div className="text-sm text-yellow-700">Total Conflicts</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {styles.reduce((sum, s) => sum + s.statistics.totalPairs, 0)}
          </div>
          <div className="text-sm text-purple-700">Translation Pairs</div>
        </div>
      </div>

      {/* Styles List */}
      <div className="space-y-4">
        {filteredStyles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              {styles.length === 0 ? 'No translation styles yet' : 'No styles match your filters'}
            </h3>
            <p className="mb-4">
              {styles.length === 0 
                ? 'Create your first custom translation style to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {styles.length === 0 && (
              <button
                onClick={() => setShowStyleManager(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Style
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredStyles.map(style => (
              <div
                key={style.id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{style.name}</h3>
                      {getStatusIcon(style)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {style.sourceLanguage} → {style.targetLanguage}
                    </p>
                    {style.description && (
                      <p className="text-sm text-gray-700 mb-3">{style.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">
                      {style.statistics.totalPairs}
                    </div>
                    <div className="text-gray-500">Pairs</div>
                  </div>
                  <div>
                    <div className={`font-medium ${getStatusColor(style)}`}>
                      {style.statistics.totalConflicts}
                    </div>
                    <div className="text-gray-500">Conflicts</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {Math.round(style.statistics.accuracy * 100)}%
                    </div>
                    <div className="text-gray-500">Accuracy</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Created {new Date(style.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDatabase(style)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="View Database"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        TranslationStyleDatabase.updateStyle(style.id, { 
                          isActive: !style.isActive 
                        });
                        loadStyles();
                      }}
                      className={`p-2 rounded ${
                        style.isActive 
                          ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' 
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      }`}
                      title={style.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStyle(style.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Style Manager Modal */}
      <StyleManager
        isOpen={showStyleManager}
        onClose={() => setShowStyleManager(false)}
        onStyleCreated={handleStyleCreated}
        currentLanguagePair={currentLanguagePair}
      />

      {/* Database Viewer Modal */}
      {selectedStyle && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showDatabaseViewer ? '' : 'hidden'}`}>
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">
                {selectedStyle.name} - Database Management
              </h2>
              <button
                onClick={() => setShowDatabaseViewer(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <DatabaseViewer
                style={selectedStyle}
                onStyleUpdated={handleStyleUpdated}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StylesTab;
