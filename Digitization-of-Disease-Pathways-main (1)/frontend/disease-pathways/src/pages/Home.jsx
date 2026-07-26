import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { ArrowRight, Activity, ShieldCheck, Zap, Globe } from "lucide-react";
import { diseaseAPI } from '../utils/api.js';
import { COLORS, HOME_IMAGES } from '../utils/constants.js';
import DiseaseGrid from '../components/DiseaseGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import MinimalNavbar from '../components/MinimalNavbar.jsx';
import ChatbotWidget from '../components/ChatbotWidget.jsx';
import heroBackground from "../assets/images/Homepage_DP_page-0002.mp4"; 

// --- STAGE DATA FOR THE TRAY ---
const CARE_STAGES = [
  { id: 'prenatal', label: 'Prenatal', desc: 'Occurring or existing before birth', icon: 'prenatal.png' },
  { id: 'prevention', label: 'Prevention', desc: 'Measures taken for disease prevention', icon: 'prevention.png' },
  { id: 'symptoms', label: 'Symptoms', desc: 'A physical or psychological feature indicating a condition', icon: 'symptoms.png' },
  { id: 'diagnosis', label: 'Diagnosis', desc: 'Identification of the nature of an illness by examination', icon: 'diagnosis.png' },
  { id: 'treatment', label: 'Treatment', desc: 'Medical care given to a patient for an illness or injury', icon: 'treatment.svg' },
  { id: 'rehabilitation', label: 'Rehabilitation', desc: 'Interventions to optimize function & reduce disability', icon: 'rehabilitation.png' },
  { id: 'followup', label: 'Follow up', desc: 'Investigate something further', icon: 'prevention.png' },
  { id: 'outpatient', label: 'Outpatient', desc: 'Patient consultation without staying in hospital overnight', icon: 'outpatient.png' },
];

// --- STAGE DATA FOR USE CASES --- 
const USE_CASES = [
  {
    id: 1,
    title: 'Stakeholder analysis',
    desc: 'The disease pathway framework supports stakeholder mapping by clarifying roles and influence across each stage of the disease lifecycle.',
    icon: '/src/assets/icons/useCase/useCase1.png'
  },
  {
    id: 2,
    title: 'Pain point and root cause analysis',
    desc: 'These pathways help identify stakeholder pain points and enable efficient targeting of root causes across the care continuum.',
    icon: '/src/assets/icons/useCase/useCase2.png'
  },
  {
    id: 3,
    title: 'Portfolio mapping and white spot analysis',
    desc: 'Understanding challenges and stakeholder highlights improvement opportunities across care delivery and reveals market white spaces through disease pathway mapping.',
    icon: '/src/assets/icons/useCase/useCase3.png'
  },
  {
    id: 4,
    title: 'Product definition and decision proposition',
    desc: 'By integrating pain points, market white spaces, KOL insights, and hospital inputs, organizations can define customer needs and develop targeted, effective solutions.',
    icon: '/src/assets/icons/useCase/useCase4.svg'
  }
];

