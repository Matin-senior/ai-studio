import React from 'react';
import Icon from 'components/AppIcon';

const UploadProgress = ({ uploads }) => {
  const formatFileSize = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-text-primary">Uploading Files</h3>
          <span className="text-sm text-text-secondary">{uploads.length} file{uploads.length > 1 ? 's' : ''}</span>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {uploads.map(upload => (
          <div key={upload.id} className="p-4 border-b border-border last:border-b-0">
            <div className="flex items-center space-x-3 mb-2">
              <Icon name="File" size={16} color="var(--color-text-secondary)" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{upload.name}</p>
                <p className="text-xs text-text-tertiary">{formatFileSize(upload.size)}</p>
              </div>
              <span className="text-sm text-text-secondary">{upload.progress}%</span>
            </div>
            
            <div className="w-full bg-surface rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${upload.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadProgress;