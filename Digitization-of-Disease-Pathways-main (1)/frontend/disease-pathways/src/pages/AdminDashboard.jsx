import React, { useState, useEffect } from 'react';
import { API_BASE_URL, COLORS } from '../utils/constants';

const AdminDashboard = () => {
  const [pendingPainPoints, setPendingPainPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL + '/admin/pending-pain-points');
      if (response.ok) {
        const data = await response.json();
        setPendingPainPoints(data);
      }
    } catch (error) {
      console.error('Failed to fetch pending pain points:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const response = await fetch(API_BASE_URL + '/admin/pain-points/' + id + '/' + action, {
        method: 'POST'
      });
      if (response.ok) {
        setMessage('Pain point successfully ' + action + 'd.');
        fetchPending();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to action pain point:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: COLORS.white }}>
      <h1 style={{ color: COLORS.primaryTeal, marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      {message && (
        <div style={{
          padding: '1rem', background: COLORS.primaryTeal + '22', 
          border: '1px solid ' + COLORS.primaryTeal, borderRadius: '8px',
          marginBottom: '1rem', color: COLORS.primaryTeal
        }}>
          {message}
        </div>
      )}

      <h2>Pending Human Verification ({pendingPainPoints.length})</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : pendingPainPoints.length === 0 ? (
        <p style={{ color: COLORS.gray, fontStyle: 'italic' }}>No pain points are currently waiting for verification.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {pendingPainPoints.map(pp => (
            <div key={pp.id} style={{ 
              background: '#242424', padding: '1.5rem', borderRadius: '12px',
              border: '1px solid ' + COLORS.gray + '33', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: COLORS.accentOrange, fontWeight: 'bold' }}>{pp.disease_name.toUpperCase()}</span>
                  <span style={{ color: COLORS.gray }}>|</span>
                  <span style={{ color: COLORS.primaryTeal }}>{pp.stage_name}</span>
                </div>
                <p style={{ fontSize: '1.1rem', margin: 0, lineHeight: '1.5' }}>{pp.description}</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: COLORS.gray }}>
                  Submitted on: {new Date(pp.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginLeft: '2rem' }}>
                <button 
                  onClick={() => handleAction(pp.id, 'approve')}
                  style={{
                    padding: '0.5rem 1.2rem', borderRadius: '20px', border: 'none',
                    background: COLORS.primaryTeal, color: '#fff', cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleAction(pp.id, 'reject')}
                  style={{
                    padding: '0.5rem 1.2rem', borderRadius: '20px', border: '1px solid #ff4444',
                    background: 'transparent', color: '#ff4444', cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
