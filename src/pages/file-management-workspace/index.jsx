import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Icon from 'components/AppIcon'; 
import FileGrid from './components/FileGrid';
import FilePreview from './components/FilePreview';

// Helper: Format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024, dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FileManagementWorkspace = () => {
  // States
  const [currentPath, setCurrentPath] = useState('');
  const [pathHistory, setPathHistory] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [hoveredFile, setHoveredFile] = useState(null);
  const [selectedFilePaths, setSelectedFilePaths] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [activeFilter, setActiveFilter] = useState('allfiles');
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Drag & Drop states for internal move
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const fileInputRef = useRef(null);

  // Prevent default browser drop for external files
  useEffect(() => {
    const preventDefaultForExternalFiles = (e) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
    };
    window.addEventListener('dragover', preventDefaultForExternalFiles);
    window.addEventListener('drop', preventDefaultForExternalFiles);
    return () => {
      window.removeEventListener('dragover', preventDefaultForExternalFiles);
      window.removeEventListener('drop', preventDefaultForExternalFiles);
    };
  }, []);

  // Fetch files/folders
  const fetchFilesAndFolders = useCallback(async (path) => {
    setIsLoading(true); setError(null); setPreviewFile(null); setSelectedFilePaths([]);
    try {
      const itemsFromBackend = await window.electronAPI.files.getAll(path);
      const formattedItems = itemsFromBackend.map(item => ({
        ...item,
        modified: item.modifiedAt,
        sizeFormatted: formatBytes(item.size),
        modifiedAtFormatted: new Date(item.modifiedAt).toLocaleString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        })
      }));
      setAllItems(formattedItems);
      setCurrentPath(path);
    } catch (err) {
      setError('Could not load files. Please ensure the path is correct.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadInitialPath = async () => {
      try {
        const rootPath = await window.electronAPI.app.getUserFilesPath();
        setPathHistory([rootPath]);
        fetchFilesAndFolders(rootPath);
      } catch (err) {
        setError('Application root path not found.');
        setIsLoading(false);
      }
    };
    loadInitialPath();
  }, [fetchFilesAndFolders]);

  // Load image thumbnails
  useEffect(() => {
    if (allItems.length === 0 || isCreatingNewFolder) return;
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    allItems.forEach(item => {
      if (!item.isDirectory && !item.thumbnail) {
        const fileExtension = item.name.substring(item.name.lastIndexOf('.')).toLowerCase();
        if (imageExtensions.includes(fileExtension)) {
          window.electronAPI.files.readAsBase64(item.path)
            .then(thumbnailSrc => {
              if (thumbnailSrc) {
                setAllItems(currentItems =>
                  currentItems.map(currentItem =>
                    currentItem.path === item.path
                      ? { ...currentItem, thumbnail: thumbnailSrc }
                      : currentItem
                  )
                );
              }
            })
            .catch(() => {});
        }
      }
    });
  }, [allItems, currentPath, isCreatingNewFolder]);

  // Navigation
  const handleFolderSelect = (folderPath) => {
    if (isCreatingNewFolder) return;
    setActiveFilter('allfiles');
    setSearchQuery('');
    setPathHistory(prev => [...prev, folderPath]);
    fetchFilesAndFolders(folderPath);
  };

  const handleGoBack = async () => {
    if (pathHistory.length <= 1) return;
    setActiveFilter('allfiles');
    setSearchQuery('');
    const newHistory = [...pathHistory];
    newHistory.pop();
    const previousPath = newHistory[newHistory.length - 1];
    setPathHistory(newHistory);
    await fetchFilesAndFolders(previousPath);
  };

  // New folder
  const handleInitiateCreateFolder = () => setIsCreatingNewFolder(true);
  const handleCancelCreateFolder = () => setIsCreatingNewFolder(false);
  const handleConfirmCreateFolder = async (folderName) => {
    setIsCreatingNewFolder(false);
    if (!folderName || folderName.trim() === '') return;
    if (allItems.some(item => item.name.toLowerCase() === folderName.toLowerCase())) {
      alert(`A folder or file named "${folderName}" already exists.`);
      return;
    }
    setIsLoading(true);
    try {
      const result = await window.electronAPI.files.createFolder({ parentPath: currentPath, folderName });
      if (!result.success) alert(`Error creating folder: ${result.error}`);
    } catch (err) {
      alert('An unexpected error occurred while creating the folder.');
    } finally {
      await fetchFilesAndFolders(currentPath); 
    }
  };

  // Upload files
  const handleFileUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    const filesToUpload = Array.from(files);
    const newUploads = filesToUpload.map(f => ({ 
      id: f.name + Date.now(), name: f.name, size: f.size, progress: 0 
    }));
    setUploadQueue(prev => [...prev, ...newUploads]);
    const uploadPromises = filesToUpload.map(async (file) => {
      try {
        const data = await file.arrayBuffer();
        const result = await window.electronAPI.files.upload({
          parentPath: currentPath, name: file.name, data: new Uint8Array(data)
        });
        if (result.success) {
          setUploadQueue(prev => prev.map(up => (up.name === file.name && up.progress !== -1) ? { ...up, progress: 100 } : up));
        } else {
          throw new Error(result.error);
        }
      } catch {
        setUploadQueue(prev => prev.map(up => (up.name === file.name) ? { ...up, progress: -1 } : up));
      }
    });
    await Promise.all(uploadPromises);
    await fetchFilesAndFolders(currentPath);
    setTimeout(() => { setUploadQueue([]); }, 2000);
  }, [currentPath, fetchFilesAndFolders]);

  // File preview
  const handleFilePreview = async (file) => {
    setRecentFiles(prevRecent => {
      const updatedRecent = prevRecent.filter(f => f.path !== file.path);
      const newRecent = [file, ...updatedRecent];
      return newRecent.slice(0, 4);
    });
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (imageExtensions.includes(fileExtension)) {
      try {
        setPreviewFile({ ...file, isLoading: true });
        const base64Data = await window.electronAPI.files.readAsBase64(file.path);
        setPreviewFile({ ...file, previewData: base64Data, isLoading: false });
      } catch {
        setPreviewFile({ ...file, previewData: null, isLoading: false });
      }
    } else {
      setPreviewFile({ ...file, previewData: null, isLoading: false });
    }
  };
