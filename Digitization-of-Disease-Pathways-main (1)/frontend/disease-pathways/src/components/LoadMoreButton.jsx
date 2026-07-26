import React from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

const LoadMoreButton = ({ 
  stageName, 
  stageColors, 
  isLoading, 
  isExpanded, 
  painPointCount, 
  totalPainPoints,
  onLoadMore, 
  onShowLess,
  error 
}) => {
  // DEBUG LOGS
;

  // TEMPORARY: Always show button for debugging
  // Comment this out after we see the button working
  const forceShow = true;
  
  // Don't show button if stage has 7 or fewer pain points (unless debugging)
  if (!forceShow && totalPainPoints <= 7) {
    
    return (
      <div style={{ 
        color: 'orange', 
        fontSize: '0.8rem',
        textAlign: 'center',
        padding: '1rem',
        border: '1px dashed orange'
      }}>
        DEBUG: Button hidden - {totalPainPoints} ≤ 7 pain points
      </div>
    );
  }

;

  const handleClick = () => {
    if (isExpanded) {
      onShowLess(stageName);
    } else {
      onLoadMore(stageName);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      marginTop: '1rem',
      gap: '0.5rem'
    }}>
      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          color: '#ff6b6b',
          fontSize: '0.9rem',
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Load More/Show Less Button */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        style={{
          background: isLoading 
            ? 'rgba(255, 255, 255, 0.05)'
            : `linear-gradient(135deg, ${stageColors.primary}20, ${stageColors.accent}20)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${stageColors.primary}60`,
          borderRadius: '12px',
          padding: '0.75rem 1.5rem',
          color: isLoading ? '#888' : stageColors.primary,
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: `0 4px 16px ${stageColors.primary}15`,
          minWidth: '160px',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = `0 6px 20px ${stageColors.primary}25`;
            e.target.style.background = `linear-gradient(135deg, ${stageColors.primary}30, ${stageColors.accent}30)`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = `0 4px 16px ${stageColors.primary}15`;
            e.target.style.background = `linear-gradient(135deg, ${stageColors.primary}20, ${stageColors.accent}20)`;
          }
        }}
      >
        {isLoading ? (
          <>
            <div style={{ width: '16px', height: '16px' }}>
              <LoadingSpinner size="small" color={stageColors.primary} />
            </div>
            Loading...
          </>
        ) : isExpanded ? (
          <>
             Show Less
          </>
        ) : (
          <>
            Load More 
          </>
        )}
      </button>

      {/* Pain Point Counter */}
      <div style={{
        color: '#888',
        fontSize: '0.8rem',
        textAlign: 'right'
      }}>

      </div>
   
      
    </div>
  );
};

export default LoadMoreButton;