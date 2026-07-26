import React from 'react';
import { COLORS } from '../utils/constants.js';
import { parseTextContent } from '../utils/textParser.js';

const FormattedText = ({ 
  text, 
  type = 'overview',
  stageColors, 
  isDarkTheme = false 
}) => {
  const { intro, items } = parseTextContent(text, type);

  if (!text) return null;

  return (
    <div style={{
      color: COLORS.white,
      fontSize: '1rem',
      lineHeight: '1.6'
    }}>
      {/* Intro Paragraph */}
      {intro && (
        <p style={{
          margin: '0 0 1.5rem 0',
          opacity: 0.9,
          textAlign: type === 'overview' ? 'justify' : 'left'
        }}>
          {intro}
        </p>
      )}

      {/* Bullet List with Gradient Bullets */}
      {items.length > 0 && (
        <ul style={{
          margin: '0',
          padding: '0',
          listStyle: 'none'
        }}>
          {items.map((item, index) => (
            <li 
              key={index}
              style={{
                position: 'relative',
                marginBottom: '1rem',
                paddingLeft: '1.5rem',
                opacity: 0.9,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              {/* Custom Gradient Bullet */}
              <div style={{
                position: 'absolute',
                left: '0',
                top: '0.3rem',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${stageColors?.primary || COLORS.primaryTeal}, ${stageColors?.secondary || COLORS.primaryTealLight})`,
                boxShadow: `0 0 8px ${stageColors?.primary || COLORS.primaryTeal}40`
              }} />
              
              {/* List Item Text */}
              <span style={{ 
                display: 'block',
                wordWrap: 'break-word' 
              }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FormattedText;
