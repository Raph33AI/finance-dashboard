/* ============================================
   AUTH-GUARD.JS - Protection des pages
   Empêche l'accès aux pages protégées sans connexion
   ============================================ */

(function() {
    'use strict';
    
    // Pages qui nécessitent une authentification
    const protectedPages = [
        'dashboard-financier.html',
        'portfolio-optimizer.html',
        'advanced-analysis.html',
        'market-data.html',
        'monte-carlo.html',
        'risk-parity.html',
        'scenario-analysis.html',
        'trend-prediction.html'
    ];
    
    // Obtenir le nom de la page actuelle
    const currentPage = window.location.pathname.split('/').pop();
    
    // Vérifier si la page actuelle est protégée
    const isProtectedPage = protectedPages.some(page => currentPage.includes(page));
    
    if (isProtectedPage) {
        console.log('🔒 Page protégée détectée:', currentPage);
        
        // Vérifier l'authentification
        firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                console.log('❌ Utilisateur non connecté - Redirection...');
                
                // Sauvegarder l'URL de destination
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                
                // Rediriger vers la page de connexion
                window.location.replace('auth.html');
            } else {
                console.log('✅ Utilisateur connecté:', user.email);
                
                // Charger les données utilisateur
                loadUserData(user);
            }
        });
    }
    
    /**
     * Charger les données utilisateur depuis Firestore
     */
    async function loadUserData(user) {
        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('📊 Données utilisateur chargées:', userData);
                
                // Stocker dans window pour accès global
                window.currentUserData = {
                    ...userData,
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                };
                
                // Déclencher un événement personnalisé
                window.dispatchEvent(new CustomEvent('userDataLoaded', {
                    detail: window.currentUserData
                }));
                
                // Mettre à jour l'interface utilisateur
                updateUIWithUserData(window.currentUserData);
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
        }
    }
    
    /**
     * Mettre à jour l'interface avec les données utilisateur
     */
    function updateUIWithUserData(userData) {
        // Mettre à jour le nom d'utilisateur si l'élément existe
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(el => {
            el.textContent = userData.displayName || `${userData.firstName} ${userData.lastName}`;
        });
        
        // Mettre à jour l'email
        const userEmailElements = document.querySelectorAll('[data-user-email]');
        userEmailElements.forEach(el => {
            el.textContent = userData.email;
        });
        
        // Mettre à jour la photo de profil
        const userPhotoElements = document.querySelectorAll('[data-user-photo]');
        userPhotoElements.forEach(el => {
            if (userData.photoURL) {
                el.src = userData.photoURL;
            }
        });
        
        // Mettre à jour le plan
        const userPlanElements = document.querySelectorAll('[data-user-plan]');
        userPlanElements.forEach(el => {
            el.textContent = userData.plan === 'free' ? 'Gratuit' : 
                            userData.plan === 'professional' ? 'Professionnel' : 
                            userData.plan === 'enterprise' ? 'Enterprise' : 'Inconnu';
        });
    }
    
    /**
     * Fonction de déconnexion globale
     */
    window.logout = async function() {
        try {
            await firebase.auth().signOut();
            console.log('✅ Déconnexion réussie');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
        }
    };
    
})();

console.log('✅ Auth Guard chargé');