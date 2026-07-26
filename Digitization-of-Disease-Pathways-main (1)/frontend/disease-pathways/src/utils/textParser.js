export const parseTextContent = (text, type = 'overview') => {
  if (!text || !text.trim()) {
    return { intro: '', items: [] };
  }

  if (type === 'overview') {
    // Handle overview text with bullet points (•)
    if (!text.includes('•')) {
      return { intro: text.trim(), items: [] };
    }
    
    const parts = text.split('•');
    const intro = parts[0].trim();
    const items = parts.slice(1)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    return { intro, items };
  }
  

  
  return { intro: text.trim(), items: [] };
};

export const parseTextWithLinks = (text) => {
  if (!text || !text.trim()) return [];

  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const results = [];
  let currentText = '';
  let currentUrls = [];

  // Helper to detect if a line is a URL
  const isURL = (line) => {
    // Remove parentheses if present
    const cleaned = line.replace(/^\(|\)$/g, '');
    return /^https?:\/\//i.test(cleaned);
  };

  // Helper to clean URL (remove parentheses)
  const cleanURL = (url) => {
    return url.replace(/^\(|\)$/g, '').trim();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isURL(line)) {
      // It's a URL - add to current URLs array
      currentUrls.push(cleanURL(line));
    } else {
      // It's text
      // If we have accumulated text and URLs, save them
      if (currentText && currentUrls.length > 0) {
        results.push({
          text: currentText,
          urls: [...currentUrls]
        });
        currentText = '';
        currentUrls = [];
      } else if (currentText && currentUrls.length === 0) {
        // Text without URL - save as plain text
        results.push({
          text: currentText,
          urls: []
        });
        currentText = '';
      }

      // Set new current text
      currentText = line;
    }
  }

  // Handle remaining text and URLs
  if (currentText) {
    results.push({
      text: currentText,
      urls: currentUrls.length > 0 ? [...currentUrls] : []
    });
  }

  return results;
};
