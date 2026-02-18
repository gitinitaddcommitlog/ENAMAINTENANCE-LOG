// Load vehicles immediately
console.log('vehicles.js loaded, calling loadVehicles...');
loadVehicles();

// Load all vehicles
async function loadVehicles() {
    console.log('Loading vehicles...');
    const tbody = document.getElementById('vehiclesList');
    
    if (!tbody) {
        console.error('vehiclesList not found');
        return;
    }
    
    try {
        const vehicles = await window.api.db.getVehicles();
        console.log('Vehicles received:', vehicles);
        
        if (!vehicles || vehicles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading-row">No vehicles found</td></tr>';
            return;
        }
        
        tbody.innerHTML = vehicles.map(v => `
            <tr>
                <td>${v.id}</td>
                <td><strong>${v.truck_name}</strong></td>
                <td>${v.truck_number}</td>
                <td>${v.model || '-'}</td>
                <td>${v.current_mileage?.toLocaleString() || 0} km</td>
                <td><span class="status-badge status-${v.status}">${v.status}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="editVehicle(${v.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteVehicle(${v.id})">Delete</button>
                </td>
            </tr>
        `).join('');
        
    } catch (err) {
        console.error('Error:', err);
        tbody.innerHTML = '<tr><td colspan="7" class="loading-row">Error loading vehicles</td></tr>';
    }
}

// Show add modal
function showAddModal() {
    alert('Add vehicle - coming soon');
}

// Hide modal
function hideModal() {
    const modal = document.getElementById('vehicleModal');
    if (modal) modal.style.display = 'none';
}

// Edit vehicle
function editVehicle(id) {
    alert('Edit vehicle ' + id + ' - coming soon');
}

// Delete vehicle
function deleteVehicle(id) {
    alert('Delete vehicle ' + id + ' - coming soon');
}
