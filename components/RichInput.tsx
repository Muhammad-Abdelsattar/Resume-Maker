
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
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Auto-resize for textarea
  useEffect(() => {
    if (multiline && inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [value, multiline]);

  // Tag Wrapping / Toggling
  const insertTag = (tag: 'b' | 'i') => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const text = el.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    const tagStart = `<${tag}>`;
    const tagEnd = `</${tag}>`;

    // Simple Toggle Check
    const isWrapped = before.endsWith(tagStart) && after.startsWith(tagEnd);
    let newVal = '';
    let newStart = start;
    let newEnd = end;

    if (isWrapped) {
        newVal = before.substring(0, before.length - tagStart.length) + selected + after.substring(tagEnd.length);
        newStart = start - tagStart.length;
        newEnd = end - tagStart.length;
    } else {
        newVal = `${before}${tagStart}${selected}${tagEnd}${after}`;
        newStart = start + tagStart.length;
        newEnd = end + tagStart.length;
    }
    
    onChange(newVal);
    setTimeout(() => { el.focus(); el.setSelectionRange(newStart, newEnd); }, 0);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (!url) return;
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const text = el.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    const linkText = selected || "Link Text";
    onChange(`${before}<a href="${url}">${linkText}</a>${after}`);
  };

  // Insert Alignment Div
  const applyAlignment = (align: 'left' | 'center' | 'right') => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const text = el.value;
    const selected = text.substring(start, end);
    
    if (!selected) return; // Must select text to align

    // Check if already aligned (simplified check)
    // We strictly wrap the selected text. 
    // LivePreview handles <div style="text-align:...">
    const divStart = `<div style="text-align: ${align};">`;
    const divEnd = `</div>`;
    
    onChange(`${text.substring(0, start)}${divStart}${selected}${divEnd}${text.substring(end)}`);
  };

  // Insert Icon
  const insertIcon = (iconClass: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const text = el.value;
    const iconTag = `<i class="${iconClass}"></i> `;
    onChange(`${text.substring(0, start)}${iconTag}${text.substring(start)}`);
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
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        className={`w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 outline-none placeholder:text-slate-400 rich-input resize-none overflow-hidden ${className}`}
        placeholder={placeholder}
        {...props}
      />
      {/* Toolbar */}
      <div className={`absolute -top-10 right-0 flex gap-1 bg-slate-800 text-white p-1 rounded-lg shadow-lg transition-opacity z-20 items-center ${isFocused || showIcons ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onMouseDown={(e) => { e.preventDefault(); insertTag('b'); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs font-bold" title="Bold">B</button>
        <button onMouseDown={(e) => { e.preventDefault(); insertTag('i'); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs italic" title="Italic">I</button>
        <div className="w-px h-4 bg-slate-600 mx-1"></div>
        <button onMouseDown={(e) => { e.preventDefault(); applyAlignment('left'); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs" title="Align Left"><i className="fas fa-align-left"></i></button>
        <button onMouseDown={(e) => { e.preventDefault(); applyAlignment('center'); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs" title="Align Center"><i className="fas fa-align-center"></i></button>
        <button onMouseDown={(e) => { e.preventDefault(); applyAlignment('right'); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs" title="Align Right"><i className="fas fa-align-right"></i></button>
        <div className="w-px h-4 bg-slate-600 mx-1"></div>
        <button onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs" title="Link"><i className="fas fa-link"></i></button>
        <div className="relative">
             <button onMouseDown={(e) => { e.preventDefault(); setShowIcons(!showIcons); }} className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-xs" title="Insert Icon"><i className="fas fa-icons"></i></button>
             {showIcons && <IconPicker onSelect={insertIcon} onClose={() => setShowIcons(false)} />}
        </div>
      </div>
    </div>
  );
};
