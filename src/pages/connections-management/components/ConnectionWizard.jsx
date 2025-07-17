import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ConnectionWizard = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [connectionData, setConnectionData] = useState({});

  const popularServices = [
    {
      id: 'openai',
      name: 'OpenAI',
      type: 'API',
      category: 'apis',
      logo: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=64&h=64&fit=crop&crop=center',
      description: 'Connect to OpenAI GPT models and APIs',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'model', label: 'Default Model', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo'], required: true },
        { name: 'maxTokens', label: 'Max Tokens', type: 'number', default: 4096 },
        { name: 'temperature', label: 'Temperature', type: 'number', default: 0.7, step: 0.1, min: 0, max: 2 }
      ]
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      type: 'Database',
      category: 'databases',
      logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=64&h=64&fit=crop&crop=center',
      description: 'Connect to PostgreSQL database',
      fields: [
        { name: 'host', label: 'Host', type: 'text', required: true },
        { name: 'port', label: 'Port', type: 'number', default: 5432, required: true },
        { name: 'database', label: 'Database Name', type: 'text', required: true },
        { name: 'username', label: 'Username', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true }
      ]
    },
    {
      id: 'aws-s3',
      name: 'AWS S3',
      type: 'Cloud Storage',
      category: 'cloud',
      logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=64&h=64&fit=crop&crop=center',
      description: 'Connect to Amazon S3 for file storage',
      fields: [
        { name: 'accessKey', label: 'Access Key ID', type: 'text', required: true },
        { name: 'secretKey', label: 'Secret Access Key', type: 'password', required: true },
        { name: 'bucket', label: 'Bucket Name', type: 'text', required: true },
        { name: 'region', label: 'Region', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1'], required: true }
      ]
    },
    {
      id: 'slack',
      name: 'Slack',
      type: 'Webhook',
      category: 'webhooks',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=64&h=64&fit=crop&crop=center',
      description: 'Send notifications to Slack channels',
      fields: [
        { name: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
        { name: 'channel', label: 'Channel', type: 'text', required: true },
        { name: 'username', label: 'Bot Username', type: 'text', default: 'AI Studio Bot' }
      ]
    },
    {
      id: 'github',
      name: 'GitHub',
      type: 'API',
      category: 'apis',
      logo: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=64&h=64&fit=crop&crop=center',
      description: 'Access GitHub repositories and APIs',
      fields: [
        { name: 'token', label: 'Personal Access Token', type: 'password', required: true },
        { name: 'organization', label: 'Organization (optional)', type: 'text' },
        { name: 'repositories', label: 'Repositories', type: 'text', placeholder: 'repo1,repo2,repo3' }
      ]
    },
    {
      id: 'redis',
      name: 'Redis',
      type: 'Database',
      category: 'databases',
      logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=64&h=64&fit=crop&crop=center',
      description: 'Connect to Redis for caching and sessions',
      fields: [
        { name: 'host', label: 'Host', type: 'text', required: true },
        { name: 'port', label: 'Port', type: 'number', default: 6379, required: true },
        { name: 'password', label: 'Password', type: 'password' },
        { name: 'database', label: 'Database Number', type: 'number', default: 0 }
      ]
    }
  ];

  const steps = [
    { id: 1, title: 'Select Service', description: 'Choose the service you want to connect' },
    { id: 2, title: 'Configure', description: 'Enter connection details and credentials' },
    { id: 3, title: 'Test & Save', description: 'Test the connection and save configuration' }
  ];

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    // Initialize connection data with default values
    const initialData = {};
    service.fields.forEach(field => {
      if (field.default !== undefined) {
        initialData[field.name] = field.default;
      }
    });
    setConnectionData(initialData);
    setCurrentStep(2);
  };

  const handleFieldChange = (fieldName, value) => {
    setConnectionData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleTestConnection = () => {
    // Simulate connection test
    console.log('Testing connection with data:', connectionData);
    // In real implementation, this would make an API call to test the connection
    setCurrentStep(3);
  };

  const handleSave = () => {
    const newConnection = {
      id: Date.now(),
      name: selectedService.name,
      type: selectedService.type,
      category: selectedService.category,
      status: 'connected',
      logo: selectedService.logo,
      lastSync: new Date(),
      health: 100,
      dataTransfer: '0 GB',
      description: selectedService.description,
      config: connectionData
    };
    onComplete(newConnection);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Popular Services
              </h3>
              <p className="text-text-secondary mb-4">
                Choose from our pre-configured service templates
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="flex items-start space-x-4 p-4 border border-border rounded-lg bg-background hover:bg-surface-hover hover:shadow-hover transition-all duration-150 ease-smooth nav-focus text-left"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                    <Image
                      src={service.logo}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary mb-1">
                      {service.name}
                    </h4>
                    <p className="text-sm text-text-secondary mb-2">
                      {service.type}
                    </p>
                    <p className="text-sm text-text-tertiary">
                      {service.description}
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-text-tertiary" />
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface">
                <Image
                  src={selectedService.logo}
                  alt={selectedService.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary">
                  Configure {selectedService.name}
                </h3>
                <p className="text-text-secondary">
                  Enter your connection details and credentials
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedService.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {field.label}
                    {field.required && <span className="text-error ml-1">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={connectionData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={connectionData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-accent-50 rounded-full mx-auto mb-4">
                <Icon name="CheckCircle" size={32} color="var(--color-accent)" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Connection Successful!
              </h3>
              <p className="text-text-secondary">
                Your {selectedService.name} connection has been configured and tested successfully.
              </p>
            </div>

            <div className="bg-surface rounded-lg p-4">
              <h4 className="font-medium text-text-primary mb-3">Connection Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Service:</span>
                  <span className="text-text-primary">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Type:</span>
                  <span className="text-text-primary">{selectedService.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status:</span>
                  <span className="text-accent">Connected</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-200 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Add New Connection
            </h2>
            <p className="text-text-secondary mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
          >
            <Icon name="X" size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center space-x-2">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${currentStep >= step.id
                      ? 'bg-primary text-text-inverse' :'bg-secondary-100 text-text-secondary'
                    }
                  `}>
                    {currentStep > step.id ? (
                      <Icon name="Check" size={16} strokeWidth={2} />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`
                    text-sm font-medium
                    ${currentStep >= step.id ? 'text-text-primary' : 'text-text-secondary'}
                  `}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-px
                    ${currentStep > step.id ? 'bg-primary' : 'bg-secondary-200'}
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <button
            onClick={() => {
              if (currentStep === 1) {
                onClose();
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
          >
            <Icon name="ChevronLeft" size={16} strokeWidth={2} />
            <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          <div className="flex items-center space-x-2">
            {currentStep === 2 && (
              <button
                onClick={handleTestConnection}
                className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
              >
                <Icon name="Zap" size={16} strokeWidth={2} />
                <span>Test Connection</span>
              </button>
            )}
            
            {currentStep === 3 ? (
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-primary text-text-inverse px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-all duration-150 ease-smooth nav-focus"
              >
                <Icon name="Save" size={16} strokeWidth={2} />
                <span>Save Connection</span>
              </button>
            ) : currentStep === 2 ? (
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center space-x-2 bg-primary text-text-inverse px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-all duration-150 ease-smooth nav-focus"
              >
                <span>Continue</span>
                <Icon name="ChevronRight" size={16} strokeWidth={2} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionWizard;