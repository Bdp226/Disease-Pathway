import React, { useState, useEffect } from 'react';
import { contactUsAPI } from '../utils/api.js';
import { COLORS } from '../utils/constants.js';
import { MdEmail, MdPerson, MdSubject, MdDescription, MdDelete, MdSearch, MdRefresh } from 'react-icons/md';

const ContactUsManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Load contact submissions
  const loadSubmissions = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError('');
      
      const response = await contactUsAPI.getContactSubmissions(page, 20, search);
      
      setSubmissions(response.items);
      setCurrentPage(response.page);
      setTotalPages(response.total_pages);
      setTotal(response.total);
      
    } catch (err) {
      setError(err.message);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSubmissions();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadSubmissions(1, searchTerm);
  };

  // Handle delete
  const handleDelete = async (contactId, contactName) => {
    if (!window.confirm(`Are you sure you want to delete the contact submission from "${contactName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await contactUsAPI.deleteContactSubmission(contactId);
      setSuccess(`Successfully deleted contact submission from ${contactName}`);
      
      // Reload current page or go to previous page if current page becomes empty
      const shouldGoToPrevPage = submissions.length === 1 && currentPage > 1;
      const pageToLoad = shouldGoToPrevPage ? currentPage - 1 : currentPage;
      
      loadSubmissions(pageToLoad, searchTerm);
      
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      loadSubmissions(newPage, searchTerm);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div>
      {/* Search and Actions */}
      <div style={{
        background: COLORS.white,
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${COLORS.lightGray}`,
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Search Form */}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            gap: '0.5rem',
            flex: 1,
            maxWidth: '400px'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <MdSearch style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: COLORS.gray,
                fontSize: '1.2rem'
              }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or subject..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  border: `2px solid ${COLORS.lightGray}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
                onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: `linear-gradient(135deg, ${COLORS.primaryTeal}, ${COLORS.primaryTealLight})`,
                color: COLORS.white,
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
            >
              Search
            </button>
          </form>

          {/* Refresh Button */}
          <button
            onClick={() => {
              setSearchTerm('');
              clearMessages();
              loadSubmissions(1, '');
            }}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              color: COLORS.gray,
              border: `2px solid ${COLORS.lightGray}`,
              borderRadius: '8px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = COLORS.primaryTeal;
              e.target.style.color = COLORS.primaryTeal;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = COLORS.lightGray;
              e.target.style.color = COLORS.gray;
            }}
          >
            <MdRefresh />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ 
          marginTop: '1rem', 
          fontSize: '0.9rem', 
          color: COLORS.gray 
        }}>
          {loading ? 'Loading...' : `${total} contact submissions found`}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'rgba(211, 47, 47, 0.08)',
          border: '1px solid rgba(211, 47, 47, 0.2)',
          borderRadius: '12px',
          color: '#d32f2f',
          fontSize: '0.95rem'
        }}>
          {error}
          <button
            onClick={clearMessages}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#d32f2f',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'rgba(76, 175, 80, 0.08)',
          border: '1px solid rgba(76, 175, 80, 0.2)',
          borderRadius: '12px',
          color: '#4caf50',
          fontSize: '0.95rem'
        }}>
          {success}
          <button
            onClick={clearMessages}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#4caf50',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Contact Submissions */}
      <div style={{
        background: COLORS.white,
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${COLORS.lightGray}`,
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: COLORS.gray
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Loading contact submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: COLORS.gray,
            opacity: 0.6
          }}>
            <MdEmail style={{ fontSize: '4rem', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
              No contact submissions found
            </p>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Contact submissions will appear here when users submit the form'}
            </p>
          </div>
        ) : (
          <>
            {/* Submissions List */}
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {submissions.map((submission, index) => (
                <div
                  key={submission.id}
                  style={{
                    padding: '1.5rem',
                    borderBottom: index < submissions.length - 1 ? `1px solid ${COLORS.lightGray}` : 'none',
                    transition: 'background-color 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${COLORS.primaryTeal}05`}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setSelectedSubmission(selectedSubmission?.id === submission.id ? null : submission)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <MdPerson style={{ color: COLORS.primaryTeal, fontSize: '1.1rem' }} />
                          <div>
                            <div style={{ fontSize: '0.8rem', color: COLORS.gray, opacity: 0.7 }}>Name</div>
                            <div style={{ fontWeight: '600', color: COLORS.gray }}>{submission.user_name}</div>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <MdEmail style={{ color: COLORS.primaryTeal, fontSize: '1.1rem' }} />
                          <div>
                            <div style={{ fontSize: '0.8rem', color: COLORS.gray, opacity: 0.7 }}>Email</div>
                            <div style={{ fontWeight: '600', color: COLORS.gray }}>{submission.user_email}</div>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <MdSubject style={{ color: COLORS.accentOrange, fontSize: '1.1rem' }} />
                        <div>
                          <div style={{ fontSize: '0.8rem', color: COLORS.gray, opacity: 0.7 }}>Subject</div>
                          <div style={{ 
                            fontWeight: '600', 
                            color: COLORS.accentOrange,
                            fontSize: '1.1rem'
                          }}>
                            {submission.subject}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: COLORS.gray, opacity: 0.8 }}>
                        Submitted: {new Date(submission.created_at).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(submission.id, submission.user_name);
                      }}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(211, 47, 47, 0.1)',
                        color: '#d32f2f',
                        border: '1px solid rgba(211, 47, 47, 0.2)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(211, 47, 47, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(211, 47, 47, 0.1)';
                      }}
                      title="Delete submission"
                    >
                      <MdDelete />
                    </button>
                  </div>

                  {/* Expanded Message */}
                  {selectedSubmission?.id === submission.id && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: `${COLORS.primaryTeal}08`,
                      borderRadius: '8px',
                      border: `1px solid ${COLORS.primaryTeal}20`
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <MdDescription style={{ 
                          color: COLORS.primaryTeal, 
                          fontSize: '1.1rem',
                          marginTop: '0.2rem'
                        }} />
                        <div>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: COLORS.gray, 
                            opacity: 0.7,
                            marginBottom: '0.5rem'
                          }}>
                            Message
                          </div>
                          <div style={{ 
                            color: COLORS.gray,
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {submission.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                padding: '1rem',
                borderTop: `1px solid ${COLORS.lightGray}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === 1 ? COLORS.lightGray : 'transparent',
                    color: currentPage === 1 ? COLORS.gray : COLORS.primaryTeal,
                    border: `1px solid ${currentPage === 1 ? COLORS.lightGray : COLORS.primaryTeal}`,
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Previous
                </button>

                <span style={{
                  color: COLORS.gray,
                  fontSize: '0.9rem',
                  margin: '0 1rem'
                }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === totalPages ? COLORS.lightGray : 'transparent',
                    color: currentPage === totalPages ? COLORS.gray : COLORS.primaryTeal,
                    border: `1px solid ${currentPage === totalPages ? COLORS.lightGray : COLORS.primaryTeal}`,
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContactUsManagement;