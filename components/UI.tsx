
import React from 'react';

export const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className={`w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 outline-none placeholder:text-slate-400 ${className}`}
    {...props}
  />
);

export const IconButton = ({ onClick, icon, title, className = "text-slate-400 hover:text-blue-600", disabled = false }: any) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(e); }} 
    title={title}
    disabled={disabled}
    className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${className}`}
  >
    {icon}
  </button>
);

export const AddButton = ({ onClick, label }: { onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className="mt-4 w-full py-3 border border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all text-sm font-semibold flex items-center justify-center gap-2 group"
  >
    <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
    </div>
    {label}
  </button>
);
