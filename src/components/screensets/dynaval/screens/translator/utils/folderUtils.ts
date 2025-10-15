import { FileInfo, FolderInfo, FileSystemItem } from '../types';

interface FileWithPath extends File {
  webkitRelativePath: string;
}

export const processFolderUpload = async (files: FileList): Promise<FileSystemItem[]> => {
  const items: FileSystemItem[] = [];
  const folderMap = new Map<string, FolderInfo>();
  
  // Create a root folder
  const rootFolder: FolderInfo = {
    id: 'root',
    name: 'Root',
    type: 'folder',
    path: '',
    lastModified: Date.now(),
    children: [],
    fileCount: 0,
    itemCount: 0,
    totalSize: 0,
    metadata: {
      lastModified: Date.now()
    }
  };
  
  folderMap.set('', rootFolder);
  
  // Process each file in the directory
  for (let i = 0; i < files.length; i++) {
    const file = files[i] as FileWithPath;
    const path = file.webkitRelativePath || file.name;
    const pathParts = path.split('/');
    
    // Build the directory structure
    let currentPath = '';
    let parentFolder = rootFolder;
    
    // Process each part of the path (except the last part which is the filename)
    for (let j = 0; j < pathParts.length - 1; j++) {
      const folderName = pathParts[j];
      const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      
      if (!folderMap.has(folderPath)) {
        const newFolder: FolderInfo = {
          id: `folder-${Date.now()}-${j}`,
          name: folderName,
          type: 'folder',
          path: folderPath,
          lastModified: file.lastModified,
          parentId: currentPath || null,
          children: [],
          fileCount: 0,
          itemCount: 0,
          totalSize: 0,
          metadata: {
            lastModified: file.lastModified
          }
        };
        
        folderMap.set(folderPath, newFolder);
        parentFolder.children.push(newFolder);
        parentFolder.fileCount++;
      }
      
      parentFolder = folderMap.get(folderPath)!;
      currentPath = folderPath;
    }
    
    // Process the file
    const fileName = pathParts[pathParts.length - 1];
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const fileContent = await readFileAsText(file);
    
    const fileInfo: FileInfo = {
      id: `file-${Date.now()}-${i}`,
      name: fileName,
      type: 'file',
      path: path,
      lastModified: file.lastModified,
      size: file.size,
      parentId: currentPath || null,
      content: fileContent,
      metadata: {
        lastModified: file.lastModified,
        mimeType: file.type,
        extension: fileExtension
      }
    };
    
    parentFolder.children.push(fileInfo);
    parentFolder.fileCount++;
    parentFolder.totalSize += file.size;
    
    // Update parent folder sizes
    let currentParentId = currentPath;
    while (currentParentId && folderMap.has(currentParentId)) {
      const folder = folderMap.get(currentParentId)!;
      folder.totalSize = (folder.totalSize || 0) + file.size;
      currentParentId = folder.parentId || '';
    }
    
    items.push(fileInfo);
  }
  
  return [rootFolder, ...items];
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string || '');
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      resolve('');
    };
    reader.readAsText(file);
  });
};

// Calculate similarity between two pieces of text using cosine similarity
export const calculateTextSimilarity = (text1: string, text2: string): number => {
  // Simple implementation - can be replaced with more sophisticated algorithm
  if (!text1 || !text2) return 0;
  
  // Convert to lowercase and split into words
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  // Create word frequency maps
  const freq1 = createFrequencyMap(words1);
  const freq2 = createFrequencyMap(words2);
  
  // Get all unique words
  const allWords = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
  
  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  // Convert Set to Array for iteration
  const allWordsArray = Array.from(allWords);
  for (const word of allWordsArray) {
    const count1 = freq1[word] || 0;
    const count2 = freq2[word] || 0;
    
    dotProduct += count1 * count2;
    mag1 += count1 * count1;
    mag2 += count2 * count2;
  }
  
  // Calculate cosine similarity
  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  return magnitude ? dotProduct / magnitude : 0;
};

const createFrequencyMap = (words: string[]): Record<string, number> => {
  return words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// Define types for similarity analysis
interface SimilarFile {
  fileId: string;
  fileName: string;
  similarityScore: number;
  matchingSections: Array<{
    text: string;
    startPos: number;
    endPos: number;
  }>;
}

interface SimilarityAnalysis {
  fileId: string;
  fileName: string;
  similarTo: SimilarFile[];
}

// Find similar files based on content similarity
export const findSimilarFiles = (files: FileInfo[], threshold = 0.7): SimilarityAnalysis[] => {
  const results: SimilarityAnalysis[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file1 = files[i];
    const similarTo: SimilarFile[] = [];
    
    for (let j = 0; j < files.length; j++) {
      if (i === j) continue;
      
      const file2 = files[j];
      const similarity = calculateTextSimilarity(file1.content, file2.content);
      
      if (similarity >= threshold) {
        similarTo.push({
          fileId: file2.id,
          fileName: file2.name,
          similarityScore: similarity,
          matchingSections: findMatchingSections(file1.content, file2.content, 3) // Get top 3 matching sections
        });
      }
    }
    
    if (similarTo.length > 0) {
      results.push({
        fileId: file1.id,
        fileName: file1.name,
        similarTo: similarTo.sort((a, b) => b.similarityScore - a.similarityScore)
      });
    }
  }
  
  return results;
};

// Find matching text sections between two files
const findMatchingSections = (text1: string, text2: string, maxSections: number) => {
  // Simple implementation - can be enhanced with more sophisticated algorithms
  const sections: { text: string; startPos: number; endPos: number }[] = [];
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  
  // Find common sequences of words
  for (let i = 0; i < words1.length; i++) {
    for (let j = 0; j < words2.length; j++) {
      if (words1[i] === words2[j] && words1[i].length > 5) { // Only consider words longer than 5 chars
        let k = 1;
        while (
          i + k < words1.length && 
          j + k < words2.length && 
          words1[i + k] === words2[j + k]
        ) {
          k++;
        }
        
        if (k > 3) { // Only consider sequences longer than 3 words
          const startPos = words1.slice(0, i).join(' ').length;
          const endPos = startPos + words1.slice(i, i + k).join(' ').length;
          sections.push({
            text: words1.slice(i, i + k).join(' '),
            startPos,
            endPos
          });
          i += k - 1; // Skip ahead to avoid overlapping matches
          break;
        }
      }
    }
    
    if (sections.length >= maxSections) break;
  }
  
  return sections.slice(0, maxSections);
};
