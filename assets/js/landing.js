/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LANDING.JS - AlphaVault AI Landing Page
   ✅ VERSION CORRIGÉE - MENU UTILISATEUR MOBILE + SLIDERS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 CONFIGURATION GLOBALE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const APP_CONFIG = {
    navScrollThreshold: 50,
    smoothScrollOffset: 80,
    chartAnimationDuration: 2000,
    numberAnimationDuration: 2000,
    throttleDelay: 100,
    debounceDelay: 300
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧭 NAVIGATION MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class NavigationManager {
    constructor() {
        this.nav = document.getElementById('landingNav');
        this.lastScrollTop = 0;
        this.init();
    }

    init() {
        if (!this.nav) return;
        
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, APP_CONFIG.throttleDelay));
        
        this.handleScroll();
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > APP_CONFIG.navScrollThreshold) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
        
        this.lastScrollTop = scrollTop;
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 MOBILE MENU MANAGER - VERSION CORRIGÉE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MobileMenuManager {
    constructor() {
        console.log('📱 Mobile Menu Manager - Initialisation');
        
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.navMenu = document.querySelector('.nav-menu');
        this.navCtaLoggedOut = document.getElementById('navCtaLoggedOut');
        this.navCtaLoggedIn = document.getElementById('navCtaLoggedIn');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        console.log('  ├─ Bouton hamburger:', this.mobileMenuBtn ? '✅' : '❌');
        console.log('  ├─ Menu navigation:', this.navMenu ? '✅' : '❌');
        console.log('  ├─ Nav CTA (logged out):', this.navCtaLoggedOut ? '✅' : '❌');
        console.log('  ├─ Nav CTA (logged in):', this.navCtaLoggedIn ? '✅' : '❌');
        console.log('  └─ Liens navigation:', this.navLinks.length);
        
        this.init();
    }

    init() {
        if (!this.mobileMenuBtn || !this.navMenu) {
            console.warn('⚠ Menu mobile non trouvé');
            return;
        }

        console.log('✅ Initialisation des listeners...');

        // ✅ Créer la section CTA uniquement sur mobile
        this.createMobileCTASection();

        // Toggle menu au clic sur hamburger
        this.mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🔘 Hamburger cliqué');
            this.toggleMenu();
        });

        // Fermer le menu au clic sur un lien
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    const href = link.getAttribute('href');
                    
                    console.log('🔗 Clic sur lien:', href);
                    
                    if (href && href.startsWith('#') && href.length > 1) {
                        e.preventDefault();
                        
                        const targetId = href.substring(1);
                        const targetElement = document.getElementById(targetId);
                        
                        if (targetElement) {
                            console.log('📍 Scroll vers:', targetId);
                            this.closeMenu();
                            
                            setTimeout(() => {
                                window.scrollTo({
                                    top: targetElement.offsetTop - 80,
                                    behavior: 'smooth'
                                });
                            }, 300);
                        } else {
                            console.warn('⚠ Élément cible non trouvé:', targetId);
                            this.closeMenu();
                        }
                    } else {
                        console.log('🌐 Navigation externe - Fermeture menu');
                        this.closeMenu();
                    }
                }
            });
        });

        // Fermer si clic en dehors
        document.addEventListener('click', (e) => {
            if (this.navMenu.classList.contains('active')) {
                const isClickInsideMenu = this.navMenu.contains(e.target);
                const isClickOnButton = this.mobileMenuBtn.contains(e.target);
                const mobileCTA = document.querySelector('.nav-menu-mobile-cta');
                const isClickOnCTA = mobileCTA && mobileCTA.contains(e.target);
                
                if (!isClickInsideMenu && !isClickOnButton && !isClickOnCTA) {
                    console.log('🔒 Clic en dehors - Fermeture menu');
                    this.closeMenu();
                }
            }
        });

        // Fermer au resize (passage desktop)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768 && this.navMenu.classList.contains('active')) {
                    console.log('🖥 Passage en mode desktop - Fermeture menu');
                    this.closeMenu();
                }
                
                // ✅ Recréer ou détruire la section CTA selon la taille d'écran
                this.handleResponsiveCTA();
            }, 250);
        });

        console.log('✅ Mobile Menu Manager prêt');
    }

    // ✅ Gérer l'affichage de la CTA selon la taille d'écran
    handleResponsiveCTA() {
        const mobileCTA = document.querySelector('.nav-menu-mobile-cta');
        
        if (window.innerWidth <= 768) {
            // Sur mobile, créer la section si elle n'existe pas
            if (!mobileCTA) {
                this.createMobileCTASection();
            }
        } else {
            // Sur desktop, supprimer la section si elle existe
            if (mobileCTA) {
                mobileCTA.remove();
                console.log('🖥 Desktop mode : Section CTA mobile supprimée');
            }
        }
    }

    createMobileCTASection() {
        // ✅ Ne créer que sur mobile
        if (window.innerWidth > 768) {
            console.log('🖥 Desktop détecté - Pas de section CTA mobile');
            return;
        }

        // Vérifier si la section existe déjà
        let mobileCTA = document.querySelector('.nav-menu-mobile-cta');
        if (mobileCTA) {
            mobileCTA.remove();
        }

        // Créer la section CTA mobile
        mobileCTA = document.createElement('div');
        mobileCTA.className = 'nav-menu-mobile-cta';

        // ✅ Insérer DIRECTEMENT dans le body (position fixed)
        document.body.appendChild(mobileCTA);

        // Cloner les boutons CTA appropriés
        if (this.navCtaLoggedOut && this.navCtaLoggedOut.style.display !== 'none') {
            const loginBtn = this.navCtaLoggedOut.querySelector('#loginBtn');
            const signupBtn = this.navCtaLoggedOut.querySelector('#signupBtn');

            if (loginBtn) {
                const mobileLoginBtn = loginBtn.cloneNode(true);
                mobileLoginBtn.id = 'mobileLoginBtn';
                mobileLoginBtn.addEventListener('click', () => {
                    window.location.href = 'auth.html';
                });
                mobileCTA.appendChild(mobileLoginBtn);
            }

            if (signupBtn) {
                const mobileSignupBtn = signupBtn.cloneNode(true);
                mobileSignupBtn.id = 'mobileSignupBtn';
                mobileSignupBtn.addEventListener('click', () => {
                    window.location.href = 'auth.html#signup';
                });
                mobileCTA.appendChild(mobileSignupBtn);
            }
        } else if (this.navCtaLoggedIn && this.navCtaLoggedIn.style.display !== 'none') {
            const userProfileBtn = this.navCtaLoggedIn.querySelector('#userProfileButton');

            if (userProfileBtn) {
                const mobileUserBtn = userProfileBtn.cloneNode(true);
                mobileUserBtn.id = 'mobileUserProfileButton';
                
                // Réactiver l'affichage du texte user sur mobile
                const userInfoText = mobileUserBtn.querySelector('.user-info-text');
                if (userInfoText) {
                    userInfoText.style.display = 'flex';
                }

                // ✅ CORRECTION : Référence directe au dropdown au lieu de passer par window
                const dropdownMenu = document.getElementById('userDropdownMenu');
                
                mobileUserBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔵 Clic sur profil utilisateur mobile');
                    
                    // ✅ SOLUTION 1 : Déclencher directement via le DOM
                    if (dropdownMenu) {
                        const isActive = dropdownMenu.classList.contains('active');
                        console.log('📊 État dropdown:', isActive ? 'OUVERT' : 'FERMÉ');
                        
                        if (isActive) {
                            dropdownMenu.classList.remove('active');
                            document.body.style.overflow = '';
                            console.log('❌ Dropdown fermé');
                        } else {
                            dropdownMenu.classList.add('active');
                            document.body.style.overflow = 'hidden';
                            console.log('✅ Dropdown ouvert');
                        }
                    }
                    
                    // ✅ SOLUTION 2 (backup) : Via window avec délai
                    setTimeout(() => {
                        if (window.FinanceLandingApp?.managers?.userMenu) {
                            console.log('🔄 Tentative via UserMenuManager');
                            window.FinanceLandingApp.managers.userMenu.toggleDropdown();
                        }
                    }, 50);
                });

                mobileCTA.appendChild(mobileUserBtn);
            }
        }

        if (mobileCTA.children.length > 0) {
            console.log('✅ Section CTA mobile créée en BAS de l\'écran avec', mobileCTA.children.length, 'bouton(s)');
        } else {
            console.warn('⚠ Section CTA mobile vide - suppression');
            mobileCTA.remove();
        }
    }

    toggleMenu() {
        const isActive = this.navMenu.classList.contains('active');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(isActive ? '❌ Fermeture du menu' : '✅ Ouverture du menu');
        
        if (isActive) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.mobileMenuBtn.classList.add('active');
        this.navMenu.classList.add('active');
        
        // Recréer la section CTA au cas où l'état auth a changé
        this.createMobileCTASection();
        
        // Bloquer le scroll
        document.body.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        
        console.log('✅ Menu ouvert + scroll bloqué');
    }

    closeMenu() {
        this.mobileMenuBtn.classList.remove('active');
        this.navMenu.classList.remove('active');
        
        // Réactiver le scroll
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        
        console.log('❌ Menu fermé + scroll réactivé');
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 USER MENU MANAGER - ✅ CORRIGÉ POUR MOBILE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class UserMenuManager {
    constructor() {
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
        console.log('%c🔍 UserMenuManager - Initialisation', 'color: #3B82F6; font-weight: bold;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
        
        this.profileButton = document.getElementById('userProfileButton');
        this.dropdownMenu = document.getElementById('userDropdownMenu');
        this.logoutButton = document.getElementById('logoutButton');
        this.isDropdownOpen = false; // ✅ État interne
        
        console.log('📦 Éléments trouvés:');
        console.log('  ├─ Profile Button:', this.profileButton ? '✅' : '❌');
        console.log('  ├─ Dropdown Menu:', this.dropdownMenu ? '✅' : '❌');
        console.log('  └─ Logout Button:', this.logoutButton ? '✅' : '❌');
        
        this.init();
    }

    init() {
        if (!this.profileButton || !this.dropdownMenu) {
            console.error('❌ Éléments manquants - UserMenu désactivé');
            return;
        }

        // ✅ Initialiser aria-expanded
        this.profileButton.setAttribute('aria-expanded', 'false');

        console.log('✅ Configuration des événements...');

        // ✅ Click sur le bouton profil DESKTOP
        this.profileButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('%c🔵 Clic sur profil utilisateur DESKTOP', 'color: #3B82F6; font-weight: bold;');
            this.toggleDropdown();
        });

        // Fermer si clic en dehors
        document.addEventListener('click', (e) => {
            if (this.isDropdownOpen) {
                const isClickInsideDropdown = this.dropdownMenu.contains(e.target);
                const isClickOnButton = this.profileButton.contains(e.target);
                
                // ✅ Vérifier aussi le bouton mobile
                const mobileUserBtn = document.getElementById('mobileUserProfileButton');
                const isClickOnMobileButton = mobileUserBtn && mobileUserBtn.contains(e.target);
                
                if (!isClickInsideDropdown && !isClickOnButton && !isClickOnMobileButton) {
                    console.log('🔒 Clic en dehors - Fermeture dropdown');
                    this.closeDropdown();
                }
            }
        });

        // ✅ Fermer au scroll (mobile)
        window.addEventListener('scroll', () => {
            if (this.isDropdownOpen && window.innerWidth <= 768) {
                this.closeDropdown();
            }
        }, { passive: true });

        // ✅ Fermer au resize
        window.addEventListener('resize', () => {
            if (this.isDropdownOpen) {
                this.closeDropdown();
            }
        });

        // Bouton déconnexion
        if (this.logoutButton) {
            console.log('✅ Listener déconnexion ajouté');
            this.logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔓 Déconnexion demandée');
                this.handleLogout();
            });
        }

        // Fermer dropdown au clic sur lien interne
        const dropdownLinks = this.dropdownMenu.querySelectorAll('.dropdown-link:not(#logoutButton)');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                console.log('🔗 Clic sur lien dropdown - Fermeture');
                this.closeDropdown();
            });
        });

        console.log('%c✅ UserMenuManager prêt !', 'color: #10b981; font-weight: bold;');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // ✅ MÉTHODE PUBLIQUE - Accessible depuis le bouton mobile
    toggleDropdown() {
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8b5cf6; font-weight: bold;');
        console.log('%c🔵 toggleDropdown() APPELÉE', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
        
        // ✅ Utiliser l'état interne
        this.isDropdownOpen = !this.isDropdownOpen;
        
        console.log('📊 État actuel:', this.isDropdownOpen ? '✅ OUVERT' : '❌ FERMÉ');
        
        // Mettre à jour aria-expanded
        this.profileButton.setAttribute('aria-expanded', this.isDropdownOpen.toString());
        
        // Toggle classe active
        if (this.isDropdownOpen) {
            this.dropdownMenu.classList.add('active');
            console.log('✅ Classe "active" ajoutée au dropdown');
            
            // ✅ Bloquer le scroll sur mobile
            if (window.innerWidth <= 768) {
                document.body.style.overflow = 'hidden';
            }
        } else {
            this.dropdownMenu.classList.remove('active');
            console.log('❌ Classe "active" retirée du dropdown');
            
            // ✅ Réactiver le scroll
            if (window.innerWidth <= 768) {
                document.body.style.overflow = '';
            }
        }
        
        // Animer chevron
        const chevron = this.profileButton.querySelector('.user-dropdown-icon');
        if (chevron) {
            chevron.style.transform = this.isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)';
            console.log('↻ Chevron animé:', this.isDropdownOpen ? '180deg' : '0deg');
        }
        
        console.log('%c🎉 RÉSULTAT:', 'font-weight: bold;', 
                    this.dropdownMenu.classList.contains('active') ? '✅ OUVERT' : '❌ FERMÉ');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    closeDropdown() {
        if (!this.isDropdownOpen) {
            console.log('ℹ Dropdown déjà fermé');
            return;
        }
        
        console.log('🔒 Fermeture du dropdown...');
        
        this.isDropdownOpen = false;
        this.profileButton.setAttribute('aria-expanded', 'false');
        this.dropdownMenu.classList.remove('active');
        
        // ✅ Réactiver le scroll
        if (window.innerWidth <= 768) {
            document.body.style.overflow = '';
        }
        
        const chevron = this.profileButton.querySelector('.user-dropdown-icon');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
        
        console.log('✅ Dropdown fermé');
    }

    handleLogout() {
        console.log('🔓 Déconnexion en cours...');
        
        // Fermer le dropdown avant de se déconnecter
        this.closeDropdown();
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut()
                .then(() => {
                    console.log('✅ Déconnexion Firebase réussie');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('❌ Erreur Firebase:', error);
                    // Rediriger quand même en cas d'erreur
                    window.location.href = 'index.html';
                });
        } else {
            console.log('⚠ Firebase non disponible - Redirection directe');
            window.location.href = 'index.html';
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTH STATE MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AuthStateManager {
    constructor() {
        this.navCtaLoggedOut = document.getElementById('navCtaLoggedOut');
        this.navCtaLoggedIn = document.getElementById('navCtaLoggedIn');
        this.init();
    }

    init() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                this.updateUIForUser(user);
            });
        } else {
            this.showLoggedOutState();
        }
    }

    updateUIForUser(user) {
        if (user) {
            this.showLoggedInState(user);
        } else {
            this.showLoggedOutState();
        }

        // Recréer les CTA mobiles après changement d'état
        if (window.FinanceLandingApp && window.FinanceLandingApp.managers.mobileMenu) {
            setTimeout(() => {
                window.FinanceLandingApp.managers.mobileMenu.createMobileCTASection();
            }, 100);
        }
    }

    showLoggedInState(user) {
        console.log('👤 État : Connecté -', user.email);
        
        if (this.navCtaLoggedOut) {
            this.navCtaLoggedOut.style.display = 'none';
        }
        
        if (this.navCtaLoggedIn) {
            this.navCtaLoggedIn.style.display = 'flex';
            console.log('✅ Menu profil affiché');
        }

        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        const userDisplayNameElements = document.querySelectorAll('#userDisplayName, #dropdownUserName');
        userDisplayNameElements.forEach(el => {
            if (el) el.textContent = displayName;
        });

        const userEmailElements = document.querySelectorAll('#dropdownUserEmail');
        userEmailElements.forEach(el => {
            if (el) el.textContent = user.email || '';
        });

        const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff&bold=true&size=96`;
        const avatarElements = document.querySelectorAll('#userAvatarImg, #dropdownAvatarImg');
        avatarElements.forEach(el => {
            if (el) el.src = avatarUrl;
        });
    }

    showLoggedOutState() {
        console.log('👤 État : Non connecté');
        
        if (this.navCtaLoggedOut) {
            this.navCtaLoggedOut.style.display = 'flex';
            console.log('✅ Boutons CTA (logged out) affichés');
        }
        
        if (this.navCtaLoggedIn) {
            this.navCtaLoggedIn.style.display = 'none';
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 HERO CHART MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class HeroChartManager {
    constructor() {
        this.canvas = document.getElementById('stockChart');
        this.chart = null;
        this.currentPeriod = '1d';
        
        console.log('📊 Initialisation du graphique boursier...');
        
        if (!this.canvas) {
            console.error('❌ Canvas #stockChart introuvable');
            return;
        }
        
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js non chargé');
            return;
        }
        
        this.init();
    }

    init() {
        console.log('✅ Création du graphique...');
        this.createChart();
        this.setupTimeframeButtons();
    }

    createChart() {
        const ctx = this.canvas.getContext('2d');
        const data = this.generateStockData(30);
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Price',
                    data: data.prices,
                    borderColor: '#3B82F6',
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                        return gradient;
                    },
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#3B82F6',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    pointHitRadius: 30
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3B82F6',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return '$' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11, weight: '500' },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 6
                        }
                    },
                    y: {
                        position: 'right',
                        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11, weight: '500' },
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            },
                            count: 5
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });

        console.log('✅ Graphique créé avec succès !');
    }

    generateStockData(days) {
        const labels = [];
        const prices = [];
        const today = new Date();
        let basePrice = 170;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const day = date.getDate();
            labels.push(`${month} ${day}`);
            
            const change = (Math.random() - 0.4) * 4;
            basePrice += change;
            prices.push(parseFloat(basePrice.toFixed(2)));
        }

        return { labels, prices };
    }

    setupTimeframeButtons() {
        const buttons = document.querySelectorAll('.tf-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const period = btn.getAttribute('data-period');
                this.updateChartData(period);
            });
        });
    }

    updateChartData(period) {
        if (!this.chart) return;

        let days;
        switch(period) {
            case '1d': days = 24; break;
            case '1w': days = 7; break;
            case '1m': days = 30; break;
            case '1y': days = 365; break;
            default: days = 30;
        }

        console.log(`📊 Mise à jour du graphique : ${period} (${days} points)`);

        const newData = this.generateStockData(days);
        this.chart.data.labels = newData.labels;
        this.chart.data.datasets[0].data = newData.prices;
        this.chart.update('active');
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICING MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PricingManager {
    constructor() {
        this.toggle = document.getElementById('pricingToggle');
        this.priceElements = document.querySelectorAll('.amount[data-monthly][data-annual]');
        this.init();
    }

    init() {
        if (!this.toggle) return;
        this.toggle.addEventListener('change', () => this.updatePrices());
    }

    updatePrices() {
        const isAnnual = this.toggle.checked;
        this.priceElements.forEach(element => {
            const monthlyPrice = element.getAttribute('data-monthly');
            const annualPrice = element.getAttribute('data-annual');
            if (monthlyPrice && annualPrice) {
                element.style.transform = 'scale(0.9)';
                element.style.opacity = '0.5';
                setTimeout(() => {
                    element.textContent = isAnnual ? annualPrice : monthlyPrice;
                    element.style.transform = 'scale(1)';
                    element.style.opacity = '1';
                }, 150);
            }
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 DEMO SEARCH MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DemoSearchManager {
    constructor() {
        this.searchInput = document.getElementById('companySearch');
        this.resultCards = document.querySelectorAll('.company-result-card');
        this.resultsHeader = document.querySelector('.results-header span:first-child');
        this.init();
    }

    init() {
        if (!this.searchInput) return;
        this.searchInput.addEventListener('input', debounce((e) => {
            this.handleSearch(e.target.value);
        }, APP_CONFIG.debounceDelay));
    }

    handleSearch(searchValue) {
        const query = searchValue.toLowerCase().trim();
        let visibleCount = 0;

        this.resultCards.forEach(card => {
            const companyName = card.querySelector('.company-details h4')?.textContent.toLowerCase() || '';
            const ticker = card.querySelector('.company-details p')?.textContent.toLowerCase() || '';
            const isMatch = companyName.includes(query) || ticker.includes(query) || query === '';

            if (isMatch) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.4s ease forwards';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (this.resultsHeader) {
            this.resultsHeader.textContent = `${visibleCount} comparable compan${visibleCount !== 1 ? 'ies' : 'y'} found`;
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 SCROLL REVEAL MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ScrollRevealManager {
    constructor() {
        this.elements = document.querySelectorAll('[data-aos]');
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        window.addEventListener('scroll', throttle(() => this.revealOnScroll(), APP_CONFIG.throttleDelay));
        this.revealOnScroll();
    }

    revealOnScroll() {
        this.elements.forEach(element => {
            if (this.animatedElements.has(element)) return;

            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < window.innerHeight - 150) {
                element.classList.add('aos-animate');
                this.animatedElements.add(element);
            }
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔢 NUMBER COUNTER MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class NumberCounterManager {
    constructor() {
        this.numbers = document.querySelectorAll('.proof-number');
        this.animated = false;
        this.init();
    }

    init() {
        if (this.numbers.length === 0) return;
        window.addEventListener('scroll', throttle(() => this.checkAndAnimate(), APP_CONFIG.throttleDelay));
        this.checkAndAnimate();
    }

    checkAndAnimate() {
        if (this.animated || this.numbers.length === 0) return;
        const firstNumber = this.numbers[0];
        const rect = firstNumber.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

        if (isVisible) {
            this.animated = true;
            this.animateNumbers();
        }
    }

    animateNumbers() {
        const targets = [10000, 1000000, 500000];
        this.numbers.forEach((element, index) => {
            if (targets[index]) {
                element.textContent = '0';
                setTimeout(() => {
                    animateValue(element, 0, targets[index], APP_CONFIG.numberAnimationDuration);
                }, index * 200);
            }
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 SMOOTH SCROLL MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SmoothScrollManager {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href && href !== '#' && href.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        window.scrollTo({
                            top: target.offsetTop - APP_CONFIG.smoothScrollOffset,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 CTA MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class CTAManager {
    constructor() {
        this.buttons = {
            loginBtn: document.getElementById('loginBtn'),
            signupBtn: document.getElementById('signupBtn'),
            heroGetStarted: document.getElementById('heroGetStarted'),
            tryDemoBtn: document.getElementById('tryDemoBtn'),
            finalCTABtn: document.getElementById('finalCTABtn'),
            openAlphyChat: document.getElementById('openAlphyChat')
        };
        this.init();
    }

    init() {
        if (this.buttons.loginBtn) {
            this.buttons.loginBtn.addEventListener('click', () => {
                window.location.href = 'auth.html';
            });
        }

        [this.buttons.signupBtn, this.buttons.heroGetStarted, this.buttons.finalCTABtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    window.location.href = 'auth.html#signup';
                });
            }
        });

        if (this.buttons.tryDemoBtn) {
            this.buttons.tryDemoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'interactive-demo.html';
            });
        }

        if (this.buttons.openAlphyChat) {
            this.buttons.openAlphyChat.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚀 Redirection vers chatbot fullpage...');
                window.location.href = 'chatbot-fullpage.html';
            });
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 MOBILE SLIDER MANAGER (NOUVEAU ✨)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MobileSliderManager {
    constructor() {
        this.sliders = document.querySelectorAll('.features-grid, .tools-grid-advanced, .pricing-grid-three, .solutions-grid');
        this.init();
    }

    init() {
        if (window.innerWidth > 768) {
            console.log('🖥 Mode desktop - Sliders désactivés');
            return;
        }

        console.log('📱 Mobile Slider Manager - Initialisation');
        console.log(`  └─ ${this.sliders.length} slider(s) détecté(s)`);

        this.sliders.forEach((slider, index) => {
            this.setupSlider(slider, index);
        });

        // Réinitialiser au resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth <= 768) {
                    this.sliders.forEach((slider, index) => this.setupSlider(slider, index));
                }
            }, 250);
        });

        console.log('✅ Mobile Sliders activés');
    }

    setupSlider(slider, index) {
        // Touch feedback amélioré
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });

        // Snap au centre après scroll
        let scrollTimer;
        slider.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                this.snapToCenter(slider);
            }, 150);
        }, { passive: true });

        // Accessibilité keyboard
        slider.setAttribute('tabindex', '0');
        slider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.scrollPrevious(slider);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.scrollNext(slider);
            }
        });

        console.log(`  ✓ Slider #${index + 1} configuré`);
    }

    snapToCenter(slider) {
        const cards = slider.children;
        if (cards.length === 0) return;

        const sliderCenter = slider.scrollLeft + slider.offsetWidth / 2;
        let closestCard = cards[0];
        let minDistance = Math.abs(cards[0].offsetLeft + cards[0].offsetWidth / 2 - sliderCenter);

        for (let i = 1; i < cards.length; i++) {
            const cardCenter = cards[i].offsetLeft + cards[i].offsetWidth / 2;
            const distance = Math.abs(cardCenter - sliderCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestCard = cards[i];
            }
        }

        const targetScroll = closestCard.offsetLeft - (slider.offsetWidth - closestCard.offsetWidth) / 2;
        slider.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }

    scrollNext(slider) {
        const cardWidth = slider.children[0]?.offsetWidth || 300;
        slider.scrollBy({
            left: cardWidth + 16, // card width + gap
            behavior: 'smooth'
        });
    }

    scrollPrevious(slider) {
        const cardWidth = slider.children[0]?.offsetWidth || 300;
        slider.scrollBy({
            left: -(cardWidth + 16),
            behavior: 'smooth'
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 PERFORMANCE MONITOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`⚡ Page chargée en ${pageLoadTime}ms`);
            }
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 APPLICATION INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class LandingApp {
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
        console.log('%c🚀 AlphaVault AI Landing - Initialisation...', 'color: #3B82F6; font-size: 14px; font-weight: bold;');

        try {
            this.managers.navigation = new NavigationManager();
            this.managers.mobileMenu = new MobileMenuManager();
            this.managers.userMenu = new UserMenuManager(); // ✅ Doit être initialisé AVANT authState
            this.managers.authState = new AuthStateManager();
            this.managers.heroChart = new HeroChartManager();
            this.managers.pricing = new PricingManager();
            this.managers.demoSearch = new DemoSearchManager();
            this.managers.scrollReveal = new ScrollRevealManager();
            this.managers.numberCounter = new NumberCounterManager();
            this.managers.smoothScroll = new SmoothScrollManager();
            this.managers.cta = new CTAManager();
            this.managers.mobileSlider = new MobileSliderManager(); // ✅ NOUVEAU
            this.managers.performance = new PerformanceMonitor();

            console.log('%c✅ Tous les modules chargés avec succès!', 'color: #10B981; font-size: 14px; font-weight: bold;');

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 LANCEMENT DE L'APPLICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const financeLandingApp = new LandingApp();
window.FinanceLandingApp = financeLandingApp;

console.log('%c✅ Landing page initialized successfully!', 'color: #10B981; font-size: 14px; font-weight: bold;');