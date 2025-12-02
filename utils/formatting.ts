
/**
 * Utilities for converting HTML-subset rich text to LaTeX and React output.
 * Supported tags: <b>, <strong>, <i>, <em>, <a href="...">, <div style="...">, <i class="...">
 */

export const htmlToLatex = (html: string): string => {
  if (!html) return '';

  let latex = html;

  // 0. Handle Icons: <i class="fab fa-github"></i> -> \faIcon{github}
  // We need to extract the icon name. Common prefixes: fa-, fab fa-, fas fa-, far fa-
  // \faIcon takes the name without fa- prefix for FontAwesome5 package usually, or specific commands.
  // The package `fontawesome5` provides \faIcon{name}.
  latex = latex.replace(/<i\s+class=["'](?:fa[sbrl]?\s+)?fa-([^"']+)["'][^>]*><\/i>/g, '\\faIcon{$1}');
  // Fallback for simple class names like "fas fa-user" -> user
  latex = latex.replace(/<i\s+class=["'][^"']*fa-([^"'\s]+)[^"']*["'][^>]*><\/i>/g, '\\faIcon{$1}');


  // 1. Replace Links: <a href="URL">TEXT</a> -> \href{URL}{TEXT}
  latex = latex.replace(/<a\s+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/g, '\\href{$1}{$2}');

  // 2. Replace Bold: <b>TEXT</b> or <strong>TEXT</strong> -> \textbf{TEXT}
  latex = latex.replace(/<(b|strong)>(.*?)<\/\1>/g, '\\textbf{$2}');

  // 3. Replace Italic: <i>TEXT</i> or <em>TEXT</em> -> \textit{TEXT}
  latex = latex.replace(/<(i|em)>(.*?)<\/\1>/g, '\\textit{$2}');
  
  // 4. Handle Alignments: <div style="text-align: center;">TEXT</div> -> \begin{center}TEXT\end{center}
  // Center
  latex = latex.replace(/<div\s+style=["']text-align:\s*center;?["']>(.*?)<\/div>/g, '\\begin{center}$1\\end{center}');
  // Right
  latex = latex.replace(/<div\s+style=["']text-align:\s*right;?["']>(.*?)<\/div>/g, '\\begin{flushright}$1\\end{flushright}');
  // Left (Default, but if explicit)
  latex = latex.replace(/<div\s+style=["']text-align:\s*left;?["']>(.*?)<\/div>/g, '\\begin{flushleft}$1\\end{flushleft}');

  // 5. Basic character escaping for LaTeX
  // & -> \&
  latex = latex.replace(/&amp;/g, '\\&');
  latex = latex.replace(/&nbsp;/g, '~');
  // We assume other characters like % $ are handled by user or we'd need a more complex parser

  return latex;
};

// Strips HTML tags for plain text processing
export const stripHtml = (html: string): string => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};
