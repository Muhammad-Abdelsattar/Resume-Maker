
import { ResumeData, ResumeSection, ExperienceSection, ProjectSection, SkillsSection, SummarySection, CustomSection } from '../types';
import { htmlToLatex } from '../utils/formatting';

export const generateLatex = (data: ResumeData): string => {
  const { settings } = data;
  
  // Calculate margins based on settings
  let marginSize = '0.5in'; // standard
  if (settings.documentMargin === 'compact') marginSize = '0.3in';
  if (settings.documentMargin === 'relaxed') marginSize = '0.75in';

  // Font package
  let fontPackage = '\\usepackage[scaled]{helvet} \n\\renewcommand\\familydefault{\\sfdefault}';
  if (settings.fontFamily === 'serif') {
    fontPackage = ''; // Default LaTeX is Computer Modern Serif
  } else if (settings.fontFamily === 'mono') {
    fontPackage = '\\usepackage{courier}';
  }

  // Line spacing
  let lineSpread = '1.0';
  if (settings.lineHeight === 'compact') lineSpread = '0.85';
  else if (settings.lineHeight === 'relaxed') lineSpread = '1.25';
  else lineSpread = '1.05'; // Standard

  const hexToRgb = (hex: string) => {
    // Remove # if present
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };
  
  const generateSocials = () => {
    return `${data.socials.map(s => {
      let icon = '';
      if (s.platform === 'Phone') icon = '\\faPhone';
      else if (s.platform === 'Email') icon = '\\faEnvelope';
      else if (s.platform === 'Location') icon = '\\faMapMarker*';
      else if (s.platform === 'LinkedIn') icon = '\\faLinkedin';
      else if (s.platform === 'GitHub') icon = '\\faGithub';
      else if (s.platform === 'Portfolio') icon = '\\faGlobe';
      else icon = '\\faLink'; 
      
      let text = s.value;
      if (s.url) {
        text = `\\href{${s.url}}{${s.value}}`;
      }
      
      return `${icon} \\hspace{1pt} ${text}`;
    }).join(' \\hspace{1pt} \\textbf{$|$} \\hspace{1pt} \n    ')}`;
  };

  const generateSummary = (section: SummarySection) => {
    return `
%----------${section.title.toUpperCase()}----------
\\section{${section.title}}
\\small ${htmlToLatex(section.content)}
`;
  };

  const generateExperience = (section: ExperienceSection) => {
    const items = section.items.map(item => {
      const bullets = item.bullets && item.bullets.length > 0 
        ? `\\resumeItemListStart
        ${item.bullets.map(b => `\\resumeItem{${htmlToLatex(b)}}`).join('\n        ')}
      \\resumeItemListEnd` 
        : '';
      
      const desc = item.description ? `\\resumeItem{${htmlToLatex(item.description)}}` : '';
      const listContent = (desc || bullets) ? `
      \\resumeItemListStart
        ${desc}
        ${item.bullets.map(b => `\\resumeItem{${htmlToLatex(b)}}`).join('\n        ')}
      \\resumeItemListEnd` : '';
      
      return `
    \\resumeSubheading
      {${htmlToLatex(item.title)}}{${htmlToLatex(item.date)}}
      {${htmlToLatex(item.subtitle)}}{${htmlToLatex(item.location)}}
      ${listContent}`;
    }).join('');

    return `
%-----------${section.title.toUpperCase()}-----------
\\section{${section.title}}
  \\resumeSubHeadingListStart
    ${items}
  \\resumeSubHeadingListEnd
`;
  };

  const generateProjects = (section: ProjectSection) => {
    const items = section.items.map(proj => {
      // Build dynamic links
      const linkLatex = proj.links.map(l => {
         let icon = '\\faLink';
         if(l.label.toLowerCase().includes('github') || l.label.toLowerCase().includes('code')) icon = '\\faGithub';
         if(l.label.toLowerCase().includes('demo') || l.label.toLowerCase().includes('live')) icon = '\\faExternalLink*';
         if(l.label.toLowerCase().includes('video') || l.label.toLowerCase().includes('youtube')) icon = '\\faYoutube';
         
         return `\\href{${l.url}}{${icon} ${l.label}}`;
      }).join(' \\hspace{8px} $|$ \\hspace{8px} ');

      const linkPart = linkLatex ? `\\hspace{8px} $|$ \\hspace{8px} ${linkLatex}` : '';

      return `
\\resumeProject
  {\\normalsize \\textbf{${htmlToLatex(proj.title)}} ${linkPart}}
  {}
  {${htmlToLatex(proj.skills)}}
  {${htmlToLatex(proj.tools)}}
  {
    ${proj.bullets.map(b => `\\item ${htmlToLatex(b)}`).join('\n    ')}
  }`;
    }).join('\n');

    return `
%-----------${section.title.toUpperCase()}-----------
\\section{${section.title}}
\\begin{itemize}[leftmargin=0.05in, label={}]
${items}
\\end{itemize}
`;
  };

  const generateSkills = (section: SkillsSection) => {
    const items = section.items.map(cat => 
      `  ${htmlToLatex(cat.category)} & ${htmlToLatex(cat.items)} \\\\`
    ).join('\n');

    return `
%-----------${section.title.toUpperCase()}-----------
\\section{${section.title}}
{
\\renewcommand{\\arraystretch}{1.1} 
\\begin{tabular}{ @{} >{\\bfseries}l @{\\hspace{4ex}} l }
${items}
\\end{tabular}
}
`;
  };

  const generateCustom = (section: CustomSection) => {
    const items = section.items.map(row => {
      
      // Calculate latex tabular structure
      // Format: \begin{tabular*}{\textwidth}{p{0.2\textwidth} p{0.8\textwidth}} ...
      
      if(row.columns.length === 0) return '';

      // Normalize widths to ensure they don't break page (slight reduction for padding)
      const totalWidth = row.columns.reduce((sum, col) => sum + col.width, 0);
      const definitions = row.columns.map(col => {
         // p{width} column type. Alignments need manual adjustment or array package, 
         // but basic p{} is justified/left. For explicit align, we use ragged right inside.
         const ratio = (col.width / 100) * 0.98; // 0.98 to fit textwidth safely
         return `p{${ratio.toFixed(2)}\\textwidth}`;
      }).join('');

      const cells = row.columns.map(col => {
         const content = htmlToLatex(col.content);
         if (col.alignment === 'right') return `\\raggedleft ${content}`;
         if (col.alignment === 'center') return `\\centering ${content}`;
         return `\\raggedright ${content}`;
      }).join(' & ');

      const tabular = `
      \\begin{tabular}{${definitions}}
         ${cells}
      \\end{tabular}
      `;

      if (row.hasBullet) {
        return `\\item ${tabular}`;
      } else {
        return `\\item[] ${tabular} \\vspace{2pt}`;
      }
    }).join('\n');

    return `
%-----------${section.title.toUpperCase()}-----------
\\section{${section.title}}
  \\resumeSubHeadingListStart
    ${items}
  \\resumeSubHeadingListEnd
    `;
  }

  const sectionsLatex = data.sections.map(section => {
    switch (section.type) {
      case 'summary': return generateSummary(section as SummarySection);
      case 'education':
      case 'experience': return generateExperience(section as ExperienceSection);
      case 'projects': return generateProjects(section as ProjectSection);
      case 'skills': return generateSkills(section as SkillsSection);
      case 'custom': return generateCustom(section as CustomSection);
      default: return '';
    }
  }).join('\n');

  // Generate Footer (Additional Info)
  const footerLatex = data.additionalInfo.length > 0 ? `
\\section{Additional}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     ${data.additionalInfo.map(info => htmlToLatex(info.content)).join(' \\hspace{15pt} \\textbf{$|$} \\hspace{15pt} ')}
    }}
 \\end{itemize}
  ` : '';

  return `%-----------------------------------------------------------------------------------------------------------------------------------------------%
%	Generated by ResuMake
%-----------------------------------------------------------------------------------------------------------------------------------------------%

\\documentclass[letterpaper,${settings.fontSize}]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{multicol}
${fontPackage}

%----------------------------------------------------------------------------------------
%	CUSTOM COLORS & SETTINGS
%----------------------------------------------------------------------------------------
\\definecolor{mainblue}{RGB}{${hexToRgb(settings.themeColor)}} 
\\definecolor{darkGrey}{RGB}{50, 50, 50}

\\pagestyle{fancy}
\\fancyhf{} 
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins based on settings
\\addtolength{\\oddsidemargin}{-${marginSize}}
\\addtolength{\\evensidemargin}{-${marginSize}}
\\addtolength{\\textwidth}{${parseFloat(marginSize) * 2 + 0.2}in}
\\addtolength{\\topmargin}{-${marginSize}}
\\addtolength{\\textheight}{${parseFloat(marginSize) * 2 + 0.1}in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Line spacing
\\linespread{${lineSpread}}

% Sections formatting
\\titlespacing{\\section}{0pt}{10pt}{12pt}
\\titleformat{\\section}{
  \\vspace{-8pt}\\scshape\\raggedright\\Large\\bfseries\\color{mainblue}
}{}{0em}{}[\\color{mainblue}\\titlerule \\vspace{-8pt}]

%----------------------------------------------------------------------------------------
%	CUSTOM COMMANDS
%----------------------------------------------------------------------------------------

% Education/Job Entry
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.98\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      #3 & #4 \\\\
    \\end{tabular*}\\vspace{-5pt}
}

% PROJECT COMMAND (Fixed Logic)
\\newcommand{\\resumeProjectHeading}[5]{
    \\item
    \\begin{tabular*}{0.98\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & 
      \\href{#4}{\\faGithub\\ Source Code}
      \\if\\relax\\detokenize{#5}\\relax\\else
         \\hspace{3pt} \\textbf{$|$} \\hspace{5pt} \\href{#5}{\\faExternalLink*\\ Live Demo}
      \\fi \\\\
    \\end{tabular*}
    \\vspace{0pt}
    \\begin{itemize}[leftmargin=0.05in, label={}]
        \\small\\item \\textbf{Skills:} #2 \\\\ \\textbf{Tools \\& Tech:} #3
    \\end{itemize}
    \\vspace{2pt}
}

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

% Custom command for Projects to save space but keep details
\\newcommand{\\resumeProject}[5]{
  \\item
  % Line 1: Title and Link
  {#1} 
  \\vspace{3pt} % Reduce space between Title and Skills columns
  \\\\
  % Line 2: The Two Columns (Skills Left, Tools Right)
  \\begin{minipage}[t]{0.40\\textwidth} % Narrower for Skills
    \\raggedright
    \\textbf{Skills:} #3
  \\end{minipage}%
  \\hfill % Pushes the next column to the right
  \\begin{minipage}[t]{0.58\\textwidth} % Wider for Tools list
    \\raggedright
    \\textbf{Tools:} #4
  \\end{minipage}
  \\vspace{0pt} % Reduce space between Tools and Bullets
  % Line 3: Bullet Points
  \\begin{itemize}[leftmargin=0.15in, label=\\textbullet, noitemsep, topsep=0pt]
    #5
  \\end{itemize}

  \\vspace{4pt}
}


% Define custom list environment for bullet points
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.05in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.15in, label=\\textbullet]} % Forced Bullet
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-2pt}}

%----------------------------------------------------------------------------------------
%	DOCUMENT START
%----------------------------------------------------------------------------------------
\\begin{document}

%----------HEADER----------
\\begin{center}
    {\\huge \\textbf{${data.fullName}} \\textbf{$|$} \\Large \\color{darkGrey} ${data.roleTitle}} \\\\ \\vspace{3pt}
    ${generateSocials()}
   
\\end{center}

\\vspace{2pt}

${sectionsLatex}

${footerLatex}

\\end{document}
`;
};
