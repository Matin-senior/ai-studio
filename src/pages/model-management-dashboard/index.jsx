import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import ModelCard from './components/ModelCard';
import ExtensionPanel from './components/ExtensionPanel';
import SystemInfo from './components/SystemInfo';
import BulkOperations from './components/BulkOperations';

// ✅ Import recommended models data as the primary source for models to display
import recommendedOllamaModelsData from '../../data/ollama_recommended_models.json'; 

// Create a Map for quick lookup of recommended models' metadata
// This map helps enrich the raw API data with your custom descriptions, thumbnails, etc.
const recommendedModelsMap = new Map();
recommendedOllamaModelsData.forEach(baseModel => {
    baseModel.quantizations.forEach(q => {
        const fullTag = `${baseModel.base_id}:${q.tag}`;
        recommendedModelsMap.set(fullTag, {
            ...baseModel, // Base model info (name, base_description, thumbnail, url, type, compatibility)
            ...q,         // Quantization specific info (tag, description, size, vram, ram)
            fullTag: fullTag // Full tag for direct access
        });
    });
});


const ModelManagementDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedModels, setSelectedModels] = useState([]);
  const [downloadingModels, setDownloadingModels] = useState({});
  const [activeTab, setActiveTab] = useState('available');
  // `onlineOllamaModels` will now be populated directly from `recommendedOllamaModelsData`
  // with their online availability status checked against the Ollama API.
  const [onlineOllamaModels, setOnlineOllamaModels] = useState([]); 
  const [localOllamaModels, setLocalOllamaModels] = useState([]);
  const [isLoadingOnlineModels, setIsLoadingOnlineModels] = useState(false);
  const [onlineModelsError, setOnlineModelsError] = useState(null);

  const [visibleOnlineModelsCount, setVisibleOnlineModelsCount] = useState(10); // Start with a manageable number for lazy loading
  const observerTarget = useRef(null); // Ref for the element to observe for infinite scrolling


  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // ✅ Modified fetchOnlineOllamaModels to prioritize `recommendedOllamaModelsData`
  const fetchOnlineOllamaModels = async () => {
    setIsLoadingOnlineModels(true);
    setOnlineModelsError(null);
    let onlineApiTags = new Set(); // To store tags actually available on ollama.com/api/tags

    try {
      if (window.electronAPI?.models?.fetchOnlineOllama) {
        const result = await window.electronAPI.models.fetchOnlineOllama(); 

        if (result.success && result.data) {
          result.data.forEach(model => onlineApiTags.add(model.name)); // Populate set with tags from API
          console.log('Raw online API tags received:', Array.from(onlineApiTags)); // For debugging
        } else {
          console.error('Error from Electron API for fetching online models:', result.error || 'Unknown error');
          setOnlineModelsError(result.error || 'Could not reach Ollama.com API via Electron. Check internet/firewall.');
        }
      } else {
        console.error('Electron API for fetching online models is not available.');
        setOnlineModelsError('Electron API for fetching online models is not available. Please restart the app.');
      }
    } catch (error) {
      console.error('Error during initial fetch of online Ollama models:', error);
      setOnlineModelsError('Failed to fetch online models. Check your internet connection or Electron setup.');
    } finally {
      setIsLoadingOnlineModels(false);
    }

    // ✅ Process recommended models data, checking their availability against the online API tags
    // This will create the full list of models to display, with their true online/offline status
    const processedModels = recommendedOllamaModelsData.flatMap(baseModel => {
        return baseModel.quantizations.map(q => {
            const fullTag = `${baseModel.base_id}:${q.tag}`; // e.g., "llama3:8b-instruct-q4_K_M"
            const isAvailableOnline = onlineApiTags.has(fullTag); // Is this specific tag actually available from ollama.com/api/tags?

            return {
                id: fullTag, 
                name: `${baseModel.name} ${q.tag}`, // e.g., "Llama 3 8B-instruct-q4_K_M"
                version: q.tag, // Use quantization tag as version
                description: q.description || baseModel.base_description,
                size: q.size_gb, // Size from recommended data
                type: baseModel.type,
                compatibility: baseModel.compatibility_tags,
                thumbnail: baseModel.thumbnail_url,
                modelPageUrl: baseModel.model_page_url,
                status: isAvailableOnline ? 'available' : 'offline', // Set status based on actual online availability
                isDownloaded: false, // This will be updated later by local models check
                downloadProgress: 0,
                usageStats: { requests: 0, tokens: 0 },
                requirements: { ram: q.ram_gb, vram: q.vram_gb, storage: q.size_gb }
            };
        });
    });
    
    setOnlineOllamaModels(processedModels); // Now `onlineOllamaModels` contains all your recommended models
    console.log('Final processed models for display (from recommended data):', processedModels); // For debugging
  };

  const fetchLocalOllamaModels = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const localModels = data.models.map(model => {
        const fullTag = model.name;
        const recommendedMeta = recommendedModelsMap.get(fullTag);

        let name = model.name;
        let version = model.details.parameter_size || model.name.split(':')[1] || 'latest';
        let description = `Locally installed model (${model.name}).`;
        let size = formatBytes(model.size);
        let type = 'Language Model';
        let compatibility = ['Local Host', 'CPU', 'CUDA', 'Metal'];
        let thumbnail = 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop';
        let requirements = { ram: '?', vram: '?', storage: '?' };
        let modelPageUrl = `https://ollama.com/community/${model.name.split(':')[0]}`;

        if (recommendedMeta) {
          name = recommendedMeta.name || name;
          version = recommendedMeta.tag || version;
          description = recommendedMeta.description || recommendedMeta.base_description || description;
          size = recommendedMeta.size_gb || size;
          type = recommendedMeta.type || type;
          compatibility = recommendedMeta.compatibility_tags || compatibility;
          thumbnail = recommendedMeta.thumbnail_url || thumbnail;
          requirements = {
            ram: recommendedMeta.ram_gb || '?',
            vram: recommendedMeta.vram_gb || '?',
            storage: recommendedMeta.size_gb || '?'
          };
          modelPageUrl = recommendedMeta.model_page_url || modelPageUrl;
        }

        return {
          id: fullTag,
          name: name,
          version: version,
          description: description,
          size: size,
          type: type,
          compatibility: compatibility,
          thumbnail: thumbnail,
          isDownloaded: true,
          downloadProgress: 100,
          usageStats: { requests: 0, tokens: 0 },
          requirements: requirements,
          modelPageUrl: modelPageUrl
        };
      });
      setLocalOllamaModels(localModels);
    } catch (error) {
      console.error('Error fetching local Ollama models:', error);
    }
  };

  useEffect(() => {
    // These fetches are triggered once on component mount, and also on search/filter change
    fetchOnlineOllamaModels(); 
    fetchLocalOllamaModels();
    setVisibleOnlineModelsCount(10); // Reset visible count on filter/search change
  }, [searchQuery, selectedFilter]); // Dependency array to re-fetch when search/filter changes

  // allAvailableModels will combine online (recommended) models with local models
  const allAvailableModels = useMemo(() => {
    const combinedModels = [...onlineOllamaModels]; // Start with all models from recommended data
    
    return combinedModels.map(onlineModel => {
      const isDownloaded = localOllamaModels.some(localModel => localModel.id === onlineModel.id);
      return {
        ...onlineModel,
        isDownloaded: isDownloaded,
        downloadProgress: isDownloaded ? 100 : (downloadingModels[onlineModel.id] || 0) 
      };
    });
    // ✅ No `.filter()` here, as we want `allAvailableModels` to contain the complete, enriched list
  }, [onlineOllamaModels, localOllamaModels, downloadingModels]);


  // Moved to top for correct definition order
  const filterOptions = [
    { value: 'all', label: 'All Models' },
    { value: 'language', label: 'Language Models' },
    { value: 'image', label: 'Image Generation' },
    { value: 'speech', label: 'Speech Recognition' },
    { value: 'code', label: 'Code Generation' },
    { value: 'downloaded', label: 'Downloaded' },
    { value: 'available', label: 'Available' } // 'available' means not downloaded AND online status is 'available'
  ];

  // Moved to top for correct definition order
  const tabs = [
    { id: 'available', label: 'Available Models', icon: 'Download' },
    { id: 'downloaded', label: 'Downloaded Models', icon: 'HardDrive' },
    { id: 'extensions', label: 'Extensions', icon: 'Puzzle' }
  ];

  // `filteredModels` applies search and selected filter criteria to `allAvailableModels`
  const filteredModels = useMemo(() => {
    const modelsToFilter = [...allAvailableModels];

    return modelsToFilter.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedFilter === 'all') return matchesSearch;
      if (selectedFilter === 'downloaded') return matchesSearch && model.isDownloaded;
      // For 'Available' tab: show models not downloaded AND explicitly marked 'available' by the online API check.
      // Models with status 'offline' will NOT be shown here.
      if (selectedFilter === 'available') return matchesSearch && !model.isDownloaded && model.status === 'available'; 
      
      const typeMap = {
        'language': 'Language Model',
        'image': 'Image Generation',
        'speech': 'Speech Recognition',
        'code': 'Code Generation'
      };
      
      return matchesSearch && model.type === typeMap[selectedFilter];
    });
  }, [allAvailableModels, searchQuery, selectedFilter]);

  // `modelsToDisplay` applies lazy loading slice to `filteredModels`
  const modelsToDisplay = useMemo(() => {
    return filteredModels.slice(0, visibleOnlineModelsCount);
  }, [filteredModels, visibleOnlineModelsCount]);


  const downloadedModels = localOllamaModels; 

  const handleModelSelect = (modelId) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleDownload = async (modelName) => {
    if (downloadingModels[modelName] > 0 && downloadingModels[modelName] < 100) {
      console.log(`${modelName} is already downloading.`);
      return;
    }

    setDownloadingModels(prev => ({ ...prev, [modelName]: 0 }));
    console.log(`Starting download for ${modelName}...`);

    try {
      const response = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.trim() === '') continue;
          try {
            const data = JSON.parse(line);
            if (data.status && data.digest && data.total && data.completed) {
              const progress = Math.round((data.completed / data.total) * 100);
              setDownloadingModels(prev => ({ ...prev, [modelName]: progress }));
              console.log(`Download progress for ${modelName}: ${progress}%`);
            } else if (data.status) {
              console.log(`Ollama status for ${modelName}: ${data.status}`);
            }
          } catch (jsonError) {
            console.warn('Failed to parse JSON line from Ollama stream:', line, jsonError);
          }
        }
      }
      decoder.decode(buffer);

      setDownloadingModels(prev => ({ ...prev, [modelName]: 100 }));
      console.log(`Download of ${modelName} completed!`);
      fetchLocalOllamaModels();

    } catch (error) {
      console.error(`Error downloading model ${modelName}:`, error);
      setDownloadingModels(prev => ({ ...prev, [modelName]: -1 }));
    }
  };

  const extensions = [
    {
      id: 'langchain-integration', name: 'LangChain Integration', description: 'Seamless integration with LangChain framework for building applications with LLMs, including chains, agents, and memory components.', version: '0.1.52', isEnabled: true, hasUpdate: false, compatibility: ['All Models'], author: 'LangChain Team'
    },
    {
      id: 'vector-database', name: 'Vector Database Connector', description: 'Connect to popular vector databases like Pinecone, Weaviate, and Chroma for semantic search and RAG applications.', version: '2.3.1', isEnabled: true, hasUpdate: true, compatibility: ['Language Models'], author: 'AI Studio Team'
    },
    {
      id: 'prompt-templates', name: 'Advanced Prompt Templates', description: 'Collection of optimized prompt templates for various use cases including creative writing, analysis, and technical documentation.', version: '1.4.7', isEnabled: false, hasUpdate: false, compatibility: ['Language Models'], author: 'Community'
    },
    {
      id: 'model-quantization', name: 'Model Quantization Tools', description: 'Tools for quantizing models to reduce memory usage and improve inference speed while maintaining quality.', version: '3.1.0', isEnabled: true, hasUpdate: false, compatibility: ['All Models'], author: 'AI Studio Team'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (visibleOnlineModelsCount < filteredModels.length) {
            setVisibleOnlineModelsCount(prevCount => prevCount + 10); // Load 10 more models
          }
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the target is visible
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    // Cleanup function for observer
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [visibleOnlineModelsCount, filteredModels.length]); // Re-run when visible count or total filtered models change


  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
              <Icon name="Brain" size={24} color="var(--color-primary)" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Model Management</h1>
              <p className="text-text-secondary">Download, configure, and manage AI models and extensions</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Icon 
                  name="Search" 
                  size={20} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" 
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150"
                />
              </div>
              
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedModels.length > 0 && (
              <BulkOperations 
                selectedCount={selectedModels.length}
                onClearSelection={() => setSelectedModels([])}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            <div className="flex space-x-1 mb-6 bg-surface p-1 rounded-lg">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150
                    ${activeTab === tab.id
                      ? 'bg-background text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }
                  `}
                >
                  <Icon name={tab.icon} size={16} strokeWidth={2} />
                  <span>{tab.label}</span>
                  {tab.id === 'downloaded' && (
                    <span className="bg-primary text-text-inverse text-xs px-2 py-0.5 rounded-full">
                      {downloadedModels.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'available' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoadingOnlineModels ? (
                  <div className="text-center py-12 lg:col-span-2">
                    <Icon name="Loader" size={32} className="animate-spin text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-primary">Loading online models...</h3>
                    <p className="text-text-secondary">Fetching latest models from Ollama.com</p>
                  </div>
                ) : onlineModelsError ? (
                  <div className="text-center py-12 lg:col-span-2 text-error">
                    <Icon name="AlertTriangle" size={32} className="mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-error">Error loading models!</h3>
                    <p className="text-text-secondary">{onlineModelsError}</p>
                  </div>
                ) : modelsToDisplay.length === 0 && filteredModels.length > 0 ? ( // If filtered, but nothing to display
                   <div className="text-center py-12 lg:col-span-2">
                     <div className="flex items-center justify-center w-16 h-16 bg-surface rounded-full mx-auto mb-4">
                       <Icon name="Filter" size={24} color="var(--color-text-tertiary)" strokeWidth={2} />
                     </div>
                     <h3 className="text-lg font-medium text-text-primary mb-2">No matching models found</h3>
                     <p className="text-text-secondary">Try adjusting your search or filter criteria.</p>
                   </div>
                ) : filteredModels.length === 0 && searchQuery === '' && selectedFilter === 'all' ? ( // If no models loaded at all
                  <div className="text-center py-12 lg:col-span-2">
                    <div className="flex items-center justify-center w-16 h-16 bg-surface rounded-full mx-auto mb-4">
                      <Icon name="Search" size={24} color="var(--color-text-tertiary)" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">No models found</h3>
                    <p className="text-text-secondary">Check your internet connection or Ollama.com API, or add models to recommended list.</p>
                  </div>
                ) : (
                  <>
                    {modelsToDisplay.map(model => (
                      <ModelCard
                        key={model.id}
                        model={model}
                        isSelected={selectedModels.includes(model.id)}
                        onSelect={() => handleModelSelect(model.id)}
                        onDownload={() => handleDownload(model.id)}
                        downloadProgress={downloadingModels[model.id]}
                      />
                    ))}
                    {/* ✅ Element to observe for infinite scrolling */}
                    {visibleOnlineModelsCount < filteredModels.length && (
                      <div ref={observerTarget} className="text-center py-4 lg:col-span-2">
                        <Icon name="MoreHorizontal" size={24} className="text-text-tertiary mx-auto animate-pulse" />
                        <p className="text-text-secondary text-sm">Loading more models...</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'downloaded' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {downloadedModels.length === 0 ? (
                    <div className="text-center py-12 lg:col-span-2">
                        <Icon name="HardDrive" size={32} className="text-text-tertiary mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-text-primary">No models downloaded yet</h3>
                        <p className="text-text-secondary">Go to 'Available Models' tab to download new models.</p>
                    </div>
                ) : (
                    downloadedModels.map(model => (
                        <ModelCard
                            key={model.id}
                            model={model}
                            isSelected={selectedModels.includes(model.id)}
                            onSelect={() => handleModelSelect(model.id)}
                            showUsageStats={true}
                        />
                    ))
                )}
              </div>
            )}

            {activeTab === 'extensions' && (
              <ExtensionPanel extensions={extensions} />
            )}
          </div>

          <div className="xl:col-span-1">
            <SystemInfo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelManagementDashboard;