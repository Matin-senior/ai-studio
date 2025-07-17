// // src/components/CodeEditor.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import Icon from './AppIcon';

// const CodeEditor = ({ initialCode = '', language = 'javascript', onCodeChange, className = '' }) => {
//   const [code, setCode] = useState(initialCode);
//   const [showLineNumbers, setShowLineNumbers] = useState(true);
//   const [fontSize, setFontSize] = useState(14);
//   const textareaRef = useRef(null);
//   const lineNumbersRef = useRef(null);

//   const languages = [
//     { id: 'javascript', name: 'JavaScript', icon: 'Code' },
//     { id: 'python', name: 'Python', icon: 'Code' },
//     { id: 'html', name: 'HTML', icon: 'Code' },
//     { id: 'css', name: 'CSS', icon: 'Palette' },
//     { id: 'json', name: 'JSON', icon: 'FileText' },
//     { id: 'markdown', name: 'Markdown', icon: 'FileText' },
//     { id: 'tsx', name: 'TypeScript', icon: 'Code' },
//     { id: 'sql', name: 'SQL', icon: 'Database' }
//   ];

//   const [selectedLanguage, setSelectedLanguage] = useState(language);

//   useEffect(() => {
//     if (onCodeChange) {
//       onCodeChange(code, selectedLanguage);
//     }
//   }, [code, selectedLanguage, onCodeChange]);

//   useEffect(() => {
//     syncScroll();
//   }, [code]);

//   const handleCodeChange = (e) => {
//     setCode(e.target.value);
//   };

//   const syncScroll = () => {
//     if (textareaRef.current && lineNumbersRef.current) {
//       lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Tab') {
//       e.preventDefault();
//       const textarea = textareaRef.current;
//       const start = textarea.selectionStart;
//       const end = textarea.selectionEnd;
//       const newCode = code.substring(0, start) + '  ' + code.substring(end);
//       setCode(newCode);
//       setTimeout(() => {
//         textarea.selectionStart = textarea.selectionEnd = start + 2;
//       }, 0);
//     }
//   };

//   const getLineNumbers = () => {
//     const lines = code.split('\n');
//     return lines.map((_, index) => index + 1).join('\n');
//   };

//   const formatCode = () => {
//     // Basic formatting - could be enhanced with proper formatters
//     const formatted = code
//       .split('\n')
//       .map(line => line.trim())
//       .join('\n');
//     setCode(formatted);
//   };

//   const copyCode = () => {
//     navigator.clipboard.writeText(code).then(() => {
//       // Could add toast notification here
//     });
//   };

//   return (
//     <div className={`bg-background border border-border rounded-lg overflow-hidden ${className}`}>
//       {/* Toolbar */}
//       <div className="flex items-center justify-between p-3 border-b border-border bg-surface">
//         <div className="flex items-center space-x-3">
//           <select
//             value={selectedLanguage}
//             onChange={(e) => setSelectedLanguage(e.target.value)}
//             className="px-2 py-1 text-sm bg-background border border-border rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
//           >
//             {languages.map((lang) => (
//               <option key={lang.id} value={lang.id}>
//                 {lang.name}
//               </option>
//             ))}
//           </select>
          
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => setShowLineNumbers(!showLineNumbers)}
//               className={`p-1 rounded text-xs transition-colors ${
//                 showLineNumbers ? 'bg-primary text-text-inverse' : 'text-text-secondary hover:text-text-primary'
//               }`}
//               title="Toggle line numbers"
//             >
//               <Icon name="Hash" size={14} strokeWidth={2} />
//             </button>
            
//             <select
//               value={fontSize}
//               onChange={(e) => setFontSize(Number(e.target.value))}
//               className="px-2 py-1 text-xs bg-background border border-border rounded text-text-primary focus:outline-none"
//               title="Font size"
//             >
//               <option value={12}>12px</option>
//               <option value={14}>14px</option>
//               <option value={16}>16px</option>
//               <option value={18}>18px</option>
//             </select>
//           </div>
//         </div>
        
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={formatCode}
//             className="p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 nav-focus"
//             title="Format code"
//           >
//             <Icon name="AlignLeft" size={14} strokeWidth={2} />
//           </button>
          
//           <button
//             onClick={copyCode}
//             className="p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 nav-focus"
//             title="Copy code"
//           >
//             <Icon name="Copy" size={14} strokeWidth={2} />
//           </button>
//         </div>
//       </div>
      
//       {/* Editor */}
//       <div className="relative">
//         <div className="flex" style={{ height: '400px' }}>
//           {/* Line Numbers */}
//           {showLineNumbers && (
//             <div
//               ref={lineNumbersRef}
//               className="w-12 bg-surface border-r border-border text-text-tertiary text-right pr-2 py-3 overflow-hidden select-none"
//               style={{ 
//                 fontSize: `${fontSize}px`,
//                 fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
//                 lineHeight: '1.5'
//               }}
//             >
//               <pre className="whitespace-pre">{getLineNumbers()}</pre>
//             </div>
//           )}
          
//           {/* Code Input */}
//           <div className="flex-1 relative">
//             <textarea
//               ref={textareaRef}
//               value={code}
//               onChange={handleCodeChange}
//               onKeyDown={handleKeyDown}
//               onScroll={syncScroll}
//               placeholder="Write your code here..."
//               className="w-full h-full p-3 bg-transparent text-text-primary resize-none focus:outline-none"
//               style={{
//                 fontSize: `${fontSize}px`,
//                 fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
//                 lineHeight: '1.5',
//                 tabSize: 2
//               }}
//               spellCheck={false}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };





import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import Icon from './AppIcon';

const CodeEditor = ({ initialCode = '', onCodeChange, className = '' }) => {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [fontSize, setFontSize] = useState(14);
  const [isCopied, setIsCopied] = useState(false);
  const [isWordWrapOn, setWordWrap] = useState(true);

  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'json', name: 'JSON' },
    { id: 'markdown', name: 'Markdown' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'sql', name: 'SQL' },
  ];

  useEffect(() => {
    if (onCodeChange) onCodeChange(code, selectedLanguage);
  }, [code, selectedLanguage, onCodeChange]);

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('pro-dev-dark-standalone', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6E7288', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c586c0' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'type', foreground: '4ec9b0' },
      ],
      colors: {
        'editor.background': '#242730',
        'editor.foreground': '#E6E6FA',
        'editorGutter.background': '#242730',
        'editor.lineHighlightBackground': '#2E323D',
        'editorCursor.foreground': '#8A8EC8',
        'editorWhitespace.foreground': '#35394A',
        'editorIndentGuide.background': '#35394A',
        'editorLineNumber.foreground': '#6E7288',
        'editorLineNumber.activeForeground': '#E6E6FA',
      },
    });
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const clearCode = () => setCode('');

  const LoadingComponent = () => (
    <div className="flex items-center justify-center h-full bg-[#242730]">
      <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary"></div>
    </div>
  );

  return (
    <div className={`bg-surface border border-border rounded-lg overflow-hidden flex flex-col shadow-sm ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-border bg-surface text-text-secondary rounded-t-lg">
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-border-focus"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
          {/* Font Size Selector */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none"
            title="Font size"
          >
            {[12, 14, 16, 18].map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setWordWrap(!isWordWrapOn)}
            className={`p-1.5 rounded hover:bg-surface-hover hover:text-text-primary transition-all duration-150 nav-focus ${isWordWrapOn ? 'text-primary' : ''}`}
            title="Toggle Word Wrap"
          >
            <Icon name="WrapText" size={14} strokeWidth={2} />
          </button>
          <button
            onClick={clearCode}
            className="p-1.5 rounded hover:bg-surface-hover hover:text-text-primary transition-all duration-150 nav-focus"
            title="Clear Code"
          >
            <Icon name="Trash2" size={14} strokeWidth={2} />
          </button>
          <button
            onClick={copyCode}
            className="p-1.5 rounded hover:bg-surface-hover hover:text-text-primary transition-all duration-150 nav-focus"
            title="Copy Code"
          >
            <Icon name={isCopied ? 'Check' : 'Copy'} size={14} strokeWidth={isCopied ? 3 : 2} />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative bg-[#242730]">
        {!code && (
          <div className="absolute top-4 left-16 text-text-tertiary select-none pointer-events-none z-10 font-mono text-sm opacity-70">
            Write your code here or let the AI suggest something smart...
          </div>
        )}
        <Editor
          height="100%"
          language={selectedLanguage}
          value={code}
          onChange={handleEditorChange}
          beforeMount={handleEditorWillMount}
          theme="pro-dev-dark-standalone"
          loading={<LoadingComponent />}
          options={{
            fontSize,
            minimap: { enabled: true },
            wordWrap: isWordWrapOn ? 'on' : 'off',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            lineNumbersMinChars: 3,
            glyphMargin: false,
            padding: { top: 16 },
            fixedOverflowWidgets: true,
            autoClosingBrackets: 'languageDefined',
            autoClosingQuotes: 'languageDefined',
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            suggest: {
              snippets: 'inline',
              showWords: true,
            },
            hover: { enabled: true },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
