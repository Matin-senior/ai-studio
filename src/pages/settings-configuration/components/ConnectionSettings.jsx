import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import Icon from 'components/AppIcon';
import { useTranslation } from 'react-i18next';

// --- Validation helpers ---
const validateApiKey = (provider, value) => {
  if (!value) return '';
  switch (provider) {
    case 'openai':
      return /^sk-\w{20,}$/.test(value) ? '' : 'Invalid OpenAI API key.';
    case 'anthropic':
      return /^sk-ant-\w{10,}$/.test(value) ? '' : 'Invalid Anthropic API key.';
    case 'google':
      return /^AIza[\w-]{30,}$/.test(value) ? '' : 'Invalid Google API key.';
    case 'huggingface':
      return /^hf_\w{10,}$/.test(value) ? '' : 'Invalid Hugging Face API key.';
    default:
      return '';
  }
};
const validateUrl = (url) => {
  if (!url) return 'Webhook URL is required.';
  try {
    new URL(url);
    return '';
  } catch {
    return 'Invalid URL.';
  }
};
const validatePort = (port) => {
  if (!port) return 'Port is required.';
  const n = Number(port);
  if (!Number.isInteger(n) || n < 1 || n > 65535) return 'Invalid port.';
  return '';
};
const validateHost = (host) => {
  if (!host) return 'Host is required.';
  return '';
};
const validateNumber = (value, min, max, label) => {
  if (typeof value !== 'number' || isNaN(value)) return `${label} is required.`;
  if (value < min || value > max) return `${label} must be between ${min} and ${max}.`;
  return '';
};

// یک آبجکت برای تنظیمات پیش‌فرض تعریف می‌کنیم
const defaultSettings = {
  apiKeys: {
    openai: '',
    anthropic: '',
    google: '',
    huggingface: ''
  },
  webhooks: {
    enabled: false,
    url: '',
    secret: ''
  },
  proxy: {
    enabled: false,
    host: '',
    port: '',
    username: '',
    password: ''
  },
  timeout: 30,
  retryDelay: 1000,
  maxConcurrentRequests: 5
};

const ConnectionSettings = forwardRef(({ onChange, ...props }, ref) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(defaultSettings);
  // مقدار اولیه originalSettings رو هم از defaultSettings میذاریم
  const [originalSettings, setOriginalSettings] = useState(defaultSettings);
  const didLoadRef = useRef(false); // برای جلوگیری از اجرای دوباره useEffect

  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    anthropic: false,
    google: false,
    huggingface: false
  });

  const [alert, setAlert] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const [errors, setErrors] = useState({
    apiKeys: {},
    webhooks: {},
    proxy: {},
    timeout: '',
    retryDelay: '',
    maxConcurrentRequests: ''
  });

  // --- ۱. اصلاح useEffect برای بارگذاری صحیح تنظیمات ---
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    const loadSettings = async () => {
      try {
        const allSettings = await window.electronAPI.settings.get();
        // فقط بخش connections رو جدا می‌کنیم و با پیش‌فرض‌ها ادغام می‌کنیم
        if (allSettings && allSettings.connections) {
          const connectionSettings = { ...defaultSettings, ...allSettings.connections };
          setSettings(connectionSettings);
          setOriginalSettings(connectionSettings);
        }
      } catch (error) {
        console.error("Failed to load connection settings:", error);
      }
    };
    loadSettings();
  }, []); // وابستگی خالی یعنی فقط یک بار در زمان مانت شدن اجرا شود

  // useEffect برای اطلاع به والد در مورد تغییرات (این رو هم اضافه کن)
  useEffect(() => {
      if (JSON.stringify(settings) !== JSON.stringify(originalSettings)) {
        onChange && onChange();
      }
  }, [settings, originalSettings, onChange]);

  // --- ۲. اصلاح useImperativeHandle با اضافه کردن آرایه وابستگی ---
  useImperativeHandle(ref, () => ({
    getSettings: () => settings,
    setSettings: (newSettings) => {
      setSettings(newSettings);
      setOriginalSettings(newSettings);
    },
    resetToOriginal: () => {
      setSettings(originalSettings);
    },
    isChanged: () => JSON.stringify(settings) !== JSON.stringify(originalSettings)
  }), [settings, originalSettings]); // <-- آرایه وابستگی اضافه شد

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 2200); // شروع fade out
    setTimeout(() => setAlert(null), 2700); // حذف کامل
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    onChange && onChange();
  };

  const handleNestedSettingChange = (parent, key, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
    onChange && onChange();
  };

  const toggleApiKeyVisibility = (provider) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const apiProviders = [
    {
      id: 'openai',
      name: t('connection.apiProviders.openai.name'),
      description: t('connection.apiProviders.openai.description'),
      icon: 'Brain',
      status: settings.apiKeys.openai ? t('connection.status.connected') : t('connection.status.disconnected'),
      placeholder: 'sk-...'
    },
    {
      id: 'anthropic',
      name: t('connection.apiProviders.anthropic.name'),
      description: t('connection.apiProviders.anthropic.description'),
      icon: 'MessageSquare',
      status: settings.apiKeys.anthropic ? t('connection.status.connected') : t('connection.status.disconnected'),
      placeholder: 'sk-ant-...'
    },
    {
      id: 'google',
      name: t('connection.apiProviders.google.name'),
      description: t('connection.apiProviders.google.description'),
      icon: 'Search',
      status: settings.apiKeys.google ? t('connection.status.connected') : t('connection.status.disconnected'),
      placeholder: 'AIza...'
    },
    {
      id: 'huggingface',
      name: t('connection.apiProviders.huggingface.name'),
      description: t('connection.apiProviders.huggingface.description'),
      icon: 'Code',
      status: settings.apiKeys.huggingface ? t('connection.status.connected') : t('connection.status.disconnected'),
      placeholder: 'hf_...'
    }
  ];

  const testConnection = async (provider) => {
    // Mock connection test
    const success = Math.random() > 0.3; // 70% success rate for demo
    if (success) {
      alert(t('connection.apiProviders.test.success', { provider }));
    } else {
      alert(t('connection.apiProviders.test.fail', { provider }));
    }
  };

  // Validation effect
  useEffect(() => {
    const newErrors = {
      apiKeys: {},
      webhooks: {},
      proxy: {},
      timeout: '',
      retryDelay: '',
      maxConcurrentRequests: ''
    };
    // API keys
    Object.keys(settings.apiKeys).forEach((provider) => {
      newErrors.apiKeys[provider] = validateApiKey(provider, settings.apiKeys[provider]);
    });
    // Webhooks
    if (settings.webhooks.enabled) {
      newErrors.webhooks.url = validateUrl(settings.webhooks.url);
    }
    // Proxy
    if (settings.proxy.enabled) {
      newErrors.proxy.host = validateHost(settings.proxy.host);
      newErrors.proxy.port = validatePort(settings.proxy.port);
    }
    // Numbers
    newErrors.timeout = validateNumber(settings.timeout, 5, 300, 'Timeout');
    newErrors.retryDelay = validateNumber(settings.retryDelay, 100, 10000, 'Retry delay');
    newErrors.maxConcurrentRequests = validateNumber(settings.maxConcurrentRequests, 1, 20, 'Max concurrent requests');
    setErrors(newErrors);
  }, [settings]);

  const hasErrors = () => {
    return (
      Object.values(errors.apiKeys).some(Boolean) ||
      Object.values(errors.webhooks).some(Boolean) ||
      Object.values(errors.proxy).some(Boolean) ||
      errors.timeout || errors.retryDelay || errors.maxConcurrentRequests
    );
  };

  return (
    <div className="space-y-8 font-[Estedad,IRANSans,Arial,sans-serif]">
      {alert && (
        <div
    className={`
      fixed left-1/2 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-500 ease-in-out font-[inherit]
      ${alertVisible ? 'opacity-100 translate-y-24' : 'opacity-0 -translate-y-4 pointer-events-none'}
      ${alert.type === 'success' ? 'bg-green-100 text-green-800' : ''}
      ${alert.type === 'error' ? 'bg-red-100 text-red-800' : ''}
      ${alert.type === 'info' ? 'bg-blue-100 text-blue-800' : ''}
    `}
    style={{
      top: '100px',
      left: '50%',
      minWidth: '260px',
      maxWidth: '90vw',
      textAlign: 'center',
      transform: `translate(-50%, 0)`
    }}
  >
    {alert.message}
        </div>
      )}
      {/* API Keys */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Icon name="Key" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('connection.apiKeys.title')}</h3>
        </div>
        <p className="text-sm text-text-secondary">
          {t('connection.apiKeys.desc')}
        </p>
        
        <div className="space-y-4">
          {apiProviders.map((provider) => (
            <div key={provider.id} className="p-6 bg-surface rounded-lg border border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-lg
                    ${provider.status === t('connection.status.connected') ? 'bg-accent/10' : 'bg-secondary-100'}
                  `}>
                    <Icon 
                      name={provider.icon} 
                      size={20} 
                      color={provider.status === t('connection.status.connected') ? 'var(--color-accent)' : 'var(--color-text-secondary)'} 
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">{provider.name}</h4>
                    <p className="text-sm text-text-secondary">{provider.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`
                    flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                    ${provider.status === t('connection.status.connected') ?'bg-accent/10 text-accent' :'bg-secondary-100 text-text-secondary'
                    }
                  `}>
                    <div className={`w-2 h-2 rounded-full ${
                      provider.status === t('connection.status.connected') ? 'bg-accent' : 'bg-secondary-400'
                    }`} />
                    <span className="capitalize">{provider.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKeys[provider.id] ? 'text' : 'password'}
                      value={settings.apiKeys[provider.id]}
                      onChange={(e) => handleNestedSettingChange('apiKeys', provider.id, e.target.value)}
                      placeholder={provider.placeholder}
                      className={`w-full p-3 pr-12 border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 ${errors.apiKeys[provider.id] ? 'border-red-500' : 'border-border'}`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleApiKeyVisibility(provider.id)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors nav-focus"
                    >
                      <Icon 
                        name={showApiKeys[provider.id] ? 'EyeOff' : 'Eye'} 
                        size={18} 
                        strokeWidth={2}
                      />
                    </button>
                    {errors.apiKeys[provider.id] && (
                      <div className="absolute left-0 -bottom-6 flex items-center text-xs text-red-600">
                        <Icon name="AlertCircle" size={14} className="mr-1" />
                        {t(`connection.apiKeys.errors.${provider.id}`)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => testConnection(provider.name)}
                    disabled={!settings.apiKeys[provider.id] || !!errors.apiKeys[provider.id]}
                    className="px-4 py-3 bg-primary text-text-inverse rounded-lg hover:bg-primary-700 disabled:bg-secondary-200 disabled:text-text-secondary transition-all duration-150 nav-focus"
                  >
                    {t('connection.apiKeys.test')}
                  </button>
                </div>

                {/* فقط اگر خطا نبود پیام امنیتی را نمایش بده */}
                {settings.apiKeys[provider.id] && !errors.apiKeys[provider.id] && (
                  <div className="flex items-center space-x-2 text-xs text-text-secondary mt-3">
                    <Icon name="Shield" size={14} strokeWidth={2} />
                    <span>{t('connection.apiKeys.secure')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Webhook" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('connection.webhooks.title')}</h3>
        </div>
        <p className="text-sm text-text-secondary">
          {t('connection.webhooks.desc')}
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Zap" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('connection.webhooks.enable')}</div>
                <div className="text-sm text-text-secondary">{t('connection.webhooks.enable_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.webhooks.enabled}
                onChange={(e) => handleNestedSettingChange('webhooks', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {settings.webhooks.enabled && (
            <div className="space-y-4 p-4 bg-surface rounded-lg border border-border">
              <div className="space-y-2">
                <label className="font-medium text-text-primary">{t('connection.webhooks.url')}</label>
                <input
                  type="url"
                  value={settings.webhooks.url}
                  onChange={(e) => handleNestedSettingChange('webhooks', 'url', e.target.value)}
                  placeholder={t('connection.webhooks.url_placeholder')}
                  className={`w-full p-3 border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 ${errors.webhooks.url ? 'border-red-500' : 'border-border'}`}
                />
                {errors.webhooks.url && (
                  <div className="flex items-center text-xs text-red-600 mt-1">
                    <Icon name="AlertCircle" size={14} className="mr-1" />
                    {t('connection.webhooks.url_error')}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="font-medium text-text-primary">{t('connection.webhooks.secret')}</label>
                <input
                  type="password"
                  value={settings.webhooks.secret}
                  onChange={(e) => handleNestedSettingChange('webhooks', 'secret', e.target.value)}
                  placeholder={t('connection.webhooks.secret_placeholder')}
                  className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
                />
                <p className="text-xs text-text-secondary">
                  {t('connection.webhooks.secret_desc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proxy Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('connection.proxy.title')}</h3>
        </div>
        <p className="text-sm text-text-secondary">
          {t('connection.proxy.desc')}
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Globe" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('connection.proxy.enable')}</div>
                <div className="text-sm text-text-secondary">{t('connection.proxy.enable_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.proxy.enabled}
                onChange={(e) => handleNestedSettingChange('proxy', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {settings.proxy.enabled && (
            <div className="space-y-4 p-4 bg-surface rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium text-text-primary">{t('connection.proxy.host')}</label>
                  <input
                    type="text"
                    value={settings.proxy.host}
                    onChange={(e) => handleNestedSettingChange('proxy', 'host', e.target.value)}
                    placeholder={t('connection.proxy.host_placeholder')}
                    className={`w-full p-3 border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 ${errors.proxy.host ? 'border-red-500' : 'border-border'}`}
                  />
                  {errors.proxy.host && (
                    <div className="flex items-center text-xs text-red-600 mt-1">
                      <Icon name="AlertCircle" size={14} className="mr-1" />
                      {t('connection.proxy.host_error')}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-text-primary">{t('connection.proxy.port')}</label>
                  <input
                    type="number"
                    value={settings.proxy.port}
                    onChange={(e) => handleNestedSettingChange('proxy', 'port', e.target.value)}
                    placeholder={t('connection.proxy.port_placeholder')}
                    className={`w-full p-3 border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 ${errors.proxy.port ? 'border-red-500' : 'border-border'}`}
                  />
                  {errors.proxy.port && (
                    <div className="flex items-center text-xs text-red-600 mt-1">
                      <Icon name="AlertCircle" size={14} className="mr-1" />
                      {t('connection.proxy.port_error')}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium text-text-primary">{t('connection.proxy.username')}</label>
                  <input
                    type="text"
                    value={settings.proxy.username}
                    onChange={(e) => handleNestedSettingChange('proxy', 'username', e.target.value)}
                    placeholder={t('connection.proxy.username_placeholder')}
                    className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-text-primary">{t('connection.proxy.password')}</label>
                  <input
                    type="password"
                    value={settings.proxy.password}
                    onChange={(e) => handleNestedSettingChange('proxy', 'password', e.target.value)}
                    placeholder={t('connection.proxy.password_placeholder')}
                    className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connection Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Settings" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('connection.settings.title')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="font-medium text-text-primary">{t('connection.settings.timeout')}</label>
            <select
              value={settings.timeout}
              onChange={(e) => handleSettingChange('timeout', parseInt(e.target.value))}
              className={`w-full p-3 border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 ${errors.timeout ? 'border-red-500' : 'border-border'}`}
            >
              <option value={10}>{t('connection.settings.timeout_option', { seconds: 10 })}</option>
              <option value={30}>{t('connection.settings.timeout_option', { seconds: 30 })}</option>
              <option value={60}>{t('connection.settings.timeout_option', { seconds: 60 })}</option>
              <option value={120}>{t('connection.settings.timeout_option', { seconds: 120 })}</option>
            </select>
            {errors.timeout && (
              <div className="flex items-center text-xs text-red-600 mt-1">
                <Icon name="AlertCircle" size={14} className="mr-1" />
                {t('connection.settings.timeout_error')}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="font-medium text-text-primary">{t('connection.settings.retryDelay')}</label>
            <select
              value={settings.retryDelay}
              onChange={(e) => handleSettingChange('retryDelay', parseInt(e.target.value))}
              className={`w-full p-3 border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 ${errors.retryDelay ? 'border-red-500' : 'border-border'}`}
            >
              <option value={500}>{t('connection.settings.retryDelay_option', { value: 500 })}</option>
              <option value={1000}>{t('connection.settings.retryDelay_option', { value: 1000 })}</option>
              <option value={2000}>{t('connection.settings.retryDelay_option', { value: 2000 })}</option>
              <option value={5000}>{t('connection.settings.retryDelay_option', { value: 5000 })}</option>
            </select>
            {errors.retryDelay && (
              <div className="flex items-center text-xs text-red-600 mt-1">
                <Icon name="AlertCircle" size={14} className="mr-1" />
                {t('connection.settings.retryDelay_error')}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="font-medium text-text-primary">{t('connection.settings.maxConcurrentRequests')}</label>
            <select
              value={settings.maxConcurrentRequests}
              onChange={(e) => handleSettingChange('maxConcurrentRequests', parseInt(e.target.value))}
              className={`w-full p-3 border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 ${errors.maxConcurrentRequests ? 'border-red-500' : 'border-border'}`}
            >
              <option value={1}>{t('connection.settings.maxConcurrentRequests_option', { count: 1 })}</option>
              <option value={3}>{t('connection.settings.maxConcurrentRequests_option', { count: 3 })}</option>
              <option value={5}>{t('connection.settings.maxConcurrentRequests_option', { count: 5 })}</option>
              <option value={10}>{t('connection.settings.maxConcurrentRequests_option', { count: 10 })}</option>
            </select>
            {errors.maxConcurrentRequests && (
              <div className="flex items-center text-xs text-red-600 mt-1">
                <Icon name="AlertCircle" size={14} className="mr-1" />
                {t('connection.settings.maxConcurrentRequests_error')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {/* این بخش حذف شد چون مادر آن را کنترل می‌کند */}
    </div>
  );
});

export default ConnectionSettings;