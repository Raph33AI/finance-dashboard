/**
 * ===================================
 * SIDEBAR PREMIUM - VERSION CORRIGÉE
 * AlphaVault AI - Performance Optimisée
 * ===================================
 */

class SidebarManager {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarToggle = document.querySelector('.sidebar-toggle');
        this.mobileToggle = document.querySelector('.mobile-toggle');
        this.overlay = document.querySelector('.sidebar-overlay');
        this.navFolders = document.querySelectorAll('.nav-folder');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.isMobile = window.innerWidth <= 1024;
        this.isCollapsed = false;
        
        // ✅ Debounce pour éviter les clics multiples
        this.debounceTimeout = null;
        
        this.init();
    }
    
    init() {
        if (!this.sidebar) {
            console.error('❌ Sidebar non trouvée');
            return;
        }
        
        // Charger l'état sauvegardé
        this.loadState();
        
        // ✅ Événements toggle avec debounce
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.debounce(() => this.toggleCollapse(), 100);
            });
        }
        
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.debounce(() => this.toggleMobile(), 100);
            });
        }
        
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeMobile();
            });
        }
        
        // ✅ Événements folders optimisés
        this.navFolders.forEach(folder => {
            folder.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.debounce(() => this.toggleFolder(folder), 50);
            });
        });
        
        // Événements liens
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.setActiveLink(link);
            });
        });
        
        // Gestion responsive
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 200);
        });
        
        // Fermeture sur ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar.classList.contains('mobile-open')) {
                this.closeMobile();
            }
        });
        
        console.log('✅ SidebarManager initialisé');
    }
    
    /**
     * ✅ Debounce pour éviter les clics multiples
     */
    debounce(func, delay) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(func, delay);
    }
    
    /**
     * ✅ Toggle collapse desktop - CORRIGÉ
     */
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.sidebar.classList.toggle('collapsed');
        
        // Sauvegarder l'état
        localStorage.setItem('sidebar-collapsed', this.isCollapsed);
        
        console.log('✅ Sidebar', this.isCollapsed ? 'collapsed' : 'expanded');
    }
    
    /**
     * Toggle mobile
     */
    toggleMobile() {
        const isOpen = this.sidebar.classList.contains('mobile-open');
        
        if (isOpen) {
            this.closeMobile();
        } else {
            this.openMobile();
        }
    }
    
    /**
     * Ouvrir mobile
     */
    openMobile() {
        this.sidebar.classList.add('mobile-open');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Sidebar mobile opened');
    }
    
    /**
     * ✅ Fermer mobile - CORRIGÉ
     */
    closeMobile() {
        this.sidebar.classList.remove('mobile-open');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Fermer tous les sous-menus
        document.querySelectorAll('.nav-section.active').forEach(section => {
            section.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-folder.active').forEach(folder => {
            folder.classList.remove('active');
        });
        
        console.log('✅ Sidebar mobile closed');
    }
    
    /**
     * ✅ Toggle folder - OPTIMISÉ
     */
    toggleFolder(folder) {
        const section = folder.closest('.nav-section');
        if (!section) return;
        
        const isActive = section.classList.contains('active');
        const submenu = section.querySelector('.nav-submenu');
        
        // Mode accordéon : fermer les autres sections
        if (!this.isCollapsed) {
            document.querySelectorAll('.nav-section').forEach(s => {
                if (s !== section) {
                    s.classList.remove('active');
                    const f = s.querySelector('.nav-folder');
                    if (f) f.classList.remove('active');
                    
                    // Fermer l'animation
                    const sub = s.querySelector('.nav-submenu');
                    if (sub) sub.style.maxHeight = '0';
                }
            });
        }
        
        // Toggle la section actuelle
        section.classList.toggle('active');
        folder.classList.toggle('active');
        
        // ✅ Animation optimisée
        if (submenu) {
            if (!isActive) {
                // Ouverture
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
            } else {
                // Fermeture
                submenu.style.maxHeight = '0';
            }
        }
        
        console.log('✅ Folder toggled:', folder.querySelector('span')?.textContent);
    }
    
    /**
     * Définir le lien actif
     */
    setActiveLink(link) {
        // Retirer l'état actif de tous les liens
        this.navLinks.forEach(l => l.classList.remove('active'));
        
        // Ajouter l'état actif au lien cliqué
        link.classList.add('active');
        
        // Fermer mobile après clic
        if (this.isMobile) {
            setTimeout(() => this.closeMobile(), 250);
        }
    }
    
    /**
     * Gestion responsive
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 1024;
        
        // Passage desktop -> mobile
        if (!wasMobile && this.isMobile) {
            this.closeMobile();
            this.sidebar.classList.remove('collapsed');
        }
        
        // Passage mobile -> desktop
        if (wasMobile && !this.isMobile) {
            this.closeMobile();
            if (this.isCollapsed) {
                this.sidebar.classList.add('collapsed');
            }
        }
    }
    
    /**
     * Charger l'état sauvegardé
     */
    loadState() {
        const savedCollapsed = localStorage.getItem('sidebar-collapsed');
        
        if (savedCollapsed === 'true' && !this.isMobile) {
            this.isCollapsed = true;
            this.sidebar.classList.add('collapsed');
        }
        
        // Activer le lien de la page actuelle
        const currentPath = window.location.pathname;
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.replace('.html', ''))) {
                link.classList.add('active');
                
                // Ouvrir le folder parent
                const section = link.closest('.nav-section');
                if (section) {
                    section.classList.add('active');
                    const folder = section.querySelector('.nav-folder');
                    if (folder) folder.classList.add('active');
                    
                    // Animation initiale
                    const submenu = section.querySelector('.nav-submenu');
                    if (submenu) {
                        submenu.style.maxHeight = submenu.scrollHeight + 'px';
                    }
                }
            }
        });
    }
}

// ✅ Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});