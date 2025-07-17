// src/components/StatsPanel.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from './AppIcon';

const StatsPanel = ({ className = '' }) => {
  // Mock data for demonstration
  const healthData = {
    accuracy: 92,
    responseTime: 1.2,
    errorRate: 3.5,
    totalQueries: 1247
  };

  const errorData = [
    { type: 'Syntax Error', count: 12 },
    { type: 'Runtime Error', count: 8 },
    { type: 'Logic Error', count: 5 },
    { type: 'Network Error', count: 3 }
  ];

  const performanceData = [
    { time: '00:00', responses: 45 },
    { time: '04:00', responses: 32 },
    { time: '08:00', responses: 78 },
    { time: '12:00', responses: 95 },
    { time: '16:00', responses: 112 },
    { time: '20:00', responses: 89 }
  ];

  const pieData = [
    { name: 'Successful', value: 85, color: '#10B981' },
    { name: 'Warning', value: 12, color: '#F59E0B' },
    { name: 'Error', value: 3, color: '#EF4444' }
  ];

  const getHealthColor = (percentage) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 70) return 'text-warning';
    return 'text-error';
  };

  const getHealthBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-success/10';
    if (percentage >= 70) return 'bg-warning/10';
    return 'bg-error/10';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Health Overview */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Activity" size={18} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="font-medium text-text-primary">Answer Health</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${getHealthBgColor(healthData.accuracy)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Accuracy</span>
              <Icon name="CheckCircle" size={16} className={getHealthColor(healthData.accuracy)} strokeWidth={2} />
            </div>
            <div className={`text-2xl font-bold ${getHealthColor(healthData.accuracy)}`}>
              {healthData.accuracy}%
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-primary/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Response Time</span>
              <Icon name="Clock" size={16} className="text-primary" strokeWidth={2} />
            </div>
            <div className="text-2xl font-bold text-primary">
              {healthData.responseTime}s
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${getHealthBgColor(100 - healthData.errorRate)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Error Rate</span>
              <Icon name="AlertCircle" size={16} className="text-error" strokeWidth={2} />
            </div>
            <div className="text-2xl font-bold text-error">
              {healthData.errorRate}%
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-secondary/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Total Queries</span>
              <Icon name="BarChart3" size={16} className="text-secondary" strokeWidth={2} />
            </div>
            <div className="text-2xl font-bold text-secondary">
              {healthData.totalQueries.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Error Breakdown */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="AlertTriangle" size={18} color="var(--color-error)" strokeWidth={2} />
          <h3 className="font-medium text-text-primary">Error Breakdown</h3>
        </div>
        
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="type" 
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text-primary)'
                }}
              />
              <Bar dataKey="count" fill="var(--color-error)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="TrendingUp" size={18} color="var(--color-success)" strokeWidth={2} />
          <h3 className="font-medium text-text-primary">Performance Trend</h3>
        </div>
        
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text-primary)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="responses" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="PieChart" size={18} color="var(--color-primary)" strokeWidth={2} />
          <h3 className="font-medium text-text-primary">Status Distribution</h3>
        </div>
        
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text-primary)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center space-x-4 mt-2">
          {pieData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-text-secondary">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;