// Initialize charts (only once)
if (typeof window.vehicleChart !== 'undefined') {
    if (window.vehicleChart) window.vehicleChart.destroy();
    if (window.monthlyChart) window.monthlyChart.destroy();
}

let vehicleChart = window.vehicleChart = null;
let monthlyChart = window.monthlyChart = null;

// Format currency with commas - ADD THIS RIGHT HERE
function formatMoney(amount) {
    return 'GHS ' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Load dashboard data immediately
console.log('Dashboard loading...');
loadDashboardData();

// Load all dashboard data
async function loadDashboardData() {
    try {
        // Clear existing content first
        const kpiElements = ['totalSpent', 'totalVehicles', 'totalJobs', 'avgCost'];
        kpiElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '0';
        });
        
        const vehicles = await window.api.db.getVehicles() || [];
        const logs = await window.api.db.getLogs() || [];
        
        console.log('Vehicles:', vehicles);
        console.log('Logs:', logs);
        
        // Calculate KPIs
        calculateKPIs(vehicles, logs);
        
        // Build vehicle summary
        buildVehicleSummary(vehicles, logs);
        
        // Build recent activity
        buildRecentActivity(logs);
        
        // Create charts
        createVehicleCostChart(vehicles, logs);
        createMonthlyCostChart(logs);
        
    } catch (err) {
        console.error('Error loading dashboard:', err);
    }
}

// Calculate KPI values
function calculateKPIs(vehicles, logs) {
    const totalSpent = logs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
    document.getElementById('totalSpent').textContent = formatMoney(totalSpent);
    document.getElementById('totalVehicles').textContent = vehicles.length;
    document.getElementById('totalJobs').textContent = logs.length;
    const avgCost = logs.length > 0 ? totalSpent / logs.length : 0;
    document.getElementById('avgCost').textContent = formatMoney(avgCost);
}
// Safe element update
function setElementText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// Build vehicle summary table
function buildVehicleSummary(vehicles, logs) {
    const tbody = document.getElementById('vehicleSummary');
    if (!tbody) return;
    
    let html = '';
    
    vehicles.forEach(vehicle => {
        const vehicleLogs = logs.filter(log => log.vehicle_id === vehicle.id);
        const totalJobs = vehicleLogs.length;
        const totalSpent = vehicleLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
        const lastService = vehicleLogs.length > 0 ? vehicleLogs[0].service_date : 'Never';
        
        html += `
            <tr>
                <td>${vehicle.truck_name}</td>
                <td>${vehicle.truck_number}</td>
                <td>${totalJobs}</td>
                <td>GHS ${totalSpent.toFixed(2)}</td>
                <td>${lastService}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="5">No vehicles found</td></tr>';
}

// Build recent activity
function buildRecentActivity(logs) {
    const tbody = document.getElementById('recentActivity');
    if (!tbody) return;
    
    if (!logs.length) {
        tbody.innerHTML = '<tr><td colspan="4">No records</td></tr>';
        return;
    }
    
    const recentLogs = logs.slice(0, 5);
    let html = '';
    
    recentLogs.forEach(log => {
        html += `
            <tr>
                <td>${log.service_date}</td>
                <td>Vehicle #${log.vehicle_id}</td>
                <td>${log.nature_of_fault || 'Routine'}</td>
                <td>GHS ${log.total_cost || 0}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Create vehicle cost chart
function createVehicleCostChart(vehicles, logs) {
    const ctx = document.getElementById('vehicleCostChart');
    if (!ctx) {
        console.error('vehicleCostChart canvas not found');
        return;
    }
    
    // Map vehicle IDs to names
    const vehicleMap = {};
    vehicles.forEach(v => { vehicleMap[v.id] = v.truck_name; });
    
    // Calculate cost per vehicle
    const vehicleCosts = {};
    vehicles.forEach(v => { vehicleCosts[v.truck_name] = 0; });
    
    logs.forEach(log => {
        const vehicleName = vehicleMap[log.vehicle_id];
        if (vehicleName) {
            vehicleCosts[vehicleName] += log.total_cost || 0;
        }
    });
    
    const labels = Object.keys(vehicleCosts);
    const data = Object.values(vehicleCosts);
    
    console.log('Vehicle chart data:', labels, data);
    
    // Destroy existing chart
    if (window.vehicleChart) window.vehicleChart.destroy();
    
    // Create new chart
    window.vehicleChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Maintenance Cost (GHS)',
                data: data,
                backgroundColor: ['#4a9eff', '#ff6b6b', '#4ecdc4', '#ffb347'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => 'GHS ' + value }
                }
            }
        }
    });
}

// Create monthly cost chart
function createMonthlyCostChart(logs) {
    const ctx = document.getElementById('monthlyCostChart');
    if (!ctx) {
        console.error('monthlyCostChart canvas not found');
        return;
    }
    
    // Group by month
    const monthlyData = {};
    
    logs.forEach(log => {
        const month = log.service_date.substring(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + (log.total_cost || 0);
    });
    
    // Sort months
    const sortedMonths = Object.keys(monthlyData).sort();
    const monthlyLabels = sortedMonths.map(m => {
        const [year, month] = m.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month)-1]} ${year}`;
    });
    const monthlyValues = sortedMonths.map(m => monthlyData[m]);
    
    console.log('Monthly chart data:', monthlyLabels, monthlyValues);
    
    // Destroy existing chart
    if (window.monthlyChart) window.monthlyChart.destroy();
    
    // Create new chart
    window.monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyLabels,
            datasets: [{
                label: 'Monthly Spend (GHS)',
                data: monthlyValues,
                borderColor: '#4a9eff',
                backgroundColor: 'rgba(74, 158, 255, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#4a9eff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => 'GHS ' + value }
                }
            }
        }
    });
}
