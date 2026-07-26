import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx'; // Add this
import Home from './pages/Home.jsx';
import DiseaseSelection from './pages/DiseaseSelection.jsx';
import DiseasePathway from './pages/DiseasePathway.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';

// Import New Pathways
import CardioPathways from './pages/CardioPathways.jsx';
import NeuroPathways from './pages/NeuroPathways.jsx';
import CancerPathways from './pages/CancerPathways.jsx';
import StrokePathways from './pages/StrokePathways.jsx';

import { isAuthenticated, isAdmin } from './utils/api.js';
import './styles/globals.css';
import './styles/components.css';

import ErrorBoundary from './components/ErrorBoundary.jsx';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const authenticated = isAuthenticated();
  const userIsAdmin = isAdmin();
  if (!authenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !userIsAdmin) return <Navigate to="/diseases" replace />;
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  if (authenticated) return <Navigate to="/diseases" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop /> {/* Ensures scroll resets on navigation */}
      <div className="App" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        background: '#000' 
      }}>
        <ErrorBoundary>
        
        {/* --- Conditional Navbar Logic --- */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/" element={<Navbar isHome={true} />} />
          <Route path="*" element={<Navbar isHome={false} />} />
        </Routes>
        
        {/* Main content area */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/diseases" element={<DiseaseSelection />} />

            {/* Clinical Hub Routes */}
            <Route path="/diseases/cardio" element={<CardioPathways />} />
            <Route path="/diseases/neuro" element={<NeuroPathways />} />
            <Route path="/diseases/cancer" element={<CancerPathways />} />
            <Route path="/diseases/stroke" element={<StrokePathways />} />
            
            <Route 
              path="/pathway/:diseaseName" 
              element={<DiseasePathway />} 
            />

            {/* Authentication Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />

            {/* Protected Admin Route */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <Admin />
                </ProtectedRoute>
              } 
            />

            {/* Catch all - redirect to diseases */}
            <Route path="*" element={<Navigate to="/diseases" replace />} />
          </Routes>
        </main>
        
        {/* Conditional Footer - Hide on login page */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;