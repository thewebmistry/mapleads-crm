// Compact script for leads.html - upgraded for high-volume sales planning
// ACTIVE SCRIPT: compact_final.js VERSION 2.0 - API SYNC EDITION
console.log("CRITICAL UI SYNC: compact_final.js VERSION 2.0 loaded - API SYNC");
let leads = [];

// Track due follow-ups filter state
let dueFollowupsFilterActive = false;

// Track status filter (active/archived)
let statusFilter = 'active'; // 'active', 'archived', or 'all'

// Helper to find lead by ID (supports both _id and id, string/number)
function findLeadById(id) {
    // Convert id to string for comparison because onclick passes string
    const idStr = String(id);
    return leads.find(l =>
        String(l._id) === idStr || String(l.id) === idStr
    );
}

const e = id => document.getElementById(id), q = s => document.querySelectorAll(s);
const els = {
    table: e('leads-table-body'), search: e('search-input'), district: e('district-filter'),
    category: e('category-filter'), tabs: q('.stage-tab'), addBtn: e('add-lead-btn'),
    modal: e('lead-modal'), close: e('modal-close'), cancel: e('modal-cancel'),
    form: e('lead-form'), sidebarMobile: e('sidebar-toggle-mobile'),
    sidebarDesktop: e('sidebar-toggle-desktop'), overlay: e('sidebar-overlay'),
    sidebar: e('sidebar'), darkToggle: e('dark-mode-toggle'), darkIcon: e('dark-mode-icon'),
    summaryTotal: e('summary-total'), summaryHot: e('summary-hot'), summaryContacted: e('summary-contacted'),
    summaryPotential: e('summary-potential'), summaryCollected: e('summary-collected'), summaryBalance: e('summary-balance'),
    csvFile: e('csv-file'), csvProgress: e('csv-progress'), csvImportBtn: e('csv-import-btn'),
    dueFollowupsBtn: e('due-followups-filter'),
    activeBtn: e('active-filter-btn'),
    archivedBtn: e('archived-filter-btn')
};

// Force global access for HTML onclick handlers (placed early to survive script errors)
window.openModal = openModal;
window.sendWhatsAppMessage = sendWhatsAppMessage;
window.openInstagram = openInstagram;
window.openFacebook = openFacebook;
window.sendEmail = sendEmail;
window.deleteLead = deleteLead;
window.openPaymentModal = openPaymentModal;

// Helper to ensure website URL has protocol
function normalizeWebsiteUrl(url) {
    if (!url || url.trim() === '') return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    return 'https://' + trimmed;
}

