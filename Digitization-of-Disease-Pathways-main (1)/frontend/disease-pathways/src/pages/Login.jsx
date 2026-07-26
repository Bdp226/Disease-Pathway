import React, { useState, useEffect } from 'react';
import { Link,useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI, isAuthenticated } from '../utils/api.js';
import { COLORS } from '../utils/constants.js';
import { MdHealthAndSafety, MdAdminPanelSettings, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    isAdminLogin: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/diseases', { replace: true });
    }
  }, [navigate]);

  // Show session expired message
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setError('Your session has expired. Please login again.');
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(formData.email, formData.password, formData.isAdminLogin);
      
      // Redirect to intended page or diseases
      const redirectTo = searchParams.get('redirect') || '/diseases';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.register({
        email: formData.email,
        full_name: formData.fullName,
        password: formData.password
      });
      
      setShowRegister(false);
      setError(''); // Clear any previous errors
      // Auto-login after registration
      await authAPI.login(formData.email, formData.password, false);
      navigate('/diseases', { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, 
        ${COLORS.primaryTeal}10 0%, 
        ${COLORS.white} 25%, 
        ${COLORS.white} 75%, 
        ${COLORS.accentOrange}10 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 20%, ${COLORS.primaryTeal}08 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, ${COLORS.accentOrange}08 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, ${COLORS.primaryTeal}05 0%, transparent 50%)
        `,
        zIndex: 1
      }} />

      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: COLORS.white,
        borderRadius: '20px',
        boxShadow: `
          0 20px 60px rgba(0, 0, 0, 0.1),
          0 8px 32px rgba(0, 0, 0, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.8)
        `,
        padding: '3rem',
        position: 'relative',
        zIndex: 2,
        border: `1px solid ${COLORS.lightGray}`
      }}>
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
         <Link 
          to="/" 
          style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: COLORS.accentOrange,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <img 
            src="/logo.png" 
            alt="SHS Health Logo" 
            style={{
              height: '40px',
              width: '130px'
            }}
          />
          <span>Disease Pathway</span>
        </Link>
          
          <p style={{
            color: COLORS.gray,
            fontSize: '1.1rem',
            margin: 0,
            fontWeight: '500'
          }}>
            {showRegister ? 'Create your account' : 'Welcome back'}
          </p>
          <p style={{
            color: COLORS.gray,
            fontSize: '0.95rem',
            margin: '0.5rem 0 0 0',
            opacity: 0.8
          }}>
            {showRegister ? 'Get started with healthcare pathway analysis' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {/* Login Mode Indicator */}
        {!showRegister && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button
              type="button"
              onClick={() => setFormData({...formData, isAdminLogin: false})}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: !formData.isAdminLogin 
                  ? `linear-gradient(135deg, ${COLORS.primaryTeal}, ${COLORS.primaryTealLight})`
                  : 'transparent',
                color: !formData.isAdminLogin ? COLORS.white : COLORS.gray,
                border: !formData.isAdminLogin ? 'none' : `1px solid ${COLORS.lightGray}`,
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <MdHealthAndSafety />
              User Login
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({...formData, isAdminLogin: true})}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: formData.isAdminLogin 
                  ? `linear-gradient(135deg, ${COLORS.accentOrange}, ${COLORS.accentOrangeLight})`
                  : 'transparent',
                color: formData.isAdminLogin ? COLORS.white : COLORS.gray,
                border: formData.isAdminLogin ? 'none' : `1px solid ${COLORS.lightGray}`,
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <MdAdminPanelSettings />
              Admin Login
            </button>
          </div>
        )}

        {/* Login/Register Form */}
        <form onSubmit={showRegister ? handleRegister : handleLogin}>
          {showRegister && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                color: COLORS.gray,
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required={showRegister}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: COLORS.white,
                  border: `2px solid ${COLORS.lightGray}`,
                  borderRadius: '10px',
                  color: COLORS.gray,
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                placeholder="Enter your full name"
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.primaryTeal;
                  e.target.style.boxShadow = `0 0 0 3px ${COLORS.primaryTeal}15`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.lightGray;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: COLORS.gray,
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '1rem',
                background: COLORS.white,
                border: `2px solid ${COLORS.lightGray}`,
                borderRadius: '10px',
                color: COLORS.gray,
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              placeholder="Enter your email address"
              onFocus={(e) => {
                e.target.style.borderColor = COLORS.primaryTeal;
                e.target.style.boxShadow = `0 0 0 3px ${COLORS.primaryTeal}15`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = COLORS.lightGray;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: COLORS.gray,
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '1rem 3rem 1rem 1rem',
                  background: COLORS.white,
                  border: `2px solid ${COLORS.lightGray}`,
                  borderRadius: '10px',
                  color: COLORS.gray,
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                placeholder="Enter your password"
                minLength="6"
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.primaryTeal;
                  e.target.style.boxShadow = `0 0 0 3px ${COLORS.primaryTeal}15`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.lightGray;
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: COLORS.gray,
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0.5rem'
                }}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              color: '#d32f2f',
              background: 'rgba(211, 47, 47, 0.08)',
              border: '1px solid rgba(211, 47, 47, 0.2)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading 
                ? COLORS.lightGray
                : `linear-gradient(135deg, ${
                    showRegister || !formData.isAdminLogin 
                      ? COLORS.primaryTeal 
                      : COLORS.accentOrange
                  }, ${
                    showRegister || !formData.isAdminLogin 
                      ? COLORS.primaryTealLight 
                      : COLORS.accentOrangeLight
                  })`,
              border: 'none',
              borderRadius: '10px',
              color: COLORS.white,
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading 
                ? 'none' 
                : `0 4px 15px ${
                    showRegister || !formData.isAdminLogin 
                      ? COLORS.primaryTeal 
                      : COLORS.accentOrange
                  }40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 8px 25px ${
                  showRegister || !formData.isAdminLogin 
                    ? COLORS.primaryTeal 
                    : COLORS.accentOrange
                }50`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 4px 15px ${
                  showRegister || !formData.isAdminLogin 
                    ? COLORS.primaryTeal 
                    : COLORS.accentOrange
                }40`;
              }
            }}
          >
            {formData.isAdminLogin && !showRegister ? <MdAdminPanelSettings /> : <MdHealthAndSafety />}
            {loading 
              ? (showRegister ? 'Creating Account...' : 'Signing In...') 
              : (showRegister ? 'Create Account' : 'Sign In')
            }
          </button>
        </form>

        {/* Toggle Register/Login */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1.5rem 0',
          borderTop: `1px solid ${COLORS.lightGray}`,
          color: COLORS.gray
        }}>
          <span style={{ fontSize: '0.95rem' }}>
            {showRegister ? "Already have an account?" : "Don't have an account?"}{' '}
          </span>
          <button
            onClick={() => {
              setShowRegister(!showRegister);
              setError('');
              setFormData({ email: '', password: '', isAdminLogin: false });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.primaryTeal,
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              textDecoration: 'none',
              marginLeft: '0.25rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.target.style.textDecoration = 'none';
            }}
          >
            {showRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Footer Note */}
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          color: COLORS.gray,
          fontSize: '0.85rem',
          opacity: 0.7
        }}>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
