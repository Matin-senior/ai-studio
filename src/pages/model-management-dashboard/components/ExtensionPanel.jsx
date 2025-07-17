import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ExtensionPanel = ({ extensions }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExtensions = extensions.filter(ext =>
    ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ext.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleExtension = (extensionId) => {
    // Mock toggle functionality
    console.log(`Toggling extension: ${extensionId}`);
  };

  const handleUpdateExtension = (extensionId) => {
    // Mock update functionality
    console.log(`Updating extension: ${extensionId}`);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Icon 
          name="Search" 
          size={20} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" 
          strokeWidth={2}
        />
        <input
          type="text"
          placeholder="Search extensions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150"
        />
      </div>

      {/* Extensions List */}
      <div className="space-y-4">
        {filteredExtensions.map(extension => (
          <div 
            key={extension.id}
            className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <Icon name="Puzzle" size={20} color="var(--color-primary)" strokeWidth={2} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-text-primary">{extension.name}</h3>
                    <span className="text-xs text-text-tertiary bg-surface-hover px-2 py-0.5 rounded">
                      v{extension.version}
                    </span>
                    {extension.hasUpdate && (
                      <span className="text-xs bg-warning-light text-warning px-2 py-0.5 rounded">
                        Update Available
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-2">
                    {extension.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-text-tertiary">
                    <span>By {extension.author}</span>
                    <span>•</span>
                    <span>{extension.compatibility.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center space-x-3">
                {extension.hasUpdate && (
                  <button
                    onClick={() => handleUpdateExtension(extension.id)}
                    className="flex items-center space-x-1 text-warning hover:text-warning-600 transition-colors duration-150"
                  >
                    <Icon name="Download" size={16} strokeWidth={2} />
                    <span className="text-sm font-medium">Update</span>
                  </button>
                )}
                
                <button
                  onClick={() => handleToggleExtension(extension.id)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                    ${extension.isEnabled ? 'bg-primary' : 'bg-surface-hover'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                      ${extension.isEnabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>

            {/* Extension Status */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <div className={`
                  w-2 h-2 rounded-full
                  ${extension.isEnabled ? 'bg-accent' : 'bg-text-tertiary'}
                `} />
                <span className="text-sm text-text-secondary">
                  {extension.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <button className="text-sm text-text-tertiary hover:text-text-primary transition-colors duration-150">
                <Icon name="Settings" size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredExtensions.length === 0 && (
        <div className="text-center py-8">
          <div className="flex items-center justify-center w-16 h-16 bg-surface rounded-full mx-auto mb-4">
            <Icon name="Puzzle" size={24} color="var(--color-text-tertiary)" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No extensions found</h3>
          <p className="text-text-secondary">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default ExtensionPanel;