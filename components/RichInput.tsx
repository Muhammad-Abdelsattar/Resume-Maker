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
  const savedRange = useRef<Range | null>(null);

  // 1. FIXED: Enhanced Sync Logic
  // This replaces dangerouslySetInnerHTML. 
  // It only updates the DOM if it's actually different from the prop, preserving the cursor.
  useEffect(() => {
    if (editorRef.current) {
        // If the DOM content is different from the Prop value
        if (editorRef.current.innerHTML !== value) {
            // Only update if we are NOT focused (to avoid cursor jumps while typing)
            // OR if the editor is currently empty (initial load)
            if (!isFocused || editorRef.current.innerHTML === '') {
                editorRef.current.innerHTML = value;
            }
            // For advanced cases: If we are focused and value changed externally (rare in this app), 
            // we skip update to protect cursor.
        }
    }
  }, [value, isFocused]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (html !== value) {
         onChange(html);
      }
    }
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRange.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (savedRange.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange.current);
    } else {
      editorRef.current?.focus();
      // Optional: Move cursor to end if no selection saved
    }
  };

  const execCmd = (command: string, arg?: string) => {
    if (!isFocused && savedRange.current) {
        restoreSelection();
    }
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    // 2. FIXED: Ensure input is triggered to update state
    handleInput(); 
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      execCmd('createLink', url);
    }
  };

  const insertIcon = (iconClass: string) => {
    restoreSelection();
    // 3. Tip: Added a space before the icon too, helps with spacing
    const iconHtml = `&nbsp;<i class="${iconClass}" contenteditable="false"></i>&nbsp;`;
    document.execCommand('insertHTML', false, iconHtml);
    setShowIcons(false);
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="relative group/rich w-full">
      {/* Toolbar ... (No changes needed here) */}
      <div className={`absolute -top-10 right-0 flex gap-1 bg-slate-800 text-white p-1 rounded-lg shadow-lg transition-opacity z-20 items-center ${isFocused || showIcons ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs font-bold" title="Bold">B</button>
        <button onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs italic" title="Italic">I</button>
        <div className="w-px h-4 bg-slate-600 mx-1"></div>
        <button onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs" title="Link"><i className="fas fa-link"></i></button>
        <div className="relative">
             <button 
                onMouseDown={(e) => { 
                    e.preventDefault(); 
                    if(!showIcons) saveSelection(); 
                    setShowIcons(!showIcons); 
                }} 
                className={`w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs ${showIcons ? 'bg-slate-700 text-blue-400' : ''}`} 
                title="Insert Icon"
             >
                <i className="fas fa-icons"></i>
             </button>
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
        // 4. CRITICAL FIX: REMOVED dangerouslySetInnerHTML={{ __html: value }}
        // This stops React from overwriting your cursor position on every keypress.
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
            saveSelection();
            setIsFocused(false);
        }}
        onKeyDown={handleKeyDown}
        onMouseUp={saveSelection} 
        onKeyUp={saveSelection}   
        className={`w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 outline-none rich-input overflow-hidden ${className}`}
        data-placeholder={placeholder}
      />
    </div>
  );
};