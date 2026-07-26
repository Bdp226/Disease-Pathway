// Dialog and Widget Animations
export const DIALOG_ANIMATIONS = {
  // Dialog fade-in animation
  dialogFadeIn: {
    opacity: 0,
    transform: 'scale(0.95) translateY(20px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  dialogFadeInActive: {
    opacity: 1,
    transform: 'scale(1) translateY(0)'
  },
  
  // Floating button animations
  floatingButton: {
    transform: 'scale(1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  floatingButtonHover: {
    transform: 'scale(1.1)',
    transition: 'all 0.2s ease-out'
  },
  
  floatingButtonHide: {
    opacity: 0,
    transform: 'scale(0.8)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Dialog Theme Configuration
export const DIALOG_THEME = {
  dimensions: {
    width: '380px',
    maxWidth: '90vw',
    minHeight: '200px',
    borderRadius: '16px',
    padding: '2rem'
  },
  
  positioning: {
    bottom: '100px',
    right: '24px',
    zIndex: 1000
  },
  
  colors: {
    background: 'rgba(0, 0, 0, 0.85)',
    border: 'rgba(255, 255, 255, 0.1)',
    backdrop: 'blur(15px)',
    overlay: 'rgba(0, 0, 0, 0.5)'
  },
  
  floatingButton: {
    size: '56px',
    position: { bottom: '24px', right: '24px' },
    zIndex: 999
  }
};
