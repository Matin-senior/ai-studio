import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/ai-chat-interface');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 pt-16">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mx-auto mb-6">
            <Icon 
              name="AlertTriangle" 
              size={48} 
              color="var(--color-primary)" 
              strokeWidth={1.5}
            />
          </div>
          <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Page Not Found</h2>
          <p className="text-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <button
          onClick={handleGoHome}
          className="inline-flex items-center space-x-2 bg-primary text-text-inverse px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-all duration-150 ease-smooth nav-focus"
        >
          <Icon name="Home" size={20} strokeWidth={2} />
          <span>Go to AI Chat</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;