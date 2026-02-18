// Load mechanics immediately
console.log('Loading mechanics...');
loadMechanics();

async function loadMechanics() {
    try {
        const mechanics = await window.api.db.getMechanics() || [];
        const tbody = document.getElementById('mechanicsList');
        
        if (!tbody) return;
        
        if (mechanics.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="loading-row">No mechanics found</td></tr>';
            return;
        }
        
        tbody.innerHTML = mechanics.map(m => `
            <tr>
                <td>${m.id}</td>
                <td><strong>${m.full_name}</strong></td>
                <td>${m.phone || '-'}</td>
                <td><span class="status-badge status-${m.is_active ? 'active' : 'inactive'}">${m.is_active ? 'Active' : 'Inactive'}</span></td>
            </tr>
        `).join('');
        
    } catch (err) {
        console.error('Error loading mechanics:', err);
    }
}
