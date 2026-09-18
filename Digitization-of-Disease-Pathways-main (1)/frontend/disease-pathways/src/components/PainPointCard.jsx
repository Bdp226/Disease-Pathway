import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, SOLUTION_COLORS } from '../utils/constants.js';
import { renderTextWithInlineLinks } from '../utils/textParser.js';

const PainPointCard = ({ 
  painPoint, 
  index, 
  onClick, 
  stageColors, 
  isDarkTheme = false 
}) => {

  const getUrgencyBadge = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return { label: 'Critical', color: '#ff4d4f', bg: 'rgba(255, 77, 79, 0.15)' };
      case 'medium':
        return { label: 'Medium', color: '#faad14', bg: 'rgba(250, 173, 20, 0.15)' };
      default:
        return null;
    }
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

  const urgencyBadge = getUrgencyBadge(painPoint.urgency);
  const primaryColor = stageColors?.primary || COLORS.primaryTeal;

  // Parse tags, filter empty ones
  const tags = painPoint.tags
    ? painPoint.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const getTagStyle = (tag) => {
    if (tag.includes('Treatment')) return { color: '#9c27b0', bg: 'rgba(156, 39, 176, 0.15)' };
    if (tag.includes('Symptom')) return { color: '#e65100', bg: 'rgba(230, 81, 0, 0.15)' };
    if (tag.includes('Clinical')) return { color: '#0277bd', bg: 'rgba(2, 119, 189, 0.15)' };
    if (tag.includes('Financial')) return { color: '#2e7d32', bg: 'rgba(46, 125, 50, 0.15)' };
    return { color: primaryColor, bg: `${primaryColor}20` };
  };

  const getTagTooltip = (tag) => {
    if (painPoint.tags_breakdown && painPoint.tags_breakdown[tag]) {
      return `Category: ${tag}\nFound entities: ${painPoint.tags_breakdown[tag].join(', ')}`;
    }
    return `Category: ${tag}`;
  };

  const urgencyTooltip = painPoint.urgency_breakdown?.matched_keywords?.length > 0 
    ? `ML Urgency Score: ${painPoint.urgency_breakdown.score.toUpperCase()}\nTriggered by keywords: ${painPoint.urgency_breakdown.matched_keywords.join(', ')}`
    : `Urgency Score: ${painPoint.urgency || 'Low'}`;

  return (
    <motion.button
      className="pain-point-card"
      onClick={() => onClick(painPoint)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: isDarkTheme 
          ? `rgba(255, 255, 255, 0.06)` 
          : `rgba(255, 255, 255, 0.25)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${primaryColor}50`,
        padding: '1.5rem',
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 8px 32px ${primaryColor}15`,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      onFocus={(e) => e.currentTarget.blur()}
      onContextMenu={(e) => e.preventDefault()}
      tabIndex="-1"
    >
      {/* Top accent bar — animated shimmer */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${primaryColor}, ${stageColors?.secondary || primaryColor}80, ${primaryColor})`,
          backgroundSize: '200% 100%',
          borderRadius: '16px 16px 0 0',
          pointerEvents: 'none'
        }}
        animate={{ backgroundPosition: ['0% center', '200% center'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* ── HEADER: Title + Urgency Badge ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        paddingTop: '0.5rem' /* clear the accent bar */
      }}>
        <h3 style={{
          color: COLORS.white,
          fontSize: '1rem',
          fontWeight: '700',
          margin: 0,
          textShadow: `0 0 8px ${primaryColor}40`
        }}>
          Pain Point
        </h3>

        {urgencyBadge && (
          <span 
            title={urgencyTooltip}
            style={{
            background: urgencyBadge.bg,
            color: urgencyBadge.color,
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: '700',
            border: `1px solid ${urgencyBadge.color}40`,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            cursor: 'help'
          }}>
            {urgencyBadge.label}
          </span>
        )}
      </div>

      {/* ── DESCRIPTION ── truncated to 7 lines, no overflow */}
      <p style={{
        color: isDarkTheme ? 'rgba(255,255,255,0.85)' : COLORS.darkGray,
        margin: 0,
        fontSize: '0.9rem',
        lineHeight: '1.6',
        fontWeight: '400',
        /* Clamp to 7 lines so long text never overflows */
        display: '-webkit-box',
        WebkitLineClamp: 7,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        flexShrink: 0,
        whiteSpace: 'pre-line'
      }}>
        {renderTextWithInlineLinks(painPoint.description, { color: '#88ccca' })}
      </p>

      {/* ── TAGS ── rendered after description, before footer */}
      {tags.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5px',
          flexShrink: 0
        }}>
          {tags.map((tag, idx) => {
            const { color, bg } = getTagStyle(tag);
            return (
              <span 
                key={idx} 
                title={getTagTooltip(tag)}
                style={{
                background: bg,
                color: color,
                border: `1px solid ${color}40`,
                padding: '3px 9px',
                borderRadius: '10px',
                fontSize: '0.72rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                cursor: 'help'
              }}>
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* ── ADDITIONAL INFO ── rendered inline, no absolute positioning */}
      {hasNewFields() && (
        <div style={{
          padding: '0.6rem 0.75rem',
          background: `rgba(255,255,255,0.05)`,
          borderRadius: '8px',
          border: `1px solid ${primaryColor}30`,
          flexShrink: 0
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: primaryColor,
            fontWeight: '600',
            marginBottom: '0.2rem'
          }}>
            Additional Information Available:
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {painPoint.coverage && painPoint.coverage.trim() && (
              <span>• Our portfolio coverage</span>
            )}
            {painPoint.existing_solutions && painPoint.existing_solutions.trim() && (
              <span>• Existing Solutions</span>
            )}
          </div>
        </div>
      )}

      {/* ── ML INSIGHTS (Explicit Breakdown) ── */}
      {(painPoint.urgency_breakdown?.matched_keywords?.length > 0 || (painPoint.tags_breakdown && Object.keys(painPoint.tags_breakdown).length > 0)) && (
        <details 
          style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            border: `1px dashed ${primaryColor}60`,
            padding: '0.5rem',
            fontSize: '0.8rem',
            marginTop: '0.5rem'
          }}
          onClick={(e) => e.stopPropagation()} /* Prevent card click when interacting */
        >
          <summary style={{ cursor: 'pointer', color: primaryColor, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>ML Insights Breakdown</span>
          </summary>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem', borderLeft: `2px solid ${primaryColor}40` }}>
            {painPoint.urgency_breakdown?.matched_keywords?.length > 0 && (
              <div>
                <strong style={{ color: COLORS.white }}>Urgency ({painPoint.urgency_breakdown.score}):</strong> Triggered by keywords: 
                <span style={{ color: '#ff4d4f', marginLeft: '0.3rem' }}>{painPoint.urgency_breakdown.matched_keywords.join(', ')}</span>
              </div>
            )}
            {painPoint.tags_breakdown && Object.keys(painPoint.tags_breakdown).length > 0 && (
              <div>
                <strong style={{ color: COLORS.white }}>Entity Extraction:</strong>
                <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                  {Object.entries(painPoint.tags_breakdown).map(([tag, entities]) => (
                    <li key={tag}>
                      <strong>{tag}:</strong> {entities.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}

      {/* ── FOOTER: spacer pushes it to bottom ── */}
      <div style={{ flexGrow: 1, minHeight: '0.5rem' }} />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${primaryColor}30`,
        flexShrink: 0
      }}>
        <span style={{
          color: 'rgba(255,255,255,0.7)',
          fontWeight: '600',
          fontSize: '0.82rem'
        }}>
          Click for details
        </span>
        <span style={{
          fontSize: '1.2rem',
          color: primaryColor,
          fontWeight: 'bold'
        }}>
          →
        </span>
      </div>
    </motion.button>
  );
};

export default PainPointCard;
