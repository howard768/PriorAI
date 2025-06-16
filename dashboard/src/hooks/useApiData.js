import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config/environment';
import { mockDataService } from '../services/mockDataService';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com' 
  : 'http://localhost:3002';

export const useApiData = () => {
  const [data, setData] = useState({
    policies: [],
    metadata: {},
    analytics: {},
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchPolicies = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/policies?limit=100`);
      return response.data;
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/analytics/data-moat`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const [policiesData, analyticsData] = await Promise.all([
        fetchPolicies(),
        fetchAnalytics()
      ]);

      setData({
        policies: policiesData.policies || [],
        metadata: policiesData.metadata || {},
        analytics: analyticsData || {},
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch data'
      }));
    }
  }, [fetchPolicies, fetchAnalytics]);

  const triggerScraping = useCallback(async (sources = ['medicare', 'commercial']) => {
    try {
      const response = await axios.post(`${API_BASE}/api/scrape/policies`, {
        sources,
        priority: 'high'
      });
      return response.data;
    } catch (error) {
      console.error('Error triggering scraping:', error);
      throw error;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return {
    ...data,
    refetch: fetchAllData,
    triggerScraping
  };
};

export const useRealtimeUpdates = (onUpdate) => {
  useEffect(() => {
    // For now, use polling. WebSocket can be added later
    const interval = setInterval(() => {
      if (onUpdate) {
        onUpdate();
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [onUpdate]);
}; 