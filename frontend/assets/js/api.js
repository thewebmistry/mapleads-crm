/**
 * MapLeads CRM - API Service Layer
 * Global window.api object for lead operations
 * Enhanced with error handling, fallback data, and local development support
 */

(function() {
    'use strict';

    // Detect local development environment
    const isLocalDevelopment = window.location.hostname === '127.0.0.1' && window.location.port === '5500';
    const isLocalhost = window.location.hostname === 'localhost';
    
    // Base URL configuration
    let BASE_URL = `${window.location.origin}/api/v1`;
    
    // Override for local development on 127.0.0.1:5500 (Live Server default)
    if (isLocalDevelopment) {
        // If backend is running on different port (e.g., 5000), adjust accordingly
        // You can also check for environment variable or localStorage setting
        const backendPort = localStorage.getItem('backend_port') || '5000';
        BASE_URL = `http://127.0.0.1:${backendPort}/api/v1`;
        console.warn('Local development detected on 127.0.0.1:5500, using backend port', backendPort);
    } else if (isLocalhost && window.location.port !== '5000') {
        // Localhost with different frontend port
        const backendPort = localStorage.getItem('backend_port') || '5000';
        BASE_URL = `http://localhost:${backendPort}/api/v1`;
    }

    // Sample fallback leads data for development/demo
    const FALLBACK_LEADS = [
        {
            id: 'fallback-1',
            businessName: 'Sample Business 1',
            ownerName: 'John Doe',
            district: 'Central',
            whatsapp: '+1234567890',
            email: 'john@example.com',
            stage: 'new',
            budget: 50000,
            followUpDate: new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'fallback-2',
            businessName: 'Sample Business 2',
            ownerName: 'Jane Smith',
            district: 'North',
            whatsapp: '+1234567891',
            email: 'jane@example.com',
            stage: 'contacted',
            budget: 75000,
            followUpDate: new Date(Date.now() + 172800000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'fallback-3',
            businessName: 'Sample Business 3',
            ownerName: 'Bob Johnson',
            district: 'South',
            whatsapp: '+1234567892',
            email: 'bob@example.com',
            stage: 'replied',
            budget: 120000,
            followUpDate: new Date(Date.now() + 259200000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'fallback-4',
            businessName: 'Sample Business 4',
            ownerName: 'Alice Brown',
            district: 'East',
            whatsapp: '+1234567893',
            email: 'alice@example.com',
            stage: 'demo_sent',
            budget: 90000,
            followUpDate: new Date(Date.now() + 345600000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'fallback-5',
            businessName: 'Sample Business 5',
            ownerName: 'Charlie Wilson',
            district: 'West',
            whatsapp: '+1234567894',
            email: 'charlie@example.com',
            stage: 'closed',
            budget: 150000,
            followUpDate: new Date(Date.now() + 432000000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    // Helper function for fetch requests with graceful error handling
    const apiRequest = async (endpoint, options = {}, fallbackData = null) => {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };

        // Add JWT token if exists
        const token = localStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(url, { ...options, headers });
            
            // Handle 404 and other non-2xx responses gracefully
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`API endpoint ${endpoint} not found (404). Using fallback data if available.`);
                    // Return fallback data for GET requests if provided
                    if (fallbackData !== null && (!options.method || options.method === 'GET')) {
                        return fallbackData;
                    }
                }
                
                // For other errors, log warning but don't crash
                console.warn(`API request failed: ${response.status} ${response.statusText}`, {
                    endpoint,
                    status: response.status,
                    statusText: response.statusText
                });
                
                // Still throw for non-GET or if no fallback, but with a controlled error
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.isApiError = true;
                throw error;
            }
            
            return await response.json();
        } catch (error) {
            // Network errors, CORS issues, etc.
            console.warn('API request failed:', error.message);
            
            // Return fallback data for GET requests if available
            if (fallbackData !== null && (!options.method || options.method === 'GET')) {
                console.info('Returning fallback data for', endpoint);
                return fallbackData;
            }
            
            // Re-throw for POST/PUT/DELETE where fallback isn't appropriate
            throw error;
        }
    };

    // Safe API request that always returns an array for leads endpoints
    const safeGetLeads = async () => {
        try {
            const result = await apiRequest('/leads', {}, []);
            
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
            console.warn('Failed to fetch leads, returning fallback data:', error.message);
            return FALLBACK_LEADS;
        }
    };

    // Define global api object
    window.api = {
        // GET /api/v1/leads with fallback
        getLeads: safeGetLeads,

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

        // Analytics-specific method with enhanced error handling
        getAnalyticsData: async () => {
            try {
                const leads = await safeGetLeads();
                return {
                    success: true,
                    data: leads,
                    timestamp: new Date().toISOString(),
                    source: leads === FALLBACK_LEADS ? 'fallback' : 'api'
                };
            } catch (error) {
                console.warn('Analytics data fetch failed, using fallback:', error.message);
                return {
                    success: false,
                    data: FALLBACK_LEADS,
                    timestamp: new Date().toISOString(),
                    source: 'fallback',
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
            isLocalDevelopment,
            fallbackEnabled: true
        }
    };

    // Log initialization with environment info
    console.log('API service initialized for', window.location.host, '->', BASE_URL);
    if (isLocalDevelopment || isLocalhost) {
        console.info('Local development detected. Using fallback data when API is unavailable.');
    }
})();