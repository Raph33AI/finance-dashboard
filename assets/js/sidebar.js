/* ===================================
   SIDEBAR NAVIGATION FUNCTIONALITY
   Version optimisée ES6+ 2024
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    initializeSidebar();
});

/**
 * Initialise toutes les fonctionnalités de la sidebar
 */
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileToggle = document.getElementById('mobileToggle');
    const navFolders = document.querySelectorAll('.nav-folder');
    
    if (!sidebar) {
        console.warn('Sidebar element not found');
        return;
    }
    
    // Toggle sidebar collapse (desktop)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
            
            // Annoncer le changement pour l'accessibilité
            sidebarToggle.setAttribute('aria-expanded', !isCollapsed);
        });
    }
    
    // Toggle sidebar mobile
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            const isOpen = sidebar.classList.contains('mobile-open');
            toggleOverlay();
            
            // Accessibility
            mobileToggle.setAttribute('aria-expanded', isOpen);
            
            // Piéger le focus dans la sidebar si ouverte
            if (isOpen) {
                trapFocusInSidebar(sidebar);
            }
        });
    }
    
    // Folder toggle functionality avec meilleure gestion
    navFolders.forEach(folder => {
        folder.addEventListener('click', (e) => {
            e.preventDefault();
            handleFolderToggle(folder);
        });
        
        // Support clavier
        folder.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleFolderToggle(folder);
            }
        });
    });
    
    // Set active page
    setActivePage();
    
    // Restore sidebar state OU collapse par défaut
    restoreSidebarState(sidebar);
    
    // Auto-open section containing active page
    autoOpenActiveSection();
    
    // Handle window resize
    handleWindowResize(sidebar);
    
    // Close sidebar on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
            if (mobileToggle) {
                mobileToggle.focus();
            }
        }
    });
}

/**
 * Gère le toggle d'un folder
 * @param {HTMLElement} folder - L'élément folder
 */
function handleFolderToggle(folder) {
    const section = folder.closest('.nav-section');
    if (!section) return;
    
    const wasActive = section.classList.contains('active');
    
    // Close all sections
    document.querySelectorAll('.nav-section').forEach(s => {
        s.classList.remove('active');
        const folderBtn = s.querySelector('.nav-folder');
        if (folderBtn) {
            folderBtn.classList.remove('active');
            folderBtn.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Open clicked section if it wasn't active
    if (!wasActive) {
        section.classList.add('active');
        folder.classList.add('active');
        folder.setAttribute('aria-expanded', 'true');
    }
}

/**
 * Définit la page active dans la navigation
 */
function setActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

/**
 * Restaure l'état de la sidebar depuis localStorage
 * @param {HTMLElement} sidebar - L'élément sidebar
 */
function restoreSidebarState(sidebar) {
    const isCollapsed = localStorage.getItem('sidebarCollapsed');
    
    // Si aucune préférence sauvegardée, collapse par défaut
    if (isCollapsed === null) {
        sidebar.classList.add('collapsed');
        localStorage.setItem('sidebarCollapsed', 'true');
    } else if (isCollapsed === 'true') {
        sidebar.classList.add('collapsed');
    }
    
    // Update ARIA
    const toggle = document.getElementById('sidebarToggle');
    if (toggle) {
        toggle.setAttribute('aria-expanded', isCollapsed !== 'true');
    }
}

/**
 * Ouvre automatiquement la section contenant la page active
 */
function autoOpenActiveSection() {
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
        const section = activeLink.closest('.nav-section');
        if (section) {
            section.classList.add('active');
            const folder = section.querySelector('.nav-folder');
            if (folder) {
                folder.classList.add('active');
                folder.setAttribute('aria-expanded', 'true');
            }
        }
    }
}

/**
 * Gère le redimensionnement de la fenêtre
 * @param {HTMLElement} sidebar - L'élément sidebar
 */
function handleWindowResize(sidebar) {
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const isMobile = window.innerWidth <= 1024;
            
            if (!isMobile && sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                }
            }
        }, 250);
    });
}

/**
 * Toggle l'overlay pour mobile
 */
function toggleOverlay() {
    let overlay = document.querySelector('.sidebar-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('mobile-open');
            }
            overlay.classList.remove('active');
            
            // Remettre le focus sur le toggle
            const mobileToggle = document.getElementById('mobileToggle');
            if (mobileToggle) {
                mobileToggle.focus();
            }
        });
    }
    
    overlay.classList.toggle('active');
}

