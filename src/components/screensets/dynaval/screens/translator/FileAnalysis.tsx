import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import { FileText, Folder, X, List, Grid, Search, Loader2, ChevronDown, Globe, Calendar, FolderPlus, FileCheck, Upload } from 'lucide-react';

// File System Access API types are now in src/types/file-system.d.ts
// and global type extensions are in src/types/global.d.ts

// Type aliases for backward compatibility
type FileEntry = FileSystemFileEntry;

import { findSimilarFiles } from './utils/folderUtils';
import type { FileInfo, FileGroup, FileSystemItem, FolderInfo, SimilarityAnalysis } from './types';

// Process folder upload and return FileSystemItem array
const processFolderUpload = async (files: FileList): Promise<FileSystemItem[]> => {
  const items: FileSystemItem[] = [];
  const folderMap = new Map<string, FolderInfo>();
  
  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string || '');
      };
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  };
  
  try {
    // Process all files
    for (const file of Array.from(files)) {
      try {
        const path = file.webkitRelativePath || file.name;
        const pathParts = path.split('/');
        const fileName = pathParts.pop() || file.name;
        
        // Process parent folders
        let currentPath = '';
        for (let i = 0; i < pathParts.length; i++) {
          const folderName = pathParts[i];
          currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
          
          if (!folderMap.has(currentPath)) {
            const folder: FolderInfo = {
              id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: folderName,
              type: 'folder',
              path: currentPath,
              children: [],
              fileCount: 0,
              itemCount: 0,
              totalSize: 0,
              lastModified: Date.now(),
              metadata: {
                lastModified: Date.now()
              }
            };
            folderMap.set(currentPath, folder);
          }
        }
        
        // Process the file
        const content = await readFileAsText(file);
        const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
        const detectedLanguage = detectLanguage(content);
        const fileDate = extractDateFromFilename(fileName) || new Date().toISOString();
        
        const fileItem: FileInfo = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: fileName,
          type: 'file',
          size: file.size,
          content,
          language: detectedLanguage,
          date: fileDate,
          path,
          lastModified: file.lastModified,
          metadata: {
            mimeType: file.type,
            lastModified: file.lastModified,
            extension: fileExt,
            size: file.size
          }
        };
        
        items.push(fileItem);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }
    
    // Update folder item counts and add folders to items
    const folderItems = Array.from(folderMap.values());
    for (const folder of folderItems) {
      const fileCount = items.filter(
        (item): item is FileInfo => 
          item.type === 'file' && 
          (item as FileInfo).path.startsWith(folder.path ? `${folder.path}/` : '')
      ).length;
      folder.itemCount = fileCount;
      items.push(folder);
    }
    
    return items;
  } catch (error) {
    console.error('Error in processFolderUpload:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Simple implementation of groupByLanguage
const groupByLanguage = (files: FileInfo[]): FileInfo[][] => {
  const groups: Record<string, FileInfo[]> = {};
  files.forEach(file => {
    const lang = file.language || 'unknown';
    if (!groups[lang]) {
      groups[lang] = [];
    }
    groups[lang].push(file);
  });
  return Object.values(groups);
};

// Simple implementation of groupByDatePattern
const groupByDatePattern = (files: FileInfo[]): FileInfo[][] => {
  // Group by date if available, otherwise put in a single group
  const groups: Record<string, FileInfo[]> = {};
  files.forEach(file => {
    const date = file.date ? new Date(file.date).toDateString() : 'no-date';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(file);
  });
  return Object.values(groups);
};

// Utility function to extract text from a file
const extractTextFromFile = async (file: FileInfo): Promise<string> => {
  if (!file.content) {
    if (file instanceof File) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = () => resolve('');
        reader.readAsText(file as unknown as File);
      });
    }
    return '';
  }
  return file.content;
};

