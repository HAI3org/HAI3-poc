// Translation Style Database Types

export interface TranslationPair {
  id: string;
  sourceText: string;
  targetText: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
  confidence: number; // 0-1 score
  frequency: number; // How often this translation appears
  sourceFile?: string;
  targetFile?: string;
  createdAt: string;
  updatedAt: string;
  isRefined?: boolean; // Indicates if this pair has been manually refined
  refinementHistory?: RefinementRecord[];
}

export interface RefinementRecord {
  id: string;
  originalText: string;
  refinedText: string;
  reason: string;
  refinedAt: string;
  refinedBy?: string;
}

export interface TranslationConflict {
  id: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translations: Array<{
    targetText: string;
    confidence: number;
    frequency: number;
    sourceFiles: string[];
    targetFiles: string[];
  }>;
  resolvedTranslation?: string;
  isResolved: boolean;
}

export interface CustomTranslationStyle {
  id: string;
  name: string;
  description?: string;
  sourceLanguage: string;
  targetLanguage: string;
  translationPairs: TranslationPair[];
  conflicts: TranslationConflict[];
  statistics: {
    totalPairs: number;
    totalConflicts: number;
    resolvedConflicts: number;
    refinedPairs: number;
    accuracy: number;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface StyleCreationData {
  name: string;
  description?: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceFiles: File[];
  targetFiles: File[];
}

export interface LanguagePair {
  source: string;
  target: string;
}

export interface PhraseAlignment {
  sourcePhrase: string;
  targetPhrase: string;
  confidence: number;
  context: string;
}

export interface FileProcessingResult {
  fileName: string;
  language: string;
  phrases: string[];
  sentences: string[];
  words: string[];
  processingTime: number;
  success: boolean;
  error?: string;
}

export interface StyleAnalysisResult {
  totalPairs: number;
  conflicts: TranslationConflict[];
  coverage: number;
  quality: number;
  recommendations: string[];
}
