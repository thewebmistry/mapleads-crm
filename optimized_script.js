// Optimized script for leads.html - under 150 lines
let leads = [
    { id: 1, business: "Tech Solutions Inc", owner: "John Doe", district: "Central Delhi", type: "IT Services", stage: "new", status: "active", whatsapp: "+911234567890", email: "john@tech.com", instagram: "@techsolutions", followUp: "2026-04-10", remark: "Interested in CRM" },
    { id: 2, business: "Cafe Delight", owner: "Alice Smith", district: "South Delhi", type: "Restaurant", stage: "contacted", status: "active", whatsapp: "+919876543210", email: "alice@cafe.com", instagram: "@cafedelight", followUp: "2026-04-12", remark: "Follow up call scheduled" },
    { id: 3, business: "Green Energy Ltd", owner: "Bob Johnson", district: "North Delhi", type: "Renewable Energy", stage: "qualified", status: "active", whatsapp: "+911122334455", email: "bob@green.com", instagram: "@greenenergy", followUp: "2026-04-15", remark: "Requested proposal" },
    { id: 4, business: "Fashion Boutique", owner: "Emma Wilson", district: "East Delhi", type: "Retail", stage: "proposal", status: "inactive", whatsapp: "+913344556677", email: "emma@boutique.com", instagram: "@fashionboutique", followUp: "2026-04-18", remark: "Sent proposal, awaiting response" },
    { id: 5, business: "Auto Repair Shop", owner: "Mike Brown", district: "West Delhi", type: "Automotive", stage: "closed", status: "archived", whatsapp: "+914455667788", email: "mike@auto.com", instagram: "@autorepair", followUp: "2026-04-20", remark: "Deal closed successfully" }
];

// DOM elements
const els = {
    table: document.getElementById('leads-table-body'),
    search: document.getElementById('search-input'),
    district: document.getElementById('district-filter'),
    tabs: document.querySelectorAll('.stage-tab'),
    addBtn: document.getElementById('add-lead-btn'),
    modal: document.getElementById('lead-modal'),
    close: document.getElementById('modal-close'),
    cancel: document.getElementById('modal-cancel'),
    form: document.getElementById('lead-form'),
    sidebarMobile: document.getElementById('sidebar-toggle-mobile'),
    sidebarDesktop: document.getElementById('sidebar-toggle-desktop'),
    overlay: document.getElementById('sidebar-overlay'),
    sidebar: document.getElementById('sidebar'),
    darkToggle: document.getElementById('dark-mode-toggle'),
    darkIcon: document.getElementById('dark-mode-icon')
};

// Render leads table
function renderLeads(filtered = leads) {
    if (filtered.length === 0) {
        els.table.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-500 dark:text-gray-400"><i class="fas fa-users text-4xl mb-2"></i><p class="text-lg">No leads found</p><p class="text-sm mt-1">Try adjusting your filters</p></td></tr>`;
        return;
    }
    els.table.innerHTML = filtered.map(lead => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="py-3 px-4"><div class="font-medium">${lead.business}</div><div class="text-sm text-gray-500 dark:text-gray-400">${lead.whatsapp || 'No phone'}</div></td>
            <td class="py-3 px-4">${lead.owner}</td>
            <td class="py-3 px-4"><span class="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">${lead.district}</span></td>
            <td class="py-3 px-4">${lead.type}</td>
            <td class="py-3 px-4"><span class="px-3 py-1 text-xs rounded-full ${getStageClass(lead.stage)}">${lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}</span></td>
            <td class="py-3 px-4"><span class="px-3 py-1 text-xs rounded-full ${getStatusClass(lead.status)}">${lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}</span></td>
            <td class="py-3 px-4">
                <button class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-3" onclick="openModal(${lead.id})"><i class="fas fa-edit"></i></button>
                <button class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" onclick="deleteLead(${lead.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function getStageClass(stage) {
    const classes = {
        new: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
        contacted: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
        qualified: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        proposal: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
        closed: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    };
    return classes[stage] || classes.new;
}

function getStatusClass(status) {
    const classes = {
        active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        inactive: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
        archived: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    };
    return classes[status] || classes.active;
}

// Modal functions
function openModal(id = null) {
    els.modal.classList.remove('hidden');
    if (id) {
        const lead = leads.find(l => l.id === id);
        if (lead) {
            ['business','owner','district','type','whatsapp','email','instagram','followUp','stage','status','remark'].forEach(field => {
                document.getElementById(field).value = lead[field];
            });
            els.form.dataset.editId = id;
        }
    } else {
        els.form.reset();
        delete els.form.dataset.editId;
    }
}

function closeModal() {
    els.modal.classList.add('hidden');
}

// Delete lead
function deleteLead(id) {
    if (confirm('Are you sure you want to delete this lead?')) {
        leads = leads.filter(lead => lead.id !== id);
        renderLeads();
        showToast('Lead deleted successfully', 'success');
    }
}

// Filter leads
function filterLeads() {
    const searchTerm = els.search.value.toLowerCase();
    const district = els.district.value;
    const activeStageTab = document.querySelector('.stage-tab.bg-white')?.dataset.stage || 'all';
    
    let filtered = leads.filter(lead => {
        const matchesSearch = lead.business.toLowerCase().includes(searchTerm) ||
                              lead.owner.toLowerCase().includes(searchTerm) ||
                              lead.type.toLowerCase().includes(searchTerm);
        const matchesDistrict = !district || lead.district === district;
        const matchesStage = activeStageTab === 'all' || lead.stage === activeStageTab;
        return matchesSearch && matchesDistrict && matchesStage;
    });
    renderLeads(filtered);
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded-lg shadow-lg flex items-center justify-between ${type === 'success' ? 'bg-green-500 text-white' : type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`;
    toast.innerHTML = `<span>${message}</span><button class="ml-4" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Event listeners
els.search.addEventListener('input', filterLeads);
els.district.addEventListener('change', filterLeads);
els.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        els.tabs.forEach(t => t.classList.remove('bg-white', 'dark:bg-gray-700', 'shadow'));
        tab.classList.add('bg-white', 'dark:bg-gray-700', 'shadow');
        filterLeads();
    });
});

els.addBtn.addEventListener('click', () => openModal());
els.close.addEventListener('click', closeModal);
els.cancel.addEventListener('click', closeModal);
els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = els.form.dataset.editId ? parseInt(els.form.dataset.editId) : leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
    const newLead = {};
    ['business','owner','district','type','whatsapp','email','instagram','followUp','stage','status','remark'].forEach(field => {
        newLead[field] = document.getElementById(field).value;
    });
    newLead.id = id;
    
    if (els.form.dataset.editId) {
        const index = leads.findIndex(l => l.id === id);
        leads[index] = newLead;
        showToast('Lead updated successfully', 'success');
    } else {
        leads.push(newLead);
        showToast('Lead added successfully', 'success');
    }
    closeModal();
    renderLeads();
});

// Dark mode toggle
els.darkToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    els.darkIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('darkMode', isDark);
});

// Sidebar toggle
els.sidebarMobile.addEventListener('click', () => {
    els.sidebar.classList.remove('hidden');
    els.overlay.classList.remove('hidden');
});
els.sidebarDesktop.addEventListener('click', () => {
    els.sidebar.classList.add('hidden');
});
els.overlay.addEventListener('click', () => {
    els.sidebar.classList.add('hidden');
    els.overlay.classList.add('hidden');
});

// Initialize
renderLeads();
if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
    els.darkIcon.className = 'fas fa-sun';
}