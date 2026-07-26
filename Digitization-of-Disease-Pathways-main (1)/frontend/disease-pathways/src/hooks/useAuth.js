import { useState, useEffect } from 'react';
import { isAuthenticated, getCurrentUser, isAdmin } from '../utils/api.js';

export const useAuth = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  useEffect(() => {
    // Listen for auth changes
    const checkAuth = () => {
      setUser(getCurrentUser());
      setAuthenticated(isAuthenticated());
    };

    // Check auth on mount and when localStorage changes
    checkAuth();
    
    const handleStorageChange = (e) => {
      if (e.key === 'disease_pathway_token' || e.key === 'disease_pathway_user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    user,
    authenticated,
    isAdmin: isAdmin(),
    refresh: () => {
      setUser(getCurrentUser());
      setAuthenticated(isAuthenticated());
    }
  };
};
