import React from 'react';
import StakeholderCard from './StakeholderCard.jsx';
import { COLORS } from '../utils/constants.js';

const StakeholderSection = ({ 
  stakeholders, 
  stageColors, 
  isDarkTheme = false 
}) => {
  // Split stakeholders by arrow separator or newline and filter out empty or placeholder values
  const stakeholderList = stakeholders.split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0 && s !== '-' && !s.toLowerCase().includes('list from old pathway'));

  const getStakeholderImage = (stakeholderText) => {
    // Extract ONLY the role name (everything before the hyphen, en-dash, em-dash, or colon) to avoid matching words in the description
    const roleName = stakeholderText.split(/[:-]|\u2013|\u2014/)[0].trim().toLowerCase();

    // 1. Exact Specific Medical Specialists
    if (roleName.includes('cardiac surgeon')) return '/NewIcons/cardiac_surgeons.png?v=2';
    if (roleName.includes('cardiologists centre') || roleName.includes('clinic') || roleName.includes('hospital')) return '/NewIcons/cardiologists_centre.png?v=2';
    if (roleName.includes('interventional cardiologist')) return '/NewIcons/interventional_cardiologists.png?v=2';
    if (roleName.includes('cardiologist') || roleName.includes('cardiology')) return '/NewIcons/Cardiologists.png?v=2';
    if (roleName.includes('dietitian') || roleName.includes('dietician') || roleName.includes('nutritionist') || roleName.includes('dietitionist') || roleName.includes('diet')) return '/NewIcons/dieticians.png?v=2';
    if (roleName.includes('psychologist') || roleName.includes('psycologist') || roleName.includes('psychiatrist') || roleName.includes('psychotherapist') || roleName.includes('counsel') || roleName.includes('mental')) return '/NewIcons/psycologists.png?v=2';
    if (roleName.includes('radiologist') || roleName.includes('radiography') || roleName.includes('radiation') || roleName.includes('imaging')) return '/NewIcons/radiologist.png?v=2';
    if (roleName.includes('molecular path')) return '/NewIcons/molecular_pathology.png?v=2';
    if (roleName.includes('lab') || roleName.includes('pathologist') || roleName.includes('technician')) return '/NewIcons/lab_specialist.png?v=2';
    if (roleName.includes('cath lab')) return '/NewIcons/cath_labs.png?v=2';
    if (roleName.includes('neurologist') || roleName.includes('neurology')) return '/NewIcons/neurologist.png?v=2';
    if (roleName.includes('obstetrician') || roleName.includes('ob/gyn') || roleName.includes('maternal') || roleName.includes('gynecologist')) return '/NewIcons/obstetrician.png?v=2';
    if (roleName.includes('pediatrician') || roleName.includes('paediatrician') || roleName.includes('pediatric') || roleName.includes('child')) return '/NewIcons/pediatrician.png?v=2';
    if (roleName.includes('pulmonologist') || roleName.includes('respiratory') || roleName.includes('lung')) return '/NewIcons/pulmonologist.png?v=2';
    if (roleName.includes('nuclear medicine')) return '/NewIcons/nuclear_medicine_physician.png?v=2';
    
    // 2. Emergency & Rehab
    if (roleName.includes('emergency') || roleName.includes('trauma') || roleName.includes('urgent') || roleName.includes('er')) return '/NewIcons/emergency_physicians.png?v=2';
    if (roleName.includes('paramedic') || roleName.includes('ambulance') || roleName.includes('ems') || roleName.includes('first responder')) return '/NewIcons/paramedics.png?v=2';
    if (roleName.includes('vocational') || roleName.includes('counselor') || roleName.includes('counsellor')) return '/NewIcons/vocational_counsellor.png?v=2';
    if (roleName.includes('rehab') || roleName.includes('physiotherapist') || roleName.includes('physical therapist') || roleName.includes('occupational')) return '/NewIcons/rehab_specialists.png?v=2';

    // 3. General Doctors & Other Physicians (Grouped into most appropriate generic doctor icons)
    if (roleName.includes('general practitioner') || roleName.includes('gp') || roleName.includes('family doctor')) return '/NewIcons/general-practitioners.png?v=2';
    if (roleName.includes('primary doctor') || roleName.includes('pcp')) return '/NewIcons/primary_doctor.png?v=2';
    if (roleName.includes('primary care') || roleName.includes('oncologist') || roleName.includes('doctor') || roleName.includes('physician') || roleName.includes('surgeon') || roleName.includes('specialist') || roleName.includes('clinician') || roleName.includes('medical')) return '/NewIcons/primary_care_physicians.png?v=2';
    
    // 4. Organizations & Companies
    if (roleName.includes('ministry of health') || roleName.includes('moh') || roleName.includes('department of health')) return '/NewIcons/ministry_of_health.png?v=2';
    if (roleName.includes('community') || roleName.includes('ngo') || roleName.includes('charity') || roleName.includes('advocacy') || roleName.includes('support group')) return '/NewIcons/community_organizations.png?v=2';
    if (roleName.includes('digital health platform') || roleName.includes('software')) return '/NewIcons/digital_health_platforms.png?v=2';
    if (roleName.includes('digital health provider')) return '/NewIcons/digital_health_providers.png?v=2';
    if (roleName.includes('food') || roleName.includes('nutrition company')) return '/NewIcons/food_and_tech_companies.png?v=2';
    if (roleName.includes('government') || roleName.includes('govt') || roleName.includes('policy') || roleName.includes('regulator') || roleName.includes('agency')) return '/NewIcons/govt_healtrh_agencies.png?v=2';
    if (roleName.includes('insurance') || roleName.includes('medicare') || roleName.includes('medicaid')) return '/NewIcons/insurance_companies.png?v=2';
    if (roleName.includes('medical device') || roleName.includes('device') || roleName.includes('equipment')) return '/NewIcons/medical_device_companies.png?v=2';
    if (roleName.includes('payer') || roleName.includes('insurer') || roleName.includes('health plan')) return '/NewIcons/payers-insurers.png?v=2';
    if (roleName.includes('pharma') || roleName.includes('drug') || roleName.includes('biotech')) return '/NewIcons/pharma_companies.png?v=2';
    if (roleName.includes('public health') || roleName.includes('epidemiolog')) return '/NewIcons/public_health_authorities.png?v=2';
    
    // Tech providers
    if (roleName.includes('technology provider1') || roleName.includes('tech provider 1')) return '/NewIcons/technology_providers1.png?v=2';
    if (roleName.includes('technology') || roleName.includes('tech company') || roleName.includes('tech companies') || roleName.includes('tech provider') || roleName.includes('tech') || roleName.includes('it ')) return '/NewIcons/technology_providers.png?v=2';

    // 5. Patients, Families & Caregivers
    if (roleName.includes('family') || roleName.includes('caregiver') || roleName.includes('relative') || roleName.includes('parent') || roleName.includes('spouse')) return '/NewIcons/caregivers-families.png?v=2';
    if (roleName.includes('general population') || roleName.includes('public') || roleName.includes('society')) return '/NewIcons/patients_and_gen_providers.png?v=2';
    if (roleName.includes('patient') || roleName.includes('pregnant') || roleName.includes('individual') || roleName.includes('consumer') || roleName.includes('survivor')) return '/NewIcons/patients.png?v=2';

    // 6. Guaranteed Fallback
    // If it's likely an organization/company based on keywords
    if (roleName.includes('company') || roleName.includes('org') || roleName.includes('center') || roleName.includes('association') || roleName.includes('industry')) {
      return '/NewIcons/community_organizations.png?v=2';
    }
    // Otherwise fallback to generic provider/person icon
    return '/NewIcons/patients_and_gen_providers.png?v=2';
  };

  if (stakeholderList.length === 0) {
    return null;
  }

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
            key={`${stakeholder}-${index}`}
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
