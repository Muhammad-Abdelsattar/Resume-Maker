
import { ResumeData, ExperienceSection, ProjectSection, SkillsSection, SummarySection, CustomSection, AdditionalSection } from '../types';

declare var pdfMake: any;

// Helper: Parse HTML-like rich text into PDFMake styled text array
const parseRichText = (html: string, baseStyle: any = {}): any[] => {
  if (!html) return [];
  
  // Clean newlines
  const cleanHtml = html.replace(/<br\s*\/?>/gi, '\n');
  
  // Regex to capture tags and text. 
  // Supports <b>, <strong>, <i>, <em>, <a>
  const regex = /<(b|strong)>(.*?)<\/\1>|<(i|em)>(.*?)<\/\3>|<a\s+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/g;
  
  const parts: any[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(cleanHtml)) !== null) {
    // Add text before the tag
    if (match.index > lastIndex) {
      parts.push({ text: cleanHtml.substring(lastIndex, match.index), ...baseStyle });
    }

    if (match[1]) { // Bold
      parts.push({ text: match[2], bold: true, ...baseStyle });
    } else if (match[3]) { // Italic
      parts.push({ text: match[4], italics: true, ...baseStyle });
    } else if (match[6]) { // Link
      parts.push({ 
        text: match[6], 
        link: match[5], 
        color: 'blue', 
        decoration: 'underline', 
        ...baseStyle 
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < cleanHtml.length) {
    parts.push({ text: cleanHtml.substring(lastIndex), ...baseStyle });
  }

  return parts.length > 0 ? parts : [{ text: cleanHtml, ...baseStyle }];
};

export const generatePdf = (data: ResumeData) => {
  const { settings } = data;

  // --- 1. Style Mapping (Matching LivePreview.tsx) ---
  
  // Margins
  let pageMargins: [number, number, number, number] = [40, 40, 40, 40]; // Standard
  if (settings.documentMargin === 'compact') pageMargins = [25, 25, 25, 25];
  if (settings.documentMargin === 'relaxed') pageMargins = [60, 60, 60, 60];

  // Font Sizes
  const fontSizeMap = {
    '10pt': { base: 10, title: 20, role: 12, section: 11, small: 9 },
    '11pt': { base: 11, title: 24, role: 14, section: 12, small: 10 },
    '12pt': { base: 12, title: 26, role: 16, section: 13, small: 11 },
  };
  const sizes = fontSizeMap[settings.fontSize];

  // Line Height
  let lineHeight = 1.2;
  if (settings.lineHeight === 'compact') lineHeight = 1.0;
  if (settings.lineHeight === 'relaxed') lineHeight = 1.5;

  const primaryColor = settings.themeColor;

  const content: any[] = [];

  // --- 2. Header Section ---
  
  // Name
  content.push({
    text: data.fullName,
    style: 'headerName',
    fontSize: sizes.title,
    alignment: 'center',
    margin: [0, 0, 0, 4]
  });

  // Role
  content.push({
    text: data.roleTitle,
    style: 'headerRole',
    fontSize: sizes.role,
    color: '#555555',
    alignment: 'center',
    margin: [0, 0, 0, 8]
  });

  // Socials
  const socialTextParts: any[] = [];
  data.socials.forEach((s, i) => {
    if (i > 0) {
      socialTextParts.push({ text: ' | ', color: '#cbd5e1', bold: true });
    }
    const val = s.value;
    if (s.url) {
      socialTextParts.push({ text: val, link: s.url, color: '#334155' });
    } else {
      socialTextParts.push({ text: val, color: '#334155' });
    }
  });

  content.push({
    text: socialTextParts,
    fontSize: sizes.small,
    alignment: 'center',
    margin: [0, 0, 0, 20]
  });

  // --- 3. Dynamic Sections ---

  data.sections.forEach(section => {
    // Section Header (Title + Line)
    // We use a table to simulate the border-bottom perfectly
    content.push({
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: section.title.toUpperCase(),
              fontSize: sizes.section,
              bold: true,
              color: primaryColor,
              margin: [0, 10, 0, 2], // Spacing before title
              border: [false, false, false, true], // Bottom border only
              borderColor: [null, null, null, primaryColor]
            }
          ]
        ]
      },
      layout: {
        defaultBorder: false,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 2 // Space between text and line
      },
      margin: [0, 0, 0, 8] // Space after line
    });

    // Section Content
    if (section.type === 'summary') {
      const s = section as SummarySection;
      content.push({
        text: parseRichText(s.content, { fontSize: sizes.base, lineHeight }),
        alignment: 'justify',
        margin: [0, 0, 0, 10]
      });
    } 
    else if (section.type === 'experience' || section.type === 'education') {
      const s = section as ExperienceSection;
      s.items.forEach(item => {
        // Row 1: Title (Left) | Date (Right)
        content.push({
          columns: [
            { text: parseRichText(item.title, { bold: true, fontSize: sizes.base }), width: '*', alignment: 'left' },
            { text: parseRichText(item.date, { fontSize: sizes.base }), width: 'auto', alignment: 'right' }
          ],
          columnGap: 10
        });

        // Row 2: Subtitle (Left) | Location (Right)
        content.push({
          columns: [
            { text: parseRichText(item.subtitle, { italics: true, fontSize: sizes.small }), width: '*', alignment: 'left', color: '#333' },
            { text: parseRichText(item.location, { italics: true, fontSize: sizes.small }), width: 'auto', alignment: 'right', color: '#555' }
          ],
          columnGap: 10,
          margin: [0, 1, 0, 2]
        });

        // Description
        if (item.description) {
          content.push({
            text: parseRichText(item.description, { fontSize: sizes.small, lineHeight }),
            margin: [2, 2, 0, 2]
          });
        }

        // Bullets
        if (item.bullets && item.bullets.length > 0) {
          content.push({
            ul: item.bullets.map(b => ({ text: parseRichText(b, { fontSize: sizes.small, lineHeight }) })),
            margin: [12, 2, 0, 8]
          });
        } else {
          content.push({ text: '', margin: [0, 0, 0, 6] });
        }
      });
    } 
    else if (section.type === 'projects') {
      const s = section as ProjectSection;
      s.items.forEach(item => {
        // Title Row with Links
        const titleParts = parseRichText(item.title, { bold: true, fontSize: sizes.base });
        
        if (item.links && item.links.length > 0) {
          item.links.forEach(l => {
             titleParts.push({ text: ' | ', color: '#cbd5e1', fontSize: sizes.small });
             titleParts.push({ 
               text: l.label, 
               link: l.url, 
               color: primaryColor, 
               decoration: 'underline', 
               fontSize: sizes.small 
             });
          });
        }

        content.push({
          text: titleParts,
          margin: [0, 2, 0, 1]
        });

        // Skills & Tools Row
        content.push({
          columns: [
            {
               width: 'auto',
               text: [
                 { text: 'Skills: ', bold: true, fontSize: sizes.small },
                 ...parseRichText(item.skills, { fontSize: sizes.small })
               ],
               margin: [0, 0, 15, 0]
            },
            {
               width: '*',
               text: [
                 { text: 'Tools: ', bold: true, fontSize: sizes.small },
                 ...parseRichText(item.tools, { fontSize: sizes.small })
               ]
            }
          ],
          margin: [0, 1, 0, 3]
        });

        // Bullets
        if (item.bullets && item.bullets.length > 0) {
          content.push({
            ul: item.bullets.map(b => ({ text: parseRichText(b, { fontSize: sizes.small, lineHeight }) })),
            margin: [12, 0, 0, 8]
          });
        }
      });
    }
    else if (section.type === 'skills') {
      const s = section as SkillsSection;
      // We use a columns layout to mimic the table look without strict grid
      s.items.forEach(item => {
        content.push({
           columns: [
             { text: parseRichText(item.category, { bold: true, fontSize: sizes.small }), width: 120 },
             { text: parseRichText(item.items, { fontSize: sizes.small, lineHeight }), width: '*' }
           ],
           columnGap: 10,
           margin: [0, 2, 0, 2]
        });
      });
      content.push({ text: '', margin: [0, 0, 0, 8] });
    }
    else if (section.type === 'custom') {
      const s = section as CustomSection;
      s.items.forEach(row => {
        const cols = row.columns.map(col => ({
          text: parseRichText(col.content, { fontSize: sizes.base, lineHeight }),
          width: `${col.width}%`,
          alignment: col.alignment
        }));

        if (row.hasBullet) {
          content.push({
            ul: [
              { columns: cols, columnGap: 10 }
            ],
            margin: [10, 2, 0, 2]
          });
        } else {
          content.push({
            columns: cols,
            columnGap: 10,
            margin: [0, 2, 0, 2]
          });
        }
      });
      content.push({ text: '', margin: [0, 0, 0, 8] });
    }
    else if (section.type === 'additional') {
      const s = section as AdditionalSection;
      const footerParts: any[] = [];
      s.items.forEach((info, i) => {
        if (i > 0) footerParts.push({ text: ' | ', color: '#cbd5e1', bold: true });
        footerParts.push(...parseRichText(info.content, { fontSize: sizes.small }));
      });

      content.push({
        text: footerParts,
        alignment: 'center',
        margin: [0, 5, 0, 0]
      });
    }
  });

  // Define PDF Document
  const docDefinition = {
    content: content,
    pageSize: 'LETTER',
    pageMargins: pageMargins,
    defaultStyle: {
      font: 'Roboto', // Default standard font
      color: '#333333'
    },
    styles: {
      headerName: { bold: true },
      headerRole: { bold: false },
    }
  };

  // Trigger Download
  pdfMake.createPdf(docDefinition).download(`${data.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
};
