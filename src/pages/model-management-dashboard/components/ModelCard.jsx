import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ModelCard = ({ 
  model, 
  isSelected, 
  onSelect, 
  onDownload, 
  downloadProgress, 
  showUsageStats = false 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatSize = (size) => {
    return size; 
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      'Language Model': 'MessageSquare',
      'Image Generation': 'Image',
      'Speech Recognition': 'Mic',
      'Code Generation': 'Code'
    };
    return iconMap[type] || 'Brain';
  };

  const getTypeColor = (type) => {
    const colorMap = {
      'Language Model': 'text-blue-600',
      'Image Generation': 'text-purple-600',
      'Speech Recognition': 'text-green-600',
      'Code Generation': 'text-orange-600'
    };
    return colorMap[type] || 'text-text-secondary';
  };

  const isDownloading = downloadProgress !== undefined && downloadProgress > 0 && downloadProgress < 100;
  const isDownloadFailed = downloadProgress === -1;

  const Tooltip = ({ children, text }) => (
    <div className="group relative flex justify-center">
      {children}
      <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-black text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
        {text}
      </span>
    </div>
  );

  return (
    <div className={`
      bg-surface border rounded-xl p-4 transition-all duration-200 hover:shadow-md
      ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-border-focus'}
      flex flex-col min-h-[250px]
    `}>
      {/* Header (تصویر، نام مدل، ورژن، آیکون لینک، نوع، حجم) */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-hover">
            <Image
              src={model.thumbnail}
              alt={model.name}
              className="w-full h-full object-cover"
            />
          </div>
          {model.isDownloaded && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
              <Icon name="Check" size={10} color="white" strokeWidth={2.5} />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="font-semibold text-text-primary text-base truncate flex-1 pr-2">
              {model.name.length > 20 ? `${model.name.substring(0, 20)}...` : model.name}
            </h3>
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xs text-text-tertiary bg-surface-hover px-1.5 py-0.5 rounded truncate">
                v{model.version}
              </span>
              {model.modelPageUrl && (
                <Tooltip text="View on Ollama.com">
                  <a 
                    href={model.modelPageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-text-secondary hover:text-primary transition-colors duration-150 flex-shrink-0 ml-1"
                    aria-label={`View ${model.name} on Ollama.com`}
                  >
                    <Icon name="ExternalLink" size={12} />
                  </a>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <Icon 
              name={getTypeIcon(model.type)} 
              size={12} 
              className={getTypeColor(model.type)}
              strokeWidth={2}
            />
            <span className="text-sm text-text-secondary">{model.type}</span>
            <span className="text-xs text-text-tertiary">•</span>
            <span className="text-sm text-text-secondary">{formatSize(model.size)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-5 h-5 p-0.5 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors duration-150 flex items-center justify-center"
            aria-label={showDetails ? "Collapse details" : "Expand details"}
          >
            <Icon 
              name={showDetails ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              strokeWidth={2}
            />
          </button>


          <button
            onClick={onSelect}
            className={`
              w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 
              ${isSelected 
                ? 'bg-primary border-primary' : 'border-border hover:border-primary'
              }
            `}
            aria-label={isSelected ? "Deselect model" : "Select model"}
          >
            {isSelected && (
              <Icon name="Check" size={12} color="white" strokeWidth={2.5} />
            )}
          </button>
          

        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
        {model.description}
      </p>

      {/* Usage Stats (for downloaded models) */}
      {showUsageStats && model.isDownloaded && (
        <div className="grid grid-cols-2 gap-3 mb-3 p-2 bg-background rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-text-primary">
              {formatNumber(model.usageStats.requests)}
            </div>
            <div className="text-xs text-text-secondary">Requests</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-text-primary">
              {formatNumber(model.usageStats.tokens)}
            </div>
            <div className="text-xs text-text-secondary">Tokens</div>
          </div>
        </div>
      )}

      {/* Download Progress */}
      {isDownloading && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-text-secondary">Downloading...</span>
            <span className="text-sm font-medium text-text-primary">{downloadProgress}%</span>
          </div>
          <div className="w-full bg-surface-hover rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}
      {isDownloadFailed && (
        <div className="mb-3 text-center text-error">
          <Icon name="AlertTriangle" size={14} className="inline mr-1" />
          <span className="text-sm font-medium">Download Failed!</span>
        </div>
      )}

      {/* Compatibility Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {model.compatibility.map(comp => (
          <span 
            key={comp}
            className="text-xs bg-surface-hover text-text-secondary px-1.5 py-0.5 rounded"
          >
            {comp}
          </span>
        ))}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t border-border pt-3 mt-3 space-y-2">
          {model.suggested_use_cases && model.suggested_use_cases.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-text-primary mb-1">Suggested Use Cases</h4>
              <div className="flex flex-wrap gap-1">
                {model.suggested_use_cases.map(useCase => (
                  <span key={useCase} className="text-xs bg-primary/10 text-primary-600 px-1.5 py-0.5 rounded-full">
                    {useCase}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-1">System Requirements</h4>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">RAM:</span>
                <span className="text-text-primary">{model.requirements.ram}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">VRAM:</span>
                <span className="text-text-primary">{model.requirements.vram}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Disk Space:</span>
                <span className="text-text-primary">{model.requirements.storage}</span>
              </div>
            </div>
          </div>
          {model.modelPageUrl && (
            <div className="text-center pt-1">
              <a 
                href={model.modelPageUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-primary hover:underline flex items-center justify-center font-medium"
              >
                <Icon name="ExternalLink" size={12} className="mr-1" />
                View Full Details on Ollama.com
              </a>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto flex space-x-3 pt-3">
        {!model.isDownloaded ? (
          <button
            onClick={onDownload}
            disabled={isDownloading || isDownloadFailed || model.status === 'offline'}
            className="flex-1 flex items-center justify-center space-x-2 bg-primary text-text-inverse px-3 py-1.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          >
            <Icon name={isDownloading ? "Loader" : "Download"} size={14} strokeWidth={2} className={isDownloading ? "animate-spin" : ""}/>
            <span>{isDownloading ? `${downloadProgress}%` : isDownloadFailed ? "Retry" : "Download"}</span>
          </button>
        ) : (
          <>
            <button className="flex-1 flex items-center justify-center space-x-2 bg-accent text-text-inverse px-3 py-1.5 rounded-lg font-medium hover:bg-accent-700 transition-all duration-150">
              <Icon name="Play" size={14} strokeWidth={2} />
              <span>Activate</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-surface-hover text-text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-surface border border-border transition-all duration-150">
              <Icon name="Settings" size={14} strokeWidth={2} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ModelCard;