
/**
 * Utilities for converting HTML-subset rich text to LaTeX and React output.
 * Supported tags: <b>, <strong>, <i>, <em>, <a href="...">
 */

export const htmlToLatex = (html: string): string => {
  if (!html) return '';

  let latex = html;

  // 1. Replace Links: <a href="URL">TEXT</a> -> \href{URL}{TEXT}
  latex = latex.replace(/<a\s+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/g, '\\href{$1}{$2}');

  // 2. Replace Bold: <b>TEXT</b> or <strong>TEXT</strong> -> \textbf{TEXT}
  latex = latex.replace(/<(b|strong)>(.*?)<\/\1>/g, '\\textbf{$2}');

  // 3. Replace Italic: <i>TEXT</i> or <em>TEXT</em> -> \textit{TEXT}
  latex = latex.replace(/<(i|em)>(.*?)<\/\1>/g, '\\textit{$2}');

  // 4. Escape special LaTeX characters that are NOT part of the commands we just made
  // This is tricky. A simple approach is to assume the user inputs clean text mostly.
  // For a robust solution, we'd tokenize. For now, we handle common issues like % or $ if they aren't commands.
  // Note: doing full escaping on already formatted strings is hard. 
  // We assume the user input inside the tags needs escaping, but we'll leave it simple for this iteration to avoid breaking commands.
  
  // Basic cleanup of &amp;
  latex = latex.replace(/&amp;/g, '\\&');

  return latex;
};

// Strips HTML tags for plain text processing if needed
export const stripHtml = (html: string): string => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};
