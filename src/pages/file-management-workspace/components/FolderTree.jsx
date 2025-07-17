import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const FolderTree = ({ folders, selectedFolder, onFolderSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState(['root']);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const renderFolder = (folder, depth = 0) => {
    const isExpanded = expandedFolders.includes(folder.id);
    const isSelected = selectedFolder === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id}>
        <button
          onClick={() => {
            onFolderSelect(folder.id);
            if (hasChildren) {
              toggleFolder(folder.id);
            }
          }}
          className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
            isSelected 
              ? 'bg-primary text-text-inverse' :'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren && (
            <Icon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              size={14} 
              className="flex-shrink-0"
            />
          )}
          {!hasChildren && <div className="w-3.5" />}
          <Icon 
            name={isExpanded ? "FolderOpen" : "Folder"} 
            size={16} 
            className="flex-shrink-0"
          />
          <span className="text-sm font-medium truncate">{folder.name}</span>
        </button>
        
        {isExpanded && hasChildren && (
          <div>
            {folder.children.map(child => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      {folders.map(folder => renderFolder(folder))}
    </div>
  );
};

export default FolderTree;