function renderLeads(f = leads) {
    console.log("Leads data to render:", f);
    if (!f) return;
    const tableBody = document.getElementById('leads-table-body');
    if (!tableBody) {
        console.error("Table body ID not found!");
        return;
    }
    if (f.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="py-8 text-center text-gray-500 dark:text-gray-400"><i class="fas fa-users text-4xl mb-2"></i><p class="text-lg">No leads found in Database</p><p class="text-sm mt-1">Try adjusting your filters</p></td></tr>`;
        updateSummary(f);
        return;
    }
    
    // Update summary before rendering
    updateSummary(f);
    
    tableBody.innerHTML = f.map(l => {
        const dealAmount = l.dealAmount || 0;
        const receivedAmount = l.receivedAmount || 0;
        const balance = dealAmount - receivedAmount;
        const hasPendingPayment = balance > 0;
        const projectStatus = l.projectStatus || 'Not Started';
        const leadId = l._id || l.id;
        
        // Get follow-up badge if applicable
        const followUpBadge = getFollowUpBadge(l.followUp);
        
        return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="py-3 px-4">
                <div class="font-medium">${l.business}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">${l.whatsapp || 'No phone'}</div>
                ${hasPendingPayment ? '<span class="mt-1 inline-block px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">Pending Payment</span>' : ''}
                ${followUpBadge ? `<span class="mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${followUpBadge.class}">${followUpBadge.text}</span>` : ''}
            </td>
            <td class="py-3 px-4">${l.owner}</td>
            <td class="py-3 px-4">
                <span class="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">${l.district}</span>
            </td>
            <td class="py-3 px-4">${l.type}</td>
            <td class="py-3 px-4 text-center w-20">
      <div class="flex justify-center items-center">
        ${!l.website || l.website.trim() === "" ?
          `<span class="null-badge rounded font-bold uppercase">
            <i class="fas fa-times-circle mr-1"></i>NULL
          </span>` :
          `<a href="${l.website}" target="_blank" class="inline-flex items-center px-1.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 text-[10px] font-bold leading-none h-5 hover:bg-green-100 transition-colors">
            <i class="fas fa-check-circle mr-1 text-[8px]"></i>LIVE
          </a>`
        }
      </div>
    </td>
            <td class="py-3 px-4">
                <span class="px-3 py-1 text-xs rounded-full ${getStageClass(l.stage)}">
                    ${l.stage.charAt(0).toUpperCase() + l.stage.slice(1)}
                </span>
            </td>
            <td class="py-3 px-4">
                <span class="px-3 py-1 text-xs rounded-full ${getProjectStatusClass(projectStatus)}">
                    ${projectStatus}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="text-sm font-medium">₹${dealAmount.toLocaleString()}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Received: ₹${receivedAmount.toLocaleString()}</div>
                ${balance > 0 ? `<div class="text-xs text-amber-600 dark:text-amber-400">Balance: ₹${balance.toLocaleString()}</div>` : ''}
            </td>
            <td class="py-3 px-4">
                <span class="px-3 py-1 text-xs rounded-full ${getStatusClass(l.status)}">
                    ${l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                </span>
            </td>
            <td class="py-3 px-4">
                <button class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-3 action-btn" onclick="openModal('${leadId}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-3 action-btn" onclick="openPaymentModal('${leadId}')">
                    <i class="fas fa-rupee-sign"></i>
                </button>
                <button class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-3 action-btn" onclick="sendWhatsAppMessage('${leadId}')">
                    <i class="fab fa-whatsapp"></i>
                </button>
                ${l.instagram ? `<button class="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 mr-3 action-btn" onclick="openInstagram('${leadId}')">
                    <i class="fab fa-instagram"></i>
                </button>` : ''}
                ${l.facebook ? `<button class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3 action-btn" onclick="openFacebook('${leadId}')">
                    <i class="fab fa-facebook"></i>
                </button>` : ''}
                ${l.email ? `<button class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3 action-btn" onclick="sendEmail('${leadId}')">
                    <i class="fas fa-envelope"></i>
                </button>` : ''}
                <button class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 action-btn" onclick="deleteLead('${leadId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}
function getStageClass(s){const c={new:'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',contacted:'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',qualified:'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',proposal:'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',closed:'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'};return c[s]||c.new;}
function getStatusClass(s){const c={active:'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',inactive:'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',archived:'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'};return c[s]||c.active;}
function getProjectStatusClass(s) {
    const status = s?.toLowerCase() || 'not started';
    const classes = {
        'proposal sent': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
        'designing': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        'development': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
        'hosting': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
        'live': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        'not started': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    };
    return classes[status] || classes['not started'];
}

// Follow-up date comparison and badge generation
function getFollowUpBadge(followUpDate) {
    if (!followUpDate) return null;
    
    // Parse the follow-up date (expected format: YYYY-MM-DD)
    const followUp = new Date(followUpDate);
    if (isNaN(followUp.getTime())) return null;
    
    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set follow-up date to midnight for accurate comparison
    const followUpMidnight = new Date(followUp);
    followUpMidnight.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = followUpMidnight.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Determine badge based on date comparison
    if (diffDays === 0) {
        // Date == Today
        return {
            text: '<i class="fas fa-exclamation-circle mr-1"></i> DUE TODAY',
            class: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
        };
    } else if (diffDays < 0) {
        // Date < Today (Overdue)
        return {
            text: '<i class="fas fa-clock mr-1"></i> OVERDUE',
            class: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        };
    }
    
    // Future dates - no badge needed
    return null;
}

function openModal(id=null){
    console.log("Opening Modal for:", id);
    const modal = document.getElementById('lead-modal');
    if (!modal) {
        console.error("Modal element not found!");
        return;
    }
    modal.classList.remove('hidden');
    if(id){
        const l = findLeadById(id);
        if(l){
            ['business','owner','district','type','whatsapp','email','instagram','facebook','followUp','stage','status','remark','website','dealAmount','receivedAmount','projectStatus','address'].forEach(f=>{
                const field = e(f);
                if (field) field.value = l[f] || '';
            });
            els.form.dataset.editId=id;
        }
    }else{
        els.form.reset();
        delete els.form.dataset.editId;
    }
}

function openPaymentModal(id) {
    const lead = findLeadById(id);
    if (!lead) return;
    
    // Update modal title with lead name
    const leadNameEl = document.getElementById('payment-lead-name');
    if (leadNameEl) leadNameEl.textContent = lead.business;
    
    // Populate form fields
    const dealAmount = document.getElementById('deal-amount');
    const receivedAmount = document.getElementById('received-amount');
    const projectStatus = document.getElementById('project-status');
    const paymentNotes = document.getElementById('payment-notes');
    const balanceDisplay = document.getElementById('balance-display');
    
    if (dealAmount) dealAmount.value = lead.dealAmount || '';
    if (receivedAmount) receivedAmount.value = lead.receivedAmount || '';
    if (projectStatus) projectStatus.value = lead.projectStatus || 'Not Started';
    if (paymentNotes) paymentNotes.value = lead.paymentNotes || '';
    
    // Calculate and display balance
    if (balanceDisplay) {
        const deal = Number(lead.dealAmount) || 0;
        const received = Number(lead.receivedAmount) || 0;
        const balance = deal - received;
        balanceDisplay.textContent = `Balance: ₹${balance.toLocaleString()}`;
        balanceDisplay.className = `mt-2 text-sm ${balance > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`;
    }
    
    // Store the lead ID in the form
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) paymentForm.dataset.leadId = id;
    
    // Show the modal
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) paymentModal.classList.remove('hidden');
}

function closePaymentModal() {
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) paymentModal.classList.add('hidden');
}
function closeModal(){els.modal.classList.add('hidden');}
function deleteLead(id) {
    if (confirm('Are you sure you want to delete this lead?')) {
        // Convert id to string for consistent comparison
        const idStr = String(id);
        leads = leads.filter(l =>
            String(l._id) !== idStr && String(l.id) !== idStr
        );
        // Save to localStorage
        localStorage.setItem('mapleads_leads', JSON.stringify(leads));
        renderLeads();
        showToast('Lead deleted successfully', 'success');
    }
}
function sendWhatsAppMessage(id) {
    console.log("Searching for lead with ID:", id);
    console.log("Full Leads Array:", leads);
    console.log("Available Lead IDs:", leads.map(l => l._id || l.id));
    const lead = findLeadById(id);
    if (!lead) {
        showToast('Lead not found', 'error');
        return;
    }
    
    // Get WhatsApp settings from localStorage
    const whatsappNumber = localStorage.getItem('mapleads_whatsapp_number') || '';
    const defaultMessage = localStorage.getItem('mapleads_default_message') || '';
    const portfolioLink = localStorage.getItem('mapleads_portfolio_link') || '';
    const templateA = localStorage.getItem('mapleads_template_a') || '';
    const templateB = localStorage.getItem('mapleads_template_b') || '';
    
    if (!whatsappNumber) {
        showToast('Please set WhatsApp number in Settings first', 'error');
        return;
    }
    
    // Determine which template to use based on smart selection logic
    let template = defaultMessage;
    
    // Smart selection logic:
    // 1. If website status is 'NULL' (empty or whitespace), use Template A (Sales Pitch)
    // 2. If lead has DUE/OVERDUE follow-up OR stage is 'Contacted'/'Proposal', use Template B (Follow-up)
    // 3. Otherwise use default message
    
    const hasWebsite = lead.website && lead.website.trim() !== '';
    const isContactedOrProposal = lead.stage === 'contacted' || lead.stage === 'proposal';
    const hasDueFollowup = getFollowUpBadge(lead.followUp) !== null;
    
    if (!hasWebsite) {
        // No website - use Template A (Sales Pitch)
        template = templateA || defaultMessage;
    } else if (hasDueFollowup || isContactedOrProposal) {
        // Has website and either has due follow-up OR is in Contacted/Proposal stage - use Template B (Follow-up)
        template = templateB || defaultMessage;
    }
    
    // Replace template variables
    let message = template
        .replace(/{business}/g, lead.business || '')
        .replace(/{owner}/g, lead.owner || '')
        .replace(/{district}/g, lead.district || '');
    
    // Add portfolio link if template contains {portfolio}
    if (portfolioLink && message.includes('{portfolio}')) {
        message = message.replace(/{portfolio}/g, portfolioLink);
    }
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = lead.whatsapp || '';
    
    if (!phoneNumber) {
        showToast('Lead has no WhatsApp number', 'error');
        return;
    }
    
    // Clean phone number (remove spaces, plus sign if needed)
    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '');
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    showToast('WhatsApp message prepared', 'success');
}
function filterLeads() {
    const t = els.search.value.toLowerCase();
    const d = els.district.value;
    const c = els.category.value;
    const s = document.querySelector('.stage-tab.bg-white')?.dataset.stage || 'all';
    
    let f = leads.filter(l => {
        const matchesSearch = l.business.toLowerCase().includes(t) ||
                              l.owner.toLowerCase().includes(t) ||
                              l.type.toLowerCase().includes(t);
        const matchesDistrict = !d || l.district === d;
        const matchesCategory = !c || l.type === c;
        const matchesStage = s === 'all' || l.stage === s;
        
        // Check status filter (active/archived)
        let matchesStatus = true;
        if (statusFilter === 'active') {
            matchesStatus = (l.isArchived === false || l.isArchived === undefined);
        } else if (statusFilter === 'archived') {
            matchesStatus = (l.isArchived === true);
        } // 'all' shows all leads
        
        // Check due follow-ups filter
        let matchesDueFollowups = true;
        if (dueFollowupsFilterActive) {
            const followUpBadge = getFollowUpBadge(l.followUp);
            matchesDueFollowups = followUpBadge !== null; // Only show leads with Due Today or Overdue badges
        }
        
        return matchesSearch && matchesDistrict && matchesCategory && matchesStage && matchesStatus && matchesDueFollowups;
    });
    
    renderLeads(f);
}

// Update summary dashboard
function updateSummary(filteredLeads = leads) {
    if (!els.summaryTotal) return;
    
    const total = filteredLeads.length;
    const hotLeads = filteredLeads.filter(l => !l.website || l.website.trim() === '').length;
    const contactedLeads = filteredLeads.filter(l => l.stage === 'contacted' || l.stage === 'replied' || l.stage === 'qualified').length;
    
    // Calculate revenue analytics
    let totalPotential = 0;
    let totalCollected = 0;
    let totalBalance = 0;
    
    filteredLeads.forEach(lead => {
        const dealAmount = Number(lead.dealAmount) || 0;
        const receivedAmount = Number(lead.receivedAmount) || 0;
        const balance = dealAmount - receivedAmount;
        
        totalPotential += dealAmount;
        totalCollected += receivedAmount;
        totalBalance += balance > 0 ? balance : 0;
    });
    
    els.summaryTotal.textContent = total;
    els.summaryHot.textContent = hotLeads;
    els.summaryContacted.textContent = contactedLeads;
    
    // Update revenue analytics if elements exist
    if (els.summaryPotential) {
        els.summaryPotential.textContent = `₹${totalPotential.toLocaleString()}`;
    }
    if (els.summaryCollected) {
        els.summaryCollected.textContent = `₹${totalCollected.toLocaleString()}`;
    }
    if (els.summaryBalance) {
        els.summaryBalance.textContent = `₹${totalBalance.toLocaleString()}`;
    }
}

// Populate dynamic dropdowns with unique values from leads
function populateDropdowns() {
    if (!els.district || !els.category) return;
    
    // Get unique districts
    const districts = [...new Set(leads.map(l => l.district).filter(Boolean))].sort();
    // Get unique categories (types)
    const categories = [...new Set(leads.map(l => l.type).filter(Boolean))].sort();
    
    // Clear existing options (keep first "All" option)
    els.district.innerHTML = '<option value="">All Districts</option>';
    els.category.innerHTML = '<option value="">All Categories</option>';
    
    // Add district options
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        els.district.appendChild(option);
    });
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        els.category.appendChild(option);
    });
}

// Sorting functionality
let currentSort = { column: null, direction: 'asc' };

function sortLeads(column) {
    // Toggle direction if same column
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    // Create a copy of leads to sort
    const leadsToSort = [...leads];
    
    leadsToSort.sort((a, b) => {
        let aValue, bValue;
        
        switch (column) {
            case 'website':
                // Sort by website presence (has website first)
                aValue = a.website ? 1 : 0;
                bValue = b.website ? 1 : 0;
                break;
            case 'business':
                aValue = a.business?.toLowerCase() || '';
                bValue = b.business?.toLowerCase() || '';
                break;
            case 'district':
                aValue = a.district?.toLowerCase() || '';
                bValue = b.district?.toLowerCase() || '';
                break;
            case 'type':
                aValue = a.type?.toLowerCase() || '';
                bValue = b.type?.toLowerCase() || '';
                break;
            case 'stage':
                aValue = a.stage?.toLowerCase() || '';
                bValue = b.stage?.toLowerCase() || '';
                break;
            case 'status':
                aValue = a.status?.toLowerCase() || '';
                bValue = b.status?.toLowerCase() || '';
                break;
            default:
                return 0;
        }
        
        if (aValue < bValue) return currentSort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Update the leads array and re-render
    leads = leadsToSort;
    renderLeads();
    
    // Update sort indicators in table headers
    updateSortIndicators(column);
}

function updateSortIndicators(activeColumn) {
    // Remove all sort indicators
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        const icon = th.querySelector('.sort-icon');
        if (icon) icon.remove();
    });
    
    // Add indicator to active column
    const activeTh = document.querySelector(`th[data-sort="${activeColumn}"]`);
    if (activeTh) {
        activeTh.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
        
        // Add icon
        const icon = document.createElement('i');
        icon.className = `fas fa-${currentSort.direction === 'asc' ? 'sort-up' : 'sort-down'} sort-icon ml-2`;
        activeTh.appendChild(icon);
    }
}

// Initialize sorting on table headers
function initSorting() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-sort');
            sortLeads(column);
        });
    });
}
function showToast(m,t='info'){const el=document.createElement('div');el.className=`px-4 py-3 rounded-lg shadow-lg flex items-center justify-between ${t==='success'?'bg-green-500 text-white':t==='error'?'bg-red-500 text-white':'bg-blue-500 text-white'}`;el.innerHTML=`<span>${m}</span><button class="ml-4" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;e('toast-container').appendChild(el);setTimeout(()=>el.remove(),4000);}
// Smart CSV column mapper
function mapCSVHeaders(headers) {
    const headerMap = {
        // Business name mappings
        'business': 'business',
        'business name': 'business',
        'company': 'business',
        'company name': 'business',
        'title': 'business',
        'name': 'business',
        'businessname': 'business',
        // Owner mappings
        'owner': 'owner',
        'owner name': 'owner',
        'contact': 'owner',
        'contact person': 'owner',
        'contact name': 'owner',
        // District mappings
        'district': 'district',
        'location': 'district',
        'city': 'district',
        'area': 'district',
        // Type/Category mappings
        'type': 'type',
        'category': 'type',
        'business type': 'type',
        'industry': 'type',
        // Phone mappings
        'phone': 'whatsapp',
        'whatsapp': 'whatsapp',
        'mobile': 'whatsapp',
        'contact number': 'whatsapp',
        'phone number': 'whatsapp',
        // Email mappings
        'email': 'email',
        'email address': 'email',
        // Website mappings
        'website': 'website',
        'url': 'website',
        'web': 'website',
        // Stage mappings
        'stage': 'stage',
        'status': 'stage',
        'lead stage': 'stage',
        // Follow-up mappings
        'followup': 'followUp',
        'follow up': 'followUp',
        'next contact': 'followUp',
        // Remark mappings
        'remark': 'remark',
        'notes': 'remark',
        'comments': 'remark'
    };
    
    return headers.map(h => {
        const normalized = h.toLowerCase().trim();
        return headerMap[normalized] || h;
    });
}

// Process CSV file
async function processCSV(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file selected'));
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const csvText = e.target.result;
                const lines = csvText.split('\n');
                
                if (lines.length === 0) {
                    reject(new Error('CSV file is empty'));
                    return;
                }
                
                // Parse headers
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                const mappedHeaders = mapCSVHeaders(headers);
                
                // Parse data rows
                const newLeads = [];
                let processedCount = 0;
                
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim() === '') continue;
                    
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                    const lead = { id: leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 + i : i + 1 };
                    
                    // Map values to lead properties
                    mappedHeaders.forEach((mappedHeader, index) => {
                        if (values[index] !== undefined) {
                            lead[mappedHeader] = values[index];
                        }
                    });
                    
                    // Set defaults for missing required fields
                    if (!lead.business) lead.business = `Imported Lead ${i}`;
                    if (!lead.stage) lead.stage = 'new';
                    if (!lead.status) lead.status = 'active';
                    if (!lead.website) lead.website = '';
                    
                    newLeads.push(lead);
                    processedCount++;
                    
                    // Update progress
                    if (els.csvProgress) {
                        const progress = Math.round((i / (lines.length - 1)) * 100);
                        els.csvProgress.textContent = `Processing... ${progress}% (${processedCount} leads)`;
                    }
                }
                
                resolve(newLeads);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Failed to read CSV file'));
        };
        
        reader.readAsText(file);
    });
}

