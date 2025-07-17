import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const FilePreview = ({ file }) => {
  if (!file) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <Icon name="FileText" size={48} color="var(--color-text-tertiary)" className="mx-auto mb-4" />
          <p className="text-text-tertiary">Select a file to preview</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type) => {
    const iconMap = {
      pdf: 'FileText',
      figma: 'Figma',
      python: 'Code',
      markdown: 'FileText',
      video: 'Video',
      excel: 'Sheet',
      image: 'Image',
      default: 'File'
    };
    return iconMap[type] || iconMap.default;
  };

  const getAnalysisStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'text-accent', text: 'Analysis Complete', icon: 'CheckCircle' };
      case 'processing':
        return { color: 'text-warning', text: 'Processing...', icon: 'Clock' };
      case 'pending':
        return { color: 'text-text-tertiary', text: 'Pending Analysis', icon: 'Circle' };
      default:
        return { color: 'text-text-tertiary', text: 'Unknown', icon: 'Circle' };
    }
  };

  const analysisStatus = getAnalysisStatusInfo(file.aiAnalysis);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary mb-2">File Preview</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* File Thumbnail/Icon */}
        <div className="text-center mb-6">
          {file.thumbnail ? (
            <Image
              src={file.thumbnail}
              alt={file.name}
              className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
            />
          ) : (
            <div className="w-32 h-32 bg-surface rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon 
                name={getFileIcon(file.type)} 
                size={48} 
                color="var(--color-text-secondary)" 
              />
            </div>
          )}
          <h4 className="font-medium text-text-primary break-words">{file.name}</h4>
        </div>

        {/* File Details */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">File Size</label>
            <p className="text-sm text-text-primary mt-1">{file.size}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Modified</label>
            <p className="text-sm text-text-primary mt-1">{formatDate(file.modified)}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">File Type</label>
            <p className="text-sm text-text-primary mt-1 capitalize">{file.type}</p>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Brain" size={16} color="var(--color-primary)" />
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">AI Analysis</label>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <Icon 
              name={analysisStatus.icon} 
              size={16} 
              className={analysisStatus.color}
            />
            <span className={`text-sm font-medium ${analysisStatus.color}`}>
              {analysisStatus.text}
            </span>
          </div>

          {file.aiAnalysis === 'completed' && file.summary && (
            <div className="bg-surface rounded-lg p-3 mb-3">
              <p className="text-sm text-text-primary">{file.summary}</p>
            </div>
          )}

          {file.aiAnalysis === 'processing' && (
            <div className="bg-surface rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin">
                  <Icon name="Loader2" size={16} color="var(--color-warning)" />
                </div>
                <span className="text-sm text-text-secondary">Analyzing file content...</span>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {file.tags && file.tags.length > 0 && (
          <div className="mb-6">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {file.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button className="w-full flex items-center justify-center space-x-2 bg-primary text-text-inverse py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
            <Icon name="MessageSquare" size={16} />
            <span>Add to Chat</span>
          </button>
          
          <button className="w-full flex items-center justify-center space-x-2 border border-border py-2 px-4 rounded-lg hover:bg-surface-hover transition-colors">
            <Icon name="Download" size={16} color="var(--color-text-secondary)" />
            <span className="text-text-secondary">Download</span>
          </button>
          
          <button className="w-full flex items-center justify-center space-x-2 border border-border py-2 px-4 rounded-lg hover:bg-surface-hover transition-colors">
            <Icon name="Share" size={16} color="var(--color-text-secondary)" />
            <span className="text-text-secondary">Share</span>
          </button>

          {file.aiAnalysis === 'pending' && (
            <button className="w-full flex items-center justify-center space-x-2 border border-accent text-accent py-2 px-4 rounded-lg hover:bg-accent/5 transition-colors">
              <Icon name="Brain" size={16} />
              <span>Analyze with AI</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;