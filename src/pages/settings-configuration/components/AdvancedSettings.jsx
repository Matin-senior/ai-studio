import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import Icon from 'components/AppIcon';
import { useTranslation } from 'react-i18next';

// تعریف تنظیمات پیش‌فرض بیرون از کامپوننت
const defaultSettings = {
  debug: {
    enabled: false,
    logLevel: 'info',
    showNetworkRequests: false,
    showPerformanceMetrics: false
  },
  performance: {
    enableCaching: true,
    cacheSize: 100,
    preloadModels: false,
    optimizeMemory: true,
    enableGPUAcceleration: false
  },
  experimental: {
    betaFeatures: false,
    advancedPrompting: false,
    multiModalSupport: false,
    voiceInteraction: false
  },
  security: {
    enableTelemetry: true,
    allowRemoteConnections: false,
    requireAuthentication: false,
    encryptLocalData: true
  }
};

// کامپوننت را با forwardRef بازنویسی می‌کنیم
const AdvancedSettings = forwardRef(({ onChange }, ref) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState(defaultSettings);
  const didLoadRef = useRef(false);

  // useEffect برای بارگذاری تنظیمات اولیه
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    const loadSettings = async () => {
      try {
        if (window.electronAPI?.settings?.get) {
          const allSettings = await window.electronAPI.settings.get();
          // کلید 'advanced' باید با id بخش در index.jsx مطابقت داشته باشد
          const advancedSettings = { ...defaultSettings, ...(allSettings.advanced || {}) };
          setSettings(advancedSettings);
          setOriginalSettings(advancedSettings);
        }
      } catch (error) {
        console.error("Failed to load advanced settings:", error);
      }
    };
    loadSettings();
  }, []);

  // useEffect برای اطلاع‌رسانی به والد در مورد تغییرات
  useEffect(() => {
    if (JSON.stringify(settings) !== JSON.stringify(originalSettings)) {
      onChange && onChange();
    }
  }, [settings, originalSettings, onChange]);

  // useImperativeHandle برای فراهم کردن توابع کنترلی برای والد
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

  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');

  // این تابع بدون تغییر باقی می‌ماند
  const handleSettingChange = (parent, key, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
    // onChange() از طریق useEffect بالا به صورت خودکار فراخوانی می‌شود
  };

  const logLevels = [
    { id: 'error', label: t('settings.log_level_error'), description: t('settings.log_level_error_desc') },
    { id: 'warn', label: t('settings.log_level_warn'), description: t('settings.log_level_warn_desc') },
    { id: 'info', label: t('settings.log_level_info'), description: t('settings.log_level_info_desc') },
    { id: 'debug', label: t('settings.log_level_debug'), description: t('settings.log_level_debug_desc') },
    { id: 'trace', label: t('settings.log_level_trace'), description: t('settings.log_level_trace_desc') }
  ];
  const cacheSizes = [
    { value: 50, label: t('settings.cache_size_50') },
    { value: 100, label: t('settings.cache_size_100') },
    { value: 250, label: t('settings.cache_size_250') },
    { value: 500, label: t('settings.cache_size_500') },
    { value: 1000, label: t('settings.cache_size_1000') }
  ];

  const exportConfiguration = () => {
    const config = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      settings: settings
    };
    const jsonString = JSON.stringify(config, null, 2);
    setExportData(jsonString);
    
    // Create download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-studio-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importConfiguration = () => {
    try {
      const config = JSON.parse(importData);
      if (config.settings) {
        setSettings(config.settings);
        onChange && onChange();
        alert('Configuration imported successfully!');
        setImportData('');
      } else {
        alert('Invalid configuration format');
      }
    } catch (error) {
      alert('Error parsing configuration: ' + error.message);
    }
  };

  const clearCache = () => {
    if (confirm('Are you sure you want to clear all cached data? This action cannot be undone.')) {
      // Mock cache clearing
      alert('Cache cleared successfully!');
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all advanced settings to defaults? This action cannot be undone.')) {
      setSettings(defaultSettings);
      onChange && onChange();
    }
  };

  return (
    <div className="space-y-8 font-[Estedad,IRANSans,Arial,sans-serif]">
      {/* Debug Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Bug" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary font-[inherit]">{t('settings.debug_settings')}</h3>
        </div>
        <p className="text-sm text-text-secondary font-[inherit]">
          {t('settings.debug_settings_desc')}
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Terminal" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.enable_debug_mode')}</div>
                <div className="text-sm text-text-secondary">{t('settings.enable_debug_mode_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.debug.enabled}
                onChange={(e) => handleSettingChange('debug', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {settings.debug.enabled && (
            <div className="space-y-4 p-4 bg-surface rounded-lg border border-border">
              <div className="space-y-2">
                <label className="font-medium text-text-primary">{t('settings.log_level')}</label>
                <select
                  value={settings.debug.logLevel}
                  onChange={(e) => handleSettingChange('debug', 'logLevel', e.target.value)}
                  className="w-full max-w-xs p-3 border border-border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
                >
                  {logLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.label} - {level.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-text-primary">{t('settings.show_network_requests')}</div>
                    <div className="text-sm text-text-secondary">{t('settings.show_network_requests_desc')}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.debug.showNetworkRequests}
                      onChange={(e) => handleSettingChange('debug', 'showNetworkRequests', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-text-primary">{t('settings.show_performance_metrics')}</div>
                    <div className="text-sm text-text-secondary">{t('settings.show_performance_metrics_desc')}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.debug.showPerformanceMetrics}
                      onChange={(e) => handleSettingChange('debug', 'showPerformanceMetrics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Zap" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('settings.performance_settings')}</h3>
        </div>
        <p className="text-sm text-text-secondary">
          {t('settings.performance_settings_desc')}
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Database" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.enable_caching')}</div>
                <div className="text-sm text-text-secondary">{t('settings.enable_caching_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.performance.enableCaching}
                onChange={(e) => handleSettingChange('performance', 'enableCaching', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {settings.performance.enableCaching && (
            <div className="p-4 bg-surface rounded-lg border border-border">
              <div className="flex items-center justify-between mb-3">
                <label className="font-medium text-text-primary">{t('settings.cache_size')}</label>
                <button
                  onClick={clearCache}
                  className="px-3 py-1 text-sm bg-error text-white rounded hover:bg-error/90 transition-colors nav-focus"
                >
                  {t('settings.clear_cache')}
                </button>
              </div>
              <select
                value={settings.performance.cacheSize}
                onChange={(e) => handleSettingChange('performance', 'cacheSize', parseInt(e.target.value))}
                className="w-full max-w-xs p-3 border border-border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
              >
                {cacheSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <Icon name="Download" size={20} strokeWidth={2} className="text-text-secondary" />
                <div>
                  <div className="font-medium text-text-primary">{t('settings.preload_models')}</div>
                  <div className="text-sm text-text-secondary">{t('settings.preload_models_desc')}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.performance.preloadModels}
                  onChange={(e) => handleSettingChange('performance', 'preloadModels', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <Icon name="Cpu" size={20} strokeWidth={2} className="text-text-secondary" />
                <div>
                  <div className="font-medium text-text-primary">{t('settings.optimize_memory_usage')}</div>
                  <div className="text-sm text-text-secondary">{t('settings.optimize_memory_usage_desc')}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.performance.optimizeMemory}
                  onChange={(e) => handleSettingChange('performance', 'optimizeMemory', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <Icon name="Zap" size={20} strokeWidth={2} className="text-text-secondary" />
                <div>
                  <div className="font-medium text-text-primary">{t('settings.gpu_acceleration')}</div>
                  <div className="text-sm text-text-secondary">{t('settings.gpu_acceleration_desc')}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.performance.enableGPUAcceleration}
                  onChange={(e) => handleSettingChange('performance', 'enableGPUAcceleration', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Experimental Features */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Flask" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('settings.experimental_features')}</h3>
        </div>
        <div className="p-3 bg-warning-light border border-warning/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={16} color="var(--color-warning)" strokeWidth={2} />
            <p className="text-sm text-warning">
              {t('settings.experimental_warning')}
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Beaker" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.beta_features')}</div>
                <div className="text-sm text-text-secondary">{t('settings.beta_features_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.experimental.betaFeatures}
                onChange={(e) => handleSettingChange('experimental', 'betaFeatures', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="MessageSquare" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.advanced_prompting')}</div>
                <div className="text-sm text-text-secondary">{t('settings.advanced_prompting_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.experimental.advancedPrompting}
                onChange={(e) => handleSettingChange('experimental', 'advancedPrompting', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Image" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.multi_modal_support')}</div>
                <div className="text-sm text-text-secondary">{t('settings.multi_modal_support_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.experimental.multiModalSupport}
                onChange={(e) => handleSettingChange('experimental', 'multiModalSupport', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Mic" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.voice_interaction')}</div>
                <div className="text-sm text-text-secondary">{t('settings.voice_interaction_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.experimental.voiceInteraction}
                onChange={(e) => handleSettingChange('experimental', 'voiceInteraction', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('settings.security_settings')}</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="BarChart" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.enable_telemetry')}</div>
                <div className="text-sm text-text-secondary">{t('settings.enable_telemetry_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.enableTelemetry}
                onChange={(e) => handleSettingChange('security', 'enableTelemetry', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Globe" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.allow_remote_connections')}</div>
                <div className="text-sm text-text-secondary">{t('settings.allow_remote_connections_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-items cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.allowRemoteConnections}
                onChange={(e) => handleSettingChange('security', 'allowRemoteConnections', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Lock" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.require_authentication')}</div>
                <div className="text-sm text-text-secondary">{t('settings.require_authentication_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.requireAuthentication}
                onChange={(e) => handleSettingChange('security', 'requireAuthentication', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Key" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.encrypt_local_data')}</div>
                <div className="text-sm text-text-secondary">{t('settings.encrypt_local_data_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.encryptLocalData}
                onChange={(e) => handleSettingChange('security', 'encryptLocalData', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Configuration Management */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Download" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('settings.configuration_management')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-text-primary">{t('settings.export_configuration')}</h4>
            <p className="text-sm text-text-secondary">
              {t('settings.export_configuration_desc')}
            </p>
            <button
              onClick={exportConfiguration}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-primary text-text-inverse rounded-lg hover:bg-primary-700 transition-all duration-150 nav-focus"
            >
              <Icon name="Download" size={18} strokeWidth={2} />
              <span>{t('settings.export_settings')}</span>
            </button>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-text-primary">{t('settings.import_configuration')}</h4>
            <p className="text-sm text-text-secondary">
              {t('settings.import_configuration_desc')}
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder={t('settings.import_placeholder')}
              rows={3}
              className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 resize-none text-sm"
            />
            <button
              onClick={importConfiguration}
              disabled={!importData.trim()}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-accent text-white rounded-lg hover:bg-accent-700 disabled:bg-secondary-200 disabled:text-text-secondary transition-all duration-150 nav-focus"
            >
              <Icon name="Upload" size={18} strokeWidth={2} />
              <span>{t('settings.import_settings')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AdvancedSettings;