// Import CSV button handler
async function importCSV() {
    const fileInput = els.csvFile;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showToast('Please select a CSV file first', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Show progress indicator
    if (els.csvProgress) {
        els.csvProgress.classList.remove('hidden');
        els.csvProgress.textContent = 'Starting import...';
    }
    
    if (els.csvImportBtn) {
        els.csvImportBtn.disabled = true;
        els.csvImportBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Importing...';
    }
    
    try {
        const newLeads = await processCSV(file);
        
        // Show import progress alert as requested
        alert("Importing " + newLeads.length + " leads...");
        
        // Update progress
        if (els.csvProgress) {
            els.csvProgress.textContent = `Uploading 0/${newLeads.length} leads...`;
        }
        
        let uploadedCount = 0;
        let errors = [];
        
        // Upload each lead to API using direct fetch
        for (const lead of newLeads) {
            try {
                // Remove id field (let API generate _id)
                const { id, ...leadData } = lead;
                
                // Use direct fetch instead of window.api.createLead
                const response = await fetch('/api/v1/leads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(leadData)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                uploadedCount++;
                // Update progress
                if (els.csvProgress) {
                    els.csvProgress.textContent = `Uploading ${uploadedCount}/${newLeads.length} leads...`;
                }
            } catch (err) {
                console.error('Failed to upload lead:', lead, err);
                errors.push({ lead, error: err.message });
                // Continue with next lead
            }
        }
        
        // Refresh leads from API
        await fetchLeads();
        
        // Update UI
        populateDropdowns();
        renderLeads();
        
        // Show success message with any errors
        if (errors.length === 0) {
            showToast(`Successfully imported ${uploadedCount} leads`, 'success');
        } else {
            showToast(`Imported ${uploadedCount} leads, ${errors.length} failed`, 'warning');
        }
        
        // Reset file input
        fileInput.value = '';
    } catch (error) {
        console.error('CSV import error:', error);
        showToast(`Import failed: ${error.message}`, 'error');
    } finally {
        // Hide progress indicator
        if (els.csvProgress) {
            els.csvProgress.classList.add('hidden');
        }
        if (els.csvImportBtn) {
            els.csvImportBtn.disabled = false;
            els.csvImportBtn.innerHTML = '<i class="fas fa-file-import mr-2"></i> Import CSV';
        }
    }
}

// Event listeners
if (els.search) els.search.addEventListener('input', filterLeads);
if (els.district) els.district.addEventListener('change', filterLeads);
if (els.category) els.category.addEventListener('change', filterLeads);

// Global click event delegation for buttons that may be dynamically created
document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Stage tabs (New, Contacted, Replied, etc.)
    if (target.classList.contains('stage-tab')) {
        // Update active tab styling
        const allTabs = document.querySelectorAll('.stage-tab');
        allTabs.forEach(t => t.classList.remove('bg-white', 'dark:bg-gray-700', 'shadow'));
        target.classList.add('bg-white', 'dark:bg-gray-700', 'shadow');
        filterLeads();
    }
    
    // Due follow-ups filter button
    if (target.id === 'due-followups-filter' || target.closest('#due-followups-filter')) {
        const btn = els.dueFollowupsBtn;
        if (!btn) return;
        dueFollowupsFilterActive = !dueFollowupsFilterActive;
        
        // Update button styling to show active/inactive state
        if (dueFollowupsFilterActive) {
            btn.classList.remove('bg-gradient-to-r', 'from-red-500', 'to-red-600');
            btn.classList.add('bg-gradient-to-r', 'from-red-600', 'to-red-700', 'ring-2', 'ring-red-300', 'dark:ring-red-700', 'pulse-ring-active');
            btn.innerHTML = '<i class="fas fa-bell mr-2"></i> Due Follow-ups <span class="ml-1 text-xs bg-white/30 px-1.5 py-0.5 rounded">✓</span>';
        } else {
            btn.classList.remove('bg-gradient-to-r', 'from-red-600', 'to-red-700', 'ring-2', 'ring-red-300', 'dark:ring-red-700', 'pulse-ring-active');
            btn.classList.add('bg-gradient-to-r', 'from-red-500', 'to-red-600');
            btn.innerHTML = '<i class="fas fa-bell mr-2"></i> Due Follow-ups';
        }
        
        filterLeads();
    }
    
    // Active filter button
    if (target.id === 'active-filter-btn' || target.closest('#active-filter-btn')) {
        if (statusFilter !== 'active') {
            statusFilter = 'active';
            updateStatusButtons();
            filterLeads();
        }
    }
    
    // Archived filter button
    if (target.id === 'archived-filter-btn' || target.closest('#archived-filter-btn')) {
        if (statusFilter !== 'archived') {
            statusFilter = 'archived';
            updateStatusButtons();
            filterLeads();
        }
    }
    
    // CSV import button
    if (target.id === 'csv-import-btn' || target.closest('#csv-import-btn')) {
        importCSV();
    }
});

