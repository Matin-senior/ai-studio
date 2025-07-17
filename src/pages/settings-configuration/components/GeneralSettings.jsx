// src/pages/settings-configuration/components/GeneralSettings.jsx
import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import Icon from 'components/AppIcon';
import { useTranslation } from 'react-i18next';

const defaultSettings = {
  language: 'en',
  notifications: { desktop: true, sound: false, email: true },
  autoSave: true,
  startupBehavior: 'last-session'
};

// --- FIX 1: Corrected mergeDeep function ---
// This version correctly overwrites default values with loaded user settings.
const mergeDeep = (target, source) => {
  const output = { ...target };
  if (target && typeof target === 'object' && source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      // If the key points to a nested object in both, recurse.
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
          target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        output[key] = mergeDeep(target[key], source[key]);
      } else {
        // Otherwise, just overwrite the value from the source.
        output[key] = source[key];
      }
    });
  }
  return output;
};


const GeneralSettings = forwardRef(({ onChange, showAlert, ...props }, ref) => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        if (window.electronAPI?.settings?.get) {
          const allSettings = await window.electronAPI.settings.get();
          const generalPart = mergeDeep({ ...defaultSettings }, allSettings.general || {});
          setSettings(generalPart);
          setOriginalSettings(generalPart);
          if (i18n.language !== generalPart.language) {
            await i18n.changeLanguage(generalPart.language);
          }
        }
      } catch (error) {
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (JSON.stringify(settings) !== JSON.stringify(originalSettings)) {
      onChange && onChange();
    }
  }, [settings, originalSettings, onChange]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'language') {
      i18n.changeLanguage(value);
    }
  };

  const handleNestedSettingChange = (parent, key, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
  };

  // حذف منطق save/cancel و پیاده‌سازی getSettings/setSettings/resetToOriginal برای کنترل مرکزی
  useImperativeHandle(ref, () => ({
    getSettings: () => settings,
    setSettings: (newSettings) => {
      setSettings(newSettings);
      setOriginalSettings(newSettings);
      if (newSettings.language && i18n.language !== newSettings.language) {
        i18n.changeLanguage(newSettings.language);
      }
    },
    resetToOriginal: () => {
      setSettings(originalSettings);
      if (originalSettings.language && i18n.language !== originalSettings.language) {
        i18n.changeLanguage(originalSettings.language);
      }
    },
    isChanged: () => JSON.stringify(settings) !== JSON.stringify(originalSettings)
  }), [settings, originalSettings]);

  const languages = [
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { id: 'es', label: 'Español', flag: '🇪🇸' },
    { id: 'fr', label: 'Français', flag: '🇫🇷' },
    { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { id: 'zh', label: '中文', flag: '🇨🇳' },
    { id: 'ja', label: '日本語', flag: '🇯🇵' }
  ];

  const startupOptions = [
    { id: 'new-session', label: t('settings.startup_new') },
    { id: 'last-session', label: t('settings.startup_restore') },
    { id: 'welcome-screen', label: t('settings.startup_welcome') }
  ];

  const isFa = settings.language === 'fa';

  if (isLoading) {
    console.log('[GeneralSettings] isLoading...');
    return <div className="p-8 text-center">{t('settings.loading')}</div>;
  }

  return (
    <div className={`space-y-8${settings.language === 'fa' ? ' font-sans' : ''}`}>
      {/* Language Selection */}
      <div className={`space-y-4${isFa ? ' font-sans' : ''}`}>
        <div className="flex items-center space-x-2">
          <Icon name="Globe" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className={`text-lg font-medium text-text-primary${isFa ? ' font-sans' : ''}`}>{t('settings.language')}</h3>
        </div>
        <p className={`text-sm text-text-secondary${isFa ? ' font-sans' : ''}`}>{t('settings.language_desc')}</p>
        <select
          value={settings.language}
          onChange={(e) => handleSettingChange('language', e.target.value)}
          className={`w-full max-w-xs p-3 border border-border rounded-lg bg-background text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150${isFa ? ' font-sans' : ''}`}
        >
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id} className={isFa ? 'font-sans' : ''}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
      </div>
      {/* Notifications */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Bell" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('settings.notifications')}</h3>
        </div>
        <p className="text-sm text-text-secondary">{t('settings.notifications_desc')}</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Monitor" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.notifications_desktop')}</div>
                <div className="text-sm text-text-secondary">{t('settings.notifications_desktop_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications?.desktop ?? false}
                onChange={(e) => handleNestedSettingChange('notifications', 'desktop', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Volume2" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.notifications_sound')}</div>
                <div className="text-sm text-text-secondary">{t('settings.notifications_sound_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications?.sound ?? false}
                onChange={(e) => handleNestedSettingChange('notifications', 'sound', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Mail" size={20} strokeWidth={2} className="text-text-secondary" />
              <div>
                <div className="font-medium text-text-primary">{t('settings.notifications_email')}</div>
                <div className="text-sm text-text-secondary">{t('settings.notifications_email_desc')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications?.email ?? false}
                onChange={(e) => handleNestedSettingChange('notifications', 'email', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
      {/* Auto Save */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Save" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('settings.auto_save')}</h3>
        </div>
        <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
          <div>
            <div className="font-medium text-text-primary">{t('settings.auto_save_title')}</div>
            <div className="text-sm text-text-secondary">{t('settings.auto_save_desc')}</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        <p className="text-sm text-text-secondary">{t('settings.auto_save_hint')}</p>
      </div>
      {/* Startup Behavior */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Power" size={20} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="text-lg font-medium text-text-primary">{t('settings.startup_behavior')}</h3>
        </div>
        <p className="text-sm text-text-secondary">{t('settings.startup_behavior_desc')}</p>
        <div className="space-y-2">
          {startupOptions.map((option) => (
            <label key={option.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors">
              <input
                type="radio"
                name="startupBehavior"
                value={option.id}
                checked={settings.startupBehavior === option.id}
                onChange={(e) => handleSettingChange('startupBehavior', e.target.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
              />
              <span className="text-text-primary">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
});

export default GeneralSettings;