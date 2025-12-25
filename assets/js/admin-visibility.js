// ========================================
// ADMIN VISIBILITY - AFFICHE LE MENU ADMIN UNIQUEMENT POUR L'ADMIN
// ========================================

// 🔐 EMAIL ADMIN AUTORISÉ (NE PAS MODIFIER SANS RAISON VALABLE)
const ADMIN_EMAIL = 'raphnardone@gmail.com';

class AdminVisibility {
    constructor() {
        this.adminSection = null;
        this.adminNewsletterSection = null; // ✅ NOUVEAU
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

        // Récupérer les sections admin
        this.adminSection = document.getElementById('adminSection');
        this.adminNewsletterSection = document.getElementById('adminNewsletterSection'); // ✅ NOUVEAU
        
        if (!this.adminSection && !this.adminNewsletterSection) {
            console.log('ℹ Aucune section admin trouvée sur cette page (normal pour certaines pages)');
            return;
        }

        // S'assurer que les sections sont bien masquées au départ
        if (this.adminSection) {
            this.adminSection.style.display = 'none';
        }
        
        // ✅ NOUVEAU : Masquer la section newsletter par défaut
        if (this.adminNewsletterSection) {
            this.adminNewsletterSection.style.display = 'none';
        }

        // Écouter les changements d'authentification
        firebase.auth().onAuthStateChanged((user) => {
            this.checkAdminAccess(user);
        });
    }

    checkAdminAccess(user) {
        const isAdmin = user && user.email === ADMIN_EMAIL;

        // ✅ GESTION DE LA SECTION ADMIN (SIDEBAR)
        if (this.adminSection) {
            if (isAdmin) {
                this.adminSection.style.display = 'block';
                this.adminSection.style.removeProperty('display');
                console.log('✅ Section Admin (Sidebar) visible pour:', user.email);
            } else {
                this.adminSection.style.display = 'none';
                if (user) {
                    console.log('🔒 Section Admin (Sidebar) masquée pour:', user.email, '(pas autorisé)');
                } else {
                    console.log('🔒 Section Admin (Sidebar) masquée (utilisateur non connecté)');
                }
            }
        }

        // ✅ NOUVEAU : GESTION DE LA SECTION NEWSLETTER (COMMUNITY HUB)
        if (this.adminNewsletterSection) {
            if (isAdmin) {
                this.adminNewsletterSection.style.display = 'block';
                console.log('✅ Newsletter Button visible pour:', user.email);
            } else {
                this.adminNewsletterSection.style.display = 'none';
                if (user) {
                    console.log('🔒 Newsletter Button masqué pour:', user.email, '(pas autorisé)');
                } else {
                    console.log('🔒 Newsletter Button masqué (utilisateur non connecté)');
                }
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