
import React, { useState } from 'react';

export const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className={`w-full min-w-0 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 outline-none placeholder:text-slate-400 ${className}`}
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

// Common FontAwesome Icons for Resume
const COMMON_ICONS = [
  // Socials & Contact
  'fas fa-envelope', 'fas fa-phone', 'fas fa-map-marker-alt', 'fas fa-globe', 'fas fa-link', 'fas fa-home',
  'fab fa-linkedin', 'fab fa-github', 'fab fa-twitter', 'fab fa-medium', 'fab fa-dev',
  'fab fa-gitlab', 'fab fa-bitbucket', 'fab fa-stackoverflow', 'fab fa-youtube', 'fab fa-instagram',
  'fab fa-facebook', 'fab fa-whatsapp', 'fab fa-telegram', 'fab fa-discord', 'fab fa-slack', 'fab fa-skype',
  
  // Tech & Skills
  'fas fa-code', 'fas fa-laptop-code', 'fas fa-database', 'fas fa-server', 'fas fa-cloud',
  'fas fa-brain', 'fas fa-microchip', 'fas fa-robot', 'fas fa-cogs', 'fas fa-terminal',
  'fas fa-layer-group', 'fas fa-cubes', 'fas fa-network-wired', 'fas fa-project-diagram',
  'fas fa-chart-bar', 'fas fa-chart-line', 'fas fa-chart-pie', 'fas fa-table', 'fas fa-file-alt',
  
  // Awards & Certs
  'fas fa-trophy', 'fas fa-medal', 'fas fa-certificate', 'fas fa-award', 'fas fa-star', 'fas fa-crown',
  
  // Misc
  'fas fa-user', 'fas fa-briefcase', 'fas fa-graduation-cap', 'fas fa-university', 'fas fa-building',
  'fas fa-calendar-alt', 'fas fa-clock', 'fas fa-check-circle', 'fas fa-external-link-alt'
];

export const IconPicker = ({ onSelect, onClose, className = "" }: { onSelect: (icon: string) => void, onClose: () => void, className?: string }) => {
  const [search, setSearch] = useState('');
  const filteredIcons = COMMON_ICONS.filter(icon => icon.includes(search.toLowerCase()));

  return (
    <>
      {/* Backdrop to catch clicks outside */}
      <div className="fixed inset-0 z-[100]" onClick={onClose}></div>

      {/* Picker Container */}
      <div 
        className={`bg-white border border-slate-200 shadow-xl rounded-xl p-3 w-64 z-[101]
        /* Mobile: Fixed Center Modal */
        fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        /* Desktop: Absolute Dropdown (Position controlled by parent/className) */
        sm:absolute sm:top-full sm:translate-x-0 sm:translate-y-2
        /* Default Desktop Alignment: Left */
        ${className || 'sm:left-0'} 
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 relative">
             <i className="fas fa-search absolute left-2 top-2.5 text-slate-400 text-xs"></i>
            <input
            autoFocus
            className="w-full text-xs pl-7 pr-2 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-colors"
            placeholder="Search icons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            />
        </div>
        <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto custom-scrollbar">
          {filteredIcons.map(icon => (
            <button
              key={icon}
              onClick={() => onSelect(icon)}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
              title={icon}
            >
              <i className={icon}></i>
            </button>
          ))}
          {filteredIcons.length === 0 && (
              <p className="col-span-6 text-center text-[10px] text-slate-400 py-4">No icons found</p>
          )}
        </div>
      </div>
    </>
  );
};
