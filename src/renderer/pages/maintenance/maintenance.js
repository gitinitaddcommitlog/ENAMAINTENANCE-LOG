// Load maintenance records immediately
console.log('Loading maintenance...');
loadMaintenance();

// Load all maintenance records
async function loadMaintenance() {
    try {
        const logs = await window.api.db.getLogs() || [];
        const vehicles = await window.api.db.getVehicles() || [];
        const mechanics = await window.api.db.getMechanics() || [];
        
        const tbody = document.getElementById('maintenanceList');
        if (!tbody) return;
        
        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading-row">No maintenance records found</td></tr>';
            return;
        }
        
        tbody.innerHTML = logs.map(log => {
            const vehicle = vehicles.find(v => v.id === log.vehicle_id);
            const mechanic = mechanics.find(m => m.id === log.mechanic_id);
            return `
                <tr>
                    <td>${log.service_date}</td>
                    <td><strong>${vehicle?.truck_name || 'Unknown'}</strong><br><small>${vehicle?.truck_number || ''}</small></td>
                    <td>${mechanic?.full_name || 'Unknown'}</td>
                    <td>${log.nature_of_fault || 'Routine'}</td>
                    <td>${log.part_name || '-'}</td>
                    <td><strong>GHS ${log.total_cost || 0}</strong></td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editMaintenance(${log.id})">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteMaintenance(${log.id})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (err) {
        console.error('Error loading maintenance:', err);
    }
}

// Show add modal
async function showAddMaintenanceModal() {
    // Load vehicles and mechanics into dropdowns
    try {
        const vehicles = await window.api.db.getVehicles() || [];
        const mechanics = await window.api.db.getMechanics() || [];
        
        const vehicleSelect = document.getElementById('vehicleId');
        const mechanicSelect = document.getElementById('mechanicId');
        
        vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>' + 
            vehicles.map(v => `<option value="${v.id}">${v.truck_name} - ${v.truck_number}</option>`).join('');
        
        mechanicSelect.innerHTML = '<option value="">Select Mechanic</option>' + 
            mechanics.map(m => `<option value="${m.id}">${m.full_name}</option>`).join('');
        
        // Set today's date as default
        document.getElementById('serviceDate').value = new Date().toISOString().split('T')[0];
        
        // Show modal
        document.getElementById('maintenanceModal').style.display = 'flex';
    } catch (err) {
        alert('Error loading data: ' + err.message);
    }
}

// Hide modal
function hideMaintenanceModal() {
    document.getElementById('maintenanceModal').style.display = 'none';
}

// Save maintenance record
async function saveMaintenance() {
    const data = {
        vehicle_id: document.getElementById('vehicleId').value,
        mechanic_id: document.getElementById('mechanicId').value,
        service_date: document.getElementById('serviceDate').value,
        nature_of_fault: document.getElementById('natureOfFault').value,
        part_name: document.getElementById('partName').value,
        item_cost: parseFloat(document.getElementById('itemCost').value) || 0,
        workmanship_cost: parseFloat(document.getElementById('workmanshipCost').value) || 0,
        remarks: document.getElementById('remarks').value,
        next_maintenance_date: document.getElementById('nextMaintenanceDate').value || null
    };
    
    // Validate
    if (!data.vehicle_id || !data.mechanic_id || !data.service_date || !data.nature_of_fault) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        await window.api.db.addLog(data);
        alert('Maintenance record added successfully!');
        hideMaintenanceModal();
        loadMaintenance(); // Refresh the list
    } catch (err) {
        alert('Error saving record: ' + err.message);
    }
}

// Edit maintenance (placeholder)
function editMaintenance(id) {
    alert('Edit maintenance ' + id + ' - coming soon');
}

// Delete maintenance (placeholder)
function deleteMaintenance(id) {
    if (confirm('Delete record ' + id + '?')) {
        alert('Delete feature coming soon');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('maintenanceModal');
    if (event.target === modal) {
        hideMaintenanceModal();
    }
};
