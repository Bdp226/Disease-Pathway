import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { diseaseAPI } from '../utils/api.js';
import DiseaseGrid from '../components/DiseaseGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const CardioPathways = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = {
    bg: '#000000',
    teal: '#00A3AD',
    orange: '#EC6702',
    textDim: '#A0AEC0'
  };

  useEffect(() => {
    const fetchCardioDiseases = async () => {
      try {
        const data = await diseaseAPI.getAllDiseases();
        
        // FILTER LOGIC: Only keep diseases related to Cardio
        // You can expand this list with other keywords like 'heart', 'valve', etc.
        const cardioOnly = data.filter(disease => 
          disease.name.toLowerCase().includes('coronary artery disease') || 
          disease.name.toLowerCase().includes('cardio') ||
          disease.name.toLowerCase().includes('heart') ||
          disease.name.toLowerCase() === 'cad'
        );

        setDiseases(cardioOnly);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCardioDiseases();
  }, []);

  return (
    <div style={{ background: theme.bg, color: '#fff', minHeight: '100vh', padding: '2rem' }}>
      {/* Navigation */}
      <nav style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '4rem', paddingTop: '80px' }}>
        <Link 
          to="/" 
          style={{ color: theme.textDim, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
        >
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
            Cardio-vascular
          </motion.h1>
          <p style={{ fontFamily: 'SiemensSans', fontSize: '1.2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
            Select a specific condition below to explore detailed data-driven patient journeys and clinical protocols.
          </p>
        </header>

        {/* Data Rendering Logic */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div style={{ textAlign: 'center', color: theme.orange, padding: '4rem' }}>
            Error: {error}
          </div>
        ) : diseases.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '5rem', 
            background: '#0F0F0F', 
            borderRadius: '24px',
            border: '1px dashed rgba(255,255,255,0.1)' 
          }}>
            <Activity size={48} color={theme.textDim} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ color: theme.textDim }}>No Cardiovascular Pathways Found</h3>
            <p style={{ color: '#666' }}>Please ensure diseases are named correctly in the admin panel.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <DiseaseGrid diseases={diseases} />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CardioPathways;