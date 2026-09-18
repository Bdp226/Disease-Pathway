  import React, { useState, useEffect, useRef } from 'react';
  import { useParams, useSearchParams, Link } from 'react-router-dom';
  import { diseaseAPI } from '../utils/api.js';
  import { COLORS, LAYOUT, getStageColors } from '../utils/constants.js';
  import PinterestLayout from '../components/PinterestLayout.jsx';
  import LoadingSpinner from '../components/LoadingSpinner.jsx';
  import MinimalNavbar from '../components/MinimalNavbar.jsx';
  import FloatingWidget from '../components/FloatingWidget.jsx';
  import { SimilarDiseases } from '../components/AnalyticsDashboard.jsx';

  const DiseasePathway = () => {
    const { diseaseName } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [pathwayData, setPathwayData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visitedStages, setVisitedStages] = useState(new Set());
    
    // New state for load more functionality
    const [expandedStages, setExpandedStages] = useState({});
    const [loadingStages, setLoadingStages] = useState({});
    const [stageErrors, setStageErrors] = useState({});
    const [originalData, setOriginalData] = useState(null);

    const activeStage = searchParams.get('stage');
    const stageRefs = useRef({});

    useEffect(() => {
      const fetchPathway = async () => {
        try {
          const data = await diseaseAPI.getDiseasePathway(diseaseName);
          setPathwayData(data);
          setOriginalData(data); // Store original 7-pain-point data
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchPathway();
    }, [diseaseName]);

    // Handle Load More Pain Points
    const handleLoadMorePainPoints = async (stageName) => {
      setLoadingStages(prev => ({ ...prev, [stageName]: true }));
      setStageErrors(prev => ({ ...prev, [stageName]: null }));

      try {
        // Fetch complete data
        const fullData = await diseaseAPI.getDiseasePathway(diseaseName, true);
        
        // Update the specific stage with complete pain points
        setPathwayData(prevData => ({
          ...prevData,
          stages: {
            ...prevData.stages,
            [stageName]: {
              ...prevData.stages[stageName],
              pain_points: fullData.stages[stageName].pain_points,
              total_pain_points: fullData.stages[stageName].pain_points.length
            }
          }
        }));

        // Mark stage as expanded
        setExpandedStages(prev => ({ ...prev, [stageName]: true }));

      } catch (error) {
        console.error('Error loading more pain points:', error);
        setStageErrors(prev => ({ 
          ...prev, 
          [stageName]: 'Failed to load more pain points. Please try again.' 
        }));
      } finally {
        setLoadingStages(prev => ({ ...prev, [stageName]: false }));
      }
    };

    // Handle Show Less Pain Points
    const handleShowLessPainPoints = (stageName) => {
      // Revert to original 7 pain points
      if (originalData && originalData.stages[stageName]) {
        setPathwayData(prevData => ({
          ...prevData,
          stages: {
            ...prevData.stages,
            [stageName]: {
              ...originalData.stages[stageName],
              total_pain_points: prevData.stages[stageName].total_pain_points
            }
          }
        }));

        // Mark stage as collapsed
        setExpandedStages(prev => ({ ...prev, [stageName]: false }));
        setStageErrors(prev => ({ ...prev, [stageName]: null }));
      }
    };

    // Scroll to specific stage when clicked
    const handleStageClick = (stageName) => {
      setVisitedStages(prev => new Set([...prev, stageName]));
      
      if (stageRefs.current[stageName]) {
        stageRefs.current[stageName].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
      
      setSearchParams({ stage: stageName });
    };

    if (loading) return <LoadingSpinner />;
    
    if (error) {
      return (
        <div style={{ 
          paddingTop: LAYOUT.navbar.height,
          textAlign: 'center', 
          color: COLORS.accentOrange,
          fontSize: '1.2rem',
          background: COLORS.black,
          minHeight: '100vh'
        }}>
          Error: {error}
        </div>
      );
    }

    if (!pathwayData) {
      return (
        <div style={{ 
          paddingTop: LAYOUT.navbar.height,
          textAlign: 'center', 
          color: COLORS.white,
          fontSize: '1.2rem',
          background: COLORS.black,
          minHeight: '100vh'
        }}>
          No pathway data found for {diseaseName}
        </div>
      );
    }

    return (
      <div style={{ 
        paddingTop: LAYOUT.navbar.height,
        minHeight: '100vh',
        background: COLORS.black
      }}>

        {/* Floating Action Buttons (fixed, bottom-right) */}
        <FloatingWidget
          diseaseName={pathwayData.disease_name}
          stageColors={getStageColors(0, 1)}
        />

        {/* Disease Header */}
        <div style={{
          width: '100%',
          background: COLORS.black,
          borderBottom: `1px solid ${COLORS.gray}40`,
          marginBottom: '2rem',
          padding: '2rem 0'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 2rem',
            textAlign: 'center'
          }}>
            <Link 
              to="/diseases" 
              style={{ 
                color: COLORS.primaryTeal, 
                textDecoration: 'none',
                fontSize: '1rem',
                marginBottom: '1.5rem',
                display: 'inline-block',
                fontWeight: '500'
              }}
            >
              ← Back to Diseases
            </Link>
            
            <h1 style={{ 
              fontFamily: 'SHBree',
              color: COLORS.accentOrange,
              textTransform: 'capitalize',
              fontSize: '3rem',
              fontWeight: '700',
              margin: '1rem 0',
              lineHeight: '1.2'
            }}>
              {pathwayData.disease_name}
            </h1>
            
          </div>
        </div>

        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <SimilarDiseases diseaseName={pathwayData.disease_name} />
          
          <MinimalNavbar
            stages={pathwayData.stages}
            activeStage={activeStage}
            onStageClick={handleStageClick}
            diseaseName={pathwayData.disease_name}
            currentStageIndex={0}
          />

          {/* Invisble spacer div*/}
          <div style={{height: '30px'}}/>
          
          {/* Pinterest Layout with Load More functionality */}
          <PinterestLayout 
            stages={pathwayData.stages} 
            activeStage={null}
            onStageClick={handleStageClick}
            stageRefs={stageRefs}
            visitedStages={visitedStages}
            isDarkTheme={true}
            diseaseName={pathwayData.disease_name}
            onLoadMorePainPoints={handleLoadMorePainPoints}
            onShowLessPainPoints={handleShowLessPainPoints}
            expandedStages={expandedStages}
            loadingStages={loadingStages}
            stageErrors={stageErrors}
          />
        </div>
      </div>
    );
  };

  export default DiseasePathway;