// --- STAGE DATA FOR HOME PAGE ---
const Home = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const trayRef = useRef(null);
  const isTrayInView = useInView(trayRef, { once: true, amount: 0.5 });
  
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const CLINICAL_AREAS = [
  { id: 'cardio', label: 'Cardio-vascular', path: '/diseases/cardio', comingSoon: false, icon: 'src/assets/images/Cardio.png' },
  { id: 'neuro', label: 'Neuro-degenerative', path: '/diseases/neuro', comingSoon: true, icon: 'src/assets/images/NeuroDegen.png' },
  { id: 'stroke', label: 'Stroke', path: '/diseases/stroke', comingSoon: true, icon: 'src/assets/images/Stroke.png' },
  { id: 'cancer', label: 'Cancer', path: '/diseases/cancer', comingSoon: true, icon: 'src/assets/images/Cancer.png' },
];

  // Animations for Part 1 (Headline)
  const opacity1 = useTransform(smoothProgress, [0, 0.2, 0.35], [1, 1, 0]);
  const scale1 = useTransform(smoothProgress, [0, 0.2, 0.35], [1, 1, 0.9]);
  
  // Animations for Part 2 (The Quote)
  const opacity2 = useTransform(smoothProgress, [0.45, 0.7], [0, 1]);
  const y2 = useTransform(smoothProgress, [0.45, 0.7], [80, 0]);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const data = await diseaseAPI.getAllDiseases();
        setDiseases(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDiseases();
  }, []);

  const theme = {
    bg: '#000000',
    cardBg: '#0F171A',
    surface: '#161F23',
    textMain: '#FFFFFF',
    textDim: '#A0AEC0',
    teal: '#00A3AD',
    tealDark: '#008A96',
    orange: '#EC6702',
    orangeLight: 'rgba(236, 103, 2, 0.1)'
  };

  return (
    <div style={{  position: 'sticky', background: theme.bg, color: theme.textMain, minHeight: '100vh', fontFamily: 'sans-serif' }}>

      <ChatbotWidget />
      
      {/* --- HERO SECTION CONTAINER --- */}
      <section ref={containerRef} style={{ position: 'relative', height: '200vh' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', background: '#000000' }}>

          {/* Video Container: Pushed completely to the left side */}
          <div style={{ 
            position: 'absolute', 
            left: 0,
            bottom: 0,
            top: '12vh', 
            width: '55%', // Takes up the left side of the viewport, leaving the right side pure black
            zIndex: 1 
          }}>
            {/* The Video Element */}
            <video
              src={heroBackground}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top', 
              }}
            />
            {/* Edge fading mask to smoothly blend video background into the right black zone */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, transparent 70%, #000 100%), linear-gradient(to top, #000 0%, transparent 25%)',
              }}
            />
          </div>

          {/* Part 1: Headline Block */}
          <motion.div 
            style={{ 
              opacity: opacity1, 
              scale: scale1, 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end', 
              padding: '8vh 10% 0 0', // Spaced nicely within the clean black area
              zIndex: 10, 
              pointerEvents: 'auto' 
            }}
          >
            <div style={{ maxWidth: '550px', textAlign: 'right' }}>
              <h1 className="siemens-header" style={{ fontSize: 'clamp(2rem, 4vw, 3.6rem)', color: theme.orange, marginBottom: '1.5rem', lineHeight: '1.1' }}>
                Disease Pathways 
              </h1>
              <p style={{ fontFamily:'SiemensSans', fontStyle: 'normal', fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                A strategic innovation tool that links real-world clinical challenges with emerging technological solutions.
              </p>
            </div>
          </motion.div>

          {/* Part 2: Description Card */}
          <motion.div 
            style={{ 
              opacity: opacity2, 
              y: y2, 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end', 
              padding: '0 10%',
              zIndex: 11, 
              pointerEvents: 'none'
            }}
          >
            <div style={{ 
              maxWidth: '550px', 
              padding: '3rem', 
              borderRadius: '24px', 
              background: 'rgba(0, 61, 79, 0.4)', 
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
              position: 'relative',
              pointerEvents: 'auto'
            }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ 
                  fontFamily: 'SiemensSans', 
                  fontSize: '1.3rem', 
                  lineHeight: '1.7', 
                  color: 'white',
                  margin: 0
                }}>
                  The <span style={{ color: theme.orange, fontWeight: '700' }}>Disease Pathways Framework</span> is a novel tool which describes the procedures involved in the healthcare provision throughout the development of various diseases.
                </p>
                
                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1.5rem' }}>
                    <div style={{ height: '2px', width: '80px', background: `linear-gradient(to left, ${theme.teal}, transparent)` }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transition Gradient to Body */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          width: '100%', 
          height: '15vh', 
          background: 'linear-gradient(to top, #000 0%, transparent 100%)', 
          zIndex: 2,
          pointerEvents: 'none' 
        }} />
      </section>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main style={{ position: 'relative', zIndex: 30, background: theme.bg }}>
        
        {/* Section 1: Interactive Use Cases Framework */}
        <section style={{ padding: '8rem 0', background: '#000', color: 'white' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
            
            {/* Interactive Header */}
            <div style={{ marginBottom: '5rem', textAlign: 'left' }}>
              <h2 style={{ 
                fontFamily: 'SHBree', 
                fontSize: '3rem', 
                color: 'white', 
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em',
                textAlign: 'center'
              }}>
                How can Disease Pathways help you?
              </h2>
            </div>

            {/* Main Framework Container */}
            <div style={{ 
              border: '1px solid rgba(255,255,255,0.15)', 
              borderRadius: '12px', 
              padding: '5rem 3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '4rem',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
              position: 'relative'
            }}>
              
              {/* LEFT COLUMN: Cases 1 & 2 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8rem' }}>
                {[USE_CASES[0], USE_CASES[1]].map((item) => (
                  <div key={item.id} style={{ textAlign: 'left' }}>
                    <h4 style={{ fontFamily: 'SiemensSans', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.2rem', color: '#fff' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontFamily: 'SiemensSans', color: '#A0AEC0', lineHeight: '1.6', fontSize: '1rem' }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* CENTER COLUMN: The Visual Grid */}
              <div style={{ 
                flex: 0.8, 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '30px',
                position: 'relative'
              }}>
                {USE_CASES.map((item, index) => {
                  // Logic to put numbers on left for index 0,2 and right for index 1,3
                  const isRightSide = index % 2 !== 0;

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${theme.teal}44` }}
                      style={{
                        background: 'rgb(29, 29, 29)',
                        aspectRatio: '1/1',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                      }}
                    >
                     
                      <div style={{
                        position: 'absolute',
                        [isRightSide ? 'right' : 'left']: '-20px', // Toggle side based on column
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: theme.orange,
                        color: '#fff',
                        width: '35px', // Increased size
                        height: '35px', // Increased size
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        borderRadius: '4px',
                        zIndex: 2,
                        boxShadow: '4px 4px 10px rgba(0,0,0,0.3)'
                      }}>
                        {item.id}
                      </div>
                      
                      {/* THE ICON (Teal on White) */}
                      <img 
                        src={item.icon} 
                        alt="" 
                        style={{ 
                          width: '65%', 
                          height: '65%', 
                          objectFit: 'contain',
                          filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(144deg) brightness(96%) contrast(101%)' 
                        }} 
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* RIGHT COLUMN: Cases 3 & 4 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8rem' }}>
                {[USE_CASES[2], USE_CASES[3]].map((item) => (
                  <div key={item.id} style={{ textAlign: 'left' }}>
                    <h4 style={{ fontFamily: 'SiemensSans', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.2rem', color: '#fff' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontFamily: 'SiemensSans', color: '#A0AEC0', lineHeight: '1.6', fontSize: '1rem' }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Section 2: Visual Tray */}
        <section ref={trayRef} style={{ padding: '6rem 0', background: theme.bg, overflow: 'hidden' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{ fontFamily: 'SHBree', fontSize: '3rem', color: 'white', fontWeight: '700' }}>
                8 Stages of Patient Care Plan
              </h2>
            </div>

            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
              
              {/* THE ANIMATED CONNECTING LINE */}
              <div style={{ position: 'absolute', top: '40px', left: '5%', right: '5%', height: '2px', background: 'rgba(255, 255, 255, 0.1)', zIndex: 1 }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={isTrayInView ? { width: '100%' } : { width: 0 }}
                  transition={{ duration: 1.8, ease: "circOut" }} // "circOut" feels more medical/precise
                  style={{ 
                    height: '100%', 
                    background: `linear-gradient(90deg, ${theme.teal}, ${theme.orange})`,
                    boxShadow: `0 0 15px ${theme.teal}`
                  }}
                />
              </div>

              {CARE_STAGES.map((stage, index) => (
                <motion.div 
                  key={stage.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isTrayInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ 
                    delay: 0.5 + (index * 0.15), // Starts appearing slightly after the line starts
                    duration: 0.4 
                  }}
                  style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '140px' }}
                >
                  {/* Icon Circle */}
                  <div style={{ 
                    width: '80px', height: '80px', borderRadius: '50%', background: '#111', 
                    border: `2px solid rgba(255,255,255,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}>
                    <img 
                      src={`/src/assets/icons/${stage.icon}`} 
                      alt={stage.label} 
                      style={{ 
                        width: '35px', 
                        height: '35px',
                        objectFit: 'contain', 
                        filter: 'brightness(0) invert(1)' 
                      }} 
                    />
                  </div>

                  <h4 style={{ color: '#FFF', fontSize: '0.95rem', fontWeight: '700', textAlign: 'center', marginBottom: '0.5rem' }}>
                    {stage.label}
                  </h4>

                  {/* Text Render I forgot to add (Sorry Archana) */}
                  <p style={{ 
                    color: theme.textDim, 
                    fontSize: '0.75rem', 
                    textAlign: 'center', 
                    lineHeight: '1.3',
                    margin: 0 
                  }}>
                    {stage.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Disease Grid Section */}
        <section style={{ padding: '8rem 0', background: '#000' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{ fontFamily: 'SHBree', fontSize: '3rem', fontWeight: '700', color: 'white' }}>
                Available Pathways
              </h2>
              <p style={{ fontFamily: 'SiemensSans', color: 'white', fontSize: '1.2rem', marginTop: '1rem', maxWidth: '800px', margin: '1rem auto 0' }}>
                Select a disease to explore its interactive clinical pathway.
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '24px', 
              alignItems: 'end' 
            }}>
              {CLINICAL_AREAS.map((area, index) => (
                <Link 
                  key={area.id} 
                  to={area.path} 
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -15, transition: { duration: 0.3 } }}
                    style={{ 
                      background: `linear-gradient(180deg, ${theme.orange} 0%, transparent 100%)`,
                      height: '500px', 
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '3rem 1.5rem',
                      position: 'relative',
                      overflow: 'hidden',
                      borderLeft: '1px solid rgba(255,255,255,0.05)',
                      borderRight: '1px solid rgba(255,255,255,0.05)',
                      opacity: area.comingSoon ? 0.6 : 1,
                    }}
                  >
                    <h3 style={{
                      fontFamily: "SHBree", 
                      color: '#FFF', 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      textAlign: 'center',
                      height: '70px',
                      display: 'flex',
                      alignItems: 'center',
                      lineHeight: '1.2'
                    }}>
                      {area.label}
                    </h3>

                    {/* Icon Area */}
                    <div style={{ 
                      marginTop: '1rem',
                      width: '150px',
                      height: '150px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        src={area.icon} 
                        alt={area.label} 
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          filter: 'brightness(0)',
                          objectFit: 'contain' 
                        }} 
                      />
                    </div>

                    {area.comingSoon === true && (
                      <div style={{
                        marginTop: 'auto',
                        background: 'rgba(255,255,255,0.25)',
                        padding: '6px 18px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: '5rem',
                      }}>
                        <span style={{ 
                          color: '#FFF', 
                          fontSize: '0.7rem', 
                          fontWeight: '600', 
                          textTransform: 'uppercase', 
                          letterSpacing: '1px' 
                        }}>
                          Preview Only
                        </span>
                      </div>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
      </main>
    </div>
  );
};

export default Home;