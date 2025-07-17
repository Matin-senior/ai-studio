import React, { useState, useEffect, useRef } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

// =================== New Folder Input ===================
const NewFolderItem = ({ onConfirm, onCancel }) => {
  const [name, setName] = useState('New folder');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onConfirm(name);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      onConfirm(name);
    }, 100);
  };

  return (
    <div className="group relative bg-surface border-2 border-primary rounded-lg p-4 flex flex-col items-center justify-center text-center">
      <div className="flex items-center justify-center h-24 mb-3">
        <Icon name="Folder" size={40} className="text-primary" />
      </div>
      <div className="w-full">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full bg-background text-text-primary text-center text-sm p-1 rounded border border-primary outline-none"
        />
      </div>
    </div>
  );
};

// =================== Action Menu ===================
const FileActionMenu = ({ visible, position, onClose, onDelete, onAddToChat, onMove }) => {
  if (!visible) return null;
  return (
    <div
      className="fixed z-50 min-w-[120px] max-w-[180px] bg-background border border-border rounded-md shadow-lg py-1 animate-fade-in text-xs"
      style={{
        top: position.top,
        left: position.left,
        fontSize: '13px',
        padding: 0
      }}
      onClick={e => e.stopPropagation()}
    >
      <button className="w-full px-3 py-1.5 text-left hover:bg-surface-hover flex items-center gap-2" onClick={onAddToChat}>
        <Icon name="MessageSquare" size={13} /> Add to Chat
      </button>
      <button className="w-full px-3 py-1.5 text-left hover:bg-surface-hover flex items-center gap-2" onClick={onMove}>
        <Icon name="Move" size={13} /> Move
      </button>
      <button className="w-full px-3 py-1.5 text-left hover:bg-error/10 text-error flex items-center gap-2" onClick={onDelete}>
        <Icon name="Trash2" size={13} /> Delete
      </button>
    </div>
  );
};

// =================== Main FileGrid ===================
const FileGrid = ({
  files,
  viewMode,
  selectedFiles,
  onFileSelect,
  onFilePreview,
  onFolderOpen,
  isCreatingNewFolder,
  onConfirmCreateFolder,
  onCancelCreateFolder,
  onDeleteFile,
  onAddToChat,
  onMoveFile,
  onFileHover,
  searchQuery,
  // New props for drag & drop
  draggedItem,
  setDraggedItem,
  dropTarget,
  setDropTarget,
}) => {
  // Helpers
  const getFileIcon = (fileName) => {
    if (!fileName) return 'File';
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: 'FileText', py: 'Code', js: 'FileJson2', jsx: 'FileJson2', html: 'FileCode',
      css: 'FileCode', md: 'FileText', mp4: 'Video', mov: 'Video', mp3: 'Music',
      wav: 'Music', xls: 'Sheet', xlsx: 'Sheet', doc: 'FileText', docx: 'FileText',
      ppt: 'FileText', pptx: 'FileText', zip: 'FileArchive', rar: 'FileArchive',
      png: 'Image', jpg: 'Image', jpeg: 'Image', gif: 'Image', svg: 'Image',
      figma: 'Figma', default: 'File'
    };
    return iconMap[extension] || iconMap.default;
  };

  const getAnalysisStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const formatFileSize = (size) => {
    if (typeof size !== 'number') return size;
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = size;
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Action menu state
  const [actionMenu, setActionMenu] = useState({ visible: false, file: null, position: { top: 0, left: 0 } });
  useEffect(() => {
    if (!actionMenu.visible) return;
    const handleClick = () => setActionMenu({ ...actionMenu, visible: false });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [actionMenu]);
  const openActionMenu = (e, file) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 110;
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 4;
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - 10;
    }
    if (top + menuHeight > window.innerHeight) {
      top = rect.top + window.scrollY - menuHeight - 4;
    }
    setActionMenu({
      visible: true,
      file,
      position: { top, left }
    });
  };

// ================ DRAG START ================
const handleDragStart = (e, item) => {
  e.stopPropagation();
  e.dataTransfer.setData('internal-path', item.path); // این کلیده
  e.dataTransfer.effectAllowed = 'move';
  setDraggedItem(item);
};

