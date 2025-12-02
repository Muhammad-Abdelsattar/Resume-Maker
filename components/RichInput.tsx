
import React, { useRef, useState, useEffect } from 'react';
import { IconPicker } from './UI';

interface RichInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}

export const RichInput: React.FC<RichInputProps> = ({ value, onChange, placeholder, className = "", multiline = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync internal HTML with external value only when not focused or significantly different
  // This prevents cursor jumping issues during typing
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!isFocused) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value, isFocused]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    // Trigger input update manually since execCommand doesn't always fire 'input' event immediately in all browsers
    handleInput(); 
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      execCmd('createLink', url);
    }
  };

  const insertIcon = (iconClass: string) => {
    // Insert icon HTML with a non-editable attribute to treat it as a block
    const iconHtml = `<i class="${iconClass}" contenteditable="false"></i>&nbsp;`;
    execCmd('insertHTML', iconHtml);
    setShowIcons(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="relative group/rich w-full">
      {/* Visual Toolbar */}
      <div className={`absolute -top-10 right-0 flex gap-1 bg-slate-800 text-white p-1 rounded-lg shadow-lg transition-opacity z-20 items-center ${isFocused || showIcons ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs font-bold" title="Bold">B</button>
        <button onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs italic" title="Italic">I</button>
        <div className="w-px h-4 bg-slate-600 mx-1"></div>
        <button onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs" title="Link"><i className="fas fa-link"></i></button>
        <div className="relative">
             <button onMouseDown={(e) => { e.preventDefault(); setShowIcons(!showIcons); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs" title="Insert Icon"><i className="fas fa-icons"></i></button>
             {showIcons && (
                <IconPicker 
                    onSelect={insertIcon} 
                    onClose={() => setShowIcons(false)} 
                    className="sm:right-0 sm:left-auto" 
                />
             )}
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className={`w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 outline-none rich-input overflow-hidden ${className}`}
        data-placeholder={placeholder}
      />
    </div>
  );
};
