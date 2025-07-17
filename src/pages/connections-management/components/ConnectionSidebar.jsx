import React from 'react';
import Icon from 'components/AppIcon';

const ConnectionSidebar = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div className="w-64 bg-surface border-r border-border flex-shrink-0">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Categories
        </h2>
        <nav className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-150 ease-smooth nav-focus
                ${selectedCategory === category.id
                  ? 'bg-primary text-text-inverse shadow-active'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:shadow-hover'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon 
                  name={category.icon} 
                  size={18} 
                  strokeWidth={2}
                />
                <span className="font-medium">{category.name}</span>
              </div>
              <span className={`
                inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full
                ${selectedCategory === category.id
                  ? 'bg-white bg-opacity-20 text-text-inverse' :'bg-secondary-100 text-text-secondary'
                }
              `}>
                {category.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 border-t border-border">
        <h3 className="text-sm font-medium text-text-primary mb-3">
          Quick Stats
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Active</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-sm font-medium text-text-primary">4</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Errors</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-error rounded-full"></div>
              <span className="text-sm font-medium text-text-primary">1</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Warnings</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span className="text-sm font-medium text-text-primary">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 py-4 border-t border-border">
        <h3 className="text-sm font-medium text-text-primary mb-3">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-secondary">
                OpenAI API connected successfully
              </p>
              <p className="text-xs text-text-tertiary">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-error rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-secondary">
                AWS S3 authentication failed
              </p>
              <p className="text-xs text-text-tertiary">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-secondary">
                Redis memory usage high
              </p>
              <p className="text-xs text-text-tertiary">3 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionSidebar;