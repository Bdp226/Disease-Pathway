// Color Theme
export const COLORS = {
  primaryTeal: '#009999ff',
  primaryTealLight: '#87d2d2ff',
  primaryTealDark: '#00ACC1',
  accentOrange: '#ec6702ff',
  accentOrangeLight: '#ecb591ff',
  accentOrangeDark: 'rgba(236, 103, 2, 1)',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#808080',
  lightGray: '#bfbfbf',
  darkBorder: '#333333'
};

// NEW: Stage Gradient Colors
export const STAGE_GRADIENTS = {
  stage1: {
    primary: '#87d2d2', // Light Teal
    secondary: '#87d2d280',
    accent: '#87d2d240'
  },
  stage2: {
    primary: '#009999', // Primary Teal  
    secondary: '#00999980',
    accent: '#00999940'
  },
  stage3: {
    primary: '#00ACC1', // Dark Teal
    secondary: '#00ACC180', 
    accent: '#00ACC140'
  },
  stage4: {
    primary: '#ecb591', // Light Orange
    secondary: '#ecb59180',
    accent: '#ecb59140'
  },
  stage5: {
    primary: '#ec6702', // Primary Orange
    secondary: '#ec670280',
    accent: '#ec670240'
  },
  stage6: {
    primary: '#d4540a', // Darker Orange
    secondary: '#d4540a80',
    accent: '#d4540a40'
  }
};

// Function to get stage colors
export const getStageColors = (stageIndex, totalStages) => {
  const colorKeys = Object.keys(STAGE_GRADIENTS);
  const keyIndex = Math.min(stageIndex, colorKeys.length - 1);
  return STAGE_GRADIENTS[colorKeys[keyIndex]];
};


// API Configuration
export const API_BASE_URL = 'http://127.0.0.1:8000';

// Solution Types
export const SOLUTION_TYPES = {
  digitalization: 'Digitalization',
  automation: 'Automation',
  sensing: 'Sensing',
  clinical_innovation: 'Clinical Innovation',
  process_innovation: 'Process Innovation'
};

// Solution Colors
export const SOLUTION_COLORS = {
  digitalization: COLORS.primaryTeal,
  automation: COLORS.accentOrange,
  sensing: COLORS.primaryTeal,
  clinical_innovation: COLORS.accentOrangeDark,
  process_innovation: COLORS.primaryTealDark
};

export const HOME_IMAGES = {
  hero1: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400',
  hero2: '/hero2.png',
  hero3: '/hero3.png',
  hero4: '/hero4.png',
  worldMap: '/DP.png',
  healthcareIllustration: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&h=400',
  medicalTeam: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300'
};

export const LAYOUT = {
  navbar: {
    height: '80px',
    zIndex: 1000
  },
  diseaseHeader: {
    height: '60px', // Compact height
    zIndex: 900,
    padding: '0.75rem 2rem'
  },
  stageNavigation: {
    topOffset: '140px', // navbar + disease header heights
    zIndex: 150
  }
};

// Typography for Disease Header
export const DISEASE_HEADER = {
  title: {
    fontSize: '1.5rem', // Smaller than before
    fontWeight: '700'
  },
  info: {
    fontSize: '1rem',
    fontWeight: '500'
  },
  mobile: {
    title: {
      fontSize: '1.2rem',
      fontWeight: '700'
    },
    info: {
      fontSize: '0.9rem',
      fontWeight: '500'
    }
  }
};