// ================ DRAG END ================
const handleDragEnd = (e) => {
  e.stopPropagation();
  setDraggedItem(null);
  setDropTarget(null);
};

// ================ FOLDER DRAG ENTER ================
const handleFolderDragEnter = (e, folderPath) => {
  e.preventDefault();
  e.stopPropagation();
  if (draggedItem && draggedItem.path !== folderPath) {
    setDropTarget(files.find(f => f.path === folderPath));
  }
};

// ================ FOLDER DRAG LEAVE ================
const handleFolderDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDropTarget(null);
};

// ================ FOLDER DROP ================
const handleFolderDrop = (e, targetFolderPath) => {
  e.preventDefault();
  e.stopPropagation();

  const draggedPath = e.dataTransfer.getData('internal-path');
  if (!draggedPath) return;

  const draggedItemData = files.find(f => f.path === draggedPath);
  const targetFolder = files.find(f => f.path === targetFolderPath);

  if (draggedItemData && targetFolder?.isDirectory && draggedItemData.path !== targetFolder.path) {
    onMoveFile?.(draggedItemData, targetFolder);
  }

  handleDragEnd(e);
};


  // =================== RENDER GRID VIEW ===================
  if (viewMode === 'grid') {
    return (
      <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {isCreatingNewFolder && (
          <NewFolderItem
            onConfirm={onConfirmCreateFolder}
            onCancel={onCancelCreateFolder}
          />
        )}

        {files.map(item => {
          const isSelected = selectedFiles.includes(item.path);
          const isBeingDragged = draggedItem?.path === item.path;
          // تغییر: dropTarget همیشه آبجکت است
          const isDropTargetActive = dropTarget?.path === item.path;

          const handleDoubleClick = () => {
            if (item.isDirectory) onFolderOpen(item.path);
            else onFilePreview(item);
          };

          // Highlight search query in file name
          const getHighlightedName = () => {
            if (!searchQuery) return item.name;
            const regex = new RegExp(`(${searchQuery})`, 'gi');
            return (
              <span
                dangerouslySetInnerHTML={{
                  __html: item.name.replace(regex, match =>
                    `<mark class="bg-primary/20 text-primary">${match}</mark>`
                  )
                }}
              />
            );
          };

          // فقط setDropTarget ساده برای پوشه‌ها
          const handleFolderDragEnter = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggedItem && draggedItem.path !== item.path) {
              setDropTarget(item);
            }
          };
          const handleFolderDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropTarget(null);
          };
          const handleFolderDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const draggedPath = e.dataTransfer.getData('internal-path');
            if (!draggedPath) return;
            const draggedItemData = files.find(f => f.path === draggedPath);
            if (draggedItemData && item.isDirectory && draggedItemData.path !== item.path) {
              onMoveFile?.(draggedItemData, item);
            }
            setDropTarget(null);
          };

          return (
            <div
              key={item.path}
              className={`
                group relative bg-surface border rounded-lg p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center
                ${isSelected ? 'ring-2 ring-primary border-primary shadow-lg scale-105' : 'border-border hover:shadow-hover'}
                ${isBeingDragged ? 'opacity-40 border-dashed' : ''}
                ${isDropTargetActive ? 'scale-105 ring-2 ring-cyan-400 z-10' : ''}
              `}
              onClick={() => onFileSelect(item.path)}
              onDoubleClick={handleDoubleClick}
              draggable={true}
              onDragStart={e => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
              onContextMenu={e => openActionMenu(e, item)}
              onMouseEnter={() => onFileHover && onFileHover(item)}
              onMouseLeave={() => onFileHover && onFileHover(null)}
              // Drop target events فقط برای پوشه‌ها
              onDragEnter={item.isDirectory ? handleFolderDragEnter : undefined}
              onDragLeave={item.isDirectory ? handleFolderDragLeave : undefined}
              onDrop={item.isDirectory ? handleFolderDrop : undefined}
              onDragOver={item.isDirectory ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; } : undefined}
            >
              <div className={`absolute top-2.5 left-2.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-border bg-background'}`}>
                  {isSelected && <Icon name="Check" size={12} color="white" strokeWidth={3} />}
                </div>
              </div>

              {item.aiAnalysis && (
                <div className="absolute top-3 right-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${getAnalysisStatusColor(item.aiAnalysis)}`} title={`AI Analysis: ${item.aiAnalysis}`} />
                </div>
              )}

              <div className="flex items-center justify-center h-24 mb-3">
                {item.thumbnail ? (
                  <Image src={item.thumbnail} alt={item.name} className="max-w-full max-h-24 object-contain rounded-lg" />
                ) : (
                  <Icon name={item.isDirectory ? 'Folder' : getFileIcon(item.name)} size={40} className={item.isDirectory ? 'text-primary' : 'text-text-secondary'} />
                )}
              </div>

              <div className="w-full">
                <h3 className="text-sm font-medium text-text-primary truncate" title={item.name}>
                  {getHighlightedName()}
                </h3>
                {!item.isDirectory && <p className="text-xs text-text-tertiary mt-1">{formatFileSize(item.size)}</p>}
              </div>

              <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-center space-x-1">
                  <button
                    onClick={e => { e.stopPropagation(); onFilePreview(item); }}
                    className="p-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-md hover:bg-surface-hover transition-colors"
                    title="Preview"
                  >
                    <Icon name="Eye" size={14} className="text-text-secondary" />
                  </button>
                  <button
                    onClick={e => openActionMenu(e, item)}
                    className="p-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-md hover:bg-surface-hover transition-colors"
                    title="More Actions"
                  >
                    <Icon name="MoreHorizontal" size={14} className="text-text-secondary" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <FileActionMenu
          visible={actionMenu.visible}
          position={actionMenu.position}
          onClose={() => setActionMenu({ ...actionMenu, visible: false })}
          onDelete={() => { onDeleteFile && onDeleteFile(actionMenu.file); setActionMenu({ ...actionMenu, visible: false }); }}
          onAddToChat={() => { onAddToChat && onAddToChat(actionMenu.file); setActionMenu({ ...actionMenu, visible: false }); }}
          onMove={() => { onMoveFile && onMoveFile(actionMenu.file); setActionMenu({ ...actionMenu, visible: false }); }}
        />
      </div>
    );
  }

  // =================== RENDER LIST VIEW ===================
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-12 gap-4 px-4 py-4 text-xs font-medium text-text-secondary border-b border-border sticky top-0 bg-background z-10">
        <div className="col-span-1"></div>
        <div className="col-span-5">Name</div>
        <div className="col-span-3">Last Modified</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2 text-right">Size</div>
      </div>

      {isCreatingNewFolder && (
        <div className="group grid grid-cols-12 gap-4 items-center px-4 py-2.5 rounded-lg bg-surface-hover">
          <div className="col-span-1"></div>
          <div className="col-span-11 flex items-center space-x-3">
            <Icon name="Folder" size={20} className="text-primary flex-shrink-0" />
            <div className="flex-1">
              <NewFolderItem onConfirm={onConfirmCreateFolder} onCancel={onCancelCreateFolder} />
            </div>
          </div>
        </div>
      )}

      {files.map(item => {
        const isSelected = selectedFiles.includes(item.path);
        const isBeingDragged = draggedItem?.path === item.path;
        const isDropTargetActive = dropTarget?.path === item.path;

        const handleDoubleClick = () => {
          if (item.isDirectory) onFolderOpen(item.path);
          else onFilePreview(item);
        };

        // Highlight search query in file name
        const getHighlightedName = () => {
          if (!searchQuery) return item.name;
          const regex = new RegExp(`(${searchQuery})`, 'gi');
          return (
            <span
              dangerouslySetInnerHTML={{
                __html: item.name.replace(regex, match =>
                  `<mark class=\"bg-primary/20 text-primary\">${match}</mark>`
                )
              }}
            />
          );
        };

        // فقط setDropTarget ساده برای پوشه‌ها
        const handleFolderDragEnter = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (draggedItem && draggedItem.path !== item.path) {
            setDropTarget(item);
          }
        };
        const handleFolderDragLeave = (e) => {
          e.preventDefault();
          e.stopPropagation();
          setDropTarget(null);
        };
        const handleFolderDrop = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const draggedPath = e.dataTransfer.getData('internal-path');
          if (!draggedPath) return;
          const draggedItemData = files.find(f => f.path === draggedPath);
          if (draggedItemData && item.isDirectory && draggedItemData.path !== item.path) {
            onMoveFile?.(draggedItemData, item);
          }
          setDropTarget(null);
        };

        return (
          <div
            key={item.path}
            className={
              `
                group grid grid-cols-12 gap-4 items-center px-4 py-2.5 rounded-lg transition-colors cursor-pointer
                ${isSelected ? 'bg-primary/10' : 'hover:bg-surface-hover'}
                ${isBeingDragged ? 'opacity-40 border-dashed' : ''}
                ${isDropTargetActive ? 'scale-105 ring-2 ring-cyan-400 z-10' : ''}
              `
            }
            onClick={() => onFileSelect(item.path)}
            onDoubleClick={handleDoubleClick}
            draggable={true}
            onDragStart={e => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
            onContextMenu={e => openActionMenu(e, item)}
            onMouseEnter={() => onFileHover && onFileHover(item)}
            onMouseLeave={() => onFileHover && onFileHover(null)}
            // Drop target events فقط برای پوشه‌ها
            onDragEnter={item.isDirectory ? handleFolderDragEnter : undefined}
            onDragLeave={item.isDirectory ? handleFolderDragLeave : undefined}
            onDrop={item.isDirectory ? handleFolderDrop : undefined}
            onDragOver={item.isDirectory ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; } : undefined}
          >
            <div className="col-span-1 flex items-center">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                {isSelected && <Icon name="Check" size={10} color="white" strokeWidth={3} />}
              </div>
            </div>

            <div className="col-span-5 flex items-center space-x-3 overflow-hidden">
              <Icon name={item.isDirectory ? 'Folder' : getFileIcon(item.name)} size={20} className={(item.isDirectory ? 'text-primary' : 'text-text-secondary') + " flex-shrink-0"} />
              <span className="text-sm font-medium text-text-primary truncate" title={item.name}>
                {getHighlightedName()}
              </span>
            </div>

            <div className="col-span-3 flex items-center">
              <span className="text-sm text-text-secondary">{formatDate(item.modified)}</span>
            </div>

            <div className="col-span-1 flex items-center">
              {item.aiAnalysis && (
                <div className={`w-2 h-2 rounded-full ${getAnalysisStatusColor(item.aiAnalysis)}`} title={`AI Analysis: ${item.aiAnalysis}`} />
              )}
            </div>

            <div className="col-span-2 flex items-center justify-end">
              <div className="text-sm text-text-secondary group-hover:opacity-0 transition-opacity">
                {!item.isDirectory && formatFileSize(item.size)}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onFilePreview(item); }}
                  className="p-1 hover:bg-surface rounded transition-colors"
                  title="Preview"
                >
                  <Icon name="Eye" size={16} className="text-text-secondary" />
                </button>
                <button
                  onClick={(e) => openActionMenu(e, item)}
                  className="p-1 hover:bg-surface rounded transition-colors"
                  title="More Actions"
                >
                  <Icon name="MoreHorizontal" size={16} className="text-text-secondary" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <FileActionMenu
        visible={actionMenu.visible}
        position={actionMenu.position}
        onClose={() => setActionMenu({ ...actionMenu, visible: false })}
        onDelete={() => { onDeleteFile && onDeleteFile(actionMenu.file); setActionMenu({ ...actionMenu, visible: false }); }}
        onAddToChat={() => { onAddToChat && onAddToChat(actionMenu.file); setActionMenu({ ...actionMenu, visible: false }); }}
        onMove={() => { onMoveFile && onMoveFile(actionMenu.file); setActionMenu({ ...actionMenu, visible: false }); }}
      />
    </div>
  );
};

export default FileGrid;

