
import React, { useRef, useState, useEffect } from 'react';

interface RichInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}

export const RichInput: React.FC<RichInputProps> = ({ value, onChange, placeholder, className = "", multiline = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Auto-resize for textarea
  useEffect(() => {
    if (multiline && inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [value, multiline]);

  const insertTag = (tag: 'b' | 'i') => {
    const el = inputRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;

    if (start === null || end === null) return;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const tagStart = `<${tag}>`;
    const tagEnd = `</${tag}>`;

    // Check if the selection is already wrapped in this tag (simple check)
    // We look at the characters immediately preceding and following the selection
    const isWrapped = before.endsWith(tagStart) && after.startsWith(tagEnd);

    let newVal = '';
    let newSelectionStart = start;
    let newSelectionEnd = end;

    if (isWrapped) {
        // Unwrap: Remove the tags
        newVal = before.substring(0, before.length - tagStart.length) + selected + after.substring(tagEnd.length);
        // Adjust cursor to select the text without tags
        newSelectionStart = start - tagStart.length;
        newSelectionEnd = end - tagStart.length;
    } else {
        // Wrap: Add the tags
        newVal = `${before}${tagStart}${selected || ''}${tagEnd}${after}`;
        // Adjust cursor to be inside the tags
        if (!selected) {
            // If no text selected, place cursor inside tags
            newSelectionStart = start + tagStart.length;
            newSelectionEnd = start + tagStart.length;
        } else {
             // If text selected, select the text + tags (or just text? usually convenient to keep selection on text)
             // Let's keep selection on the text inside tags
             newSelectionStart = start + tagStart.length;
             newSelectionEnd = end + tagStart.length;
        }
    }

    onChange(newVal);
    
    // Restore focus and cursor
    setTimeout(() => {
        el.focus();
        el.setSelectionRange(newSelectionStart, newSelectionEnd);
    }, 0);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (!url) return;

    const el = inputRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    
    if (start === null || end === null) return;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    const linkText = selected || "Link Text";
    const newVal = `${before}<a href="${url}">${linkText}</a>${after}`;
    onChange(newVal);
    
    setTimeout(() => {
        el.focus();
    }, 0);
  };

  const Component = multiline ? 'textarea' : 'input';
  const props = multiline ? { rows: 1 } : {};

  return (
    <div className="relative group/rich w-full">
      <Component
        // @ts-ignore
        ref={inputRef}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow button clicks
        className={`w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 outline-none placeholder:text-slate-400 rich-input resize-none overflow-hidden ${className}`}
        placeholder={placeholder}
        {...props}
      />
      {/* Toolbar - shows on focus or hover */}
      <div className={`absolute -top-9 right-0 flex gap-1 bg-slate-800 text-white p-1 rounded-lg shadow-lg transition-opacity z-20 ${isFocused ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onMouseDown={(e) => { e.preventDefault(); insertTag('b'); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs font-bold" title="Bold / Unbold">B</button>
        <button onMouseDown={(e) => { e.preventDefault(); insertTag('i'); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs italic" title="Italic / Unitalic">I</button>
        <button onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs" title="Link"><i className="fas fa-link"></i></button>
      </div>
    </div>
  );
};
