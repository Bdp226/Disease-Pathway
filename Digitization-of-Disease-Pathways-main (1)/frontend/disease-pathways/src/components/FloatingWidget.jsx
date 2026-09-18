import React, { useState } from 'react';
import DialogContainer from './DialogContainer.jsx';
import DownloadButton from './DownloadButton.jsx';
import PainPointSubmissionModal from './PainPointSubmissionModal.jsx';
import { COLORS } from '../utils/constants.js';
import { isAuthenticated } from '../utils/api.js';

const FloatingWidget = ({ diseaseName, stageColors }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPainPointModalOpen, setIsPainPointModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const handleSuccess = (msg) => {
    setMessage(`✓ ${msg}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleError = (msg) => {
    setMessage(`✗ ${msg}`);
    setTimeout(() => setMessage(''), 5000);
  };

  const orangeGradient = `linear-gradient(135deg, ${COLORS.accentOrange}, ${COLORS.accentOrangeLight})`;

  const circleButtonStyle = {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    color: COLORS.white,
    fontSize: '1.4rem',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: `0 4px 15px ${COLORS.accentOrange}40`,
    background: orangeGradient,
    position: 'relative',
    overflow: 'hidden', // Clips any text from the internal DownloadButton
  };

  const tooltipStyle = (isVisible) => ({
    position: 'absolute',
    right: '65px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(20, 20, 20, 0.95)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    opacity: isVisible ? 1 : 0,
    pointerEvents: 'none',
    transition: 'all 0.2s ease',
    border: `1px solid ${COLORS.accentOrange}40`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    zIndex: 10,
    whiteSpace: 'nowrap'
  });

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '110px',
        right: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 1000,
      }}>
        
        {/* BUTTON 1: PLUS ICON */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={tooltipStyle(hoveredBtn === 'add')}>Add Another Pain Point</div>
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            onMouseEnter={() => setHoveredBtn('add')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...circleButtonStyle,
              transform: hoveredBtn === 'add' ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
            }}
          >
            ＋
          </button>
        </div>

        {/* BUTTON 2: DOWNLOAD ICON (Ghost Click implementation) */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={tooltipStyle(hoveredBtn === 'download')}>Download CSV</div>
          <div 
            onMouseEnter={() => setHoveredBtn('download')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...circleButtonStyle,
              transform: hoveredBtn === 'download' ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
            }}
          >
            {/* 1. The visible icon (Centered) */}
            <div style={{ 
              position: 'absolute', 
              zIndex: 1, 
              pointerEvents: 'none',
              fontSize: '1.2rem' 
            }}>
              ⤓
            </div>
            
            {/* 2. The Actual Download Button (Invisible but covers the whole circle) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.01, // Almost invisible but functional
              zIndex: 2,
            }}>
              <DownloadButton
                diseaseName={diseaseName}
                onSuccess={handleSuccess}
                onError={handleError}
                style={{
                  width: '200px', // Large enough to cover the circle regardless of text
                  height: '200px',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  textIndent: '-9999px', // Pushes any text way off screen
                  overflow: 'hidden'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Notifications */}
      {message && (
        <div style={{
          position: 'fixed',
          bottom: '160px',
          right: '30px',
          padding: '10px 20px',
          borderRadius: '30px',
          background: 'rgba(0,0,0,0.9)',
          color: message.includes('✓') ? '#4caf50' : COLORS.accentOrange,
          border: `1px solid ${message.includes('✓') ? '#4caf50' : COLORS.accentOrange}`,
          fontSize: '0.9rem',
          fontWeight: '600',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          zIndex: 1100
        }}>
          {message}
        </div>
      )}

      {/* Dialogs and Modals */}
      <DialogContainer
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`Add a New Pain Point`}
        stageColors={stageColors}
      >
        {isAuthenticated() ? (
          <button
            type="button"
            onClick={() => {
              setIsDialogOpen(false);
              setIsPainPointModalOpen(true);
            }}
            style={{
              width: '100%',
              padding: '1rem',
              background: orangeGradient,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            +
          </button>
        ) : (
          <p style={{ color: COLORS.white, opacity: 0.7, textAlign: 'center' }}>
            Please sign in to contribute.
          </p>
        )}
      </DialogContainer>

      <PainPointSubmissionModal
        isOpen={isPainPointModalOpen}
        onClose={() => setIsPainPointModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default FloatingWidget;