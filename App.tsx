
import React, { useState, useEffect } from 'react';
import { ResumeData, ResumeSection, SectionType, SummarySection } from './types';
import { INITIAL_RESUME_DATA } from './constants';
import { generateLatex } from './services/latexGenerator';
import { SectionEditor } from './components/SectionEditor';
import { Input, IconButton, IconPicker } from './components/UI';
import { LivePreview } from './components/LivePreview';
import { generateSummary } from './services/geminiService';

export default function App() {
  const [data, setData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [latexCode, setLatexCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'code'>('editor');
  const [isCopied, setIsCopied] = useState(false);
  const [iconPickerIdx, setIconPickerIdx] = useState<number | null>(null);

  useEffect(() => {
    const code = generateLatex(data);
    setLatexCode(code);
  }, [data]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    window.print();
  };

  const handleUpdateSection = (index: number, updatedSection: ResumeSection) => {
    const newSections = [...data.sections];
    newSections[index] = updatedSection;
    setData({ ...data, sections: newSections });
  };

  const handleDeleteSection = (sectionId: string) => {
    setData(prevData => ({
      ...prevData,
      sections: prevData.sections.filter(s => s.id !== sectionId)
    }));
  };

  const handleMoveSection = (index: number, direction: -1 | 1) => {
     const newSections = [...data.sections];
     if (index + direction < 0 || index + direction >= newSections.length) return;
     const temp = newSections[index];
     newSections[index] = newSections[index + direction];
     newSections[index + direction] = temp;
     setData({ ...data, sections: newSections });
  };

  const handleAddSection = (type: SectionType) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    let newSection: ResumeSection;
    
    if (type === 'experience') {
      newSection = { id, type: 'experience', title: 'Experience', items: [] };
    } else if (type === 'projects') {
      newSection = { id, type: 'projects', title: 'Projects', items: [] };
    } else if (type === 'skills') {
      newSection = { id, type: 'skills', title: 'Skills', items: [] };
    } else if (type === 'summary') {
      newSection = { id, type: 'summary', title: 'Summary', content: '' };
    } else if (type === 'education') {
      newSection = { id, type: 'education', title: 'Education', items: [] };
    } else if (type === 'additional') {
      newSection = { id, type: 'additional', title: 'Additional', items: [] };
    } else {
      newSection = { id, type: 'custom', title: 'Custom Section', items: [] };
    }
    
    setData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const updateSocial = (idx: number, field: string, value: string) => {
    const newSocials = [...data.socials];
    (newSocials[idx] as any)[field] = value;
    setData({...data, socials: newSocials});
  };

  const handleGenerateSummary = async () => {
     const skillsSec = data.sections.find(s => s.type === 'skills') as any;
     const skills = skillsSec ? skillsSec.items.map((i: any) => i.items).join(', ') : '';
     const projectSec = data.sections.find(s => s.type === 'projects') as any;
     const projects = projectSec ? projectSec.items.map((i: any) => i.title).join(', ') : '';
     
     const summary = await generateSummary(skills, projects, data.roleTitle);
     if(summary) {
        const summarySecIndex = data.sections.findIndex(s => s.type === 'summary');
        if(summarySecIndex !== -1) {
            const newSections = [...data.sections];
            (newSections[summarySecIndex] as SummarySection).content = summary;
            setData({...data, sections: newSections});
        }
     }
  };

  const TabButton = ({ id, label, icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col h-screen text-slate-800 font-sans print:h-auto print:bg-white print:overflow-visible">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 z-20 print:hidden shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-blue-200 shadow-lg">R</div>
            <div>
                <h1 className="font-bold text-lg leading-tight">ResuMake</h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">AI Resume Builder</p>
            </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
             <TabButton id="editor" label="Editor" icon={<i className="fas fa-pen"></i>} />
             <TabButton id="preview" label="Preview" icon={<i className="fas fa-eye"></i>} />
             <TabButton id="code" label="LaTeX" icon={<i className="fas fa-code"></i>} />
        </div>

        <div className="flex gap-2">
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-200 active:scale-95">
                <i className="fas fa-print"></i> Print / PDF
            </button>
            <button onClick={copyToClipboard} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-slate-200 active:scale-95">
                {isCopied ? <i className="fas fa-check text-green-400"></i> : <i className="fas fa-copy"></i>} {isCopied ? 'Copied!' : 'Copy LaTeX'}
            </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex relative print:overflow-visible print:block print:h-auto w-full">
        <div className={`flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar ${activeTab === 'editor' ? 'block' : 'hidden'} w-full mx-auto bg-white print:hidden`}>
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 max-w-5xl mx-auto">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Document Settings</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Theme Color</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={data.settings.themeColor} onChange={(e) => setData({...data, settings: {...data.settings, themeColor: e.target.value}})} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Font</label>
                        <select value={data.settings.fontFamily} onChange={(e) => setData({...data, settings: {...data.settings, fontFamily: e.target.value as any}})} className="w-full text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:border-blue-400 outline-none">
                            <option value="Helvetica">Helvetica</option>
                            <option value="Arial">Arial</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Garamond">Garamond</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times">Times New Roman</option>
                            <option value="Courier">Courier New</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Size</label>
                        <select value={data.settings.fontSize} onChange={(e) => setData({...data, settings: {...data.settings, fontSize: e.target.value as any}})} className="w-full text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:border-blue-400 outline-none">
                            <option value="10pt">Small (10pt)</option>
                            <option value="11pt">Medium (11pt)</option>
                            <option value="12pt">Large (12pt)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Margins</label>
                        <select value={data.settings.documentMargin} onChange={(e) => setData({...data, settings: {...data.settings, documentMargin: e.target.value as any}})} className="w-full text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:border-blue-400 outline-none">
                            <option value="compact">Compact</option>
                            <option value="standard">Standard</option>
                            <option value="relaxed">Relaxed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Line Spacing</label>
                        <select value={data.settings.lineHeight} onChange={(e) => setData({...data, settings: {...data.settings, lineHeight: e.target.value as any}})} className="w-full text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:border-blue-400 outline-none">
                            <option value="compact">Compact</option>
                            <option value="standard">Standard</option>
                            <option value="relaxed">Relaxed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg text-slate-800">Profile Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Full Name</label>
                            <Input value={data.fullName} onChange={e => setData({...data, fullName: e.target.value})} className="font-bold text-lg bg-white border-slate-200" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Target Role</label>
                            <Input value={data.roleTitle} onChange={e => setData({...data, roleTitle: e.target.value})} className="text-blue-600 font-medium bg-white border-slate-200" />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-500 uppercase block">Contact Info & Socials</label>
                        {data.socials.map((social, idx) => (
                            <div key={social.id} className="flex gap-2 items-center group">
                                <div className="relative">
                                    <button 
                                        onClick={() => setIconPickerIdx(idx)}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg transition-colors border border-slate-200"
                                    >
                                        <i className={social.icon || 'fas fa-link'}></i>
                                    </button>
                                    {iconPickerIdx === idx && (
                                        <IconPicker 
                                            onSelect={(icon) => { updateSocial(idx, 'icon', icon); setIconPickerIdx(null); }}
                                            onClose={() => setIconPickerIdx(null)}
                                        />
                                    )}
                                </div>
                                <select 
                                    value={social.platform}
                                    onChange={e => updateSocial(idx, 'platform', e.target.value)}
                                    className="w-28 shrink-0 text-sm text-slate-600 font-medium bg-white px-2 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-400 transition-colors"
                                >
                                    <option value="Phone">Phone</option>
                                    <option value="Email">Email</option>
                                    <option value="Location">Location</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="GitHub">GitHub</option>
                                    <option value="Portfolio">Portfolio</option>
                                    <option value="Other">Other</option>
                                </select>
                                <Input value={social.value} onChange={e => updateSocial(idx, 'value', e.target.value)} placeholder="Value" className="bg-white border-slate-200" />
                                <Input value={social.url || ''} onChange={e => updateSocial(idx, 'url', e.target.value)} placeholder="URL (Optional)" className="text-blue-500 bg-white border-slate-200" />
                                <IconButton icon={<i className="fas fa-trash"></i>} onClick={() => { const newSocials = data.socials.filter((_, i) => i !== idx); setData({...data, socials: newSocials}); }} className="text-red-300 hover:text-red-500" />
                            </div>
                        ))}
                        <button onClick={() => setData({...data, socials: [...data.socials, { id: Date.now().toString(), platform: 'Other', icon: 'fas fa-link', value: '' }]})} className="text-xs text-blue-600 font-semibold hover:bg-blue-50 px-2 py-1 rounded">
                            + Add Social
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-bold text-lg text-slate-800">Resume Sections</h2>
                        <button onClick={handleGenerateSummary} className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1">
                            <i className="fas fa-magic"></i> Auto-Gen Summary
                        </button>
                    </div>
                    {data.sections.map((section, index) => (
                        <SectionEditor 
                            key={section.id} 
                            section={section} 
                            onUpdate={(updated) => handleUpdateSection(index, updated)}
                            onDelete={() => handleDeleteSection(section.id)}
                            onMoveUp={() => handleMoveSection(index, -1)}
                            onMoveDown={() => handleMoveSection(index, 1)}
                        />
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Add Section</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button onClick={() => handleAddSection('experience')} className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-xl text-sm font-medium transition-all shadow-sm"><i className="fas fa-briefcase mr-2 opacity-50"></i> Experience</button>
                        <button onClick={() => handleAddSection('education')} className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-xl text-sm font-medium transition-all shadow-sm"><i className="fas fa-graduation-cap mr-2 opacity-50"></i> Education</button>
                        <button onClick={() => handleAddSection('projects')} className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-xl text-sm font-medium transition-all shadow-sm"><i className="fas fa-code mr-2 opacity-50"></i> Projects</button>
                        <button onClick={() => handleAddSection('skills')} className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-xl text-sm font-medium transition-all shadow-sm"><i className="fas fa-tools mr-2 opacity-50"></i> Skills</button>
                        <button onClick={() => handleAddSection('summary')} className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-xl text-sm font-medium transition-all shadow-sm"><i className="fas fa-align-left mr-2 opacity-50"></i> Summary</button>
                        <button onClick={() => handleAddSection('additional')} className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-xl text-sm font-medium transition-all shadow-sm"><i className="fas fa-plus-circle mr-2 opacity-50"></i> Additional</button>
                        <button onClick={() => handleAddSection('custom')} className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-xl text-sm font-medium transition-all shadow-sm"><i className="fas fa-layer-group mr-2 opacity-50"></i> Custom</button>
                    </div>
                </div>
                <div className="h-20"></div>
            </div>
        </div>

        <div className={`flex-1 bg-slate-200/50 p-8 overflow-y-auto ${activeTab === 'editor' ? 'hidden' : 'block'} print:block print:p-0 print:bg-white print:overflow-visible w-full`}>
             {activeTab === 'code' ? (
                 <div className="bg-slate-900 text-slate-100 p-6 rounded-xl shadow-inner font-mono text-sm whitespace-pre-wrap h-full overflow-auto custom-scrollbar">
                    {latexCode}
                 </div>
             ) : (
                <LivePreview data={data} />
             )}
        </div>
      </div>
    </div>
  );
}
