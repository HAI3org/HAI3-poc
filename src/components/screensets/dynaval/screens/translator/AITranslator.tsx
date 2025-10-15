import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Languages, Upload, FileText, X, Copy, Check, Type, Database, Settings } from 'lucide-react';
import FileAnalysis from './FileAnalysis';
import TranslatorTabs from './TranslatorTabs';
import StyleManager from './components/StyleManager';
import DatabaseViewer from './components/DatabaseViewer';
import StylesTab from './components/StylesTab';
import type { FileInfo } from './types';
import type { CustomTranslationStyle } from './types/translationStyle';
import { TranslationStyleDatabase } from './utils/translationStyleProcessor';

type Mode = 'translate' | 'improve';
type Tab = 'translate' | 'analyze' | 'improve' | 'styles';
type TranslationStyle = 'general' | 'financial' | 'technical' | 'legal' | 'casual' | 'academic' | 'business' | 'creative';

const AITranslator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('translate');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [style, setStyle] = useState<TranslationStyle>('general');
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [showStyleManager, setShowStyleManager] = useState(false);
  const [showDatabaseViewer, setShowDatabaseViewer] = useState(false);
  const [selectedCustomStyle, setSelectedCustomStyle] = useState<CustomTranslationStyle | null>(null);
  const [customStyles, setCustomStyles] = useState<CustomTranslationStyle[]>([]);
  const [mode, setMode] = useState<Mode>('translate');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
  ];

  const translationStyles = [
    { value: 'general' as const, label: 'General' },
    { value: 'financial' as const, label: 'Financial' },
    { value: 'technical' as const, label: 'Technical' },
    { value: 'legal' as const, label: 'Legal' },
    { value: 'casual' as const, label: 'Casual' },
    { value: 'academic' as const, label: 'Academic' },
  ];

  const improvementStyles = [
    { value: 'general' as const, label: 'General Improvement' },
    { value: 'academic' as const, label: 'Academic' },
    { value: 'business' as const, label: 'Business' },
    { value: 'casual' as const, label: 'Casual' },
    { value: 'creative' as const, label: 'Creative' },
  ];
  
  // Load custom styles on component mount
  useEffect(() => {
    const loadCustomStyles = () => {
      const styles = TranslationStyleDatabase.getStylesByLanguagePair(sourceLanguage, targetLanguage);
      setCustomStyles(styles);
    };
    
    loadCustomStyles();
  }, [sourceLanguage, targetLanguage]);

  const currentStyles = mode === 'translate' ? translationStyles : improvementStyles;
  const availableCustomStyles = customStyles.filter(style => 
    style.sourceLanguage === sourceLanguage && 
    style.targetLanguage === targetLanguage
  );

  const getTextStats = (text: string) => {
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    return {
      words,
      characters: text.length
    };
  };

  const inputStats = getTextStats(inputText);
  const outputStats = getTextStats(outputText);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadedFile({
        id: `file-${Date.now()}`,
        name: file.name,
        type: 'file',
        size: file.size,
        content,
        language: '',
        date: new Date().toISOString(),
        path: file.name,
        lastModified: file.lastModified,
        metadata: {
          lastModified: file.lastModified,
          mimeType: file.type,
          extension: file.name.split('.').pop() || '',
          size: file.size
        }
      });
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setInputText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearOutput = () => {
    setOutputText('');
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [error, setError] = useState<string | null>(null);

  const processText = async () => {
    if (!inputText.trim()) {
      setError(`Please enter some text to ${mode === 'translate' ? 'translate' : 'improve'}`);
      return;
    }
    
    setIsTranslating(true);
    setError(null);
    
    try {
      // Mock processing - replace with actual API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            // Simulate a potential error (e.g., API failure)
            if (Math.random() < 0.1) {
              throw new Error(`Service temporarily unavailable. Please try again later.`);
            }
            resolve(null);
          } catch (err) {
            reject(err);
          }
        }, 1000);
      });
      
      let processedText = inputText;
      
      // Apply custom style if selected
      if (selectedCustomStyle && mode === 'translate') {
        processedText = applyCustomStyle(inputText, selectedCustomStyle);
      }
      
      // Simulate different processing based on mode
      if (mode === 'translate') {
        // In a real app, this would be the translation API response
        setOutputText(processedText);
      } else {
        // For text improvement, just return the input text (in a real app, this would be the improved text)
        // The style would be applied in the actual API call
        setOutputText(processedText);
      }
    } catch (error) {
      console.error('Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 
        `Failed to ${mode === 'translate' ? 'translate' : 'improve'} text`;
      setError(errorMessage);
      setOutputText('');
    } finally {
      setIsTranslating(false);
    }
  };

  // Apply custom translation style to text
  const applyCustomStyle = (text: string, customStyle: CustomTranslationStyle): string => {
    let processedText = text;
    
    // Apply translation pairs from custom style
    customStyle.translationPairs.forEach(pair => {
      // Simple replacement - in a real app, this would be more sophisticated
      const regex = new RegExp(pair.sourceText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      processedText = processedText.replace(regex, pair.targetText);
    });
    
    return processedText;
  };

  const handleStyleCreated = (newStyle: CustomTranslationStyle) => {
    setCustomStyles(prev => [...prev, newStyle]);
    setSelectedCustomStyle(newStyle);
    setShowStyleManager(false);
  };

  const handleStyleUpdated = (updatedStyle: CustomTranslationStyle) => {
    setCustomStyles(prev => prev.map(style => 
      style.id === updatedStyle.id ? updatedStyle : style
    ));
    if (selectedCustomStyle?.id === updatedStyle.id) {
      setSelectedCustomStyle(updatedStyle);
    }
  };


  const renderContent = () => {
    if (activeTab === 'analyze') {
      return <FileAnalysis />;
    }

    if (activeTab === 'styles') {
      return (
        <StylesTab 
          currentLanguagePair={{ source: sourceLanguage, target: targetLanguage }}
          onStyleSelected={setSelectedCustomStyle}
        />
      );
    }

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center">
            <Languages className="mr-2" /> AI {mode === 'translate' ? 'Translator' : 'Text Improver'}
          </h1>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {mode === 'translate' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Language</label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Language</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages
                  .filter((lang) => lang.code !== 'auto')
                  .map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
              </select>
            </div>
          </>
        ) : (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages
                  .filter((lang) => lang.code !== 'auto')
                  .map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Improvement Type</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as TranslationStyle)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {improvementStyles.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {mode === 'translate' && (
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Translation Style</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  onClick={() => setActiveTab('styles')}
                >
                  <Database className="w-3 h-3 mr-1" />
                  Manage Styles
                </button>
                {selectedCustomStyle && (
                  <button
                    type="button"
                    className="text-xs text-green-600 hover:text-green-800 flex items-center"
                    onClick={() => setShowDatabaseViewer(true)}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    View Database
                  </button>
                )}
              </div>
            </div>
            
            {/* Built-in styles */}
            <select
              value={selectedCustomStyle ? 'custom' : style}
              onChange={(e) => {
                if (e.target.value === 'custom') return;
                setStyle(e.target.value as TranslationStyle);
                setSelectedCustomStyle(null);
              }}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
            >
              {translationStyles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Custom styles */}
            {availableCustomStyles.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Custom Styles</label>
                <select
                  value={selectedCustomStyle?.id || ''}
                  onChange={(e) => {
                    const customStyle = availableCustomStyles.find(s => s.id === e.target.value);
                    setSelectedCustomStyle(customStyle || null);
                    if (customStyle) {
                      setStyle('general'); // Reset built-in style when using custom
                    }
                  }}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select custom style...</option>
                  {availableCustomStyles.map((customStyle) => (
                    <option key={customStyle.id} value={customStyle.id}>
                      {customStyle.name} ({customStyle.statistics.totalPairs} pairs)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedCustomStyle && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-800">
                    Using: {selectedCustomStyle.name}
                  </span>
                  <button
                    onClick={() => setSelectedCustomStyle(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-green-700 mt-1">
                  {selectedCustomStyle.statistics.totalPairs} translation pairs • 
                  {Math.round(selectedCustomStyle.statistics.accuracy * 100)}% accuracy
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Type size={16} className="mr-1 text-gray-500" />
              <span className="text-sm font-medium">
                {mode === 'translate' ? 'Original Text' : 'Text to Improve'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {uploadedFile ? (
                <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  <FileText size={12} className="mr-1" />
                  {uploadedFile.name}
                  <button onClick={removeFile} className="ml-1 text-gray-400 hover:text-gray-600">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded cursor-pointer">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.pdf,.doc,.docx,.md"
                    className="hidden"
                  />
                  <Upload size={12} className="mr-1" /> Upload File
                </label>
              )}
            </div>
          </div>
          <div className="relative flex-1 min-h-0">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === 'translate' ? 'Enter text to translate or upload a file' : 'Enter text to improve or upload a file'}
              className="w-full h-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ minHeight: '200px' }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {inputStats.words} words • {inputStats.characters} chars
            </div>
          </div>
        </div>

        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Languages size={16} className="mr-1 text-gray-500" />
              <span className="text-sm font-medium">
                {mode === 'translate' ? 'Translation' : 'Improved Text'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearOutput}
                disabled={!outputText}
                className="text-xs flex items-center text-gray-500 hover:text-red-500 disabled:opacity-50"
                title="Clear output"
              >
                <X size={14} className="mr-0.5" /> Clear
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!outputText}
                className="text-xs flex items-center text-gray-500 hover:text-blue-500 disabled:opacity-50"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={14} className="mr-0.5 text-green-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-0.5" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="relative flex-1 min-h-0">
            <div className="w-full h-full p-3 border rounded-lg bg-gray-50 overflow-auto" style={{ minHeight: '200px' }}>
              {outputText || <span className="text-gray-400">{mode === 'translate' ? 'Translation will appear here' : 'Improved text will appear here'}</span>}
            </div>
            {outputText && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {outputStats.words} words • {outputStats.characters} chars
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
      <div className="flex justify-end mt-4">
        <button
          onClick={processText}
          disabled={!inputText.trim() || isTranslating}
          className={`px-6 py-2 rounded-lg font-medium ${
            !inputText.trim() || isTranslating
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isTranslating 
            ? mode === 'translate' ? 'Processing...' : 'Improving...'
            : mode === 'translate' ? 'Translate' : 'Improve Text'
          }
        </button>
      </div>
      </>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <TranslatorTabs 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          // Update mode based on the selected tab
          if (tab === 'improve') {
            setMode('improve');
            setStyle('general'); // Reset to default style when switching to improve
          } else if (tab === 'translate') {
            setMode('translate');
            setStyle('general'); // Reset to default style when switching to translate
          }
        }} 
      />
      {renderContent()}
      
      {/* Style Manager Modal */}
      <StyleManager
        isOpen={showStyleManager}
        onClose={() => setShowStyleManager(false)}
        onStyleCreated={handleStyleCreated}
        currentLanguagePair={{ source: sourceLanguage, target: targetLanguage }}
      />
      
      {/* Database Viewer Modal */}
      {selectedCustomStyle && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showDatabaseViewer ? '' : 'hidden'}`}>
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedCustomStyle.name} - Database
                </h2>
                <button
                  onClick={() => setShowDatabaseViewer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <DatabaseViewer
                style={selectedCustomStyle}
                onStyleUpdated={handleStyleUpdated}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITranslator;
