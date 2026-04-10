/**
 * Payments Management JavaScript
 * Handles fetching, displaying, and managing payments via the API
 */

// API Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api/v1'
    : 'https://mapleads-crm.onrender.com/api/v1';

// Global state
let payments = [];
let filteredPayments = [];

// DOM Elements
let paymentsTableBody;
let searchClientInput;
let statusFilter;
let paymentMethodFilter;
let totalDealAmountEl;
let totalReceivedAmountEl;
let totalPendingAmountEl;
let totalPaymentsCountEl;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    fetchPayments();
    initEventListeners();
});

// Initialize DOM elements
function initializeElements() {
    paymentsTableBody = document.getElementById('payments-table-body');
    searchClientInput = document.getElementById('search-client');
    statusFilter = document.getElementById('status-filter');
    paymentMethodFilter = document.getElementById('payment-method-filter');
    totalDealAmountEl = document.getElementById('total-deal-amount');
    totalReceivedAmountEl = document.getElementById('total-received-amount');
    totalPendingAmountEl = document.getElementById('total-pending-amount');
    totalPaymentsCountEl = document.getElementById('total-payments-count');
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch(status) {
        case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
}

// Get status display text
function getStatusText(status) {
    switch(status) {
        case 'completed': return 'Completed';
        case 'partial': return 'Partial';
        case 'pending': return 'Pending';
        case 'overdue': return 'Overdue';
        case 'cancelled': return 'Cancelled';
        default: return status;
    }
}

// Get payment method icon
function getPaymentMethodIcon(method) {
    switch(method) {
        case 'bank_transfer': return 'fa-university';
        case 'upi': return 'fa-mobile-alt';
        case 'cash': return 'fa-money-bill-wave';
        case 'credit_card': return 'fa-credit-card';
        case 'debit_card': return 'fa-credit-card';
        case 'cheque': return 'fa-file-invoice-dollar';
        default: return 'fa-money-check-alt';
    }
}

// Get payment method display name
function getPaymentMethodText(method) {
    switch(method) {
        case 'bank_transfer': return 'Bank Transfer';
        case 'upi': return 'UPI';
        case 'cash': return 'Cash';
        case 'credit_card': return 'Credit Card';
        case 'debit_card': return 'Debit Card';
        case 'cheque': return 'Cheque';
        case 'other': return 'Other';
        default: return method.replace('_', ' ');
    }
}

// Fetch payments from API
async function fetchPayments() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/payments`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
            payments = result.data;
            filteredPayments = [...payments];
            renderPayments();
            updateStats();
        } else {
            console.error('API returned unsuccessful response:', result);
            // Fallback to mock data for development
            loadMockPayments();
        }
    } catch (error) {
        console.error('Error fetching payments:', error);
        // Fallback to mock data for development
        loadMockPayments();
    } finally {
        showLoading(false);
    }
}

// Mock data for development (fallback)
function loadMockPayments() {
    console.warn('Using mock payment data for development');
    
    payments = [
        {
            _id: 'mock-1',
            clientName: 'ABC Corporation',
            projectName: 'Website Redesign',
            dealAmount: 50000,
            receivedAmount: 25000,
            pendingAmount: 25000,
            paymentDate: '2026-03-15T00:00:00.000Z',
            paymentMethod: 'bank_transfer',
            nextDueDate: '2026-04-15T00:00:00.000Z',
            status: 'partial',
            notes: 'First installment received',
            createdAt: '2026-03-15T10:00:00.000Z',
            updatedAt: '2026-03-15T10:00:00.000Z'
        },
        {
            _id: 'mock-2',
            clientName: 'XYZ Ltd',
            projectName: 'Mobile App Development',
            dealAmount: 150000,
            receivedAmount: 150000,
            pendingAmount: 0,
            paymentDate: '2026-02-28T00:00:00.000Z',
            paymentMethod: 'upi',
            nextDueDate: null,
            status: 'completed',
            notes: 'Full payment received',
            createdAt: '2026-02-28T14:30:00.000Z',
            updatedAt: '2026-02-28T14:30:00.000Z'
        },
        {
            _id: 'mock-3',
            clientName: 'John Doe Consulting',
            projectName: 'SEO Services',
            dealAmount: 30000,
            receivedAmount: 0,
            pendingAmount: 30000,
            paymentDate: '2026-04-01T00:00:00.000Z',
            paymentMethod: 'credit_card',
            nextDueDate: '2026-04-30T00:00:00.000Z',
            status: 'pending',
            notes: 'Payment pending',
            createdAt: '2026-04-01T09:15:00.000Z',
            updatedAt: '2026-04-01T09:15:00.000Z'
        },
        {
            _id: 'mock-4',
            clientName: 'Global Tech Solutions',
            projectName: 'E-commerce Platform',
            dealAmount: 75000,
            receivedAmount: 25000,
            pendingAmount: 50000,
            paymentDate: '2026-04-10T00:00:00.000Z',
            paymentMethod: 'bank_transfer',
            nextDueDate: '2026-05-10T00:00:00.000Z',
            status: 'partial',
            notes: 'First installment received',
            createdAt: '2026-04-10T11:00:00.000Z',
            updatedAt: '2026-04-10T11:00:00.000Z'
        }
    ];
    filteredPayments = [...payments];
    renderPayments();
    updateStats();
}

// Render payments table
function renderPayments() {
    if (!paymentsTableBody) return;

    paymentsTableBody.innerHTML = '';

    if (filteredPayments.length === 0) {
        paymentsTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="py-8 text-center text-gray-500 dark:text-gray-400">
                    <i class="fas fa-receipt text-4xl mb-4 opacity-50"></i>
                    <p class="text-lg font-medium">No payments found</p>
                    <p class="text-sm mt-1">Try adjusting your filters or add a new payment</p>
                </td>
            </tr>
        `;
        return;
    }

    filteredPayments.forEach(payment => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors';
        row.innerHTML = `
            <td class="py-4 px-4">
                <div class="font-medium text-gray-900 dark:text-white">${payment.clientName}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">${payment.projectName}</div>
            </td>
            <td class="py-4 px-4">
                <div class="font-semibold text-gray-900 dark:text-white">${formatCurrency(payment.dealAmount)}</div>
            </td>
            <td class="py-4 px-4">
                <div class="font-semibold text-green-600 dark:text-green-400">${formatCurrency(payment.receivedAmount)}</div>
            </td>
            <td class="py-4 px-4">
                <div class="font-semibold ${payment.pendingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}">
                    ${formatCurrency(payment.pendingAmount)}
                </div>
            </td>
            <td class="py-4 px-4">
                <div class="flex items-center">
                    <i class="fas ${getPaymentMethodIcon(payment.paymentMethod)} mr-2 text-gray-500 dark:text-gray-400"></i>
                    <span class="capitalize">${getPaymentMethodText(payment.paymentMethod)}</span>
                </div>
            </td>
            <td class="py-4 px-4">
                <div class="text-gray-900 dark:text-white">${formatDate(payment.paymentDate)}</div>
                ${payment.nextDueDate ? `
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Due: ${formatDate(payment.nextDueDate)}
                    </div>
                ` : ''}
            </td>
            <td class="py-4 px-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}">
                    ${getStatusText(payment.status)}
                </span>
            </td>
            <td class="py-4 px-4">
                <div class="text-gray-600 dark:text-gray-300 text-sm max-w-xs truncate">${payment.notes || '—'}</div>
            </td>
            <td class="py-4 px-4">
                <div class="flex space-x-2">
                    <button onclick="editPayment('${payment._id}')" class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deletePayment('${payment._id}')" class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        paymentsTableBody.appendChild(row);
    });
}

// Update statistics
function updateStats() {
    if (!filteredPayments.length) {
        if (totalDealAmountEl) totalDealAmountEl.textContent = formatCurrency(0);
        if (totalReceivedAmountEl) totalReceivedAmountEl.textContent = formatCurrency(0);
        if (totalPendingAmountEl) totalPendingAmountEl.textContent = formatCurrency(0);
        if (totalPaymentsCountEl) totalPaymentsCountEl.textContent = '0';
        return;
    }

    const totalDeal = filteredPayments.reduce((sum, p) => sum + p.dealAmount, 0);
    const totalReceived = filteredPayments.reduce((sum, p) => sum + p.receivedAmount, 0);
    const totalPending = filteredPayments.reduce((sum, p) => sum + p.pendingAmount, 0);

    if (totalDealAmountEl) totalDealAmountEl.textContent = formatCurrency(totalDeal);
    if (totalReceivedAmountEl) totalReceivedAmountEl.textContent = formatCurrency(totalReceived);
    if (totalPendingAmountEl) totalPendingAmountEl.textContent = formatCurrency(totalPending);
    if (totalPaymentsCountEl) totalPaymentsCountEl.textContent = filteredPayments.length.toString();
}

// Filter payments
function filterPayments() {
    const searchTerm = searchClientInput ? searchClientInput.value.toLowerCase() : '';
    const statusValue = statusFilter ? statusFilter.value : '';
    const methodValue = paymentMethodFilter ? paymentMethodFilter.value : '';

    filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm) ||
                             payment.projectName.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusValue || payment.status === statusValue;
        const matchesMethod = !methodValue || payment.paymentMethod === methodValue;

        return matchesSearch && matchesStatus && matchesMethod;
    });

    renderPayments();
    updateStats();
}

// Show/hide loading state
function showLoading(isLoading) {
    const loadingElement = document.getElementById('loading-indicator');
    const tableBody = document.getElementById('payments-table-body');
    
    if (loadingElement) {
        loadingElement.classList.toggle('hidden', !isLoading);
    }
    
    if (tableBody && isLoading) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="py-8 text-center text-gray-500 dark:text-gray-400">
                    <div class="flex flex-col items-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                        <p>Loading payments...</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Initialize event listeners
function initEventListeners() {
    if (searchClientInput) {
        searchClientInput.addEventListener('input', filterPayments);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterPayments);
    }
    if (paymentMethodFilter) {
        paymentMethodFilter.addEventListener('change', filterPayments);
    }

    // Add payment button
    const addPaymentBtn = document.getElementById('add-payment-btn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', () => {
            alert('Add payment functionality would open a modal here. Integration with POST /api/v1/payments');
            // In a real implementation, this would open a modal with a form
            // to create a new payment via POST /api/v1/payments
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-payments-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchPayments);
    }
}

// Edit payment function (placeholder)
function editPayment(paymentId) {
    alert(`Edit payment ${paymentId} - This would open an edit modal with PUT /api/v1/payments/${paymentId}`);
    // In a real implementation, this would open a modal with the payment data
    // and allow editing via PUT /api/v1/payments/{id}
}

// Delete payment function (placeholder)
function deletePayment(paymentId) {
    if (confirm('Are you sure you want to delete this payment?')) {
        alert(`Delete payment ${paymentId} - This would call DELETE /api/v1/payments/${paymentId}`);
        // In a real implementation, this would call:
        // fetch(`${API_BASE}/payments/${paymentId}`, { method: 'DELETE' })
        //   .then(() => fetchPayments()) // Refresh the list
    }
}

// Export functions for global access (if needed)
window.paymentsModule = {
    fetchPayments,
    filterPayments,
    editPayment,
    deletePayment,
    formatCurrency,
    formatDate
};