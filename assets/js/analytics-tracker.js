// ========================================
// ANALYTICS TRACKER - À INCLURE SUR TOUTES LES PAGES
// ========================================

class AnalyticsTracker {
    constructor() {
        this.db = firebase.firestore();
        this.trackPageVisit();
    }

    async trackPageVisit() {
        try {
            const visitData = {
                page: window.location.pathname,
                url: window.location.href,
                referrer: document.referrer || 'direct',
                userAgent: navigator.userAgent,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                screenWidth: window.screen.width,
                screenHeight: window.screen.height
            };

            // Ajouter l'utilisateur si connecté
            const user = firebase.auth().currentUser;
            if (user) {
                visitData.userId = user.uid;
                visitData.userEmail = user.email;
            }

            await this.db.collection('analytics_visits').add(visitData);
            console.log('📊 Visite trackée');

        } catch (error) {
            console.error('Erreur tracking:', error);
        }
    }

    async trackEvent(type, details) {
        try {
            const user = firebase.auth().currentUser;
            
            await this.db.collection('analytics_activity').add({
                type: type,
                details: details,
                userId: user?.uid || null,
                userEmail: user?.email || null,
                page: window.location.pathname,
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