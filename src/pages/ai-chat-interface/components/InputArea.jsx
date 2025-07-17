// src/pages/ai-chat-interface/components/InputArea.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from 'components/AppIcon';

const InputArea = ({ onSendMessage, onFileUpload, uploadedFiles, onRemoveFile, codeSnippet }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || uploadedFiles.length > 0) {
      onSendMessage(message.trim(), uploadedFiles, codeSnippet);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
    e.target.value = '';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      setIsDragOver(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    dragCounter.current = 0;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return t('canvas.fileSize.bytes', { count: 0 });
    const k = 1024;
    const sizes = [
      t('canvas.fileSize.bytes', { count: 0 }),
      t('canvas.fileSize.kb'),
      t('canvas.fileSize.mb'),
      t('canvas.fileSize.gb')
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
    }
  };

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="border-t border-border bg-background">
      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-2 bg-surface border border-border rounded-md px-2 py-1"
              >
                <Icon 
                  name={file.type.startsWith('image/') ? 'Image' : 'File'} 
                  size={14} 
                  strokeWidth={2} 
                  className="text-text-secondary" 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{file.name}</p>
                  <p className="text-xs text-text-tertiary">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="p-0.5 rounded text-text-secondary hover:text-error hover:bg-error-light transition-all duration-150 ease-smooth"
                  aria-label="Remove file"
                >
                  <Icon name="X" size={12} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3">
        <div
          className={`relative border rounded-lg transition-all duration-150 ease-smooth ${
            isDragOver
              ? 'border-primary bg-primary/5' :'border-border hover:border-border-focus focus-within:border-primary'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <Icon name="Upload" size={24} className="text-primary mx-auto mb-1" strokeWidth={1.5} />
                <p className="text-primary font-medium text-sm">{t('inputArea.dropFiles')}</p>
              </div>
            </div>
          )}

          <div className="flex items-end space-x-2 p-2">
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth nav-focus"
              aria-label={t('inputArea.attachFile')}
            >
              <Icon name="Paperclip" size={16} strokeWidth={2} />
            </button>

            {/* Text Input */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('inputArea.placeholder')}
                className="w-full resize-none bg-transparent text-text-primary placeholder-text-tertiary focus:outline-none text-sm font-sans"                
                rows={1}
                style={{ minHeight: '20px', maxHeight: '80px' }}
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() && uploadedFiles.length === 0}
              className={`flex-shrink-0 p-1.5 rounded-md transition-all duration-150 ease-smooth nav-focus ${
                message.trim() || uploadedFiles.length > 0
                  ? 'bg-primary text-text-inverse hover:bg-primary-700 shadow-active'
                  : 'bg-surface text-text-tertiary cursor-not-allowed'
              }`}
              aria-label={t('inputArea.send')}
            >
              <Icon name="Send" size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />

        {/* Input Hints */}
        <div className="flex items-center justify-between mt-1.5 text-xs text-text-tertiary">
          <div className="flex items-center space-x-3">
            <span>{t('inputArea.hint.newLine')}</span>
            <span>•</span>
            <span>{t('inputArea.hint.dragDrop')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Zap" size={10} strokeWidth={2} />
            <span>{t('inputArea.brand')}</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InputArea;