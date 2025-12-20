/* ============================================
   HELP.JS - Gestion de la page d'aide
   ============================================ */

// Variables globales
let currentUserData = null;

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de la page d\'aide...');
    
    initializeEventListeners();
    console.log('Page d\'aide initialisée');
});

window.addEventListener('userDataLoaded', function(e) {
    currentUserData = e.detail;
    console.log('Données utilisateur reçues:', currentUserData);
    prefillContactForm();
});

// ============================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================

function initializeEventListeners() {
    // Navigation entre tabs
    const tabButtons = document.querySelectorAll('.help-nav-item');
    tabButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Accordéon FAQ
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(function(question) {
        question.addEventListener('click', function(e) {
            e.preventDefault();
            toggleFaqItem(this.parentElement);
        });
    });
    
    // Recherche FAQ
    const searchInput = document.getElementById('faqSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterFaq(e.target.value);
        });
    }
    
    // Formulaire de contact
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Compteur de caractères
    const messageTextarea = document.getElementById('contactMessage');
    if (messageTextarea) {
        messageTextarea.addEventListener('input', updateCharCounter);
    }
}

// ============================================
// NAVIGATION TABS
// ============================================

function switchTab(tabName) {
    console.log('Changement vers tab:', tabName);
    
    // Désactiver tous les boutons et tabs
    document.querySelectorAll('.help-nav-item').forEach(function(btn) {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.help-tab').forEach(function(tab) {
        tab.classList.remove('active');
    });
    
    // Activer le bouton sélectionné
    const activeNavBtn = document.querySelector('.help-nav-item[data-tab="' + tabName + '"]');
    if (activeNavBtn) {
        activeNavBtn.classList.add('active');
    }
    
    // Activer le tab sélectionné
    const activeTab = document.getElementById('tab-' + tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    console.log('Onglet changé:', tabName);
}

// ============================================
// ACCORDÉON FAQ
// ============================================

function toggleFaqItem(faqItem) {
    const isActive = faqItem.classList.contains('active');
    
    // Fermer tous les autres items
    document.querySelectorAll('.faq-item').forEach(function(item) {
        if (item !== faqItem) {
            item.classList.remove('active');
        }
    });
    
    // Toggle l'item cliqué
    if (isActive) {
        faqItem.classList.remove('active');
    } else {
        faqItem.classList.add('active');
    }
}

// ============================================
// RECHERCHE FAQ
// ============================================

function filterFaq(searchTerm) {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const faqItems = document.querySelectorAll('.faq-item');
    let visibleCount = 0;
    
    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question span').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
        
        const matches = question.includes(normalizedSearch) || answer.includes(normalizedSearch);
        
        if (matches || normalizedSearch === '') {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
            item.classList.remove('active');
        }
    });
    
    // Afficher un message si aucun résultat
    const existingNoResults = document.getElementById('noFaqResults');
    if (existingNoResults) {
        existingNoResults.remove();
    }
    
    if (visibleCount === 0 && normalizedSearch !== '') {
        const noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'noFaqResults';
        noResultsMsg.className = 'no-results-message';
        
        const escapedTerm = searchTerm.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        noResultsMsg.innerHTML = 
            '<i class="fas fa-search"></i>' +
            '<p>No results found for "<strong>' + escapedTerm + '</strong>"</p>' +
            '<p>Try different keywords or <a href="#" onclick="switchTab(\'contact\'); return false;">contact support</a></p>';
        
        const faqContainer = document.querySelector('#tab-faq');
        faqContainer.appendChild(noResultsMsg);
    }
    
    console.log('Recherche FAQ:', searchTerm, '→', visibleCount, 'résultats');
}

// ============================================
// FORMULAIRE DE CONTACT
// ============================================

function prefillContactForm() {
    if (!currentUserData) return;
    
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    
    if (nameInput && currentUserData.displayName) {
        nameInput.value = currentUserData.displayName;
    }
    
    if (emailInput && currentUserData.email) {
        emailInput.value = currentUserData.email;
    }
    
    console.log('Formulaire pré-rempli avec les données utilisateur');
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        name: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        category: document.getElementById('contactCategory').value,
        subject: document.getElementById('contactSubject').value.trim(),
        message: document.getElementById('contactMessage').value.trim(),
        timestamp: new Date().toISOString(),
        userId: currentUserData ? currentUserData.uid : 'anonymous'
    };
    
    // Validation
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
        showToast('error', 'Error', 'Please fill in all required fields');
        return;
    }
    
    if (!isValidEmail(formData.email)) {
        showToast('error', 'Error', 'Please enter a valid email address');
        return;
    }
    
    if (formData.message.length > 1000) {
        showToast('error', 'Error', 'Message must not exceed 1000 characters');
        return;
    }
    
    try {
        showToast('info', 'Sending...', 'Your message is being sent');
        
        // Construire l'email mailto
        const subject = encodeURIComponent('[' + formData.category.toUpperCase() + '] ' + formData.subject);
        const body = encodeURIComponent(
            'Name: ' + formData.name + '\n' +
            'Email: ' + formData.email + '\n' +
            'Category: ' + formData.category + '\n' +
            'User ID: ' + formData.userId + '\n\n' +
            'Message:\n' + formData.message + '\n\n' +
            '---\n' +
            'Sent from AlphaVault AI Help Center on ' + new Date().toLocaleString()
        );
        
        // Ouvrir le client email
        window.location.href = 'mailto:support@alphavault-ai.com?subject=' + subject + '&body=' + body;
        
        // Optionnel: Sauvegarder dans Firestore
        if (currentUserData && typeof firebaseDb !== 'undefined') {
            try {
                await firebaseDb.collection('support_tickets').add(formData);
                console.log('Ticket sauvegardé dans Firestore');
            } catch (firestoreError) {
                console.warn('Impossible de sauvegarder dans Firestore:', firestoreError);
            }
        }
        
        showToast('success', 'Success!', 'Your email client has been opened. Send the pre-filled email to complete your request.');
        
        // Réinitialiser le formulaire
        form.reset();
        const charCountSpan = document.getElementById('charCount');
        if (charCountSpan) {
            charCountSpan.textContent = '0';
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
        showToast('error', 'Error', 'Unable to send your message. Please email us directly at support@alphavault-ai.com');
    }
}

function updateCharCounter(e) {
    const textarea = e.target;
    const charCount = textarea.value.length;
    const charCountSpan = document.getElementById('charCount');
    
    if (charCountSpan) {
        charCountSpan.textContent = charCount;
        
        if (charCount > 1000) {
            charCountSpan.style.color = '#ef4444';
        } else if (charCount > 800) {
            charCountSpan.style.color = '#f59e0b';
        } else {
            charCountSpan.style.color = '';
        }
    }
}

// ============================================
// UTILITAIRES
// ============================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showToast(type, title, message) {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        console.log('[' + type.toUpperCase() + '] ' + title + ': ' + message);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    let iconClass = 'fa-info-circle';
    switch(type) {
        case 'success':
            iconClass = 'fa-check-circle';
            break;
        case 'error':
            iconClass = 'fa-times-circle';
            break;
        case 'info':
            iconClass = 'fa-info-circle';
            break;
    }
    
    toast.innerHTML = 
        '<div class="toast-icon">' +
            '<i class="fas ' + iconClass + '"></i>' +
        '</div>' +
        '<div class="toast-content">' +
            '<div class="toast-title">' + title + '</div>' +
            '<div class="toast-message">' + message + '</div>' +
        '</div>';
    
    toastContainer.appendChild(toast);
    
    setTimeout(function() {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(function() {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

console.log('Script help.js chargé avec succès');