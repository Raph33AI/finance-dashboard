/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📱 LANDING MOBILE - OPTIMISATIONS CRITIQUES
   Version: 1.0 - AlphaVault AI
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 DÉTECTION MOBILE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MobileDetector = {
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    isSmallMobile() {
        return window.innerWidth <= 480;
    },
    
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    getDeviceType() {
        if (this.isSmallMobile()) return 'small-mobile';
        if (this.isMobile()) return 'mobile';
        return 'desktop';
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🍔 MOBILE MENU MANAGER - VERSION OPTIMISÉE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MobileMenuManagerOptimized {
    constructor() {
        console.log('📱 Mobile Menu Manager - Initialisation optimisée');
        
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.navMenu = document.querySelector('.nav-menu');
        this.navCta = document.querySelector('.nav-cta');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.body = document.body;
        
        // État
        this.isOpen = false;
        this.scrollPosition = 0;
        
        console.log('  ├─ Bouton:', this.mobileMenuBtn ? '✅' : '❌');
        console.log('  ├─ Menu:', this.navMenu ? '✅' : '❌');
        console.log('  └─ Liens:', this.navLinks.length);
        
        this.init();
    }

    init() {
        if (!this.mobileMenuBtn || !this.navMenu) {
            console.warn('⚠️ Éléments menu mobile manquants');
            return;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔘 TOGGLE MENU
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this.mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔗 FERMER AU CLIC SUR LIEN
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isOpen) {
                    console.log('🔗 Clic lien - Fermeture menu');
                    this.closeMenu();
                }
            });
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🎯 FERMER SI CLIC EN DEHORS
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        document.addEventListener('click', (e) => {
            if (this.isOpen) {
                const isClickInsideMenu = this.navMenu.contains(e.target);
                const isClickOnButton = this.mobileMenuBtn.contains(e.target);
                
                if (!isClickInsideMenu && !isClickOnButton) {
                    console.log('🔒 Clic en dehors - Fermeture');
                    this.closeMenu();
                }
            }
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📏 FERMER AU RESIZE
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (!MobileDetector.isMobile() && this.isOpen) {
                    console.log('🖥️ Passage desktop - Fermeture');
                    this.closeMenu();
                }
            }, 250);
        });

        console.log('✅ Mobile Menu Manager prêt');
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        console.log('✅ Ouverture menu mobile');
        
        // Sauvegarder position scroll
        this.scrollPosition = window.pageYOffset;
        
        // Activer classes
        this.mobileMenuBtn.classList.add('active');
        this.navMenu.classList.add('active');
        
        // Bloquer scroll
        this.body.classList.add('menu-open');
        this.body.style.overflow = 'hidden';
        this.body.style.position = 'fixed';
        this.body.style.top = `-${this.scrollPosition}px`;
        this.body.style.width = '100%';
        
        this.isOpen = true;
    }

    closeMenu() {
        console.log('❌ Fermeture menu mobile');
        
        // Retirer classes
        this.mobileMenuBtn.classList.remove('active');
        this.navMenu.classList.remove('active');
        
        // Réactiver scroll
        this.body.classList.remove('menu-open');
        this.body.style.overflow = '';
        this.body.style.position = '';
        this.body.style.top = '';
        this.body.style.width = '';
        
        // Restaurer position scroll
        window.scrollTo(0, this.scrollPosition);
        
        this.isOpen = false;
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 USER MENU MANAGER - VERSION OPTIMISÉE MOBILE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class UserMenuManagerOptimized {
    constructor() {
        console.log('👤 User Menu Manager - Initialisation optimisée');
        
        this.profileButton = document.getElementById('userProfileButton');
        this.dropdownMenu = document.getElementById('userDropdownMenu');
        this.logoutButton = document.getElementById('logoutButton');
        this.settingsLink = document.getElementById('settingsLink');
        this.body = document.body;
        
        // État
        this.isOpen = false;
        this.scrollPosition = 0;
        
        console.log('  ├─ Bouton profil:', this.profileButton ? '✅' : '❌');
        console.log('  └─ Dropdown:', this.dropdownMenu ? '✅' : '❌');
        
        this.init();
    }

    init() {
        if (!this.profileButton || !this.dropdownMenu) {
            console.warn('⚠️ Éléments user menu manquants');
            return;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔘 TOGGLE DROPDOWN - MÉTHODE 1 (capture)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this.profileButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔵 Clic bouton profil');
            this.toggleDropdown();
        }, true);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔘 TOGGLE DROPDOWN - MÉTHODE 2 (délégation)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        document.addEventListener('click', (e) => {
            if (this.profileButton.contains(e.target)) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🟢 Clic profil (délégation)');
                this.toggleDropdown();
                return;
            }
            
            // Fermer si clic en dehors
            if (this.isOpen && !this.dropdownMenu.contains(e.target)) {
                console.log('🔒 Clic en dehors - Fermeture dropdown');
                this.closeDropdown();
            }
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔓 DÉCONNEXION
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ⚙️ PARAMÈTRES
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (this.settingsLink) {
            this.settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'settings.html';
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔗 FERMER AU CLIC SUR LIEN INTERNE
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const dropdownLinks = this.dropdownMenu.querySelectorAll('.dropdown-link');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeDropdown();
            });
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📏 FERMER AU RESIZE
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (!MobileDetector.isMobile() && this.isOpen) {
                    console.log('🖥️ Passage desktop - Fermeture dropdown');
                    this.closeDropdown();
                }
            }, 250);
        });

        console.log('✅ User Menu Manager prêt');
    }

    toggleDropdown() {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔵 toggleDropdown() APPELÉE');
        
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        console.log('✅ Ouverture dropdown');
        
        // Sauvegarder position scroll
        this.scrollPosition = window.pageYOffset;
        
        // Activer classes
        this.profileButton.setAttribute('aria-expanded', 'true');
        this.dropdownMenu.classList.add('active');
        
        // Bloquer scroll sur mobile uniquement
        if (MobileDetector.isMobile()) {
            this.body.style.overflow = 'hidden';
            this.body.style.position = 'fixed';
            this.body.style.top = `-${this.scrollPosition}px`;
            this.body.style.width = '100%';
            console.log('🔒 Scroll bloqué (mobile)');
        }
        
        // Animer chevron
        const chevron = this.profileButton.querySelector('.user-dropdown-icon');
        if (chevron) {
            chevron.style.transform = 'rotate(180deg)';
        }
        
        this.isOpen = true;
        console.log('✅ Dropdown ouvert');
    }

    closeDropdown() {
        console.log('❌ Fermeture dropdown');
        
        // Retirer classes
        this.profileButton.setAttribute('aria-expanded', 'false');
        this.dropdownMenu.classList.remove('active');
        
        // Réactiver scroll
        this.body.style.overflow = '';
        this.body.style.position = '';
        this.body.style.top = '';
        this.body.style.width = '';
        
        // Restaurer position scroll (mobile uniquement)
        if (MobileDetector.isMobile()) {
            window.scrollTo(0, this.scrollPosition);
            console.log('🔓 Scroll réactivé');
        }
        
        // Réinitialiser chevron
        const chevron = this.profileButton.querySelector('.user-dropdown-icon');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
        
        this.isOpen = false;
        console.log('✅ Dropdown fermé');
    }

    handleLogout() {
        console.log('🔓 Déconnexion...');
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut()
                .then(() => {
                    console.log('✅ Déconnexion Firebase OK');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('❌ Erreur Firebase:', error);
                });
        } else {
            console.log('⚠️ Firebase non disponible - Redirection');
            window.location.href = 'index.html';
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚡ PERFORMANCE OPTIMIZER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        console.log('⚡ Performance Optimizer - Initialisation');
        
        if (MobileDetector.isMobile()) {
            this.disableHeavyAnimations();
            this.disableThreeJS();
            this.optimizeImages();
        }
        
        console.log('✅ Performance optimisée pour', MobileDetector.getDeviceType());
    }

    disableHeavyAnimations() {
        console.log('🎨 Désactivation animations lourdes...');
        
        // Désactiver animations 3D
        const elements3D = document.querySelectorAll(`
            .feature-card,
            .solution-card,
            .pricing-card,
            .tool-card-advanced,
            .dashboard-mockup,
            .hero-visual
        `);
        
        elements3D.forEach(el => {
            if (el) {
                el.style.transform = 'none';
                el.style.perspective = 'none';
                el.style.transformStyle = 'flat';
            }
        });
        
        console.log(`  └─ ${elements3D.length} éléments simplifiés`);
    }

    disableThreeJS() {
        console.log('🎨 Désactivation Three.js sur mobile...');
        
        // Désactiver l'initialisation de Three.js
        if (typeof Landing3DObjects !== 'undefined') {
            Landing3DObjects.prototype.init = function() {
                console.log('⚠️ Three.js désactivé sur mobile');
            };
        }
        
        // Cacher les canvas Three.js existants
        const threeCanvases = document.querySelectorAll('canvas');
        threeCanvases.forEach(canvas => {
            if (canvas.parentElement && canvas.parentElement.classList.contains('feature-icon')) {
                canvas.style.display = 'none';
                
                // Afficher l'icône Font Awesome à la place
                const faIcon = canvas.parentElement.querySelector('i[class*="fa-"]');
                if (faIcon) {
                    faIcon.style.display = 'block';
                }
            }
        });
        
        console.log('  ✅ Three.js désactivé');
    }

    optimizeImages() {
        console.log('🖼️ Optimisation images...');
        
        const images = document.querySelectorAll('img');
        let optimized = 0;
        
        images.forEach(img => {
            // Ajouter loading lazy
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
                optimized++;
            }
        });
        
        console.log(`  └─ ${optimized} images optimisées`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 INITIALISATION MOBILE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MobileAppInitializer {
    constructor() {
        this.managers = {};
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeManagers());
        } else {
            this.initializeManagers();
        }
    }

    initializeManagers() {
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
        console.log('%c📱 MOBILE APP - Initialisation', 'color: #3B82F6; font-weight: bold; font-size: 14px;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
        
        console.log('📊 Device Info:');
        console.log('  ├─ Type:', MobileDetector.getDeviceType());
        console.log('  ├─ Width:', window.innerWidth + 'px');
        console.log('  ├─ Height:', window.innerHeight + 'px');
        console.log('  └─ Touch:', MobileDetector.isTouchDevice() ? 'Oui' : 'Non');
        console.log('');

        try {
            // Performance Optimizer (AVANT les autres)
            this.managers.performance = new PerformanceOptimizer();
            
            // Menu Mobile
            this.managers.mobileMenu = new MobileMenuManagerOptimized();
            
            // User Menu
            this.managers.userMenu = new UserMenuManagerOptimized();

            console.log('%c✅ Tous les managers mobiles chargés !', 'color: #10B981; font-weight: bold; font-size: 14px;');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');

        } catch (error) {
            console.error('%c❌ Erreur initialisation mobile:', 'color: #ef4444; font-weight: bold;');
            console.error(error);
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 AUTO-INITIALISATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (MobileDetector.isMobile()) {
    console.log('%c📱 Mobile détecté - Chargement optimisations', 'color: #3B82F6; font-weight: bold;');
    const mobileApp = new MobileAppInitializer();
    window.MobileApp = mobileApp;
} else {
    console.log('🖥️ Desktop détecté - Mode standard');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ FIN LANDING-MOBILE.JS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━