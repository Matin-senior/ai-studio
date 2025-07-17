import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import Icon from 'components/AppIcon';
import { useTranslation } from 'react-i18next';

// تعریف تنظیمات پیش‌فرض بیرون از کامپوننت برای بهینه‌سازی
const defaultSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  responseFormat: 'markdown',
  streamResponse: true,
  contextWindow: 4096,
  systemPrompt: `You are a helpful AI assistant. Provide accurate, concise, and helpful responses to user queries. When writing code, use proper syntax highlighting and explain complex concepts clearly.`,
  fallbackModel: 'gpt-3.5-turbo',
  retryAttempts: 3
};

// ۱. کامپوننت را در forwardRef میپیچیم و ref را به عنوان آرگومان دوم میگیریم
const AIModelSettings = forwardRef(({ onChange, showAlert }, ref) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const didLoadRef = useRef(false);

  // ۲. useEffect را برای بارگذاری تنظیمات اولیه اضافه میکنیم
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        if (window.electronAPI?.settings?.get) {
          const allSettings = await window.electronAPI.settings.get();
          const modelSettings = { ...defaultSettings, ...(allSettings['ai-models'] || {}) };
          setSettings(modelSettings);
          setOriginalSettings(modelSettings);
        }
      } catch (error) {
        console.error("Failed to load AI model settings:", error);
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // هر زمان که کاربر تغییری ایجاد کرد، به والد اطلاع میدهیم
  useEffect(() => {
    if (!isLoading && JSON.stringify(settings) !== JSON.stringify(originalSettings)) {
      onChange && onChange();
    }
  }, [settings, originalSettings, isLoading, onChange]);

  // این تابع فقط state داخلی را تغییر میدهد
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // ۳. useImperativeHandle را برای کنترل توسط والد پیاده سازی میکنیم
  useImperativeHandle(ref, () => ({
    getSettings: () => settings,
    setSettings: (newSettings) => {
      setSettings(newSettings);
      setOriginalSettings(newSettings);
    },
    resetToOriginal: () => {
      setSettings(originalSettings);
    }
  }), [settings, originalSettings]);


  // ۴. توابع و state های اضافی که دیگر لازم نیستند حذف شده‌اند
  // handleSaveChanges, handleCancelChanges, handleResetToDefaults, hasChanges


  // این ثابت‌ها برای بخش return لازم هستند و باقی می‌مانند
  const responseFormats = [
    { id: 'markdown', label: t('aiModelSettings.responseFormats.markdown.label'), description: t('aiModelSettings.responseFormats.markdown.description') },
    { id: 'plain', label: t('aiModelSettings.responseFormats.plain.label'), description: t('aiModelSettings.responseFormats.plain.description') },
    { id: 'json', label: t('aiModelSettings.responseFormats.json.label'), description: t('aiModelSettings.responseFormats.json.description') }
  ];

  const fallbackModels = [
    { id: 'gpt-3.5-turbo', label: t('aiModelSettings.fallbackModels.gpt35.label'), provider: t('aiModelSettings.fallbackModels.gpt35.provider') },
    { id: 'claude-3-haiku', label: t('aiModelSettings.fallbackModels.claude3.label'), provider: t('aiModelSettings.fallbackModels.claude3.provider') },
    { id: 'gemini-pro', label: t('aiModelSettings.fallbackModels.gemini.label'), provider: t('aiModelSettings.fallbackModels.gemini.provider') },
    { id: 'llama-2-70b', label: t('aiModelSettings.fallbackModels.llama2.label'), provider: t('aiModelSettings.fallbackModels.llama2.provider') }
  ];

  const temperatureType = settings.temperature < 0.3 ? 'conservative' : settings.temperature > 0.8 ? 'creative' : 'balanced';

  const previewResponse = t('aiModelSettings.preview.text', {
    temperature: settings.temperature,
    temperatureType: t(`aiModelSettings.preview.temperatureType.${temperatureType}`),
    maxTokens: settings.maxTokens,
    responseStyle: t(`aiModelSettings.preview.responseStyle.${settings.responseFormat}`),
    responseType: settings.temperature < 0.5
      ? t('aiModelSettings.preview.responseType.consistent')
      : t('aiModelSettings.preview.responseType.varied')
  });

  return (
    <div className="space-y-8 font-[Estedad,IRANSans,Arial,sans-serif]">
      {/* Model Parameters */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Icon name="Sliders" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary font-[inherit]">{t('aiModelSettings.sections.modelParameters')}</h3>
        </div>
        
        {/* Temperature */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-medium text-text-primary font-[inherit]">{t('aiModelSettings.fields.temperature')}</label>
            <span className="text-sm text-text-secondary bg-surface px-2 py-1 rounded font-[inherit]">
              {settings.temperature}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
            className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-text-secondary font-[inherit]">
            <span>{t('aiModelSettings.temperatureScale.conservative')}</span>
            <span>{t('aiModelSettings.temperatureScale.balanced')}</span>
            <span>{t('aiModelSettings.temperatureScale.creative')}</span>
          </div>
          <p className="text-sm text-text-secondary font-[inherit]">
            {t('aiModelSettings.descriptions.temperature')}
          </p>
        </div>

        {/* Max Tokens */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-medium text-text-primary">{t('aiModelSettings.fields.maxTokens')}</label>
            <span className="text-sm text-text-secondary bg-surface px-2 py-1 rounded">
              {settings.maxTokens}
            </span>
          </div>
          <input
            type="range"
            min="256"
            max="8192"
            step="256"
            value={settings.maxTokens}
            onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
            className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-text-secondary">
            <span>256</span>
            <span>4096</span>
            <span>8192</span>
          </div>
          <p className="text-sm text-text-secondary">
            {t('aiModelSettings.descriptions.maxTokens')}
          </p>
        </div>

        {/* Top P */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-medium text-text-primary">{t('aiModelSettings.fields.topP')}</label>
            <span className="text-sm text-text-secondary bg-surface px-2 py-1 rounded">
              {settings.topP}
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={settings.topP}
            onChange={(e) => handleSettingChange('topP', parseFloat(e.target.value))}
            className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-sm text-text-secondary">
            {t('aiModelSettings.descriptions.topP')}
          </p>
        </div>

        {/* Frequency Penalty */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-medium text-text-primary">{t('aiModelSettings.fields.frequencyPenalty')}</label>
            <span className="text-sm text-text-secondary bg-surface px-2 py-1 rounded">
              {settings.frequencyPenalty}
            </span>
          </div>
          <input
            type="range"
            min="-2.0"
            max="2.0"
            step="0.1"
            value={settings.frequencyPenalty}
            onChange={(e) => handleSettingChange('frequencyPenalty', parseFloat(e.target.value))}
            className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-sm text-text-secondary">
            {t('aiModelSettings.descriptions.frequencyPenalty')}
          </p>
        </div>

        {/* Presence Penalty */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-medium text-text-primary">{t('aiModelSettings.fields.presencePenalty')}</label>
            <span className="text-sm text-text-secondary bg-surface px-2 py-1 rounded">
              {settings.presencePenalty}
            </span>
          </div>
          <input
            type="range"
            min="-2.0"
            max="2.0"
            step="0.1"
            value={settings.presencePenalty}
            onChange={(e) => handleSettingChange('presencePenalty', parseFloat(e.target.value))}
            className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-sm text-text-secondary">
            {t('aiModelSettings.descriptions.presencePenalty')}
          </p>
        </div>
      </div>

      {/* Response Configuration */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="FileText" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('aiModelSettings.sections.responseConfiguration')}</h3>
        </div>
        
        {/* Response Format */}
        <div className="space-y-3">
          <label className="font-medium text-text-primary">{t('aiModelSettings.fields.responseFormat')}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {responseFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => handleSettingChange('responseFormat', format.id)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all duration-150 ease-smooth nav-focus
                  ${settings.responseFormat === format.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-surface-hover'
                  }
                `}
              >
                <div className="font-medium text-text-primary">{format.label}</div>
                <div className="text-sm text-text-secondary mt-1">{format.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stream Response */}
        <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <Icon name="Zap" size={20} strokeWidth={2} className="text-text-secondary" />
            <div>
              <div className="font-medium text-text-primary">{t('aiModelSettings.fields.streamResponse')}</div>
              <div className="text-sm text-text-secondary">{t('aiModelSettings.descriptions.streamResponse')}</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.streamResponse}
              onChange={(e) => handleSettingChange('streamResponse', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Context Window */}
        <div className="space-y-3">
          <label className="font-medium text-text-primary">{t('aiModelSettings.fields.contextWindow')}</label>
          <select
            value={settings.contextWindow}
            onChange={(e) => handleSettingChange('contextWindow', parseInt(e.target.value))}
            className="w-full max-w-xs p-3 border border-border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
          >
            <option value={2048}>{t('aiModelSettings.contextWindow.2048')}</option>
            <option value={4096}>{t('aiModelSettings.contextWindow.4096')}</option>
            <option value={8192}>{t('aiModelSettings.contextWindow.8192')}</option>
            <option value={16384}>{t('aiModelSettings.contextWindow.16384')}</option>
            <option value={32768}>{t('aiModelSettings.contextWindow.32768')}</option>
          </select>
          <p className="text-sm text-text-secondary">
            {t('aiModelSettings.descriptions.contextWindow')}
          </p>
        </div>
      </div>

      {/* System Prompt */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="MessageSquare" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('aiModelSettings.sections.systemPrompt')}</h3>
        </div>
        
        <div className="space-y-3">
          <label className="font-medium text-text-primary">{t('aiModelSettings.fields.systemPrompt')}</label>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
            rows={4}
            className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 resize-none"
            placeholder={t('aiModelSettings.placeholders.systemPrompt')}
          />
          <p className="text-sm text-text-secondary">
            {t('aiModelSettings.descriptions.systemPrompt')}
          </p>
        </div>
      </div>

      {/* Fallback & Reliability */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('aiModelSettings.sections.fallbackReliability')}</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="font-medium text-text-primary">{t('aiModelSettings.fields.fallbackModel')}</label>
            <select
              value={settings.fallbackModel}
              onChange={(e) => handleSettingChange('fallbackModel', e.target.value)}
              className="w-full max-w-xs p-3 border border-border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
            >
              {fallbackModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label} ({model.provider})
                </option>
              ))}
            </select>
            <p className="text-sm text-text-secondary">
              {t('aiModelSettings.descriptions.fallbackModel')}
            </p>
          </div>

          <div className="space-y-3">
            <label className="font-medium text-text-primary">{t('aiModelSettings.fields.retryAttempts')}</label>
            <select
              value={settings.retryAttempts}
              onChange={(e) => handleSettingChange('retryAttempts', parseInt(e.target.value))}
              className="w-full max-w-xs p-3 border border-border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
            >
              <option value={1}>{t('aiModelSettings.fields.retryAttempts', { count: 1 })}</option>
              <option value={2}>{t('aiModelSettings.fields.retryAttempts', { count: 2 })}</option>
              <option value={3}>{t('aiModelSettings.fields.retryAttempts', { count: 3 })}</option>
              <option value={5}>{t('aiModelSettings.fields.retryAttempts', { count: 5 })}</option>
            </select>
            <p className="text-sm text-text-secondary">
              {t('aiModelSettings.descriptions.retryAttempts')}
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Eye" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('aiModelSettings.sections.preview')}</h3>
        </div>
        
        <div className="p-4 bg-surface border border-border rounded-lg">
          <div className="text-sm text-text-secondary mb-2">{t('aiModelSettings.preview.sample')}</div>
          <div className="prose prose-sm max-w-none text-text-primary">
            <div dangerouslySetInnerHTML={{ __html: previewResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}

    </div>
  );
});

export default AIModelSettings;