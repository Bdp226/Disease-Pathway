import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants.js';

/**
 * Custom hook to fetch and manage diseases data.
 * FAANG Pattern: Extracts data fetching and state management out of UI components.
 */
export const useDiseases = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/diseases`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDiseases(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch diseases:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiseases();
  }, []);

  return { diseases, loading, error };
};
