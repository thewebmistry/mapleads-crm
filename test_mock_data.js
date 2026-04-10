// Test the generateMockLeads function from analytics.html
function generateMockLeads() {
    const mockLeads = [];
    const districts = [
        { name: 'Ranchi', count: 45 },
        { name: 'Lohardaga', count: 28 },
        { name: 'Gumla', count: 18 },
        { name: 'Simdega', count: 12 }
    ];
    
    // Stage distribution exactly as specified
    const stagePool = [];
    for (let i = 0; i < 30; i++) stagePool.push('new');
    for (let i = 0; i < 22; i++) stagePool.push('contacted');
    for (let i = 0; i < 15; i++) stagePool.push('replied');
    for (let i = 0; i < 9; i++) stagePool.push('demo_sent');
    for (let i = 0; i < 6; i++) stagePool.push('closed');
    
    // Source distribution exactly as specified
    const sourcePool = [];
    for (let i = 0; i < 45; i++) sourcePool.push('Google Maps');
    for (let i = 0; i < 20; i++) sourcePool.push('WhatsApp');
    for (let i = 0; i < 18; i++) sourcePool.push('Instagram');
    for (let i = 0; i < 10; i++) sourcePool.push('Website');
    for (let i = 0; i < 7; i++) sourcePool.push('Referral');
    
    // Shuffle arrays to randomize assignment
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    const shuffledStages = shuffleArray([...stagePool]);
    const shuffledSources = shuffleArray([...sourcePool]);
    
    // Create leads based on district distribution (total 103 leads)
    let leadId = 1;
    let stageIndex = 0;
    let sourceIndex = 0;
    
    districts.forEach(district => {
        for (let i = 0; i < district.count; i++) {
            const stage = shuffledStages[stageIndex % shuffledStages.length];
            const source = shuffledSources[sourceIndex % shuffledSources.length];
            
            // Generate appropriate budget for closed leads
            let budget = 0;
            if (stage === 'closed') {
                // Use revenue data pattern: 12000, 18000, 25000, 30000, 22000, 40000
                const closedBudgets = [12000, 18000, 25000, 30000, 22000, 40000];
                budget = closedBudgets[Math.min(mockLeads.filter(l => l.stage === 'closed').length, closedBudgets.length - 1)];
            }
            
            mockLeads.push({
                id: leadId++,
                name: `Lead ${leadId}`,
                district: district.name,
                stage: stage,
                source: source,
                budget: budget,
                created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
            
            stageIndex++;
            sourceIndex++;
        }
    });

    return mockLeads;
}

// Run test
const mockLeads = generateMockLeads();
console.log(`Total leads generated: ${mockLeads.length}`);

// Count by district
const districtCounts = {};
mockLeads.forEach(lead => {
    districtCounts[lead.district] = (districtCounts[lead.district] || 0) + 1;
});
console.log('District counts:', districtCounts);

// Count by stage
const stageCounts = {};
mockLeads.forEach(lead => {
    stageCounts[lead.stage] = (stageCounts[lead.stage] || 0) + 1;
});
console.log('Stage counts:', stageCounts);

// Count by source
const sourceCounts = {};
mockLeads.forEach(lead => {
    sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
});
console.log('Source counts:', sourceCounts);

// Calculate KPI metrics
const totalLeads = mockLeads.length;
const closedLeads = mockLeads.filter(lead => lead.stage === 'closed');
const conversionRate = totalLeads > 0 ? Math.round((closedLeads.length / totalLeads) * 100) : 0;
const estimatedRevenue = closedLeads.reduce((sum, lead) => sum + (parseFloat(lead.budget) || 0), 0);
const activeLeads = mockLeads.filter(lead => !['closed', 'archived'].includes(lead.stage)).length;

console.log('\nKPI Metrics:');
console.log(`Total leads: ${totalLeads}`);
console.log(`Closed leads: ${closedLeads.length}`);
console.log(`Conversion rate: ${conversionRate}%`);
console.log(`Estimated revenue: ₹${estimatedRevenue}`);
console.log(`Active leads: ${activeLeads}`);