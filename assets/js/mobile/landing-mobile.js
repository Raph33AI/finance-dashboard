/* ═══════════════════════════════════════════════════════════
   📱 LANDING MOBILE JS - ALPHAVAULT AI
   Gestion complète de la navigation mobile
   
   ✅ Menu hamburger plein écran
   ✅ Menu profil bottom sheet
   ✅ Blocage scroll
   ✅ Overlays cliquables
   ═══════════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
    console.log('%c📱 LANDING MOBILE JS - Initialisation', 'color: #3B82F6; font-weight: bold; font-size: 16px;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
    
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       🔧 UTILITAIRES
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    
    const isMobile = () => window.innerWidth <= 768;
    
    const blockScroll = () => {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('menu-open');
        console.log('🔒 Scroll bloqué');
    };
    
    const unblockScroll = () => {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
        console.log('🔓 Scroll débloqué');
    };
    
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       🍔 MENU HAMBURGER (SIDEBAR)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    
    class MobileHamburgerMenu {
        constructor() {
            this.btn = document.querySelector('.mobile-menu-btn');
            this.menu = document.querySelector('.nav-menu');
            this.links = document.querySelectorAll('.nav-link');
            this.overlay = null;
            
            console.log('🍔 Hamburger Menu Init:');
            console.log('  ├─ Bouton:', this.btn ? '✅' : '❌');
            console.log('  ├─ Menu:', this.menu ? '✅' : '❌');
            console.log('  └─ Liens:', this.links.length);
            
            if (this.btn && this.menu) {
                this.init();
            }
        }
        
        init() {
            // Click sur le bouton hamburger
            this.btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔘 Hamburger cliqué');
                this.toggle();
            });
            
            // Click sur les liens (fermer le menu)
            this.links.forEach(link => {
                link.addEventListener('click', () => {
                    if (isMobile() && this.isOpen()) {
                        console.log('🔗 Lien cliqué - Fermeture menu');
                        this.close();
                    }
                });
            });
            
            // Fermer au resize
            window.addEventListener('resize', () => {
                if (!isMobile() && this.isOpen()) {
                    console.log('🖥️ Passage desktop - Fermeture menu');
                    this.close();
                }
            });
            
            console.log('✅ Hamburger menu prêt');
        }
        
        toggle() {
            this.isOpen() ? this.close() : this.open();
        }
        
        isOpen() {
            return this.menu.classList.contains('active');
        }
        
        open() {
            console.log('%c━━━ 🍔 OUVERTURE MENU ━━━', 'background: #10b981; color: white; padding: 5px; font-weight: bold;');
            
            // Ajouter classe active
            this.btn.classList.add('active');
            this.menu.classList.add('active');
            
            // Bloquer scroll
            blockScroll();
            
            // Créer overlay
            this.createOverlay();
            
            console.log('✅ Menu ouvert');
        }
        
        close() {
            console.log('%c━━━ 🍔 FERMETURE MENU ━━━', 'background: #ef4444; color: white; padding: 5px; font-weight: bold;');
            
            // Retirer classe active
            this.btn.classList.remove('active');
            this.menu.classList.remove('active');
            
            // Débloquer scroll
            unblockScroll();
            
            // Supprimer overlay
            this.removeOverlay();
            
            console.log('❌ Menu fermé');
        }
        
        createOverlay() {
            if (this.overlay) return;
            
            this.overlay = document.createElement('div');
            this.overlay.className = 'mobile-menu-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 65px;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9997;
                animation: fadeIn 0.3s ease;
            `;
            
            // Fermer au clic sur overlay
            this.overlay.addEventListener('click', () => {
                console.log('🎯 Clic overlay - Fermeture menu');
                this.close();
            });
            
            document.body.appendChild(this.overlay);
            console.log('🎨 Overlay créé');
        }
        
        removeOverlay() {
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
                console.log('🗑️ Overlay supprimé');
            }
        }
    }
    
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       👤 MENU PROFIL UTILISATEUR (BOTTOM SHEET)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    
    class MobileUserMenu {
        constructor() {
            this.btn = document.querySelector('.user-profile-button');
            this.menu = document.querySelector('.user-dropdown-menu');
            this.links = this.menu ? this.menu.querySelectorAll('.dropdown-link') : [];
            this.overlay = null;
            
            console.log('👤 User Menu Init:');
            console.log('  ├─ Bouton:', this.btn ? '✅' : '❌');
            console.log('  ├─ Menu:', this.menu ? '✅' : '❌');
            console.log('  └─ Liens:', this.links.length);
            
            if (this.btn && this.menu) {
                this.init();
            }
        }
        
        init() {
            // Click sur le bouton profil
            this.btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👤 Bouton profil cliqué');
                this.toggle();
            });
            
            // Click sur les liens (fermer le menu)
            this.links.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Ne pas fermer si c'est le bouton logout (géré ailleurs)
                    if (!link.classList.contains('dropdown-link-danger')) {
                        if (isMobile() && this.isOpen()) {
                            console.log('🔗 Lien dropdown cliqué - Fermeture');
                            setTimeout(() => this.close(), 100);
                        }
                    }
                });
            });
            
            // Fermer au resize
            window.addEventListener('resize', () => {
                if (!isMobile() && this.isOpen()) {
                    console.log('🖥️ Passage desktop - Fermeture dropdown');
                    this.close();
                }
            });
            
            console.log('✅ User menu prêt');
        }
        
        toggle() {
            this.isOpen() ? this.close() : this.open();
        }
        
        isOpen() {
            return this.menu.classList.contains('active');
        }
        
        open() {
            console.log('%c━━━ 👤 OUVERTURE PROFIL ━━━', 'background: #8b5cf6; color: white; padding: 5px; font-weight: bold;');
            
            // Ajouter classe active
            this.menu.classList.add('active');
            this.btn.setAttribute('aria-expanded', 'true');
            
            // Bloquer scroll sur mobile
            if (isMobile()) {
                blockScroll();
            }
            
            // Créer overlay
            this.createOverlay();
            
            // Animer chevron
            const chevron = this.btn.querySelector('.user-dropdown-icon');
            if (chevron) {
                chevron.style.transform = 'rotate(180deg)';
            }
            
            console.log('✅ Dropdown ouvert');
        }
        
        close() {
            console.log('%c━━━ 👤 FERMETURE PROFIL ━━━', 'background: #ef4444; color: white; padding: 5px; font-weight: bold;');
            
            // Retirer classe active
            this.menu.classList.remove('active');
            this.btn.setAttribute('aria-expanded', 'false');
            
            // Débloquer scroll
            if (isMobile()) {
                unblockScroll();
            }
            
            // Supprimer overlay
            this.removeOverlay();
            
            // Réinitialiser chevron
            const chevron = this.btn.querySelector('.user-dropdown-icon');
            if (chevron) {
                chevron.style.transform = 'rotate(0deg)';
            }
            
            console.log('❌ Dropdown fermé');
        }
        
        createOverlay() {
            if (this.overlay) return;
            
            this.overlay = document.createElement('div');
            this.overlay.className = 'user-menu-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            `;
            
            // Fermer au clic sur overlay
            this.overlay.addEventListener('click', () => {
                console.log('🎯 Clic overlay user - Fermeture');
                this.close();
            });
            
            document.body.appendChild(this.overlay);
            console.log('🎨 Overlay user créé');
        }
        
        removeOverlay() {
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
                console.log('🗑️ Overlay user supprimé');
            }
        }
    }
    
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       🎨 ANIMATIONS CSS KEYFRAMES
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    
    const injectAnimations = () => {
        if (document.getElementById('mobile-animations')) return;
        
        const style = document.createElement('style');
        style.id = 'mobile-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideInLeft {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }
            
            @keyframes slideInBottom {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        console.log('🎨 Animations CSS injectées');
    };
    
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       🚀 INITIALISATION
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    
    const init = () => {
        console.log('🚀 Démarrage landing mobile...');
        
        // Injecter animations
        injectAnimations();
        
        // Initialiser les menus
        const hamburgerMenu = new MobileHamburgerMenu();
        const userMenu = new MobileUserMenu();
        
        // Exposer globalement pour debug
        window.MobileLanding = {
            hamburgerMenu,
            userMenu,
            isMobile,
            version: '1.0.0'
        };
        
        console.log('%c✅ LANDING MOBILE PRÊT !', 'background: #10b981; color: white; padding: 10px; font-weight: bold; font-size: 16px;');
        console.log('%c📱 Version:', 'color: #3B82F6; font-weight: bold;', '1.0.0');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
    };
    
    // Lancer au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();