/**
 * MapLeads CRM - Shared JavaScript Utilities
 * Centralized logic for sidebar, mobile menu, dark mode, modals, and utilities
 */

(function() {
    'use strict';

    // ====================
    // 1. UTILITY FUNCTIONS
    // ====================
    const AppUtils = {
        /**
         * Get element by ID with null check
         */
        getElement: function(id) {
            return document.getElementById(id);
        },

        /**
         * Query selector with optional parent
         */
        query: function(selector, parent = document) {
            return parent.querySelector(selector);
        },

        /**
         * Query all elements
         */
        queryAll: function(selector, parent = document) {
            return parent.querySelectorAll(selector);
        },

        /**
         * Add event listener with error handling
         */
        on: function(element, event, handler) {
            if (element) {
                element.addEventListener(event, handler);
            }
        },

        /**
         * Remove event listener
         */
        off: function(element, event, handler) {
            if (element) {
                element.removeEventListener(event, handler);
            }
        },

        /**
         * Toggle class on element
         */
        toggleClass: function(element, className) {
            if (element) {
                element.classList.toggle(className);
            }
        },

        /**
         * Add class to element
         */
        addClass: function(element, className) {
            if (element) {
                element.classList.add(className);
            }
        },

        /**
         * Remove class from element
         */
        removeClass: function(element, className) {
            if (element) {
                element.classList.remove(className);
            }
        },

        /**
         * Check if element has class
         */
        hasClass: function(element, className) {
            return element && element.classList.contains(className);
        },

        /**
         * Show alert with custom message
         */
        alert: function(message, type = 'info') {
            // In a real app, you might use a toast notification
            console.log(`[${type.toUpperCase()}] ${message}`);
            window.alert(message);
        },

        /**
         * Format date to YYYY-MM-DD
         */
        formatDate: function(date) {
            return date.toISOString().split('T')[0];
        },

        /**
         * Get tomorrow's date formatted
         */
        getTomorrowDate: function() {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return this.formatDate(tomorrow);
        },

        /**
         * Debounce function for performance
         */
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // ====================
    // 2. DARK MODE MANAGER
    // ====================
    const DarkModeManager = {
        STORAGE_KEY: 'darkMode',
        TOGGLE_ID: 'dark-mode-toggle',
        ICON_ID: 'dark-mode-icon',

        init: function() {
            this.applySavedMode();
            this.bindEvents();
            this.updateIcon();
        },

        /**
         * Apply dark mode from localStorage
         */
        applySavedMode: function() {
            const isDarkMode = localStorage.getItem(this.STORAGE_KEY) !== 'false';
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            this.updateIcon();
        },

        /**
         * Toggle dark mode
         */
        toggle: function() {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem(this.STORAGE_KEY, isDark);
            this.updateIcon();
            return isDark;
        },

        /**
         * Check if dark mode is enabled
         */
        isEnabled: function() {
            return document.documentElement.classList.contains('dark');
        },

        /**
         * Update dark mode icon
         */
        updateIcon: function() {
            const icon = AppUtils.getElement(this.ICON_ID);
            if (icon) {
                const isDark = this.isEnabled();
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
        },

        /**
         * Bind events to dark mode toggle button
         */
        bindEvents: function() {
            const toggleBtn = AppUtils.getElement(this.TOGGLE_ID);
            if (toggleBtn) {
                AppUtils.on(toggleBtn, 'click', () => this.toggle());
            }
        }
    };

    // ====================
    // 3. MOBILE SIDEBAR MANAGER
    // ====================
    const MobileSidebarManager = {
        SIDEBAR_ID: 'sidebar',
        MENU_BUTTON_ID: 'sidebar-toggle-mobile',
        BACKDROP_ID: 'sidebar-overlay',
        DESKTOP_TOGGLE_ID: 'sidebar-toggle-desktop',

        init: function() {
            this.bindEvents();
            this.bindMenuLinks();
        },

        /**
         * Open mobile sidebar
         */
        open: function() {
            const sidebar = AppUtils.getElement(this.SIDEBAR_ID);
            const backdrop = AppUtils.getElement(this.BACKDROP_ID);
            if (sidebar) {
                // Remove hidden class and add mobile-specific classes
                AppUtils.removeClass(sidebar, 'hidden');
                AppUtils.addClass(sidebar, 'fixed', 'inset-y-0', 'left-0', 'z-50', 'lg:hidden');
                // Ensure it's visible on mobile
                AppUtils.removeClass(sidebar, 'lg:flex');
            }
            if (backdrop) {
                AppUtils.removeClass(backdrop, 'hidden');
            }
        },

        /**
         * Close mobile sidebar
         */
        close: function() {
            const sidebar = AppUtils.getElement(this.SIDEBAR_ID);
            const backdrop = AppUtils.getElement(this.BACKDROP_ID);
            if (sidebar) {
                // Add hidden class and remove mobile-specific classes
                AppUtils.addClass(sidebar, 'hidden');
                AppUtils.removeClass(sidebar, 'fixed', 'inset-y-0', 'left-0', 'z-50', 'lg:hidden');
                // Restore desktop classes
                AppUtils.addClass(sidebar, 'lg:flex');
            }
            if (backdrop) {
                AppUtils.addClass(backdrop, 'hidden');
            }
        },

        /**
         * Toggle mobile sidebar
         */
        toggle: function() {
            const sidebar = AppUtils.getElement(this.SIDEBAR_ID);
            if (sidebar && AppUtils.hasClass(sidebar, 'hidden')) {
                this.open();
            } else {
                this.close();
            }
        },

        /**
         * Bind events for mobile sidebar
         */
        bindEvents: function() {
            const menuBtn = AppUtils.getElement(this.MENU_BUTTON_ID);
            const desktopToggleBtn = AppUtils.getElement(this.DESKTOP_TOGGLE_ID);
            const backdrop = AppUtils.getElement(this.BACKDROP_ID);

            if (menuBtn) {
                AppUtils.on(menuBtn, 'click', () => this.toggle());
            }

            if (desktopToggleBtn) {
                AppUtils.on(desktopToggleBtn, 'click', () => {
                    const sidebar = AppUtils.getElement(this.SIDEBAR_ID);
                    if (sidebar) {
                        AppUtils.toggleClass(sidebar, 'hidden');
                    }
                });
            }

            if (backdrop) {
                AppUtils.on(backdrop, 'click', () => this.close());
            }

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                const sidebar = AppUtils.getElement(this.SIDEBAR_ID);
                const menuBtn = AppUtils.getElement(this.MENU_BUTTON_ID);
                if (sidebar && !sidebar.contains(e.target) &&
                    menuBtn && !menuBtn.contains(e.target) &&
                    !AppUtils.hasClass(sidebar, 'hidden') &&
                    window.innerWidth < 1024) {
                    this.close();
                }
            });
        },

        /**
         * Bind menu links to auto-close sidebar on mobile
         */
        bindMenuLinks: function() {
            const sidebar = AppUtils.getElement(this.SIDEBAR_ID);
            if (!sidebar) return;

            const menuLinks = sidebar.querySelectorAll('a[href]');
            menuLinks.forEach(link => {
                AppUtils.on(link, 'click', () => {
                    // Close sidebar on mobile when a menu item is clicked
                    if (window.innerWidth < 1024) {
                        this.close();
                    }
                });
            });
        }
    };

    // ====================
    // 4. MODAL MANAGER
    // ====================
    const ModalManager = {
        /**
         * Open a modal by ID
         */
        open: function(modalId) {
            const modal = AppUtils.getElement(modalId);
            if (modal) {
                AppUtils.removeClass(modal, 'hidden');
                document.body.classList.add('overflow-hidden');
                
                // Dispatch custom event
                const event = new CustomEvent('modal:open', { detail: { modalId } });
                document.dispatchEvent(event);
            }
        },

        /**
         * Close a modal by ID
         */
        close: function(modalId) {
            const modal = AppUtils.getElement(modalId);
            if (modal) {
                AppUtils.addClass(modal, 'hidden');
                document.body.classList.remove('overflow-hidden');
                
                // Dispatch custom event
                const event = new CustomEvent('modal:close', { detail: { modalId } });
                document.dispatchEvent(event);
            }
        },

        /**
         * Toggle a modal by ID
         */
        toggle: function(modalId) {
            const modal = AppUtils.getElement(modalId);
            if (modal) {
                if (AppUtils.hasClass(modal, 'hidden')) {
                    this.open(modalId);
                } else {
                    this.close(modalId);
                }
            }
        },

        /**
         * Initialize modal with open/close buttons
         */
        initModal: function(modalId, options = {}) {
            const {
                openButtonId,
                closeButtonId,
                closeOnOverlay = true,
                closeOnEscape = true,
                overlaySelector = null
            } = options;

            const modal = AppUtils.getElement(modalId);
            if (!modal) return;

            // Open button
            if (openButtonId) {
                const openBtn = AppUtils.getElement(openButtonId);
                if (openBtn) {
                    AppUtils.on(openBtn, 'click', () => this.open(modalId));
                }
            }

            // Close button
            if (closeButtonId) {
                const closeBtn = AppUtils.getElement(closeButtonId);
                if (closeBtn) {
                    AppUtils.on(closeBtn, 'click', () => this.close(modalId));
                }
            }

            // Close on overlay click
            if (closeOnOverlay) {
                let overlay;
                if (overlaySelector) {
                    overlay = modal.querySelector(overlaySelector);
                } else {
                    // Default selectors
                    overlay = modal.querySelector('.modal-overlay, [data-modal-overlay]');
                    // Fallback to ID modalOverlay (common pattern)
                    if (!overlay) {
                        overlay = AppUtils.getElement('modalOverlay');
                    }
                }
                if (overlay) {
                    AppUtils.on(overlay, 'click', () => this.close(modalId));
                }
            }

            // Close on Escape key
            if (closeOnEscape) {
                AppUtils.on(document, 'keydown', (e) => {
                    if (e.key === 'Escape' && !AppUtils.hasClass(modal, 'hidden')) {
                        this.close(modalId);
                    }
                });
            }
        }
    };

    // ====================
    // 5. NOTIFICATION MANAGER (for dashboard alerts)
    // ====================
    const NotificationManager = {
        init: function() {
            this.bindNotificationButtons();
        },

        /**
         * Bind notification button events
         */
        bindNotificationButtons: function() {
            const notificationButton = AppUtils.query('button .fa-bell')?.closest('button');
            if (notificationButton) {
                AppUtils.on(notificationButton, 'click', () => {
                    AppUtils.alert('You have 3 new notifications', 'info');
                });
            }
        },

        /**
         * Show custom notification
         */
        show: function(message, type = 'info') {
            // In a real app, implement toast notifications
            console.log(`Notification (${type}): ${message}`);
            AppUtils.alert(message, type);
        }
    };

    // ====================
    // 6. REMINDER MANAGER (for dashboard reminders)
    // ====================
    const ReminderManager = {
        REMINDER_BUTTON_TEXTS: ['Reschedule', 'Mark done', 'Set reminder', 'Complete'],

        init: function() {
            this.bindReminderButtons();
            this.bindAddReminderButton();
        },

        /**
         * Bind reminder button events
         */
        bindReminderButtons: function() {
            document.querySelectorAll('button').forEach(button => {
                const buttonText = button.textContent.trim();
                if (this.REMINDER_BUTTON_TEXTS.some(text => buttonText.includes(text))) {
                    AppUtils.on(button, 'click', function(e) {
                        e.stopPropagation();
                        const action = buttonText;
                        const reminderText = this.closest('.p-4')?.querySelector('p.text-sm.font-medium')?.textContent || 'Reminder';
                        AppUtils.alert(`${action} for "${reminderText}" clicked. This would trigger an action in a real application.`, 'info');
                    });
                }
            });
        },

        /**
         * Bind "Add new reminder" button
         */
        bindAddReminderButton: function() {
            document.querySelectorAll('button').forEach(button => {
                if (button.textContent.trim().includes('Add new reminder')) {
                    AppUtils.on(button, 'click', () => {
                        AppUtils.alert('Add new reminder form would open here.', 'info');
                    });
                }
            });
        }
    };

    // ====================
    // 7. USER DROPDOWN MANAGER
    // ====================
    const UserDropdownManager = {
        init: function() {
            this.bindUserDropdown();
        },

        /**
         * Bind user dropdown button
         */
        bindUserDropdown: function() {
            const userDropdownButton = AppUtils.query('button .fa-chevron-down')?.closest('button');
            if (userDropdownButton) {
                AppUtils.on(userDropdownButton, 'click', () => {
                    AppUtils.alert('User menu would open here.', 'info');
                });
            }
        }
    };

    // ====================
    // 8. FORM VALIDATION UTILITIES
    // ====================
    const FormValidator = {
        /**
         * Validate required fields
         */
        validateRequired: function(fields) {
            for (const field of fields) {
                if (!field.value.trim()) {
                    return {
                        isValid: false,
                        field: field,
                        message: `Please fill in ${field.name || 'this field'}`
                    };
                }
            }
            return { isValid: true };
        },

        /**
         * Validate email format
         */
        validateEmail: function(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        /**
         * Validate phone number (basic)
         */
        validatePhone: function(phone) {
            const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
            return phoneRegex.test(phone);
        }
    };

    // ====================
    // 9. CITIES/DISTRICTS MANAGER
    // ====================
    const CitiesManager = {
        STORAGE_KEY: 'mapleads_districts',
        
        /**
         * Get saved cities/districts from localStorage
         * Returns array of city names
         */
        getCities: function() {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (!saved || saved.trim() === '') {
                // Return default sample cities if none saved
                return ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
            }
            
            // Parse textarea content: split by newline, trim, filter empty lines
            return saved.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
        },
        
        /**
         * Get cities with option to include default if empty
         */
        getCitiesWithDefaults: function(includeDefaults = true) {
            const cities = this.getCities();
            if (cities.length === 0 && includeDefaults) {
                return ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
            }
            return cities;
        },
        
        /**
         * Save cities to localStorage
         */
        saveCities: function(citiesArray) {
            const text = citiesArray.join('\n');
            localStorage.setItem(this.STORAGE_KEY, text);
            
            // Dispatch event for other pages to refresh
            window.dispatchEvent(new CustomEvent('citiesUpdated', {
                detail: { cities: citiesArray }
            }));
        },
        
        /**
         * Populate a select dropdown with cities
         * @param {string|HTMLElement} selectElement - ID or DOM element of <select>
         * @param {boolean} includeEmptyOption - Whether to include "Select a city" option
         * @param {string} selectedCity - City to preselect
         */
        populateCityDropdown: function(selectElement, includeEmptyOption = true, selectedCity = '') {
            const select = typeof selectElement === 'string'
                ? document.getElementById(selectElement)
                : selectElement;
            
            if (!select) return;
            
            // Clear existing options except first if it's empty placeholder
            if (includeEmptyOption && select.options.length > 0 && select.options[0].value === '') {
                // Keep the first empty option
                while (select.options.length > 1) {
                    select.remove(1);
                }
            } else {
                select.innerHTML = '';
            }
            
            // Add empty option if requested
            if (includeEmptyOption) {
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.textContent = 'Select a city';
                select.appendChild(emptyOption);
            }
            
            // Get cities and add them as options
            const cities = this.getCitiesWithDefaults();
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                if (city === selectedCity) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            
            // If selectedCity wasn't found but we have cities, select first city
            if (selectedCity && !select.value && cities.length > 0) {
                select.selectedIndex = includeEmptyOption ? 1 : 0;
            }
        },
        
        /**
         * Listen for cities updates and refresh dropdowns
         */
        setupAutoRefresh: function(selectElementId) {
            window.addEventListener('citiesUpdated', () => {
                this.populateCityDropdown(selectElementId);
            });
            
            // Also listen to the custom event from settings page
            window.addEventListener('districtsUpdated', (event) => {
                // Re-populate dropdown with updated cities
                this.populateCityDropdown(selectElementId);
            });
        }
    };

    // ====================
    // 10. INITIALIZATION
    // ====================
    const App = {
        /**
         * Initialize all components
         */
        init: function() {
            // Initialize utilities
            DarkModeManager.init();
            MobileSidebarManager.init();
            NotificationManager.init();
            ReminderManager.init();
            UserDropdownManager.init();

            // Dispatch app ready event
            document.dispatchEvent(new CustomEvent('app:ready'));
            
            console.log('MapLeads CRM app initialized');
        },

        /**
         * Public API
         */
        utils: AppUtils,
        darkMode: DarkModeManager,
        sidebar: MobileSidebarManager,
        modal: ModalManager,
        notifications: NotificationManager,
        reminders: ReminderManager,
        user: UserDropdownManager,
        form: FormValidator,
        cities: CitiesManager
    };

    // ====================
    // 10. GLOBAL EXPOSURE
    // ====================
    window.MapLeads = App;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }

})();