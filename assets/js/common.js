/* ==============================================
   COMMON.JS - Fonctions partagées entre toutes les pages
   ============================================== */

// ========== GESTION DE LA NAVIGATION ==========
document.addEventListener('DOMContentLoaded', function() {
    // Marquer le lien actif dans la navigation
    highlightActiveNavLink();
    
    // Charger les modals dynamiquement si nécessaire
    loadModalContent();
});

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
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Modal not found:', modalId);
    }
}

/**
 * Ferme une modal par son ID
 * @param {string} modalId - L'ID de la modal à fermer
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/**
 * Ferme une modal en cliquant en dehors
 */
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

/**
 * Ferme les modals avec la touche Échap
 */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});


// ========== FONCTIONS UTILITAIRES ==========

/**
 * Formatte un nombre avec séparateurs de milliers
 * @param {number} value - Le nombre à formater
 * @param {number} decimals - Nombre de décimales
 * @returns {string} Nombre formaté
 */
function formatNumber(value, decimals = 0) {
    return value.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Calcule le percentile d'un tableau
 * @param {Array} arr - Tableau de nombres
 * @param {number} p - Percentile (0-100)
 * @returns {number} Valeur du percentile
 */
function percentile(arr, p) {
    const sorted = arr.slice().sort((a, b) => a - b);
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
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
}

/**
 * Sauvegarde des données dans localStorage
 * @param {string} key - Clé de stockage
 * @param {*} data - Données à sauvegarder
 */
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
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
 * Charge le contenu des modals depuis des fichiers externes
 */
function loadModalContent() {
    // Cette fonction peut être utilisée plus tard pour charger
    // les modals depuis des fichiers HTML séparés
    // Pour l'instant, on les garde dans chaque page
}

/**
 * Affiche un message de notification
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Styles inline pour la notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    // Couleur selon le type
    const colors = {
        'success': 'linear-gradient(135deg, #4A74F3 0%, #6C8BE0 100%)',
        'error': 'linear-gradient(135deg, #9D5CE6 0%, #C39BD3 100%)',
        'info': 'linear-gradient(135deg, #2649B2 0%, #8E44AD 100%)'
    };
    notification.style.background = colors[type] || colors['info'];
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Retirer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Ajouter les animations CSS pour les notifications
const style = document.createElement('style');
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
`;
document.head.appendChild(style);

// Exporter les fonctions pour utilisation globale
window.FinanceDashboard = {
    openModal,
    closeModal,
    formatNumber,
    percentile,
    adjustForInflation,
    randomNormal,
    saveToLocalStorage,
    loadFromLocalStorage,
    showNotification
};