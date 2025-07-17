import React, { useEffect, useState } from 'react';

// فرض می‌شود کامپوننت Icon به درستی در پروژه شما وجود دارد
// import Icon from 'components/AppIcon'; 

// کامپوننت موقت برای آیکون جهت اجرای مستقل کد
const Icon = ({ name, size = 16, className = '', color = 'currentColor', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        {name === 'Monitor' && <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>}
        {/* ✅ FIX: Corrected the comparison from a Regex literal to a string */}
        {name === 'Zap' && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>}
        {name === 'Star' && <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>}
        {name === 'Trash2' && <polyline points="3 6 5 6 21 6"></polyline>}
        {name === 'RefreshCw' && <><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></>}
        {name === 'Settings' && <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></>}
    </svg>
);


const SystemInfo = () => {
    const [systemInfo, setSystemInfo] = useState({
        storage: { total: '---', used: '---', available: '---', usedPercentage: 0 },
        gpu: { name: '---', memory: '---', compatibility: '---', status: '---' },
        ram: { total: '---', used: '---', available: '---', usedPercentage: 0 },
        recommendedModels: []
    });

    useEffect(() => {
        const fetchSystemData = async () => {
            try {
                // ✅✅✅  نحوه فراخوانی صحیح توابع  ✅✅✅
                const ram = await window.electronAPI.systemInfo.getRAMInfo();
                const storage = await window.electronAPI.systemInfo.getStorageInfo();
                const gpu = await window.electronAPI.systemInfo.getGPUInfo();

                setSystemInfo({
                    storage,
                    ram,
                    gpu,
                    recommendedModels: [
                        // این بخش می‌تواند بر اساس اطلاعات واقعی سیستم دینامیک شود
                        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', reason: 'Optimal for your hardware configuration' },
                        { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', reason: 'Great GPU acceleration support' },
                        { id: 'whisper-large-v3', name: 'Whisper Large v3', reason: 'Efficient CPU/GPU hybrid processing' }
                    ]
                });
            } catch (error) {
                console.error("Failed to fetch system data:", error);
                // می‌توانید در اینجا یک حالت خطا برای UI تنظیم کنید
            }
        };

        // اطمینان از وجود electronAPI قبل از فراخوانی
        if (window.electronAPI) {
            fetchSystemData();
        } else {
            console.error("electronAPI is not available. Check your preload script.");
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const ram = await window.electronAPI.systemInfo.getRAMInfo();
                setSystemInfo(prev => ({
                    ...prev,
                    ram
                }));
            } catch (error) {
                console.error("Failed to update RAM info:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'compatible': return 'text-accent';
            case 'warning': return 'text-warning';
            case 'error': return 'text-error';
            default: return 'text-text-secondary';
        }
    };

    const getUsageColor = (percentage) => {
        if (percentage >= 90) return 'bg-error';
        if (percentage >= 70) return 'bg-warning';
        return 'bg-primary';
    };

    return (
        <div className="space-y-6">
            {/* System Status */}
            <div className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <Icon name="Monitor" size={20} color="var(--color-primary)" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary">System Status</h3>
                </div>

                <div className="space-y-6">
                    {/* Storage */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-text-primary">Storage</span>
                            <span className="text-sm text-text-secondary">{systemInfo.storage.used} / {systemInfo.storage.total}</span>
                        </div>
                        <div className="w-full bg-surface-hover rounded-full h-2 mb-2">
                            <div className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(systemInfo.storage.usedPercentage)}`} style={{ width: `${systemInfo.storage.usedPercentage}%` }}/>
                        </div>
                        <div className="text-xs text-text-tertiary">{systemInfo.storage.available} available</div>
                    </div>

                    {/* RAM */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-text-primary">RAM</span>
                            <span className="text-sm text-text-secondary">{systemInfo.ram.used} / {systemInfo.ram.total}</span>
                        </div>
                        <div className="w-full bg-surface-hover rounded-full h-2 mb-2">
                            <div className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(systemInfo.ram.usedPercentage)}`} style={{ width: `${systemInfo.ram.usedPercentage}%` }}/>
                        </div>
                        <div className="text-xs text-text-tertiary">{systemInfo.ram.available} available</div>
                    </div>

                    {/* GPU Info */}
                    <div className="pt-4 border-t border-border">
                        <div className="flex items-center space-x-2 mb-3">
                            <Icon name="Zap" size={16} color="var(--color-primary)" strokeWidth={2} />
                            <span className="text-sm font-medium text-text-primary">GPU</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-text-secondary">Model:</span><span className="text-text-primary">{systemInfo.gpu.name}</span></div>
                            <div className="flex justify-between"><span className="text-text-secondary">Memory:</span><span className="text-text-primary">{systemInfo.gpu.memory}</span></div>
                            <div className="flex justify-between"><span className="text-text-secondary">CUDA:</span><span className="text-text-primary">{systemInfo.gpu.compatibility}</span></div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Status:</span>
                                <span className={`font-medium ${getStatusColor(systemInfo.gpu.status)}`}>{systemInfo.gpu.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Models */}
            <div className="bg-surface border border-border rounded-xl p-6">
                 <div className="flex items-center space-x-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
                        <Icon name="Star" size={20} color="var(--color-accent)" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary">Recommended</h3>
                </div>
                <div className="space-y-4">
                    {systemInfo.recommendedModels.map(model => (
                        <div key={model.id} className="p-4 bg-background rounded-lg border border-border">
                            <h4 className="font-medium text-text-primary mb-1">{model.name}</h4>
                            <p className="text-sm text-text-secondary mb-3">{model.reason}</p>
                            <button className="text-sm text-primary hover:text-primary-700 font-medium transition-colors duration-150">View Details →</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
             <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button className="w-full flex items-center space-x-3 p-3 text-left bg-background hover:bg-surface-hover rounded-lg border border-border transition-all duration-150"><Icon name="Trash2" size={18} color="var(--color-text-secondary)" strokeWidth={2} /><span className="text-sm text-text-primary">Clean Cache</span></button>
                    <button className="w-full flex items-center space-x-3 p-3 text-left bg-background hover:bg-surface-hover rounded-lg border border-border transition-all duration-150"><Icon name="RefreshCw" size={18} color="var(--color-text-secondary)" strokeWidth={2} /><span className="text-sm text-text-primary">Check Updates</span></button>
                    <button className="w-full flex items-center space-x-3 p-3 text-left bg-background hover:bg-surface-hover rounded-lg border border-border transition-all duration-150"><Icon name="Settings" size={18} color="var(--color-text-secondary)" strokeWidth={2} /><span className="text-sm text-text-primary">System Settings</span></button>
                </div>
            </div>
        </div>
    );
};

export default SystemInfo;
