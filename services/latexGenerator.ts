import { ResumeData } from '../types';
import { htmlToLatex } from '../utils/formatting';

export const generateLatex = (data: ResumeData): string => {
  const { settings } = data;
  
  // Calculate margins based on settings
  let marginSize = '0.5in'; // standard
  if (settings.documentMargin === 'compact') marginSize = '0.3in';
  if (settings.documentMargin === 'relaxed') marginSize = '0.75in';

  // Font package
  // Default to Helvetica (Sans-Serif) which covers Arial, Verdana, Roboto
  let fontPackage = '\\usepackage[scaled]{helvet} \n\\renewcommand\\familydefault{\\sfdefault}';
  
  // Handle Serif Fonts
  // Explicitly check specific serif font names defined in types.ts
  if (settings.fontFamily === 'Garamond' || settings.fontFamily === 'Georgia' || settings.fontFamily === 'Times') {
    fontPackage = ''; // Default LaTeX is Computer Modern Serif
    if (settings.fontFamily === 'Times') {
       fontPackage = '\\usepackage{mathptmx}';
    }
  } 
  // Handle Monospace
  else if (settings.fontFamily === 'Courier') {
    fontPackage = '\\usepackage{courier} \n\\renewcommand\\familydefault{\\ttdefault}';
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
    return data.socials.map(s => {
      let icon = '';
      if (s.platform === 'Phone') icon = '\\faPhone';
      else if (s.platform === 'Email') icon = '\\faEnvelope';
      else if (s.platform === 'Location') icon = '\\faMapMarker*';
      else if (s.platform === 'LinkedIn') icon = '\\faLinkedin';
      else if (s.platform === 'GitHub') icon = '\\faGithub';
      else if (s.platform === 'Portfolio') icon = '\\faGlobe';
      else icon = '\\faLink'; 
      
      let text = htmlToLatex(s.value);
      if (s.url) {
        text = `\\href{${s.url}}{${text}}`;
      }
      
      return `${icon} \\hspace{1mm} ${text}`;
    }).join(' \\quad|\\quad ');
  };

  const sectionsLatex = data.sections.map(section => {
    let content = '';
    
    // Section Title
    const title = `\\section{${section.title.toUpperCase()}}`;

    if (section.type === 'summary') {
      content = htmlToLatex((section as any).content);
    } 
    else if (section.type === 'experience' || section.type === 'education') {
      content = (section as any).items.map((item: any) => {
        let latex = `\\resumeSubheading\n{${htmlToLatex(item.title)}}{${htmlToLatex(item.date)}}\n{${htmlToLatex(item.subtitle)}}{${htmlToLatex(item.location)}}\n`;
        
        if (item.description) {
            latex += `\\small{${htmlToLatex(item.description)}} \\vspace{1mm}\n`;
        }
        
        if (item.bullets && item.bullets.length > 0) {
           latex += `\\resumeItemListStart\n`;
           item.bullets.forEach((b: string) => {
               latex += `\\resumeItem{${htmlToLatex(b)}}\n`;
           });
           latex += `\\resumeItemListEnd\n`;
        }
        return latex;
      }).join('');
    }
    else if (section.type === 'projects') {
      content = (section as any).items.map((item: any) => {
        // Project Title + Links
        let titleLine = `\\textbf{${htmlToLatex(item.title)}}`;
        if (item.links && item.links.length > 0) {
            item.links.forEach((l: any) => {
                titleLine += ` $|$ \\href{${l.url}}{\\small{${htmlToLatex(l.label)}}}`;
            });
        }
        
        let latex = `\\resumeProjectHeading\n{${titleLine}}{}\n`;
        
        // Skills & Tools
        if(item.skills || item.tools) {
            latex += `\\small{`;
            if(item.skills) latex += `\\textbf{Skills:} ${htmlToLatex(item.skills)} `;
            if(item.skills && item.tools) latex += `\\hfill `;
            if(item.tools) latex += `\\textbf{Tools:} ${htmlToLatex(item.tools)}`;
            latex += `} \\vspace{-5pt}\n`;
        }
        
        if (item.bullets && item.bullets.length > 0) {
           latex += `\\resumeItemListStart\n`;
           item.bullets.forEach((b: string) => {
               latex += `\\resumeItem{${htmlToLatex(b)}}\n`;
           });
           latex += `\\resumeItemListEnd\n`;
        }
        return latex;
      }).join('');
    }
    else if (section.type === 'skills') {
      content = `\\begin{itemize}[leftmargin=0.15in, label={}]\n\\small{\item\n`;
      content += (section as any).items.map((item: any) => {
        return `\\textbf{${htmlToLatex(item.category)}:}{ ${htmlToLatex(item.items)}} \\\\ \n`;
      }).join('');
      content += `}\n\\end{itemize}`;
    }
    else if (section.type === 'custom') {
       // Custom Grid Layout
       content = (section as any).items.map((row: any) => {
          let rowLatex = '';
          
          if(row.hasBullet) {
              rowLatex += `\\resumeItemListStart\n\\item `;
          } else {
              rowLatex += `\\noindent `;
          }
          
          const cols = row.columns.map((col: any) => {
             let text = htmlToLatex(col.content);
             // Basic formatting for columns in tabular-like structure or minipage
             // For simplicity in this template, we use minipages to allow wrapping text in columns
             return `\\begin{minipage}[t]{${(col.width/100) - 0.02}\\textwidth}\n${col.alignment === 'center' ? '\\centering ' : col.alignment === 'right' ? '\\raggedleft ' : ''}${text}\n\\end{minipage}`;
          }).join('\\hfill ');
          
          rowLatex += cols;
          
          if(row.hasBullet) {
              rowLatex += `\\resumeItemListEnd\n`;
          } else {
              rowLatex += `\\\\\n`;
          }
          return rowLatex;
       }).join('');
    }

    return `${title}\n${content}`;
  }).join('\n\n');
  
  // Footer
  let footer = '';
  if (data.additionalInfo.length > 0) {
      footer = `\\section{ADDITIONAL}\n\\begin{center}\n\\small\n`;
      footer += data.additionalInfo.map((info) => htmlToLatex(info.content)).join(' $\\mid$ ');
      footer += `\n\\end{center}`;
  }

  return `
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

\\input{glyphtounicode}

% Margins
\\usepackage[margin=${marginSize}]{geometry}

% Spacing
\\linespread{${lineSpread}}

\\pagestyle{fancy}
\\fancyhf{} 
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\color{RGB}{${hexToRgb(settings.themeColor)}}
}{}{0em}{}[\\color{RGB}{${hexToRgb(settings.themeColor)}}\\titlerule \\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

% Header
\\begin{center}
    \\textbf{\\Huge \\scshape ${htmlToLatex(data.fullName)}} \\\\ \\vspace{1pt}
    \\small \\color{gray} ${htmlToLatex(data.roleTitle)} \\\\ \\vspace{4pt}
    \\small ${generateSocials()}
\\end{center}

${sectionsLatex}

${footer}

\\end{document}
  `;
};