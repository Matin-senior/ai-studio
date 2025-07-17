import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from 'components/AppIcon';

// کامپوننت کوچک و زیبا برای اینپوت ساخت چت جدید
const NewChatInput = ({ onConfirm, onCancel, newChatInputRef, newChatTitle, setNewChatTitle }) => {
  const { t } = useTranslation();
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };
  return (
    <div className="w-full p-2.5 rounded-lg bg-surface border-2 border-primary flex items-center gap-1 mb-2 shadow-lg animate-fade-in-up overflow-x-hidden">
      <Icon name="PlusCircle" size={18} className="text-primary flex-shrink-0" />
      <input
        ref={newChatInputRef}
        value={newChatTitle}
        onChange={e => setNewChatTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-0 bg-transparent outline-none text-text-primary text-sm font-medium placeholder-text-tertiary border-none"
        placeholder={t('chatHistory.newChatPlaceholder')}
        autoFocus
      />
      <button onClick={onConfirm} className="flex-shrink-0 w-8 h-8 p-0 rounded-md text-accent hover:bg-accent/10 transition-colors flex items-center justify-center" aria-label={t('chatHistory.confirm')}>
        <Icon name="Check" size={16} />
      </button>
      <button onClick={onCancel} className="flex-shrink-0 w-8 h-8 p-0 rounded-md text-text-secondary hover:bg-black/10 transition-colors flex items-center justify-center" aria-label={t('chatHistory.cancel')}>
        <Icon name="X" size={16} />
      </button>
    </div>
  );
};