// Simple language detection based on common patterns
const detectLanguage = (text: string): string => {
  // This is a simplified implementation
  // In a real app, you might want to use a library like franc or cld
  const trimmed = text.trim();
  if (!trimmed) return 'unknown';
  
  // Check for common language patterns
  if (/\b(function|const|let|var|return|import|export)\b/.test(trimmed)) {
    return 'javascript';
  }
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return 'html';
  }
  if (/(\$\{|\{\{|\{\%|\{\#)/.test(trimmed)) {
    return 'template';
  }
  return 'text';
};

// Extract date from filename if it matches common patterns
const extractDateFromFilename = (filename: string): string | null => {
  // Common date patterns: YYYY-MM-DD, DD-MM-YYYY, etc.
  const datePatterns = [
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,  // YYYY-MM-DD
    /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,  // DD-MM-YYYY
    /(\d{8})/                          // YYYYMMDD
  ];
  
  for (const pattern of datePatterns) {
    const match = filename.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

interface AnalysisState {
  files: FileInfo[];
  folders: FolderInfo[];
  groups: FileGroup[];
  similarityAnalysis: SimilarityAnalysis[];
  isAnalyzing: boolean;
  selectedGroup: string | null;
  viewMode: 'list' | 'grid';
  activeFilter: 'all' | 'language' | 'content' | 'date' | 'similarity';
  searchQuery: string;
  similarityThreshold: number;
  showSimilarityPanel: boolean;
  selectedFileId: string | null;
}

const FileAnalysis: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    files: [],
    folders: [],
    groups: [],
    similarityAnalysis: [],
    isAnalyzing: false,
    selectedGroup: null,
    viewMode: 'grid',
    activeFilter: 'all',
    searchQuery: '',
    similarityThreshold: 0.7,
    showSimilarityPanel: false,
    selectedFileId: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement & { webkitdirectory?: boolean }>(null);
  const [isDragging, setIsDragging] = useState(false);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const triggerFolderInput = useCallback(async () => {
    try {
      // Try to use the modern File System Access API if available
      if ('showDirectoryPicker' in window) {
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          const files: File[] = [];
          
          // Process the directory
          for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              // @ts-ignore - Add webkitRelativePath for compatibility
              file.webkitRelativePath = `${dirHandle.name}/${entry.name}`;
              files.push(file);
            }
          }
          
          // Create a FileList-like object
          const fileList = {
            ...files,
            length: files.length,
            item: (index: number) => files[index],
            [Symbol.iterator]: function*() {
              for (let i = 0; i < files.length; i++) {
                yield files[i];
              }
            }
          };
          
          // Trigger the upload handler
          handleFolderUpload({ target: { files: fileList } } as any);
          return;
        } catch (err) {
          console.log('User cancelled folder selection or an error occurred:', err);
          // Fall back to the webkitdirectory approach
        }
      }
      
      // Fallback to the traditional webkitdirectory approach
      if (folderInputRef.current) {
        folderInputRef.current.click();
      }
    } catch (error) {
      console.error('Error accessing directory:', error);
      alert('Error accessing directory. Please try again or use the file upload option.');
    }
  }, []);

  const handleAnalyzeFiles = useCallback(async () => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    try {
      // Perform analysis here
      // For now, we'll just set a timeout to simulate analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After analysis, you might want to update the state with the results
      // For example:
      // const analysisResults = await analyzeFiles(state.files);
      // setState(prev => ({
      //   ...prev,
      //   groups: analysisResults.groups,
      //   similarityAnalysis: analysisResults.similarityAnalysis,
      //   isAnalyzing: false
      // }));
    } catch (error) {
      console.error('Error analyzing files:', error);
      // Optionally show an error message to the user
    } finally {
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [state.files]); // Add any dependencies here

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const dt = e.dataTransfer;
    if (!dt.files || dt.files.length === 0) return;
    
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }));
      
      const newFiles: FileInfo[] = [];
      const files = Array.from(dt.files);
      
      for (const file of files) {
        try {
          const content = await readFileAsText(file);
          const fileName = file.name;
          const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
          const detectedLanguage = detectLanguage(content);
          const fileDate = extractDateFromFilename(fileName) || new Date().toISOString();
          
          const fileItem: FileInfo = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: fileName,
            type: 'file',
            path: fileName,
            lastModified: file.lastModified,
            size: file.size,
            content,
            language: detectedLanguage,
            date: fileDate,
            metadata: {
              lastModified: file.lastModified,
              mimeType: file.type,
              extension: fileExt,
              size: file.size
            }
          };
          
          newFiles.push(fileItem);
        } catch (error) {
          console.error(`Error processing dropped file ${file.name}:`, error);
        }
      }
      
      setState(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles],
        isAnalyzing: false
      }));
      
    } catch (error) {
      console.error('Error handling file drop:', error);
      alert('An error occurred while processing the dropped files. Please try again.');
      setState(prev => ({
        ...prev,
        isAnalyzing: false
      }));
    }
  }, []);
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string || '');
      };
      reader.readAsText(file);
    });
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    if (!target.files || target.files.length === 0) return;
    
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }));
      
      // Process each file individually to ensure proper type safety
      const newFiles: FileInfo[] = [];
      
      for (const file of Array.from(target.files)) {
        try {
          const content = await readFileAsText(file);
          const fileName = file.name;
          const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
          const detectedLanguage = detectLanguage(content);
          const fileDate = extractDateFromFilename(fileName) || new Date().toISOString();
          
          const fileItem: FileInfo = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: fileName,
            type: 'file',
            path: fileName,
            lastModified: file.lastModified,
            size: file.size,
            content,
            language: detectedLanguage,
            date: fileDate,
            metadata: {
              lastModified: file.lastModified,
              mimeType: file.type,
              extension: fileExt,
              size: file.size
            }
          };
          
          newFiles.push(fileItem);
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
        }
      }
      
      setState(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles],
        isAnalyzing: false
      }));
      
    } catch (error) {
      console.error('Error processing files:', error);
      alert('An error occurred while processing the files. Please try again.');
      setState(prev => ({
        ...prev,
        isAnalyzing: false
      }));
    } finally {
      if (target) {
        target.value = ''; // Reset the input to allow selecting the same file again
      }
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleFolderUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | File[] } }) => {
    const target = event.target;
    if (!target.files || target.files.length === 0) return;
    
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }));
      
      // Convert FileList to array for easier manipulation
      const filesArray = Array.from(target.files);
      
      // Process the files using our utility function
      const items = await processFolderUpload({
        ...filesArray,
        length: filesArray.length,
        item: (index: number) => filesArray[index],
        [Symbol.iterator]: function*() {
          for (let i = 0; i < filesArray.length; i++) {
            yield filesArray[i];
          }
        }
      } as FileList);
      
      // Separate files and folders
      const newFiles = items.filter((item): item is FileInfo => item.type === 'file');
      const newFolders = items.filter((item): item is FolderInfo => item.type === 'folder');
      
      setState(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles],
        folders: [...prev.folders, ...newFolders],
        isAnalyzing: false
      }));
      
    } catch (error) {
      console.error('Error during folder upload:', error);
      alert('An error occurred while processing the folder. Please try again.');
      setState(prev => ({
        ...prev,
        isAnalyzing: false
      }));
    } finally {
      // Reset the input to allow selecting the same folder again
      if ('value' in target) {
        target.value = '';
      }
    }
  }, [state.files, state.similarityThreshold]);

  const removeFile = useCallback((fileId: string) => {
    setState(prev => {
      // Create a new files array without the removed file
      const newFiles = prev.files.filter((file: FileInfo) => file.id !== fileId);
      
      // Update groups by removing the file and filtering out empty groups
      const newGroups = prev.groups
        .map(group => ({
          ...group,
          items: group.items.filter(item => item.id !== fileId)
        }))
        .filter(group => group.items.length > 0);
      
      // Update selectedGroup if it was removed
      const selectedGroup = newGroups.some(g => g.id === prev.selectedGroup) 
        ? prev.selectedGroup 
        : newGroups[0]?.id || null;
      
      return {
        ...prev,
        files: newFiles,
        groups: newGroups,
        selectedGroup,
        // Clear selected file if it was removed
        selectedFileId: prev.selectedFileId === fileId ? null : prev.selectedFileId
      };
    });
  }, []);

  // Type guard to check if item is FileInfo
  const isFileInfo = (item: FileInfo | FolderInfo): item is FileInfo => {
    return item.type === 'file';
  };

  const renderFileItem = (item: FileInfo | FolderInfo) => {
    if (!item) return null;
    return (
      <div
        key={item.id}
        className={`flex items-center p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors ${
          state.selectedFileId === item.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => setState(prev => ({ ...prev, selectedFileId: item.id }))}
      >
        {item.type === 'folder' ? (
          <Folder className="w-5 h-5 mr-3 text-yellow-500" />
        ) : (
          <FileText className="w-5 h-5 mr-3 text-blue-500" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <span>{isFileInfo(item) ? formatFileSize(item.size) : `${item.fileCount} items`}</span>
            {isFileInfo(item) && (
              <>
                <span className="mx-2">•</span>
                <span>{item.metadata?.mimeType || 'Unknown type'}</span>
              </>
            )}
          </div>
        </div>
        {isFileInfo(item) && state.similarityAnalysis.some(sa =>
          sa.fileId === item.id || sa.similarTo.some(s => s.fileId === item.id)
        ) && (
          <div className="ml-2 px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
            Similar
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeFile(item.id);
          }}
          className="p-1 ml-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );

    // Group files by language and date patterns
    const languageGroups: FileGroup[] = groupByLanguage(state.files).map((group, i) => ({
      id: `lang-${i}`,
      name: `Language: ${group[0]?.language || 'Unknown'}`,
      type: 'language' as const,
      reason: `Files in ${group[0]?.language || 'unknown'} language`,
      items: group,
      files: group,
      similarityReason: '',
      commonPatterns: [],
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
    }));

    const dateGroups: FileGroup[] = groupByDatePattern(state.files).map((group, i) => ({
      id: `date-${i}`,
      name: 'Similar Date Pattern',
      type: 'date' as const,
      reason: 'Files follow the same date pattern in their names',
      items: group,
      files: group,
      similarityReason: '',
      commonPatterns: [],
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
    }));

    // Create similarity group if we have similarity analysis
    const similarityGroup: FileGroup | null = state.similarityAnalysis.length > 0
      ? {
          id: 'similarity-group',
          name: 'Similar Files',
          type: 'similarity' as const,
          items: state.files.filter(file => 
            state.similarityAnalysis.some(sa => 
              sa.fileId === file.id || sa.similarTo.some(s => s.fileId === file.id)
            )
          ),
          files: state.files.filter(file => 
            state.similarityAnalysis.some(sa => 
              sa.fileId === file.id || sa.similarTo.some(s => s.fileId === file.id)
            )
          ),
          reason: 'Files with similar content',
          similarityReason: 'Files with similar content',
          similarityThreshold: state.similarityThreshold,
          commonPatterns: [],
          metadata: {
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          }
        }
      : null;

    // Combine all groups and filter out null values
    const newGroups: FileGroup[] = [
      ...(similarityGroup ? [similarityGroup] : []),
      ...languageGroups,
      ...dateGroups
    ].filter((group): group is FileGroup => group !== null);
    
    if (state.files.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <Folder className="w-12 h-12 mb-4 text-gray-300" />
          <p>No files found</p>
        </div>
      );
    }
    
    // Group items by folder
    const itemsByFolder: Record<string, (FileInfo | FolderInfo)[]> = {};

    [...state.files, ...state.folders].forEach((item: FileInfo | FolderInfo) => {
      const folderPath = 'path' in item && item.path ? item.path.split('/').slice(0, -1).join('/') : 'Root';
      if (!itemsByFolder[folderPath]) {
        itemsByFolder[folderPath] = [];
      }
      itemsByFolder[folderPath].push(item);
    });

    return (
      <div className="space-y-4">
        {Object.entries(itemsByFolder).map(([folderPath, folderItems]) => (
          <div key={folderPath} className="space-y-2">
            {folderPath !== 'Root' && (
              <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-t-lg">
                <Folder className="w-4 h-4 mr-2 text-blue-500" />
                {folderPath}
              </div>
            )}
            <div className="space-y-2">
              {folderItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors ${
                    state.selectedFileId === item.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setState(prev => ({ ...prev, selectedFileId: item.id }))}
                >
                  {item.type === 'folder' ? (
                    <Folder className="w-5 h-5 mr-3 text-yellow-500" />
                  ) : (
                    <FileText className="w-5 h-5 mr-3 text-blue-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>{item.type === 'file' ? formatFileSize(item.size) : `${(item as FolderInfo).fileCount} items`}</span>
                      {item.type === 'file' && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{(item as FileInfo).metadata?.mimeType || 'Unknown type'}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {item.type === 'file' && state.similarityAnalysis.some(sa =>
                    sa.fileId === item.id || sa.similarTo.some(s => s.fileId === item.id)
                  ) && (
                    <div className="ml-2 px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                      Similar
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.id);
                    }}
                    className="p-1 ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderUploadArea = () => (
    <div className="space-y-4">
      <div
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-3 mb-4 bg-blue-100 rounded-full">
          <Upload className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="mb-1 text-lg font-medium text-gray-900">Drag and drop files or folders here</h3>
        <p className="mb-4 text-sm text-gray-500">or</p>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={triggerFileInput}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Select Files
          </button>
          <button
            type="button"
            onClick={triggerFolderInput}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Select Folder
          </button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          multiple
        />
        {/* Hidden folder input */}
        <input
          type="file"
          ref={folderInputRef}
          className="hidden"
          onChange={handleFolderUpload}
          // @ts-expect-error - webkitdirectory is a valid attribute but not in TypeScript's types
          webkitdirectory=""
          directory=""
          multiple
        />
      </div>

      {/* File/folder info */}
      {state.files.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Selected Items</h4>
            <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-white rounded-full">
              {state.files.length} {state.files.length === 1 ? 'file' : 'files'}
              {state.folders.length > 0 && ` • ${state.folders.length} ${state.folders.length === 1 ? 'folder' : 'folders'}`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {state.folders.slice(0, 3).map(folder => (
              <span key={folder.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Folder className="w-3 h-3 mr-1" />
                {folder.name}
              </span>
            ))}
            {state.files.slice(0, 3).map(file => (
              <span key={file.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <FileText className="w-3 h-3 mr-1" />
                {file.name}
              </span>
            ))}
            {(state.files.length > 3 || state.folders.length > 3) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{Math.max(0, state.files.length - 3) + Math.max(0, state.folders.length - 3)} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalysisControls = () => (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">File Analysis</h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
            className={`p-2 rounded-md ${
              state.viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
            className={`p-2 rounded-md ${
              state.viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center p-2 space-x-2 overflow-x-auto bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => setState(prev => ({ ...prev, activeFilter: 'all' }))}
          className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
            state.activeFilter === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          All Files
        </button>
        <button
          type="button"
          onClick={() => setState(prev => ({ ...prev, activeFilter: 'similarity' }))}
          className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
            state.activeFilter === 'similarity' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          <FileCheck className="inline w-4 h-4 mr-1.5 -mt-0.5" />
          Similar Files
        </button>
        <button
          type="button"
          onClick={() => setState(prev => ({ ...prev, activeFilter: 'language' }))}
          className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
            state.activeFilter === 'language' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          <Globe className="inline w-4 h-4 mr-1.5 -mt-0.5" />
          By Language
        </button>
        <button
          type="button"
          onClick={() => setState(prev => ({ ...prev, activeFilter: 'content' }))}
          className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
            state.activeFilter === 'content' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          <FileText className="inline w-4 h-4 mr-1.5 -mt-0.5" />
          By Content
        </button>
        <button
          type="button"
          onClick={() => setState(prev => ({ ...prev, activeFilter: 'date' }))}
          className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
            state.activeFilter === 'date' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          <Calendar className="inline w-4 h-4 mr-1.5 -mt-0.5" />
          By Date
        </button>
      </div>

      {/* Similarity threshold slider */}
      {state.activeFilter === 'similarity' && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="similarity-threshold" className="block text-sm font-medium text-gray-700">
              Similarity Threshold: <span className="font-bold">{Math.round(state.similarityThreshold * 100)}%</span>
            </label>
            <button
              type="button"
              onClick={() => setState(prev => ({ ...prev, showSimilarityPanel: !prev.showSimilarityPanel }))}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {state.showSimilarityPanel ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          <input
            id="similarity-threshold"
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={state.similarityThreshold}
            onChange={(e) => setState(prev => ({
              ...prev,
              similarityThreshold: parseFloat(e.target.value),
            }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search files..."
          className="block w-full py-2 pl-10 pr-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={state.searchQuery}
          onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center mb-4 md:mb-0">
          <Folder className="mr-2" /> File Analysis
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search files..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={state.activeFilter}
                onChange={(e) => setState(prev => ({ ...prev, activeFilter: e.target.value as any }))}
                className="appearance-none pl-3 pr-8 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Groups</option>
                <option value="language">By Language</option>
                <option value="content">Similar Content</option>
                <option value="date">Date Patterns</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                className={`p-1.5 rounded-md ${state.viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                className={`p-1.5 rounded-md ${state.viewMode === 'list' ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">File Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload multiple files to analyze their content, language, and find similarities
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium flex items-center justify-center transition-colors"
              disabled={state.isAnalyzing}
            >
              <FileText size={16} className="mr-2" /> Add Files
            </button>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.pdf,.doc,.docx,.md"
              disabled={state.isAnalyzing}
            />
            <button
              type="button"
              onClick={handleAnalyzeFiles}
              disabled={state.files.length < 2 || state.isAnalyzing}
              className={`flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium ${state.files.length < 2 || state.isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {state.isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                'Analyze Files'
              )}
            </button>
          </div>
        </div>

        {state.files.length > 0 ? (
          <div className="border rounded divide-y max-h-64 overflow-y-auto">
            {state.files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                <div className="flex items-center min-w-0">
                  <FileText className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="mx-2">•</span>
                      <span>{file.type || 'Unknown type'}</span>
                      {file.lastModified && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Modified: {new Date(file.lastModified).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-red-500 p-1 -mr-1"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          renderUploadArea()
        )}
      </div>

      {state.groups.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Analysis Results</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  value={state.activeFilter}
                  onChange={(e) => setState(prev => ({ ...prev, activeFilter: e.target.value as any }))}
                  className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Groups</option>
                  <option value="language">By Language</option>
                  <option value="content">By Content</option>
                  <option value="date">By Date Pattern</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

              <div className="h-6 w-px bg-gray-300 mx-1" />

              <div className="flex bg-gray-100 rounded-md p-0.5">
                <button
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                  className={`p-1.5 rounded-md ${
                    state.viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid view"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                  className={`p-1.5 rounded-md ${
                    state.viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="List view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {state.groups.filter(group => group.type === state.activeFilter || state.activeFilter === 'all').length > 0 ? (
              state.groups.filter(group => group.type === state.activeFilter || state.activeFilter === 'all').map((group) => (
                <div key={group.id} className="border rounded overflow-hidden">
                  <div
                    className="p-3 bg-gray-50 border-b flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setState(prev => ({ ...prev, selectedGroup: group.id }))}
                  >
                    <div className="flex items-center">
                      <div className={`p-1.5 rounded-full mr-3 ${
                        group.type === 'language' ? 'bg-blue-100 text-blue-600' :
                        group.type === 'content' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {group.type === 'language' && <Globe size={16} />}
                        {group.type === 'content' && <FileText size={16} />}
                        {group.type === 'date' && <Calendar size={16} />}
                      </div>
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-sm text-gray-500">{group.similarityReason}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      {group.items.length} {group.items.length === 1 ? 'file' : 'files'}
                      <ChevronDown
                        size={18}
                        className={`ml-2 transition-transform ${
                          state.selectedGroup === group.id ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {state.selectedGroup === group.id && (
                    <div className="p-4 bg-white">
                      <div className="mb-3 text-sm text-gray-600">
                        <span className="font-medium">Analysis:</span> {group.similarityReason || 'No analysis available'}
                      </div>
                      
                      {state.viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.items.map((item, index) => {
                            const isFile = 'language' in item;
                            return (
                              <div key={`${item.name}-${index}`} className="border rounded p-3 hover:bg-gray-50 transition-colors">
                                <div className="font-medium truncate">{item.name}</div>
                                <div className="mt-2 space-y-1 text-xs text-gray-500">
                                  {isFile && item.language && (
                                    <div className="flex items-center">
                                      <Globe size={12} className="mr-1.5" />
                                      <span>Language: {item.language.toUpperCase()}</span>
                                    </div>
                                  )}
                                  {item.lastModified && (
                                    <div className="flex items-center">
                                      <Calendar size={12} className="mr-1.5" />
                                      <span>Modified: {new Date(item.lastModified).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  {item.type === 'file' && (
                                    <div className="flex items-center">
                                      <FileText size={12} className="mr-1.5" />
                                      <span>Size: {formatFileSize(item.size)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="border rounded divide-y">
                          {group.files.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="p-3 hover:bg-gray-50 transition-colors">
                              <div className="font-medium">{file.name}</div>
                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                {file.language && (
                                  <span className="flex items-center">
                                    <Globe size={12} className="mr-1.5" />
                                    {file.language.toUpperCase()}
                                  </span>
                                )}
                                {file.lastModified && (
                                  <span className="flex items-center">
                                    <Calendar size={12} className="mr-1.5" />
                                    {new Date(file.lastModified).toLocaleDateString()}
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <FileText size={12} className="mr-1.5" />
                                  {formatFileSize(file.size)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Group type:</span> {group.type}
                        </div>
                        <div>
                          {group.items.length} {group.items.length === 1 ? 'file' : 'files'} • {group.items.reduce((sum, file) => sum + (file.size || 0), 0) / 1024 > 1024 
                            ? `${(group.items.reduce((sum, file) => sum + (file.size || 0), 0) / (1024 * 1024)).toFixed(1)} MB total`
                            : `${Math.ceil(group.items.reduce((sum, file) => sum + (file.size || 0), 0) / 1024)} KB total`
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded border border-dashed border-gray-300">
                <Search size={32} className="mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">No groups found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try changing your filter criteria or upload more files
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileAnalysis;
