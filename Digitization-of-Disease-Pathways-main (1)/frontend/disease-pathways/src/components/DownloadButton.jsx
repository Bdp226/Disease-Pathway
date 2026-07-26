import React, { useState } from 'react';
import { diseaseAPI } from '../utils/api.js';
import { COLORS } from '../utils/constants.js';

const DownloadButton = ({ diseaseName, stageColors, onSuccess, onError }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!diseaseName || downloading) return;
    
    setDownloading(true);
    
    try {
      const result = await diseaseAPI.downloadDiseaseCSV(diseaseName);
      if (onSuccess) onSuccess(`Downloaded: ${result.filename}`);
    } catch (error) {
      if (onError) onError(error.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      style={{
        width: '100%',
        padding: '0.75rem 1rem',
        background: downloading 
          ? 'rgba(255, 255, 255, 0.1)' 
          : `linear-gradient(135deg, ${stageColors?.primary || COLORS.primaryTeal}, ${stageColors?.secondary || COLORS.primaryTealLight})`,
        border: 'none',
        borderRadius: '8px',
        color: COLORS.white,
        fontSize: '1rem',
        fontWeight: '600',
        cursor: downloading ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}
      onMouseEnter={(e) => {
        if (!downloading) {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = `0 4px 15px ${stageColors?.primary || COLORS.primaryTeal}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (!downloading) {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }
      }}
    >
      {downloading && (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      )}
      {downloading ? 'Downloading...' : 'Download Pathway CSV'}
    </button>
  );
};

export default DownloadButton;
