
import React from 'react';
import { ResumeData, ResumeSection, ExperienceSection, ProjectSection, SkillsSection, SummarySection, CustomSection } from '../types';

// Helper to render HTML content safely
// Since our input is controlled via RichInput, we trust it slightly, but in production use DOMPurify
const RichText = ({ content, className = "" }: { content: string, className?: string }) => {
    if (!content) return null;
    return <span className={className} dangerouslySetInnerHTML={{ __html: content }} />;
};

const SectionHeader = ({ title, color }: { title: string, color: string }) => (
  <div className="border-b-2 mb-3 mt-4 pb-1" style={{ borderColor: color }}>
    <h2 className="font-bold text-lg uppercase tracking-wider" style={{ color: color }}>{title}</h2>
  </div>
);

export const LivePreview = ({ data }: { data: ResumeData }) => {
  const { sections, settings } = data;

  // Dynamic styles based on settings
  const containerStyle = {
    fontFamily: settings.fontFamily === 'serif' ? 'Times New Roman, serif' : 
                settings.fontFamily === 'mono' ? 'Courier New, monospace' : 
                'Inter, sans-serif',
    fontSize: settings.fontSize === '10pt' ? '13px' : 
              settings.fontSize === '12pt' ? '15px' : '14px',
    padding: settings.documentMargin === 'compact' ? '30px' : 
             settings.documentMargin === 'relaxed' ? '60px' : '45px',
    lineHeight: settings.lineHeight === 'compact' ? '1.35' : 
                settings.lineHeight === 'relaxed' ? '1.8' : '1.6',
    color: '#333'
  };

  const linkColor = settings.themeColor;

  const renderSocials = () => {
    return (
      <div className="flex flex-wrap justify-center items-center gap-3 text-sm mb-2" style={{ color: '#444' }}>
        {data.socials.map((s, idx) => {
          let iconClass = 'fas fa-link';
          if (s.platform === 'Phone') iconClass = 'fas fa-phone';
          else if (s.platform === 'Email') iconClass = 'fas fa-envelope';
          else if (s.platform === 'Location') iconClass = 'fas fa-map-marker-alt';
          else if (s.platform === 'LinkedIn') iconClass = 'fab fa-linkedin';
          else if (s.platform === 'GitHub') iconClass = 'fab fa-github';
          else if (s.platform === 'Portfolio') iconClass = 'fas fa-globe';
          
          return (
            <React.Fragment key={s.id}>
              {idx > 0 && <span className="font-bold text-gray-400">|</span>}
              <div className="flex items-center gap-1.5">
                <i className={`${iconClass}`} style={{ color: '#333' }}></i>
                <span style={{ color: '#333' }}>
                  {s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: 'inherit' }}>{s.value}</a> : s.value}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderExperience = (section: ExperienceSection) => (
    <div className="space-y-3">
      {section.items.map(item => (
        <div key={item.id}>
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-base" style={{ color: '#000' }}><RichText content={item.title} /></h3>
            <span className="text-sm font-medium" style={{ color: '#444' }}><RichText content={item.date} /></span>
          </div>
          <div className="flex justify-between items-baseline mb-1">
             <div className="italic" style={{ color: '#333' }}><RichText content={item.subtitle} /></div>
             <div className="text-sm italic" style={{ color: '#444' }}><RichText content={item.location} /></div>
          </div>
          <div className="text-sm pl-2" style={{ color: '#333' }}>
            {item.description && <div className="mb-1"><RichText content={item.description} /></div>}
            {item.bullets.length > 0 && (
              <ul className="list-disc ml-4 space-y-0.5 marker:text-gray-500">
                {item.bullets.map((b, idx) => (
                  <li key={idx} className="pl-1"><RichText content={b} /></li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderProjects = (section: ProjectSection) => (
    <div className="space-y-4">
      {section.items.map(item => (
        <div key={item.id}>
          <div className="flex justify-between items-baseline mb-1">
             <div className="font-bold text-base flex items-center gap-2">
                <RichText content={item.title} />
                {item.links && item.links.length > 0 && (
                   <span className="flex items-center text-sm font-normal text-gray-500">
                      {item.links.map(l => (
                          <React.Fragment key={l.id}>
                             <span className="mx-2">|</span>
                             <a href={l.url} className="hover:underline flex items-center gap-1" style={{ color: linkColor }}>
                                <i className="fas fa-external-link-alt text-xs"></i> {l.label}
                             </a>
                          </React.Fragment>
                      ))}
                   </span>
                )}
             </div>
          </div>
          
          <div className="flex text-sm mb-1 gap-8">
             <div className="flex-1 max-w-[40%]">
                <span className="font-bold">Skills:</span> <RichText content={item.skills} />
             </div>
             <div className="flex-1">
                <span className="font-bold">Tools:</span> <RichText content={item.tools} />
             </div>
          </div>

          <ul className="list-disc ml-6 text-sm space-y-0.5 marker:text-gray-500" style={{ color: '#333' }}>
            {item.bullets.map((b, idx) => (
              <li key={idx} className="pl-1"><RichText content={b} /></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderSkills = (section: SkillsSection) => (
    <table className="w-full text-sm border-separate border-spacing-y-1" style={{ color: '#333' }}>
      <tbody>
        {section.items.map(item => (
           <tr key={item.id}>
             <td className="font-bold pr-4 align-top whitespace-nowrap w-1"><RichText content={item.category} /></td>
             <td className="align-top"><RichText content={item.items} /></td>
           </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCustom = (section: CustomSection) => (
    <div className="space-y-1">
       {section.items.map(row => (
         <div key={row.id} className={`flex ${row.hasBullet ? 'gap-2' : ''} items-start`}>
            {row.hasBullet && <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0"></div>}
            <div className="flex-1 flex w-full">
               {row.columns.map(col => (
                  <div 
                    key={col.id} 
                    style={{ 
                        width: `${col.width}%`, 
                        textAlign: col.alignment,
                        paddingRight: '8px'
                    }}
                  >
                     <RichText content={col.content} />
                  </div>
               ))}
            </div>
         </div>
       ))}
    </div>
  );

  return (
    <div id="resume-preview" className="print:w-full print:absolute print:top-0 print:left-0 print:m-0 print:p-0">
      <div className="bg-white shadow-2xl max-w-[850px] mx-auto min-h-[1100px] selection:bg-blue-100 selection:text-blue-900 transition-all duration-300 print:shadow-none print:max-w-none print:w-full print:h-auto" style={containerStyle}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#000' }}>{data.fullName} <span className="text-gray-400 mx-2">|</span> <span className="text-xl font-normal" style={{ color: '#444' }}>{data.roleTitle}</span></h1>
          {renderSocials()}
        </div>

        {/* Dynamic Sections */}
        {sections.map(section => (
          <div key={section.id}>
            <SectionHeader title={section.title} color={settings.themeColor} />
            
            {section.type === 'summary' && (
              <div className="text-sm" style={{ color: '#333' }}><RichText content={(section as SummarySection).content} /></div>
            )}

            {(section.type === 'experience' || section.type === 'education') && renderExperience(section as ExperienceSection)}
            
            {section.type === 'projects' && renderProjects(section as ProjectSection)}
            
            {section.type === 'skills' && renderSkills(section as SkillsSection)}

            {section.type === 'custom' && renderCustom(section as CustomSection)}
          </div>
        ))}

        {/* Footer / Languages */}
        {data.additionalInfo.length > 0 && (
            <>
                <SectionHeader title="Additional" color={settings.themeColor} />
                <div className="text-sm pl-4 flex flex-wrap gap-6 justify-center" style={{ color: '#333' }}>
                    {data.additionalInfo.map((info, idx) => (
                        <div key={info.id} className="flex items-center gap-2">
                             {idx > 0 && <span className="text-gray-300 font-bold">|</span>}
                             <RichText content={info.content} />
                        </div>
                    ))}
                </div>
            </>
        )}

      </div>
    </div>
  );
};
