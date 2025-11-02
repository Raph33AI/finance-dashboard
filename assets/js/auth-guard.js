/* ============================================
   AUTH-GUARD.JS - VERSION DEBUG
   Protection des pages & Chargement des données
   ============================================ */

(function() {
    'use strict';
    
    console.log('🔐 Auth Guard chargé');
    
    // Pages qui nécessitent une authentification
    const protectedPages = [
        'dashboard-financier.html',
        'portfolio-optimizer.html',
        'advanced-analysis.html',
        'market-data.html',
        'monte-carlo.html',
        'risk-parity.html',
        'scenario-analysis.html',
        'trend-prediction.html',
        'investment-analytics.html',
        'user-profile.html',
        'settings.html'
    ];
    
    // Obtenir le nom de la page actuelle
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Vérifier si la page actuelle est protégée
    const isProtectedPage = protectedPages.some(page => currentPage.includes(page));
    
    console.log('📄 Page actuelle:', currentPage);
    console.log('🔒 Page protégée?', isProtectedPage);
    
    /**
     * Charger les données utilisateur depuis Firestore
     */
    async function loadUserData(user) {
        try {
            console.log('📥 Chargement des données utilisateur depuis Firestore...');
            console.log('👤 User UID:', user.uid);
            console.log('📧 User email:', user.email);
            console.log('✅ Email vérifié?', user.emailVerified);
            console.log('👤 Display name:', user.displayName);
            
            const userRef = firebase.firestore().collection('users').doc(user.uid);
            console.log('📍 Référence Firestore:', `users/${user.uid}`);
            
            const userDoc = await userRef.get();
            console.log('📦 Document récupéré, existe?', userDoc.exists);
            
            if (!userDoc.exists) {
                console.log('⚠️ Document utilisateur inexistant, création en cours...');
                
                // Créer le document utilisateur
                const newUserData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=2563eb&color=fff`,
                    emailVerified: user.emailVerified,
                    firstName: '',
                    lastName: '',
                    company: '',
                    phone: '',
                    plan: 'Free',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                console.log('📝 Données à créer:', newUserData);
                
                try {
                    await userRef.set(newUserData);
                    console.log('✅ Document utilisateur créé avec succès !');
                } catch (createError) {
                    console.error('❌ ERREUR lors de la création du document:', createError);
                    console.error('❌ Code erreur:', createError.code);
                    console.error('❌ Message:', createError.message);
                    throw createError;
                }
                
                // Retourner les données
                return {
                    ...newUserData,
                    createdAt: new Date(),
                    lastLoginAt: new Date(),
                    updatedAt: new Date()
                };
                
            } else {
                console.log('✅ Document utilisateur trouvé');
                
                const userData = userDoc.data();
                console.log('📊 Données du document:', userData);
                
                // Mettre à jour le dernier login
                try {
                    await userRef.update({
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('✅ lastLoginAt mis à jour');
                } catch (updateError) {
                    console.error('❌ ERREUR lors de la mise à jour du lastLoginAt:', updateError);
                    console.error('❌ Code erreur:', updateError.code);
                    console.error('❌ Message:', updateError.message);
                }
                
                // Récupérer les données
                return {
                    ...userData,
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified
                };
            }
            
        } catch (error) {
            console.error('❌ ERREUR GLOBALE lors du chargement des données:', error);
            console.error('❌ Code erreur:', error.code);
            console.error('❌ Message:', error.message);
            console.error('❌ Stack:', error.stack);
            return null;
        }
    }
    
    /**
     * Mettre à jour l'interface avec les données utilisateur
     */
    function updateUIWithUserData(userData) {
        console.log('🎨 Mise à jour de l\'interface avec les données utilisateur');
        console.log('📊 Données reçues:', userData);
        
        // Nom complet
        const fullName = userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : userData.displayName || userData.email.split('@')[0];
        
        console.log('👤 Nom complet calculé:', fullName);
        
        // Mettre à jour le nom d'utilisateur
        const userNameElements = document.querySelectorAll('[data-user-name]');
        console.log('🔍 Éléments [data-user-name] trouvés:', userNameElements.length);
        userNameElements.forEach(el => {
            el.textContent = fullName;
            console.log('✏️ Mis à jour:', el);
        });
        
        // Mettre à jour l'email
        const userEmailElements = document.querySelectorAll('[data-user-email]');
        console.log('🔍 Éléments [data-user-email] trouvés:', userEmailElements.length);
        userEmailElements.forEach(el => {
            el.textContent = userData.email;
            console.log('✏️ Mis à jour:', el);
        });
        
        // Mettre à jour la photo de profil
        const photoURL = userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff`;
        console.log('🖼️ Photo URL:', photoURL);
        const userPhotoElements = document.querySelectorAll('[data-user-photo]');
        console.log('🔍 Éléments [data-user-photo] trouvés:', userPhotoElements.length);
        userPhotoElements.forEach(el => {
            el.src = photoURL;
            console.log('✏️ Mis à jour:', el);
        });
        
        // Mettre à jour le plan
        const userPlanElements = document.querySelectorAll('[data-user-plan]');
        console.log('🔍 Éléments [data-user-plan] trouvés:', userPlanElements.length);
        userPlanElements.forEach(el => {
            el.textContent = userData.plan || 'Free';
            console.log('✏️ Mis à jour:', el);
        });
        
        console.log('✅ Interface mise à jour avec succès !');
    }
    
    /**
     * Vérification de l'authentification
     */
    function checkAuthentication() {
        console.log('🔍 Démarrage de la vérification d\'authentification...');
        
        // Attendre que Firebase soit initialisé
        const checkFirebase = setInterval(() => {
            if (window.firebaseAuth || firebase.auth) {
                clearInterval(checkFirebase);
                
                const auth = window.firebaseAuth || firebase.auth();
                console.log('✅ Firebase Auth détecté');
                
                // Écouter les changements d'état d'authentification
                auth.onAuthStateChanged(async (user) => {
                    console.log('🔄 État d\'authentification changé');
                    
                    if (!user) {
                        console.log('❌ Utilisateur non connecté (user = null)');
                        
                        // Si c'est une page protégée, rediriger vers login
                        if (isProtectedPage) {
                            console.log('🔒 Page protégée - Redirection vers login...');
                            
                            // Sauvegarder l'URL de destination
                            sessionStorage.setItem('redirectAfterLogin', window.location.href);
                            console.log('💾 URL sauvegardée:', window.location.href);
                            
                            // Rediriger vers la page de connexion
                            window.location.replace('auth.html');
                        }
                        
                    } else {
                        console.log('✅ Utilisateur connecté !');
                        console.log('👤 UID:', user.uid);
                        console.log('📧 Email:', user.email);
                        console.log('✉️ Email vérifié?', user.emailVerified);
                        console.log('👤 Display name:', user.displayName);
                        console.log('🖼️ Photo URL:', user.photoURL);
                        
                        // Charger les données utilisateur
                        const userData = await loadUserData(user);
                        
                        if (userData) {
                            console.log('✅ Données utilisateur chargées avec succès !');
                            console.log('📊 Données complètes:', userData);
                            
                            // Stocker dans window pour accès global
                            window.currentUserData = userData;
                            console.log('💾 Données stockées dans window.currentUserData');
                            
                            // Mettre à jour l'interface
                            updateUIWithUserData(userData);
                            
                            // Déclencher l'événement userDataLoaded
                            const event = new CustomEvent('userDataLoaded', {
                                detail: userData
                            });
                            window.dispatchEvent(event);
                            
                            console.log('✅ Événement userDataLoaded déclenché !');
                            console.log('📤 Détails de l\'événement:', userData);
                            
                        } else {
                            console.error('❌ Impossible de charger les données utilisateur');
                        }
                    }
                });
            }
        }, 100);
        
        // Timeout de sécurité
        setTimeout(() => {
            clearInterval(checkFirebase);
            if (!window.firebaseAuth && !firebase.auth) {
                console.error('❌ TIMEOUT: Firebase Auth non initialisé après 5 secondes');
            }
        }, 5000);
    }
    
    /**
     * Fonction de déconnexion globale
     */
    window.logout = async function() {
        try {
            console.log('🚪 Déconnexion en cours...');
            const auth = window.firebaseAuth || firebase.auth();
            await auth.signOut();
            console.log('✅ Déconnexion réussie');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
        }
    };
    
    // Démarrer la vérification
    checkAuthentication();
    
})();