/* ==============================================
   COMMON.JS - Fonctions partagées entre toutes les pages
   Version optimisée ES6+ avec meilleures pratiques 2024
   ============================================== */

// ========== GESTION DE LA NAVIGATION ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeCommonFeatures();
});

/**
 * Initialise toutes les fonctionnalités communes
 */
function initializeCommonFeatures() {
    highlightActiveNavLink();
    setupModalEventListeners();
    setupKeyboardNavigation();
}

/**
 * Met en surbrillance le lien de navigation actif
 */
function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ========== GESTION DES MODALS ==========

/**
 * Ouvre une modal par son ID
 * @param {string} modalId - L'ID de la modal à ouvrir
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('Modal not found:', modalId);
        return;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus sur le premier élément focusable
    const focusableElement = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElement) {
        setTimeout(() => focusableElement.focus(), 100);
    }
    
    // Trap focus dans la modal
    trapFocus(modal);
}

/**
 * Ferme une modal par son ID
 * @param {string} modalId - L'ID de la modal à fermer
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Remettre le focus sur l'élément qui a ouvert la modal si possible
    const trigger = document.querySelector(`[onclick*="${modalId}"]`);
    if (trigger) {
        trigger.focus();
    }
}

/**
 * Ferme une modal en cliquant en dehors
 */
function setupModalEventListeners() {
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Piège le focus dans une modal pour l'accessibilité
 * @param {HTMLElement} modal - L'élément modal
 */
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    });
}

/**
 * Gestion du clavier pour fermer les modals
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal.active');
            activeModals.forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });
}

// ========== FONCTIONS UTILITAIRES ==========

/**
 * Formatte un nombre avec séparateurs de milliers
 * @param {number} value - Le nombre à formater
 * @param {number} decimals - Nombre de décimales
 * @returns {string} Nombre formaté
 */
function formatNumber(value, decimals = 0) {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Formatte un nombre en devise
 * @param {number} value - Le montant
 * @param {string} currency - Code devise (défaut: EUR)
 * @returns {string} Montant formaté
 */
function formatCurrency(value, currency = 'EUR') {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency
    }).format(value);
}

/**
 * Formatte un nombre en pourcentage
 * @param {number} value - La valeur (0.15 = 15%)
 * @param {number} decimals - Nombre de décimales
 * @returns {string} Pourcentage formaté
 */
