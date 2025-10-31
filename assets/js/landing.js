/* ============================================
   LANDING.JS - FinancePro Landing Page
   Interactive Features & Animations
   ============================================ */

// ============================================
// NAVIGATION SCROLL EFFECT
// ============================================
const nav = document.getElementById('landingNav');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add/remove scrolled class
    if (scrollTop > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// ============================================
// SMOOTH SCROLL FOR NAVIGATION LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offset = 80; // Navigation height
            const targetPosition = target.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });
});

// ============================================
// HERO CHART ANIMATION
// ============================================
const heroChartCanvas = document.getElementById('heroChart');

if (heroChartCanvas) {
    const ctx = heroChartCanvas.getContext('2d');
    
    // Generate sample data
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data1 = [65000, 72000, 68000, 85000, 92000, 105000];
    const data2 = [45000, 52000, 58000, 62000, 71000, 78000];
    
    const heroChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Portfolio Value',
                    data: data1,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#667eea',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2
                },
                {
                    label: 'Benchmark',
                    data: data2,
                    borderColor: '#d1d5db',
                    backgroundColor: 'rgba(209, 213, 219, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#9ca3af',
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
                            label += '$' + context.parsed.y.toLocaleString();
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
                        color: '#6b7280'
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
                        color: '#6b7280',
                        callback: function(value) {
                            return '$' + (value / 1000) + 'K';
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
    
    // Animate chart on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heroChart.update('show');
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(heroChartCanvas);
}

// ============================================
// PRICING TOGGLE (Monthly/Annual)
// ============================================
const pricingToggle = document.getElementById('pricingToggle');
const priceAmounts = document.querySelectorAll('.amount');

if (pricingToggle) {
    pricingToggle.addEventListener('change', function() {
        priceAmounts.forEach(amount => {
            const monthlyPrice = amount.getAttribute('data-monthly');
            const annualPrice = amount.getAttribute('data-annual');
            
            if (monthlyPrice && annualPrice) {
                if (this.checked) {
                    // Annual pricing
                    amount.textContent = annualPrice;
                } else {
                    // Monthly pricing
                    amount.textContent = monthlyPrice;
                }
            }
        });
    });
}

// ============================================
// INTERACTIVE DEMO - SEARCH FUNCTIONALITY
// ============================================
const companySearch = document.getElementById('companySearch');
const companyResults = document.querySelectorAll('.company-result-card');

if (companySearch) {
    companySearch.addEventListener('input', function() {
        const searchValue = this.value.toLowerCase();
        
        // Simple demo filter (in production, this would be an API call)
        companyResults.forEach(card => {
            const companyName = card.querySelector('.company-details h4').textContent.toLowerCase();
            
            if (companyName.includes(searchValue) || searchValue === '') {
                card.style.display = 'block';
                // Add entrance animation
                card.style.animation = 'fadeInUp 0.3s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update results count
        const visibleCards = Array.from(companyResults).filter(card => card.style.display !== 'none');
        const resultsHeader = document.querySelector('.results-header span:first-child');
        if (resultsHeader) {
            resultsHeader.textContent = `${visibleCards.length} comparable companies found`;
        }
    });
}

// ============================================
// CTA BUTTONS EVENT HANDLERS
// ============================================
const ctaButtons = {
    loginBtn: document.getElementById('loginBtn'),
    signupBtn: document.getElementById('signupBtn'),
    heroGetStarted: document.getElementById('heroGetStarted'),
    heroWatchDemo: document.getElementById('heroWatchDemo'),
    tryDemoBtn: document.getElementById('tryDemoBtn'),
    finalCTABtn: document.getElementById('finalCTABtn'),
    scheduleDemo: document.getElementById('scheduleDemo')
};

// Login button
if (ctaButtons.loginBtn) {
    ctaButtons.loginBtn.addEventListener('click', () => {
        console.log('Login clicked');
        // In production: redirect to login page or show modal
        alert('Login functionality will be implemented here');
    });
}

// Signup buttons
[ctaButtons.signupBtn, ctaButtons.heroGetStarted, ctaButtons.finalCTABtn].forEach(btn => {
    if (btn) {
        btn.addEventListener('click', () => {
            console.log('Signup clicked');
            // In production: redirect to signup page or show modal
            alert('Sign up functionality will be implemented here');
        });
    }
});

// Demo buttons
[ctaButtons.heroWatchDemo, ctaButtons.tryDemoBtn, ctaButtons.scheduleDemo].forEach(btn => {
    if (btn) {
        btn.addEventListener('click', () => {
            console.log('Demo clicked');
            // In production: show video modal or redirect to demo page
            alert('Demo functionality will be implemented here');
        });
    }
});

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
const revealElements = document.querySelectorAll('[data-aos]');

const revealOnScroll = () => {
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('aos-animate');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Initial check

// ============================================
// NUMBER COUNTER ANIMATION
// ============================================
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        // Format number with commas
        element.textContent = value.toLocaleString();
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animate proof numbers when visible
const proofNumbers = document.querySelectorAll('.proof-number');
let numbersAnimated = false;

const animateNumbers = () => {
    const firstNumber = proofNumbers[0];
    if (!firstNumber) return;
    
    const rect = firstNumber.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
    
    if (isVisible && !numbersAnimated) {
        numbersAnimated = true;
        
        // Animate each number
        if (proofNumbers[0]) {
            proofNumbers[0].textContent = '0';
            animateValue(proofNumbers[0], 0, 10000, 2000);
        }
        if (proofNumbers[1]) {
            proofNumbers[1].textContent = '0';
            animateValue(proofNumbers[1], 0, 1000000, 2000);
        }
        if (proofNumbers[2]) {
            proofNumbers[2].textContent = '0';
            animateValue(proofNumbers[2], 0, 500000, 2000);
        }
    }
};

window.addEventListener('scroll', animateNumbers);
animateNumbers(); // Initial check

// ============================================
// PARTICLE BACKGROUND EFFECT (Optional)
// ============================================
function createParticles() {
    const hero = document.querySelector('.hero-bg');
    if (!hero) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: rgba(102, 126, 234, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        hero.appendChild(particle);
    }
}

// Uncomment to enable particles
// createParticles();

// ============================================
// FEATURE CARDS TILT EFFECT
// ============================================
const featureCards = document.querySelectorAll('.feature-card');

featureCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ============================================
// CONSOLE EASTER EGG
// ============================================
console.log('%c👋 Hey there, Developer!', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cInterested in joining our team? Check out our careers page!', 'color: #6b7280; font-size: 14px;');
console.log('%c🚀 FinancePro - Built with passion for finance', 'color: #10b981; font-size: 12px;');

// ============================================
// PERFORMANCE MONITORING
// ============================================
window.addEventListener('load', () => {
    if ('performance' in window) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Page loaded in ${pageLoadTime}ms`);
    }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
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

// Throttle function for scroll events
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

// Apply throttle to scroll-heavy functions
window.addEventListener('scroll', throttle(revealOnScroll, 100));
window.addEventListener('scroll', throttle(animateNumbers, 100));

console.log('✅ Landing page initialized successfully!');