// Drag & Drop (external upload + internal move)
const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();

  // فقط اگر درگ داخلی بود DropZone آپلود فعال نشود
  if (e.dataTransfer.types.includes('text/custom-internal')) {
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(false);
  } else if (e.dataTransfer.types.includes('Files')) {
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  } else {
    e.dataTransfer.dropEffect = 'none';
    setIsDragOver(false);
  }

};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragOver(false);

  const types = Array.from(e.dataTransfer.types || []);
  const isInternal = types.includes('text/custom-internal');
  const isExternalDrop = types.includes('Files');

  if (isInternal) return; // درگ داخلی: مدیریت در FileGrid
  if (isExternalDrop && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleFileUpload(e.dataTransfer.files);
  }
};

// Internal Drag & Drop logic for moving files/folders
const handleMoveFile = async (dragged, targetFolder) => {
  if (!dragged || !targetFolder || !targetFolder.isDirectory || dragged.path === targetFolder.path) {
    setDraggedItem(null);
    setDropTarget(null);
    return;
  }
  try {
    console.log('Move request:', dragged.path, '=>', targetFolder.path);
    const result = await window.electronAPI.files.move(dragged.path, targetFolder.path);
    console.log('Move result:', result);
    if (!result || !result.success) {
      alert('Move failed: ' + (result?.error || 'Unknown error'));
    }
    await fetchFilesAndFolders(currentPath);
  } catch (err) {
    alert('Move failed: ' + (err.message || err));
  } finally {
    setDraggedItem(null);
    setDropTarget(null);
  }
};
const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragOver(false);
};
  // File filters
  const fileTypeFilters = {
    documents: ['.pdf', '.doc', '.docx', '.md', '.txt'],
    images: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    videos: ['.mp4', '.mov', '.mkv', '.avi'],
    code: ['.js', '.jsx', '.html', '.css', '.py', '.json', '.ts']
  };

  const processedItems = useMemo(() => {
    let itemsToProcess = Array.isArray(allItems) ? [...allItems] : [];
    if (activeFilter !== 'allfiles') {
      const extensions = fileTypeFilters[activeFilter];
      if (Array.isArray(extensions)) {
        itemsToProcess = itemsToProcess.filter(item => {
          if (!item || typeof item.name !== 'string') return false;
          if (item.isDirectory) return false;
          const extension = item.name.lastIndexOf('.') !== -1 ? item.name.split('.').pop().toLowerCase() : '';
          return extensions.includes(`.${extension}`);
        });
      } else {
        // اگر extensions تعریف نشده بود، هیچ آیتمی نمایش داده نشود
        itemsToProcess = [];
      }
    }
    const filtered = itemsToProcess.filter(item => item && typeof item.name === 'string' && item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      const aSize = typeof a.size === 'number' ? a.size : 0;
      const bSize = typeof b.size === 'number' ? b.size : 0;
      const aMod = a.modifiedAt ? new Date(a.modifiedAt) : new Date(0);
      const bMod = b.modifiedAt ? new Date(b.modifiedAt) : new Date(0);
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'size': return aSize - bSize;
        case 'modified': return bMod - aMod;
        default: return 0;
      }
    });
    return sorted;
  }, [allItems, searchQuery, sortBy, activeFilter]);

  const filters = [
    { id: 'allfiles', label: 'All Files', icon: 'Files' },
    { id: 'documents', label: 'Documents', icon: 'FileText' },
    { id: 'images', label: 'Images', icon: 'Image' },
    { id: 'videos', label: 'Videos', icon: 'Video' },
    { id: 'code', label: 'Code', icon: 'Code' }
  ];

  // Fix: Reset preview and selected files when filter changes
  useEffect(() => {
    setPreviewFile(null);
    setSelectedFilePaths([]);
  }, [activeFilter, currentPath]);

  // Fix: Prevent previewFile from referencing a file that is not in processedItems
  useEffect(() => {
    if (previewFile && (!processedItems.some(f => f.path === previewFile.path))) {
      setPreviewFile(null);
    }
  }, [processedItems, previewFile]);

  // =================== JSX ===================
  return (
    <div className="min-h-screen bg-background pt-12 font-sans">
      <div 
        className={`flex h-screen transition-colors duration-300 ${isDragOver ? 'bg-primary/5' : ''}`}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
      >
        {/* Sidebar */}
        <aside className="w-1/5 bg-surface border-r border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">File Explorer</h2>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            {/* Recent Files */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-text-secondary mb-2 px-2">Recent Files</h3>
              <div className="space-y-1">
                {recentFiles.length > 0 ? recentFiles.map(file => (
                  <button type="button" key={file.path}
                    onClick={() => processedItems.some(f => f.path === file.path) ? handleFilePreview(file) : null}
                    className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-surface-hover transition-colors text-left"
                  >
                    <Icon name="File" size={16} className="text-text-secondary" />
                    <span className="text-sm text-text-secondary truncate">{file.name}</span>
                  </button>
                )) : <p className="text-xs text-text-tertiary px-2">No recent files.</p>}
              </div>
            </div>
            {/* File Type Filters */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-text-secondary mb-2 px-2">File Types</h3>
              <div className="space-y-1">
                {filters.map(filter => (
                  <button
                    type="button"
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors text-left ${
                      activeFilter === filter.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    <Icon name={filter.icon} size={16} />
                    <span className="text-sm font-medium">{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Breadcrumb & Folders */}
            {activeFilter === 'allfiles' && (
              <div className="mt-4 border-t border-border pt-3 space-y-3 px-2">
                <div className="flex items-center flex-wrap text-sm text-text-tertiary">
                  {(Array.isArray(pathHistory) ? pathHistory : []).map((path, idx) => {
                    const parts = path.split(/\\|\//);
                    const name = parts[parts.length - 1] || 'Root';
                    const isLast = idx === pathHistory.length - 1;
                    return (
                      <div key={idx} className="flex items-center">
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => {
                            const newHistory = pathHistory.slice(0, idx + 1);
                            setPathHistory(newHistory);
                            fetchFilesAndFolders(path);
                          }}
                          className={`px-1 hover:underline ${isLast ? 'text-text-primary font-semibold' : ''}`}
                        >
                          {name}
                        </button>
                        {!isLast && <span className="mx-1 text-text-tertiary">/</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1">
                  {(Array.isArray(processedItems) ? processedItems : []).filter(item => item.isDirectory).map(folder => (
                    <button
                      type="button"
                      key={folder.path}
                      onClick={() => handleFolderSelect(folder.path)}
                      className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-surface-hover transition-colors text-left"
                    >
                      <Icon name="Folder" size={16} className="text-primary" />
                      <span className="text-sm text-text-primary truncate">{folder.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-background">
          <header className="bg-surface border-b border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 bg-primary text-text-inverse px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:bg-primary/50"
                  disabled={isLoading || isCreatingNewFolder}
                >
                  <Icon name="Upload" size={18} />
                  <span>Upload Files</span>
                </button>
                <input
                  ref={fileInputRef} type="file" multiple className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <button 
                  type="button"
                  onClick={handleInitiateCreateFolder}
                  className="flex items-center space-x-2 border border-border px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary disabled:opacity-50"
                  disabled={isLoading || isCreatingNewFolder || activeFilter !== 'allfiles'}
                >
                  <Icon name="FolderPlus" size={18} />
                  <span>New Folder</span>
                </button>
                {/* نمایش تعداد فایل انتخاب شده */}
                {selectedFilePaths.length > 0 && (
                  <span className="ml-2 text-xs text-primary">
                    {selectedFilePaths.length} selected
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded-l-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-text-inverse' : 'hover:bg-surface-hover'}`}>
                    <Icon name="Grid3X3" size={18} />
                  </button>
                  <button type="button" onClick={() => setViewMode('list')} className={`p-2 rounded-r-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-text-inverse' : 'hover:bg-surface-hover'}`}>
                    <Icon name="List" size={18} />
                  </button>
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-border rounded-lg px-3 py-2 bg-surface text-text-primary focus:ring-2 focus:ring-primary">
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                  <option value="modified">Sort by Modified</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
              <input
                type="text" placeholder="Search files..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 pt-0">
            {isLoading && !isCreatingNewFolder ? (
              <div className="flex items-center justify-center h-full text-text-secondary">Loading...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">{error}</div>
            ) : (Array.isArray(processedItems) ? processedItems : []).length === 0 && !isCreatingNewFolder ? (
              <div className="flex items-center justify-center h-full text-text-secondary">No items found.</div>
            ) : (
              <FileGrid
                files={processedItems}
                viewMode={viewMode}
                selectedFiles={selectedFilePaths}
                onFileSelect={(path) => {
                  if (isCreatingNewFolder) return;
                  setSelectedFilePaths(prev => 
                    prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
                  )
                }}
                onFilePreview={handleFilePreview}
                onFolderOpen={handleFolderSelect}
                isCreatingNewFolder={isCreatingNewFolder && activeFilter === 'allfiles'}
                onConfirmCreateFolder={handleConfirmCreateFolder}
                onCancelCreateFolder={handleCancelCreateFolder}
                onFileHover={setHoveredFile}
                searchQuery={searchQuery}
                draggedItem={draggedItem}
                setDraggedItem={setDraggedItem}
                dropTarget={dropTarget}
                setDropTarget={setDropTarget}
                onMoveFile={handleMoveFile}
              />
            )}
          </div>
        </main>
        <aside className="w-1/5 bg-surface border-l border-border shrink-0">
          <FilePreview file={previewFile} />
        </aside>
      </div>
      {/* Quick Preview on hover */}
      {hoveredFile && (
        <div className="fixed right-8 bottom-8 z-50 bg-background border border-border rounded-lg shadow-lg p-4 animate-fade-in">
          <div className="font-bold mb-2">{hoveredFile.name}</div>
          {hoveredFile.thumbnail && (
            <img src={hoveredFile.thumbnail} alt={hoveredFile.name} className="max-w-[200px] max-h-[200px] rounded" />
          )}
          <div className="text-xs text-text-secondary mt-2">{hoveredFile.sizeFormatted}</div>
        </div>
      )}
      {/* Upload Progress Toast */}
      {uploadQueue.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background border border-primary rounded-lg shadow-lg px-6 py-3 flex items-center gap-4 animate-fade-in">
          <Icon name="UploadCloud" size={32} className="text-primary" />
          <div>
            <div className="font-semibold text-primary">Uploading files...</div>
            <div className="flex gap-2 mt-1">
              {uploadQueue.map(up => (
                <div key={up.id} className="flex flex-col items-center">
                  <span className="text-xs">{up.name}</span>
                  <div className="w-16 h-2 bg-border rounded mt-1">
                    <div className="h-2 bg-primary rounded" style={{ width: `${up.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Drop Zone Animation */}
      {isDragOver && (
        <div className="fixed inset-0 bg-primary/10 border-4 border-dashed border-primary z-50 flex items-center justify-center pointer-events-none animate-fade-in">
          <div className="text-center">
            <Icon name="UploadCloud" size={64} color="var(--color-primary)" className="mx-auto mb-4 animate-bounce" />
            <p className="text-2xl font-semibold text-primary">Drop files to upload</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManagementWorkspace;