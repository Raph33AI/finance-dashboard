// ========================================
// ADMIN VISIBILITY - AFFICHE LE MENU ADMIN UNIQUEMENT POUR L'ADMIN
// ========================================

// 🔐 EMAIL ADMIN AUTORISÉ (NE PAS MODIFIER SANS RAISON VALABLE)
const ADMIN_EMAIL = 'raphnardone@gmail.com';

class AdminVisibility {
    constructor() {
        this.adminSection = null;
        this.init();
    }

    init() {
        console.log('🔐 Admin Visibility: Initialisation...');
        
        // Attendre que Firebase soit chargé
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.warn('⚠ Firebase pas encore chargé - nouvelle tentative dans 500ms...');
            setTimeout(() => this.init(), 500);
            return;
        }

        // Récupérer la section admin
        this.adminSection = document.getElementById('adminSection');
        
        if (!this.adminSection) {
            console.log('ℹ Aucune section admin trouvée sur cette page (normal pour certaines pages)');
            return;
        }

        // S'assurer que la section est bien masquée au départ
        this.adminSection.style.display = 'none';

        // Écouter les changements d'authentification
        firebase.auth().onAuthStateChanged((user) => {
            this.checkAdminAccess(user);
        });
    }

    checkAdminAccess(user) {
        if (!this.adminSection) {
            return;
        }

        if (user && user.email === ADMIN_EMAIL) {
            // ✅ C'EST L'ADMIN - AFFICHER LA SECTION
            this.adminSection.style.display = 'block';
            this.adminSection.style.removeProperty('display'); // Enlever le style inline
            console.log('✅ Section Admin visible pour:', user.email);
        } else {
            // ❌ PAS L'ADMIN - MASQUER TOTALEMENT LA SECTION
            this.adminSection.style.display = 'none';
            
            if (user) {
                console.log('🔒 Section Admin masquée pour:', user.email, '(pas autorisé)');
            } else {
                console.log('🔒 Section Admin masquée (utilisateur non connecté)');
            }
        }
    }
}

// ========================================
// INITIALISATION AUTOMATIQUE
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    new AdminVisibility();
});