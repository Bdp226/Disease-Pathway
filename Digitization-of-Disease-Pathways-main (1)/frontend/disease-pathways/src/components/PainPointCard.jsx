import React from 'react';
import { COLORS, SOLUTION_COLORS } from '../utils/constants.js';

const PainPointCard = ({ 
  painPoint, 
  index, 
  onClick, 
  stageColors, 
  isDarkTheme = false 
}) => {
  const getCardHeight = () => {
    const baseHeight = 320;
    const textLength = painPoint.description.length;
    const additionalHeight = Math.floor(textLength / 100) * 40;
    return Math.min(baseHeight + additionalHeight, 450);
  };

  const getSolutionCount = () => {
    return Object.values(painPoint.solutions || {}).reduce((total, solutions) => {
      return total + (Array.isArray(solutions) ? solutions.length : (solutions ? 1 : 0));
    }, 0);
  };

  const hasNewFields = () => {
    return (painPoint.coverage && painPoint.coverage.trim()) || 
           (painPoint.existing_solutions && painPoint.existing_solutions.trim());
  };

  const getPrimaryColor = () => {
    if (!painPoint.solutions) return stageColors?.primary || COLORS.primaryTeal;
    
    for (const [type, solutions] of Object.entries(painPoint.solutions)) {
      if (Array.isArray(solutions) && solutions.length > 0) {
        return SOLUTION_COLORS[type] || stageColors?.primary || COLORS.primaryTeal;
      } else if (solutions) {
        return SOLUTION_COLORS[type] || stageColors?.primary || COLORS.primaryTeal;
      }
    }
    return stageColors?.primary || COLORS.primaryTeal;
  };

  return (
    <button 
      className="pain-point-card"
      onClick={() => onClick(painPoint)}
      style={{
        // GLASS MORPHIC EFFECT
        background: isDarkTheme 
          ? `rgba(255, 255, 255, 0.08)` 
          : `rgba(255, 255, 255, 0.25)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)', // Safari support
        
        // STAGE-SPECIFIC COLORED BORDER
        border: `1px solid ${stageColors?.primary || COLORS.primaryTeal}60`,
        
        padding: '2rem',
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        fontFamily: 'inherit',
        
        height: `${getCardHeight()}px`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        
        // GLASS MORPHIC SHADOW
        boxShadow: `0 8px 32px ${stageColors?.primary || COLORS.primaryTeal}20`,
        
        // INTERACTION STYLES
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        
        // SMOOTH TRANSITIONS
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 25px 50px ${stageColors?.primary || COLORS.primaryTeal}30`;
        e.currentTarget.style.borderColor = stageColors?.primary || COLORS.primaryTeal;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${stageColors?.primary || COLORS.primaryTeal}20`;
        e.currentTarget.style.borderColor = `${stageColors?.primary || COLORS.primaryTeal}60`;
      }}
      onFocus={(e) => e.currentTarget.blur()}
      onContextMenu={(e) => e.preventDefault()}
      tabIndex="-1"
    >
      {/* Color Accent Bar - Stage Specific */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: `linear-gradient(90deg, ${stageColors?.primary || COLORS.primaryTeal}, ${stageColors?.secondary || COLORS.primaryTealLight})`,
        borderRadius: '16px 16px 0 0',
        pointerEvents: 'none'
      }} />

      {/* Header Section */}
      <div style={{ 
        marginBottom: '1rem'
      }}>
        <h3 style={{ 
          color: COLORS.white, // White text for dark theme
          marginBottom: '0.5rem',
          fontSize: '1.1rem',
          fontWeight: '700',
          margin: '0 0 0.5rem 0',
          textShadow: `0 0 10px ${stageColors?.primary || COLORS.primaryTeal}40`
        }}>
          Pain Point
        </h3>
        
      </div>

      {/* Description Section */}
      <div style={{ 
        flex: 1, 
        marginBottom: '1rem',
        // overflow: 'hidden'
      }}>
        <p style={{
          color: COLORS.white, // White text for dark theme
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 6,
          WebkitBoxOrient: 'vertical',
          // overflow: 'hidden',
          // textOverflow: 'ellipsis',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          fontWeight: '500',
          opacity: 0.9
        }}>
          {painPoint.description}
        </p>
      </div>

      {/* New Fields Indicators */}
      {hasNewFields() && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          background: `rgba(255, 255, 255, 0.05)`,
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          border: `1px solid ${stageColors?.primary || COLORS.primaryTeal}40`
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: stageColors?.primary || COLORS.primaryTeal,
            fontWeight: '600',
            marginBottom: '0.25rem'
          }}>
            Additional Information Available:
          </div>
          <div style={{ fontSize: '0.75rem', color: COLORS.white }}>
            {painPoint.coverage && painPoint.coverage.trim() && (
              <span style={{ marginRight: '0.75rem' }}>• Our portfolio coverage </span>
            )}
            {painPoint.existing_solutions && painPoint.existing_solutions.trim() && (
              <span>• Existing Solutions</span>
            )}
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: `1px solid ${stageColors?.primary || COLORS.primaryTeal}40`,
        marginTop: 'auto'
      }}>
        <div style={{
          color: COLORS.white,
          fontWeight: '600',
          fontSize: '0.85rem'
        }}>
          Click for details
        </div>
        <div style={{
          fontSize: '1.3rem',
          color: stageColors?.primary || COLORS.primaryTeal,
          fontWeight: 'bold'
        }}>
          →
        </div>
      </div>
    </button>
  );
};

export default PainPointCard;
