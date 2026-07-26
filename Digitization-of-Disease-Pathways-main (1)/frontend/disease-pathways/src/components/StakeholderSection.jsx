import React from 'react';
import StakeholderCard from './StakeholderCard.jsx';
import { COLORS } from '../utils/constants.js';

const StakeholderSection = ({ 
  stakeholders, 
  stageColors, 
  isDarkTheme = false 
}) => {
  // Split stakeholders by arrow separator
  const stakeholderList = stakeholders.split('\n').map(s => s.trim()).filter(s => s);

  // Function to get image path from stakeholder name
  const getStakeholderImage = (stakeholderText) => {
    ;
    // Extract first word from stakeholder text
    const firstWord = stakeholderText.trim().split('-')[0].trim().replace(/\//g, '');
    // Construct image path (handle case-insensitive matching)
    const imagePath = `/Stakeholders/${firstWord}.png`;
    return imagePath;
  };

  return (
    <div>
      <h3 style={{
        color: COLORS.white,
        fontSize: '1.2rem',
        fontWeight: '600',
        marginBottom: '1rem',
        textAlign: 'center',
        textShadow: `0 0 10px ${stageColors?.primary || COLORS.primaryTeal}40`
      }}>
        Key Stakeholders
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {stakeholderList.map((stakeholder, index) => (
          <StakeholderCard
            key={index}
            stakeholder={stakeholder}
            index={index}
            imagePath={getStakeholderImage(stakeholder)}  // Changed from 'icon' to 'imagePath'
            stageColors={stageColors}
            isDarkTheme={isDarkTheme}
          />
        ))}
      </div>
    </div>
  );
};

export default StakeholderSection;