// Function to update status buttons styling (needed for delegation)
function updateStatusButtons() {
    if (!els.activeBtn || !els.archivedBtn) return;
    
    if (statusFilter === 'active') {
        // Active button is active
        els.activeBtn.classList.remove('border', 'border-secondary-300', 'dark:border-secondary-700', 'bg-white/50', 'dark:bg-secondary-800/50', 'text-secondary-700', 'dark:text-secondary-300');
        els.activeBtn.classList.add('bg-gradient-to-r', 'from-primary-500', 'to-primary-600', 'text-white', 'shadow-lg', 'shadow-primary-500/30');
        // Archived button is inactive
        els.archivedBtn.classList.remove('bg-gradient-to-r', 'from-primary-500', 'to-primary-600', 'text-white', 'shadow-lg', 'shadow-primary-500/30');
        els.archivedBtn.classList.add('border', 'border-secondary-300', 'dark:border-secondary-700', 'bg-white/50', 'dark:bg-secondary-800/50', 'text-secondary-700', 'dark:text-secondary-300');
    } else if (statusFilter === 'archived') {
        // Archived button is active
        els.archivedBtn.classList.remove('border', 'border-secondary-300', 'dark:border-secondary-700', 'bg-white/50', 'dark:bg-secondary-800/50', 'text-secondary-700', 'dark:text-secondary-300');
        els.archivedBtn.classList.add('bg-gradient-to-r', 'from-primary-500', 'to-primary-600', 'text-white', 'shadow-lg', 'shadow-primary-500/30');
        // Active button is inactive
        els.activeBtn.classList.remove('bg-gradient-to-r', 'from-primary-500', 'to-primary-600', 'text-white', 'shadow-lg', 'shadow-primary-500/30');
        els.activeBtn.classList.add('border', 'border-secondary-300', 'dark:border-secondary-700', 'bg-white/50', 'dark:bg-secondary-800/50', 'text-secondary-700', 'dark:text-secondary-300');
    }
}

