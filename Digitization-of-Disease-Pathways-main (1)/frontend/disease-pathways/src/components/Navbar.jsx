import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdHealthAndSafety, MdExpandMore, MdLogout, MdAdminPanelSettings } from 'react-icons/md';
import { COLORS } from '../utils/constants.js';
import { authAPI, isAuthenticated, getCurrentUser, isAdmin } from '../utils/api.js';
import ContactUsModal from './ContactUsModal';

const Navbar = ({ isHome }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const menuRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHoveringTop, setIsHoveringTop] = useState(false);

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

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      // If we've scrolled more than 50px, we consider the nav "out of view"
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const shouldShow = !isHome || !isScrolled || isHoveringTop;

  const triggerZoneStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '20px',
    zIndex: 1099,
    background: 'transparent',
    display: isHome && isScrolled ? 'block' : 'none' 
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setAuthenticated(false);
    setShowUserMenu(false);
    navigate('/login', { replace: true });
  };

  const navLinkStyle = (path) => ({
    color: isActive(path) ? COLORS.accentOrange : COLORS.gray,
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    borderBottom: isActive(path) ? `2px solid ${COLORS.accentOrange}` : 'none',
    paddingBottom: '0.25rem'
  });

  return (
    <>

      {/* Invisible trigger only active when nav is scrolled away */}
      <div 
        style={triggerZoneStyle} 
        onMouseEnter={() => setIsHoveringTop(true)} 
      />

      <nav
        onMouseLeave={() => setIsHoveringTop(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          padding: '1rem 2.5rem',
          background: COLORS.white,
          borderBottom: `1px solid ${COLORS.lightGray}`,
          boxShadow: shouldShow ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
          
          // Animation logic
          transform: shouldShow ? 'translateY(0)' : 'translateY(-100%)',
          opacity: shouldShow ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          pointerEvents: shouldShow ? 'auto' : 'none'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1300px',
          margin: '0 auto'
        }}>
          {/* Logo/Brand */}
          <Link 
            to="/" 
            style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{
                height: '40px',
                width: 'auto'
              }}
            />
          </Link>

          {/* Navigation Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem'
          }}>
            <Link
              to="/"
              style={navLinkStyle('/')}
              onMouseEnter={(e) => {
                const t = e.currentTarget;
                t.style.color = COLORS.accentOrange;
                t.style.borderBottom = `2px solid ${COLORS.accentOrange}`;
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget;
                if (isActive('/')) {
                  t.style.color = COLORS.accentOrange;
                  t.style.borderBottom = `2px solid ${COLORS.accentOrange}`;
                } else {
                  t.style.color = COLORS.gray;
                  t.style.borderBottom = 'none';
                }
              }}
            >
              About
            </Link>

            <Link
              to="/diseases"
              style={navLinkStyle('/diseases')}
              onMouseEnter={(e) => {
                const t = e.currentTarget;
                t.style.color = COLORS.accentOrange;
                t.style.borderBottom = `2px solid ${COLORS.accentOrange}`;
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget;
                if (isActive('/diseases')) {
                  t.style.color = COLORS.accentOrange;
                  t.style.borderBottom = `2px solid ${COLORS.accentOrange}`;
                } else {
                  t.style.color = COLORS.gray;
                  t.style.borderBottom = 'none';
                }
              }}
            >
              Diseases
            </Link>

            {authenticated && isAdmin() && (
              <Link
                to="/admin"
                style={navLinkStyle('/admin')}
                onMouseEnter={(e) => {
                  const t = e.currentTarget;
                  t.style.color = COLORS.accentOrange;
                  t.style.borderBottom = `2px solid ${COLORS.accentOrange}`;
                }}
                onMouseLeave={(e) => {
                  const t = e.currentTarget;
                  if (isActive('/admin')) {
                    t.style.color = COLORS.accentOrange;
                    t.style.borderBottom = `2px solid ${COLORS.accentOrange}`;
                  } else {
                    t.style.color = COLORS.gray;
                    t.style.borderBottom = 'none';
                  }
                }}
              >
                Dashboard
              </Link>
            )}

            <button
              onClick={() => setIsContactModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: isContactModalOpen ? COLORS.accentOrange : COLORS.gray,
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '550',
                transition: 'all 0.3s ease',
                paddingBottom: '0.25rem',
                borderBottom: isContactModalOpen ? `2px solid ${COLORS.accentOrange}` : 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                const t = e.currentTarget;
                if (!isContactModalOpen) {
                  t.style.color = COLORS.accentOrange;
                  t.style.borderBottom = `2px solid ${COLORS.accentOrange}`;
                }
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget;
                if (!isContactModalOpen) {
                  t.style.color = COLORS.gray;
                  t.style.borderBottom = 'none';
                }
              }}
            >
              Contact Us
            </button>

            {/* Authentication Section */}
            <div style={{ position: 'relative' }}>
              {authenticated ? (
                <div ref={menuRef}>
                  <div 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '12px',
                      background: showUserMenu ? 'rgba(236, 103, 2, 0.1)' : 'transparent',
                      transition: 'background 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isAdmin() ? 
                        `linear-gradient(135deg, ${COLORS.accentOrange}, ${COLORS.accentOrangeLight})` :
                        `linear-gradient(135deg, ${COLORS.primaryTeal}, ${COLORS.primaryTealLight})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: COLORS.white,
                      fontSize: '1rem'
                    }}>
                      {isAdmin() ? <MdAdminPanelSettings /> : <MdHealthAndSafety />}
                    </div>
                    
                    <span style={{ 
                      color: COLORS.gray, 
                      fontSize: '0.9rem', 
                      fontWeight: '600' 
                    }}>
                      {user?.full_name?.split(' ')[0]}
                    </span>
                    
                    <MdExpandMore style={{ 
                      color: COLORS.gray,
                      transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }} />
                  </div>

                  {showUserMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '110%',
                      right: 0,
                      minWidth: '220px',
                      background: COLORS.white,
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      border: `1px solid ${COLORS.lightGray}`,
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        padding: '1rem', 
                        borderBottom: `1px solid ${COLORS.lightGray}`,
                        background: 'rgba(236, 103, 2, 0.05)'
                      }}>
                        <div style={{ color: COLORS.gray, fontSize: '0.9rem', fontWeight: '700' }}>{user?.full_name}</div>
                        <div style={{ color: COLORS.gray, fontSize: '0.75rem', opacity: 0.7 }}>{user?.email}</div>
                      </div>
                      <div 
                        onClick={handleLogout}
                        style={{
                          padding: '0.8rem 1rem',
                          color: COLORS.gray,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(236, 103, 2, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <MdLogout /> Sign Out
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  style={{
                    padding: '0.6rem 1.4rem',
                    background: `linear-gradient(135deg, ${COLORS.primaryTeal}, ${COLORS.primaryTealLight})`,
                    color: COLORS.white,
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    boxShadow: `0 4px 12px ${COLORS.primaryTeal}30`
                  }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <ContactUsModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};

export default Navbar;