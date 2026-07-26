import React, { useEffect } from 'react';
import { COLORS, SOLUTION_COLORS, SOLUTION_TYPES } from '../utils/constants.js';
import { parseTextWithLinks } from '../utils/textParser.js';

const PainPointModal = ({ painPoint, isOpen, onClose }) => {
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
                  {solution}
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

    // ✅ Parse coverage and existing solutions
    const coverageItems = hasCoverage ? parseTextWithLinks(painPoint.coverage) : [];
    const solutionItems = hasExistingSolutions ? parseTextWithLinks(painPoint.existing_solutions) : [];

    return (
      <div style={{ marginBottom: '2rem' }}>
        {/* Coverage Section */}
        {coverageItems.length > 0 && (
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
              {coverageItems.map((item, index) => (
                <div 
                  key={index}
                  style={{ 
                    marginBottom: '1rem',
                    padding: '1.5rem',
                    background: COLORS.white,
                    borderRadius: '12px',
                    border: `2px solid ${COLORS.black}`,
                    borderLeft: `6px solid ${COLORS.primaryTeal}`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {/* Text Description */}
                  <p style={{
                    color: COLORS.black,
                    margin: item.urls.length > 0 ? '0 0 1rem 0' : 0,
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    fontWeight: '500'
                  }}>
                    {item.text}
                  </p>

                  {/* URLs - Show as clickable links */}
                  {item.urls.length > 0 && (
                    <div style={{ 
                      paddingTop: '0.5rem',
                      borderTop: item.urls.length > 0 ? `1px dashed ${COLORS.primaryTeal}30` : 'none'
                    }}>
                      {item.urls.map((url, urlIndex) => (
                        <div key={urlIndex} style={{ marginBottom: '0.5rem' }}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: COLORS.primaryTeal,
                              textDecoration: 'none',
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              transition: 'all 0.3s ease',
                              wordBreak: 'break-all',
                              display: 'inline-block'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = COLORS.primaryTealDark;
                              e.target.style.borderBottom = `1px solid ${COLORS.primaryTealDark}`;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = COLORS.primaryTeal;
                            }}
                          >
                            🔗 {url}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Solutions Section */}
        {solutionItems.length > 0 && (
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
              {solutionItems.map((item, index) => (
                <div 
                  key={index}
                  style={{ 
                    marginBottom: '1rem',
                    padding: '1.5rem',
                    background: COLORS.white,
                    borderRadius: '12px',
                    border: `2px solid ${COLORS.black}`,
                    borderLeft: `6px solid ${COLORS.accentOrange}`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {/* Text Description */}
                  <p style={{
                    color: COLORS.black,
                    margin: item.urls.length > 0 ? '0 0 1rem 0' : 0,
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    fontWeight: '500'
                  }}>
                    {item.text}
                  </p>

                  {/* URLs - Show as clickable links */}
                  {item.urls.length > 0 && (
                    <div style={{ 
                      paddingTop: '0.5rem',
                      borderTop: item.urls.length > 0 ? `1px dashed ${COLORS.accentOrange}30` : 'none'
                    }}>
                      {item.urls.map((url, urlIndex) => (
                        <div key={urlIndex} style={{ marginBottom: '0.5rem' }}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: COLORS.accentOrange,
                              textDecoration: 'none',
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              transition: 'all 0.3s ease',
                              wordBreak: 'break-all',
                              display: 'inline-block'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = COLORS.accentOrangeDark;
                              e.target.style.borderBottom = `1px solid ${COLORS.accentOrangeDark}`;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = COLORS.accentOrange;;
                            }}
                          >
                            🔗 {url}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
                lineHeight: '1.6'
              }}>
                {painPoint.description}
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
          padding: '2rem',
          maxHeight: 'calc(85vh - 200px)',
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
        </div>

        {/* Footer with Source Links */}
        {painPoint.sources && (
          <div style={{
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
                {painPoint.sources
                  .split(/[\s,]+/) // Splits by whitespace or commas
                  .filter(link => link.trim().startsWith('http')) // Only keep valid links
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
