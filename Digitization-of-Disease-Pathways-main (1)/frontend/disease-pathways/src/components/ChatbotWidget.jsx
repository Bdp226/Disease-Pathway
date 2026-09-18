import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, API_BASE_URL } from '../utils/constants.js';
import { MdClose, MdSend, MdChat, MdFullscreen, MdFullscreenExit, MdThumbUp, MdThumbDown } from 'react-icons/md';
import { isAuthenticated, getCurrentUser } from '../utils/api.js';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({});  // { msgIndex: 1 or -1 }
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const getDiseaseNameFromUrl = () => {
    const match = location.pathname.match(/\/pathway\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };
  const disease_name = getDiseaseNameFromUrl();

  const [selectedModel, setSelectedModel] = useState("llama");
  const [headerNotice, setHeaderNotice] = useState("");

  const [user, setUser] = useState(getCurrentUser());
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  const modelConfigs = {
    llama: {
      //label: "Llama 3",
      //tag: "General Reasoning",
      greeting: "I'm Axon. Ready to brainstorm pathway logic with you.",
      loadingText: "Axon is thinking..."
    }
  };

  useEffect(() => {
    const updateAuthState = () => {
      setUser(getCurrentUser());
      setAuthenticated(isAuthenticated());
    };
    const handleStorageChange = (e) => {
      if (e.key === 'disease_pathway_token' || e.key === 'disease_pathway_user') {
        updateAuthState();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    updateAuthState();
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const displayFirstName = (authenticated && user?.full_name) 
    ? user.full_name.split(' ')[0] 
    : "Guest";

  const formatDiseaseName = (name = "") => {
    return name
      .replace(/[-_]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isFullscreen, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const messageText = inputValue.trim();
    if (!messageText || isLoading) return;

    const token = localStorage.getItem('disease_pathway_token');
    
    const newMessages = [...messages, { text: messageText, isBot: false }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    // if (!token) {
    //   setMessages(prev => [...prev, { 
    //     text: "Authentication Error: Please log in to your account.", 
    //     isBot: true 
    //   }]);
    //   setIsLoading(false);
    //   return;
    // }

    try {
      let targetDisease = disease_name || "";
      if (!targetDisease) {
        try {
          const listRes = await fetch(`${API_BASE_URL}/diseases`);
          if (listRes.ok) {
            const listData = await listRes.json();
            if (Array.isArray(listData) && listData.length > 0) {
              targetDisease = listData[0].name || "";
            }
          }
        } catch (err) {}
      }

      // Track user message index so we can key the upcoming bot message
      const botMsgIndex = newMessages.length;

      // Add placeholder streaming message
      setMessages(prev => [...prev, { text: '', isBot: true, sources: [], streaming: true }]);

      const token = localStorage.getItem('disease_pathway_token');
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageText,
          model: selectedModel,
          disease_name: targetDisease
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      // Handle streaming plain-text response (backend returns text/plain, not JSON)
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        // Update the message bubble progressively as tokens arrive
        setMessages(prev => prev.map((m, i) =>
          i === botMsgIndex ? { ...m, text: fullText, streaming: true, originalQuery: messageText } : m
        ));
      }

      // Mark streaming as done
      setMessages(prev => prev.map((m, i) =>
        i === botMsgIndex ? { ...m, text: fullText, streaming: false } : m
      ));

    } catch (error) {
      setMessages(prev => [...prev, {
        text: `System Error: Unable to reach the AI. Please try again.`,
        isBot: true,
        streaming: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Announce context when the widget opens
  useEffect(() => {
    if (!isOpen) return;

    const announceContext = async () => {
      if (disease_name) {
        setHeaderNotice(`Context loaded for: ${formatDiseaseName(disease_name)}`);
        return;
      }

      if (window.location.pathname === '/' || window.location.pathname === '') {
        try {
          const res = await fetch(`${API_BASE_URL}/diseases`);
          if (!res.ok) throw new Error('Failed to fetch diseases');
          const data = await res.json();
          const names = (Array.isArray(data) ? data.map(d => formatDiseaseName(d.name)).slice(0, 8) : []).join(', ');
          const text = names ? `Available diseases: ${names}` : 'No diseases currently loaded in the system.';
          setHeaderNotice(text);
        } catch (e) {
          setHeaderNotice('Unable to determine available diseases.');
        }
      } else {
        setHeaderNotice('');
      }
    };

    // Slight delay so the modal animation completes before the message appears
    const t = setTimeout(announceContext, 350);
    return () => clearTimeout(t);
  }, [isOpen, disease_name]);

  const renderChatModal = () => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 2147483647, display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: isFullscreen ? '0' : '2rem',
              backdropFilter: 'blur(8px)'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: '#111',
                borderRadius: isFullscreen ? '0' : '20px',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.06)',
                width: '100%',
                maxWidth: isFullscreen ? '100%' : '900px',
                height: isFullscreen ? '100%' : '85vh',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                border: isFullscreen ? 'none' : `1px solid rgba(255,255,255,0.08)`,
              }}
            >
          
          {/* UPDATED: Model Selection Switcher with Underline Logic */}
          <div style={{
            display: 'flex', 
            background: '#111', 
            padding: '0.75rem 2rem 0 2rem', // Added more horizontal padding
            gap: '2rem', // Increased gap for a cleaner look
            justifyContent: 'flex-start', // Aligning to start for a "tab" feel
            borderBottom: `1px solid ${COLORS.gray}20`
          }}>
          </div>

          {/* Rest of the component remains the same */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 2rem', background: '#1A1A1A',
            borderBottom: messages.length > 0 ? `1px solid ${COLORS.gray}20` : 'none'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: COLORS.primaryTeal, display: 'flex', 
                  alignItems: 'center', justifyContent: 'center' 
                }}>
                  <MdChat style={{ fontSize: '1.2rem', color: COLORS.white }} />
                </div>
                <span style={{ color: COLORS.white, fontWeight: '500', opacity: 0.8 }}>
                  Axon 
                </span>
              </div>
              {headerNotice && (
                <span style={{ color: COLORS.gray, fontSize: '0.95rem', lineHeight: '1.4', maxWidth: '640px' }}>
                  {headerNotice}
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <button onClick={() => setIsFullscreen(!isFullscreen)} style={{ background: 'none', border: 'none', color: COLORS.gray, fontSize: '1.5rem', cursor: 'pointer' }}>
                {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: COLORS.gray, fontSize: '1.8rem', cursor: 'pointer' }}>
                <MdClose />
              </button>
            </div>
          </div>

          <div style={{ 
            flex: 1, 
            padding: '1rem 2rem', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            background: '#1A1A1A' 
          }}>
            <div style={{
              width: '100%',
              maxWidth: '800px', // Limits text width so it doesn't stretch too far
              margin: '0 auto',   // Centers the column
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {messages.length === 0 ? (
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  textAlign: 'center', 
                  paddingBottom: '10vh'
                }}>
                  <h1 style={{
                    fontSize: '3.5rem', fontWeight: '600', margin: '0',
                    background: `linear-gradient(to right, ${COLORS.primaryTeal}, ${COLORS.accentOrange})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    fontFamily: 'SHBree, sans-serif'
                  }}>
                    Hello, {displayFirstName}
                  </h1>
                  <p style={{
                    fontSize: '1.5rem', color: '#444746', fontWeight: '500',
                    margin: '0.5rem 0 2rem 0', lineHeight: '1.2'
                  }}>
                    {modelConfigs[selectedModel].greeting}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1rem' }}>
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className="animate-message"
                      style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: msg.isBot ? 'flex-start' : 'flex-end',
                    }}>
                      <div style={{
                        backgroundColor: msg.isBot ? 'transparent' : '#2d2d2d',
                        color: COLORS.white, 
                        // We remove horizontal padding for bot messages so the MD alignment stays clean
                        padding: msg.isBot ? '0' : '0.8rem 1.2rem',
                        borderRadius: '18px', 
                        maxWidth: '85%', 
                        fontSize: '1.05rem',
                        lineHeight: '1.6', 
                        border: msg.isBot ? 'none' : `1px solid ${COLORS.gray}20`
                      }}>
                        {msg.isBot ? (
                          <>
                            {/* Source citations */}
                            {msg.sources && msg.sources.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#888', alignSelf: 'center' }}>Sources:</span>
                                {msg.sources.map((src, si) => (
                                  <span key={si} style={{
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: `${COLORS.primaryTeal}22`,
                                    border: `1px solid ${COLORS.primaryTeal}44`,
                                    color: COLORS.primaryTeal,
                                    fontSize: '0.72rem',
                                    fontWeight: '600'
                                  }}>
                                    📍 {src}
                                  </span>
                                ))}
                              </div>
                            )}
                            <ReactMarkdown
                            components={{
                              p: ({node, ...props}) => <p style={{ marginBottom: '1.2rem' }} {...props} />,
                              h1: ({node, ...props}) => <h1 style={{ color: COLORS.primaryTeal, fontSize: '1.4rem', margin: '1rem 0' }} {...props} />,
                              h2: ({node, ...props}) => <h2 style={{ color: COLORS.primaryTeal, fontSize: '1.2rem', margin: '0.8rem 0' }} {...props} />,
                              ul: ({node, ...props}) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'square' }} {...props} />,
                              li: ({node, ...props}) => <li style={{ marginBottom: '0.5rem', color: '#E0E0E0' }} {...props} />,
                              code: ({node, inline, ...props}) => (
                                <code style={{
                                  background: '#000',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '6px',
                                  fontFamily: 'monospace',
                                  fontSize: '0.95rem',
                                  color: COLORS.accentOrange,
                                  border: `1px solid ${COLORS.gray}30`
                                }} {...props} />
                              ),
                              blockquote: ({node, ...props}) => (
                                <blockquote style={{
                                  borderLeft: `3px solid ${COLORS.primaryTeal}`,
                                  paddingLeft: '1rem',
                                  margin: '1rem 0',
                                  color: COLORS.gray,
                                  fontStyle: 'italic'
                                }} {...props} />
                              )
                            }}
                          >
                            {msg.text}
                            </ReactMarkdown>
                            {/* Blinking cursor while streaming */}
                            {msg.streaming && (
                              <span style={{
                                display: 'inline-block',
                                width: '2px',
                                height: '1.1em',
                                background: COLORS.primaryTeal,
                                marginLeft: '2px',
                                verticalAlign: 'text-bottom',
                                animation: 'blink 1s step-end infinite'
                              }} />
                            )}

                            {/* Feedback buttons — only on completed messages */}
                            {!msg.streaming && (
                              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#555' }}>Was this helpful?</span>
                                <button
                                  onClick={() => {
                                    const msgFeedback = 1;
                                    setFeedback(prev => ({ ...prev, [i]: msgFeedback }));
                                    fetch(`${API_BASE_URL}/chat/feedback`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ query: msg.originalQuery || '', response: msg.text, rating: 1 })
                                    }).catch(() => {});
                                  }}
                                  style={{
                                    background: feedback[i] === 1 ? `${COLORS.primaryTeal}33` : 'transparent',
                                    border: `1px solid ${feedback[i] === 1 ? COLORS.primaryTeal : '#444'}`,
                                    color: feedback[i] === 1 ? COLORS.primaryTeal : '#666',
                                    borderRadius: '8px', padding: '4px 10px',
                                    cursor: 'pointer', fontSize: '0.8rem',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                  }}
                                >
                                  <MdThumbUp /> {feedback[i] === 1 ? 'Thanks!' : ''}
                                </button>
                                <button
                                  onClick={() => {
                                    setFeedback(prev => ({ ...prev, [i]: -1 }));
                                    fetch(`${API_BASE_URL}/chat/feedback`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ query: msg.originalQuery || '', response: msg.text, rating: -1 })
                                    }).catch(() => {});
                                  }}
                                  style={{
                                    background: feedback[i] === -1 ? 'rgba(255,68,68,0.1)' : 'transparent',
                                    border: `1px solid ${feedback[i] === -1 ? '#ff4444' : '#444'}`,
                                    color: feedback[i] === -1 ? '#ff4444' : '#666',
                                    borderRadius: '8px', padding: '4px 10px',
                                    cursor: 'pointer', fontSize: '0.8rem',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                  }}
                                >
                                  <MdThumbDown />
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <>
                      <style>{`
                        @keyframes fadeInUp {
                          from {
                            opacity: 0;
                            transform: translateY(10px);
                          }
                          to {
                            opacity: 1;
                            transform: translateY(0);
                          }
                        }
                      .animate-message {
                        animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                      }
                        @keyframes pulse {
                          0%, 100% { opacity: 0.3; transform: scale(0.8); }
                          50% { opacity: 1; transform: scale(1.2); }
                        }
                        .loading-dots span {
                          animation: pulse 1.4s infinite ease-in-out both;
                        }
                        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
                        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
                      `}</style>
                      
                      <div style={{ 
                        color: COLORS.gray, 
                        fontSize: '0.95rem', 
                        fontStyle: 'italic', 
                        paddingLeft: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        marginTop: '0.5rem'
                      }}>
                        <div className="loading-dots" style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', backgroundColor: COLORS.primaryTeal, borderRadius: '50%', display: 'inline-block' }} />
                          <span style={{ width: '6px', height: '6px', backgroundColor: COLORS.primaryTeal, borderRadius: '50%', display: 'inline-block' }} />
                          <span style={{ width: '6px', height: '6px', backgroundColor: COLORS.primaryTeal, borderRadius: '50%', display: 'inline-block' }} />
                        </div>
                        {modelConfigs[selectedModel].loadingText}
                      </div>
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
              </div>
          </div>

          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <form onSubmit={handleSend} style={{
              width: '100%', maxWidth: '760px', background: '#242424',
              borderRadius: '32px', padding: '0.5rem 1.5rem', display: 'flex',
              alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: `1px solid ${COLORS.gray}20`
            }}>
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder={isLoading ? "Please wait..." : "Ask about a disease pathway..."}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  color: COLORS.white, padding: '0.8rem 0', fontSize: '1.1rem',
                  outline: 'none', opacity: isLoading ? 0.5 : 1
                }}
              />
              <button type="submit" disabled={!inputValue.trim() || isLoading} style={{
                background: (inputValue.trim() && !isLoading) ? COLORS.primaryTeal : 'transparent',
                border: 'none', color: COLORS.white, width: '40px', height: '40px',
                borderRadius: '50%', cursor: (inputValue.trim() && !isLoading) ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease'
              }}>
                <MdSend style={{ fontSize: '1.2rem', opacity: (inputValue.trim() && !isLoading) ? 1 : 0.3 }} />
              </button>
            </form>
          </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      {/* FAB: Chatbot button with pulse ring */}
      <div style={{ position: 'fixed', top: '100px', right: '30px', zIndex: 2147483647 }}>
        {/* Animated pulse rings */}
        {!isOpen && (
          <>
            <span style={{
              position: 'absolute', inset: '-6px', borderRadius: '50%',
              border: `2px solid ${COLORS.primaryTeal}`,
              animation: 'ringPulse 2s ease-out infinite',
              pointerEvents: 'none'
            }} />
            <span style={{
              position: 'absolute', inset: '-6px', borderRadius: '50%',
              border: `2px solid ${COLORS.primaryTeal}`,
              animation: 'ringPulse 2s ease-out 0.7s infinite',
              pointerEvents: 'none'
            }} />
          </>
        )}
        <motion.button 
          onClick={() => { setIsOpen(!isOpen); }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          style={{
            width: '56px', height: '56px', borderRadius: '28px',
            backgroundColor: isOpen ? '#ff4444' : COLORS.primaryTeal,
            color: 'white', border: 'none',
            cursor: 'pointer', boxShadow: isOpen
              ? '0 4px 20px rgba(255,68,68,0.4)'
              : `0 4px 20px rgba(0,153,153,0.5), 0 0 30px rgba(0,153,153,0.2)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
          }}
        >
          <MdChat style={{ pointerEvents: 'none' }} />
        </motion.button>
      </div>

      <style>{`
        @keyframes ringPulse {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {createPortal(renderChatModal(), document.body)}
    </>
  );
};

export default ChatbotWidget;