// Initial button styling for status buttons
if (els.activeBtn && els.archivedBtn) {
    updateStatusButtons();
}
if (els.addBtn) els.addBtn.addEventListener('click', () => openModal());
if (els.close) els.close.addEventListener('click', closeModal);
if (els.cancel) els.cancel.addEventListener('click', closeModal);
if (els.form) els.form.addEventListener('submit', e => {
    e.preventDefault();
    const id = els.form.dataset.editId ? parseInt(els.form.dataset.editId) : leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
    const n = {};
    ['business', 'owner', 'district', 'type', 'whatsapp', 'email', 'instagram', 'facebook', 'followUp', 'stage', 'status', 'remark', 'website', 'dealAmount', 'receivedAmount', 'projectStatus', 'address'].forEach(f => {
        const value = document.getElementById(f) ? document.getElementById(f).value : '';
        // Convert numeric fields to numbers
        if (f === 'dealAmount' || f === 'receivedAmount') {
            n[f] = value ? Number(value) : 0;
        } else {
            n[f] = value;
        }
    });
    n.id = id;
    
    if (els.form.dataset.editId) {
        const i = leads.findIndex(l => l.id === id);
        leads[i] = n;
        showToast('Lead updated successfully', 'success');
    } else {
        leads.push(n);
        showToast('Lead added successfully', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('mapleads_leads', JSON.stringify(leads));
    
    // Update UI
    closeModal();
    populateDropdowns();
    renderLeads();
});

// Payment form submission
const paymentForm = document.getElementById('payment-form');
if (paymentForm) {
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const leadId = parseInt(this.dataset.leadId);
        if (!leadId) return;
        
        const leadIndex = leads.findIndex(l => l.id === leadId);
        if (leadIndex === -1) return;
        
        // Get form values
        const dealAmount = document.getElementById('deal-amount').value;
        const receivedAmount = document.getElementById('received-amount').value;
        const projectStatus = document.getElementById('project-status').value;
        const paymentNotes = document.getElementById('payment-notes').value;
        
        // Update lead
        leads[leadIndex].dealAmount = dealAmount ? Number(dealAmount) : 0;
        leads[leadIndex].receivedAmount = receivedAmount ? Number(receivedAmount) : 0;
        leads[leadIndex].projectStatus = projectStatus;
        leads[leadIndex].paymentNotes = paymentNotes;
        
        // Save to localStorage
        localStorage.setItem('mapleads_leads', JSON.stringify(leads));
        
        // Update UI
        closePaymentModal();
        renderLeads();
        showToast('Payment & project details updated successfully', 'success');
    });
}

