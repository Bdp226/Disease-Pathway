import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { diseaseAPI } from '../utils/api.js';
import DiseaseGrid from '../components/DiseaseGrid.jsx';
import PlaceholderDiseaseGrid from '../components/PlaceholderDiseaseGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const NeuroPathways = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const placeholders = [{ name: "Alzheimer's Disease", specialty: "Neuro-Degenerative" }];

  const theme = {
    bg: '#000000',
    teal: '#00A3AD',
    orange: '#EC6702',
    textDim: '#A0AEC0'
  };

  useEffect(() => {
    const fetchNeuroDiseases = async () => {
      try {
        const data = await diseaseAPI.getAllDiseases();
        // FILTER: Includes neuro, brain, dementia, alzheimer, parkinson, etc.
        const neuroOnly = data.filter(disease => 
          disease.name.toLowerCase().includes('neuro') || 
          disease.name.toLowerCase().includes('brain') ||
          disease.name.toLowerCase().includes('alzheimer') ||
          disease.name.toLowerCase().includes('dementia') ||
          disease.name.toLowerCase().includes('parkinson')
        );
        setDiseases(neuroOnly);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNeuroDiseases();
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
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '3.5rem', color: theme.orange, marginBottom: '1rem', fontFamily: 'SHBree' }}>
            Neuro-Degenerative
          </motion.h1>
          <p style={{ fontFamily: 'SiemensSans', fontSize: '1.2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
            Exploring the complexities of the central nervous system through standardized care pathways.
          </p>
        </header>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div style={{ textAlign: 'center', color: theme.orange, padding: '4rem' }}>Error: {error}</div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            
            {/* 1. Only render the real grid if data exists */}
            {diseases.length > 0 ? (
              <DiseaseGrid diseases={diseases} />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#0F0F0F', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                <Brain size={48} color={theme.textDim} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ color: theme.textDim }}>No Active Pathways Found</h3>
              </div>
            )}

            {/* 2. ALWAYS render placeholders regardless of database state */}
            <PlaceholderDiseaseGrid placeholders={placeholders} />
            
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default NeuroPathways;