import React, { useEffect, useState } from 'react';
import { COLORS, SOLUTION_COLORS, SOLUTION_TYPES } from '../utils/constants.js';
import { renderTextWithInlineLinks } from '../utils/textParser.js';
import { mlAPI } from '../utils/api.js';

const PainPointModal = ({ painPoint, isOpen, onClose }) => {
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiData, setAiData] = useState({ risk: null, recommendations: [], loading: false, error: null });

  const handleToggleAI = async () => {
    if (!showAIInsights && !aiData.risk && !aiData.loading) {
      setAiData(prev => ({ ...prev, loading: true, error: null }));
      try {
        const [riskRes, recRes] = await Promise.all([
          mlAPI.getRiskClassification(painPoint.description),
          mlAPI.getRecommendations('cad', painPoint.description) // defaulting to cad for now
        ]);
        setAiData({
          risk: riskRes.risk_classification,
          recommendations: recRes.recommendations,
          loading: false,
          error: null
        });
      } catch (err) {
        setAiData(prev => ({ ...prev, loading: false, error: 'Failed to load AI Insights' }));
      }
    }
    setShowAIInsights(!showAIInsights);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !painPoint) return null;

  const renderSolutions = () => {
    if (!painPoint.solutions) {
      return (
        <div style={{ 
          textAlign: 'center', 
          color: COLORS.gray, 
          padding: '2rem',
          fontSize: '1rem'
        }}>
          No solutions available for this pain point
        </div>
      );
    }

    const solutionEntries = Object.entries(painPoint.solutions);
    const hasAnySolutions = solutionEntries.some(([type, solutions]) => {
      return Array.isArray(solutions) ? solutions.length > 0 : Boolean(solutions);
    });

    if (!hasAnySolutions) {
      return (
        <div style={{ 
          textAlign: 'center', 
          color: COLORS.gray, 
          padding: '2rem',
          fontSize: '1rem'
        }}>
          No solutions available for this pain point
        </div>
      );
    }

    return solutionEntries.map(([type, solutions]) => {
      let solutionArray = [];
      
      if (Array.isArray(solutions)) {
        solutionArray = solutions.filter(s => s && s.trim());
      } else if (typeof solutions === 'string' && solutions.trim()) {
        solutionArray = [solutions];
      }
      
      if (solutionArray.length === 0) return null;
      
      return (
        <div key={type} style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: `2px solid ${SOLUTION_COLORS[type] || COLORS.primaryTeal}`
          }}>
            <div style={{
              width: '8px',
              height: '24px',
              background: SOLUTION_COLORS[type] || COLORS.primaryTeal,
              borderRadius: '4px',
              marginRight: '1rem'
            }} />
            <h4 style={{ 
              color: SOLUTION_COLORS[type] || COLORS.primaryTeal,
              textTransform: 'capitalize',
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              {SOLUTION_TYPES[type] || type.replace('_', ' ')}
            </h4>
            <span style={{
              marginLeft: 'auto',
              color: COLORS.gray,
              background: `${COLORS.lightGray}33`,
              padding: '0.2rem 0.6rem',
              borderRadius: '10px',
              fontSize: '0.8rem'
            }}>
              {solutionArray.length} solution{solutionArray.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div style={{ paddingLeft: '1.5rem' }}>
            {solutionArray.map((solution, index) => (
              <div 
                key={index} 
                style={{ 
                  marginBottom: '1rem',
                  padding: '1.5rem',
                  background: COLORS.white,
                  borderRadius: '12px',
                  border: `2px solid ${COLORS.black}`,
                  borderLeft: `6px solid ${SOLUTION_COLORS[type] || COLORS.primaryTeal}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                <p style={{
                  color: COLORS.black,
                  margin: 0,
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  fontWeight: '500'
                }}>
                  {renderTextWithInlineLinks(solution, { color: SOLUTION_COLORS[type] || COLORS.primaryTeal })}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  const renderNewFields = () => {
    const hasCoverage = painPoint.coverage && painPoint.coverage.trim();
    const hasExistingSolutions = painPoint.existing_solutions && painPoint.existing_solutions.trim();

    if (!hasCoverage && !hasExistingSolutions) return null;

    if (!hasCoverage && !hasExistingSolutions) return null;

    return (
      <div style={{ marginBottom: '2rem' }}>
        {/* AI Insights Section */}
        <div style={{ marginBottom: '2rem', background: '#f8f9fa', borderRadius: '12px', padding: '1rem', border: `1px solid ${COLORS.lightGray}` }}>
          <button 
            onClick={handleToggleAI}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: COLORS.primaryTeal,
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🤖</span> AI Risk & Recommendations
            </div>
            <span>{showAIInsights ? '▲' : '▼'}</span>
          </button>
          
          {showAIInsights && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${COLORS.lightGray}` }}>
              {aiData.loading ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: COLORS.gray }}>
                  Loading AI analysis...
                </div>
              ) : aiData.error ? (
                <div style={{ color: COLORS.accentOrange, textAlign: 'center' }}>{aiData.error}</div>
              ) : (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontWeight: '600', marginRight: '0.5rem' }}>Clinical Risk Level:</span>
                    <span style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      background: aiData.risk === 'CRITICAL' ? '#ffebee' : 
                                 aiData.risk === 'HIGH' ? '#fff3e0' : 
                                 aiData.risk === 'MODERATE' ? '#e8f5e9' : '#f3f4f6',
                      color: aiData.risk === 'CRITICAL' ? '#d32f2f' : 
                             aiData.risk === 'HIGH' ? '#ed6c02' : 
                             aiData.risk === 'MODERATE' ? '#2e7d32' : COLORS.gray
                    }}>
                      {aiData.risk || 'UNKNOWN'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Predictive Solutions:</span>
                    {aiData.recommendations.map((rec, idx) => (
                      <div key={idx} style={{ 
                        background: COLORS.white, 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        marginBottom: '0.5rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        borderLeft: `4px solid ${COLORS.primaryTeal}`
                      }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>{rec.content}</div>
                        <div style={{ fontSize: '0.8rem', color: COLORS.gray, fontWeight: 'bold' }}>Similarity: {rec.similarity_score}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coverage Section */}
        {hasCoverage && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: `2px solid ${COLORS.primaryTeal}`
            }}>
              <div style={{
                width: '8px',
                height: '24px',
                background: COLORS.primaryTeal,
                borderRadius: '4px',
                marginRight: '1rem'
              }} />
              <h4 style={{ 
                color: COLORS.primaryTeal,
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                Our Portfolio Coverage
              </h4>
            </div>
            
            <div style={{ paddingLeft: '1.5rem' }}>
                <div style={{ 
                  marginBottom: '1rem',
                  padding: '1.5rem',
                  background: COLORS.white,
                  borderRadius: '12px',
                  border: `2px solid ${COLORS.black}`,
                  borderLeft: `6px solid ${COLORS.primaryTeal}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                  <p style={{
                    color: COLORS.black,
                    margin: 0,
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    fontWeight: '500',
                    whiteSpace: 'pre-line'
                  }}>
                    {renderTextWithInlineLinks(painPoint.coverage, { color: COLORS.primaryTeal })}
                  </p>
                </div>
            </div>
          </div>
        )}

        {/* Existing Solutions Section */}
        {hasExistingSolutions && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: `2px solid ${COLORS.accentOrange}`
            }}>
              <div style={{
                width: '8px',
                height: '24px',
                background: COLORS.accentOrange,
                borderRadius: '4px',
                marginRight: '1rem'
              }} />
              <h4 style={{ 
                color: COLORS.accentOrange,
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                Existing or Potential Solutions
              </h4>
            </div>
            
            <div style={{ paddingLeft: '1.5rem' }}>
                <div style={{ 
                  marginBottom: '1rem',
                  padding: '1.5rem',
                  background: COLORS.white,
                  borderRadius: '12px',
                  border: `2px solid ${COLORS.black}`,
                  borderLeft: `6px solid ${COLORS.accentOrange}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                  <p style={{
                    color: COLORS.black,
                    margin: 0,
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    fontWeight: '500',
                    whiteSpace: 'pre-line'
                  }}>
                    {renderTextWithInlineLinks(painPoint.existing_solutions, { color: COLORS.accentOrange })}
                  </p>
                </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          maxWidth: '900px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          background: COLORS.white,
          border: `2px solid ${COLORS.black}`,
          borderRadius: '20px',
          zIndex: 1001,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          flexShrink: 0,
          padding: '2rem 2rem 1rem',
          borderBottom: `2px solid ${COLORS.lightGray}`,
          background: `${COLORS.primaryTealLight}15`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{
                color: COLORS.primaryTeal,
                marginBottom: '1rem',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                Pain Point Details
              </h2>
              <p style={{
                color: COLORS.black,
                margin: 0,
                fontSize: '1rem',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {renderTextWithInlineLinks(painPoint.description, { color: COLORS.primaryTeal })}
              </p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                background: `${COLORS.accentOrange}20`,
                border: `2px solid ${COLORS.accentOrange}`,
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: COLORS.accentOrange,
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                marginLeft: '1rem',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `${COLORS.accentOrange}30`;
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${COLORS.accentOrange}20`;
                e.target.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Solutions Content */}
        <div style={{
          flex: 1,
          padding: '2rem 2rem 0 2rem', // Removed bottom padding since some browsers ignore it on scrolling flex children
          overflowY: 'auto'
        }}>
          <h3 style={{
            color: COLORS.accentOrange,
            marginBottom: '1.5rem',
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            Available Solutions
          </h3>
          
          {renderSolutions()}
          
          {/* New Fields in Solutions Section */}
          {renderNewFields()}
          
          {/* Spacer to prevent harsh cutoff at the bottom */}
          <div style={{ height: '2rem', flexShrink: 0 }} />
        </div>

        {/* Footer with Source Links */}
        {painPoint.sources && (
          <div style={{
            flexShrink: 0,
            padding: '1.5rem 2rem',
            borderTop: `2px solid ${COLORS.lightGray}`,
            background: `${COLORS.lightGray}10`
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem'
            }}>
              <span style={{ 
                color: COLORS.primaryTealLight, 
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Sources & References
              </span>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {(painPoint.sources.match(/https?:\/\/[^\s]+/gi) || [])
                  .map(link => link.replace(/,+$/, '')) // Clean trailing commas
                  .map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: COLORS.primaryTeal,
                        textDecoration: 'none',
                        padding: '0.6rem 1.2rem',
                        background: `${COLORS.primaryTeal}10`,
                        borderRadius: '8px',
                        border: `2px solid ${COLORS.primaryTeal}30`,
                        transition: 'all 0.3s ease',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${COLORS.primaryTeal}20`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = COLORS.primaryTeal;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${COLORS.primaryTeal}10`;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = `${COLORS.primaryTeal}30`;
                      }}
                    >
                      <span>Source {index + 1}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>↗</span>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PainPointModal;