// Payment modal event listeners
const paymentModalClose = document.getElementById('payment-modal-close');
const paymentModalCancel = document.getElementById('payment-modal-cancel');
if (paymentModalClose) {
    paymentModalClose.addEventListener('click', closePaymentModal);
}
if (paymentModalCancel) {
    paymentModalCancel.addEventListener('click', closePaymentModal);
}

// Social button functions
function sendEmail(id) {
    const lead = findLeadById(id);
    if (!lead || !lead.email) {
        alert('No email address available for this lead');
        return;
    }
    window.location.href = `mailto:${lead.email}?subject=Follow-up from Mapleads&body=Hello ${lead.business},`;
}

function openInstagram(id) {
    const lead = findLeadById(id);
    if (!lead || !lead.instagram) {
        alert('No Instagram handle available for this lead');
        return;
    }
    const instagramHandle = lead.instagram.startsWith('@') ? lead.instagram.substring(1) : lead.instagram;
    window.open(`https://instagram.com/${instagramHandle}`, '_blank');
}

function openFacebook(id) {
    const lead = findLeadById(id);
    if (!lead || !lead.facebook) {
        alert('No Facebook profile available for this lead');
        return;
    }
    window.open(lead.facebook, '_blank');
}

// Real-time balance calculation
const dealAmountInput = document.getElementById('deal-amount');
const receivedAmountInput = document.getElementById('received-amount');
const balanceDisplay = document.getElementById('balance-display');

