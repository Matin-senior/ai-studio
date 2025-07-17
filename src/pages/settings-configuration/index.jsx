import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from 'components/AppIcon';
import GeneralSettings from './components/GeneralSettings';
import AIModelSettings from './components/AIModelSettings';
import InterfaceSettings from './components/InterfaceSettings';
import ConnectionSettings from './components/ConnectionSettings';
import AdvancedSettings from './components/AdvancedSettings';

const SettingsConfiguration = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [alert, setAlert] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);

  // --- قدم 1: برای هر کامپوننت فرزند یک "کنترل از راه دور" (ref) می‌سازیم ---
  const generalSettingsRef = useRef(null);
  const aiModelSettingsRef = useRef(null);
  const interfaceSettingsRef = useRef(null);
  const connectionSettingsRef = useRef(null);
  const advancedSettingsRef = useRef(null);

  // یک آبجکت برای دسترسی راحت‌تر به ref ها بر اساس بخش فعال
  const sectionRefs = {
    general: generalSettingsRef,
    'ai-models': aiModelSettingsRef,
    interface: interfaceSettingsRef,
    connections: connectionSettingsRef,
    advanced: advancedSettingsRef,
  };

  const settingsSections = [
    {
      id: 'general',
      label: t('settingsPage.sections.general.label'),
      icon: 'Settings',
      description: t('settingsPage.sections.general.description')
    },
    {
      id: 'ai-models',
      label: t('settingsPage.sections.ai-models.label'),
      icon: 'Brain',
      description: t('settingsPage.sections.ai-models.description')
    },
    {
      id: 'interface',
      label: t('settingsPage.sections.interface.label'),
      icon: 'Layout',
      description: t('settingsPage.sections.interface.description')
    },
    {
      id: 'connections',
      label: t('settingsPage.sections.connections.label'),
      icon: 'Link',
      description: t('settingsPage.sections.connections.description')
    },
    {
      id: 'advanced',
      label: t('settingsPage.sections.advanced.label'),
      icon: 'Code',
      description: t('settingsPage.sections.advanced.description')
    }
  ];

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 2200);
    setTimeout(() => setAlert(null), 2700);
  };

  const handleSectionChange = (sectionId) => {
    if (hasUnsavedChanges) {
      showAlert('You have unsaved changes. Save or discard them first.', 'warning');
      return;
    }
    setActiveSection(sectionId);
  };

  const handleSettingsChange = () => {
    setHasUnsavedChanges(true);
  };

  // --- قدم 2: توابع اصلی برای ذخیره و لغو که از بنر نارنجی صدا زده می‌شوند ---
// src/pages/settings-configuration/index.jsx (FIXED)

