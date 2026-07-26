import React, { useState, useEffect } from 'react';
import { painPointAPI } from '../utils/api.js';
import { COLORS } from '../utils/constants.js';
import PainPointDetailModal from './PainPointDetailModal.jsx';
import { MdCheckCircle, MdCancel, MdVisibility, MdRefresh } from 'react-icons/md';

const PainPointManagement = () => {
  const [painPoints, setPainPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedPainPoint, setSelectedPainPoint] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Load pain points
  const loadPainPoints = async (status = selectedStatus, pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const data = await painPointAPI.getPainPoints(status, pageNum, 25);
      
      if (append) {
        setPainPoints(prev => [...prev, ...data.items]);
      } else {
        setPainPoints(data.items);
      }
      
      setTotalItems(data.total);
      setHasMore(pageNum < data.total_pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Load pain points error:', error);
      setMessage(`✗ ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPainPoints(selectedStatus, 1, false);
  }, [selectedStatus]);

  // Handle status filter change
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setPage(1);
    // loadPainPoints will be called by useEffect
  };

  // Load more items
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPainPoints(selectedStatus, page + 1, true);
    }
  };

  // Handle quick approve/deny from list
  const handleQuickAction = async (painPointId, action) => {
    try {
      if (action === 'approve') {
        await painPointAPI.approvePainPoint(painPointId);
        setMessage('✓ Pain point approved successfully');
      } else {
        await painPointAPI.denyPainPoint(painPointId);
        setMessage('✓ Pain point denied successfully');
      }
      
      // Refresh the list
      setTimeout(() => {
        loadPainPoints(selectedStatus, 1, false);
        setMessage('');
      }, 1500);
      
    } catch (error) {
      setMessage(`✗ ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Handle detail modal update
  const handleDetailUpdate = (status, message) => {
    setMessage(`✓ ${message}`);
    setTimeout(() => {
      loadPainPoints(selectedStatus, 1, false);
      setMessage('');
    }, 1500);
  };

  // Open detail modal
  const openDetailModal = (painPoint) => {
    setSelectedPainPoint(painPoint);
    setIsDetailModalOpen(true);
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: `${COLORS.accentOrange}15`, color: COLORS.accentOrange, border: `${COLORS.accentOrange}30` },
      approved: { bg: '#4caf5015', color: '#4caf50', border: '#4caf5030' },
      denied: { bg: '#f4433615', color: '#f44336', border: '#f4433630' }
    };
    
    const colorSet = colors[status] || colors.pending;
    
    return {
      background: colorSet.bg,
      color: colorSet.color,
      border: `1px solid ${colorSet.border}`,
      padding: '0.3rem 0.7rem',
      borderRadius: '15px',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-block'
    };
  };

  return (
    <div style={{
      background: COLORS.white,
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${COLORS.lightGray}`,
      padding: '2rem',
      marginTop: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{
            color: COLORS.gray,
            fontSize: '1.8rem',
            fontWeight: '700',
            margin: 0
          }}>
            Pain Point Requests
          </h2>
          <p style={{
            color: COLORS.gray,
            fontSize: '1rem',
            margin: '0.5rem 0 0 0',
            opacity: 0.7
          }}>
            {totalItems} {selectedStatus === 'all' ? 'total' : selectedStatus} pain points found
          </p>
        </div>

        <button
          onClick={() => loadPainPoints(selectedStatus, 1, false)}
          disabled={loading}
          style={{
            padding: '0.75rem 1rem',
            background: 'transparent',
            color: COLORS.primaryTeal,
            border: `2px solid ${COLORS.primaryTeal}`,
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: loading ? 0.6 : 1
          }}
        >
          <MdRefresh style={{ fontSize: '1rem' }} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: `1px solid ${COLORS.lightGray}`,
        paddingBottom: '1rem'
      }}>
        {['all', 'pending', 'approved', 'denied'].map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            style={{
              padding: '0.75rem 1.5rem',
              background: selectedStatus === status 
                ? `linear-gradient(135deg, ${COLORS.primaryTeal}, ${COLORS.primaryTealLight})` 
                : 'transparent',
              color: selectedStatus === status ? COLORS.white : COLORS.gray,
              border: selectedStatus === status ? 'none' : `1px solid ${COLORS.lightGray}`,
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'capitalize'
            }}
            onMouseEnter={(e) => {
              if (selectedStatus !== status) {
                e.target.style.backgroundColor = `${COLORS.primaryTeal}10`;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedStatus !== status) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Status Message */}
      {message && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontSize: '0.9rem',
          fontWeight: '500',
          background: message.includes('✓') 
            ? 'rgba(76, 175, 80, 0.1)' 
            : 'rgba(244, 67, 54, 0.1)',
          color: message.includes('✓') ? '#4caf50' : '#f44336',
          border: `1px solid ${message.includes('✓') ? '#4caf50' : '#f44336'}30`
        }}>
          {message}
        </div>
      )}

      {/* Table Header */}
      {painPoints.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 120px',
          gap: '1rem',
          padding: '1rem',
          background: `${COLORS.gray}08`,
          borderRadius: '10px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: COLORS.gray
        }}>
          <div>Disease</div>
          <div>Pain Point</div>
          <div>User</div>
          <div>Date</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
      )}

      {/* Pain Points List */}
      {loading && page === 1 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: COLORS.gray,
          opacity: 0.6
        }}>
          Loading pain points...
        </div>
      ) : painPoints.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: COLORS.gray,
          opacity: 0.6
        }}>
          No {selectedStatus === 'all' ? '' : selectedStatus} pain points found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {painPoints.map((painPoint, index) => (
            <div
              key={painPoint.id}
              onClick={() => openDetailModal(painPoint)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 120px',
                gap: '1rem',
                padding: '1rem',
                background: index % 2 === 1 ? `${COLORS.primaryTeal}05` : COLORS.white,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                alignItems: 'center',
                border: `1px solid ${COLORS.lightGray}20`
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {/* Disease Name */}
              <div style={{
                color: COLORS.primaryTeal,
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {painPoint.disease_name}
              </div>

              {/* Pain Point (no truncation as requested) */}
              <div style={{
                color: COLORS.gray,
                lineHeight: '1.4'
              }}>
                {painPoint.pain_point}
              </div>

              {/* User Name */}
              <div style={{
                color: COLORS.gray,
                fontWeight: '500'
              }}>
                {painPoint.user_full_name}
              </div>

              {/* Date */}
              <div style={{
                color: COLORS.gray,
                fontSize: '0.85rem'
              }}>
                {new Date(painPoint.created_at).toLocaleDateString()}
              </div>

              {/* Status */}
              <div>
                <span style={getStatusBadge(painPoint.status)}>
                  {painPoint.status}
                </span>
              </div>

              {/* Actions */}
              <div 
                style={{ display: 'flex', gap: '0.5rem' }}
                onClick={(e) => e.stopPropagation()} // Prevent row click
              >
                <button
                  onClick={() => openDetailModal(painPoint)}
                  style={{
                    padding: '0.4rem',
                    background: `${COLORS.primaryTeal}15`,
                    color: COLORS.primaryTeal,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="View Details"
                >
                  <MdVisibility style={{ fontSize: '1rem' }} />
                </button>

                {painPoint.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleQuickAction(painPoint.id, 'approve')}
                      style={{
                        padding: '0.4rem',
                        background: '#4caf5015',
                        color: '#4caf50',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Approve"
                    >
                      <MdCheckCircle style={{ fontSize: '1rem' }} />
                    </button>

                    <button
                      onClick={() => handleQuickAction(painPoint.id, 'deny')}
                      style={{
                        padding: '0.4rem',
                        background: '#f4433615',
                        color: '#f44336',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Deny"
                    >
                      <MdCancel style={{ fontSize: '1rem' }} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div style={{
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <button
            onClick={handleLoadMore}
            style={{
              padding: '0.75rem 2rem',
              background: `linear-gradient(135deg, ${COLORS.primaryTeal}, ${COLORS.primaryTealLight})`,
              color: COLORS.white,
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Load More ({totalItems - painPoints.length} remaining)
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <PainPointDetailModal
        painPoint={selectedPainPoint}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPainPoint(null);
        }}
        onUpdate={handleDetailUpdate}
      />
    </div>
  );
};

export default PainPointManagement;
