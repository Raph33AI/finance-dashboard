/* ============================================
   DOCUMENTATION.JS - Gestion des pages de documentation
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Documentation page initialized');
    
    // Smooth scroll pour les ancres
    initializeSmoothScroll();
    
    // Active la navigation sidebar selon le scroll
    initializeScrollSpy();
    
    // Copie de code
    initializeCodeCopy();
    
    // User menu
    initializeUserMenu();
});

// ============================================
// SMOOTH SCROLL
// ============================================

function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignore les liens vides
            if (href === '#' || href === '#!') {
                return;
            }
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update URL sans recharger
                history.pushState(null, null, href);
            }
        });
    });
}

// ============================================
// SCROLL SPY (active le lien de navigation)
// ============================================

function initializeScrollSpy() {
    const sections = document.querySelectorAll('.doc-section[id]');
    const navLinks = document.querySelectorAll('.doc-nav a');
    
    if (sections.length === 0 || navLinks.length === 0) {
        return;
    }
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(function(section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(function(link) {
            link.classList.remove('active');
            
            const href = link.getAttribute('href');
            if (href === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// COPIE DE CODE
// ============================================

function initializeCodeCopy() {
    const codeExamples = document.querySelectorAll('.code-example');
    
    codeExamples.forEach(function(codeExample) {
        const header = codeExample.querySelector('.code-header');
        
        if (!header) return;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.title = 'Copy code';
        
        header.appendChild(copyButton);
        
        copyButton.addEventListener('click', function() {
            const codeBody = codeExample.querySelector('.code-body');
            const codeText = codeBody.textContent.trim();
            
            navigator.clipboard.writeText(codeText).then(function() {
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                copyButton.style.color = '#10b981';
                
                setTimeout(function() {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    copyButton.style.color = '';
                }, 2000);
            }).catch(function(err) {
                console.error('Erreur copie:', err);
            });
        });
    });
}

// ============================================
// USER MENU
// ============================================

function initializeUserMenu() {
    const sidebarUserTrigger = document.getElementById('sidebarUserTrigger');
    const sidebarUserDropdown = document.getElementById('sidebarUserDropdown');
    
    if (sidebarUserTrigger && sidebarUserDropdown) {
        sidebarUserTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebarUserTrigger.classList.toggle('active');
            sidebarUserDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!sidebarUserDropdown.contains(e.target) && 
                !sidebarUserTrigger.contains(e.target)) {
                sidebarUserTrigger.classList.remove('active');
                sidebarUserDropdown.classList.remove('active');
            }
        });
        
        sidebarUserDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

console.log('Documentation.js loaded successfully');