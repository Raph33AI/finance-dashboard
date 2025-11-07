/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LANDING.JS - FinancePro Landing Page Premium 3D
   Version avec gestion authentification et effets 3D
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 CONFIGURATION GLOBALE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const APP_CONFIG = {
    navScrollThreshold: 50,
    smoothScrollOffset: 80,
    chartAnimationDuration: 2000,
    numberAnimationDuration: 2000,
    throttleDelay: 100,
    debounceDelay: 300
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Debounce - Limite l'exécution d'une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {Number} wait - Délai en ms
 */
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

/**
 * Throttle - Limite la fréquence d'exécution
 * @param {Function} func - Fonction à throttler
 * @param {Number} limit - Limite en ms
 */
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

/**
 * Anime un nombre de start à end
 * @param {HTMLElement} element - Élément à animer
 * @param {Number} start - Valeur de départ
 * @param {Number} end - Valeur d'arrivée
 * @param {Number} duration - Durée en ms
 */
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        // Format avec séparateurs de milliers
        element.textContent = value.toLocaleString();
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧭 NAVIGATION - STICKY & SCROLL EFFECTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
        
        // Initial check
        this.handleScroll();
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Ajouter/retirer classe 'scrolled'
        if (scrollTop > APP_CONFIG.navScrollThreshold) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
        
        this.lastScrollTop = scrollTop;
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 MOBILE MENU MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MobileMenuManager {
    constructor() {
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        if (!this.mobileMenuBtn || !this.navMenu) return;

        // Toggle menu
        this.mobileMenuBtn.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Fermer le menu au clic sur un lien
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Fermer au clic en dehors
        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.mobileMenuBtn.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.mobileMenuBtn.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Empêcher le scroll quand le menu est ouvert
        if (this.navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMenu() {
        this.mobileMenuBtn.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 USER PROFILE DROPDOWN MENU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class UserMenuManager {
    constructor() {
        this.profileButton = document.getElementById('userProfileButton');
        this.dropdownMenu = document.getElementById('userDropdownMenu');
        this.logoutButton = document.getElementById('logoutButton');
        this.settingsLink = document.getElementById('settingsLink');
        this.init();
    }

    init() {
        if (!this.profileButton || !this.dropdownMenu) return;

        // Toggle dropdown
        this.profileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Fermer au clic en dehors
        document.addEventListener('click', (e) => {
            if (!this.dropdownMenu.contains(e.target) && !this.profileButton.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Bouton de déconnexion
        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Lien paramètres
        if (this.settingsLink) {
            this.settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔧 Redirection vers les paramètres...');
                window.location.href = 'settings.html';
            });
        }
    }

    toggleDropdown() {
        const isExpanded = this.profileButton.getAttribute('aria-expanded') === 'true';
        this.profileButton.setAttribute('aria-expanded', !isExpanded);
        this.dropdownMenu.classList.toggle('active');

        // Animation de l'icône chevron
        const chevron = this.profileButton.querySelector('.user-dropdown-icon');
        if (chevron) {
            chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }

    closeDropdown() {
        this.profileButton.setAttribute('aria-expanded', 'false');
        this.dropdownMenu.classList.remove('active');
        
        const chevron = this.profileButton.querySelector('.user-dropdown-icon');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
    }

    handleLogout() {
        console.log('🔓 Déconnexion en cours...');
        
        // Si Firebase est disponible
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut()
                .then(() => {
                    console.log('✅ Déconnexion réussie');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('❌ Erreur lors de la déconnexion:', error);
                });
        } else {
            // Fallback sans Firebase
            window.location.href = 'index.html';
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTHENTICATION STATE MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AuthStateManager {
    constructor() {
        this.navCtaLoggedOut = document.getElementById('navCtaLoggedOut');
        this.navCtaLoggedIn = document.getElementById('navCtaLoggedIn');
        this.init();
    }

    init() {
        // Vérifier si Firebase est disponible
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                this.updateUIForUser(user);
            });
        } else {
            // Par défaut, afficher l'état non connecté
            this.showLoggedOutState();
        }
    }

    updateUIForUser(user) {
        if (user) {
            // Utilisateur connecté
            this.showLoggedInState(user);
        } else {
            // Utilisateur non connecté
            this.showLoggedOutState();
        }
    }

    showLoggedInState(user) {
        if (this.navCtaLoggedOut) this.navCtaLoggedOut.style.display = 'none';
        if (this.navCtaLoggedIn) this.navCtaLoggedIn.style.display = 'flex';

        // Mettre à jour les infos utilisateur
        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        const userDisplayNameElements = document.querySelectorAll('#userDisplayName, #dropdownUserName');
        userDisplayNameElements.forEach(el => {
            if (el) el.textContent = displayName;
        });

        const userEmailElements = document.querySelectorAll('#dropdownUserEmail');
        userEmailElements.forEach(el => {
            if (el) el.textContent = user.email || '';
        });

        // Mettre à jour l'avatar
        const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff&bold=true&size=96`;
        const avatarElements = document.querySelectorAll('#userAvatarImg, #dropdownAvatarImg');
        avatarElements.forEach(el => {
            if (el) el.src = avatarUrl;
        });
    }

    showLoggedOutState() {
        if (this.navCtaLoggedOut) this.navCtaLoggedOut.style.display = 'flex';
        if (this.navCtaLoggedIn) this.navCtaLoggedIn.style.display = 'none';
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 HERO CHART MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class HeroChartManager {
    constructor() {
        this.canvas = document.getElementById('heroChart');
        this.chart = null;
        this.init();
    }

    init() {
        if (!this.canvas || typeof Chart === 'undefined') return;

        const ctx = this.canvas.getContext('2d');
        
        // Données pour le graphique
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const portfolioData = [2400000, 2520000, 2680000, 2750000, 2820000, 2847392];
        const benchmarkData = [2350000, 2480000, 2590000, 2640000, 2700000, 2750000];
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Portfolio Value',
                        data: portfolioData,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#3B82F6',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    },
                    {
                        label: 'Benchmark',
                        data: benchmarkData,
                        borderColor: '#9CA3AF',
                        backgroundColor: 'rgba(156, 163, 175, 0.05)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#9CA3AF',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            size: 13,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '$' + (context.parsed.y / 1000000).toFixed(2) + 'M';
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11,
                                weight: '500'
                            },
                            color: '#6B7280'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 11,
                                weight: '500'
                            },
                            color: '#6B7280',
                            callback: function(value) {
                                return '$' + (value / 1000000) + 'M';
                            }
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

        // Animation au scroll
        this.observeChart();
    }

    observeChart() {
        if (!this.canvas) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.chart) {
                    this.chart.update('show');
                }
            });
        }, { threshold: 0.3 });

        observer.observe(this.canvas);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICING TOGGLE MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PricingManager {
    constructor() {
        this.toggle = document.getElementById('pricingToggle');
        this.priceElements = document.querySelectorAll('.amount[data-monthly][data-annual]');
        this.init();
    }

    init() {
        if (!this.toggle) return;

        this.toggle.addEventListener('change', () => {
            this.updatePrices();
        });
    }

    updatePrices() {
        const isAnnual = this.toggle.checked;

        this.priceElements.forEach(element => {
            const monthlyPrice = element.getAttribute('data-monthly');
            const annualPrice = element.getAttribute('data-annual');

            if (monthlyPrice && annualPrice) {
                // Animation de transition
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 INTERACTIVE DEMO - SEARCH MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

        // Mettre à jour le compteur
        if (this.resultsHeader) {
            this.resultsHeader.textContent = `${visibleCount} comparable compan${visibleCount !== 1 ? 'ies' : 'y'} found`;
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 SCROLL REVEAL ANIMATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ScrollRevealManager {
    constructor() {
        this.elements = document.querySelectorAll('[data-aos]');
        this.init();
    }

    init() {
        window.addEventListener('scroll', throttle(() => {
            this.revealOnScroll();
        }, APP_CONFIG.throttleDelay));

        // Initial check
        this.revealOnScroll();
    }

    revealOnScroll() {
        this.elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('aos-animate');
            }
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔢 NUMBER COUNTER ANIMATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class NumberCounterManager {
    constructor() {
        this.numbers = document.querySelectorAll('.proof-number');
        this.animated = false;
        this.init();
    }

    init() {
        if (this.numbers.length === 0) return;

        window.addEventListener('scroll', throttle(() => {
            this.checkAndAnimate();
        }, APP_CONFIG.throttleDelay));

        // Initial check
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
        // Valeurs cibles pour chaque compteur
        const targets = [10000, 1000000, 500000];

        this.numbers.forEach((element, index) => {
            if (targets[index]) {
                element.textContent = '0';
                setTimeout(() => {
                    animateValue(element, 0, targets[index], APP_CONFIG.numberAnimationDuration);
                }, index * 200); // Décalage pour effet cascade
            }
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 FEATURE CARDS TILT EFFECT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TiltEffectManager {
    constructor() {
        this.cards = document.querySelectorAll('.feature-card, .solution-card, .pricing-card');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                this.handleTilt(card, e);
            });

            card.addEventListener('mouseleave', () => {
                this.resetTilt(card);
            });
        });
    }

    handleTilt(card, e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px) scale(1.02)`;
    }

    resetTilt(card) {
        card.style.transform = '';
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 SMOOTH SCROLL MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
                        const targetPosition = target.offsetTop - APP_CONFIG.smoothScrollOffset;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 CTA BUTTONS MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class CTAManager {
    constructor() {
        this.buttons = {
            loginBtn: document.getElementById('loginBtn'),
            signupBtn: document.getElementById('signupBtn'),
            heroGetStarted: document.getElementById('heroGetStarted'),
            heroWatchDemo: document.getElementById('heroWatchDemo'),
            tryDemoBtn: document.getElementById('tryDemoBtn'),
            finalCTABtn: document.getElementById('finalCTABtn'),
            contactSalesBtn: document.getElementById('contactSalesBtn')
        };
        this.init();
    }

    init() {
        // Bouton Login
        if (this.buttons.loginBtn) {
            this.buttons.loginBtn.addEventListener('click', () => {
                console.log('🔐 Redirection vers la page d\'authentification...');
                window.location.href = 'auth.html';
            });
        }

        // Boutons Signup / Get Started
        [this.buttons.signupBtn, this.buttons.heroGetStarted, this.buttons.finalCTABtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    console.log('📝 Redirection vers la page d\'inscription...');
                    window.location.href = 'auth.html#signup';
                });
            }
        });

        // Boutons Demo
        [this.buttons.heroWatchDemo, this.buttons.tryDemoBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🎯 Redirection vers la démo interactive...');
                    window.location.href = 'interactive-demo.html';
                });
            }
        });

        // Bouton Contact Sales
        if (this.buttons.contactSalesBtn) {
            this.buttons.contactSalesBtn.addEventListener('click', () => {
                console.log('📞 Redirection vers le formulaire de contact...');
                window.location.href = 'contact.html';
            });
        }

        // Tous les boutons avec data-action
        this.initDataActionButtons();
    }

    initDataActionButtons() {
        document.querySelectorAll('[data-action="demo"]').forEach(btn => {
            btn.addEventListener('click', () => {
                window.location.href = 'interactive-demo.html';
            });
        });

        document.querySelectorAll('[data-action="signup"]').forEach(btn => {
            btn.addEventListener('click', () => {
                window.location.href = 'auth.html#signup';
            });
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 PARTICULES BACKGROUND (OPTIONNEL)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ParticlesManager {
    constructor(enabled = false) {
        this.enabled = enabled;
        if (this.enabled) {
            this.init();
        }
    }

    init() {
        const hero = document.querySelector('.hero-bg');
        if (!hero) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: rgba(59, 130, 246, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${Math.random() * 10 + 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
                pointer-events: none;
            `;
            hero.appendChild(particle);
        }

        // Ajouter le keyframe si nécessaire
        this.injectKeyframes();
    }

    injectKeyframes() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                0% {
                    transform: translateY(0) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 PERFORMANCE MONITORING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

                // Log des Core Web Vitals si disponible
                if (window.PerformanceObserver) {
                    this.observeWebVitals();
                }
            }
        });
    }

    observeWebVitals() {
        // LCP - Largest Contentful Paint
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log(`📊 LCP: ${lastEntry.renderTime || lastEntry.loadTime}ms`);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // Observer non supporté
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎉 EASTER EGGS & FUN STUFF
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class EasterEggManager {
    constructor() {
        this.init();
    }

    init() {
        this.consoleArt();
        this.konamiCode();
    }

    consoleArt() {
        const styles = [
            'color: #3B82F6; font-size: 20px; font-weight: bold;',
            'color: #6B7280; font-size: 14px;',
            'color: #10B981; font-size: 12px;'
        ];

        console.log('%c👋 Hey there, Developer!', styles[0]);
        console.log('%cInterested in joining our team? Check out our careers page!', styles[1]);
        console.log('%c🚀 FinancePro - Built with passion for finance', styles[2]);
    }

    konamiCode() {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;

        document.addEventListener('keydown', (e) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    this.activateEasterEgg();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
    }

    activateEasterEgg() {
        console.log('%c🎉 KONAMI CODE ACTIVATED! 🎉', 'color: #F59E0B; font-size: 24px; font-weight: bold;');
        console.log('%cYou\'ve unlocked the secret developer mode!', 'color: #8B5CF6; font-size: 16px;');
        
        // Ajout d'un effet visuel fun
        document.body.style.animation = 'rainbow 2s linear infinite';
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Retour à la normale après 5 secondes
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 APPLICATION INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class LandingApp {
    constructor() {
        this.managers = {};
        this.init();
    }

    init() {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeManagers();
            });
        } else {
            this.initializeManagers();
        }
    }

    initializeManagers() {
        console.log('%c🚀 FinancePro Landing - Initialisation...', 'color: #3B82F6; font-size: 14px; font-weight: bold;');

        try {
            // Initialiser tous les managers
            this.managers.navigation = new NavigationManager();
            this.managers.mobileMenu = new MobileMenuManager();
            this.managers.userMenu = new UserMenuManager();
            this.managers.authState = new AuthStateManager();
            this.managers.heroChart = new HeroChartManager();
            this.managers.pricing = new PricingManager();
            this.managers.demoSearch = new DemoSearchManager();
            this.managers.scrollReveal = new ScrollRevealManager();
            this.managers.numberCounter = new NumberCounterManager();
            this.managers.tiltEffect = new TiltEffectManager();
            this.managers.smoothScroll = new SmoothScrollManager();
            this.managers.cta = new CTAManager();
            this.managers.performance = new PerformanceMonitor();
            this.managers.easterEgg = new EasterEggManager();

            // Particules (désactivé par défaut)
            // this.managers.particles = new ParticlesManager(true);

            console.log('%c✅ Tous les modules chargés avec succès!', 'color: #10B981; font-size: 14px; font-weight: bold;');
            console.log('%c💎 Effets 3D activés', 'color: #8B5CF6; font-size: 12px;');
            console.log('%c🎨 Animations prêtes', 'color: #F59E0B; font-size: 12px;');

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 LANCEMENT DE L'APPLICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const app = new LandingApp();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 EXPORT POUR UTILISATION EXTERNE (optionnel)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LandingApp,
        NavigationManager,
        AuthStateManager,
        HeroChartManager,
        PricingManager
    };
}