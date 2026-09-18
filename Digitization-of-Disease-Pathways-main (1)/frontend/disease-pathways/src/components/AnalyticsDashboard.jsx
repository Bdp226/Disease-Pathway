import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { API_BASE_URL, COLORS } from '../utils/constants.js';

const SEVERITY_COLORS = {
  critical: '#ff4444',
  high: '#ff8c00',
  medium: '#ffd700',
  low: '#44cc77',
  unclassified: '#888'
};

const SimilarDiseases = ({ diseaseName }) => {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!diseaseName) return;
    fetch(`${API_BASE_URL}/diseases/${diseaseName}/similar?top_k=3`)
      .then(r => r.json())
      .then(data => setSimilar(data.similar_diseases || []))
      .catch(() => setSimilar([]))
      .finally(() => setLoading(false));
  }, [diseaseName]);

  if (loading || similar.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(0,153,153,0.06)',
      border: `1px solid ${COLORS.primaryTeal}30`,
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        fontSize: '0.8rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        color: COLORS.primaryTeal,
        marginBottom: '0.75rem'
      }}>
        Similar Diseases
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {similar.map(d => (
          <a
            key={d.name}
            href={`/pathway/${d.name}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(0,153,153,0.1)',
              border: `1px solid ${COLORS.primaryTeal}40`,
              color: COLORS.primaryTeal,
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0,153,153,0.22)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0,153,153,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontWeight: 600 }}>{d.name.replace(/-/g, ' ')}</span>
            <span style={{ opacity: 0.7 }}> {Math.round(d.similarity * 100)}% Match</span>
            <span
              title={`Similarity Metrics Breakdown:\nModel: BM25 Lexical Intersection\nShared terms found: ${d.overlapping_terms && d.overlapping_terms.length > 0 ? d.overlapping_terms.join(', ') : 'None'}\n\nThe percentage reflects the normalized lexical overlap score between the pain points of these two diseases.`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '6px',
                background: 'rgba(0, 255, 204, 0.1)',
                color: '#00ffcc',
                cursor: 'help',
                marginLeft: '6px',
                border: '1px solid rgba(0, 255, 204, 0.2)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 204, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 204, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 204, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 204, 0.2)';
              }}
            >
              <Info size={14} />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/analytics/summary`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE_URL}/trending?limit=5`).then(r => r.json()).catch(() => ({ trending: [] }))
    ]).then(([analytics, trendData]) => {
      setData(analytics);
      setTrending(trendData?.trending || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: COLORS.primaryTeal }}>
      Loading analytics...
    </div>
  );

  if (!data) return null;

  const severityOrder = ['critical', 'high', 'medium', 'low', 'unclassified'];
  const totalPP = data.total_pain_points || 0;

  return (
    <div style={{
      background: COLORS.white,
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
      border: `1px solid ${COLORS.lightGray}`
    }}>
      <h2 style={{
        color: COLORS.gray,
        fontSize: '1.4rem',
        fontWeight: '700',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        Analytics Dashboard
      </h2>

      {/* Severity Distribution */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
          Severity Distribution
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {severityOrder.map(sev => {
            const count = data.severity_distribution?.[sev] || 0;
            if (count === 0) return null;
            const pct = totalPP > 0 ? Math.round((count / totalPP) * 100) : 0;
            return (
              <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '80px', fontSize: '0.78rem', color: SEVERITY_COLORS[sev], fontWeight: '600', textTransform: 'capitalize' }}>
                  {sev}
                </div>
                <div style={{ flex: 1, background: `${COLORS.lightGray}50`, borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: SEVERITY_COLORS[sev],
                    borderRadius: '4px',
                    transition: 'width 0.8s ease'
                  }} />
                </div>
                <div style={{ width: '50px', fontSize: '0.78rem', color: '#888', textAlign: 'right' }}>
                  {count} ({pct}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Tags */}
      {Object.keys(data.top_tags || {}).length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
            Top Tags
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(data.top_tags).map(([tag, count], i) => (
              <span key={tag} style={{
                padding: '4px 12px',
                borderRadius: '12px',
                background: `${COLORS.primaryTeal}15`,
                border: `1px solid ${COLORS.primaryTeal}30`,
                color: COLORS.primaryTeal,
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {tag} <span style={{ opacity: 0.6 }}>({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Disease Distribution */}
      {Object.keys(data.disease_distribution || {}).length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
            Pain Points by Disease
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(data.disease_distribution).map(([disease, count]) => (
              <div key={disease} style={{
                padding: '6px 14px',
                borderRadius: '10px',
                background: COLORS.white,
                border: `1px solid ${COLORS.lightGray}`,
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: COLORS.white }}>{count}</span>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'capitalize' }}>{disease}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
            Trending Pain Points
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trending.map((pp, i) => (
              <div key={pp.id} style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {i + 1}. {pp.description}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {pp.severity && (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '8px',
                      border: `1px solid ${SEVERITY_COLORS[pp.severity]}`,
                      color: SEVERITY_COLORS[pp.severity],
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>{pp.severity}</span>
                  )}
                  <span style={{ fontSize: '0.78rem', color: COLORS.primaryTeal, fontWeight: '600' }}>
                    Views: {pp.view_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { SimilarDiseases, AnalyticsDashboard };
export default AnalyticsDashboard;
