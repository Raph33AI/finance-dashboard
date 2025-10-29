// ===================================
// SIDEBAR NAVIGATION FUNCTIONALITY
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
});

function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileToggle = document.getElementById('mobileToggle');
    const navFolders = document.querySelectorAll('.nav-folder');
    
    // Toggle sidebar collapse (desktop)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }
    
    // Toggle sidebar mobile
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
            toggleOverlay();
        });
    }
    
    // Folder toggle functionality
    navFolders.forEach(folder => {
        folder.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.closest('.nav-section');
            const wasActive = section.classList.contains('active');
            
            // Close all sections
            document.querySelectorAll('.nav-section').forEach(s => {
                s.classList.remove('active');
                s.querySelector('.nav-folder').classList.remove('active');
            });
            
            // Open clicked section if it wasn't active
            if (!wasActive) {
                section.classList.add('active');
                this.classList.add('active');
            }
        });
    });
    
    // Set active page
    setActivePage();
    
    // Restore sidebar state
    restoreSidebarState();
    
    // Auto-open section containing active page
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
        const section = activeLink.closest('.nav-section');
        if (section) {
            section.classList.add('active');
            section.querySelector('.nav-folder').classList.add('active');
        }
    }
}

function setActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function restoreSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }
}

function toggleOverlay() {
    let overlay = document.querySelector('.sidebar-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', function() {
            document.getElementById('sidebar').classList.remove('mobile-open');
            this.classList.remove('active');
        });
    }
    
    overlay.classList.toggle('active');
}

// Update last update time
function updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        const now = new Date();
        const timeString = now.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        lastUpdateElement.textContent = `Dernière mise à jour: ${timeString}`;
    }
}

// Call on page load
updateLastUpdateTime();