import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import { diseaseAPI } from '../utils/api.js';
import DiseaseGrid from '../components/DiseaseGrid.jsx';
import PlaceholderDiseaseGrid from '../components/PlaceholderDiseaseGrid.jsx'; // Added import
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const CancerPathways = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hardcoded placeholder for Lung Cancer
  const placeholders = [{ name: "Lung Cancer", specialty: "Cancer" }];

  const theme = { 
    bg: '#000000', 
    teal: '#00A3AD', 
    orange: '#EC6702', 
    textDim: '#A0AEC0' 
  };

  useEffect(() => {
    const fetchCancerDiseases = async () => {
      try {
        const data = await diseaseAPI.getAllDiseases();
        const oncologyOnly = data.filter(disease => 
          disease.name.toLowerCase().includes('cancer') || 
          disease.name.toLowerCase().includes('oncology') ||
          disease.name.toLowerCase().includes('tumor') ||
          disease.name.toLowerCase().includes('carcinoma')
        );
        setDiseases(oncologyOnly);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCancerDiseases();
  }, []);

  return (
    <div style={{ background: theme.bg, color: '#fff', minHeight: '100vh', padding: '2rem' }}>
      <nav style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '4rem', paddingTop: '80px' }}>
        <Link to="/" style={{ color: theme.textDim, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
          <ArrowLeft size={20} /> Back to Pathways
        </Link>
      </nav>

      <main style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            style={{ fontSize: '3.5rem', color: theme.orange, marginBottom: '1rem', fontFamily: 'SHBree' }}
          >
            Cancer
          </motion.h1>
          <p style={{ fontFamily: 'SiemensSans', fontSize: '1.2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
            Comprehensive pathways for screening, diagnosis, and treatment of oncological conditions.
          </p>
        </header>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div style={{ textAlign: 'center', color: theme.orange, padding: '4rem' }}>Error: {error}</div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            
            {/* 1. Render Live Data if it exists */}
            {diseases.length > 0 ? (
              <DiseaseGrid diseases={diseases} />
            ) : (
              <div style={{ textAlign: 'center', padding: '5rem', background: '#0F0F0F', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                <Target size={48} color={theme.textDim} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ color: theme.textDim }}>No Active Cancer Pathways Found</h3>
              </div>
            )}

            {/* 2. Render the "Lung Cancer" Placeholder */}
            <PlaceholderDiseaseGrid placeholders={placeholders} />

          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CancerPathways;