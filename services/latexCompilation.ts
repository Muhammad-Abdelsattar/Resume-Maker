
export const compileLatexToPdf = async (latexCode: string): Promise<Blob | null> => {
  try {
    // Attempt 1: GET request for shorter payloads (less likely to trigger strict CORS on some public APIs)
    // latexonline.cc accepts ?text=...
    if (latexCode.length < 2000) {
      const url = `https://latexonline.cc/compile?text=${encodeURIComponent(latexCode)}`;
      const response = await fetch(url);
      if (response.ok) {
        return await response.blob();
      }
    }

    // Attempt 2: POST request with FormData
    // Note: Public APIs like latexonline.cc often block cross-origin POST requests via CORS.
    // We try this as a best-effort.
    const formData = new FormData();
    // 'text' is the correct field for raw source in latexonline
    formData.append('text', latexCode); 
    // We can also try 'file' if 'text' fails, but 'text' is standard for source strings.

    const response = await fetch('https://latexonline.cc/compile', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // We don't throw here to avoid noisy console errors, just return null to trigger fallback
      console.warn(`Cloud compilation failed: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.blob();
  } catch (error) {
    // Suppress "Failed to fetch" noise (common due to CORS) and trigger fallback
    console.warn("Cloud LaTeX engine unreachable (likely CORS or Network), switching to offline PDF generation.");
    return null;
  }
};
