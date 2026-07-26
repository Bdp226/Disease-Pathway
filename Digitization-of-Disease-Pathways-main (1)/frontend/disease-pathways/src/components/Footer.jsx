import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub, FaInstagram, FaYoutube } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FiExternalLink } from 'react-icons/fi';
import { COLORS } from '../utils/constants.js';
import ContactUsModal from './ContactUsModal';
import { MoveLeft } from 'lucide-react';

const Footer = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const socialLinks = [
    { icon: FaFacebookF, href: 'https://www.facebook.com/SiemensHealthineers/', label: 'Facebook' },
    { icon: FaTwitter, href: 'https://twitter.com/siemenshealth', label: 'Twitter' },
    { icon: FaLinkedinIn, href: 'https://linkedin.com/company/siemens-healthineers', label: 'LinkedIn' },
    { icon: FaYoutube, href: 'https://youtube.com/siemenshealthineers', label: 'YouTube' },
  ];

  return (
    <>
      <footer style={{
        background: COLORS.white,
        borderTop: `2px solid ${COLORS.lightGray}`,
        marginTop: '5rem',
        width: '100%'
      }}>
        {/* Main Footer Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '3rem 2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          {/* Logo & Description */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <img 
                src="/logo.png" 
                alt="SHS Health Logo" 
                style={{ 
                  marginRight: '1rem', 
                  height: '40px',
                 }} 
              />
              <h3 style={{
                color: COLORS.primaryTeal,
                fontSize: '1.8rem',
                fontWeight: '700',
                margin: 0
              }}>
                {/* Logo Title Placeholder */}
              </h3>
            </div>
              
            <div style={{
              fontSize: '0.75rem',
              lineHeight: '1.4',
              color: '#666',
              maxWidth: '650px',
              textAlign: 'justify',
              fontStyle: 'italic'
            }}>
              <strong>Disclaimer:</strong> This information cannot be taken as a recommendation for the readers, 
              especially not as a guideline for treatment, and it is not a medical document. There is no guarantee 
              for completeness or global correctness; the various pain points, solutions, and statistical data 
              are examples only. Sources are multiple, such as public statistics, expert opinions, open innovation 
              workshops, research, own data and many more. The products and features mentioned may not be 
              available in all countries and their future availability cannot be guaranteed. Some products 
              mentioned are planned and under development.
            </div>
            
            {/*
            <p style={{
              color: COLORS.gray,
              fontSize: '0.9rem',
              lineHeight: '1.6',
              margin: 0,
              maxWidth: '280px'
            }}>
              Advancing insights into <strong>disease pathways</strong> to drive better outcomes through knowledge and innovation.
            </p>
            */}
          </div>
  

          {/* Company Links */}
          {/*
          <div>
            <h4 style={{ color: COLORS.black, fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Company
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['About', 'Disease Pathways', 'Research'].map((item) => (
                <li key={item} style={{ marginBottom: '0.75rem' }}>
                  <Link 
                    to={item === 'About' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                    style={{
                      color: COLORS.gray,
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primaryTeal}
                    onMouseLeave={(e) => e.currentTarget.style.color = COLORS.gray}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          */}

          {/* Resources */}
          {/*
          <div>
            <h4 style={{ color: COLORS.black, fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Resources
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.75rem' }}>
                <a 
                  href="/admin" 
                  style={{ color: COLORS.gray, textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primaryTeal}
                  onMouseLeave={(e) => e.currentTarget.style.color = COLORS.gray}
                >
                  Admin Panel <FiExternalLink size={12} />
                </a>
              </li>
              {['Knowledge Base', 'Documentation'].map((item) => (
                <li key={item} style={{ marginBottom: '0.75rem' }}>
                  <a 
                    href={`#${item.toLowerCase().replace(' ', '-')}`} 
                    style={{ color: COLORS.gray, textDecoration: 'none', fontSize: '0.9rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primaryTeal}
                    onMouseLeave={(e) => e.currentTarget.style.color = COLORS.gray}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          */}

          {/* Contact */}
          <div>
            <h4 style={{ color: COLORS.black, fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Contact
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { icon: MdEmail, text: 'info@shshealth.com' }
              ].map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <item.icon style={{ color: COLORS.primaryTeal }} />
                  <span style={{ color: COLORS.gray, fontSize: '0.9rem' }}>{item.text}</span>
                </li>
              ))}
              <li style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  style={{
                    background: 'none',
                    border: `1px solid ${COLORS.primaryTeal}`,
                    color: COLORS.primaryTeal,
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primaryTeal;
                    e.currentTarget.style.color = COLORS.white;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = COLORS.primaryTeal;
                  }}
                >
                  Contact Us Form
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: `1px solid ${COLORS.lightGray}`,
          padding: '1.5rem 2rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <p style={{ color: COLORS.gray, fontSize: '0.9rem', margin: 0 }}>
              © {new Date().getFullYear()} Siemens Healthcare Pvt. Ltd.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    color: COLORS.gray,
                    padding: '0.6rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${COLORS.lightGray}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.white;
                    e.currentTarget.style.backgroundColor = COLORS.primaryTeal;
                    e.currentTarget.style.borderColor = COLORS.primaryTeal;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = COLORS.gray;
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = COLORS.lightGray;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <ContactUsModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};

export default Footer;