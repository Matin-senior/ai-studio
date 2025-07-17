import React from 'react';
import Icon from 'components/AppIcon';

const BulkOperations = ({ selectedCount, onClearSelection }) => {
  const handleBulkDownload = () => {
    console.log('Bulk download initiated');
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete initiated');
  };

  const handleBulkUpdate = () => {
    console.log('Bulk update initiated');
  };

  return (
    <div className="flex items-center space-x-3 bg-surface border border-border rounded-lg p-3">
      <div className="flex items-center space-x-2">
        <Icon name="CheckSquare" size={16} color="var(--color-primary)" strokeWidth={2} />
        <span className="text-sm font-medium text-text-primary">
          {selectedCount} selected
        </span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleBulkDownload}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-700 hover:bg-primary/5 rounded transition-all duration-150"
        >
          <Icon name="Download" size={14} strokeWidth={2} />
          <span>Download</span>
        </button>
        
        <button
          onClick={handleBulkUpdate}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-accent hover:text-accent-700 hover:bg-accent/5 rounded transition-all duration-150"
        >
          <Icon name="RefreshCw" size={14} strokeWidth={2} />
          <span>Update</span>
        </button>
        
        <button
          onClick={handleBulkDelete}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-error hover:text-red-700 hover:bg-error/5 rounded transition-all duration-150"
        >
          <Icon name="Trash2" size={14} strokeWidth={2} />
          <span>Delete</span>
        </button>
        
        <button
          onClick={onClearSelection}
          className="flex items-center justify-center w-6 h-6 text-text-tertiary hover:text-text-primary hover:bg-surface-hover rounded transition-all duration-150"
        >
          <Icon name="X" size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default BulkOperations;