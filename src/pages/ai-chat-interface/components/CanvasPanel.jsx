// src/pages/ai-chat-interface/components/CanvasPanel.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import CodeEditor from 'components/CodeEditor';
import StatsPanel from 'components/StatsPanel';


const CanvasPanel = ({ uploadedFiles, code, setCode }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('code');

  const tabs = [
    { id: 'code', label: t('canvas.tabs.codeEditor'), icon: 'Code' },
    { id: 'analytics', label: t('canvas.tabs.analytics'), icon: 'BarChart3' },
    { id: 'files', label: t('canvas.tabs.files'), icon: 'FolderOpen' }
  ];

  const handleCodeChange = (newCode, language) => {
    setCode(newCode);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return t('canvas.fileSize.bytes', { count: 0 });
    const k = 1024;
    const sizes = [
      t('canvas.fileSize.bytes', { count: 0 }),
      t('canvas.fileSize.kb'),
      t('canvas.fileSize.mb'),
      t('canvas.fileSize.gb')
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderCodeTab = () => (
    <div className="h-full p-3">
      <CodeEditor
        initialCode={code}
        language="javascript"
        onCodeChange={handleCodeChange}
        className="h-full"
      />
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="h-full overflow-y-auto p-3">
      <StatsPanel />
    </div>
  );

  const renderFilesTab = () => (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-medium text-text-primary">{t('canvas.files.title')}</h3>
        <p className="text-xs text-text-secondary mt-1">{t('canvas.files.count', { count: uploadedFiles.length })}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {uploadedFiles.length > 0 ? (
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="border border-border rounded-lg p-3 hover:bg-surface-hover transition-all duration-150 ease-smooth">
                {file.type?.startsWith('image/') ? (
                  <div className="mb-2">
                    <Image
                      src={file.url}
                      alt={file.name}
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-20 bg-surface rounded mb-2">
                    <Icon name="File" size={28} className="text-text-tertiary" strokeWidth={1.5} />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                  <p className="text-xs text-text-secondary">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <button className="flex-1 px-2 py-1 text-xs bg-primary text-text-inverse rounded hover:bg-primary-700 transition-all duration-150 ease-smooth nav-focus">
                    {t('canvas.files.preview')}
                  </button>
                  <button className="px-2 py-1 text-xs border border-border rounded text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus">
                    <Icon name="Download" size={12} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="FolderOpen" size={32} className="text-text-tertiary mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-text-secondary text-sm">{t('canvas.files.empty')}</p>
            <p className="text-text-tertiary text-xs mt-1">{t('canvas.files.emptyHint')}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 p-2.5 text-sm transition-all duration-150 ease-smooth nav-focus ${
              activeTab === tab.id
                ? 'bg-primary text-text-inverse border-b-2 border-primary' :'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Icon name={tab.icon} size={14} strokeWidth={2} />
            <span className="hidden sm:inline text-xs">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' && renderCodeTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'files' && renderFilesTab()}
      </div>
    </div>
  );
};

export default CanvasPanel;