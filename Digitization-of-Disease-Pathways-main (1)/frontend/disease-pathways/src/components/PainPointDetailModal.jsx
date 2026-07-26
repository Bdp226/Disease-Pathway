import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { painPointAPI } from '../utils/api.js';
import { COLORS } from '../utils/constants.js';
import { MdClose, MdCheckCircle, MdCancel, MdPerson, MdDateRange, MdDescription } from 'react-icons/md';

const PainPointDetailModal = ({ painPoint, isOpen, onClose, onUpdate }) => {
  const [processing, setProcessing] = useState(null); // 'approve' or 'deny'

  const handleApprove = async () => {
    setProcessing('approve');
    try {
      await painPointAPI.approvePainPoint(painPoint.id);
      onUpdate('approved', `Pain point approved successfully`);
      onClose();
    } catch (error) {
      console.error('Approve error:', error);
      onUpdate('error', error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async () => {
    setProcessing('deny');
    try {
      await painPointAPI.denyPainPoint(painPoint.id);
      onUpdate('denied', `Pain point denied successfully`);
      onClose();
    } catch (error) {
      console.error('Deny error:', error);
      onUpdate('error', error.message);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'denied': return '#f44336';
      case 'pending': return COLORS.accentOrange;
      default: return COLORS.gray;
    }
  };

  const getStatusBadge = (status) => ({
    background: `${getStatusColor(status)}15`,
    color: getStatusColor(status),
    border: `1px solid ${getStatusColor(status)}30`,
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'capitalize',
    display: 'inline-block'
  });

  if (!isOpen || !painPoint) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1002,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    >
      <div style={{
        background: COLORS.white,
        borderRadius: '20px',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: `1px solid ${COLORS.lightGray}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <MdDescription style={{
              fontSize: '2rem',
              color: COLORS.primaryTeal
            }} />
            <div>
              <h2 style={{
                color: COLORS.gray,
                fontSize: '1.8rem',
                fontWeight: '700',
                margin: 0
              }}>
                Pain Point Details
              </h2>
              <div style={getStatusBadge(painPoint.status)}>
                {painPoint.status}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.gray,
              fontSize: '1.8rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <MdClose />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Disease & Pain Point */}
          <div style={{
            background: `${COLORS.primaryTeal}08`,
            border: `1px solid ${COLORS.primaryTeal}20`,
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: COLORS.primaryTeal,
              fontSize: '1.3rem',
              fontWeight: '700',
              margin: '0 0 1rem 0'
            }}>
              {painPoint.disease_name}
            </h3>
            
            <div style={{
              color: COLORS.gray,
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}>
              <strong style={{ color: COLORS.gray }}>Pain Point:</strong>
              <div style={{ 
                marginTop: '0.5rem',
                background: COLORS.white,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${COLORS.lightGray}`
              }}>
                {painPoint.pain_point}
              </div>
            </div>

            {painPoint.solution && (
              <div style={{
                color: COLORS.gray,
                fontSize: '1rem',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                <strong style={{ color: COLORS.accentOrange }}>Proposed Solution:</strong>
                <div style={{ 
                  marginTop: '0.5rem',
                  background: COLORS.white,
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `1px solid ${COLORS.lightGray}`
                }}>
                  {painPoint.solution}
                </div>
              </div>
            )}

            {painPoint.source && (
              <div style={{
                color: COLORS.gray,
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: COLORS.gray }}>Source:</strong>
                <div style={{ 
                  marginTop: '0.5rem',
                  background: COLORS.white,
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `1px solid ${COLORS.lightGray}`,
                  wordBreak: 'break-all'
                }}>
                  {painPoint.source}
                </div>
              </div>
            )}
          </div>

          {/* User Information */}
          <div style={{
            background: `${COLORS.gray}08`,
            border: `1px solid ${COLORS.gray}20`,
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <MdPerson style={{
                fontSize: '1.5rem',
                color: COLORS.gray
              }} />
              <h4 style={{
                color: COLORS.gray,
                fontSize: '1.2rem',
                fontWeight: '600',
                margin: 0
              }}>
                Submitted by
              </h4>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              color: COLORS.gray,
              fontSize: '0.95rem'
            }}>
              <div>
                <strong>Name:</strong> {painPoint.user_full_name}
              </div>
              <div>
                <strong>Email:</strong> {painPoint.user_email}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              color: COLORS.gray,
              fontSize: '0.9rem',
              opacity: 0.8
            }}>
              <MdDateRange />
              <span>
                Submitted on {new Date(painPoint.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Action Buttons - Only show if pending */}
          {painPoint.status === 'pending' && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleDeny}
                disabled={processing}
                style={{
                  padding: '1rem 1.5rem',
                  background: processing === 'deny' 
                    ? COLORS.lightGray 
                    : 'rgba(244, 67, 54, 0.1)',
                  color: processing === 'deny' ? COLORS.gray : '#f44336',
                  border: processing === 'deny' ? 'none' : '2px solid rgba(244, 67, 54, 0.3)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <MdCancel />
                {processing === 'deny' ? 'Denying...' : 'Deny'}
              </button>

              <button
                onClick={handleApprove}
                disabled={processing}
                style={{
                  padding: '1rem 1.5rem',
                  background: processing === 'approve' 
                    ? COLORS.lightGray 
                    : 'rgba(76, 175, 80, 0.1)',
                  color: processing === 'approve' ? COLORS.gray : '#4caf50',
                  border: processing === 'approve' ? 'none' : '2px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <MdCheckCircle />
                {processing === 'approve' ? 'Approving...' : 'Approve'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PainPointDetailModal;
