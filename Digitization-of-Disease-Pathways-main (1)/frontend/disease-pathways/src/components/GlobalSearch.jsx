import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, API_BASE_URL } from '../utils/constants.js';

const SEVERITY_COLORS = {
  critical: '#ff4444',
  high: '#ff8c00',
  medium: '#ffd700',
  low: '#44cc77',
};

const GlobalSearch = ({ isDarkTheme = false }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, k: 8 })
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      setError('Search failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 350);
  };

  const highlightMatch = (text, query) => {
    if (!query.trim() || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background:#ffd70033;color:inherit;border-radius:2px;padding:0 2px">$1</mark>');
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      title="Search (Ctrl+K)"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: '20px',
        border: `1px solid ${COLORS.primaryTeal}40`,
        background: `rgba(0,188,212,0.08)`,
        color: COLORS.primaryTeal,
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '500',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={e => e.currentTarget.style.background = `rgba(0,188,212,0.18)`}
      onMouseLeave={e => e.currentTarget.style.background = `rgba(0,188,212,0.08)`}
    >
      🔍 Search
      <kbd style={{
        padding: '1px 6px',
        borderRadius: '4px',
        border: `1px solid ${COLORS.primaryTeal}40`,
        fontSize: '0.7rem',
        fontFamily: 'monospace'
      }}>⌘K</kbd>
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => { setOpen(false); setQuery(''); setResults([]); }}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9000
        }}
      />

      {/* Search Panel */}
      <div style={{
        position: 'fixed',
        top: '10vh',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '660px',
        zIndex: 9001,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        border: `1px solid ${COLORS.primaryTeal}40`
      }}>
        {/* Input bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          background: isDarkTheme ? '#1a1a2e' : '#ffffff',
          gap: '12px',
          borderBottom: results.length > 0 || loading ? `1px solid ${COLORS.primaryTeal}20` : 'none'
        }}>
          <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Search pain points, diseases, stages..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: isDarkTheme ? '#ffffff' : '#111111',
              fontSize: '1.1rem',
              fontFamily: 'inherit'
            }}
          />
          {loading && (
            <span style={{ fontSize: '0.8rem', color: COLORS.primaryTeal, opacity: 0.8 }}>
              Searching...
            </span>
          )}
          <kbd
            onClick={() => { setOpen(false); setQuery(''); setResults([]); }}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              border: `1px solid rgba(128,128,128,0.3)`,
              fontSize: '0.75rem',
              color: '#888',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            Esc
          </kbd>
        </div>

        {/* Results */}
        {error && (
          <div style={{
            padding: '16px 20px',
            background: isDarkTheme ? '#1a1a2e' : '#fff',
            color: '#ff4444',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div style={{
            maxHeight: '65vh',
            overflowY: 'auto',
            background: isDarkTheme ? '#12122a' : '#f9f9f9'
          }}>
            <div style={{
              padding: '8px 20px 4px',
              fontSize: '0.75rem',
              color: '#888',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {results.length} results
            </div>
            {results.map((r, i) => (
              <div
                key={i}
                onClick={() => {
                  setOpen(false);
                  if (r.disease) {
                    const params = new URLSearchParams();
                    if (r.stage) params.append('stage', r.stage);
                    navigate(`/pathway/${encodeURIComponent(r.disease)}?${params.toString()}`);
                  }
                }}
                style={{
                  padding: '14px 20px',
                  borderBottom: `1px solid rgba(128,128,128,0.1)`,
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = isDarkTheme ? 'rgba(0,188,212,0.1)' : 'rgba(0,188,212,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Metadata row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  {r.disease && (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: `${COLORS.primaryTeal}22`,
                      color: COLORS.primaryTeal,
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      textTransform: 'capitalize'
                    }}>
                      {r.disease}
                    </span>
                  )}
                  {r.stage && (
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>
                      › {r.stage}
                    </span>
                  )}
                  {r.severity && (
                    <span style={{
                      padding: '1px 7px',
                      borderRadius: '10px',
                      border: `1px solid ${SEVERITY_COLORS[r.severity] || '#888'}`,
                      color: SEVERITY_COLORS[r.severity] || '#888',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {r.severity}
                    </span>
                  )}
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.7rem',
                    color: '#888',
                    background: 'rgba(128,128,128,0.1)',
                    padding: '1px 6px',
                    borderRadius: '8px'
                  }}>
                    {Math.round((r.relevance_score || 0) * 10) / 10} score
                  </span>
                </div>
                {/* Text with highlight */}
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    color: isDarkTheme ? 'rgba(255,255,255,0.85)' : '#222',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: highlightMatch(r.text?.substring(0, 300), query)
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {query.length > 0 && !loading && results.length === 0 && !error && (
          <div style={{
            padding: '32px 20px',
            textAlign: 'center',
            background: isDarkTheme ? '#12122a' : '#f9f9f9',
            color: '#888',
            fontSize: '0.9rem'
          }}>
            No results found for "<strong>{query}</strong>"
          </div>
        )}

        {/* Footer hint */}
        {query.length === 0 && (
          <div style={{
            padding: '16px 20px',
            background: isDarkTheme ? '#12122a' : '#f9f9f9',
            color: '#888',
            fontSize: '0.8rem'
          }}>
            Search across all diseases, pain points, and stages using AI-powered semantic search.
          </div>
        )}
      </div>
    </>
  );
};

export default GlobalSearch;
