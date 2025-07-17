// src/pages/ai-chat-interface/index.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from 'components/AppIcon';
import ChatHistory from './components/ChatHistory';
import MessageThread from './components/MessageThread';
import InputArea from './components/InputArea';
import CanvasPanel from './components/CanvasPanel';
import ModelSelector from './components/ModelSelector';

const AIChatInterface = () => {
  const { t } = useTranslation();
  const [selectedModel, setSelectedModel] = useState('ollama-llama3'); 
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(300);
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);
  const [newChatInputVisible, setNewChatInputVisible] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [code, setCode] = useState('');

  const messagesEndRef = useRef(null);
  const isResizing = useRef(null);
  const newChatInputRef = useRef(null);

  useEffect(() => {
    if (window.electronAPI?.chats?.getAll) {
      window.electronAPI.chats.getAll().then(data => {
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setChatHistory(sortedData);
        if (sortedData.length > 0) {
            setActiveChat(sortedData[0].id);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!activeChat) {
        setMessages([]);
        return;
    };
    if (window.electronAPI?.chats?.getMessages) {
      window.electronAPI.chats.getMessages(activeChat).then(data => setMessages(data));
    }
  }, [activeChat]);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const sendMessageToOllama = async (content, modelName) => {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          prompt: content,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending message to Ollama:', error);
      throw new Error(`Failed to get response from Ollama (${modelName}). Is Ollama server running?`);
    }
  };

  const handleSendMessage = async (content, attachments = [], codeSnippet = '') => {
    if (!activeChat && !selectedModel) { 
        console.warn("No active chat and no model selected. Message not sent.");
        return;
    }

    const tempUserMessage = { id: `temp-${Date.now()}`, type: 'user', content, timestamp: new Date().toISOString(), attachments, code: codeSnippet };
    setMessages(prev => [...prev, tempUserMessage]);
    setIsTyping(true);

    try {
      let assistantResponseContent = '';
      let currentChatId = activeChat;

      if (selectedModel.startsWith('ollama-')) {
        const ollamaModelName = selectedModel.replace('ollama-', '');
        assistantResponseContent = await sendMessageToOllama(content, ollamaModelName);
        
        if (!currentChatId && window.electronAPI?.chats?.create) {
            const newChatTitle = content.substring(0, 30) + (content.length > 30 ? '...' : ''); 
            const newChat = await window.electronAPI.chats.create({ title: newChatTitle });
            setChatHistory(prev => [newChat, ...prev]);
            setActiveChat(newChat.id);
            currentChatId = newChat.id;
        }

        if (window.electronAPI?.chats?.addMessage && currentChatId) {
            const res = await window.electronAPI.chats.addMessage({ 
                chatId: currentChatId, 
                content, 
                attachments, 
                code: codeSnippet,
                assistantResponseContent: assistantResponseContent,
                modelId: selectedModel // ✅ مدل انتخاب شده را نیز برای ذخیره سازی ارسال می کند
            });

            if (res.success) {
                setMessages(prev => [
                    ...prev.filter(m => m.id !== tempUserMessage.id),
                    res.userMessage, 
                    res.assistantResponse
                ]);
                const updatedHistory = chatHistory
                    .map(chat => 
                        chat.id === currentChatId 
                            ? { ...chat, lastMessage: content, timestamp: res.userMessage.timestamp, messageCount: chat.messageCount + 2 } 
                            : chat
                    )
                const finalHistory = !activeChat && currentChatId ? [chatHistory.find(c => c.id === currentChatId), ...updatedHistory.filter(c => c.id !== currentChatId)].filter(Boolean) : updatedHistory;
                setChatHistory(finalHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            } else {
                setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
                console.error("Failed to save message to Electron DB:", res.error);
            }
        } else if (!currentChatId) {
            setMessages(prev => [
                ...prev.filter(m => m.id !== tempUserMessage.id),
                { ...tempUserMessage, id: `user-${Date.now()}` },
                { id: `bot-${Date.now()}`, type: 'assistant', content: assistantResponseContent, timestamp: new Date().toISOString() }
            ]);
        }
      } else {
        if (window.electronAPI?.chats?.addMessage) {
          const res = await window.electronAPI.chats.addMessage({ 
              chatId: activeChat, 
              content, 
              attachments, 
              code: codeSnippet,
              modelId: selectedModel // ✅ مدل انتخابی را به Electron ارسال می کند
          });
          if (res.success) {
            setMessages(prev => [
                ...prev.filter(m => m.id !== tempUserMessage.id),
                res.userMessage, 
                res.assistantResponse
            ]);
            const updatedHistory = chatHistory
              .map(chat => 
                chat.id === activeChat 
                  ? { ...chat, lastMessage: content, timestamp: res.userMessage.timestamp, messageCount: chat.messageCount + 2 } 
                  : chat
              )
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setChatHistory(updatedHistory);
          } else {
              setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
              console.error("Failed to send message via Electron:", res.error);
          }
        } else {
            console.error("Electron API not available or no specific model selected.");
            setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
        }
      }
    } catch (e) {
      console.error("Error in handleSendMessage:", e);
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      setMessages(prev => [
        ...prev,
        { id: `error-${Date.now()}`, type: 'error', content: `Failed to send message or get response: ${e.message}`, timestamp: new Date().toISOString() }
      ]);
    }
    setIsTyping(false);
  };

  const handleCreateChat = async () => {
    if (!newChatTitle.trim()) {
        setNewChatInputVisible(false);
        setNewChatTitle('');
        return;
    }
    try {
      if (window.electronAPI?.chats?.create) {
        const newChat = await window.electronAPI.chats.create({ title: newChatTitle.trim() });
        setChatHistory(prev => [newChat, ...prev]);
        setActiveChat(newChat.id);
        setMessages([]);
        setNewChatTitle('');
        setNewChatInputVisible(false);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };
  
  const handleDeleteChat = async (chatIdToDelete) => {
    if (window.electronAPI?.chats?.delete) {
        const result = await window.electronAPI.chats.delete(chatIdToDelete);
        if (result.success) {
          const newHistory = chatHistory.filter(chat => chat.id !== chatIdToDelete);
          setChatHistory(newHistory);
          if (activeChat === chatIdToDelete) {
            setActiveChat(newHistory.length > 0 ? newHistory[0].id : null);
          }
        } else {
          console.error("Failed to delete chat:", result.error);
        }
    }
  };

  const handleRenameChat = async (chatIdToRename, newTitle) => {
    if (window.electronAPI?.chats?.rename) {
        const result = await window.electronAPI.chats.rename({ chatId: chatIdToRename, newTitle });
        if (result.success) {
          const newHistory = chatHistory.map(chat => 
            chat.id === chatIdToRename ? { ...chat, ...result.updatedChat } : chat
          );
          setChatHistory(newHistory);
        } else {
          console.error("Failed to rename chat:", result.error);
        }
    }
  };

  const handleNewChat = () => {
    if (newChatInputVisible) return;
    setNewChatTitle('');
    setNewChatInputVisible(true);
    setTimeout(() => {
      newChatInputRef.current?.focus();
    }, 50);
  };

  const handleNewChatInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateChat();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setNewChatInputVisible(false);
      setNewChatTitle('');
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isResizing.current === 'left') {
      const newWidth = e.clientX;
      if (newWidth > 180 && newWidth < 1050) setLeftWidth(newWidth);
    } else if (isResizing.current === 'right') {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < 1050) setRightWidth(newWidth);
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [handleMouseMove, stopResizing]);

  return (
    <div className="flex h-screen w-full bg-background pt-12 select-none font-[Estedad,IRANSans,Arial,sans-serif]">
      {/* Left Toggle Button */}
      {!leftVisible && (
        <button
          className="absolute left-2 top-16 z-50 p-1 bg-background border rounded"
          onClick={() => setLeftVisible(true)}
        >
          <Icon name="PanelLeft" size={16} />
        </button>
      )}
      {/* Left Panel */}
      {leftVisible && (
        <>
          <div style={{ width: leftWidth }} className="flex flex-col flex-shrink-0 h-full overflow-hidden border-r border-border bg-surface transition-all duration-150 ease-out ">
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-text-primary">{t('chat.history.title')}</h2>
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1 px-2 py-1 bg-primary text-text-inverse rounded-md shadow-active hover:bg-primary-700 transition-all duration-150 ease-smooth nav-focus text-xs font-medium"
                    onClick={handleNewChat}
                    aria-label={t('chat.history.newChat')}
                    disabled={newChatInputVisible}
                  >
                    <Icon name="Plus" size={14} className="mr-1" />
                    {t('chat.history.newChat')}
                  </button>
                  <button onClick={() => setLeftVisible(false)}><Icon name="PanelLeftClose" size={16} /></button>
                </div>
              </div>
              <div className="relative">
                <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder={t('chat.history.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-md text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <ChatHistory
              chats={chatHistory}
              activeChat={activeChat}
              onChatSelect={setActiveChat}
              searchQuery={searchQuery}
              newChatInputVisible={newChatInputVisible}
              newChatTitle={newChatTitle}
              setNewChatTitle={setNewChatTitle}
              newChatInputRef={newChatInputRef}
              onCreateChat={handleCreateChat}
              onCancelCreateChat={() => { setNewChatInputVisible(false); setNewChatTitle(''); }}
              onDeleteChat={handleDeleteChat}
              onRenameChat={handleRenameChat}
            />
          </div>
          <div
            className="w-1 cursor-col-resize bg-border hover:bg-primary transition-all"
            onMouseDown={() => isResizing.current = 'left'}
          ></div>
        </>
      )}
      {/* Main & Right Panels */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
          <div className="flex items-center space-x-3">
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
            <span className="text-sm text-text-secondary">{t('chat.messages.count', { count: messages.length })}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MessageThread messages={messages} isTyping={isTyping} />
          <div ref={messagesEndRef} />
        </div>
        <InputArea
          onSendMessage={handleSendMessage}
          onFileUpload={(files) => {
            const newFiles = Array.from(files);
            setUploadedFiles(prev => [...prev, ...newFiles]);
          }}
          uploadedFiles={uploadedFiles}
          onRemoveFile={(id) => setUploadedFiles(prev => prev.filter(f => f.id !== id))}
          codeSnippet={code}
        />
      </div>

      {/* Right Divider */}
      {rightVisible && (
        <div
          className="w-1 cursor-col-resize bg-border hover:bg-primary transition-all"
          onMouseDown={() => isResizing.current = 'right'}
        ></div>
      )}

      {/* Right Toggle Button */}
      {!rightVisible && (
        <button
          className="absolute right-2 top-16 z-50 p-1 bg-background border rounded"
          onClick={() => setRightVisible(true)}
        >
          <Icon name="PanelRight" size={16} />
        </button>
      )}
      {/* Right Panel */}
      {rightVisible && (
        <div style={{ width: rightWidth , transitionProperty: 'width, transform, opacity' }} className="flex-shrink-0 h-full overflow-hidden border-l border-border bg-surface transition-all duration-150 ease-out">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">{t('chat.rightPanel.title')}</h2>
            <button onClick={() => setRightVisible(false)}><Icon name="PanelRightClose" size={16} /></button>
          </div>
          <CanvasPanel uploadedFiles={uploadedFiles} code={code} setCode={setCode} />
        </div>
      )}
    </div>
  );
};

export default AIChatInterface;