if (dealAmountInput && receivedAmountInput && balanceDisplay) {
    const updateBalance = () => {
        const deal = Number(dealAmountInput.value) || 0;
        const received = Number(receivedAmountInput.value) || 0;
        const balance = deal - received;
        balanceDisplay.textContent = `Balance: ₹${balance.toLocaleString()}`;
        balanceDisplay.className = `mt-2 text-sm ${balance > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`;
    };
    
    dealAmountInput.addEventListener('input', updateBalance);
    receivedAmountInput.addEventListener('input', updateBalance);
}

if (els.darkToggle) {
    els.darkToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const d = document.documentElement.classList.contains('dark');
        if (els.darkIcon) els.darkIcon.className = d ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('darkMode', d);
    });
}
if (els.sidebarMobile && els.sidebar && els.overlay) {
    els.sidebarMobile.addEventListener('click', () => {
        els.sidebar.classList.remove('hidden');
        els.overlay.classList.remove('hidden');
    });
}
if (els.sidebarDesktop && els.sidebar) {
    els.sidebarDesktop.addEventListener('click', () => {
        els.sidebar.classList.add('hidden');
    });
}
if (els.overlay && els.sidebar) {
    els.overlay.addEventListener('click', () => {
        els.sidebar.classList.add('hidden');
        els.overlay.classList.add('hidden');
    });
}

