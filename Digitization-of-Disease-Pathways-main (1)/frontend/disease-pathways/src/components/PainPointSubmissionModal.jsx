import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { painPointAPI, diseaseAPI } from '../utils/api.js';
import { COLORS } from '../utils/constants.js';
import { MdClose, MdAdd } from 'react-icons/md';

const PainPointSubmissionModal = ({ isOpen, onClose, onSuccess, initialDisease = '', initialStageId = '' }) => {
  const [formData, setFormData] = useState({
    disease_name: initialDisease,
    stage_id: initialStageId,
    description: '',
    existing_solutions: '',
    sources: '',
    coverage: ''
  });

  // Also update when props change (in case modal is reused)
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        disease_name: initialDisease || prev.disease_name,
        stage_id: initialStageId || prev.stage_id
      }));
    }
  }, [isOpen, initialDisease, initialStageId]);

  const [diseases, setDiseases] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch diseases on mount
  useEffect(() => {
    if (isOpen) {
      diseaseAPI.getAllDiseases()
        .then(data => setDiseases(data))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  // Fetch stages when disease changes
  useEffect(() => {
    if (formData.disease_name) {
      diseaseAPI.getDiseaseDetails(formData.disease_name)
        .then(data => setStages(data.stages || []))
        .catch(err => console.error(err));
    } else {
      setStages([]);
    }
  }, [formData.disease_name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        description: formData.description,
        existing_solutions: formData.existing_solutions,
        sources: formData.sources,
        coverage: formData.coverage
      };

      await painPointAPI.submitPainPoint(formData.disease_name, formData.stage_id, submitData);
      
      // Reset form and show success
      setFormData({ disease_name: '', stage_id: '', description: '', existing_solutions: '', sources: '', coverage: '' });
      if (onSuccess) onSuccess('Pain point submitted successfully for review');
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1200,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '2rem'
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    >
      <div style={{
        background: COLORS.white,
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
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
          borderBottom: `1px solid ${COLORS.lightGray}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{
                color: COLORS.gray,
                fontSize: '1.8rem',
                fontWeight: '700',
                margin: 0
              }}>
                Submit Pain Point
              </h2>
              <p style={{
                color: COLORS.gray,
                fontSize: '1rem',
                margin: '0.5rem 0 0 0',
                opacity: 0.7
              }}>
                Help improve disease pathways by sharing your insights
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.gray,
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <MdClose />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {/* Disease Name - Required */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: COLORS.gray,
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              Disease Name <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <select
              value={formData.disease_name}
              onChange={(e) => {
                handleChange('disease_name', e.target.value);
                handleChange('stage_id', ''); // Reset stage on disease change
              }}
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
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
              onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
            >
              <option value="">Select a Disease</option>
              {diseases.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Stage Name - Required */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: COLORS.gray,
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              Stage <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <select
              value={formData.stage_id}
              onChange={(e) => handleChange('stage_id', e.target.value)}
              required
              disabled={!formData.disease_name}
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${COLORS.lightGray}`,
                borderRadius: '12px',
                fontSize: '1rem',
                color: COLORS.gray,
                background: COLORS.white,
                transition: 'border-color 0.3s ease',
                opacity: formData.disease_name ? 1 : 0.6,
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
              onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
            >
              <option value="">Select a Stage</option>
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Pain Point Description - Required */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: COLORS.gray,
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              Pain Point Description <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              rows={4}
              placeholder="Describe the specific problem or challenge you've identified..."
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${COLORS.lightGray}`,
                borderRadius: '12px',
                fontSize: '1rem',
                color: COLORS.gray,
                transition: 'border-color 0.3s ease',
                resize: 'vertical',
                minHeight: '100px',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
              onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
            />
          </div>

          {/* Solution - Optional */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: COLORS.gray,
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              Proposed Solution <span style={{ color: COLORS.gray, fontWeight: '400' }}>(Optional)</span>
            </label>
            <textarea
              value={formData.existing_solutions}
              onChange={(e) => handleChange('existing_solutions', e.target.value)}
              rows={3}
              placeholder="Suggest a potential solution or improvement..."
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${COLORS.lightGray}`,
                borderRadius: '12px',
                fontSize: '1rem',
                color: COLORS.gray,
                transition: 'border-color 0.3s ease',
                resize: 'vertical',
                minHeight: '80px',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
              onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
            />
          </div>

          {/* Source - Optional */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              color: COLORS.gray,
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              Source <span style={{ color: COLORS.gray, fontWeight: '400' }}>(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.sources}
              onChange={(e) => handleChange('sources', e.target.value)}
              placeholder="Enter source (text or URL)"
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${COLORS.lightGray}`,
                borderRadius: '12px',
                fontSize: '1rem',
                color: COLORS.gray,
                outline: 'none',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.primaryTeal}
              onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
            />
          </div>

          {/* Error Message */}
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
              onClick={onClose}
              style={{
                padding: '1rem 1.5rem',
                background: 'transparent',
                color: COLORS.gray,
                border: `2px solid ${COLORS.lightGray}`,
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading || !formData.disease_name || !formData.stage_id || !formData.description}
              style={{
                padding: '1rem 2rem',
                background: loading || !formData.disease_name || !formData.stage_id || !formData.description
                  ? COLORS.lightGray
                  : `linear-gradient(135deg, ${COLORS.primaryTeal}, ${COLORS.primaryTealLight})`,
                color: COLORS.white,
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading || !formData.disease_name || !formData.stage_id || !formData.description ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Pain Point'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PainPointSubmissionModal;
