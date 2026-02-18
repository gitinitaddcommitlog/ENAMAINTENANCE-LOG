// Format currency with commas
function formatMoney(amount) {
    return 'GHS ' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Load vehicles and months when page loads
console.log('Reports page loaded');
loadVehiclesForSelect();
loadMonthsForSelect();

// Load vehicles into dropdown
async function loadVehiclesForSelect() {
    try {
        const vehicles = await window.api.db.getVehicles() || [];
        const select = document.getElementById('vehicleSelect');
        select.innerHTML = '<option value="">-- Select Vehicle --</option>' +
            vehicles.map(v => `<option value="${v.id}">${v.truck_name} - ${v.truck_number}</option>`).join('');
    } catch (err) {
        console.error('Error loading vehicles:', err);
    }
}

// Load available months into dropdown
async function loadMonthsForSelect() {
    try {
        const logs = await window.api.db.getLogs() || [];
        const months = [...new Set(logs.map(log => log.service_date.substring(0, 7)))].sort().reverse();
        
        const select = document.getElementById('monthSelect');
        select.innerHTML = '<option value="">-- Select Month --</option>' +
            months.map(m => {
                const [year, month] = m.split('-');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `<option value="${m}">${monthNames[parseInt(month)-1]} ${year}</option>`;
            }).join('');
    } catch (err) {
        console.error('Error loading months:', err);
    }
}

// Generate vehicle history report with itemized services
async function generateVehicleReport() {
    const vehicleId = document.getElementById('vehicleSelect').value;
    if (!vehicleId) {
        alert('Please select a vehicle');
        return;
    }
    
    try {
        const vehicles = await window.api.db.getVehicles() || [];
        const mechanics = await window.api.db.getMechanics() || [];
        const allLogs = await window.api.db.getLogs() || [];
        
        const vehicle = vehicles.find(v => v.id == vehicleId);
        const vehicleLogs = allLogs.filter(log => log.vehicle_id == vehicleId).sort((a,b) => 
            new Date(b.service_date) - new Date(a.service_date));
        
        if (vehicleLogs.length === 0) {
            alert('No maintenance records for this vehicle');
            return;
        }
        
        // Calculate totals
        const totalSpent = vehicleLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
        const avgCost = totalSpent / vehicleLogs.length;
        
        // Build report title
        document.getElementById('reportTitle').innerHTML = `<i class="fas fa-truck"></i> ${vehicle.truck_name} - ${vehicle.truck_number} - Maintenance History`;
        
        // Build report table with itemized services
        let tableHtml = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Mechanic</th>
                        <th>Service</th>
                        <th>Parts</th>
                        <th>Parts Cost</th>
                        <th>Labor</th>
                        <th>Total</th>
                        <th>Next Due</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        vehicleLogs.forEach(log => {
            const mechanic = mechanics.find(m => m.id == log.mechanic_id);
            
            // Itemized services based on vehicle and date
            if (vehicle.truck_name === 'VOLVO' && log.service_date === '2025-08-20') {
                // VOLVO axle conversion - itemized
                const items = [
                    { service: 'Double axles (parts)', parts: 'Axle kit', partsCost: 100000, labor: 0 },
                    { service: 'Oil and filter change', parts: 'Oil filter', partsCost: 2000, labor: 0 },
                    { service: 'Removal & replacement labor', parts: '-', partsCost: 0, labor: 2000 },
                    { service: 'Delivery of axle', parts: '-', partsCost: 0, labor: 1500 }
                ];
                
                items.forEach((item, index) => {
                    const isFirst = index === 0;
                    tableHtml += `
                        <tr>
                            <td>${isFirst ? log.service_date : ''}</td>
                            <td>${isFirst ? (mechanic?.full_name || 'RAZAK') : ''}</td>
                            <td>${item.service}</td>
                            <td>${item.parts}</td>
                            <td>${item.partsCost > 0 ? formatMoney(item.partsCost) : '-'}</td>
                            <td>${item.labor > 0 ? formatMoney(item.labor) : '-'}</td>
                            <td>${isFirst ? formatMoney(log.total_cost || 0) : ''}</td>
                            <td>${isFirst ? (log.next_maintenance_date || 'Not set') : ''}</td>
                        </tr>
                    `;
                });
            } 
            else if (vehicle.truck_name === 'DAV1' && log.service_date === '2025-09-23') {
                // DAV1 major service - itemized
                const items = [
                    { service: 'Air brake booster', parts: 'Booster', cost: 1200 },
                    { service: 'Gear box top', parts: 'Upper cover', cost: 2000 },
                    { service: 'Welded cab side step', parts: 'Step repair', cost: 500 },
                    { service: 'Front pair tires', parts: '2 tires', cost: 7000 },
                    { service: 'Oil and filter change', parts: 'Oil filter', cost: 2000 }
                ];
                
                items.forEach((item, index) => {
                    const isFirst = index === 0;
                    tableHtml += `
                        <tr>
                            <td>${isFirst ? log.service_date : ''}</td>
                            <td>${isFirst ? (mechanic?.full_name || 'DANIEL') : ''}</td>
                            <td>${item.service}</td>
                            <td>${item.parts}</td>
                            <td>${formatMoney(item.cost)}</td>
                            <td>-</td>
                            <td>${isFirst ? formatMoney(log.total_cost || 0) : ''}</td>
                            <td>${isFirst ? (log.next_maintenance_date || 'Not set') : ''}</td>
                        </tr>
                    `;
                });
            }
            else {
                // Simple row for routine services
                tableHtml += `
                    <tr>
                        <td>${log.service_date}</td>
                        <td>${mechanic?.full_name || 'Unknown'}</td>
                        <td>${log.nature_of_fault || 'Routine'}</td>
                        <td>${log.part_name || '-'}</td>
                        <td>${formatMoney(log.item_cost || 0)}</td>
                        <td>${formatMoney(log.workmanship_cost || 0)}</td>
                        <td><strong>${formatMoney(log.total_cost || 0)}</strong></td>
                        <td>${log.next_maintenance_date || 'Not set'}</td>
                    </tr>
                `;
            }
        });
        
        tableHtml += '</tbody></table>';
        
        // Update display
        document.getElementById('reportTable').innerHTML = tableHtml;
        document.getElementById('reportTotal').textContent = formatMoney(totalSpent);
        document.getElementById('reportCount').textContent = vehicleLogs.length;
        document.getElementById('reportAvg').textContent = formatMoney(avgCost);
        
        document.getElementById('reportDisplay').style.display = 'block';
        document.getElementById('summaryCards').style.display = 'grid';
        
    } catch (err) {
        console.error('Error generating report:', err);
        alert('Error generating report');
    }
}

// Generate monthly cost report
async function generateMonthlyReport() {
    const month = document.getElementById('monthSelect').value;
    if (!month) {
        alert('Please select a month');
        return;
    }
    
    try {
        const vehicles = await window.api.db.getVehicles() || [];
        const mechanics = await window.api.db.getMechanics() || [];
        const allLogs = await window.api.db.getLogs() || [];
        
        const monthlyLogs = allLogs.filter(log => log.service_date.startsWith(month)).sort((a,b) => 
            new Date(b.service_date) - new Date(a.service_date));
        
        if (monthlyLogs.length === 0) {
            alert('No maintenance records for this month');
            return;
        }
        
        // Calculate totals
        const totalSpent = monthlyLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
        const avgCost = totalSpent / monthlyLogs.length;
        
        // Format month for display
        const [year, monthNum] = month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = `${monthNames[parseInt(monthNum)-1]} ${year}`;
        
        // Build report title
        document.getElementById('reportTitle').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName} - Maintenance Cost Report`;
        
        // Build report table
        let tableHtml = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Vehicle</th>
                        <th>Mechanic</th>
                        <th>Services</th>
                        <th>Parts Cost</th>
                        <th>Labor Cost</th>
                        <th>Total Cost</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        monthlyLogs.forEach(log => {
            const vehicle = vehicles.find(v => v.id == log.vehicle_id);
            const mechanic = mechanics.find(m => m.id == log.mechanic_id);
            
            // Add service details
            let services = log.nature_of_fault || 'Routine';
            if (vehicle?.truck_name === 'VOLVO' && log.service_date === '2025-08-20') {
                services = 'Axles, Oil change, Labor, Delivery';
            } else if (vehicle?.truck_name === 'DAV1' && log.service_date === '2025-09-23') {
                services = 'Booster, Gearbox, Step, Tires, Oil';
            }
            
            tableHtml += `
                <tr>
                    <td>${log.service_date}</td>
                    <td><strong>${vehicle?.truck_name || 'Unknown'}</strong><br><small>${vehicle?.truck_number || ''}</small></td>
                    <td>${mechanic?.full_name || 'Unknown'}</td>
                    <td>${services}</td>
                    <td>${formatMoney(log.item_cost || 0)}</td>
                    <td>${formatMoney(log.workmanship_cost || 0)}</td>
                    <td><strong>${formatMoney(log.total_cost || 0)}</strong></td>
                </tr>
            `;
        });
        
        // Add total row
        tableHtml += `
            <tr style="background: #f0f7ff; font-weight: bold;">
                <td colspan="4" style="text-align: right;">TOTAL:</td>
                <td>${formatMoney(monthlyLogs.reduce((sum, log) => sum + (log.item_cost || 0), 0))}</td>
                <td>${formatMoney(monthlyLogs.reduce((sum, log) => sum + (log.workmanship_cost || 0), 0))}</td>
                <td>${formatMoney(totalSpent)}</td>
            </tr>
        `;
        
        tableHtml += '</tbody></table>';
        
        // Update display
        document.getElementById('reportTable').innerHTML = tableHtml;
        document.getElementById('reportTotal').textContent = formatMoney(totalSpent);
        document.getElementById('reportCount').textContent = monthlyLogs.length;
        document.getElementById('reportAvg').textContent = formatMoney(avgCost);
        
        document.getElementById('reportDisplay').style.display = 'block';
        document.getElementById('summaryCards').style.display = 'grid';
        
    } catch (err) {
        console.error('Error generating report:', err);
        alert('Error generating report');
    }
}

// Export to Excel
function exportToExcel() {
    const table = document.querySelector('#reportTable table');
    if (!table) {
        alert('No report to export');
        return;
    }
    
    // Convert table to CSV
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        cols.forEach(col => {
            let text = col.innerText.trim();
            // Handle GHS currency formatting
            text = text.replace(/GHS/g, '').trim();
            rowData.push('"' + text.replace(/"/g, '""') + '"');
        });
        csv.push(rowData.join(','));
    });
    
    // Create download link
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Export to PDF (print)
function exportToPDF() {
    window.print();
}

// Add CSS for report selects
const style = document.createElement('style');
style.textContent = `
    .report-select {
        padding: 8px;
        border: 1px solid #dde;
        border-radius: 5px;
        font-size: 14px;
        background: white;
    }
    .report-select:focus {
        outline: none;
        border-color: #4a9eff;
    }
    
    @media print {
        .sidebar, .top-bar, .page-header, .add-btn, .export-btn, .report-select {
            display: none !important;
        }
        .main-content {
            margin: 0;
            padding: 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th {
            background: #f0f0f0 !important;
            color: black !important;
        }
    }
`;
document.head.appendChild(style);

