import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { diseaseAPI } from '../utils/api.js';
import { COLORS } from '../utils/constants.js';
import { isAuthenticated, getCurrentUser, isAdmin } from '../utils/api.js';
import { MdCloudUpload, MdDelete, MdInsertChart, MdAccountCircle, MdUpload, MdFilePresent, MdWarning } from 'react-icons/md';
import PainPointManagement from '../components/PainPointManagement.jsx';
import ContactUsManagement from '../components/ContactUsManagement.jsx';
import AnalyticsDashboard from '../components/AnalyticsDashboard.jsx';

const Admin = () => {
  const navigate = useNavigate();
  
  // Active section state
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Data states
  const [stats, setStats] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDiseaseName, setUploadDiseaseName] = useState('');
  const [uploadDiseaseGroup, setUploadDiseaseGroup] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [user, setUser] = useState(getCurrentUser());
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  // Redirect if not admin
  useEffect(() => {
    if (!authenticated) {
      navigate('/login?redirect=' + encodeURIComponent('/admin'));
    } else if (!isAdmin()) {
      navigate('/diseases');
    }
  }, [authenticated, navigate]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (authenticated && isAdmin()) {
        try {
          const [statsData, diseasesData] = await Promise.all([
            diseaseAPI.getStats(),
            diseaseAPI.getAllDiseases()
          ]);
          console.log('Admin data loaded:', { statsData, diseasesData });
          setStats(statsData);
          setDiseases(diseasesData);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      }
    };

    loadData();
  }, [authenticated]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadDiseaseName) {
      setUploadError('Please select a file and enter a disease name');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      await diseaseAPI.uploadExcel(uploadDiseaseName, uploadFile, uploadDiseaseGroup);
      setUploadSuccess(`Successfully uploaded ${uploadFile.name} for ${uploadDiseaseName}`);
      
      // Reset form
      setUploadFile(null);
      setUploadDiseaseName('');
      setUploadDiseaseGroup('');
      
      // Reload data
      const [statsData, diseasesData] = await Promise.all([
        diseaseAPI.getStats(),
        diseaseAPI.getAllDiseases()
      ]);
      setStats(statsData);
      setDiseases(diseasesData);
      
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDisease = async (diseaseName) => {
    if (!window.confirm(`Are you sure you want to delete the disease "${diseaseName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await diseaseAPI.deleteDisease(diseaseName);
      setUploadSuccess(`Successfully deleted disease: ${diseaseName}`);
      
      // Reload data
      const [statsData, diseasesData] = await Promise.all([
        diseaseAPI.getStats(),
        diseaseAPI.getAllDiseases()
      ]);
      setStats(statsData);
      setDiseases(diseasesData);
      
    } catch (error) {
      setUploadError(error.message);
    }
  };

  // Clear messages when switching sections
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setUploadError('');
    setUploadSuccess('');
  };

  if (!authenticated || !isAdmin()) {
    return null; // Will redirect
  }

  // Sidebar Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'add', label: 'Add Disease' },
    { id: 'delete', label: 'Delete Disease' },
    { id: 'painpoints', label: 'Pain Point Requests' },
    { id: 'contact', label: 'Contact Us Requests' } 
  ];

  return (
    <div className="admin-layout" style={{ background: COLORS.white }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Brand Section */}
        <div style={{
          padding: '2rem 1.5rem',
          borderBottom: `1px solid ${COLORS.white}30`
        }}>
          <h2 style={{
            color: COLORS.white,
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: 0
          }}>
            Admin Panel
          </h2>
          <p style={{
            color: COLORS.white,
            fontSize: '0.85rem',
            margin: '0.5rem 0 0 0',
            opacity: 0.8
          }}>
            Disease Pathways
          </p>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '1rem 0' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.disabled && handleSectionChange(item.id)}
              disabled={item.disabled}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: activeSection === item.id 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'transparent',
                border: 'none',
                borderLeft: activeSection === item.id 
                  ? `4px solid ${COLORS.accentOrange}` 
                  : '4px solid transparent',
                color: item.disabled ? 'rgba(255, 255, 255, 0.4)' : COLORS.white,
                fontSize: '1rem',
                fontWeight: activeSection === item.id ? '600' : '500',
                textAlign: 'left',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && activeSection !== item.id) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div>
              {/* Section Header */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                  color: COLORS.gray,
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  margin: '0 0 0.5rem 0'
                }}>
                  Dashboard
                </h1>
                <p style={{
                  color: COLORS.gray,
                  fontSize: '1.1rem',
                  margin: 0,
                  opacity: 0.7
                }}>
                  Overview of your disease pathway management system
                </p>
              </div>

              {/* Admin Profile Card */}
              <div style={{
                background: COLORS.white,
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${COLORS.lightGray}`,
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h2 style={{
                      color: COLORS.accentOrange,
                      fontSize: '2rem',
                      fontWeight: '700',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Welcome Back, {user?.full_name}
                    </h2>
                    <p style={{
                      color: COLORS.gray,
                      fontSize: '1rem',
                      margin: 0,
                      opacity: 0.8
                    }}>
                      {user?.email}
                    </p>
                  </div>
                  
                  <div style={{
                    background: `linear-gradient(135deg, ${COLORS.accentOrange}10, ${COLORS.accentOrange}20)`,
                    border: `2px solid ${COLORS.accentOrange}30`,
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    textAlign: 'center'
                  }}>
                    <MdAccountCircle style={{
                      fontSize: '2rem',
                      color: COLORS.accentOrange,
                      marginBottom: '0.5rem'
                    }} />
                    <div style={{
                      background: COLORS.accentOrange,
                      color: COLORS.white,
                      padding: '0.3rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      ADMINISTRATOR
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              {stats && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem'
                }}>
                  <div style={{
                    background: COLORS.white,
                    border: `2px solid ${COLORS.primaryTeal}30`,
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <MdInsertChart style={{
                      fontSize: '3rem',
                      color: COLORS.primaryTeal,
                      marginBottom: '1rem'
                    }} />
                    <div style={{
                      color: COLORS.primaryTeal,
                      fontSize: '3rem',
                      fontWeight: '700',
                      marginBottom: '0.5rem'
                    }}>
                      {stats.total_diseases || 0}
                    </div>
                    <div style={{
                      color: COLORS.gray,
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}>
                      Total Diseases
                    </div>
                  </div>
                  
                  <div style={{
                    background: COLORS.white,
                    border: `2px solid ${COLORS.accentOrange}30`,
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <MdFilePresent style={{
                      fontSize: '3rem',
                      color: COLORS.accentOrange,
                      marginBottom: '1rem'
                    }} />
                    <div style={{
                      color: COLORS.accentOrange,
                      fontSize: '3rem',
                      fontWeight: '700',
                      marginBottom: '0.5rem'
                    }}>
                      {stats.total_stages || 0}
                    </div>
                    <div style={{
                      color: COLORS.gray,
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}>
                      Total Stages
                    </div>
                  </div>
                  
                  <div style={{
                    background: COLORS.white,
                    border: `2px solid ${COLORS.gray}30`,
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <MdWarning style={{
                      fontSize: '3rem',
                      color: COLORS.gray,
                      marginBottom: '1rem'
                    }} />
                    <div style={{
                      color: COLORS.gray,
                      fontSize: '3rem',
                      fontWeight: '700',
                      marginBottom: '0.5rem'
                    }}>
                      {stats.total_pain_points || 0}
                    </div>
                    <div style={{
                      color: COLORS.gray,
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}>
                      Total Pain Points
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Analytics Dashboard */}
              <div style={{ marginTop: '2rem' }}>
                <AnalyticsDashboard />
              </div>
            </div>
          )}

          {/* Add Disease Section */}
          {activeSection === 'add' && (
            <div>
              {/* Section Header */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                  color: COLORS.gray,
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  margin: '0 0 0.5rem 0'
                }}>
                  Add New Disease
                </h1>
                <p style={{
                  color: COLORS.gray,
                  fontSize: '1.1rem',
                  margin: 0,
                  opacity: 0.7
                }}>
                  Upload Excel files to create new disease pathways
                </p>
              </div>

              {/* Upload Form */}
              <div style={{
                background: COLORS.white,
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${COLORS.lightGray}`,
                padding: '2.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  <MdCloudUpload style={{
                    fontSize: '2rem',
                    color: COLORS.primaryTeal
                  }} />
                  <div>
                    <h2 style={{
                      color: COLORS.gray,
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      margin: 0
                    }}>
                      Upload Disease Pathway
                    </h2>
                  </div>
                </div>

                <form onSubmit={handleFileUpload} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 300px auto',
                  gap: '1.5rem',
                  alignItems: 'end'
                }}>
                  <div>
                    <label style={{
                      color: COLORS.gray,
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: '600'
                    }}>
                      Disease Name
                    </label>
                    <input
                      type="text"
                      value={uploadDiseaseName}
                      onChange={(e) => setUploadDiseaseName(e.target.value)}
                      placeholder="Enter disease name (e.g., CAD, diabetes)"
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${COLORS.lightGray}`,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        color: COLORS.gray,
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
                      onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      color: COLORS.gray,
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: '600'
                    }}>
                      Disease Group
                    </label>
                    <select
                      value={uploadDiseaseGroup}
                      onChange={(e) => setUploadDiseaseGroup(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${COLORS.lightGray}`,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        color: COLORS.gray,
                        outline: 'none',
                        background: COLORS.white,
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
                      onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
                    >
                      <option value="">Select Group</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Endocrinology">Endocrinology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      color: COLORS.gray,
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: '600'
                    }}>
                      Excel File
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${COLORS.lightGray}`,
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        color: COLORS.gray,
                        outline: 'none'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      padding: '1rem 1.5rem',
                      background: uploading 
                        ? COLORS.lightGray 
                        : `linear-gradient(135deg, ${COLORS.primaryTeal}, ${COLORS.primaryTealLight})`,
                      color: COLORS.white,
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      minWidth: '140px',
                      justifyContent: 'center'
                    }}
                  >
                    <MdUpload />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </form>

                {/* Upload Messages */}
                {uploadError && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(211, 47, 47, 0.08)',
                    border: '1px solid rgba(211, 47, 47, 0.2)',
                    borderRadius: '12px',
                    color: '#d32f2f',
                    fontSize: '0.95rem'
                  }}>
                    {uploadError}
                  </div>
                )}

                {uploadSuccess && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(76, 175, 80, 0.08)',
                    border: '1px solid rgba(76, 175, 80, 0.2)',
                    borderRadius: '12px',
                    color: '#4caf50',
                    fontSize: '0.95rem'
                  }}>
                    {uploadSuccess}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delete Disease Section */}
          {activeSection === 'delete' && (
            <div>
              {/* Section Header */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                  color: COLORS.gray,
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  margin: '0 0 0.5rem 0'
                }}>
                  Manage Diseases
                </h1>
                <p style={{
                  color: COLORS.gray,
                  fontSize: '1.1rem',
                  margin: 0,
                  opacity: 0.7
                }}>
                  View and delete existing disease pathways
                </p>
              </div>

              {/* Disease Grid */}
              <div style={{
                background: COLORS.white,
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${COLORS.lightGray}`,
                padding: '2.5rem'
              }}>
                {diseases.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {diseases.map((disease) => (
                      <div
                        key={disease.id}
                        style={{
                          border: `1px solid ${COLORS.lightGray}`,
                          borderRadius: '12px',
                          padding: '1.5rem',
                          background: COLORS.white,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <h3 style={{
                          color: COLORS.accentOrange,
                          fontSize: '1.3rem',
                          fontWeight: '700',
                          margin: '0 0 1rem 0',
                          textTransform: 'capitalize'
                        }}>
                          {disease.name}
                        </h3>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '0.5rem',
                          marginBottom: '1.5rem',
                          fontSize: '0.9rem',
                          color: COLORS.gray
                        }}>
                          <div><strong>{disease.stage_count}</strong> Stages</div>
                          <div><strong>{disease.total_pain_points}</strong> Pain Points</div>
                        </div>

                        <div style={{
                          display: 'flex',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => navigate(`/pathway/${disease.name}`)}
                            style={{
                              flex: 1,
                              padding: '0.75rem',
                              background: `linear-gradient(135deg, ${COLORS.primaryTeal}, ${COLORS.primaryTealLight})`,
                              color: COLORS.white,
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            View
                          </button>
                          
                          <button
                            onClick={() => handleDeleteDisease(disease.name)}
                            style={{
                              padding: '0.75rem',
                              background: 'rgba(211, 47, 47, 0.1)',
                              color: '#d32f2f',
                              border: '1px solid rgba(211, 47, 47, 0.2)',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: COLORS.gray,
                    opacity: 0.6
                  }}>
                    <MdFilePresent style={{ fontSize: '4rem', marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem' }}>No diseases uploaded yet</p>
                    <p style={{ fontSize: '0.9rem' }}>Upload your first Excel file to get started</p>
                  </div>
                )}

                {/* Success/Error Messages */}
                {uploadError && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(211, 47, 47, 0.08)',
                    border: '1px solid rgba(211, 47, 47, 0.2)',
                    borderRadius: '12px',
                    color: '#d32f2f',
                    fontSize: '0.95rem'
                  }}>
                    {uploadError}
                  </div>
                )}

                {uploadSuccess && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(76, 175, 80, 0.08)',
                    border: '1px solid rgba(76, 175, 80, 0.2)',
                    borderRadius: '12px',
                    color: '#4caf50',
                    fontSize: '0.95rem'
                  }}>
                    {uploadSuccess}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pain Point Requests Section */}
          {activeSection === 'painpoints' && (
            <div>
              {/* Section Header */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                  color: COLORS.gray,
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  margin: '0 0 0.5rem 0'
                }}>
                  Pain Point Requests
                </h1>
                <p style={{
                  color: COLORS.gray,
                  fontSize: '1.1rem',
                  margin: 0,
                  opacity: 0.7
                }}>
                  Review and manage user-submitted pain points
                </p>
              </div>

              {/* Pain Point Management Component */}
              <PainPointManagement />
            </div>
          )}

          {/* Contact Us Section */}
          {activeSection === 'contact' && (
            <div>
              {/* Section Header */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                  color: COLORS.gray,
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  margin: '0 0 0.5rem 0'
                }}>
                  Contact Us Requests
                </h1>
                <p style={{
                  color: COLORS.gray,
                  fontSize: '1.1rem',
                  margin: 0,
                  opacity: 0.7
                }}>
                  Manage user inquiries and support requests
                </p>
              </div>

              {/* Contact Us Management Component */}
              <ContactUsManagement />
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Admin;
