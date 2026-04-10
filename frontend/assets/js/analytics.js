/**
 * MapLeads CRM - Analytics Dashboard
 * Frontend-only analytics with local fallback mock data
 * Vanilla JS implementation with Chart.js integration
 */

(function() {
    'use strict';

    // DOM Elements (will be populated after DOM ready)
    let elements = {};

    /**
     * Initialize DOM element references
     */
    function initElements() {
        elements = {
            total: document.getElementById('stat-total'),
            revenue: document.getElementById('stat-revenue'),
            conversion: document.getElementById('stat-conversion'),
            active: document.getElementById('stat-active'),
            loader: document.getElementById('loader'),
            refreshBtn: document.getElementById('refresh-btn'),
            // Chart canvas elements
            districtBarChart: document.getElementById('district-bars'),
            pipelineDonutChart: document.getElementById('pipeline-donut'),
            revenueLineChart: document.getElementById('revenue-line'),
            sourcePieChart: document.getElementById('sources-donut'),
            closeRatioChart: document.getElementById('close-ratio-line'),
            // Skeleton elements for fallback
            districtSkeleton: document.getElementById('district-chart-skeleton'),
            pipelineSkeleton: document.getElementById('pipeline-chart-skeleton'),
            revenueSkeleton: document.getElementById('revenue-chart-skeleton'),
            sourceSkeleton: document.getElementById('lead-source-chart-skeleton'),
            closeRatioSkeleton: document.getElementById('sparkline-chart-skeleton'),
            // Recent activity container
            recentActivity: document.getElementById('recent-activity'),
            // Top Business Type card elements
            nicheName: document.getElementById('niche-name'),
            nichePercentage: document.getElementById('niche-percentage'),
            nicheProgress: document.getElementById('niche-progress'),
            nicheCount: document.getElementById('niche-count')
        };
    }

    // Chart instances
    let chartInstances = {
        districtChart: null,
        pipelineChart: null,
        revenueChart: null,
        sourceChart: null,
        closeRatioChart: null
    };

    // Production API configuration
    const API_BASE = "https://mapleads-crm.onrender.com/api/v1";
    const STATS_ENDPOINT = `${API_BASE}/leads/stats/summary`;
    let currentData = {};

    /**
     * Fetch real stats from production API
     */
    async function fetchRealStats() {
        showLoading(true);
        try {
            const response = await fetch(STATS_ENDPOINT, {
                headers: {
                    'Accept': 'application/json',
                    // Add authentication token if needed
                    'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const result = await response.json();
            if (result.success && result.data) {
                console.log('Real stats loaded from production API', result.data);
                currentData = result.data;
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Failed to fetch real stats:', error.message);
            // Show error to user
            if (typeof window.showToast === 'function') {
                window.showToast('Failed to load analytics data', 'error');
            }
            // Set empty data
            currentData = {};
        } finally {
            showLoading(false);
        }
    }

    /**
     * Update metrics with real data from API
     */
    function updateMetrics() {
        let totalLeads = 0, totalRevenue = 0, closedLeads = 0, conversionRate = 0, activeLeads = 0;

        if (currentData.total !== undefined) {
            totalLeads = currentData.total || 0;
            // Calculate revenue from byStage totalBudget if available
            if (currentData.byStage) {
                totalRevenue = currentData.byStage.reduce((sum, stage) => sum + (stage.totalBudget || 0), 0);
                closedLeads = currentData.byStage.find(s => s.stage === 'Closed')?.count || 0;
                activeLeads = currentData.byStage.find(s => s.stage === 'Active')?.count || 0;
            }
            conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;
        } else {
            // No data available
            console.warn('No analytics data available');
        }

        // Update stat cards
        if (elements.total) {
            elements.total.textContent = totalLeads.toLocaleString();
        }
        
        if (elements.revenue) {
            elements.revenue.textContent = `₹${totalRevenue.toLocaleString()}`;
        }
        
        if (elements.conversion) {
            elements.conversion.textContent = `${conversionRate.toFixed(1)}%`;
        }
        
        if (elements.active) {
            elements.active.textContent = activeLeads.toLocaleString();
        }
    }

    /**
     * Setup event listeners for auto-refresh
     */
    function setupAutoRefresh() {
        // Listen to storage events (cross-tab communication)
        window.addEventListener('storage', function(event) {
            if (event.key === 'mapleads-analytics-refresh') {
                console.log('Storage event triggered, refreshing analytics');
                refreshAnalytics();
            }
        });

        // Also listen to custom events within same page
        window.addEventListener('mapleads-refresh-analytics', refreshAnalytics);

        // Optional: periodic refresh every 5 minutes (300000 ms)
        // setInterval(refreshAnalytics, 300000);
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize DOM element references
        initElements();

        // Check if required elements exist
        if (!elements.total || !elements.revenue || !elements.conversion || !elements.active) {
            console.warn('Some analytics DOM elements not found. IDs may differ from expected.');
        }

        // Set up refresh button if exists
        if (elements.refreshBtn) {
            elements.refreshBtn.addEventListener('click', refreshAnalytics);
        }

        // Set up auto-refresh via localStorage events
        setupAutoRefresh();

        // Initial render - try API first, fallback to local data
        renderAnalytics();
    });

    /**
     * Main function to render analytics with fallback data
     */
    async function renderAnalytics() {
        showLoading(true);
        
        // Try to fetch real stats from API first
        await fetchRealStats();
        
        // Update metrics with real data (if available) or fallback
        updateMetrics();
        updateTopBusinessType();
        renderAllCharts();
        renderRecentActivity();
        showLoading(false);
    }

    /**
     * Refresh analytics (same as initial render)
     */
    function refreshAnalytics() {
        destroyAllCharts();
        renderAnalytics();
    }

    /**
     * Update Top Business Type card with dominant lead source
     */
    function updateTopBusinessType() {
        // Use API data if available, otherwise show empty
        let dominantSource = 'Google Maps';
        let maxCount = 0;
        let totalFromSources = 0;
        let percentage = 0;
        
        if (currentData.bySource && Object.keys(currentData.bySource).length > 0) {
            const sources = currentData.bySource;
            // Find dominant source
            Object.entries(sources).forEach(([source, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    dominantSource = source;
                }
            });
            
            // Calculate total leads from all sources
            totalFromSources = Object.values(sources).reduce((a, b) => a + b, 0);
            percentage = totalFromSources > 0 ? Math.round((maxCount / totalFromSources) * 100) : 0;
        } else {
            // No data available
            dominantSource = 'No data';
            maxCount = 0;
            totalFromSources = 0;
            percentage = 0;
        }
        
        // Update DOM elements
        if (elements.nicheName) {
            elements.nicheName.textContent = dominantSource;
        }
        if (elements.nichePercentage) {
            elements.nichePercentage.textContent = `${percentage}%`;
        }
        if (elements.nicheProgress) {
            elements.nicheProgress.style.width = `${percentage}%`;
        }
        if (elements.nicheCount) {
            elements.nicheCount.textContent = maxCount;
        }
    }

    /**
     * Hide all chart skeleton placeholders
     */
    function hideChartSkeletons() {
        const skeletonIds = [
            'district-chart-skeleton',
            'pipeline-chart-skeleton',
            'revenue-chart-skeleton',
            'lead-source-chart-skeleton',
            'sparkline-chart-skeleton'
        ];
        skeletonIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    }

    /**
     * Render all Chart.js charts with fallback data
     */
    function renderAllCharts() {
        // Destroy previous chart instances to prevent duplicates
        destroyAllCharts();
        
        // Hide skeleton placeholders before rendering charts
        hideChartSkeletons();
        
        // Render district chart
        if (elements.districtBarChart) {
            renderDistrictChart();
        }
        
        // Render pipeline chart
        if (elements.pipelineDonutChart) {
            renderPipelineChart();
        }
        
        // Render revenue chart
        if (elements.revenueLineChart) {
            renderRevenueChart();
        }
        
        // Render source chart
        if (elements.sourcePieChart) {
            renderSourceChart();
        }
        
        // Render close ratio chart
        if (elements.closeRatioChart) {
            renderCloseRatioChart();
        }
        
        // If Chart.js is not available, fallback to HTML bars
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available, using HTML bar fallback');
            renderHtmlFallback();
        }
    }

    /**
     * Destroy all chart instances to prevent duplicates
     */
    function destroyAllCharts() {
        Object.keys(chartInstances).forEach(chartKey => {
            if (chartInstances[chartKey]) {
                try {
                    chartInstances[chartKey].destroy();
                } catch (e) {
                    console.warn(`Error destroying chart ${chartKey}:`, e);
                }
                chartInstances[chartKey] = null;
            }
        });
    }

    /**
     * Render district bar chart
     */
    function renderDistrictChart() {
        const districts = FALLBACK_DATA.districts;
        const labels = Object.keys(districts);
        const data = Object.values(districts);
        
        const isDark = document.documentElement.classList.contains('dark');
        const ctx = elements.districtBarChart.getContext('2d');
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
        gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.8)');
        gradient.addColorStop(1, 'rgba(147, 51, 234, 0.7)');

        chartInstances.districtChart = new Chart(elements.districtBarChart, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Leads',
                    data: data,
                    backgroundColor: gradient,
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                        titleColor: isDark ? '#f3f4f6' : '#111827',
                        bodyColor: isDark ? '#e5e7eb' : '#374151'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)',
                            drawBorder: false
                        },
                        ticks: {
                            color: isDark ? '#d1d5db' : '#6b7280'
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: isDark ? '#d1d5db' : '#6b7280',
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }

    /**
     * Render pipeline donut chart
     */
    function renderPipelineChart() {
        const pipeline = FALLBACK_DATA.pipeline;
        const labels = Object.keys(pipeline);
        const data = Object.values(pipeline);
        
        const colors = [
            'rgba(156, 163, 175, 0.8)',    // New - gray
            'rgba(245, 158, 11, 0.8)',     // Contacted - amber
            'rgba(34, 197, 94, 0.8)',      // Replied - green
            'rgba(168, 85, 247, 0.8)',     // Demo Sent - purple
            'rgba(59, 130, 246, 0.8)'      // Closed - blue
        ];

        chartInstances.pipelineChart = new Chart(elements.pipelineDonutChart, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
    }

    /**
     * Render revenue line chart
     */
    function renderRevenueChart() {
        const revenueData = FALLBACK_DATA.revenue;
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        
        const isDark = document.documentElement.classList.contains('dark');
        
        chartInstances.revenueChart = new Chart(elements.revenueLineChart, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue (₹)',
                    data: revenueData,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'
                        },
                        ticks: {
                            color: isDark ? '#d1d5db' : '#6b7280',
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.4)'
                        },
                        ticks: {
                            color: isDark ? '#d1d5db' : '#6b7280'
                        }
                    }
                }
            }
        });
    }

    /**
     * Render source pie chart
     */
    function renderSourceChart() {
        const sources = FALLBACK_DATA.sources;
        const labels = Object.keys(sources);
        const data = Object.values(sources);
        
        const colors = [
            'rgba(59, 130, 246, 0.8)',    // Google Maps - blue
            'rgba(34, 197, 94, 0.8)',     // WhatsApp - green
            'rgba(245, 158, 11, 0.8)',    // Instagram - amber
            'rgba(168, 85, 247, 0.8)',    // Website - purple
            'rgba(239, 68, 68, 0.8)'      // Referral - red
        ];

        chartInstances.sourceChart = new Chart(elements.sourcePieChart, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
    }

    /**
     * Render close ratio line chart (sparkline)
     */
    function renderCloseRatioChart() {
        const closeRatioData = FALLBACK_DATA.closeRatio;
        const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
        
        const isDark = document.documentElement.classList.contains('dark');
        
        chartInstances.closeRatioChart = new Chart(elements.closeRatioChart, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Close Ratio (%)',
                    data: closeRatioData,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.4)'
                        },
                        ticks: {
                            color: isDark ? '#d1d5db' : '#6b7280',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: isDark ? '#d1d5db' : '#6b7280'
                        }
                    }
                }
            }
        });
    }

    /**
     * HTML/CSS fallback for when Chart.js is unavailable
     */
    function renderHtmlFallback() {
        console.warn('Chart.js not available, rendering HTML/CSS fallback charts');
        
        // District bars fallback - replace skeleton with HTML bars
        if (elements.districtSkeleton && elements.districtBarChart) {
            const districts = FALLBACK_DATA.districts;
            const maxValue = Math.max(...Object.values(districts));
            
            // Hide canvas, show skeleton with custom content
            elements.districtBarChart.style.display = 'none';
            elements.districtSkeleton.classList.remove('skeleton');
            elements.districtSkeleton.innerHTML = '';
            
            let html = '<div class="space-y-3">';
            Object.entries(districts).forEach(([district, count]) => {
                const percentage = (count / maxValue) * 100;
                html += `
                <div class="mb-3">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="font-medium text-gray-700 dark:text-gray-300">${district}</span>
                        <span class="font-semibold text-blue-600 dark:text-blue-400">${count}</span>
                    </div>
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                    </div>
                </div>`;
            });
            html += '</div>';
            elements.districtSkeleton.innerHTML = html;
            elements.districtSkeleton.style.display = 'block';
        }
        
        // Pipeline bars fallback
        if (elements.pipelineSkeleton && elements.pipelineDonutChart) {
            const pipeline = FALLBACK_DATA.pipeline;
            const total = Object.values(pipeline).reduce((a, b) => a + b, 0);
            
            // Hide canvas, show skeleton with custom content
            elements.pipelineDonutChart.style.display = 'none';
            elements.pipelineSkeleton.classList.remove('skeleton');
            elements.pipelineSkeleton.innerHTML = '';
            
            let html = '<div class="space-y-3">';
            Object.entries(pipeline).forEach(([stage, count]) => {
                const percentage = total > 0 ? (count / total) * 100 : 0;
                let colorClass = 'bg-gray-500';
                if (stage === 'New') colorClass = 'bg-gray-500';
                else if (stage === 'Contacted') colorClass = 'bg-amber-500';
                else if (stage === 'Replied') colorClass = 'bg-green-500';
                else if (stage === 'Demo Sent') colorClass = 'bg-purple-500';
                else if (stage === 'Closed') colorClass = 'bg-blue-500';
                
                html += `
                <div class="mb-3">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="font-medium text-gray-700 dark:text-gray-300">${stage}</span>
                        <span class="font-semibold ${stage === 'Closed' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}">${count} (${percentage.toFixed(1)}%)</span>
                    </div>
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full ${colorClass} rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                    </div>
                </div>`;
            });
            html += '</div>';
            elements.pipelineSkeleton.innerHTML = html;
            elements.pipelineSkeleton.style.display = 'block';
        }
        
        // Simple fallback for other charts
        const fallbackMessages = [
            { element: elements.revenueSkeleton, message: 'Revenue Chart: Data available but Chart.js not loaded' },
            { element: elements.sourceSkeleton, message: 'Lead Sources: Data available but Chart.js not loaded' },
            { element: elements.closeRatioSkeleton, message: 'Close Ratio: Data available but Chart.js not loaded' }
        ];
        
        fallbackMessages.forEach(({ element, message }) => {
            if (element) {
                element.classList.remove('skeleton');
                element.innerHTML = `<div class="p-4 text-center text-gray-500 dark:text-gray-400"><i class="fas fa-chart-line mr-2"></i>${message}</div>`;
                element.style.display = 'block';
            }
        });
    }

    /**
     * Render recent activity timeline with mock data
     */
    function renderRecentActivity() {
        if (!elements.recentActivity) return;
        
        const activities = [
            {
                icon: 'fas fa-user-plus',
                color: 'bg-blue-500',
                title: 'New lead added',
                description: 'John Doe from Google Maps',
                time: '10 minutes ago',
                status: 'new'
            },
            {
                icon: 'fas fa-handshake',
                color: 'bg-green-500',
                title: 'Deal closed',
                description: 'Acme Corp - ₹2.5L deal',
                time: '2 hours ago',
                status: 'closed'
            },
            {
                icon: 'fas fa-calendar-check',
                color: 'bg-purple-500',
                title: 'Meeting scheduled',
                description: 'Demo call with Sarah tomorrow',
                time: '5 hours ago',
                status: 'scheduled'
            },
            {
                icon: 'fas fa-bell',
                color: 'bg-amber-500',
                title: 'Follow-up reminder',
                description: 'Follow up with leads from last week',
                time: 'Yesterday, 3:45 PM',
                status: 'reminder'
            },
            {
                icon: 'fas fa-chart-line',
                color: 'bg-indigo-500',
                title: 'Pipeline updated',
                description: '5 leads moved to Contacted stage',
                time: '2 days ago',
                status: 'updated'
            }
        ];

        let html = `
            <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300/50 to-purple-300/50 dark:from-indigo-500/30 dark:to-purple-500/30"></div>
            <div class="space-y-6">
        `;

        activities.forEach((activity, index) => {
            html += `
                <div class="flex items-start relative">
                    <div class="flex-shrink-0 w-12 h-12 rounded-full ${activity.color} flex items-center justify-center text-white shadow-lg z-10">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="ml-4 flex-1">
                        <div class="flex justify-between items-start">
                            <h4 class="font-semibold text-gray-800 dark:text-gray-200">${activity.title}</h4>
                            <span class="text-xs text-gray-500 dark:text-gray-400">${activity.time}</span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${activity.description}</p>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        elements.recentActivity.innerHTML = html;
    }

    /**
     * Show/hide loading indicator
     */
    function showLoading(show) {
        if (elements.loader) {
            elements.loader.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Show error message (unused but kept for compatibility)
     */
    function showError(message) {
        console.warn('Analytics error:', message);
        // Could show a toast notification here
    }

    /**
     * Reset metrics to zero (unused but kept for compatibility)
     */
    function resetMetrics() {
        if (elements.total) elements.total.textContent = '0';
        if (elements.revenue) elements.revenue.textContent = '₹0';
        if (elements.conversion) elements.conversion.textContent = '0%';
        if (elements.active) elements.active.textContent = '0';
    }

    // Make refresh function globally accessible for button
    window.refreshAnalytics = refreshAnalytics;
})();
