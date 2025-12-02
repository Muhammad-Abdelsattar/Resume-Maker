
import React, { useState } from 'react';

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
  'fas fa-network-wired', 'fas fa-wifi', 'fas fa-lock', 'fas fa-key', 'fas fa-bug',
  'fab fa-aws', 'fab fa-google', 'fab fa-microsoft', 'fab fa-docker', 'fab fa-python', 
  'fab fa-js', 'fab fa-react', 'fab fa-node', 'fab fa-java', 'fab fa-linux', 'fab fa-android',
  'fab fa-apple', 'fab fa-windows', 'fab fa-html5', 'fab fa-css3', 'fab fa-sass',
  
  // Achievements & Misc
  'fas fa-trophy', 'fas fa-medal', 'fas fa-certificate', 'fas fa-graduation-cap', 'fas fa-book',
  'fas fa-briefcase', 'fas fa-building', 'fas fa-user-tie', 'fas fa-users',
  'fas fa-star', 'fas fa-check', 'fas fa-check-circle', 'fas fa-play', 'fas fa-video', 'fas fa-file-alt',
  'fas fa-chart-line', 'fas fa-chart-bar', 'fas fa-project-diagram', 'fas fa-lightbulb', 'fas fa-rocket'
];

export const IconPicker = ({ onSelect, onClose }: { onSelect: (icon: string) => void, onClose: () => void }) => {
  const [search, setSearch] = useState('');

  const filtered = COMMON_ICONS.filter(i => i.includes(search.toLowerCase()));

  return (
    <div className="absolute top-10 left-0 z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-3 w-64 animate-in fade-in zoom-in-95 duration-200">
      <div className="mb-2">
         <input 
           autoFocus
           placeholder="Search icon..."
           className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400"
           value={search}
           onChange={e => setSearch(e.target.value)}
         />
      </div>
      <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
        {filtered.map(icon => (
           <button 
             key={icon}
             onClick={(e) => { e.stopPropagation(); onSelect(icon); onClose(); }}
             className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-sm"
             title={icon}
           >
             <i className={icon}></i>
           </button>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
         <span className="text-[10px] text-slate-400">FontAwesome 5</span>
         <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-xs text-red-400 hover:text-red-500">Close</button>
      </div>
    </div>
  );
};
