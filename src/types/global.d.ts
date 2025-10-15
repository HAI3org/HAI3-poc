// Extend the HTMLInputElement interface to include webkitEntries
declare global {
  interface HTMLInputElement {
    // For directory uploads
    webkitdirectory: boolean;
    webkitEntries: readonly FileSystemEntry[];
    
    // For modern directory handling
    showDirectoryPicker?(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
  }
}

export {}; // This file needs to be a module
