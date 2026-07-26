import React, { useState, useEffect } from 'react';
import PainPointCard from './PainPointCard.jsx';
import PainPointModal from './PainPointModal.jsx';
import StakeholderSection from './StakeholderSection.jsx';
import FormattedText from './FormattedText.jsx';
import LoadMoreButton from './LoadMoreButton.jsx';
import { COLORS, getStageColors } from '../utils/constants.js';

const PinterestLayout = ({ 
  stages, 
  activeStage, 
  onStageClick, 
  stageRefs, 
  visitedStages, 
  isDarkTheme = false,
  onLoadMorePainPoints,
  onShowLessPainPoints,
  expandedStages = {},
  loadingStages = {},
  stageErrors = {}
}) => {
  const [selectedPainPoint, setSelectedPainPoint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const styleId = 'pinterest-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleCardClick = (painPoint) => {
    setSelectedPainPoint(painPoint);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPainPoint(null);
  };

  const stageEntries = Object.entries(stages);

  return (
    <div
      className="pinterest-container"
      style={{ animation: 'fadeIn 0.6s ease-out' }}
    >
      {stageEntries.map(([stageName, stageData], stageIndex) => {
        const hasStakeholders = stageData.stakeholders?.trim();
        const hasOverview = stageData.overview?.trim();
        const stageColors = getStageColors(stageIndex, stageEntries.length);

        const isExpanded = expandedStages[stageName] || false;
        const isLoading = loadingStages[stageName] || false;
        const stageError = stageErrors[stageName] || null;
        const painPointCount = stageData.pain_points?.length || 0;
        const totalPainPoints = stageData.total_pain_points || painPointCount;

        return (
          <div
            key={stageName}
            ref={(el) => {
              if (el && stageRefs) {
                stageRefs.current[stageName] = el;
              }
            }}
            className="stage-section"
            style={{
              marginBottom: '4rem',
              scrollMarginTop: '100px', // FIX: Prevents sticky navbar from covering stage on scroll
              animation: 'fadeIn 0.6s ease-out',
              background: isDarkTheme ? '#000000' : '#ffffff',
              borderRadius: '24px',
              padding: '3rem 2rem',
              border: `2px solid ${stageColors.primary}`,
              transition: 'all 0.3s ease'
            }}
          >
            {/* ===== STAGE OVERVIEW ===== */}
            {hasOverview && (
              <div
                style={{
                  width: '100%',
                  marginBottom: '3rem',
                  cursor: onStageClick ? 'pointer' : 'default'
                }}
                onClick={() => onStageClick?.(stageName)}
              >
                <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: '200px' }}>
                    <h1
                      style={{
                        color: stageColors.primary,
                        textTransform: 'capitalize',
                        fontSize: '2.5rem',
                        margin: 0,
                        fontWeight: '700'
                      }}
                    >
                      {stageData.name}
                    </h1>
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        color: isDarkTheme ? COLORS.white : COLORS.black,
                        fontSize: '1.1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '0.5rem',
                        opacity: 0.8
                      }}
                    >
                      Stage Overview
                    </h3>
                    <FormattedText
                      text={stageData.overview}
                      type="overview"
                      stageColors={stageColors}
                      isDarkTheme={isDarkTheme}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ===== STAKEHOLDERS ===== */}
            {hasStakeholders && (
              <div style={{ marginBottom: '3rem' }}>
                <StakeholderSection
                  stakeholders={stageData.stakeholders}
                  stageColors={stageColors}
                  isDarkTheme={isDarkTheme}
                />
              </div>
            )}

            {/* ===== PAIN POINTS ===== */}
            {stageData.pain_points?.length > 0 && (
              <>
                <div
                  className="pinterest-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem',
                    opacity: isLoading ? 0.7 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {stageData.pain_points.map((painPoint, index) => (
                    <div
                      key={index}
                      style={{
                        animation: isExpanded && index >= 7 ? 'fadeInUp 0.5s ease-out' : 'none'
                      }}
                    >
                      <PainPointCard
                        painPoint={painPoint}
                        index={index}
                        onClick={() => handleCardClick(painPoint)}
                        stageColors={stageColors}
                        isDarkTheme={isDarkTheme}
                      />
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '2.5rem'
                  }}
                >
                  <LoadMoreButton
                    stageName={stageName}
                    stageColors={stageColors}
                    isLoading={isLoading}
                    isExpanded={isExpanded}
                    painPointCount={painPointCount}
                    totalPainPoints={totalPainPoints}
                    onLoadMore={onLoadMorePainPoints}
                    onShowLess={onShowLessPainPoints}
                    error={stageError}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}

      <PainPointModal
        painPoint={selectedPainPoint}
        isOpen={modalOpen}
        onClose={closeModal}
        isDarkTheme={isDarkTheme}
      />
    </div>
  );
};

export default PinterestLayout;