/**
 * MapLeads CRM - API Service Layer
 * Global window.api object for lead operations
 * Enhanced with error handling, fallback data, and local development support
 */

(function() {
    'use strict';

    // Production backend API base URL
    const API_BASE = "https://mapleads-crm.onrender.com/api/v1";
    let BASE_URL = API_BASE;

    // No fallback data in production - rely on API only
    const FALLBACK_LEADS = [];

    // Helper function for fetch requests with production error handling
    const apiRequest = async (endpoint, options = {}) => {
        const url = `${BASE_URL}${endpoint}`;
        console.log(`API Request: ${url}`, { endpoint, options });
        
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };

        // Add JWT token if exists
        const token = localStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Default fetch options with credentials for CORS
        const fetchOptions = {
            ...options,
            headers,
            credentials: 'include', // Include cookies for CORS
            mode: 'cors' // Ensure CORS mode
        };

        try {
            const response = await fetch(url, fetchOptions);
            console.log(`API Response: ${response.status} ${response.statusText}`, { url });
            
            // Handle non-2xx responses
            if (!response.ok) {
                let errorBody = '';
                try {
                    errorBody = await response.text();
                } catch (e) {
                    // ignore
                }
                console.error(`API request failed: ${response.status} ${response.statusText}`, {
                    endpoint,
                    status: response.status,
                    statusText: response.statusText,
                    url,
                    body: errorBody
                });
                
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.isApiError = true;
                error.body = errorBody;
                throw error;
            }
            
            const data = await response.json();
            console.log(`API Success: ${url}`, { dataCount: Array.isArray(data) ? data.length : 'object' });
            return data;
        } catch (error) {
            // Network errors, CORS issues, etc.
            console.error('API request failed:', error.message, error);
            
            // Show toast notification for user feedback
            if (typeof window.showToast === 'function') {
                window.showToast(`API Error: ${error.message}`, 'error');
            }
            
            throw error;
        }
    };

    // Get leads from production API
    const getLeadsFromApi = async () => {
        try {
            const result = await apiRequest('/leads');
            
            // Handle different response structures
            if (Array.isArray(result)) {
                return result;
            } else if (result && Array.isArray(result.data)) {
                return result.data;
            } else if (result && Array.isArray(result.leads)) {
                return result.leads;
            } else {
                console.warn('Unexpected leads response structure, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error.message);
            throw error; // Re-throw to let caller handle
        }
    };

    // Define global api object
    window.api = {
        // GET /api/v1/leads
        getLeads: getLeadsFromApi,

        // POST /api/v1/leads
        createLead: (data) => apiRequest('/leads', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

        // PUT /api/v1/leads/:id
        updateLead: (id, data) => apiRequest(`/leads/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

        // DELETE /api/v1/leads/:id
        deleteLead: (id) => apiRequest(`/leads/${id}`, {
            method: 'DELETE'
        }),

        // Analytics-specific method
        getAnalyticsData: async () => {
            try {
                const leads = await getLeadsFromApi();
                return {
                    success: true,
                    data: leads,
                    timestamp: new Date().toISOString(),
                    source: 'api'
                };
            } catch (error) {
                console.error('Analytics data fetch failed:', error.message);
                return {
                    success: false,
                    data: [],
                    timestamp: new Date().toISOString(),
                    source: 'error',
                    error: error.message
                };
            }
        },

        // Health check for API connectivity
        checkHealth: async () => {
            try {
                const response = await fetch(`${BASE_URL}/health`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                return response.ok;
            } catch (error) {
                return false;
            }
        },

        // Configuration for debugging
        config: {
            BASE_URL,
            isProduction: true
        }
    };

    // Log initialization
    console.log('API service initialized for production:', BASE_URL);
})();