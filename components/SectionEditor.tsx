
import React, { useState } from 'react';
import { 
  ResumeSection, ExperienceSection, ProjectSection, SkillsSection, SummarySection, CustomSection, AdditionalSection
} from '../types';
import { optimizeBulletPoint } from '../services/geminiService';
import { Input, IconButton, AddButton, IconPicker } from './UI';
import { RichInput } from './RichInput';

export interface SectionEditorProps {
  section: ResumeSection;
  onUpdate: (updatedSection: ResumeSection) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ section, onUpdate, onDelete, onMoveUp, onMoveDown }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [iconPickerIdx, setIconPickerIdx] = useState<{ type: 'project' | 'social', idx: number, subIdx?: number } | null>(null);

  // -- Handlers --
  const updateItem = (index: number, newItem: any) => {
    const newItems = [...(section as any).items];
    newItems[index] = newItem;
    onUpdate({ ...section, items: newItems } as any);
  };

  const addItem = (emptyItem: any) => {
    const newItems = [...(section as any).items, emptyItem];
    onUpdate({ ...section, items: newItems } as any);
  };

  const deleteItem = (index: number) => {
    const newItems = (section as any).items.filter((_: any, i: number) => i !== index);
    onUpdate({ ...section, items: newItems } as any);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const items = [...(section as any).items];
    if (index + direction < 0 || index + direction >= items.length) return;
    const temp = items[index];
    items[index] = items[index + direction];
    items[index + direction] = temp;
    onUpdate({ ...section, items } as any);
  };

  const handleOptimizeBullet = async (itemIndex: number, bulletIndex: number, contextText: string) => {
    const items = (section as any).items;
    const bullet = items[itemIndex].bullets[bulletIndex];
    if(!bullet) return;
    const optimized = await optimizeBulletPoint(bullet, contextText);
    const newItems = [...items];
    newItems[itemIndex].bullets[bulletIndex] = optimized;
    onUpdate({ ...section, items: newItems } as any);
  };

  // -- Renderers --

  const renderSummaryEditor = (s: SummarySection) => (
    <div className="px-2">
        <RichInput 
        value={s.content} 
        onChange={val => onUpdate({...s, content: val})} 
        multiline
        placeholder="Write your professional summary..."
        />
        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><i className="fas fa-info-circle"></i> Use the toolbar to add bold, italics, links, alignment, or icons.</p>
    </div>
  );

  const renderAdditionalEditor = (s: AdditionalSection) => (
    <div className="space-y-3">
        {s.items.map((item, idx) => (
             <div key={item.id} className="flex gap-2 items-start bg-white p-3 rounded-xl border border-slate-200">
                <RichInput 
                    value={item.content}
                    multiline
                    onChange={val => updateItem(idx, {...item, content: val})}
                    placeholder="e.g. Languages: English (Fluent)"
                />
                <IconButton icon={<i className="fas fa-trash"></i>} onClick={() => deleteItem(idx)} className="text-red-300 hover:text-red-500 mt-2" />
             </div>
        ))}
        <AddButton onClick={() => addItem({ id: Date.now().toString(), content: '' })} label="Add Info Item" />
    </div>
  );

  const renderExperienceEditor = (s: ExperienceSection) => (
    <div className="space-y-4">
      {s.items.map((item, idx) => (
        <div key={item.id} className="relative group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
          {/* Item Controls */}
          <div className="absolute top-3 right-3 flex gap-1 bg-white/90 backdrop-blur rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm border border-slate-100">
            <IconButton icon={<i className="fas fa-chevron-up text-xs"></i>} onClick={() => moveItem(idx, -1)} />
            <IconButton icon={<i className="fas fa-chevron-down text-xs"></i>} onClick={() => moveItem(idx, 1)} />
            <div className="w-px bg-slate-200 mx-1"></div>
            <IconButton icon={<i className="fas fa-trash text-xs"></i>} onClick={() => deleteItem(idx)} className="text-red-400 hover:text-red-600 hover:bg-red-50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Title / Role</label>
                 <RichInput value={item.title} onChange={val => updateItem(idx, {...item, title: val})} placeholder="e.g. Senior Data Engineer" className="font-semibold text-slate-800"/>
            </div>
            <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Company</label>
                 <RichInput value={item.subtitle} onChange={val => updateItem(idx, {...item, subtitle: val})} placeholder="e.g. Google" />
            </div>
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Date Range</label>
                <RichInput value={item.date} onChange={val => updateItem(idx, {...item, date: val})} placeholder="e.g. 2020 - Present" />
            </div>
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Location</label>
                <RichInput value={item.location} onChange={val => updateItem(idx, {...item, location: val})} placeholder="e.g. Cairo, Egypt" />
            </div>
          </div>
          
          <div className="space-y-3">
             {item.description !== undefined && (
                <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Short Description</label>
                    <RichInput value={item.description} onChange={val => updateItem(idx, {...item, description: val})} multiline placeholder="Brief overview..." />
                </div>
             )}
             
             <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Bullet Points</label>
                <div className="space-y-2 pl-2 border-l-2 border-slate-100">
                    {item.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex gap-2 items-start group/bullet relative">
                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-3 shrink-0"></div>
                            <div className="flex-1 relative">
                                <RichInput value={bullet} multiline onChange={val => { const newBullets = [...item.bullets]; newBullets[bIdx] = val; updateItem(idx, {...item, bullets: newBullets}); }} placeholder="Achievement..." />
                                <button onClick={() => handleOptimizeBullet(idx, bIdx, `Job: ${item.title}`)} className="absolute right-2 bottom-2 opacity-0 group-hover/bullet:opacity-100 flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 transition-all z-20">
                                    <i className="fas fa-magic text-xs"></i> AI Optimize
                                </button>
                            </div>
                            <button onClick={() => { const newBullets = item.bullets.filter((_, i) => i !== bIdx); updateItem(idx, {...item, bullets: newBullets}); }} className="mt-2 text-slate-300 hover:text-red-400 p-1"><i className="fas fa-times"></i></button>
                        </div>
                    ))}
                </div>
                <button onClick={() => updateItem(idx, {...item, bullets: [...item.bullets, ""]})} className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50">
                    <i className="fas fa-plus"></i> Add Bullet
                </button>
             </div>
          </div>
        </div>
      ))}
      <AddButton onClick={() => addItem({ id: Date.now().toString(), title: '', subtitle: '', date: '', location: '', bullets: [] })} label="Add Entry" />
    </div>
  );

  const renderProjectEditor = (s: ProjectSection) => (
    <div className="space-y-4">
      {s.items.map((item, idx) => (
        <div key={item.id} className="relative group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-3 right-3 flex gap-1 bg-white/90 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-slate-100 rounded-lg">
            <IconButton icon={<i className="fas fa-chevron-up text-xs"></i>} onClick={() => moveItem(idx, -1)} />
            <IconButton icon={<i className="fas fa-chevron-down text-xs"></i>} onClick={() => moveItem(idx, 1)} />
            <div className="w-px bg-slate-200 mx-1"></div>
            <IconButton icon={<i className="fas fa-trash text-xs"></i>} onClick={() => deleteItem(idx)} className="text-red-400" />
          </div>

          <div className="mb-4">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Project Title</label>
             <RichInput value={item.title} onChange={val => updateItem(idx, {...item, title: val})} placeholder="Project Name" className="font-bold text-slate-800"/>
          </div>

          <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Links</label>
             <div className="flex flex-wrap gap-2">
                {item.links.map((link, lIdx) => (
                   <div key={link.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded px-2 py-1 text-sm shadow-sm group/link">
                       <div className="relative">
                            <button 
                                onClick={() => setIconPickerIdx({ type: 'project', idx, subIdx: lIdx })}
                                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-blue-600 bg-slate-100 rounded hover:bg-blue-50 transition-colors"
                            >
                                <i className={link.icon || 'fas fa-link'}></i>
                            </button>
                            {iconPickerIdx?.type === 'project' && iconPickerIdx.idx === idx && iconPickerIdx.subIdx === lIdx && (
                                <IconPicker 
                                    onSelect={(icon) => {
                                        const newLinks = [...item.links];
                                        newLinks[lIdx].icon = icon;
                                        updateItem(idx, {...item, links: newLinks});
                                        setIconPickerIdx(null);
                                    }}
                                    onClose={() => setIconPickerIdx(null)}
                                />
                            )}
                       </div>
                       <input 
                         className="w-20 outline-none text-slate-700 font-medium bg-transparent border-b border-transparent focus:border-blue-400"
                         value={link.label}
                         onChange={e => {
                            const newLinks = [...item.links];
                            newLinks[lIdx].label = e.target.value;
                            updateItem(idx, {...item, links: newLinks});
                         }}
                         placeholder="Label"
                       />
                       <div className="w-px h-3 bg-slate-200"></div>
                       <input 
                         className="w-32 outline-none text-blue-600 text-xs bg-transparent border-b border-transparent focus:border-blue-400"
                         value={link.url}
                         onChange={e => {
                            const newLinks = [...item.links];
                            newLinks[lIdx].url = e.target.value;
                            updateItem(idx, {...item, links: newLinks});
                         }}
                         placeholder="URL"
                       />
                       
                       {/* Link Reordering & Delete */}
                       <div className="flex gap-1 opacity-0 group-hover/link:opacity-100 transition-opacity">
                            <button onClick={() => {
                                const newLinks = [...item.links];
                                if (lIdx > 0) {
                                    [newLinks[lIdx], newLinks[lIdx - 1]] = [newLinks[lIdx - 1], newLinks[lIdx]];
                                    updateItem(idx, {...item, links: newLinks});
                                }
                            }} className="text-slate-400 hover:text-blue-600 text-[10px]"><i className="fas fa-chevron-left"></i></button>
                            <button onClick={() => {
                                const newLinks = [...item.links];
                                if (lIdx < item.links.length - 1) {
                                    [newLinks[lIdx], newLinks[lIdx + 1]] = [newLinks[lIdx + 1], newLinks[lIdx]];
                                    updateItem(idx, {...item, links: newLinks});
                                }
                            }} className="text-slate-400 hover:text-blue-600 text-[10px]"><i className="fas fa-chevron-right"></i></button>
                            <button onClick={() => {
                                const newLinks = item.links.filter((_, i) => i !== lIdx);
                                updateItem(idx, {...item, links: newLinks});
                            }} className="text-slate-400 hover:text-red-500 ml-1"><i className="fas fa-times"></i></button>
                       </div>
                   </div>
                ))}
                <button 
                  onClick={() => updateItem(idx, {...item, links: [...item.links, { id: Date.now().toString(), label: "Link", url: "", icon: "fas fa-link" }]})}
                  className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 font-medium transition-colors"
                >
                   + Add Link
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">Skills Used</label>
                <RichInput value={item.skills} onChange={val => updateItem(idx, {...item, skills: val})} placeholder="e.g. NLP, CV" />
             </div>
             <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">Tools</label>
                <RichInput value={item.tools} onChange={val => updateItem(idx, {...item, tools: val})} placeholder="e.g. PyTorch" />
             </div>
          </div>

          <div>
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Achievements</label>
             <div className="space-y-2 pl-2 border-l-2 border-slate-100">
                {item.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex gap-2 items-start group/bullet relative">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-3 shrink-0"></div>
                    <div className="flex-1 relative">
                        <RichInput value={bullet} multiline onChange={val => { const newBullets = [...item.bullets]; newBullets[bIdx] = val; updateItem(idx, {...item, bullets: newBullets}); }} placeholder="Details..." />
                         <button onClick={() => handleOptimizeBullet(idx, bIdx, `Project: ${item.title}`)} className="absolute right-2 bottom-2 opacity-0 group-hover/bullet:opacity-100 flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 transition-all z-20">
                            <i className="fas fa-magic text-xs"></i> Optimize
                        </button>
                    </div>
                     <button onClick={() => { const newBullets = item.bullets.filter((_, i) => i !== bIdx); updateItem(idx, {...item, bullets: newBullets}); }} className="mt-2 text-slate-300 hover:text-red-400 p-1"><i className="fas fa-times"></i></button>
                    </div>
                ))}
            </div>
             <button onClick={() => updateItem(idx, {...item, bullets: [...item.bullets, ""]})} className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50">
               <i className="fas fa-plus"></i> Add Bullet
             </button>
          </div>
        </div>
      ))}
       <AddButton onClick={() => addItem({ id: Date.now().toString(), title: '', skills: '', tools: '', links: [], bullets: [] })} label="Add Project" />
    </div>
  );

  const renderSkillsEditor = (s: SkillsSection) => (
    <div className="space-y-3">
      {s.items.map((item, idx) => (
        <div key={item.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center group p-3 rounded-lg border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm transition-all">
           <div className="w-full md:w-1/3">
                <RichInput value={item.category} onChange={val => updateItem(idx, {...item, category: val})} className="font-bold text-slate-800" placeholder="Category" />
           </div>
           <div className="flex-1 flex gap-2 w-full">
                <RichInput value={item.items} onChange={val => updateItem(idx, {...item, items: val})} placeholder="Skills..." />
                 <IconButton icon={<i className="fas fa-trash"></i>} onClick={() => deleteItem(idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100" />
           </div>
        </div>
      ))}
      <AddButton onClick={() => addItem({ id: Date.now().toString(), category: '', items: '' })} label="Add Skill Category" />
    </div>
  );

  const renderCustomEditor = (s: CustomSection) => (
    <div className="space-y-4">
      {s.items.map((row, idx) => (
        <div key={row.id} className="relative group bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
             <div className="absolute top-2 right-2 flex gap-1 bg-white p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-slate-100 rounded">
                <IconButton icon={<i className="fas fa-chevron-up text-xs"></i>} onClick={() => moveItem(idx, -1)} />
                <IconButton icon={<i className="fas fa-chevron-down text-xs"></i>} onClick={() => moveItem(idx, 1)} />
                <div className="w-px bg-slate-200 mx-1"></div>
                <IconButton icon={<i className="fas fa-trash text-xs"></i>} onClick={() => deleteItem(idx)} className="text-red-400" />
            </div>

            <div className="mb-3 flex items-center justify-between flex-wrap gap-2 pr-20">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Row Layout</div>
               <button onClick={() => { const newRow = {...row, columns: [...row.columns, { id: Date.now().toString(), width: 100 / (row.columns.length + 1), alignment: 'left', content: '' }]}; updateItem(idx, newRow); }} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 border border-blue-100">
                  <i className="fas fa-plus mr-1"></i> Add Column
                </button>
            </div>
            
            <div className="flex flex-row gap-2 mb-2 p-3 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto custom-scrollbar">
               {row.columns.map((col, cIdx) => (
                  <div key={col.id} className="flex flex-col gap-2 transition-all min-w-[150px]" style={{ flexGrow: col.width, width: `${Math.max(15, col.width)}%` }}>
                     <div className="flex gap-1 items-center bg-white p-1 rounded border border-slate-200 shadow-sm">
                        <span className="text-[10px] text-slate-400 pl-1">W:</span>
                        <input type="number" value={col.width} onChange={e => { const newCols = [...row.columns]; newCols[cIdx].width = Number(e.target.value); updateItem(idx, {...row, columns: newCols}); }} className="w-full text-[10px] p-1 rounded outline-none text-center font-mono font-medium bg-white text-slate-800 border border-slate-100 focus:border-blue-400" />
                        <div className="w-px h-3 bg-slate-200"></div>
                        <button onClick={() => { const newCols = [...row.columns]; const nextAlign = col.alignment === 'left' ? 'center' : col.alignment === 'center' ? 'right' : 'left'; newCols[cIdx].alignment = nextAlign; updateItem(idx, {...row, columns: newCols}); }} className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 hover:text-blue-600 hover:bg-slate-50">
                           <i className={`fas fa-align-${col.alignment}`}></i>
                        </button>
                        <button onClick={() => { const newCols = row.columns.filter((_, i) => i !== cIdx); updateItem(idx, {...row, columns: newCols}); }} className="px-1.5 py-0.5 rounded text-[10px] text-red-300 hover:text-red-500 hover:bg-red-50">
                           <i className="fas fa-times"></i>
                        </button>
                     </div>
                     <RichInput value={col.content} multiline onChange={val => { const newCols = [...row.columns]; newCols[cIdx].content = val; updateItem(idx, {...row, columns: newCols}); }} placeholder="Content..." className="min-h-[60px] bg-white border-slate-200 shadow-sm" />
                  </div>
               ))}
            </div>
            
            <div className="flex items-center gap-2 mt-2 px-1">
                 <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer hover:text-blue-600 transition-colors">
                    <input type="checkbox" checked={row.hasBullet} onChange={e => updateItem(idx, {...row, hasBullet: e.target.checked})} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Display as Bullet Point
                 </label>
            </div>
        </div>
      ))}
      <AddButton onClick={() => addItem({ id: Date.now().toString(), hasBullet: false, columns: [] })} label="Add Grid Row" />
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
      <div 
        className="bg-slate-50 px-6 py-4 flex items-center justify-between cursor-pointer border-b border-slate-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
            <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-slate-400`}>
                <i className="fas fa-chevron-down"></i>
            </div>
            <div onClick={e => e.stopPropagation()} className="w-64">
                 <input type="text" value={section.title} onChange={(e) => onUpdate({...section, title: e.target.value})} className="bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-400 rounded px-2 py-1 font-bold text-slate-700 text-lg outline-none w-full transition-all" />
            </div>
            <span className="text-xs font-mono text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded border border-slate-200">
                {section.type}
            </span>
        </div>
        <div className="flex items-center gap-2">
            <IconButton icon={<i className="fas fa-arrow-up"></i>} onClick={onMoveUp} title="Move Up" />
            <IconButton icon={<i className="fas fa-arrow-down"></i>} onClick={onMoveDown} title="Move Down" />
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            <IconButton icon={<i className="fas fa-trash"></i>} onClick={onDelete} className="text-red-400 hover:text-red-600 hover:bg-red-50" title="Delete Section" />
        </div>
      </div>

      {isOpen && (
        <div className="p-6 bg-slate-50/50">
           {section.type === 'summary' && renderSummaryEditor(section as SummarySection)}
           {(section.type === 'experience' || section.type === 'education') && renderExperienceEditor(section as ExperienceSection)}
           {section.type === 'projects' && renderProjectEditor(section as ProjectSection)}
           {section.type === 'skills' && renderSkillsEditor(section as SkillsSection)}
           {section.type === 'custom' && renderCustomEditor(section as CustomSection)}
           {section.type === 'additional' && renderAdditionalEditor(section as AdditionalSection)}
        </div>
      )}
    </div>
  );
};
