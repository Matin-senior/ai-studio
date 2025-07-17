// src/components/ui/Header.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import useTheme from '../../hooks/useTheme';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navigationItems = [
    { 
      label: 'Chat', 
      path: '/ai-chat-interface', 
      icon: 'MessageSquare', 
      description: 'AI interaction workspace' 
    },
    { 
      label: 'Models', 
      path: '/model-management-dashboard', 
      icon: 'Brain', 
      description: 'AI model and extension management' 
    },
    { 
      label: 'Files', 
      path: '/file-management-workspace', 
      icon: 'FolderOpen', 
      description: 'File organization and analysis workspace' 
    },
    { 
      label: 'Connections', 
      path: '/connections-management', 
      icon: 'Link', 
      description: 'External integration and API management' 
    },
    { 
      label: 'Settings', 
      path: '/settings-configuration', 
      icon: 'Settings', 
      description: 'Application configuration and preferences' 
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <header className="navbar-draggable fixed top-0 left-0 right-0 z-100 bg-background border-b border-border select-none">
        <div className="flex items-center justify-between h-12 px-4" >
          {/* Logo - Reduced size */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-md">
              <Icon 
                name="Zap" 
                size={14} 
                color="white" 
                strokeWidth={2.5}
              />
            </div>
            <span className="text-base font-semibold text-text-primary tracking-tight">
              AI Studio
            </span>
          </div>

          {/* Desktop Navigation - More compact */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`navbar-button
                  flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                  transition-all duration-150 ease-smooth nav-focus
                  ${isActivePath(item.path)
                    ? 'bg-primary text-text-inverse shadow-active'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:shadow-hover'
                  }
                `}
                aria-label={item.description}
                title={item.description}
              >
                <Icon 
                  name={item.icon} 
                  size={16} 
                  strokeWidth={2}
                />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Theme Toggle and Mobile Menu */}
          <div className="flex items-center space-x-2" style={{ WebkitAppRegion: 'no-drag' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="navbar-button p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <Icon 
                name={theme === 'light' ? 'Moon' : 'Sun'} 
                size={16} 
                strokeWidth={2}
              />
            </button>
            <button
              onClick={() => window.electronAPI.send('minimize-app')}
              className="navbar-button p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
              aria-label="Minimize"
              title="Minimize"
            >
              <Icon name="Minus" size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => window.electronAPI.send('maximize-app')}
              className="navbar-button p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
              aria-label="Maximize"
              title="Maximize"
            >
              <Icon name="Square" size={16} strokeWidth={2} />
            </button>
            <button
              onClick={() => window.electronAPI.send('close-app')}
              className="navbar-button p-2 rounded-md text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all duration-150 ease-smooth nav-focus"
              aria-label="Close"
              title="Close"
            >
              <Icon name="X" size={16} strokeWidth={2.5} />
            </button>
                      
                      

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="navbar-button md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Icon 
                name={isMobileMenuOpen ? "X" : "Menu"} 
                size={18} 
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-150 bg-black bg-opacity-50 md:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <div className="fixed top-0 left-0 z-200 w-72 h-full bg-background shadow-lg md:hidden animate-slide-in">
            <div className="flex items-center justify-between h-12 px-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-md">
                  <Icon 
                    name="Zap" 
                    size={14} 
                    color="white" 
                    strokeWidth={2.5}
                  />
                </div>
                <span className="text-base font-semibold text-text-primary tracking-tight">
                  AI Studio
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
                aria-label="Close navigation menu"
              >
                <Icon name="X" size={16} strokeWidth={2} />
              </button>
            </div>
            
            <nav className="p-3 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-left
                    transition-all duration-150 ease-smooth nav-focus
                    ${isActivePath(item.path)
                      ? 'bg-primary text-text-inverse shadow-active'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:shadow-hover'
                    }
                  `}
                  aria-label={item.description}
                >
                  <Icon 
                    name={item.icon} 
                    size={18} 
                    strokeWidth={2}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75 mt-0.5">{item.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default Header;