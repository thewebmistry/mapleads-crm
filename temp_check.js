// Dark mode toggle with OS preference detection
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeIcon = document.getElementById('dark-mode-icon');

// Determine initial dark mode
const storedDark = localStorage.getItem('dark-mode');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const isDark = storedDark !== null ? storedDark === 'true' : prefersDark;

if (isDark) {
    document.documentElement.classList.add('dark');
    darkModeIcon.classList.remove('fa-moon');
    darkModeIcon.classList.add('fa-sun');
}

darkModeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDarkNow = document.documentElement.classList.contains('dark');
    localStorage.setItem('dark-mode', isDarkNow);
    
    if (isDarkNow) {
        darkModeIcon.classList.remove('fa-moon');
        darkModeIcon.classList.add('fa-sun');
    } else {
        darkModeIcon.classList.remove('fa-sun');
        darkModeIcon.classList.add('fa-moon');
    }
});

// Sidebar toggle
const sidebarToggleMobile = document.getElementById('sidebar-toggle-mobile');
const sidebarToggleDesktop = document.getElementById('sidebar-toggle-desktop');
const sidebar = document.getElementById('sidebar');
const mobileMenuIcon = sidebarToggleMobile.querySelector('i');

// Desktop sidebar state
const sidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
if (sidebarCollapsed) {
    sidebar.classList.add('w-16', 'overflow-hidden');
    sidebar.classList.remove('w-64');
    const icon = sidebarToggleDesktop.querySelector('i');
    icon.classList.remove('fa-chevron-left');
    icon.classList.add('fa-chevron-right');
    const span = sidebarToggleDesktop.querySelector('span');
    if (span) span.textContent = 'Expand Sidebar';
}

// Desktop toggle
sidebarToggleDesktop.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.contains('w-16');
    if (isCollapsed) {
        sidebar.classList.remove('w-16', 'overflow-hidden');
        sidebar.classList.add('w-64');
        const icon = sidebarToggleDesktop.querySelector('i');
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
        const span = sidebarToggleDesktop.querySelector('span');
        if (span) span.textContent = 'Collapse Sidebar';
        localStorage.setItem('sidebar-collapsed', 'false');
    } else {
        sidebar.classList.add('w-16', 'overflow-hidden');
        sidebar.classList.remove('w-64');
        const icon = sidebarToggleDesktop.querySelector('i');
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
        const span = sidebarToggleDesktop.querySelector('span');
        if (span) span.textContent = 'Expand Sidebar';
        localStorage.setItem('sidebar-collapsed', 'true');
    }
});

// Mobile toggle
sidebarToggleMobile.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    const isHidden = sidebar.classList.contains('hidden');
    if (isHidden) {
        mobileMenuIcon.classList.remove('fa-times');
        mobileMenuIcon.classList.add('fa-bars');
    } else {
        mobileMenuIcon.classList.remove('fa-bars');
        mobileMenuIcon.classList.add('fa-times');
    }
});

// Close sidebar on Escape key (mobile)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sidebar.classList.contains('hidden') && window.innerWidth < 1024) {
        sidebar.classList.add('hidden');
        mobileMenuIcon.classList.remove('fa-times');
        mobileMenuIcon.classList.add('fa-bars');
    }
});

// Auto-show sidebar on large screens
function handleResize() {
    if (window.innerWidth >= 1024) {
        sidebar.classList.remove('hidden');
        mobileMenuIcon.classList.remove('fa-times');
        mobileMenuIcon.classList.add('fa-bars');
    }
}
window.addEventListener('resize', handleResize);

// Search functionality (keep as is, but we won't check for errors)
const searchBtn = document.getElementById('search-btn');
const resetBtn = document.getElementById('reset-btn');

searchBtn.addEventListener('click', () => {
    // Simulate search
    document.getElementById('result-count').textContent = '24';
    document.getElementById('showing-start').textContent = '1';
    document.getElementById('showing-end').textContent = '24';
    document.getElementById('total-results').textContent = '24';
    
    // Show loading then results
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = `
        <tr>
            <td class="py-4 px-6" data-label="Business Name">Tech Solutions Inc.</td>
            <td class="py-4 px-6" data-label="Category"><span class="gradient-badge px-3 py-1 rounded-full text-xs">Technology</span></td>
            <td class="py-4 px-6" data-label="City/District">Ranchi</td>
            <td class="py-4 px-6" data-label="Contact">+91 9876543210</td>
            <td class="py-4 px-6" data-label="Status"><span class="gradient-badge-green px-3 py-1 rounded-full text-xs">Active</span></td>
            <td class="py-4 px-6" data-label="Actions">
                <button class="action-btn bg-primary-500 text-white hover:bg-primary-600">View</button>
            </td>
        </tr>
        <tr>
            <td class="py-4 px-6" data-label="Business Name">Green Valley Restaurant</td>
            <td class="py-4 px-6" data-label="Category"><span class="gradient-badge-orange px-3 py-1 rounded-full text-xs">Restaurant</span></td>
            <td class="py-4 px-6" data-label="City/District">Gumla</td>
            <td class="py-4 px-6" data-label="Contact">+91 8765432109</td>
            <td class="py-4 px-6" data-label="Status"><span class="gradient-badge-green px-3 py-1 rounded-full text-xs">Active</span></td>
            <td class="py-4 px-6" data-label="Actions">
                <button class="action-btn bg-primary-500 text-white hover:bg-primary-600">View</button>
            </td>
        </tr>
    `;
});

resetBtn.addEventListener('click', () => {
    document.getElementById('city-input').value = '';
    document.getElementById('category-input').value = '';
    document.getElementById('keyword-input').value = '';
    document.getElementById('limit-input').value = '25';
    
    // Reset results
    document.getElementById('result-count').textContent = '0';
    document.getElementById('showing-start').textContent = '0';
    document.getElementById('showing-end').textContent = '0';
    document.getElementById('total-results').textContent = '0';
    
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = `
        <tr class="text-center py-8">
            <td colspan="6" class="py-12 text-gray-500 dark:text-gray-400">
                <i class="fas fa-search text-4xl mb-4 opacity-50"></i>
                <p class="text-lg">Use the filters above to find businesses</p>
                <p class="text-sm mt-2">Select a city, category, or enter a keyword to get started</p>
            </td>
        </tr>
    `;
});