// Empty state button handlers
document.addEventListener('DOMContentLoaded', function() {
    const addLeadBtnEmpty = document.getElementById('add-lead-btn-empty');
    const importCsvEmpty = document.getElementById('import-csv-empty');
    
    if (addLeadBtnEmpty) {
        addLeadBtnEmpty.addEventListener('click', function() {
            els.addLeadBtn.click();
        });
    }
    
    if (importCsvEmpty) {
        importCsvEmpty.addEventListener('click', function() {
            // Focus on CSV file input
            const csvFileInput = document.getElementById('csv-file');
            if (csvFileInput) {
                csvFileInput.click();
            }
        });
    }
});
// Fetch leads from API
async function fetchLeads() {
    try {
        console.log('Fetching leads from API...');
        // Use direct fetch instead of window.api.getLeads()
        const response = await fetch('/api/v1/leads');
        const data = await response.json();
        
        // Log raw API data for debugging
        console.log("RAW_API_DATA:", data);
        
        if (!data.success) {
            throw new Error('API returned success: false');
        }
        
        const leadsData = data.data;
        
        // Transform API data to match frontend field names
        leads = leadsData.map(apiLead => ({
            // Map API fields to frontend fields
            id: apiLead._id || apiLead.id,
            business: apiLead.businessName || apiLead.business || '',
            owner: apiLead.ownerName || apiLead.owner || '',
            district: apiLead.district || '',
            type: apiLead.businessType || apiLead.type || '',
            whatsapp: apiLead.whatsapp || '',
            email: apiLead.email || '',
            instagram: apiLead.instagram || '',
            website: apiLead.website || '',
            facebook: apiLead.facebook || '',
            mapsLink: apiLead.mapsLink || '',
            firstMessageDate: apiLead.firstMessageDate || '',
            followUp: apiLead.followUpDate || apiLead.followUp || '',
            stage: apiLead.stage || 'new',
            status: apiLead.status || 'warm', // hot/warm/cold
            budget: apiLead.budget || 0,
            remark: apiLead.remark || '',
            address: apiLead.address || '',
            probability: apiLead.probability || 0,
            isArchived: apiLead.isArchived || false,
            // Add default values for frontend-only fields
            dealAmount: apiLead.dealAmount || apiLead.budget || 0,
            receivedAmount: apiLead.receivedAmount || 0,
            projectStatus: apiLead.projectStatus || 'Not Started',
            // Keep original API fields for compatibility
            ...apiLead
        }));
        
        console.log('Leads fetched and transformed successfully:', leads.length);
        
        // IMMEDIATELY call renderLeads() as requested
        renderLeads();
        
        return leads;
    } catch (error) {
        console.error('Failed to fetch leads:', error);
        showToast('Failed to load leads from API', 'error');
        // Fallback to localStorage if API fails
        const savedLeads = localStorage.getItem('mapleads_leads');
        if (savedLeads) {
            try {
                leads = JSON.parse(savedLeads);
                console.log('Using localStorage leads:', leads.length);
                renderLeads();
            } catch (e) {
                console.error('Failed to parse saved leads:', e);
                leads = [];
                renderLeads();
            }
        } else {
            leads = [];
            renderLeads();
        }
        return leads;
    }
}

// Initialize the application
async function initApp() {
    // Fetch leads from API
    await fetchLeads();
    
    // Populate dropdowns with unique values
    populateDropdowns();
    
    // Render initial leads
    renderLeads();
    
    // Update summary
    updateSummary();
    
    // Initialize table sorting
    initSorting();
    
    // Apply dark mode if enabled
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
        if (els.darkIcon) els.darkIcon.className = 'fas fa-sun';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Ensure table draws immediately
renderLeads();