import { 
  TranslationPair, 
  TranslationConflict, 
  CustomTranslationStyle, 
  StyleCreationData,
  FileProcessingResult,
  PhraseAlignment,
  StyleAnalysisResult
} from '../types/translationStyle';

// Text processing utilities
export class TranslationStyleProcessor {
  
  // Process uploaded files to extract translation pairs
  static async processFiles(data: StyleCreationData): Promise<CustomTranslationStyle> {
    const sourceResults = await Promise.all(
      data.sourceFiles.map(file => this.processFile(file, data.sourceLanguage))
    );
    
    const targetResults = await Promise.all(
      data.targetFiles.map(file => this.processFile(file, data.targetLanguage))
    );

    // Align source and target content
    const alignments = this.alignTranslations(sourceResults, targetResults);
    
    // Create translation pairs
    const translationPairs = this.createTranslationPairs(alignments, data);
    
    // Detect conflicts
    const conflicts = this.detectConflicts(translationPairs);
    
    // Calculate statistics
    const statistics = this.calculateStatistics(translationPairs, conflicts);

    return {
      id: `style-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      description: data.description,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      translationPairs,
      conflicts,
      statistics,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
  }

  // Process individual file to extract text content
  private static async processFile(file: File, language: string): Promise<FileProcessingResult> {
    const startTime = Date.now();
    
    try {
      const content = await this.readFileContent(file);
      const sentences = this.extractSentences(content);
      const phrases = this.extractPhrases(content);
      const words = this.extractWords(content);

      return {
        fileName: file.name,
        language,
        phrases,
        sentences,
        words,
        processingTime: Date.now() - startTime,
        success: true
      };
    } catch (error) {
      return {
        fileName: file.name,
        language,
        phrases: [],
        sentences: [],
        words: [],
        processingTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Read file content based on file type
  private static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content || '');
      };
      
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      
      // Handle different file types
      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        // For other file types, try to read as text (basic support)
        reader.readAsText(file);
      }
    });
  }

  // Extract sentences from text
  private static extractSentences(text: string): string[] {
    // Simple sentence splitting - can be enhanced with more sophisticated NLP
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10) // Filter out very short fragments
      .slice(0, 1000); // Limit to prevent memory issues
  }

  // Extract phrases from text
  private static extractPhrases(text: string): string[] {
    const sentences = this.extractSentences(text);
    const phrases: string[] = [];
    
    sentences.forEach(sentence => {
      // Split by commas, semicolons, and other phrase delimiters
      const sentencePhrases = sentence
        .split(/[,;:()[\]{}]/)
        .map(p => p.trim())
        .filter(p => p.length > 5 && p.length < 200);
      
      phrases.push(...sentencePhrases);
    });
    
    return phrases.slice(0, 2000); // Limit phrases
  }

  // Extract words from text
  private static extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2)
      .slice(0, 5000); // Limit words
  }

  // Align source and target translations
  private static alignTranslations(
    sourceResults: FileProcessingResult[], 
    targetResults: FileProcessingResult[]
  ): PhraseAlignment[] {
    const alignments: PhraseAlignment[] = [];
    
    // Simple alignment based on position and similarity
    sourceResults.forEach(sourceResult => {
      if (!sourceResult.success) return;
      
      targetResults.forEach(targetResult => {
        if (!targetResult.success) return;
        
        // Align sentences by position (assuming parallel documents)
        const minLength = Math.min(sourceResult.sentences.length, targetResult.sentences.length);
        
        for (let i = 0; i < minLength; i++) {
          const sourcePhrase = sourceResult.sentences[i];
          const targetPhrase = targetResult.sentences[i];
          
          if (sourcePhrase && targetPhrase) {
            alignments.push({
              sourcePhrase,
              targetPhrase,
              confidence: this.calculateAlignmentConfidence(sourcePhrase, targetPhrase),
              context: `${sourceResult.fileName} -> ${targetResult.fileName}`
            });
          }
        }
      });
    });
    
    return alignments.filter(a => a.confidence > 0.3); // Filter low-confidence alignments
  }

  // Calculate alignment confidence score
  private static calculateAlignmentConfidence(source: string, target: string): number {
    // Simple heuristic based on length similarity and common patterns
    const lengthRatio = Math.min(source.length, target.length) / Math.max(source.length, target.length);
    const wordCountRatio = Math.min(source.split(' ').length, target.split(' ').length) / 
                          Math.max(source.split(' ').length, target.split(' ').length);
    
    return (lengthRatio + wordCountRatio) / 2;
  }

  // Create translation pairs from alignments
  private static createTranslationPairs(
    alignments: PhraseAlignment[], 
    data: StyleCreationData
  ): TranslationPair[] {
    return alignments.map((alignment, index) => ({
      id: `pair-${Date.now()}-${index}`,
      sourceText: alignment.sourcePhrase,
      targetText: alignment.targetPhrase,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      context: alignment.context,
      confidence: alignment.confidence,
      frequency: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  // Detect translation conflicts
  private static detectConflicts(pairs: TranslationPair[]): TranslationConflict[] {
    const conflicts: TranslationConflict[] = [];
    const sourceTextMap = new Map<string, TranslationPair[]>();
    
    // Group pairs by source text
    pairs.forEach(pair => {
      const normalizedSource = pair.sourceText.toLowerCase().trim();
      if (!sourceTextMap.has(normalizedSource)) {
        sourceTextMap.set(normalizedSource, []);
      }
      sourceTextMap.get(normalizedSource)!.push(pair);
    });
    
    // Find conflicts (same source with different targets)
    sourceTextMap.forEach((pairGroup, sourceText) => {
      if (pairGroup.length > 1) {
        const uniqueTargets = new Map<string, TranslationPair[]>();
        
        pairGroup.forEach(pair => {
          const normalizedTarget = pair.targetText.toLowerCase().trim();
          if (!uniqueTargets.has(normalizedTarget)) {
            uniqueTargets.set(normalizedTarget, []);
          }
          uniqueTargets.get(normalizedTarget)!.push(pair);
        });
        
        if (uniqueTargets.size > 1) {
          const translations = Array.from(uniqueTargets.entries()).map(([target, pairs]) => ({
            targetText: pairs[0].targetText,
            confidence: pairs.reduce((sum, p) => sum + p.confidence, 0) / pairs.length,
            frequency: pairs.length,
            sourceFiles: pairs.map(p => p.sourceFile || '').filter(Boolean),
            targetFiles: pairs.map(p => p.targetFile || '').filter(Boolean)
          }));
          
          conflicts.push({
            id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sourceText: pairGroup[0].sourceText,
            sourceLanguage: pairGroup[0].sourceLanguage,
            targetLanguage: pairGroup[0].targetLanguage,
            translations,
            isResolved: false
          });
        }
      }
    });
    
    return conflicts;
  }

  // Calculate style statistics
  private static calculateStatistics(
    pairs: TranslationPair[], 
    conflicts: TranslationConflict[]
  ) {
    const totalPairs = pairs.length;
    const totalConflicts = conflicts.length;
    const resolvedConflicts = conflicts.filter(c => c.isResolved).length;
    const refinedPairs = pairs.filter(p => p.isRefined).length;
    const accuracy = totalPairs > 0 ? (totalPairs - totalConflicts + resolvedConflicts) / totalPairs : 0;
    
    return {
      totalPairs,
      totalConflicts,
      resolvedConflicts,
      refinedPairs,
      accuracy
    };
  }

  // Analyze existing style for quality and coverage
  static analyzeStyle(style: CustomTranslationStyle): StyleAnalysisResult {
    const recommendations: string[] = [];
    
    // Check coverage
    const coverage = style.statistics.totalPairs / 1000; // Normalize to 0-1
    if (coverage < 0.3) {
      recommendations.push('Consider adding more translation pairs to improve coverage');
    }
    
    // Check quality
    const quality = style.statistics.accuracy;
    if (quality < 0.8) {
      recommendations.push('Resolve translation conflicts to improve quality');
    }
    
    // Check conflicts
    if (style.statistics.totalConflicts > style.statistics.totalPairs * 0.1) {
      recommendations.push('High number of conflicts detected - review and resolve them');
    }
    
    return {
      totalPairs: style.statistics.totalPairs,
      conflicts: style.conflicts,
      coverage: Math.min(coverage, 1),
      quality,
      recommendations
    };
  }
}

// Translation style database manager
export class TranslationStyleDatabase {
  private static readonly STORAGE_KEY = 'translation_styles';
  
  // Save style to local storage
  static saveStyle(style: CustomTranslationStyle): void {
    const styles = this.getAllStyles();
    const existingIndex = styles.findIndex(s => s.id === style.id);
    
    if (existingIndex >= 0) {
      styles[existingIndex] = { ...style, updatedAt: new Date().toISOString() };
    } else {
      styles.push(style);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(styles));
  }
  
  // Get all styles
  static getAllStyles(): CustomTranslationStyle[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading translation styles:', error);
      return [];
    }
  }
  
  // Get style by ID
  static getStyleById(id: string): CustomTranslationStyle | null {
    const styles = this.getAllStyles();
    return styles.find(s => s.id === id) || null;
  }
  
  // Delete style
  static deleteStyle(id: string): void {
    const styles = this.getAllStyles();
    const filtered = styles.filter(s => s.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
  
  // Update style
  static updateStyle(id: string, updates: Partial<CustomTranslationStyle>): void {
    const styles = this.getAllStyles();
    const index = styles.findIndex(s => s.id === id);
    
    if (index >= 0) {
      styles[index] = { 
        ...styles[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(styles));
    }
  }
  
  // Get styles by language pair
  static getStylesByLanguagePair(sourceLanguage: string, targetLanguage: string): CustomTranslationStyle[] {
    const styles = this.getAllStyles();
    return styles.filter(s => 
      s.sourceLanguage === sourceLanguage && 
      s.targetLanguage === targetLanguage &&
      s.isActive
    );
  }
}
