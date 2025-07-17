import React, { useState, useEffect } from 'react'; // useEffect را اضافه کنید
import { useTranslation } from 'react-i18next';
import Icon from 'components/AppIcon';

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ollamaModels, setOllamaModels] = useState([]); // وضعیت جدید برای مدل‌های Ollama
  const [isLoadingOllama, setIsLoadingOllama] = useState(false); // وضعیت بارگذاری برای مدل‌های Ollama
  const [ollamaError, setOllamaError] = useState(null); // وضعیت خطا برای مدل‌های Ollama

  const { t } = useTranslation();

  // مدل‌های پیش‌فرض (ابری)
  const cloudModels = [
    {
      id: 'gpt-4',
      name: t('modelSelector.models.gpt4.name'),
      description: t('modelSelector.models.gpt4.description'),
      status: 'available',
      icon: 'Brain',
      type: 'cloud'
    },
    {
      id: 'gpt-3.5-turbo',
      name: t('modelSelector.models.gpt35.name'),
      description: t('modelSelector.models.gpt35.description'),
      status: 'available',
      icon: 'Zap',
      type: 'cloud'
    },
    {
      id: 'claude-3',
      name: t('modelSelector.models.claude3.name'),
      description: t('modelSelector.models.claude3.description'),
      status: 'available',
      icon: 'MessageSquare',
      type: 'cloud'
    },
    {
      id: 'gemini-pro',
      name: t('modelSelector.models.gemini.name'),
      description: t('modelSelector.models.gemini.description'),
      status: 'limited',
      icon: 'Sparkles',
      type: 'cloud'
    }
  ];

  // تابع برای دریافت لیست مدل‌ها از Ollama API
  const fetchOllamaModels = async () => {
    setIsLoadingOllama(true);
    setOllamaError(null);
    try {
      // ✅ این آدرس API برای لیست کردن مدل‌ها در Ollama است
      const response = await fetch('http://localhost:11434/api/tags');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // مدل‌های Ollama رو به فرمتی که ModelSelector نیاز داره، تبدیل می‌کنیم
      const newOllamaModels = data.models.map(ollamaModel => ({
        id: `ollama-${ollamaModel.name}`, // یک ID منحصر به فرد (مثلاً ollama-llama3)
        name: ollamaModel.name,
        description: t('modelSelector.models.ollamaLocal.description'), // توضیحات عمومی برای مدل‌های لوکال
        status: 'available', // فرض می‌کنیم اگر لیست شده، قابل دسترسه
        icon: 'Server', // آیکون برای مدل‌های لوکال
        type: 'local' // نوع مدل رو مشخص می‌کنیم
      }));
      setOllamaModels(newOllamaModels);
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      setOllamaError(t('modelSelector.error.ollamaFetch')); // پیام خطا برای کاربر
    } finally {
      setIsLoadingOllama(false);
    }
  };

  // با mount شدن کامپوننت، مدل‌های Ollama رو دریافت می‌کنیم
  useEffect(() => {
    fetchOllamaModels();
  }, []); // فقط یک بار در زمان mount شدن

  // ترکیب مدل‌های ابری و محلی
  const allModels = [...cloudModels, ...ollamaModels];

  const selectedModelData = allModels.find(model => model.id === selectedModel);

  const handleModelSelect = (modelId) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-accent';
      case 'limited':
        return 'text-warning';
      case 'offline':
        return 'text-error';
      default:
        return 'text-text-tertiary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return 'CheckCircle';
      case 'limited':
        return 'AlertCircle';
      case 'offline':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
        aria-label={t('modelSelector.aria.select')}
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2">
          <Icon 
            name={selectedModelData?.icon || 'Brain'} 
            size={18} 
            strokeWidth={2} 
            className="text-text-secondary" 
          />
          <div className="text-left">
            <div className="text-sm font-medium text-text-primary">
              {selectedModelData?.name || t('modelSelector.select')}
            </div>
            <div className="text-xs text-text-secondary">
              {selectedModelData?.status ? t(`modelSelector.status.${selectedModelData.status}`) : t('modelSelector.noModel')}
            </div>
          </div>
        </div>
        <Icon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          strokeWidth={2} 
          className="text-text-tertiary" 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-2 border-b border-border">
              <h3 className="text-sm font-medium text-text-primary">{t('modelSelector.available')}</h3>
              <p className="text-xs text-text-secondary">{t('modelSelector.choose')}</p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {/* نمایش وضعیت بارگذاری یا خطا */}
              {isLoadingOllama && (
                <div className="p-3 text-center text-text-secondary">
                  <Icon name="Loader" size={20} className="animate-spin inline-block mr-2" />
                  {t('modelSelector.loadingModels')}
                </div>
              )}
              {ollamaError && (
                <div className="p-3 text-center text-error">
                  <Icon name="AlertTriangle" size={20} className="inline-block mr-2" />
                  {ollamaError}
                </div>
              )}

              {allModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  // اگر مدل آفلاین بود (مخصوصا برای مدل‌های لوکال) یا از سمت سرور Ollama خطایی داشتیم، دکمه رو غیرفعال کن
                  className={`w-full flex items-center space-x-3 p-3 text-left hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus ${
                    selectedModel === model.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                  } ${model.status === 'offline' || ollamaError ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={model.status === 'offline' || ollamaError || isLoadingOllama}
                >
                  <div className="flex-shrink-0">
                    <Icon 
                      name={model.icon} 
                      size={20} 
                      strokeWidth={2} 
                      className={selectedModel === model.id ? 'text-primary' : 'text-text-secondary'} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-sm font-medium ${
                        selectedModel === model.id ? 'text-primary' : 'text-text-primary'
                      }`}>
                        {model.name}
                        {model.type === 'local' && ( // نمایش برچسب 'Local' برای مدل‌های Ollama
                            <span className="ml-2 px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                                {t('modelSelector.localTag')}
                            </span>
                        )}
                      </span>
                      {selectedModel === model.id && (
                        <Icon name="Check" size={14} className="text-primary" strokeWidth={2} />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mb-1">{model.description}</p>
                    <div className="flex items-center space-x-1">
                      <Icon 
                        name={getStatusIcon(model.status)} 
                        size={12} 
                        strokeWidth={2} 
                        className={getStatusColor(model.status)} 
                      />
                      <span className={`text-xs capitalize ${getStatusColor(model.status)}`}>
                        {t(`modelSelector.status.${model.status}`)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-2 border-t border-border bg-surface">
              <button className="w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded transition-all duration-150 ease-smooth nav-focus">
                <Icon name="Settings" size={14} className="inline mr-2" strokeWidth={2} />
                {t('modelSelector.manage')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector;