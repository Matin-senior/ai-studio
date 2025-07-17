import React, { useState } from 'react';
import Icon from 'components/AppIcon';

import ConnectionCard from './components/ConnectionCard';
import ConnectionWizard from './components/ConnectionWizard';
import ConfigurationPanel from './components/ConfigurationPanel';
import ConnectionSidebar from './components/ConnectionSidebar';

const ConnectionsManagement = () => {
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConnections, setSelectedConnections] = useState([]);

  // Mock data for connections
  const connections = [
    {
      id: 1,
      name: "OpenAI API",
      type: "API",
      category: "apis",
      status: "connected",
      logo: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=64&h=64&fit=crop&crop=center",
      lastSync: new Date(Date.now() - 300000),
      health: 98,
      dataTransfer: "2.3 GB",
      description: "GPT-4 and ChatGPT API integration for AI conversations",
      config: {
        apiKey: "sk-*********************",
        model: "gpt-4",
        maxTokens: 4096,
        temperature: 0.7
      }
    },
    {
      id: 2,
      name: "PostgreSQL",
      type: "Database",
      category: "databases",
      status: "connected",
      logo: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=64&h=64&fit=crop&crop=center",
      lastSync: new Date(Date.now() - 600000),
      health: 95,
      dataTransfer: "1.8 GB",
      description: "Primary database for storing chat history and user data",
      config: {
        host: "localhost",
        port: 5432,
        database: "ai_studio",
        username: "admin"
      }
    },
    {
      id: 3,
      name: "AWS S3",
      type: "Cloud Storage",
      category: "cloud",
      status: "error",
      logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=64&h=64&fit=crop&crop=center",
      lastSync: new Date(Date.now() - 3600000),
      health: 0,
      dataTransfer: "0 GB",
      description: "File storage and backup service",
      error: "Authentication failed - Invalid access key",
      config: {
        accessKey: "AKIA***************",
        secretKey: "*********************",
        bucket: "ai-studio-files",
        region: "us-east-1"
      }
    },
    {
      id: 4,
      name: "Slack Webhook",
      type: "Webhook",
      category: "webhooks",
      status: "connected",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=64&h=64&fit=crop&crop=center",
      lastSync: new Date(Date.now() - 900000),
      health: 100,
      dataTransfer: "45 MB",
      description: "Notifications and alerts integration",
      config: {
        webhookUrl: "https://hooks.slack.com/services/***",
        channel: "#ai-studio-alerts",
        username: "AI Studio Bot"
      }
    },
    {
      id: 5,
      name: "GitHub API",
      type: "API",
      category: "apis",
      status: "connected",
      logo: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=64&h=64&fit=crop&crop=center",
      lastSync: new Date(Date.now() - 1200000),
      health: 92,
      dataTransfer: "156 MB",
      description: "Repository access and code analysis integration",
      config: {
        token: "ghp_*********************",
        organization: "ai-studio-org",
        repositories: ["main-repo", "extensions"]
      }
    },
    {
      id: 6,
      name: "Redis Cache",
      type: "Database",
      category: "databases",
      status: "warning",
      logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=64&h=64&fit=crop&crop=center",
      lastSync: new Date(Date.now() - 1800000),
      health: 75,
      dataTransfer: "892 MB",
      description: "Session storage and caching layer",
      warning: "High memory usage - 85% capacity",
      config: {
        host: "redis.example.com",
        port: 6379,
        password: "*********************",
        database: 0
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Connections', count: connections.length, icon: 'Globe' },
    { id: 'apis', name: 'APIs', count: connections.filter(c => c.category === 'apis').length, icon: 'Zap' },
    { id: 'databases', name: 'Databases', count: connections.filter(c => c.category === 'databases').length, icon: 'Database' },
    { id: 'cloud', name: 'Cloud Services', count: connections.filter(c => c.category === 'cloud').length, icon: 'Cloud' },
    { id: 'webhooks', name: 'Webhooks', count: connections.filter(c => c.category === 'webhooks').length, icon: 'Webhook' }
  ];

  const filteredConnections = connections.filter(connection => {
    const matchesCategory = selectedCategory === 'all' || connection.category === selectedCategory;
    const matchesSearch = connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connection.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConnectionSelect = (connection) => {
    setSelectedConnection(connection);
    setShowConfigPanel(true);
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on connections:`, selectedConnections);
    // Handle bulk actions
  };

  const handleTestConnection = (connectionId) => {
    console.log(`Testing connection ${connectionId}`);
    // Handle connection testing
  };

  const handleReconnect = (connectionId) => {
    console.log(`Reconnecting ${connectionId}`);
    // Handle reconnection
  };

  return (
    <div className="min-h-screen bg-background pt-12">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <ConnectionSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-background border-b border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-text-primary mb-2">
                  Connections Management
                </h1>
                <p className="text-text-secondary">
                  Configure and monitor external integrations and API connections
                </p>
              </div>
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center space-x-2 bg-primary text-text-inverse px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-all duration-150 ease-smooth nav-focus"
              >
                <Icon name="Plus" size={20} strokeWidth={2} />
                <span>Add Connection</span>
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Icon 
                    name="Search" 
                    size={20} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary"
                  />
                  <input
                    type="text"
                    placeholder="Search connections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {selectedConnections.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-text-secondary">
                      {selectedConnections.length} selected
                    </span>
                    <select
                      onChange={(e) => handleBulkAction(e.target.value)}
                      className="px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Bulk Actions</option>
                      <option value="test">Test Connections</option>
                      <option value="reconnect">Reconnect All</option>
                      <option value="disable">Disable</option>
                      <option value="delete">Delete</option>
                    </select>
                  </div>
                )}

                <button className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus">
                  <Icon name="Filter" size={18} strokeWidth={2} />
                  <span>Filter</span>
                </button>

                <button className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus">
                  <Icon name="RefreshCw" size={18} strokeWidth={2} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Connections Grid */}
          <div className="flex-1 overflow-auto p-6">
            {filteredConnections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
                  <Icon name="Search" size={32} color="var(--color-secondary)" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">No connections found</h3>
                <p className="text-text-secondary mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first connection'}
                </p>
                <button
                  onClick={() => setShowWizard(true)}
                  className="flex items-center space-x-2 bg-primary text-text-inverse px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-all duration-150 ease-smooth nav-focus"
                >
                  <Icon name="Plus" size={18} strokeWidth={2} />
                  <span>Add Connection</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConnections.map((connection) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    isSelected={selectedConnections.includes(connection.id)}
                    onSelect={(id, selected) => {
                      if (selected) {
                        setSelectedConnections([...selectedConnections, id]);
                      } else {
                        setSelectedConnections(selectedConnections.filter(cId => cId !== id));
                      }
                    }}
                    onEdit={() => handleConnectionSelect(connection)}
                    onTest={() => handleTestConnection(connection.id)}
                    onReconnect={() => handleReconnect(connection.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfigPanel && selectedConnection && (
          <ConfigurationPanel
            connection={selectedConnection}
            onClose={() => {
              setShowConfigPanel(false);
              setSelectedConnection(null);
            }}
            onSave={(updatedConnection) => {
              console.log('Saving connection:', updatedConnection);
              setShowConfigPanel(false);
              setSelectedConnection(null);
            }}
          />
        )}
      </div>

      {/* Connection Wizard Modal */}
      {showWizard && (
        <ConnectionWizard
          onClose={() => setShowWizard(false)}
          onComplete={(newConnection) => {
            console.log('New connection created:', newConnection);
            setShowWizard(false);
          }}
        />
      )}
    </div>
  );
};

export default ConnectionsManagement;