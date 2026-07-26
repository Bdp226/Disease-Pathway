import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { contactUsAPI } from '../utils/api.js';
import { COLORS } from '../utils/constants.js';
import { MdClose } from 'react-icons/md';

const ContactUsModal = ({ isOpen, onClose }) => {
  // ✅ Your form data structure is correct and matches backend expectations:
  const [formData, setFormData] = useState({
    user_name: '',    
    user_email: '',      
    subject: '',       
    description: ''    
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Update the handleSubmit function with better debugging
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ Add debugging to see what's being sent
      console.log('Submitting contact form with data:', formData);
      
      // ✅ Validate required fields on frontend
      if (!formData.user_name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.user_email.trim()) {
        throw new Error('Email is required');
      }
      if (!formData.subject.trim()) {
        throw new Error('Subject is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Message is required');
      }

      const response = await contactUsAPI.submitContactForm(formData);
      console.log('Contact form response:', response); // ✅ Debug response
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        user_name: '',
        user_email: '',
        subject: '',
        description: ''
      });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Contact form submission error:', err); // ✅ Debug errors
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      user_name: '',
      user_email: '',
      subject: '',
      description: ''
    });
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(128, 128, 128, 0.8)', // ✅ CHANGED: Gray backdrop instead of black
      zIndex: 1001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) handleClose();
    }}
    >
      <div style={{
        background: COLORS.white, // ✅ CHANGED: White container instead of black
        border: `1px solid ${COLORS.lightGray}`, // ✅ CHANGED: Light border instead of teal
        borderRadius: '20px',
        boxShadow: `0 20px 60px rgba(0, 0, 0, 0.15)`, // ✅ CHANGED: Lighter shadow
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: `1px solid ${COLORS.lightGray}` // ✅ CHANGED: Light border
        }}>
          <div>
            <h2 style={{
              color: COLORS.accentOrange, // ✅ KEEP: Orange title
              fontSize: '1.8rem',
              fontWeight: '700',
              margin: 0
            }}>
              Contact Us
            </h2>
            <p style={{
              color: COLORS.gray, // ✅ CHANGED: Dark gray subtitle
              fontSize: '1rem',
              margin: '0.5rem 0 0 0',
              opacity: 0.8
            }}>
              We'd love to hear from you!
            </p>
          </div>
          
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.gray, // ✅ CHANGED: Dark gray close button
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'} // ✅ CHANGED: Dark hover
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <MdClose />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              color: COLORS.primaryTeal,
              marginBottom: '1rem'
            }}>
              ✓
            </div>
            
            <h3 style={{
              color: COLORS.gray, // ✅ CHANGED: Dark gray success title
              marginBottom: '1rem',
              fontSize: '1.3rem'
            }}>
              Message Sent Successfully!
            </h3>
            
            <p style={{
              color: COLORS.gray, // ✅ CHANGED: Dark gray success text
              lineHeight: '1.6'
            }}>
              Thank you for contacting us. We've received your message and will get back to you soon.
            </p>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            {/* Name Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: COLORS.gray, // ✅ CHANGED: Dark gray labels
                fontSize: '0.95rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Full Name <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.user_name}
                onChange={(e) => handleChange('user_name', e.target.value)}
                required
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `2px solid ${COLORS.lightGray}`, // ✅ CHANGED: Light gray border
                  background: COLORS.white, // ✅ CHANGED: White background
                  color: COLORS.gray, // ✅ CHANGED: Dark gray text
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
                onBlur={(e) => e.target.style.borderColor = COLORS.lightGray} // ✅ CHANGED: Light gray on blur
              />
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: COLORS.gray, // ✅ CHANGED: Dark gray labels
                fontSize: '0.95rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Email Address <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.user_email}
                onChange={(e) => handleChange('user_email', e.target.value)}
                required
                placeholder="Enter your email address"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `2px solid ${COLORS.lightGray}`, // ✅ CHANGED: Light gray border
                  background: COLORS.white, // ✅ CHANGED: White background
                  color: COLORS.gray, // ✅ CHANGED: Dark gray text
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
                onBlur={(e) => e.target.style.borderColor = COLORS.lightGray} // ✅ CHANGED: Light gray on blur
              />
            </div>

            {/* Subject Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: COLORS.gray, // ✅ CHANGED: Dark gray labels
                fontSize: '0.95rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Subject <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
                placeholder="Brief subject of your message minimally 10 characters"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `2px solid ${COLORS.lightGray}`, // ✅ CHANGED: Light gray border
                  background: COLORS.white, // ✅ CHANGED: White background
                  color: COLORS.gray, // ✅ CHANGED: Dark gray text
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
                onBlur={(e) => e.target.style.borderColor = COLORS.lightGray} // ✅ CHANGED: Light gray on blur
              />
            </div>

            {/* Description Field */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: COLORS.gray, // ✅ CHANGED: Dark gray labels
                fontSize: '0.95rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Message <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                rows="4"
                placeholder="Please describe your message in detail..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `2px solid ${COLORS.lightGray}`, // ✅ CHANGED: Light gray border
                  background: COLORS.white, // ✅ CHANGED: White background
                  color: COLORS.gray, // ✅ CHANGED: Dark gray text
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  resize: 'vertical',
                  minHeight: '100px'
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
                onBlur={(e) => e.target.style.borderColor = COLORS.lightGray} // ✅ CHANGED: Light gray on blur
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                color: '#f44336',
                marginBottom: '1.5rem',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: COLORS.gray, // ✅ CHANGED: Dark gray text
                  border: `2px solid ${COLORS.lightGray}`, // ✅ CHANGED: Light gray border
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = COLORS.primaryTeal;
                  e.target.style.color = COLORS.primaryTeal;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = COLORS.lightGray; // ✅ CHANGED: Light gray on leave
                  e.target.style.color = COLORS.gray;
                }}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !formData.user_name || !formData.user_email || !formData.subject || !formData.description}
                style={{
                  padding: '0.75rem 2rem',
                  background: loading || !formData.user_name || !formData.user_email || !formData.subject || !formData.description
                    ? 'rgba(255, 255, 255, 0.1)'
                    : `linear-gradient(135deg, ${COLORS.primaryTeal}, ${COLORS.primaryTealLight})`,
                  color: loading || !formData.user_name || !formData.user_email || !formData.subject || !formData.description 
                    ? COLORS.gray 
                    : COLORS.white,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading || !formData.user_name || !formData.user_email || !formData.subject || !formData.description 
                    ? 'not-allowed' 
                    : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ContactUsModal;