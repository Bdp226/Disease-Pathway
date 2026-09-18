import React, { useState } from 'react';
import { COLORS } from '../utils/constants.js';

const StakeholderCard = ({ 
  stakeholder,  
  imagePath,  // Changed from 'icon' to 'imagePath'
  stageColors, 
  isDarkTheme = false 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset state if the image path changes (crucial for hot-reloading)
  React.useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [imagePath]);

  // Extract first word as fallback text
  const fallbackText = stakeholder.trim().split(' ')[0].charAt(0).toUpperCase();

  return (
    <div style={{
      background: isDarkTheme 
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: `1px solid ${stageColors?.accent || COLORS.primaryTeal}40`,
      boxShadow: `0 4px 6px ${stageColors?.accent || COLORS.primaryTeal}20`,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = `0 8px 12px ${stageColors?.accent || COLORS.primaryTeal}30`;
      e.currentTarget.style.borderColor = stageColors?.primary || COLORS.primaryTeal;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = `0 4px 6px ${stageColors?.accent || COLORS.primaryTeal}20`;
      e.currentTarget.style.borderColor = `${stageColors?.accent || COLORS.primaryTeal}40`;
    }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* NEW: Image Icon Circle */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${stageColors?.primary || COLORS.primaryTeal}, ${stageColors?.accent || COLORS.primaryTealLight})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          flexShrink: 0,
          border: `2px solid ${stageColors?.accent || stageColors?.primary || COLORS.primaryTeal}`,
          boxShadow: `0 0 15px ${stageColors?.accent || COLORS.primaryTeal}60, inset 0 0 10px ${stageColors?.primary || COLORS.primaryTeal}30`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Loading / Fallback state (placed behind the image) */}
          {!imageError && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: COLORS.white,
              fontSize: '1.2rem',
              fontWeight: '600',
              zIndex: 0
            }}>
              {fallbackText}
            </div>
          )}

          {/* Image */}
          {!imageError && (
            <img 
              src={imagePath}
              alt={stakeholder}
              loading="eager"
              onError={() => {
                console.warn(`Failed to load image: ${imagePath}`);
                setImageError(true);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                position: 'relative',
                zIndex: 1,
                opacity: 1
              }}
            />
          )}

          {/* Fallback text if image fails */}
          {imageError && (
            <div style={{
              color: COLORS.white,
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              {fallbackText}
            </div>
          )}
        </div>

        {/* Stakeholder Text */}
        <div style={{
          color: COLORS.white,
          fontSize: '0.95rem',
          
          lineHeight: '1.4',
          flex: 1
        }}>
          {stakeholder}
        </div>
      </div>
    </div>
  );
};

export default StakeholderCard;