/**
 * Piège le focus dans la sidebar (accessibilité mobile)
 * @param {HTMLElement} sidebar - L'élément sidebar
 */
function trapFocusInSidebar(sidebar) {
    const focusableElements = sidebar.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    // Focus sur le premier élément
    setTimeout(() => firstFocusable.focus(), 100);
    
    const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    };
    
    sidebar.addEventListener('keydown', handleTabKey);
    
    // Nettoyer l'event listener quand la sidebar se ferme
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isClosed = !sidebar.classList.contains('mobile-open');
                if (isClosed) {
                    sidebar.removeEventListener('keydown', handleTabKey);
                    observer.disconnect();
                }
            }
        });
    });
    
    observer.observe(sidebar, { attributes: true });
}

/**
 * Met à jour l'heure de dernière mise à jour
 */
function updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (!lastUpdateElement) return;
    
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

// Call on page load
updateLastUpdateTime();

// Update every minute
setInterval(updateLastUpdateTime, 60000);

// Export pour utilisation globale
window.SidebarManager = {
    toggleOverlay,
    updateLastUpdateTime,
    setActivePage
};

/* ===================================
   USER PROFILE SECTION
   Gestion de l'affichage du profil utilisateur
   =================================== */

/**
 * Initialise la section profil utilisateur
 */
function initializeUserProfile() {
    const userProfileBtn = document.getElementById('userProfileBtn');
    
    if (!userProfileBtn) {
        console.warn('User profile button not found');
        return;
    }

    // Écouter les clics sur le bouton profil
    userProfileBtn.addEventListener('click', handleProfileClick);

    // Écouter les changements d'authentification
    if (window.authManager) {
        window.authManager.addListener(handleAuthChange);
        
        // Mettre à jour l'affichage initial
        updateUserDisplay();
    } else {
        console.error('AuthManager not found. Please include auth-manager.js before sidebar.js');
    }
}

/**
 * Gère le clic sur le bouton profil
 */
function handleProfileClick() {
    const isAuthenticated = window.authManager && window.authManager.isAuthenticated();
    
    if (isAuthenticated) {
        // Rediriger vers la page de profil
        window.location.href = 'profile.html';
    } else {
        // Rediriger vers la page de connexion
        window.location.href = 'auth.html';
    }
}

/**
 * Gère les changements d'état d'authentification
 * @param {string} event - Type d'événement
 * @param {Object} data - Données associées
 */
function handleAuthChange(event, data) {
    console.log('Auth event:', event, data);
    updateUserDisplay();
}

/**
 * Met à jour l'affichage du profil utilisateur
 */
function updateUserDisplay() {
    const userProfileBtn = document.getElementById('userProfileBtn');
    if (!userProfileBtn) return;

    const isAuthenticated = window.authManager && window.authManager.isAuthenticated();
    const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;

    if (isAuthenticated && currentUser) {
        // Utilisateur connecté
        userProfileBtn.classList.add('logged-in');
        
        const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
        const initials = `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
        
        userProfileBtn.innerHTML = `
            ${currentUser.avatar 
                ? `<img src="${currentUser.avatar}" alt="${fullName}" class="user-avatar">` 
                : `<i class="fas fa-user-circle"></i>`
            }
            <div class="user-details">
                <span class="user-name">${fullName}</span>
                <span class="user-status">● Connecté</span>
            </div>
            <i class="fas fa-chevron-right arrow-icon"></i>
        `;
        
        userProfileBtn.setAttribute('aria-label', `Profil de ${fullName}`);
    } else {
        // Utilisateur non connecté
        userProfileBtn.classList.remove('logged-in');
        
        userProfileBtn.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <div class="user-details">
                <span class="user-name">Connexion</span>
                <span class="user-status">Cliquez pour vous connecter</span>
            </div>
            <i class="fas fa-chevron-right arrow-icon"></i>
        `;
        
        userProfileBtn.setAttribute('aria-label', 'Se connecter');
    }
}

// Initialiser le profil utilisateur au chargement
document.addEventListener('DOMContentLoaded', () => {
    initializeUserProfile();
});

// Mettre à jour lors du retour sur la page
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        updateUserDisplay();
    }
});

// Export pour utilisation globale
window.UserProfileManager = {
    updateUserDisplay,
    handleProfileClick
};