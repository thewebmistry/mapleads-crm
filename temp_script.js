// Leads array with 5 items
let leads = [
    { id: 1, business: "Tech Solutions Inc", owner: "John Doe", district: "Central Delhi", type: "IT Services", stage: "new", status: "active", whatsapp: "+911234567890", email: "john@tech.com", instagram: "@techsolutions", followUp: "2026-04-10", remark: "Interested in CRM" },
    { id: 2, business: "Cafe Delight", owner: "Alice Smith", district: "South Delhi", type: "Restaurant", stage: "contacted", status: "active", whatsapp: "+919876543210", email: "alice@cafe.com", instagram: "@cafedelight", followUp: "2026-04-12", remark: "Follow up call scheduled" },
    { id: 3, business: "Green Energy Ltd", owner: "Bob Johnson", district: "North Delhi", type: "Renewable Energy", stage: "qualified", status: "active", whatsapp: "+911122334455", email: "bob@green.com", instagram: "@greenenergy", followUp: "2026-04-15", remark: "Requested proposal" },
    { id: 4, business: "Fashion Boutique", owner: "Emma Wilson", district: "East Delhi", type: "Retail", stage: "proposal", status: "inactive", whatsapp: "+913344556677", email: "emma@boutique.com", instagram: "@fashionboutique", followUp: "2026-04-18", remark: "Sent proposal, awaiting response" },
    { id: 5, business: "Auto Repair Shop", owner: "Mike Brown", district: "West Delhi", type: "Automotive", stage: "closed", status: "archived", whatsapp: "+914455667788", email: "mike@auto.com", instagram: "@autorepair", followUp: "2026-04-20", remark: "Deal closed successfully" }
];

// DOM elements
const tbody = document.getElementById('leads-table-body');
const search = document.getElementById('search-input');
const district = document.getElementById('district-filter');
const tabs = document.querySelectorAll('.stage-tab');
const addBtn = document.getElementById('add-lead-btn');
const modal = document.getElementById('lead-modal');
const closeBtn = document.getElementById('modal-close');
const cancelBtn = document.getElementById('modal-cancel');
const form = document.getElementById('lead-form');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const darkToggle = document.getElementById('dark-mode-toggle');
const darkIcon = document.getElementById('dark-mode-icon');
const mobileToggle = document.getElementById('sidebar-toggle-mobile');
const desktopToggle = document.getElementById('sidebar-toggle-desktop');

// Render leads table
function renderLeads(filtered = leads) {
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-500 dark:text-gray-400"><i class="fas fa-users text-4xl mb-2"></i><p class="text-lg">No leads found</p><p class="text-sm mt-1">Try adjusting your filters</p></td></tr>`;
        return;
    }
    tbody.innerHTML = filtered.map(l => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="py-3 px-4"><div class="font-medium">${l.business}</div><div class="text-sm text-gray-500 dark:text-gray-400">${l.whatsapp || 'No phone'}</div></td>
            <td class="py-3 px-4">${l.owner}</td>
            <td class="py-3 px-4"><span class="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">${l.district}</span></td>
            <td class="py-3 px-4">${l.type}</td>
            <td class="py-3 px-4"><span class="px-3 py-1 text-xs rounded-full ${getStageClass(l.stage)}">${l.stage.charAt(0).toUpperCase() + l.stage.slice(1)}</span></td>
            <td class="py-3 px-4"><span class="px-3 py-1 text-xs rounded-full ${getStatusClass(l.status)}">${l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span></td>
            <td class="py-3 px-4">
                <button class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-3" onclick="openModal(${l.id})"><i class="fas fa-edit"></i></button>
                <button class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" onclick="deleteLead(${l.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function getStageClass(stage) {
    const cls = { new: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300', contacted: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', qualified: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', proposal: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200', closed: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' };
    return cls[stage] || cls.new;
}

function getStatusClass(status) {
    const cls = { active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', inactive: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', archived: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' };
    return cls[status] || cls.active;
}

// Modal functions
function openModal(id = null) {
    modal.classList.remove('hidden');
    if (id) {
        const l = leads.find(l => l.id === id);
        if (l) {
            document.getElementById('business').value = l.business;
            document.getElementById('owner').value = l.owner;
            document.getElementById('district').value = l.district;
            document.getElementById('type').value = l.type;
            document.getElementById('whatsapp').value = l.whatsapp;
            document.getElementById('email').value = l.email;
            document.getElementById('instagram').value = l.instagram;
            document.getElementById('followUp').value = l.followUp;
            document.getElementById('stage').value = l.stage;
            document.getElementById('status').value = l.status;
            document.getElementById('remark').value = l.remark;
            form.dataset.editId = id;
        }
    } else {
        form.reset();
        delete form.dataset.editId;
    }
}

function closeModal() {
    modal.classList.add('hidden');
}

// Delete lead
function deleteLead(id) {
    if (confirm('Are you sure you want to delete this lead?')) {
        leads = leads.filter(l => l.id !== id);
        renderLeads();
        showToast('Lead deleted successfully', 'success');
    }
}

// Filter leads
function filterLeads() {
    const term = search.value.toLowerCase();
    const dist = district.value;
    const activeTab = document.querySelector('.stage-tab.bg-white')?.dataset.stage || 'all';
    let filtered = leads.filter(l => {
        const matchesSearch = l.business.toLowerCase().includes(term) || l.owner.toLowerCase().includes(term) || l.type.toLowerCase().includes(term);
        const matchesDistrict = !dist || l.district === dist;
        const matchesStage = activeTab === 'all' || l.stage === activeTab;
        return matchesSearch && matchesDistrict && matchesStage;
    });
    renderLeads(filtered);
}

// Toast notification
function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded-lg shadow-lg flex items-center justify-between ${type === 'success' ? 'bg-green-500 text-white' : type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`;
    toast.innerHTML = `<span>${msg}</span><button class="ml-4" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Event listeners
search.addEventListener('input', filterLeads);
district.addEventListener('change', filterLeads);
tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('bg-white', 'dark:bg-gray-700', 'shadow'));
    tab.classList.add('bg-white', 'dark:bg-gray-700', 'shadow');
    filterLeads();
}));

addBtn.addEventListener('click', () => openModal());
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
form.addEventListener('submit', e => {
    e.preventDefault();
    const id = form.dataset.editId ? parseInt(form.dataset.editId) : leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
    const newLead = { id, business: document.getElementById('business').value, owner: document.getElementById('owner').value, district: document.getElementById('district').value, type: document.getElementById('type').value, whatsapp: document.getElementById('whatsapp').value, email: document.getElementById('email').value, instagram: document.getElementById('instagram').value, followUp: document.getElementById('followUp').value, stage: document.getElementById('stage').value, status: document.getElementById('status').value, remark: document.getElementById('remark').value };
    if (form.dataset.editId) {
        const idx = leads.findIndex(l => l.id === id);
        leads[idx] = newLead;
        showToast('Lead updated successfully', 'success');
    } else {
        leads.push(newLead);
        showToast('Lead added successfully', 'success');
    }
    closeModal();
    renderLeads();
});

// Dark mode toggle
darkToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    darkIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('darkMode', isDark);
});

// Sidebar toggle
mobileToggle.addEventListener('click', () => {
    sidebar.classList.remove('hidden');
    overlay.classList.remove('hidden');
});
desktopToggle.addEventListener('click', () => sidebar.classList.add('hidden'));
overlay.addEventListener('click', () => {
    sidebar.classList.add('hidden');
    overlay.classList.add('hidden');
});

// Initialize
renderLeads();
if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
    darkIcon.className = 'fas fa-sun';
}