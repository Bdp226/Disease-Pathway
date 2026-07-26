import React from 'react';

const PlaceholderDiseaseGrid = ({ placeholders }) => {
  const getSpecialtyConfig = (specialty) => {
    const configs = {
      'Neuro-Degenerative': { accent: '#EC6702', bg: 'rgba(236, 103, 2, 0.1)' },
      'Cancer': { accent: '#5DCED9', bg: 'rgba(93, 206, 217, 0.1)' },
      'Cardio': { accent: '#FF6600', bg: 'rgba(255, 102, 0, 0.1)' }
    };
    return configs[specialty] || configs['Neurology'];
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '2.5rem',
      marginTop: '2.5rem', // Separation from real data
      padding: '0 1.5rem',
    }}>
      {placeholders.map((item, idx) => {
        const config = getSpecialtyConfig(item.specialty);
        return (
          <div 
            key={idx}
            style={{
              padding: '2.5rem',
              borderRadius: '20px',
              background: `radial-gradient(circle at top left, rgba(255,255,255,0.02) 0%, transparent 70%), #0A0A0A`,
              border: `1px dashed rgba(255, 255, 255, 0.15)`,
              position: 'relative',
              opacity: 0.8,
              cursor: 'not-allowed'
            }}
          >
            {/* Specialty Tag */}
            <div style={{
              display: 'inline-block',
              padding: '5px 14px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '800',
              backgroundColor: config.bg,
              color: config.accent,
              marginBottom: '1rem',
              marginRight: '10px'
            }}>
              {item.specialty}
            </div>

            {/* COMING SOON TAG */}
            <div style={{
              display: 'inline-block',
              padding: '5px 14px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '800',
              backgroundColor: '#333',
              color: '#FFF',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              COMING SOON
            </div>

            <h3 style={{ 
              fontFamily: 'SiemensSans',
              margin: '1.2rem 0', 
              color: 'white', 
              fontSize: '1.6rem',
              fontWeight: '700'
            }}>
              {item.name}
            </h3>
            
            <p style={{ color: 'white', fontSize: '0.9rem' }}>
              Standardized clinical pathway data for {item.name} is currently being validated.
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default PlaceholderDiseaseGrid;