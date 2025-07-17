// src/pages/ai-chat-interface/components/MessageThread.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from 'components/AppIcon';

// ✅ اضافه کردن import های جدید برای Markdown و Syntax Highlighting
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// تم‌های مختلف
import { dracula, solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';


// یک کامپوننت کوچک و زیبا برای هر پیام

const MessageBubble = ({ message, onCopyMessage, onRegenerateMessage }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(message.content));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const isUser = message.type === 'user';

  return (
    <div className={`relative flex ${isUser ? 'justify-end' : 'justify-start'} w-full animate-fade-in-up transition-all duration-300 group/message`}> 
      <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} w-full`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-md transition-all duration-300 ${isUser ? 'bg-primary' : 'bg-accent'} ${isUser ? 'ring-2 ring-primary-700' : 'ring-2 ring-accent-600'}`}>
          <Icon name={isUser ? "User" : "Bot"} size={18} color="white" strokeWidth={2.5} />
        </div>
        {/* Message Bubble & Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
          <div className={`relative px-4 py-3 rounded-2xl max-w-[90vw] md:max-w-xl xl:max-w-2xl shadow-md transition-all duration-300 ${
            isUser 
              ? 'bg-primary text-text-inverse rounded-br-none dark:bg-primary-500' 
              : 'bg-white/20 dark:bg-[#232946]/60 border border-white/30 dark:border-[#232946]/40 text-text-primary rounded-bl-none backdrop-blur-md'
          } hover:scale-[1.025] hover:shadow-2xl`} style={{backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)'}}>
            
            {/* ✅ تغییر اصلی: استفاده از ReactMarkdown برای رندر محتوا */}
            <div className="prose prose-sm max-w-none dark:prose-invert transition-colors duration-300">
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} // برای پشتیبانی از جداول، چک‌باکس‌ها و ...
                    components={{
                        // کامپوننت سفارشی برای رندر کردن بلاک‌های کد
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeContent = Array.isArray(children) ? children[0] : children; // ✅ اطمینان از اینکه children یک string باشد

                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={window.matchMedia('(prefers-color-scheme: dark)').matches ? dracula : solarizedlight}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                    className="rounded-md overflow-x-auto my-2"
                                >
                                    {String(codeContent).replace(/\n$/, '')} {/* ✅ اطمینان از اینکه String است و newline اضافی حذف شود */}
                                </SyntaxHighlighter>
                            ) : (
                                // برای کدهای inline (کد در وسط متن)
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        },
                        // می‌توانید کامپوننت‌های دیگر Markdown مثل `a` برای لینک‌ها یا `table` برای جداول را نیز سفارشی کنید.
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />,
                        table: ({node, ...props}) => <table className="w-full text-left border-collapse" {...props} />,
                        th: ({node, ...props}) => <th className="p-2 border border-border-300 bg-gray-100 dark:bg-gray-700 font-semibold" {...props} />,
                        td: ({node, ...props}) => <td className="p-2 border border-border-300" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    }}
                >
                    {String(message.content)}
                </ReactMarkdown>
            </div>
            {/* Glassmorphism Glow */}
            <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-500 ${isUser ? 'shadow-[0_0_32px_0_rgba(127,90,240,0.18)]' : 'shadow-[0_0_32px_0_rgba(255,255,255,0.10)]'}`}></div>
          </div>
          {/* Timestamp */}
          <div className="mt-1.5 text-xs text-text-tertiary dark:text-text-tertiary/80 transition-colors duration-300">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
        {/* دکمه‌های کناری فقط روی هاور و دسکتاپ */}
        <div className={`hidden md:flex flex-col gap-2 ml-1 ${isUser ? 'order-2' : 'order-1'} opacity-0 group-hover/message:opacity-100 transition-all duration-200`}> 
          <button onClick={handleCopy} className="backdrop-blur-md bg-white/40 dark:bg-[#232946]/60 border border-white/20 dark:border-[#232946]/30 shadow p-2 rounded-full hover:bg-accent/30 transition-all duration-200" aria-label={copied ? t('messageThread.copied') : t('messageThread.copy')}>
            <Icon name={copied ? 'Check' : 'Copy'} size={14} className={copied ? 'text-accent' : 'text-text-secondary dark:text-text-tertiary'} />
          </button>
          {!isUser && (
            <>
              <button onClick={() => onRegenerateMessage(message.id)} className="backdrop-blur-md bg-white/40 dark:bg-[#232946]/60 border border-white/20 dark:border-[#232946]/30 shadow p-2 rounded-full hover:bg-accent/30 transition-all duration-200" aria-label={t('messageThread.regenerate')}>
                <Icon name="RotateCcw" size={14} className="text-text-secondary dark:text-text-tertiary" />
              </button>
              <button className="backdrop-blur-md bg-white/40 dark:bg-[#232946]/60 border border-white/20 dark:border-[#232946]/30 shadow p-2 rounded-full hover:bg-accent/30 transition-all duration-200" aria-label={t('messageThread.like')}>
                <Icon name="ThumbsUp" size={14} className="text-text-secondary dark:text-text-tertiary" />
              </button>
            </>
          )}
        </div>
      </div>
      {/* دکمه‌های کناری همیشه زیر پیام روی موبایل */}
      <div className="flex md:hidden justify-end gap-2 mt-1 px-10">
        <button onClick={handleCopy} className="backdrop-blur-md bg-white/40 dark:bg-[#232946]/60 border border-white/20 dark:border-[#232946]/30 shadow p-2 rounded-full hover:bg-accent/30 transition-all duration-200" aria-label={copied ? t('messageThread.copied') : t('messageThread.copy')}>
          <Icon name={copied ? 'Check' : 'Copy'} size={14} className={copied ? 'text-accent' : 'text-text-secondary dark:text-text-tertiary'} />
        </button>
        {!isUser && (
          <>
            <button onClick={() => onRegenerateMessage(message.id)} className="backdrop-blur-md bg-white/40 dark:bg-[#232946]/60 border border-white/20 dark:border-[#232946]/30 shadow p-2 rounded-full hover:bg-accent/30 transition-all duration-200" aria-label={t('messageThread.regenerate')}>
              <Icon name="RotateCcw" size={14} className="text-text-secondary dark:text-text-tertiary" />
            </button>
            <button className="backdrop-blur-md bg-white/40 dark:bg-[#232946]/60 border border-white/20 dark:border-[#232946]/30 shadow p-2 rounded-full hover:bg-accent/30 transition-all duration-200" aria-label={t('messageThread.like')}>
              <Icon name="ThumbsUp" size={14} className="text-text-secondary dark:text-text-tertiary" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};


const MessageThread = ({ messages, isTyping, onRegenerateMessage, onCopyMessage }) => {
  return (
    <div className="p-2 md:p-6 space-y-8 transition-colors duration-300">
      {messages.map((message) => (
        <MessageBubble 
            key={message.id} 
            message={message}
            onCopyMessage={onCopyMessage}
            onRegenerateMessage={onRegenerateMessage}
        />
      ))}
      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex justify-start animate-fade-in-up">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-accent rounded-full flex-shrink-0 flex items-center justify-center shadow-md">
              <Icon name="Bot" size={16} color="white" strokeWidth={2.5} />
            </div>
            <div className="bg-surface border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-md dark:bg-[#232946] transition-colors duration-300">
              <div className="flex space-x-1.5 items-center h-full">
                <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageThread;

