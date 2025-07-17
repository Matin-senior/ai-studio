// preload.js
console.log('✅ [Preload] Script has started.');
const { contextBridge, ipcRenderer } = require('electron');

/**
 * @description
 * این اسکریپت به عنوان یک پل امن بین فرآیند اصلی الکترون (Main Process) و فرآیند رندر (Renderer Process) عمل می‌کند.
 * برای افزایش امنیت، ما فقط توابع و کانال‌های مشخصی را در اختیار کد فرانت‌اند (مثلاً React) قرار می‌دهیم.
 * این کار از طریق `contextBridge` انجام می‌شود که روشی امن و استاندارد است.
 */

// ------------------- لیست سفید کانال‌های ارتباطی (برای امنیت) -------------------

// کانال‌هایی که از رندر به مین فقط "ارسال" می‌کنند (بدون انتظار پاسخ)
const validSendChannels = [
    'minimize-app', 
    'maximize-app', 
    'close-app'
];

// کانال‌هایی که از رندر به مین "فراخوانی" می‌شوند و منتظر پاسخ می‌مانند (invoke/handle)
const validInvokeChannels = [
    // کانال‌های اطلاعات سیستم
    'get-gpu-info', 
    'get-ram-info', 
    'get-storage-info',
    // کانال‌های مربوط به اطلاعات برنامه
    'app:get-user-files-path',
    // کانال‌های مربوط به ماژول path
    'path:dirname',
    'path:basename',
    // کانال‌های مدیریت فایل‌ها
    'files:get-all',
    'files:read-as-base64',
    'files:upload',
    'files:create-folder',
    'files:move',
    // کانال‌های جدید برای مدیریت چت
    'chats:get-all',
    'messages:get-by-chat-id',
    'chats:create',
    'messages:add', 
    'chats:delete',
    'chats:rename',
    // کانال‌های جدید برای مدیریت تنظیمات
    'settings:get',
    'settings:set',
    // ✅ کانال جدید برای دریافت مدل‌های آنلاین Ollama - مطمئن شوید که اینجا وجود دارد
    'models:fetch-online-ollama' 
];

// کانال‌هایی که از مین به رندر اطلاعات ارسال می‌کنند و رندر به آنها گوش می‌دهد
const validReceiveChannels = [
    'from-main-test', 
    'update-available', 
    'download-progress'
];


// ------------------- تعریف API برای سمت رندر (exposeInMainWorld) -------------------

contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * @description توابع مربوط به کنترل پنجره برنامه
     */
    window: {
        minimize: () => ipcRenderer.send('minimize-app'),
        maximize: () => ipcRenderer.send('maximize-app'),
        close: () => ipcRenderer.send('close-app'),
    },

    /**
     * @description توابع مربوط به دریافت اطلاعات سخت‌افزری سیستم
     */
    systemInfo: {
        getGPUInfo: () => ipcRenderer.invoke('get-gpu-info'),
        getRAMInfo: () => ipcRenderer.invoke('get-ram-info'),
        getStorageInfo: () => ipcRenderer.invoke('get-storage-info'),
    },

    /**
     * @description توابع مربوط به اطلاعات کلی برنامه و مسیرها
     */
    app: {
        getUserFilesPath: () => ipcRenderer.invoke('app:get-user-files-path'),
    },
    
    /**
     * @description توابعی برای کار با مسیرها (مشابه ماژول path در Node.js)
     */
    path: {
        dirname: (aPath) => ipcRenderer.invoke('path:dirname', aPath),
        basename: (aPath) => ipcRenderer.invoke('path:basename', aPath),
    },
    
    /**
     * @description API کامل برای مدیریت فایل‌ها و پوشه‌ها
     */
    files: {
        getAll: (directoryPath) => ipcRenderer.invoke('files:get-all', directoryPath),
        readAsBase64: (filePath) => ipcRenderer.invoke('files:read-as-base64', filePath),
        upload: ({ parentPath, name, data }) => ipcRenderer.invoke('files:upload', { parentPath, name, data }),
        createFolder: ({ parentPath, folderName }) => ipcRenderer.invoke('files:create-folder', { parentPath, folderName }),
        move: (sourcePath, targetFolderPath) => ipcRenderer.invoke('files:move', sourcePath, targetFolderPath),
    },

    /**
     * @description بخش جدید: API کامل برای مدیریت چت‌ها
     */
    chats: {
        getAll: () => ipcRenderer.invoke('chats:get-all'),
        getMessages: (chatId) => ipcRenderer.invoke('messages:get-by-chat-id', chatId),
        create: (title) => ipcRenderer.invoke('chats:create', { title }),
        addMessage: ({ chatId, content, attachments, code, assistantResponseContent, modelId }) => ipcRenderer.invoke('messages:add', { chatId, content, attachments, code, assistantResponseContent, modelId }),
        delete: (chatId) => ipcRenderer.invoke('chats:delete', chatId),
        rename: ({ chatId, newTitle }) => ipcRenderer.invoke('chats:rename', { chatId, newTitle }),
    },

    /**
     * @description بخش جدید: API کامل برای مدیریت تنظیمات
     */
    settings: {
        get: () => ipcRenderer.invoke('settings:get'),
        set: (newSettings) => ipcRenderer.invoke('settings:set', newSettings),
    },
    
    // ✅ API جدید برای مدل‌ها - مطمئن شوید که این بلاک وجود دارد و صحیح است
    models: {
        fetchOnlineOllama: () => ipcRenderer.invoke('models:fetch-online-ollama'),
    },

    /**
     * @description توابع عمومی برای ارتباط (در صورت نیاز) با بررسی امنیتی کانال
     */
    send: (channel, data) => {
        if (validSendChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        } else {
            console.warn(`Attempted to send on invalid channel: ${channel}`);
        }
    },
    receive: (channel, func) => {
        if (validReceiveChannels.includes(channel)) {
            const subscription = (event, ...args) => func(...args);
            ipcRenderer.on(channel, subscription);
            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        } else {
            console.warn(`Attempted to receive on invalid channel: ${channel}`);
        }
    },
    removeAllListeners: (channel) => {
        if (validReceiveChannels.includes(channel)) {
            ipcRenderer.removeAllListeners(channel);
        }
    }
});
console.log('✅ [Preload] Script has finished successfully.');