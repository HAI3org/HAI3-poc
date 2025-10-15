import React, { useState, useRef } from 'react';
import {
  Plus,
  Upload,
  FileText,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  Settings,
  Database,
  Languages,
  Folder,
  ArrowLeft
} from 'lucide-react';
import {
  CustomTranslationStyle,
  StyleCreationData,
  TranslationConflict
} from '../types/translationStyle';
import {
  TranslationStyleProcessor,
  TranslationStyleDatabase
} from '../utils/translationStyleProcessor';

interface StyleManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onStyleCreated: (style: CustomTranslationStyle) => void;
  currentLanguagePair: { source: string; target: string };
}

const StyleManager: React.FC<StyleManagerProps> = ({
  isOpen,
  onClose,
  onStyleCreated,
  currentLanguagePair
}) => {
  const [step, setStep] = useState<'list' | 'create' | 'view'>('list');
  const [selectedStyle, setSelectedStyle] = useState<CustomTranslationStyle | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [creationData, setCreationData] = useState<StyleCreationData>({
    name: '',
    description: '',
    sourceLanguage: currentLanguagePair.source,
    targetLanguage: currentLanguagePair.target,
    sourceFiles: [],
    targetFiles: []
  });

  const sourceFileInputRef = useRef<HTMLInputElement>(null);
  const targetFileInputRef = useRef<HTMLInputElement>(null);
  const sourceFolderInputRef = useRef<HTMLInputElement>(null);
  const targetFolderInputRef = useRef<HTMLInputElement>(null);
  const [existingStyles, setExistingStyles] = useState<CustomTranslationStyle[]>(
    TranslationStyleDatabase.getAllStyles()
  );

  if (!isOpen) return null;

  const handleSourceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCreationData(prev => ({ ...prev, sourceFiles: [...prev.sourceFiles, ...files] }));
  };

  const handleTargetFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCreationData(prev => ({ ...prev, targetFiles: [...prev.targetFiles, ...files] }));
  };

  const handleSourceFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCreationData(prev => ({ ...prev, sourceFiles: [...prev.sourceFiles, ...files] }));
  };

  const handleTargetFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCreationData(prev => ({ ...prev, targetFiles: [...prev.targetFiles, ...files] }));
  };

  const removeSourceFile = (index: number) => {
    setCreationData(prev => ({
      ...prev,
      sourceFiles: prev.sourceFiles.filter((_, i) => i !== index)
    }));
  };

  const removeTargetFile = (index: number) => {
    setCreationData(prev => ({
      ...prev,
      targetFiles: prev.targetFiles.filter((_, i) => i !== index)
    }));
  };

  const handleCreateStyle = async () => {
    if (!creationData.name.trim()) {
      alert('Please enter a style name');
      return;
    }

    if (creationData.sourceFiles.length === 0 || creationData.targetFiles.length === 0) {
      alert('Please upload both source and target files');
      return;
    }

    setIsCreating(true);
    try {
      const newStyle = await TranslationStyleProcessor.processFiles(creationData);
      TranslationStyleDatabase.saveStyle(newStyle);
      setExistingStyles(TranslationStyleDatabase.getAllStyles());
      onStyleCreated(newStyle);
      setStep('view');
      setSelectedStyle(newStyle);
    } catch (error) {
      console.error('Error creating style:', error);
      alert('Failed to create translation style. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const renderStyleList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Translation Styles
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStep('create')}
            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create New Style
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {existingStyles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No custom translation styles yet</p>
            <p className="text-sm">Create your first style to get started</p>
          </div>
        ) : (
          existingStyles.map(style => (
            <div
              key={style.id}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSelectedStyle(style);
                setStep('view');
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{style.name}</h4>
                  <p className="text-sm text-gray-600">
                    {style.sourceLanguage} → {style.targetLanguage}
                  </p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{style.statistics.totalPairs} pairs</span>
                    <span>{style.statistics.totalConflicts} conflicts</span>
                    <span>{Math.round(style.statistics.accuracy * 100)}% accuracy</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {style.statistics.totalConflicts > 0 && (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                  {style.isActive && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCreateForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create Translation Style
        </h3>
        <button
          onClick={() => {
            setStep('list');
            onClose();
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Style Name *
          </label>
          <input
            type="text"
            value={creationData.name}
            onChange={(e) => setCreationData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Technical Documentation Style"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={creationData.description}
            onChange={(e) => setCreationData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the translation style and its use cases"
            rows={3}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Language
            </label>
            <select
              value={creationData.sourceLanguage}
              onChange={(e) => setCreationData(prev => ({ ...prev, sourceLanguage: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Language
            </label>
            <select
              value={creationData.targetLanguage}
              onChange={(e) => setCreationData(prev => ({ ...prev, targetLanguage: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Files ({creationData.sourceLanguage}) *
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => sourceFileInputRef.current?.click()}
                  className="flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </button>
                <button
                  onClick={() => sourceFolderInputRef.current?.click()}
                  className="flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 flex-1"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  Add Folder
                </button>
              </div>
              <input
                ref={sourceFileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.doc,.docx"
                onChange={handleSourceFileUpload}
                className="hidden"
              />
              <input
                ref={sourceFolderInputRef}
                type="file"
                multiple
                {...({ webkitdirectory: "" } as any)}
                {...({ directory: "" } as any)}
                onChange={handleSourceFolderUpload}
                className="hidden"
              />
              {creationData.sourceFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeSourceFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Files ({creationData.targetLanguage}) *
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => targetFileInputRef.current?.click()}
                  className="flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </button>
                <button
                  onClick={() => targetFolderInputRef.current?.click()}
                  className="flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 flex-1"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  Add Folder
                </button>
              </div>
              <input
                ref={targetFileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.doc,.docx"
                onChange={handleTargetFileUpload}
                className="hidden"
              />
              <input
                ref={targetFolderInputRef}
                type="file"
                multiple
                {...({ webkitdirectory: "" } as any)}
                {...({ directory: "" } as any)}
                onChange={handleTargetFolderUpload}
                className="hidden"
              />
              {creationData.targetFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeTargetFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={() => setStep('list')}
            className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateStyle}
            disabled={isCreating || !creationData.name.trim() || creationData.sourceFiles.length === 0 || creationData.targetFiles.length === 0}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Style
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStyleView = () => {
    if (!selectedStyle) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            {selectedStyle.name}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStep('list')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Statistics</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Translation Pairs:</span>
                <span>{selectedStyle.statistics.totalPairs}</span>
              </div>
              <div className="flex justify-between">
                <span>Conflicts:</span>
                <span className={selectedStyle.statistics.totalConflicts > 0 ? 'text-yellow-600' : 'text-green-600'}>
                  {selectedStyle.statistics.totalConflicts}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span>{Math.round(selectedStyle.statistics.accuracy * 100)}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Languages:</span>
                <span>{selectedStyle.sourceLanguage} → {selectedStyle.targetLanguage}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(selectedStyle.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={selectedStyle.isActive ? 'text-green-600' : 'text-gray-600'}>
                  {selectedStyle.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {selectedStyle.description && (
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-gray-600">{selectedStyle.description}</p>
          </div>
        )}

        {selectedStyle.conflicts.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
              Translation Conflicts ({selectedStyle.conflicts.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedStyle.conflicts.slice(0, 5).map(conflict => (
                <div key={conflict.id} className="p-3 border rounded-lg bg-yellow-50">
                  <div className="font-medium text-sm mb-1">"{conflict.sourceText}"</div>
                  <div className="space-y-1">
                    {conflict.translations.map((translation, index) => (
                      <div key={index} className="text-xs text-gray-600 flex justify-between">
                        <span>"{translation.targetText}"</span>
                        <span>{translation.frequency}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {selectedStyle.conflicts.length > 5 && (
                <div className="text-center text-sm text-gray-500">
                  ... and {selectedStyle.conflicts.length - 5} more conflicts
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          {step === 'list' && renderStyleList()}
          {step === 'create' && renderCreateForm()}
          {step === 'view' && renderStyleView()}
        </div>
      </div>
    </div>
  );
};

export default StyleManager;
