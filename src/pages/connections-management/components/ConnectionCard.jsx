import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ConnectionCard = ({ 
  connection, 
  isSelected, 
  onSelect, 
  onEdit, 
  onTest, 
  onReconnect 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-accent bg-accent-50';
      case 'error':
        return 'text-error bg-error-light';
      case 'warning':
        return 'text-warning bg-warning-light';
      default:
        return 'text-secondary bg-secondary-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return 'CheckCircle';
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      default:
        return 'Circle';
    }
  };

  const formatLastSync = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`
      relative bg-background border rounded-lg p-6 transition-all duration-150 ease-smooth hover:shadow-hover
      ${isSelected ? 'border-primary shadow-active' : 'border-border'}
    `}>
      {/* Selection Checkbox */}
      <div className="absolute top-4 right-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(connection.id, e.target.checked)}
          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
        />
      </div>

      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface">
            <Image
              src={connection.logo}
              alt={connection.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-medium text-text-primary truncate">
              {connection.name}
            </h3>
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${getStatusColor(connection.status)}
            `}>
              <Icon 
                name={getStatusIcon(connection.status)} 
                size={12} 
                className="mr-1"
                strokeWidth={2}
              />
              {connection.status}
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-2">
            {connection.type}
          </p>
          <p className="text-sm text-text-tertiary line-clamp-2">
            {connection.description}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-surface rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">Health</span>
            <span className="text-xs font-medium text-text-primary">
              {connection.health}%
            </span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                connection.health >= 90 ? 'bg-accent' :
                connection.health >= 70 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${connection.health}%` }}
            />
          </div>
        </div>
        <div className="bg-surface rounded-lg p-3">
          <div className="text-xs text-text-secondary mb-1">Data Transfer</div>
          <div className="text-sm font-medium text-text-primary">
            {connection.dataTransfer}
          </div>
        </div>
      </div>

      {/* Last Sync */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-text-secondary">Last sync</span>
        <span className="text-xs text-text-primary">
          {formatLastSync(connection.lastSync)}
        </span>
      </div>

      {/* Error/Warning Message */}
      {(connection.error || connection.warning) && (
        <div className={`
          p-3 rounded-lg mb-4 text-sm
          ${connection.error ? 'bg-error-light text-error' : 'bg-warning-light text-warning'}
        `}>
          <div className="flex items-start space-x-2">
            <Icon 
              name={connection.error ? "AlertCircle" : "AlertTriangle"} 
              size={16} 
              className="flex-shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <span>{connection.error || connection.warning}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
        >
          <Icon name="Settings" size={16} strokeWidth={2} />
          <span className="text-sm">Configure</span>
        </button>
        
        {connection.status === 'error' ? (
          <button
            onClick={onReconnect}
            className="flex items-center justify-center px-3 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary-700 transition-all duration-150 ease-smooth nav-focus"
          >
            <Icon name="RefreshCw" size={16} strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={onTest}
            className="flex items-center justify-center px-3 py-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
          >
            <Icon name="Zap" size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionCard;