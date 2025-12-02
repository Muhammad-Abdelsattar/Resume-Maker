
import { ResumeData } from '../types';
import { htmlToLatex } from '../utils/formatting';

export const generateLatex = (data: ResumeData): string => {
  const { settings } = data;
  
  // Calculate margins based on settings
  let marginSize = '0.5in'; // standard
  if (settings.documentMargin === 'compact') marginSize = '0.3in';
  if (settings.documentMargin === 'relaxed') marginSize = '0.75in';

  // Font package
  let fontPackage = '\\usepackage[scaled]{helvet} \n\\renewcommand\\familydefault{\\sfdefault}';
  if (settings.fontFamily === 'Garamond' || settings.fontFamily === 'Georgia' || settings.fontFamily === 'Times') {
    fontPackage = ''; 
    if (settings.fontFamily === 'Times') fontPackage = '\\usepackage{mathptmx}';
  } 
  else if (settings.fontFamily === 'Courier') {
    fontPackage = '\\usepackage{courier} \n\\renewcommand\\familydefault{\\ttdefault}';
  }

  // Line spacing
  let lineSpread = '1.0';
  if (settings.lineHeight === 'compact') lineSpread = '0.85';
  else if (settings.lineHeight === 'relaxed') lineSpread = '1.25';
  else lineSpread = '1.05';

  const hexToRgb = (hex: string) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };
  
  // Helper to extract fa icon name for latex
  const getIconCommand = (iconClass: string) => {
      if(!iconClass) return '\\faLink';
      // extract name: "fab fa-github" -> "github"
      const match = iconClass.match(/fa-([^ ]+)/);
      if(match && match[1]) {
          return `\\faIcon{${match[1]}}`;
      }
      return '\\faLink';
  };

  const generateSocials = () => {
    return data.socials.map(s => {
      let icon = getIconCommand(s.icon);
      let text = htmlToLatex(s.value);
      if (s.url) {
        text = `\\href{${s.url}}{${text}}`;
      }
      return `${icon} \\hspace{1mm} ${text}`;
    }).join(' \\quad|\\quad ');
  };

  const sectionsLatex = data.sections.map(section => {
    let content = '';
    const title = `\\section{${section.title.toUpperCase()}}`;

    if (section.type === 'summary') {
      content = htmlToLatex((section as any).content);
    } 
    else if (section.type === 'experience' || section.type === 'education') {
      content = (section as any).items.map((item: any) => {
        let latex = `\\resumeSubheading\n{${htmlToLatex(item.title)}}{${htmlToLatex(item.date)}}\n{${htmlToLatex(item.subtitle)}}{${htmlToLatex(item.location)}}\n`;
        if (item.description) latex += `\\small{${htmlToLatex(item.description)}} \\vspace{1mm}\n`;
        if (item.bullets && item.bullets.length > 0) {
           latex += `\\resumeItemListStart\n`;
           item.bullets.forEach((b: string) => latex += `\\resumeItem{${htmlToLatex(b)}}\n`);
           latex += `\\resumeItemListEnd\n`;
        }
        return latex;
      }).join('');
    }
    else if (section.type === 'projects') {
      content = (section as any).items.map((item: any) => {
        let titleLine = `\\textbf{${htmlToLatex(item.title)}}`;
        if (item.links && item.links.length > 0) {
            item.links.forEach((l: any) => {
                const icon = getIconCommand(l.icon);
                titleLine += ` $|$ \\href{${l.url}}{\\small{${icon} ${htmlToLatex(l.label)}}}`;
            });
        }
        let latex = `\\resumeProjectHeading\n{${titleLine}}{}\n`;
        if(item.skills || item.tools) {
            latex += `\\small{`;
            if(item.skills) latex += `\\textbf{Skills:} ${htmlToLatex(item.skills)} `;
            if(item.skills && item.tools) latex += `\\hfill `;
            if(item.tools) latex += `\\textbf{Tools:} ${htmlToLatex(item.tools)}`;
            latex += `} \\vspace{-5pt}\n`;
        }
        if (item.bullets && item.bullets.length > 0) {
           latex += `\\resumeItemListStart\n`;
           item.bullets.forEach((b: string) => latex += `\\resumeItem{${htmlToLatex(b)}}\n`);
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
       content = (section as any).items.map((row: any) => {
          let rowLatex = row.hasBullet ? `\\resumeItemListStart\n\\item ` : `\\noindent `;
          const cols = row.columns.map((col: any) => {
             let text = htmlToLatex(col.content);
             return `\\begin{minipage}[t]{${(col.width/100) - 0.02}\\textwidth}\n${col.alignment === 'center' ? '\\centering ' : col.alignment === 'right' ? '\\raggedleft ' : ''}${text}\n\\end{minipage}`;
          }).join('\\hfill ');
          rowLatex += cols;
          rowLatex += row.hasBullet ? `\\resumeItemListEnd\n` : `\\\\\n`;
          return rowLatex;
       }).join('');
    }
    else if (section.type === 'additional') {
       content = `\\begin{center}\n\\small\n`;
       content += (section as any).items.map((info: any) => htmlToLatex(info.content)).join(' $\\mid$ ');
       content += `\n\\end{center}`;
    }

    return `${title}\n${content}`;
  }).join('\n\n');

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
\\usepackage[margin=${marginSize}]{geometry}
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

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\color{RGB}{${hexToRgb(settings.themeColor)}}
}{}{0em}{}[\\color{RGB}{${hexToRgb(settings.themeColor)}}\\titlerule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{\\item\\small{{#1 \\vspace{-2pt}}}}
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
\\begin{center}
    \\textbf{\\Huge \\scshape ${htmlToLatex(data.fullName)}} \\\\ \\vspace{1pt}
    \\small \\color{gray} ${htmlToLatex(data.roleTitle)} \\\\ \\vspace{4pt}
    \\small ${generateSocials()}
\\end{center}

${sectionsLatex}

\\end{document}
  `;
};
