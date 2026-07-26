import React from 'react';
import { useDiseases } from '../hooks/useDiseases.js';
import DiseaseGrid from '../components/DiseaseGrid.jsx';
import PlaceholderDiseaseGrid from '../components/PlaceholderDiseaseGrid.jsx'; // Ensure this import is here
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { COLORS } from '../utils/constants.js';

const DiseaseSelection = () => {
  const { diseases, loading, error } = useDiseases();

  const placeholders = [
    { name: "Alzheimer's Disease", specialty: "Neuro-Degenerative" },
    { name: "Lung Cancer", specialty: "Cancer" }
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#000' }}>
      <div className="container">
        <h1 style={{ 
          fontFamily: 'SHBree',
          textAlign: 'center', 
          marginBottom: '3rem', 
          color: COLORS.accentOrange,
          fontSize: '2.5rem'
        }}>
          Select a Disease Pathway
        </h1>
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#FF6B35', 
            fontSize: '1.2rem',
            padding: '2rem'
          }}>
            Error: {error}
          </div>
        ) : (
          <>
            {/* 1. RENDER LIVE DISEASES (If any exist) */}
            {diseases.length > 0 ? (
              <DiseaseGrid diseases={diseases} />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontSize: '1.1rem',
                padding: '3rem',
                border: '1px dashed #333',
                borderRadius: '12px',
                marginBottom: '3rem'
              }}>
                No live pathways found in the database.
              </div>
            )}

            {/* 2. RENDER PLACEHOLDERS (Always visible) */}
            <div style={{ marginTop: '5rem', marginBottom: '5rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '20px', 
                marginBottom: '2rem' 
              }}>
              </div>

              <PlaceholderDiseaseGrid placeholders={placeholders} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DiseaseSelection;