// ========================================
// ADMIN VISIBILITY - AFFICHE LE MENU ADMIN
// ========================================

// 🔐 TON EMAIL ADMIN (À MODIFIER)
const ADMIN_EMAIL = 'raphnardone@gmail.com'; // ⚠ CHANGE ICI

class AdminVisibility {
    constructor() {
        this.init();
    }

    init() {
        // Attendre que Firebase soit initialisé
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.warn('⚠ Firebase not loaded yet - retrying...');
            setTimeout(() => this.init(), 500);
            return;
        }

        firebase.auth().onAuthStateChanged((user) => {
            this.checkAdminAccess(user);
        });
    }

    checkAdminAccess(user) {
        const adminSection = document.getElementById('adminSection');
        
        if (!adminSection) {
            console.warn('⚠ Admin section not found in sidebar');
            return;
        }

        if (user && user.email === ADMIN_EMAIL) {
            // ✅ C'est l'admin - afficher le menu
            adminSection.style.display = 'block';
            console.log('🔓 Admin menu visible for:', user.email);
        } else {
            // ❌ Pas l'admin - masquer le menu
            adminSection.style.display = 'none';
            if (user) {
                console.log('🔒 Admin menu hidden for:', user.email);
            }
        }
    }
}

// Initialiser automatiquement
document.addEventListener('DOMContentLoaded', () => {
    new AdminVisibility();
});