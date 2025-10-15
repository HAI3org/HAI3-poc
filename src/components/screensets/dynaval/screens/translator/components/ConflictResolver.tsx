import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Languages
} from 'lucide-react';
import { TranslationConflict, CustomTranslationStyle } from '../types/translationStyle';
import { TranslationStyleDatabase } from '../utils/translationStyleProcessor';

interface ConflictResolverProps {
  style: CustomTranslationStyle;
  onStyleUpdated: (updatedStyle: CustomTranslationStyle) => void;
}

const ConflictResolver: React.FC<ConflictResolverProps> = ({
  style,
  onStyleUpdated
}) => {
  const [expandedConflicts, setExpandedConflicts] = useState<Set<string>>(new Set());
  const [resolvingConflicts, setResolvingConflicts] = useState<Set<string>>(new Set());

  const toggleConflictExpansion = (conflictId: string) => {
    const newExpanded = new Set(expandedConflicts);
    if (newExpanded.has(conflictId)) {
      newExpanded.delete(conflictId);
    } else {
      newExpanded.add(conflictId);
    }
    setExpandedConflicts(newExpanded);
  };

  const resolveConflict = (conflictId: string, selectedTranslation: string) => {
    setResolvingConflicts(prev => new Set(prev).add(conflictId));
    
    // Update the conflict in the style
    const updatedConflicts = style.conflicts.map(conflict => {
      if (conflict.id === conflictId) {
        return {
          ...conflict,
          resolvedTranslation: selectedTranslation,
          isResolved: true
        };
      }
      return conflict;
    });

    // Update statistics
    const resolvedCount = updatedConflicts.filter(c => c.isResolved).length;
    const updatedStatistics = {
      ...style.statistics,
      resolvedConflicts: resolvedCount,
      accuracy: style.statistics.totalPairs > 0 
        ? (style.statistics.totalPairs - style.statistics.totalConflicts + resolvedCount) / style.statistics.totalPairs 
        : 0
    };

    const updatedStyle: CustomTranslationStyle = {
      ...style,
      conflicts: updatedConflicts,
      statistics: updatedStatistics,
      updatedAt: new Date().toISOString()
    };

    // Save to database
    TranslationStyleDatabase.saveStyle(updatedStyle);
    onStyleUpdated(updatedStyle);
    
    setTimeout(() => {
      setResolvingConflicts(prev => {
        const newSet = new Set(prev);
        newSet.delete(conflictId);
        return newSet;
      });
    }, 500);
  };

  const unresolveConflict = (conflictId: string) => {
    const updatedConflicts = style.conflicts.map(conflict => {
      if (conflict.id === conflictId) {
        return {
          ...conflict,
          resolvedTranslation: undefined,
          isResolved: false
        };
      }
      return conflict;
    });

    const resolvedCount = updatedConflicts.filter(c => c.isResolved).length;
    const updatedStatistics = {
      ...style.statistics,
      resolvedConflicts: resolvedCount,
      accuracy: style.statistics.totalPairs > 0 
        ? (style.statistics.totalPairs - style.statistics.totalConflicts + resolvedCount) / style.statistics.totalPairs 
        : 0
    };

    const updatedStyle: CustomTranslationStyle = {
      ...style,
      conflicts: updatedConflicts,
      statistics: updatedStatistics,
      updatedAt: new Date().toISOString()
    };

    TranslationStyleDatabase.saveStyle(updatedStyle);
    onStyleUpdated(updatedStyle);
  };

  if (style.conflicts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Check className="w-12 h-12 mx-auto mb-2 text-green-500" />
        <p className="font-medium">No conflicts found!</p>
        <p className="text-sm">All translations are consistent</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
          Translation Conflicts ({style.conflicts.length})
        </h3>
        <div className="text-sm text-gray-600">
          {style.statistics.resolvedConflicts} of {style.statistics.totalConflicts} resolved
        </div>
      </div>

      <div className="space-y-3">
        {style.conflicts.map(conflict => (
          <div
            key={conflict.id}
            className={`border rounded-lg ${
              conflict.isResolved 
                ? 'border-green-200 bg-green-50' 
                : 'border-yellow-200 bg-yellow-50'
            }`}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleConflictExpansion(conflict.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Languages className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {conflict.sourceLanguage} → {conflict.targetLanguage}
                    </span>
                    {conflict.isResolved && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="font-medium mb-1">
                    "{conflict.sourceText}"
                  </div>
                  <div className="text-sm text-gray-600">
                    {conflict.translations.length} different translations found
                    {conflict.isResolved && conflict.resolvedTranslation && (
                      <span className="ml-2 text-green-600">
                        → Resolved: "{conflict.resolvedTranslation}"
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {resolvingConflicts.has(conflict.id) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  )}
                  {expandedConflicts.has(conflict.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {expandedConflicts.has(conflict.id) && (
              <div className="px-4 pb-4 border-t border-gray-200">
                <div className="space-y-3 mt-3">
                  <h4 className="font-medium text-sm">Choose the correct translation:</h4>
                  
                  {conflict.translations.map((translation, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        conflict.resolvedTranslation === translation.targetText
                          ? 'border-green-500 bg-green-100'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      onClick={() => {
                        if (conflict.isResolved && conflict.resolvedTranslation === translation.targetText) {
                          unresolveConflict(conflict.id);
                        } else {
                          resolveConflict(conflict.id, translation.targetText);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">"{translation.targetText}"</div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div className="flex items-center space-x-4">
                              <span>Frequency: {translation.frequency}x</span>
                              <span>Confidence: {Math.round(translation.confidence * 100)}%</span>
                            </div>
                            {translation.sourceFiles.length > 0 && (
                              <div className="flex items-center mt-1">
                                <FileText className="w-3 h-3 mr-1" />
                                <span className="text-xs">
                                  Found in: {translation.sourceFiles.slice(0, 2).join(', ')}
                                  {translation.sourceFiles.length > 2 && ` +${translation.sourceFiles.length - 2} more`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          {conflict.resolvedTranslation === translation.targetText ? (
                            <div className="flex items-center text-green-600">
                              <Check className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {conflict.isResolved && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          unresolveConflict(conflict.id);
                        }}
                        className="text-sm text-gray-600 hover:text-red-600 flex items-center"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Unresolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {style.statistics.totalConflicts > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Resolution Progress</h4>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(style.statistics.resolvedConflicts / style.statistics.totalConflicts) * 100}%`
              }}
            ></div>
          </div>
          <div className="text-sm text-blue-700 mt-2">
            {style.statistics.resolvedConflicts} of {style.statistics.totalConflicts} conflicts resolved
            ({Math.round((style.statistics.resolvedConflicts / style.statistics.totalConflicts) * 100)}%)
          </div>
        </div>
      )}
    </div>
  );
};

export default ConflictResolver;
