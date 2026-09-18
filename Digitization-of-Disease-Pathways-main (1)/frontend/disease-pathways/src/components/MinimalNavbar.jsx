import React, { useState, useEffect } from 'react';
import { COLORS, getStageColors } from '../utils/constants.js';

const GlassmorphicNavbar = ({ stages, diseaseName, onStageClick }) => {
  const [currentScrollStage, setCurrentScrollStage] = useState(0);

  const stageNames = Object.keys(stages);
  const totalStages = stageNames.length;

  // Track scroll to highlight current stage
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.stage-section');
      let currentIndex = currentScrollStage;
      const windowMid = window.innerHeight / 2;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= windowMid && rect.bottom >= windowMid) {
          currentIndex = index;
        }
      });

      setCurrentScrollStage(currentIndex);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // Outer div: full width for background + fade
    <div
      style={{
        position: 'sticky',
        top: '80px',
        left: 0,
        right: 0,
        background: '#000', // full-width background for glass/fade effect
        zIndex: 1000,
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 110px)',

        /* Bottom fade-out */
        WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',

        scrollBehavior: 'smooth',
      }}
    >
      {/* Inner container: aligns content with top header */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px', // match top header
          margin: '0 auto',    // center
          padding: '1rem 2rem 3rem', // same horizontal padding as header
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Disease Name removed to prevent duplication with DiseasePathway.jsx h1 */}

        {/* Horizontal Stage Stepper */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            gap: '0.5rem',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            padding: '0 0.5rem',
          }}
        >
          {stageNames.map((stageName, index) => {
            const stageColors = getStageColors(index, totalStages);
            const isActive = index === currentScrollStage;

            return (
              <React.Fragment key={stageName}>
                {index > 0 && (
                  <div
                    style={{
                      flex: 1,
                      height: '4px',
                      background: `linear-gradient(to right, ${
                        getStageColors(index - 1, totalStages).primary
                      }, ${stageColors.primary})`,
                      borderRadius: '2px',
                    }}
                  />
                )}

                <button
                  onClick={() => onStageClick(stageName)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '16px',
                    border: 'none',
                    background: isActive
                      ? `linear-gradient(135deg, ${stageColors.primary}, ${stageColors.secondary})`
                      : 'rgba(255,255,255,0.15)',
                    color: COLORS.white,
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive
                      ? `0 0 20px ${stageColors.primary}50, 0 0 40px ${stageColors.secondary}40`
                      : `0 0 10px ${stageColors.primary}30`,
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    whiteSpace: 'nowrap',
                    textTransform: 'capitalize',
                  }}
                >
                  {stageName}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Stage Label removed to prevent duplication with the highlighted button */}
      </div>
    </div>
  );
};

export default GlassmorphicNavbar;
