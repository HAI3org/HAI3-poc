import { FileInfo } from '../types';

// Mock language detection (replace with actual implementation)
export const detectLanguage = (text: string): string => {
  // This is a simplified example - in a real app, you'd use a proper language detection library
  const commonWords = {
    en: ['the', 'and', 'for', 'that', 'this'],
    es: ['el', 'la', 'de', 'que', 'y'],
    fr: ['le', 'la', 'et', 'à', 'les'],
  };

  const scores = Object.entries(commonWords).map(([lang, words]) => ({
    lang,
    score: words.filter(word => text.toLowerCase().includes(word)).length,
  }));

  const bestMatch = scores.reduce((best, current) =>
    current.score > best.score ? current : best, { lang: 'en', score: 0 });

  return bestMatch.lang;
};

// Extract text content from different file types (simplified)
export const extractTextFromFile = async (file: File | FileInfo): Promise<string> => {
  // If the file is a File object (from input element)
  if (file instanceof File) {
    // For text files
    if (file.type.startsWith('text/')) {
      return await file.text();
    }

    // For PDF files (placeholder - in a real app, use a PDF parsing library)
    if (file.name.endsWith('.pdf')) {
      return '[PDF content extraction not implemented]';
    }

    // For Word documents (placeholder - in a real app, use a docx parsing library)
    if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      return '[Word document content extraction not implemented]';
    }

    return '';
  }

  // If it's a FileInfo object
  const fileInfo = file as FileInfo;

  // If we already have content, return it
  if (fileInfo.content) {
    return fileInfo.content;
  }

  // For text files
  if (fileInfo.type?.startsWith('text/')) {
    return ''; // No content available, return empty string
  }

  // For other file types, return a placeholder
  if (fileInfo.name.endsWith('.pdf')) {
    return '[PDF content extraction not implemented]';
  }

  if (fileInfo.name.endsWith('.docx') || fileInfo.name.endsWith('.doc')) {
    return '[Word document content extraction not implemented]';
  }

  return '';
};

// Calculate similarity between two texts (0-1)
export const calculateSimilarity = (text1: string, text2: string): number => {
  // Simple Jaccard similarity implementation
  const words1 = text1.toLowerCase().split(/\W+/).filter(Boolean);
  const words2 = text2.toLowerCase().split(/\W+/).filter(Boolean);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  // Convert sets to arrays for iteration
  const set1Array = Array.from(set1);
  const set2Array = Array.from(set2);

  let intersection = 0;
  for (const word of set1Array) {
    if (set2.has(word)) {
      intersection++;
    }
  }

  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection / union.size : 0;
};

// Group files by language
export const groupByLanguage = (files: FileInfo[]): FileInfo[][] => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return [];
  }

  const groups = new Map<string, FileInfo[]>();

  files.forEach((file: FileInfo) => {
    const lang = file.language || 'unknown';
    const group = groups.get(lang) || [];
    group.push(file);
    groups.set(lang, group);
  });

  return Array.from(groups.values()).filter((group: FileInfo[]) => group.length > 1);
};

// Find similar files based on content similarity
export const findSimilarFiles = (files: FileInfo[] = [], threshold = 0.5): FileInfo[][] => {
  if (!files || !Array.isArray(files) || files.length < 2) {
    return [];
  }

  const similarGroups: FileInfo[][] = [];
  const processed = new Set<number>();

  files.forEach((file1: FileInfo, i: number) => {
    if (!file1 || processed.has(i)) return;

    const similarFiles: FileInfo[] = [file1];
    processed.add(i);

    for (let j = i + 1; j < files.length; j++) {
      const file2 = files[j];
      if (!file2 || processed.has(j)) continue;

      try {
        const similarity = calculateSimilarity(
          file1.content || '',
          file2.content || ''
        );

        if (similarity >= threshold) {
          similarFiles.push(file2);
          processed.add(j);
        }
      } catch (error) {
        console.error(`Error comparing files ${file1.name} and ${file2.name}:`, error);
      }
    }

    if (similarFiles.length > 1) {
      similarGroups.push(similarFiles);
    }
  });

  return similarGroups;
};

// Extract date from filename (if present)
export const extractDateFromFilename = (filename: string): Date | null => {
  // Common date patterns in filenames: YYYY-MM-DD, DD-MM-YYYY, etc.
  const datePatterns = [
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,  // YYYY-MM-DD or YYYY/MM/DD
    /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,  // MM-DD-YYYY or MM/DD/YYYY
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2})/,  // MM-DD-YY or MM/DD/YY
  ];

  for (const pattern of datePatterns) {
    const match = filename.match(pattern);
    if (match) {
      const date = new Date(match[1]);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
};

// Group files by date patterns
export const groupByDatePattern = (files: FileInfo[] = []): FileInfo[][] => {
  const dateGroups = new Map<string, FileInfo[]>();

  files.forEach(file => {
    if (!file.date) return;

    try {
      // Convert date string to Date object if it's a string
      const date = typeof file.date === 'string' ? new Date(file.date) : file.date;
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const group = dateGroups.get(dateStr) || [];
      group.push(file);
      dateGroups.set(dateStr, group);
    } catch (error) {
      console.warn('Error processing date for file:', file.name, error);
    }
  });

  return Array.from(dateGroups.values());
};

// Main analysis function
export const analyzeFiles = async (fileInfos: FileInfo[]): Promise<{
  languageGroups: FileInfo[][];
  similarContentGroups: FileInfo[][];
  datePatternGroups: FileInfo[][];
}> => {
  try {
    // Process file contents
    for (const file of fileInfos) {
      try {
        if (!file.content) {
          const content = await extractTextFromFile(file);
          file.content = content;
          file.language = detectLanguage(content);
          file.date = extractDateFromFilename(file.name);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    // Group files by different criteria
    const languageGroups = groupByLanguage(fileInfos);
    const similarContentGroups = findSimilarFiles(fileInfos);
    const datePatternGroups = groupByDatePattern(fileInfos);

    return {
      languageGroups: languageGroups || [],
      similarContentGroups: similarContentGroups || [],
      datePatternGroups: datePatternGroups || []
    };
  } catch (error) {
    console.error('Error in analyzeFiles:', error);
    return {
      languageGroups: [],
      similarContentGroups: [],
      datePatternGroups: []
    };
  }
};
