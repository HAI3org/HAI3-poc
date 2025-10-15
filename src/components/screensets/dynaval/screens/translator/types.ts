// Define a more specific type for metadata
export interface FileSystemMetadata {
  lastModified: number;
  mimeType?: string;
  extension?: string;
  size?: number;
  [key: string]: unknown; // Allow for additional metadata properties
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  lastModified: number;
  size?: number;
  children?: FileSystemItem[];
  parentId?: string | null;
  metadata?: FileSystemMetadata;
}

export interface FileInfo extends FileSystemItem {
  type: 'file';
  content: string;
  language?: string;
  date?: string | Date | null;  // Allow string dates for ISO strings
  size: number;
  metadata: FileSystemMetadata & {
    mimeType: string;
    extension: string;
  };
  similarityScores?: {
    [key: string]: number; // key is fileId, value is similarity score (0-1)
  };
  averageSimilarity?: number;
}

export interface FolderInfo extends FileSystemItem {
  type: 'folder';
  children: (FileInfo | FolderInfo)[];
  fileCount: number;
  itemCount: number;
  totalSize: number;
  lastModified: number;
  metadata?: FileSystemMetadata;
}

export interface FileGroupMetadata {
  created: Date | string;
  updated: Date | string;
  [key: string]: unknown; // Allow for additional metadata properties
}

export interface FileGroup {
  id: string;
  name: string;
  items: (FileInfo | FolderInfo)[];
  files: FileInfo[]; // Array of files in this group
  reason?: string; // Reason for grouping (e.g., 'Files in same language')
  similarityReason?: string; // Specific reason for similarity grouping
  type: 'language' | 'content' | 'date' | 'similarity' | 'other';
  similarityThreshold?: number;
  commonPatterns?: string[];
  metadata?: FileGroupMetadata;
}

export interface MatchingSection {
  text: string;
  startPos: number;
  endPos: number;
}

export interface SimilarFile {
  fileId: string;
  fileName: string;
  similarityScore: number;
  matchingSections: MatchingSection[];
}

export interface SimilarityAnalysis {
  fileId: string;
  fileName: string;
  similarTo: SimilarFile[];
  metadata?: {
    analyzedAt: Date | string;
    [key: string]: unknown;
  };
}

export interface AnalysisStatistics {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  fileTypes: Record<string, number>;
  languages: Record<string, number>;
  averageSimilarity: number;
  analyzedAt?: Date | string;
  [key: string]: unknown; // Allow for additional statistics
}

export interface AnalysisResults {
  languageGroups: FileGroup[];
  similarContentGroups: FileGroup[];
  datePatternGroups: FileGroup[];
  similarityAnalysis: SimilarityAnalysis[];
  statistics: AnalysisStatistics;
  metadata?: {
    analysisId?: string;
    startedAt: Date | string;
    completedAt: Date | string;
    durationMs?: number;
    [key: string]: unknown;
  };
}
