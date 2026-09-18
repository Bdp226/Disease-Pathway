import React from 'react';

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

  // Safely replace slashes with newline if they are surrounded by spaces
  let safeText = text.replace(/\s+\/\s+/g, '\n');

  const lines = safeText.split('\n').map(line => line.trim()).filter(line => line);
  const results = [];

  for (let line of lines) {
    // Find all URLs in the line
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urlMatches = line.match(urlRegex) || [];
    
    // Clean URLs of trailing punctuation
    const cleanUrls = urlMatches.map(u => u.replace(/[.,;)]$/, ''));
    
    // Remove the URLs from the text
    let cleanText = line;
    for (let u of urlMatches) {
        cleanText = cleanText.replace(u, '').trim();
    }
    
    // If the entire line was just a URL, cleanText will be empty, which is fine
    results.push({
      text: cleanText,
      urls: cleanUrls
    });
  }

  // Combine adjacent items if they have text but no URLs, or something similar?
  // No, the original logic kept each line as a separate block. We can just return it.
  return results.filter(item => item.text || item.urls.length > 0);
};

export const renderTextWithInlineLinks = (text, linkStyle = {}) => {
  if (!text) return null;
  
  // Remove stray backslashes and safely replace spaced slashes with newline
  let processed = text.replace(/\\/g, '').replace(/\s+\/\s+/g, '\n');
  
  // Split by URL
  const parts = processed.split(/(https?:\/\/[^\s]+)/gi);
  
  return parts.map((part, i) => {
    if (/^https?:\/\//i.test(part)) {
      let cleanUrl = part;
      let trailing = '';
      if (/[.,;)]$/.test(part)) {
        cleanUrl = part.slice(0, -1);
        trailing = part.slice(-1);
      }
      return React.createElement(
        React.Fragment,
        { key: i },
        React.createElement('a', {
          href: cleanUrl,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: { textDecoration: 'underline', ...linkStyle },
          onClick: (e) => e.stopPropagation()
        }, cleanUrl),
        trailing
      );
    }
    return React.createElement(React.Fragment, { key: i }, part);
  });
};
