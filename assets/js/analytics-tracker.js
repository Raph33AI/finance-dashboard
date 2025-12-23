// ========================================
// ANALYTICS TRACKER - VERSION CORRIGÉE
// ========================================

class AnalyticsTracker {
    constructor() {
        this.db = firebase.firestore();
        this.trackPageVisit();
    }

    async trackPageVisit() {
        try {
            // ✅ CORRECTION: Extraire correctement le nom de la page
            const fullPath = window.location.pathname;
            let pageName = fullPath.split('/').pop() || 'index.html';
            
            // Si c'est juste "/", considérer comme index.html
            if (pageName === '' || pageName === '/') {
                pageName = 'index.html';
            }
            
            const visitData = {
                page: pageName, // ✅ Nom court de la page
                url: window.location.href, // URL complète
                path: fullPath, // Chemin complet
                referrer: document.referrer || 'direct',
                userAgent: navigator.userAgent,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                language: navigator.language,
                // ✅ Ajouter device type
                deviceType: this.getDeviceType()
            };

            // Ajouter l'utilisateur si connecté
            const user = firebase.auth().currentUser;
            if (user) {
                visitData.userId = user.uid;
                visitData.userEmail = user.email;
            }

            await this.db.collection('analytics_visits').add(visitData);
            console.log('📊 Visite trackée:', pageName);

        } catch (error) {
            console.error('Erreur tracking:', error);
        }
    }

    getDeviceType() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return 'mobile';
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
            return 'tablet';
        }
        return 'desktop';
    }

    async trackEvent(type, details) {
        try {
            const user = firebase.auth().currentUser;
            
            await this.db.collection('analytics_activity').add({
                type: type,
                details: details,
                userId: user?.uid || null,
                userEmail: user?.email || null,
                page: window.location.pathname.split('/').pop() || 'index.html',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('📊 Événement tracké:', type);

        } catch (error) {
            console.error('Erreur tracking event:', error);
        }
    }
}

// Initialiser automatiquement
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(() => {
            window.analyticsTracker = new AnalyticsTracker();
        });
    }
});