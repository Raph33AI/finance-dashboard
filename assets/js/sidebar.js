/**
 * ===================================
 * SIDEBAR PREMIUM - GESTION COMPLÈTE
 * AlphaVault AI - Version Ultra-Moderne
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
        
        this.init();
    }
    
    init() {
        // Charger l'état sauvegardé
        this.loadState();
        
        // Événements toggle
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleCollapse());
        }
        
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => this.toggleMobile());
        }
        
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeMobile());
        }
        
        // Événements folders (accordéon)
        this.navFolders.forEach(folder => {
            folder.addEventListener('click', (e) => this.toggleFolder(e));
        });
        
        // Événements liens (active state)
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.setActiveLink(e));
        });
        
        // Gestion responsive
        window.addEventListener('resize', () => this.handleResize());
        
        // Fermeture sur ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar.classList.contains('mobile-open')) {
                this.closeMobile();
            }
        });
        
        console.log('✅ SidebarManager initialisé');
    }
    
    /**
     * Toggle collapse desktop
     */
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.sidebar.classList.toggle('collapsed');
        
        // Sauvegarder l'état
        localStorage.setItem('sidebar-collapsed', this.isCollapsed);
        
        // Animation smooth
        this.animateToggle();
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
    }
    
    /**
     * Fermer mobile (CORRECTION DU BUG)
     */
    closeMobile() {
        this.sidebar.classList.remove('mobile-open');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // ✅ CORRECTION : Fermer tous les sous-menus ouverts
        document.querySelectorAll('.nav-section.active').forEach(section => {
            section.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-folder.active').forEach(folder => {
            folder.classList.remove('active');
        });
    }
    
    /**
     * Toggle folder (accordéon)
     */
    toggleFolder(e) {
        const folder = e.currentTarget;
        const section = folder.closest('.nav-section');
        const isActive = section.classList.contains('active');
        
        // Mode accordéon : fermer les autres sections
        if (!this.isCollapsed) {
            document.querySelectorAll('.nav-section').forEach(s => {
                if (s !== section) {
                    s.classList.remove('active');
                    s.querySelector('.nav-folder')?.classList.remove('active');
                }
            });
        }
        
        // Toggle la section actuelle
        section.classList.toggle('active');
        folder.classList.toggle('active');
        
        // Animation
        this.animateFolder(section, !isActive);
    }
    
    /**
     * Définir le lien actif
     */
    setActiveLink(e) {
        // Retirer l'état actif de tous les liens
        this.navLinks.forEach(link => link.classList.remove('active'));
        
        // Ajouter l'état actif au lien cliqué
        e.currentTarget.classList.add('active');
        
        // Fermer mobile après clic
        if (this.isMobile) {
            setTimeout(() => this.closeMobile(), 300);
        }
    }
    
    /**
     * Animation toggle
     */
    animateToggle() {
        this.sidebar.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            this.sidebar.style.transition = '';
        }, 400);
    }
    
    /**
     * Animation folder
     */
    animateFolder(section, isOpening) {
        const submenu = section.querySelector('.nav-submenu');
        if (!submenu) return;
        
        if (isOpening) {
            // Calculer la hauteur réelle
            const height = submenu.scrollHeight;
            submenu.style.maxHeight = height + 'px';
        } else {
            submenu.style.maxHeight = '0';
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
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
                
                // Ouvrir le folder parent
                const section = link.closest('.nav-section');
                if (section) {
                    section.classList.add('active');
                    section.querySelector('.nav-folder')?.classList.add('active');
                }
            }
        });
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});