// ModalConfirm: دیالوگ تایید حذف بسیار زیبا
const ModalConfirm = ({ open, onClose, onConfirm, title, description }) => {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in-fast">
      <div className="bg-surface rounded-xl shadow-2xl border border-border p-6 w-full max-w-xs animate-fade-in-up relative">
        <div className="flex flex-col items-center text-center">
          <div className="bg-error/10 rounded-full p-3 mb-3">
            <Icon name="Trash2" size={32} className="text-error" />
          </div>
          <h2 className="text-lg font-bold text-error mb-2">{title}</h2>
          <p className="text-text-secondary text-sm mb-5">{description}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-surface border border-border text-text-secondary hover:bg-black/10 transition font-semibold"
            aria-label={t('chatHistory.cancel')}
          >
            {t('chatHistory.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-error text-white font-bold shadow-active hover:bg-error-dark transition"
            aria-label={t('chatHistory.delete')}
          >
            {t('chatHistory.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatHistory = ({
  chats,
  activeChat,
  onChatSelect,
  searchQuery,
  newChatInputVisible,
  newChatTitle,
  setNewChatTitle,
  newChatInputRef,
  onCreateChat,
  onCancelCreateChat,
  onDeleteChat,
  onRenameChat
}) => {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const renameInputRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    if (editingChatId) {
      renameInputRef.current?.focus();
    }
  }, [editingChatId]);

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleConfirmRename = () => {
    if (editingTitle.trim() && editingChatId) {
      onRenameChat(editingChatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirmRename();
    else if (e.key === 'Escape') {
      setEditingChatId(null);
      setEditingTitle('');
    }
  };
  
  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation();
    setPendingDeleteId(chatId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onDeleteChat(pendingDeleteId);
      setPendingDeleteId(null);
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
    setShowDeleteModal(false);
  };

  const filteredChats = useMemo(() => 
    chats.filter(chat => {
      const chatTitle = chat.title ? String(chat.title).toLowerCase() : '';
      const chatLastMessage = chat.lastMessage ? String(chat.lastMessage).toLowerCase() : '';
      const lowerCaseSearchQuery = searchQuery.toLowerCase();

      return (
        chatTitle.includes(lowerCaseSearchQuery) ||
        chatLastMessage.includes(lowerCaseSearchQuery)
      );
    }),
    [chats, searchQuery]
  );

  const { t } = useTranslation();

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hours < 1) return t('messageThread.time.justNow');
    if (hours < 24) return t('messageThread.time.hoursAgo', { count: hours });
    if (days < 7) return t('messageThread.time.daysAgo', { count: days });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Delete Confirmation Modal */}
      <ModalConfirm
        open={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Chat?"
        description="Are you sure you want to permanently delete this chat and all its messages? This action cannot be undone."
      />
      <div className="p-2 space-y-1">
        {/* New chat input component */}
        {newChatInputVisible && (
            <NewChatInput
                newChatInputRef={newChatInputRef}
                newChatTitle={newChatTitle}
                setNewChatTitle={setNewChatTitle}
                onConfirm={onCreateChat}
                onCancel={onCancelCreateChat}
            />
        )}
        
        {/* Chat list */}
        {filteredChats.map((chat) => (
          <div key={chat.id} className="relative group/item">
            <button
              onClick={() => onChatSelect(chat.id)}
              className={`w-full p-3 rounded-lg text-left transition-all duration-200 ease-smooth nav-focus overflow-hidden ${
                activeChat === chat.id
                  ? 'bg-primary text-text-inverse shadow-lg'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              {/* Edit mode */}
              {editingChatId === chat.id ? (
                <div className="animate-fade-in-fast">
                   <input
                     ref={renameInputRef}
                     value={editingTitle}
                     onChange={(e) => setEditingTitle(e.target.value)}
                     onKeyDown={handleRenameKeyDown}
                     onBlur={handleConfirmRename}
                     className="w-full bg-transparent outline-none text-text-inverse text-sm font-semibold border-b-2 border-text-inverse/50 pb-1 mb-2"
                     onClick={(e) => e.stopPropagation()}
                   />
                   <div className="flex justify-end gap-2 mt-2">
                      <button onClick={handleConfirmRename} className="text-xs font-semibold text-accent hover:underline">Save</button>
                      <button onClick={() => setEditingChatId(null)} className="text-xs text-text-inverse/70 hover:underline">Cancel</button>
                   </div>
                </div>
              ) : (
                // Normal display mode
                <>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold text-sm line-clamp-1 pr-4 ${ activeChat === chat.id ? 'text-white' : 'text-text-primary'}`}>
                      {String(chat.title)} 
                    </h3>
                    <span className={`text-xs flex-shrink-0 ml-2 font-medium ${ activeChat === chat.id ? 'text-white/70' : 'text-text-tertiary'}`}>
                      {formatTimestamp(chat.timestamp)}
                    </span>
                  </div>
                  <p className={`text-xs line-clamp-2 ${ activeChat === chat.id ? 'text-white/80' : 'text-text-secondary'}`}>
                    {String(chat.lastMessage)}
                  </p>
                </>
              )}
            </button>
            
            {/* Floating edit and delete buttons */}
            {editingChatId !== chat.id && (
              <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 opacity-0 pointer-events-none group-hover/item:opacity-100 group-hover/item:pointer-events-auto transition-all duration-150 ease-out transform translate-x-2 group-hover/item:translate-x-0">
                 <button onClick={(e) => handleStartRename(e, chat)} className={`p-1.5 rounded-md ${activeChat === chat.id ? 'hover:bg-white/20' : 'hover:bg-black/10'}`} tabIndex={-1}>
                   <Icon name="Edit3" size={14} className={activeChat === chat.id ? 'text-white/80' : 'text-text-secondary'} />
                 </button>
                 <button onClick={(e) => handleDeleteClick(e, chat.id)} className={`p-1.5 rounded-md ${activeChat === chat.id ? 'hover:bg-white/20' : 'hover:bg-black/10'}`} tabIndex={-1}>
                   <Icon name="Trash2" size={14} className={activeChat === chat.id ? 'text-white/80' : 'text-text-secondary'} />
                 </button>
              </div>
            )}
          </div>
        ))}
        
        {/* Empty state message */}
        {filteredChats.length === 0 && !newChatInputVisible && (
          <div className="text-center py-10 px-4">
            <Icon name="MessageSquareOff" size={32} className="text-text-tertiary mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-text-secondary text-sm font-medium">{t('chatHistory.empty')}</p>
            <p className="text-text-tertiary text-xs mt-1">{t('chatHistory.emptyHint')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;