/**
 * ===================================
 * SIDEBAR PREMIUM - VERSION MOBILE ADAPTIVE
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
        
        this.isMobile = window.innerWidth <= 768; // ✅ 768px pour mobile
        this.isCollapsed = false;
        
        // ✅ Référence au bouton de fermeture mobile (créé dynamiquement)
        this.mobileCloseBtn = null;
        
        // Debounce pour éviter les clics multiples
        this.debounceTimeout = null;
        
        this.init();
    }
    
    init() {
        if (!this.sidebar) {
            console.error('❌ Sidebar non trouvée');
            return;
        }
        
        // ✅ Créer le bouton de fermeture mobile dynamiquement
        this.createMobileCloseButton();
        
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
                
                // 📱 Auto-fermeture sur mobile
                if (this.isMobile) {
                    setTimeout(() => this.closeMobile(), 200);
                }
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
        
        // ✅ Swipe pour fermer (mobile)
        this.initSwipeGesture();
        
        console.log('✅ SidebarManager initialisé (Mobile:', this.isMobile, ')');
    }
    
    /**
     * ✅ Créer le bouton de fermeture mobile dynamiquement
     */
    createMobileCloseButton() {
        // Vérifier si le bouton existe déjà
        if (document.querySelector('.sidebar-close-mobile')) {
            this.mobileCloseBtn = document.querySelector('.sidebar-close-mobile');
        } else {
            // Créer le bouton
            this.mobileCloseBtn = document.createElement('button');
            this.mobileCloseBtn.className = 'sidebar-close-mobile';
            this.mobileCloseBtn.setAttribute('aria-label', 'Close Sidebar');
            this.mobileCloseBtn.innerHTML = '<i class="fas fa-times"></i>';
            
            // Insérer au début de la sidebar
            this.sidebar.insertBefore(this.mobileCloseBtn, this.sidebar.firstChild);
            
            console.log('✅ Bouton de fermeture mobile créé');
        }
        
        // Ajouter l'événement de clic
        this.mobileCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeMobile();
            console.log('✅ Fermeture via bouton mobile');
        });
        
        // ✅ Masquer sur desktop dès le départ
        if (!this.isMobile) {
            this.mobileCloseBtn.style.display = 'none';
        }
    }
    
    /**
     * ✅ Debounce pour éviter les clics multiples
     */
    debounce(func, delay) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(func, delay);
    }
    
    /**
     * ✅ Toggle collapse desktop
     */
    toggleCollapse() {
        if (this.isMobile) return; // Désactivé sur mobile
        
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
        
        // ✅ Afficher le bouton de fermeture
        if (this.mobileCloseBtn) {
            this.mobileCloseBtn.style.display = 'flex';
        }
        
        console.log('✅ Sidebar mobile opened');
    }
    
    /**
     * ✅ Fermer mobile
     */
    closeMobile() {
        this.sidebar.classList.remove('mobile-open');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // ✅ Masquer le bouton de fermeture
        if (this.mobileCloseBtn) {
            this.mobileCloseBtn.style.display = 'none';
        }
        
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
     * ✅ Toggle folder
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
                    
                    const sub = s.querySelector('.nav-submenu');
                    if (sub) sub.style.maxHeight = '0';
                }
            });
        }
        
        // Toggle la section actuelle
        section.classList.toggle('active');
        folder.classList.toggle('active');
        
        // Animation
        if (submenu) {
            if (!isActive) {
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
            } else {
                submenu.style.maxHeight = '0';
            }
        }
    }
    
    /**
     * Définir le lien actif
     */
    setActiveLink(link) {
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    }
    
    /**
     * Gestion responsive
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        // Passage desktop -> mobile
        if (!wasMobile && this.isMobile) {
            this.closeMobile();
            this.sidebar.classList.remove('collapsed');
            
            // Afficher le bouton si besoin
            if (this.mobileCloseBtn) {
                this.mobileCloseBtn.style.display = 'none';
            }
        }
        
        // Passage mobile -> desktop
        if (wasMobile && !this.isMobile) {
            this.closeMobile();
            
            // ✅ Masquer le bouton de fermeture sur desktop
            if (this.mobileCloseBtn) {
                this.mobileCloseBtn.style.display = 'none';
            }
            
            if (this.isCollapsed) {
                this.sidebar.classList.add('collapsed');
            }
        }
    }
    
    /**
     * 📱 Initialiser le swipe pour fermer
     */
    initSwipeGesture() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.sidebar.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.sidebar.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
    }
    
    /**
     * 📱 Gérer le swipe
     */
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (diff > swipeThreshold && this.sidebar.classList.contains('mobile-open')) {
            this.closeMobile();
        }
    }
    
    /**
     * ✅ Charger l'état sauvegardé
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
                
                const section = link.closest('.nav-section');
                if (section) {
                    section.classList.add('active');
                    const folder = section.querySelector('.nav-folder');
                    if (folder) folder.classList.add('active');
                    
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