const handleSaveFromBanner = async () => {
  const allSettings = {};

  // --- قدم ۱: جمع‌آوری تنظیمات از تمام بخش‌ها ---
  if (generalSettingsRef.current) {
    allSettings.general = generalSettingsRef.current.getSettings();
  }
  if (aiModelSettingsRef.current) {
    allSettings['ai-models'] = aiModelSettingsRef.current.getSettings();
  }
  if (interfaceSettingsRef.current) {
    allSettings.interface = interfaceSettingsRef.current.getSettings();
  }
  if (connectionSettingsRef.current) {
    allSettings.connections = connectionSettingsRef.current.getSettings();
  }
  if (advancedSettingsRef.current) {
    allSettings.advanced = advancedSettingsRef.current.getSettings();
  }

  try {
    // ارسال آبجکت کامل برای ذخیره‌سازی
    await window.electronAPI.settings.set(allSettings);

    // --- قدم ۲: آپدیت state اصلی تمام کامپوننت‌ها پس از ذخیره موفق ---
    if (generalSettingsRef.current && allSettings.general) {
      generalSettingsRef.current.setSettings(allSettings.general);
    }
    if (aiModelSettingsRef.current && allSettings['ai-models']) {
      aiModelSettingsRef.current.setSettings(allSettings['ai-models']);
    }
    if (interfaceSettingsRef.current && allSettings.interface) {
      interfaceSettingsRef.current.setSettings(allSettings.interface);
    }
    if (connectionSettingsRef.current && allSettings.connections) {
      connectionSettingsRef.current.setSettings(allSettings.connections);
    }
    if (advancedSettingsRef.current && allSettings.advanced) {
      advancedSettingsRef.current.setSettings(allSettings.advanced);
    }

    setHasUnsavedChanges(false);
    showAlert('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error); // لاگ کردن خطا برای دیباگ بهتر
    showAlert('An error occurred while saving settings.', 'error');
  }
};

const handleDiscardFromBanner = () => {
  // --- فراخوانی resetToOriginal برای تمام بخش‌ها ---
  if (generalSettingsRef.current) {
    generalSettingsRef.current.resetToOriginal();
  }
  if (aiModelSettingsRef.current) {
    aiModelSettingsRef.current.resetToOriginal();
  }
  if (interfaceSettingsRef.current) {
    interfaceSettingsRef.current.resetToOriginal();
  }
  if (connectionSettingsRef.current) {
    connectionSettingsRef.current.resetToOriginal();
  }
  if (advancedSettingsRef.current) {
    advancedSettingsRef.current.resetToOriginal();
  }

  // --- ریست کردن وضعیت کلی و نمایش نوتیفیکیشن ---
  setHasUnsavedChanges(false);
  showAlert('Changes discarded.', 'info');
};


  // --- قدم 3: کنترل از راه دور (ref) را به هر کامپوننت فرزند پاس می‌دهیم ---
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings ref={generalSettingsRef} onChange={handleSettingsChange} showAlert={showAlert} />;
      case 'ai-models':
        return <AIModelSettings ref={aiModelSettingsRef} onChange={handleSettingsChange} showAlert={showAlert} />;
      case 'interface':
        return <InterfaceSettings ref={interfaceSettingsRef} onChange={handleSettingsChange} showAlert={showAlert} />;
      case 'connections':
        return <ConnectionSettings ref={connectionSettingsRef} onChange={handleSettingsChange} showAlert={showAlert} />;
      case 'advanced':
        return <AdvancedSettings ref={advancedSettingsRef} onChange={handleSettingsChange} showAlert={showAlert} />;
      default:
        return <GeneralSettings ref={generalSettingsRef} onChange={handleSettingsChange} showAlert={showAlert} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-12 font-[Estedad,IRANSans,Arial,sans-serif]">
      {/* Global Alert */}
      {alert && (
        <div
          className={`fixed left-1/2 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-500 ease-in-out font-[inherit]`
          + `${alertVisible ? ' opacity-100 translate-y-24' : ' opacity-0 -translate-y-4 pointer-events-none'}`
          + `${alert.type === 'success' ? ' bg-green-100 text-green-800' : ''}`
          + `${alert.type === 'error' ? ' bg-red-100 text-red-800' : ''}`
          + `${alert.type === 'info' ? ' bg-blue-100 text-blue-800' : ''}`
          + `${alert.type === 'warning' ? ' bg-yellow-100 text-yellow-800' : ''}`
        }
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
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Navigation Panel */}
        <div className="w-80 bg-surface border-r border-border flex flex-col">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-semibold text-text-primary mb-2">{t('settingsPage.title')}</h1>
            <p className="text-sm text-text-secondary">{t('settingsPage.subtitle')}</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`
                  w-full flex items-start space-x-3 p-4 rounded-lg text-left transition-all duration-150 ease-smooth nav-focus
                  ${activeSection === section.id
                    ? 'bg-primary text-text-inverse shadow-active'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:shadow-hover'
                  }
                `}
              >
                <Icon 
                  name={section.icon} 
                  size={20} 
                  strokeWidth={2}
                  className="mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{section.label}</div>
                  <div className="text-xs opacity-75 mt-1">{section.description}</div>
                </div>
                {activeSection === section.id && hasUnsavedChanges && (
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2" />
                )}
              </button>
            ))}
          </nav>
          {/* Mobile Navigation Toggle */}
          <div className="lg:hidden p-4 border-t border-border">
            <button className="w-full flex items-center justify-center space-x-2 p-3 bg-primary text-text-inverse rounded-lg font-medium">
              <Icon name="Menu" size={18} strokeWidth={2} />
              <span>{t('settingsPage.menu')}</span>
            </button>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              {/* Section Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-2">
                  <Icon 
                    name={settingsSections.find(s => s.id === activeSection)?.icon || 'Settings'} 
                    size={24} 
                    color="var(--color-primary)" 
                    strokeWidth={2}
                  />
                  <h2 className="text-3xl font-semibold text-text-primary">
                    {settingsSections.find(s => s.id === activeSection)?.label}
                  </h2>
                </div>
                <p className="text-text-secondary">
                  {settingsSections.find(s => s.id === activeSection)?.description}
                </p>
              </div>

              {/* Unsaved Changes Banner */}
              <div className="relative min-h-[72px]">{/* min-h برای جلوگیری از جابجایی ناگهانی */}
                <div className={`transition-all duration-500 ease-in-out ${hasUnsavedChanges ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'} absolute left-0 right-0`}>
                  {hasUnsavedChanges && (
                    <div className="mb-6 p-4 bg-warning-light border border-warning/20 rounded-lg flex items-center space-x-3 shadow-md">
                      <Icon name="AlertTriangle" size={20} color="var(--color-warning)" strokeWidth={2} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-warning">Unsaved Changes</p>
                        <p className="text-xs text-warning/80">You have unsaved changes in this section.</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 text-xs bg-warning text-white rounded font-medium hover:bg-warning/90 transition-colors"
                          onClick={handleSaveFromBanner}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleDiscardFromBanner}
                          className="px-3 py-1 text-xs border border-warning text-warning rounded font-medium hover:bg-warning/10 transition-colors"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Section Content */}
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="p-4">
          <div className="space-y-4">
            {settingsSections.map((section) => (
              <div key={section.id} className="bg-surface rounded-lg border border-border">
                <button
                  onClick={() => handleSectionChange(section.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Icon name={section.icon} size={20} strokeWidth={2} />
                    <div>
                      <div className="font-medium text-text-primary">{section.label}</div>
                      <div className="text-sm text-text-secondary">{section.description}</div>
                    </div>
                  </div>
                  <Icon 
                    name={activeSection === section.id ? "ChevronUp" : "ChevronDown"} 
                    size={20} 
                    strokeWidth={2}
                    className="text-text-secondary"
                  />
                </button>
                
                {activeSection === section.id && (
                  <div className="border-t border-border p-4">
                    {renderActiveSection()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsConfiguration;
