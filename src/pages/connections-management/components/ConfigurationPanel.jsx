import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ConfigurationPanel = ({ connection, onClose, onSave }) => {
  const [config, setConfig] = useState({ ...connection.config });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      setTestResult({
        success,
        message: success 
          ? 'Connection test successful!' :'Connection failed: Invalid credentials or network error'
      });
      setIsTestingConnection(false);
    }, 2000);
  };

  const handleSave = () => {
    const updatedConnection = {
      ...connection,
      config
    };
    onSave(updatedConnection);
  };

  const renderConfigField = (key, value) => {
    const isPassword = key.toLowerCase().includes('password') || 
                      key.toLowerCase().includes('secret') || 
                      key.toLowerCase().includes('key');
    
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-medium text-text-primary capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <div className="bg-surface rounded-lg p-3">
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey} className="flex justify-between items-center py-1">
                <span className="text-sm text-text-secondary capitalize">
                  {subKey.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-sm text-text-primary">
                  {Array.isArray(subValue) ? subValue.join(', ') : String(subValue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="space-y-2">
        <label className="block text-sm font-medium text-text-primary capitalize">
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </label>
        <input
          type={isPassword ? 'password' : 'text'}
          value={value || ''}
          onChange={(e) => handleConfigChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
        />
      </div>
    );
  };

  return (
    <div className="w-96 bg-background border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface">
            <Image
              src={connection.logo}
              alt={connection.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-text-primary">
              {connection.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {connection.type} Configuration
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
        >
          <Icon name="X" size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Status */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-text-primary">Connection Status</span>
          <div className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${connection.status === 'connected' ? 'text-accent bg-accent-50' :
              connection.status === 'error'? 'text-error bg-error-light' : 'text-warning bg-warning-light'}
          `}>
            <Icon 
              name={connection.status === 'connected' ? 'CheckCircle' : 
                    connection.status === 'error' ? 'XCircle' : 'AlertTriangle'} 
              size={12} 
              className="mr-1"
              strokeWidth={2}
            />
            {connection.status}
          </div>
        </div>

        {connection.error && (
          <div className="bg-error-light text-error p-3 rounded-lg text-sm mb-4">
            <div className="flex items-start space-x-2">
              <Icon name="AlertCircle" size={16} className="flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>{connection.error}</span>
            </div>
          </div>
        )}

        {connection.warning && (
          <div className="bg-warning-light text-warning p-3 rounded-lg text-sm mb-4">
            <div className="flex items-start space-x-2">
              <Icon name="AlertTriangle" size={16} className="flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>{connection.warning}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface rounded-lg p-3">
            <div className="text-xs text-text-secondary mb-1">Health</div>
            <div className="text-lg font-semibold text-text-primary">
              {connection.health}%
            </div>
          </div>
          <div className="bg-surface rounded-lg p-3">
            <div className="text-xs text-text-secondary mb-1">Data Transfer</div>
            <div className="text-lg font-semibold text-text-primary">
              {connection.dataTransfer}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="flex-1 overflow-y-auto p-6">
        <h4 className="text-sm font-medium text-text-primary mb-4">
          Configuration Settings
        </h4>
        <div className="space-y-4">
          {Object.entries(config).map(([key, value]) => renderConfigField(key, value))}
        </div>

        {/* Test Connection */}
        <div className="mt-6 pt-6 border-t border-border">
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTestingConnection ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Icon name="Zap" size={16} strokeWidth={2} />
                <span>Test Connection</span>
              </>
            )}
          </button>

          {testResult && (
            <div className={`
              mt-3 p-3 rounded-lg text-sm
              ${testResult.success ? 'bg-accent-50 text-accent' : 'bg-error-light text-error'}
            `}>
              <div className="flex items-start space-x-2">
                <Icon 
                  name={testResult.success ? "CheckCircle" : "XCircle"} 
                  size={16} 
                  className="flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <span>{testResult.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center space-x-3 p-6 border-t border-border">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-primary text-text-inverse px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-all duration-150 ease-smooth nav-focus"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ConfigurationPanel;