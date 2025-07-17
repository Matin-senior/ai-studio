import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import Icon from 'components/AppIcon';
import { useTranslation } from 'react-i18next';

// تعریف تنظیمات پیش‌فرض بیرون از کامپوننت
const defaultSettings = {
  fontSize: 'medium',
  fontFamily: 'inter',
  lineHeight: 'normal',
  chatDensity: 'comfortable',
  sidebarWidth: 'medium',
  showLineNumbers: true,
  wordWrap: true,
  minimap: false,
  animations: true,
  reducedMotion: false,
  highContrast: false,
  focusMode: false,
  compactMode: false,
  showTimestamps: true,
  showAvatars: true,
  messageGrouping: true
};

// کامپوننت را با forwardRef بازنویسی می‌کنیم
const InterfaceSettings = forwardRef(({ onChange }, ref) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const didLoadRef = useRef(false);

  // useEffect برای بارگذاری تنظیمات اولیه
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        if (window.electronAPI?.settings?.get) {
          const allSettings = await window.electronAPI.settings.get();
          // کلید 'interface' باید با id بخش در index.jsx مطابقت داشته باشد
          const interfaceSettings = { ...defaultSettings, ...(allSettings.interface || {}) };
          setSettings(interfaceSettings);
          setOriginalSettings(interfaceSettings);
        }
      } catch (error) {
        console.error("Failed to load interface settings:", error);
        // در صورت خطا، از مقادیر پیش‌فرض استفاده می‌کنیم
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // useEffect برای اطلاع‌رسانی به والد در مورد تغییرات
  useEffect(() => {
    if (!isLoading && JSON.stringify(settings) !== JSON.stringify(originalSettings)) {
      onChange && onChange();
    }
  }, [settings, originalSettings, isLoading, onChange]);


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

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const fontSizes = [
    { id: 'small', label: t('interface.fontSize.small'), size: '14px' },
    { id: 'medium', label: t('interface.fontSize.medium'), size: '16px' },
    { id: 'large', label: t('interface.fontSize.large'), size: '18px' },
    { id: 'extra-large', label: t('interface.fontSize.extraLarge'), size: '20px' }
  ];

  const fontFamilies = [
    { id: 'inter', label: t('interface.fontFamily.inter'), family: 'Inter, sans-serif' },
    { id: 'system', label: t('interface.fontFamily.system'), family: 'system-ui, sans-serif' },
    { id: 'mono', label: t('interface.fontFamily.mono'), family: 'JetBrains Mono, monospace' },
    { id: 'serif', label: t('interface.fontFamily.serif'), family: 'Georgia, serif' }
  ];

  const lineHeights = [
    { id: 'compact', label: t('interface.lineHeight.compact'), value: '1.4' },
    { id: 'normal', label: t('interface.lineHeight.normal'), value: '1.6' },
    { id: 'relaxed', label: t('interface.lineHeight.relaxed'), value: '1.8' }
  ];

  const chatDensities = [
    { id: 'compact', label: t('interface.chatDensity.compact.label'), description: t('interface.chatDensity.compact.desc') },
    { id: 'comfortable', label: t('interface.chatDensity.comfortable.label'), description: t('interface.chatDensity.comfortable.desc') },
    { id: 'spacious', label: t('interface.chatDensity.spacious.label'), description: t('interface.chatDensity.spacious.desc') }
  ];

  const sidebarWidths = [
    { id: 'narrow', label: t('interface.sidebarWidth.narrow.label'), width: '240px' },
    { id: 'medium', label: t('interface.sidebarWidth.medium.label'), width: '320px' },
    { id: 'wide', label: t('interface.sidebarWidth.wide.label'), width: '400px' }
  ];

  return (
    <div className="space-y-8 font-[Estedad,IRANSans,Arial,sans-serif]">
      {/* Typography */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Icon name="Type" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary font-[inherit]">{t('interface.sections.typography')}</h3>
        </div>
        {/* Font Size */}
        <div className="space-y-3">
          <label className="font-medium text-text-primary font-[inherit]">{t('interface.fields.fontSize')}</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => handleSettingChange('fontSize', size.id)}
                className={`
                  p-3 rounded-lg border-2 text-center transition-all duration-150 ease-smooth nav-focus
                  ${settings.fontSize === size.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-surface-hover'
                  }
                `}
              >
                <div className="font-medium text-text-primary font-[inherit]" style={{ fontSize: size.size }}>
                  Aa
                </div>
                <div className="text-xs text-text-secondary mt-1 font-[inherit]">{size.label}</div>
              </button>
            ))}
          </div>
        </div>
        {/* Font Family */}
        <div className="space-y-3">
          <label className="font-medium text-text-primary font-[inherit]">{t('interface.fields.fontFamily')}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fontFamilies.map((font) => (
              <button
                key={font.id}
                onClick={() => handleSettingChange('fontFamily', font.id)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all duration-150 ease-smooth nav-focus
                  ${settings.fontFamily === font.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-surface-hover'
                  }
                `}
              >
                <div className="font-medium text-text-primary font-[inherit]" style={{ fontFamily: font.family }}>
                  {font.label}
                </div>
                <div className="text-sm text-text-secondary mt-1 font-[inherit]" style={{ fontFamily: font.family }}>
                  {t('interface.fontFamily.example')}
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Line Height */}
        <div className="space-y-3">
          <label className="font-medium text-text-primary font-[inherit]">{t('interface.fields.lineHeight')}</label>
          <div className="grid grid-cols-3 gap-3">
            {lineHeights.map((height) => (
              <button
                key={height.id}
                onClick={() => handleSettingChange('lineHeight', height.id)}
                className={`
                  p-3 rounded-lg border-2 text-center transition-all duration-150 ease-smooth nav-focus
                  ${settings.lineHeight === height.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-surface-hover'
                  }
                `}
              >
                <div className="font-medium text-text-primary font-[inherit]">{height.label}</div>
                <div className="text-xs text-text-secondary mt-1 font-[inherit]">{height.value}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Layout */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Icon name="Layout" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('interface.sections.layout')}</h3>
        </div>
        {/* Chat Density */}
        <div className="space-y-3">
          <label className="font-medium text-text-primary">{t('interface.fields.chatDensity')}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {chatDensities.map((density) => (
              <button
                key={density.id}
                onClick={() => handleSettingChange('chatDensity', density.id)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all duration-150 ease-smooth nav-focus
                  ${settings.chatDensity === density.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-surface-hover'
                  }
                `}
              >
                <div className="font-medium text-text-primary">{density.label}</div>
                <div className="text-sm text-text-secondary mt-1">{density.description}</div>
              </button>
            ))}
          </div>
        </div>
        {/* Sidebar Width */}
        <div className="space-y-3">
          <label className="font-medium text-text-primary">{t('interface.fields.sidebarWidth')}</label>
          <div className="grid grid-cols-3 gap-3">
            {sidebarWidths.map((width) => (
              <button
                key={width.id}
                onClick={() => handleSettingChange('sidebarWidth', width.id)}
                className={`
                  p-3 rounded-lg border-2 text-center transition-all duration-150 ease-smooth nav-focus
                  ${settings.sidebarWidth === width.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-surface-hover'
                  }
                `}
              >
                <div className="font-medium text-text-primary">{width.label}</div>
                <div className="text-xs text-text-secondary mt-1">{width.width}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Code Editor */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Code" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('interface.sections.codeEditor')}</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Hash" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('interface.fields.showLineNumbers')}</div>
                <div className="text-sm text-text-secondary">{t('interface.descriptions.showLineNumbers')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showLineNumbers}
                onChange={(e) => handleSettingChange('showLineNumbers', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="WrapText" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('interface.fields.wordWrap')}</div>
                <div className="text-sm text-text-secondary">{t('interface.descriptions.wordWrap')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(e) => handleSettingChange('wordWrap', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Map" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('interface.fields.minimap')}</div>
                <div className="text-sm text-text-secondary">{t('interface.descriptions.minimap')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.minimap}
                onChange={(e) => handleSettingChange('minimap', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
      {/* Accessibility */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Accessibility" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('interface.sections.accessibility')}</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Contrast" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('interface.fields.highContrast')}</div>
                <div className="text-sm text-text-secondary">{t('interface.descriptions.highContrast')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Zap" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('interface.fields.reducedMotion')}</div>
                <div className="text-sm text-text-secondary">{t('interface.descriptions.reducedMotion')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
      {/* Chat Interface */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="MessageSquare" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('interface.sections.chatInterface')}</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Clock" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('interface.fields.showTimestamps')}</div>
                <div className="text-sm text-text-secondary">{t('interface.descriptions.showTimestamps')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showTimestamps}
                onChange={(e) => handleSettingChange('showTimestamps', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="User" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('interface.fields.showAvatars')}</div>
                <div className="text-sm text-text-secondary">{t('interface.descriptions.showAvatars')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showAvatars}
                onChange={(e) => handleSettingChange('showAvatars', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Group" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('interface.fields.messageGrouping')}</div>
                <div className="text-sm text-text-secondary">{t('interface.descriptions.messageGrouping')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.messageGrouping}
                onChange={(e) => handleSettingChange('messageGrouping', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Focus" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('interface.fields.focusMode')}</div>
                <div className="text-sm text-text-secondary">{t('interface.descriptions.focusMode')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.focusMode}
                onChange={(e) => handleSettingChange('focusMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
    </div>
  );
});

export default InterfaceSettings;