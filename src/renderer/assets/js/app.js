let currentPage = 'dashboard';

async function loadPage(pageName) {
    const contentArea = document.getElementById('content-area');
    const pageTitle = document.getElementById('page-title');
    
    pageTitle.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    contentArea.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const response = await fetch(`./pages/${pageName}/${pageName}.html`);
        if (response.ok) {
            const html = await response.text();
            contentArea.innerHTML = html;
            
            // Remove any existing script for this page
            const existingScript = document.querySelector(`script[data-page="${pageName}"]`);
            if (existingScript) {
                existingScript.remove();
            }
            
            // Load page-specific script with data attribute
            const script = document.createElement('script');
            script.src = `./pages/${pageName}/${pageName}.js`;
            script.dataset.page = pageName;
            script.onload = function() {
                // Call the page's load function if it exists
                if (pageName === 'dashboard' && typeof loadDashboardData === 'function') {
                    console.log('Reloading dashboard data...');
                    loadDashboardData();
                } else if (pageName === 'vehicles' && typeof loadVehicles === 'function') {
                    loadVehicles();
                } else if (pageName === 'maintenance' && typeof loadMaintenance === 'function') {
                    loadMaintenance();
                } else if (pageName === 'mechanics' && typeof loadMechanics === 'function') {
                    loadMechanics();
                }
            };
            document.body.appendChild(script);
        } else {
            contentArea.innerHTML = `<div class="error">Page not found: ${pageName}</div>`;
        }
    } catch (error) {
        contentArea.innerHTML = `<div class="error">Error loading page: ${error.message}</div>`;
        console.error('Load error:', error);
    }
}

// Navigation handler
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-menu li').forEach(li => li.classList.remove('active'));
        link.parentElement.classList.add('active');
        loadPage(link.dataset.page);
    });
});

// Initial load
loadPage('dashboard');