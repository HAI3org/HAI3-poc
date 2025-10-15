import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  Filter,
  SortAsc,
  SortDesc,
  Database,
  Languages,
  Star,
  History,
  CheckCircle
} from 'lucide-react';
import { 
  CustomTranslationStyle, 
  TranslationPair 
} from '../types/translationStyle';
import { TranslationStyleDatabase } from '../utils/translationStyleProcessor';
import ConflictResolver from './ConflictResolver';

interface DatabaseViewerProps {
  style: CustomTranslationStyle;
  onStyleUpdated: (updatedStyle: CustomTranslationStyle) => void;
}

type ViewMode = 'pairs' | 'conflicts';
type SortField = 'sourceText' | 'targetText' | 'confidence' | 'frequency';
type SortDirection = 'asc' | 'desc';

const DatabaseViewer: React.FC<DatabaseViewerProps> = ({
  style,
  onStyleUpdated
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('pairs');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('sourceText');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingPair, setEditingPair] = useState<TranslationPair | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showRefinementModal, setShowRefinementModal] = useState(false);
  const [refinementPair, setRefinementPair] = useState<TranslationPair | null>(null);
  const [refinementReason, setRefinementReason] = useState('');
  const [newPair, setNewPair] = useState<Partial<TranslationPair>>({
    sourceText: '',
    targetText: '',
    sourceLanguage: style.sourceLanguage,
    targetLanguage: style.targetLanguage,
    confidence: 1.0,
    frequency: 1
  });

  const filteredAndSortedPairs = useMemo(() => {
    let filtered = style.translationPairs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pair => 
        pair.sourceText.toLowerCase().includes(query) ||
        pair.targetText.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'sourceText':
          aValue = a.sourceText.toLowerCase();
          bValue = b.sourceText.toLowerCase();
          break;
        case 'targetText':
          aValue = a.targetText.toLowerCase();
          bValue = b.targetText.toLowerCase();
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'frequency':
          aValue = a.frequency;
          bValue = b.frequency;
          break;
        default:
          aValue = a.sourceText.toLowerCase();
          bValue = b.sourceText.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [style.translationPairs, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditPair = (pair: TranslationPair) => {
    setEditingPair({ ...pair });
    setIsAddingNew(false);
  };

  const handleSavePair = () => {
    if (!editingPair) return;

    const updatedPairs = style.translationPairs.map(pair =>
      pair.id === editingPair.id ? { ...editingPair, updatedAt: new Date().toISOString() } : pair
    );

    const updatedStyle: CustomTranslationStyle = {
      ...style,
      translationPairs: updatedPairs,
      updatedAt: new Date().toISOString()
    };

    TranslationStyleDatabase.saveStyle(updatedStyle);
    onStyleUpdated(updatedStyle);
    setEditingPair(null);
  };

  const handleRefinePair = (pair: TranslationPair) => {
    setRefinementPair(pair);
    setRefinementReason('');
    setShowRefinementModal(true);
  };

  const handleSaveRefinement = () => {
    if (!refinementPair || !refinementReason.trim()) return;

    const refinementRecord = {
      id: `refinement-${Date.now()}`,
      originalText: refinementPair.targetText,
      refinedText: refinementPair.targetText, // This would be the new refined text
      reason: refinementReason,
      refinedAt: new Date().toISOString()
    };

    const updatedPair = {
      ...refinementPair,
      isRefined: true,
      refinementHistory: [...(refinementPair.refinementHistory || []), refinementRecord],
      updatedAt: new Date().toISOString()
    };

    const updatedPairs = style.translationPairs.map(pair =>
      pair.id === refinementPair.id ? updatedPair : pair
    );

    const refinedCount = updatedPairs.filter(p => p.isRefined).length;
    const updatedStatistics = {
      ...style.statistics,
      refinedPairs: refinedCount
    };

    const updatedStyle: CustomTranslationStyle = {
      ...style,
      translationPairs: updatedPairs,
      statistics: updatedStatistics,
      updatedAt: new Date().toISOString()
    };

    TranslationStyleDatabase.saveStyle(updatedStyle);
    onStyleUpdated(updatedStyle);
    setShowRefinementModal(false);
    setRefinementPair(null);
  };

  const handleDeletePair = (pairId: string) => {
    if (!confirm('Are you sure you want to delete this translation pair?')) return;

    const updatedPairs = style.translationPairs.filter(pair => pair.id !== pairId);
    const updatedStatistics = {
      ...style.statistics,
      totalPairs: updatedPairs.length
    };

    const updatedStyle: CustomTranslationStyle = {
      ...style,
      translationPairs: updatedPairs,
      statistics: updatedStatistics,
      updatedAt: new Date().toISOString()
    };

    TranslationStyleDatabase.saveStyle(updatedStyle);
    onStyleUpdated(updatedStyle);
  };

  const handleAddNewPair = () => {
    if (!newPair.sourceText?.trim() || !newPair.targetText?.trim()) {
      alert('Please enter both source and target text');
      return;
    }

    const pair: TranslationPair = {
      id: `pair-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceText: newPair.sourceText!,
      targetText: newPair.targetText!,
      sourceLanguage: newPair.sourceLanguage!,
      targetLanguage: newPair.targetLanguage!,
      confidence: newPair.confidence || 1.0,
      frequency: newPair.frequency || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedPairs = [...style.translationPairs, pair];
    const updatedStatistics = {
      ...style.statistics,
      totalPairs: updatedPairs.length
    };

    const updatedStyle: CustomTranslationStyle = {
      ...style,
      translationPairs: updatedPairs,
      statistics: updatedStatistics,
      updatedAt: new Date().toISOString()
    };

    TranslationStyleDatabase.saveStyle(updatedStyle);
    onStyleUpdated(updatedStyle);
    setIsAddingNew(false);
    setNewPair({
      sourceText: '',
      targetText: '',
      sourceLanguage: style.sourceLanguage,
      targetLanguage: style.targetLanguage,
      confidence: 1.0,
      frequency: 1
    });
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <SortAsc className="w-4 h-4 ml-1" /> : 
      <SortDesc className="w-4 h-4 ml-1" />;
  };

  const renderPairsView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search translations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            {filteredAndSortedPairs.length} of {style.translationPairs.length} pairs
          </div>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Pair
        </button>
      </div>

      {isAddingNew && (
        <div className="p-4 border rounded-lg bg-blue-50">
          <h4 className="font-medium mb-3">Add New Translation Pair</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Text ({style.sourceLanguage})
              </label>
              <textarea
                value={newPair.sourceText}
                onChange={(e) => setNewPair(prev => ({ ...prev, sourceText: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Text ({style.targetLanguage})
              </label>
              <textarea
                value={newPair.targetText}
                onChange={(e) => setNewPair(prev => ({ ...prev, targetText: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1 text-gray-600 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNewPair}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div 
              className="col-span-3 flex items-center cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('sourceText')}
            >
              Source Text {renderSortIcon('sourceText')}
            </div>
            <div 
              className="col-span-3 flex items-center cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('targetText')}
            >
              Target Text {renderSortIcon('targetText')}
            </div>
            <div 
              className="col-span-2 flex items-center cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('confidence')}
            >
              Confidence {renderSortIcon('confidence')}
            </div>
            <div 
              className="col-span-1 flex items-center cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('frequency')}
            >
              Freq {renderSortIcon('frequency')}
            </div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Actions</div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredAndSortedPairs.map(pair => (
            <div key={pair.id} className="px-4 py-3 border-b hover:bg-gray-50">
              {editingPair?.id === pair.id ? (
                <div className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-3">
                    <textarea
                      value={editingPair.sourceText}
                      onChange={(e) => setEditingPair(prev => prev ? { ...prev, sourceText: e.target.value } : null)}
                      className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  <div className="col-span-3">
                    <textarea
                      value={editingPair.targetText}
                      onChange={(e) => setEditingPair(prev => prev ? { ...prev, targetText: e.target.value } : null)}
                      className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={editingPair.confidence}
                      onChange={(e) => setEditingPair(prev => prev ? { ...prev, confidence: parseFloat(e.target.value) } : null)}
                      className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      min="1"
                      value={editingPair.frequency}
                      onChange={(e) => setEditingPair(prev => prev ? { ...prev, frequency: parseInt(e.target.value) } : null)}
                      className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1">
                    {editingPair.isRefined && (
                      <div title="Refined">
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 flex space-x-1">
                    <button
                      onClick={handleSavePair}
                      className="p-1 text-green-600 hover:text-green-800"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingPair(null)}
                      className="p-1 text-gray-600 hover:text-gray-800"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{pair.sourceText}</span>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{pair.targetText}</span>
                      {pair.isRefined && (
                        <div title="Refined translation">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-sm">{Math.round(pair.confidence * 100)}%</div>
                  <div className="col-span-1 text-sm">{pair.frequency}</div>
                  <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                      {pair.isRefined ? (
                        <div title="Refined">
                          <Star className="w-4 h-4 text-yellow-500" />
                        </div>
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 flex space-x-1">
                    <button
                      onClick={() => handleEditPair(pair)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRefinePair(pair)}
                      className="p-1 text-yellow-600 hover:text-yellow-800"
                      title="Refine Translation"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    {pair.refinementHistory && pair.refinementHistory.length > 0 && (
                      <button
                        className="p-1 text-purple-600 hover:text-purple-800"
                        title="View Refinement History"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePair(pair.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {filteredAndSortedPairs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No translation pairs found</p>
          {searchQuery && (
            <p className="text-sm">Try adjusting your search query</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Translation Database
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('pairs')}
            className={`px-3 py-1 rounded-lg text-sm ${
              viewMode === 'pairs' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Translation Pairs ({style.translationPairs.length})
          </button>
          <button
            onClick={() => setViewMode('conflicts')}
            className={`px-3 py-1 rounded-lg text-sm ${
              viewMode === 'conflicts' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Conflicts ({style.conflicts.length})
          </button>
        </div>
      </div>

      {viewMode === 'pairs' ? renderPairsView() : (
        <ConflictResolver 
          style={style} 
          onStyleUpdated={onStyleUpdated} 
        />
      )}

      {/* Refinement Modal */}
      {showRefinementModal && refinementPair && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Refine Translation
                </h3>
                <button
                  onClick={() => setShowRefinementModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Text
                  </label>
                  <div className="p-3 bg-gray-50 border rounded-lg text-sm">
                    {refinementPair.sourceText}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Translation
                  </label>
                  <div className="p-3 bg-gray-50 border rounded-lg text-sm">
                    {refinementPair.targetText}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refinement Reason *
                  </label>
                  <textarea
                    value={refinementReason}
                    onChange={(e) => setRefinementReason(e.target.value)}
                    placeholder="Explain why this translation needs refinement (e.g., 'More accurate terminology', 'Better context match', etc.)"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {refinementPair.refinementHistory && refinementPair.refinementHistory.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Refinements
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {refinementPair.refinementHistory.map((record, index) => (
                        <div key={record.id} className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                          <div className="font-medium">{record.reason}</div>
                          <div className="text-gray-600 mt-1">
                            {new Date(record.refinedAt).toLocaleDateString()} - 
                            "{record.originalText}" → "{record.refinedText}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRefinementModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRefinement}
                  disabled={!refinementReason.trim()}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Mark as Refined
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseViewer;
