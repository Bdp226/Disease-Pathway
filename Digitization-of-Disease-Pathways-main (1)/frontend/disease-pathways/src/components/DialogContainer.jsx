import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { COLORS } from '../utils/constants.js';
import { DIALOG_THEME, DIALOG_ANIMATIONS } from '../utils/animations.js';

const DialogContainer = ({ 
  isOpen, 
  onClose, 
  children, 
  title = "Actions",
  stageColors 
}) => {
  const dialogRef = useRef();
  const overlayRef = useRef();
  
  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleTabTrap = (e) => {
      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements?.length) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabTrap);
    
    // Focus first focusable element
    const firstFocusable = dialogRef.current?.querySelector('button, [href], input, select, textarea');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabTrap);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: DIALOG_THEME.colors.overlay,
        zIndex: DIALOG_THEME.positioning.zIndex,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: '24px'
      }}
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        style={{
          ...DIALOG_THEME.dimensions,
          ...DIALOG_ANIMATIONS.dialogFadeInActive,
          background: DIALOG_THEME.colors.background,
          backdropFilter: DIALOG_THEME.colors.backdrop,
          WebkitBackdropFilter: DIALOG_THEME.colors.backdrop,
          border: `1px solid ${stageColors?.primary || COLORS.primaryTeal}40`,
          borderRadius: DIALOG_THEME.dimensions.borderRadius,
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px ${stageColors?.primary || COLORS.primaryTeal}20`,
          animation: 'dialogFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h3 
            id="dialog-title"
            style={{
              color: COLORS.white,
              fontSize: '1.2rem',
              fontWeight: '600',
              margin: 0
            }}
          >
            {title}
          </h3>
          
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: COLORS.white,
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DialogContainer;