function formatPercent(value, decimals = 2) {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Calcule le percentile d'un tableau
 * @param {Array<number>} arr - Tableau de nombres
 * @param {number} p - Percentile (0-100)
 * @returns {number} Valeur du percentile
 */
function percentile(arr, p) {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Ajuste une valeur pour l'inflation
 * @param {number} value - Valeur nominale
 * @param {number} monthIndex - Index du mois
 * @param {number} inflationRate - Taux d'inflation annuel (%)
 * @returns {number} Valeur ajustée
 */
function adjustForInflation(value, monthIndex, inflationRate) {
    const monthlyInflation = Math.pow(1 + inflationRate / 100, 1/12) - 1;
    return value / Math.pow(1 + monthlyInflation, monthIndex);
}

/**
 * Génère une distribution normale aléatoire (Box-Muller)
 * @param {number} mean - Moyenne
 * @param {number} stdDev - Écart-type
 * @returns {number} Valeur aléatoire suivant N(mean, stdDev)
 */
function randomNormal(mean = 0, stdDev = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
}

/**
 * Sauvegarde des données dans localStorage avec gestion d'erreur
 * @param {string} key - Clé de stockage
 * @param {*} data - Données à sauvegarder
 * @returns {boolean} Succès de l'opération
 */
function saveToLocalStorage(key, data) {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        if (error.name === 'QuotaExceededError') {
            showNotification('Storage quota exceeded. Please clear some data.', 'error');
        }
        return false;
    }
}

/**
 * Récupère des données depuis localStorage
 * @param {string} key - Clé de stockage
 * @returns {*} Données récupérées ou null
 */
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

/**
 * Supprime une clé du localStorage
 * @param {string} key - Clé à supprimer
 */
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

/**
 * Affiche un message de notification moderne
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification ('success', 'error', 'info', 'warning')
 * @param {number} duration - Durée en ms (défaut: 3000)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    // Icônes selon le type
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            ${icons[type] || icons.info}
            <span>${message}</span>
        </div>
        <button class="notification-close" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Styles inline pour la notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        max-width: 500px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    `;
    
    // Couleur selon le type
    const colors = {
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        info: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
    };
    notification.style.background = colors[type] || colors.info;
    
    // Bouton de fermeture
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.25rem;
        opacity: 0.8;
        transition: opacity 0.2s;
    `;
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.8');
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Retirer après la durée spécifiée
    if (duration > 0) {
        setTimeout(() => removeNotification(notification), duration);
    }
}

/**
 * Retire une notification avec animation
 * @param {HTMLElement} notification - L'élément notification
 */
function removeNotification(notification) {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

/**
 * Debounce function - Limite l'exécution d'une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Délai en ms
 * @returns {Function} Fonction debouncée
 */
function debounce(func, wait = 300) {
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
 * Throttle function - Limite le taux d'exécution
 * @param {Function} func - Fonction à throttler
 * @param {number} limit - Intervalle minimum en ms
 * @returns {Function} Fonction throttlée
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Copie du texte dans le presse-papiers
 * @param {string} text - Texte à copier
 * @returns {Promise<boolean>} Succès de l'opération
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success', 2000);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        showNotification('Failed to copy to clipboard', 'error');
        return false;
    }
}

/**
 * Détecte si l'utilisateur est sur mobile
 * @returns {boolean} True si mobile
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Formate une date de manière lisible
 * @param {Date|string|number} date - Date à formater
 * @param {string} locale - Locale (défaut: 'fr-FR')
 * @returns {string} Date formatée
 */
function formatDate(date, locale = 'fr-FR') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    return d.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Formate une date et heure
 * @param {Date|string|number} date - Date à formater
 * @param {string} locale - Locale (défaut: 'fr-FR')
 * @returns {string} Date et heure formatées
 */
function formatDateTime(date, locale = 'fr-FR') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    return d.toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Calcule le temps écoulé depuis une date (ex: "il y a 2 heures")
 * @param {Date|string|number} date - Date de référence
 * @returns {string} Temps écoulé formaté
 */
function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `il y a ${interval} ${unit}${interval > 1 ? 's' : ''}`;
        }
    }
    
    return 'à l\'instant';
}

/**
 * Génère un ID unique
 * @returns {string} ID unique
 */
function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} True si valide
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Tronque un texte avec ellipsis
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

/**
 * Scroll smooth vers un élément
 * @param {string|HTMLElement} target - Sélecteur ou élément
 * @param {number} offset - Offset en pixels
 */
function scrollToElement(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Ajouter les animations CSS pour les notifications si elles n'existent pas déjà
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
        }
        
        .notification-content i {
            font-size: 1.25rem;
            flex-shrink: 0;
        }
        
        .notification-close:hover {
            transform: scale(1.1);
        }
        
        @media (max-width: 768px) {
            .notification {
                left: 20px;
                right: 20px;
                min-width: auto !important;
                max-width: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Exporter les fonctions pour utilisation globale
window.FinanceDashboard = {
    // Modals
    openModal,
    closeModal,
    
    // Formatage
    formatNumber,
    formatCurrency,
    formatPercent,
    formatDate,
    formatDateTime,
    timeAgo,
    
    // Calculs
    percentile,
    adjustForInflation,
    randomNormal,
    
    // Storage
    saveToLocalStorage,
    loadFromLocalStorage,
    removeFromLocalStorage,
    
    // UI
    showNotification,
    scrollToElement,
    
    // Utilitaires
    debounce,
    throttle,
    copyToClipboard,
    isMobileDevice,
    generateUniqueId,
    isValidEmail,
    truncateText
};

// Export pour modules ES6 si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.FinanceDashboard;
}