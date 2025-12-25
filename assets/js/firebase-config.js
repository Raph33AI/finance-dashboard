// /* ============================================
//    FIREBASE-CONFIG.JS - FinancePro v2.0
//    Configuration Firebase & Gestion Utilisateur Complète
//    ✅ INSCRIPTION AUTOMATIQUE À LA NEWSLETTER
//    ✅ MIGRATION AUTOMATIQUE DES COMPTES EXISTANTS
//    ============================================ */

// // ============================================
// // CONFIGURATION FIREBASE
// // ============================================

// const firebaseConfig = {
//   apiKey: "AIzaSyD9kQ3nyYbYMU--_PsMOtuqtMKlt3gmjRM",
//   authDomain: "financepro-220ba.firebaseapp.com",
//   projectId: "financepro-220ba",
//   storageBucket: "financepro-220ba.firebasestorage.app",
//   messagingSenderId: "917725259549",
//   appId: "1:917725259549:web:5fd909bb04fcf1e4a763f4",
//   measurementId: "G-R9L8JPN5K4"
// };

// // ============================================
// // INITIALISATION FIREBASE
// // ============================================

// let app;
// let auth;
// let db;

// try {
//     // Initialiser Firebase
//     app = firebase.initializeApp(firebaseConfig);
//     auth = firebase.auth();
//     db = firebase.firestore();
    
//     console.log('✅ Firebase initialisé avec succès');
// } catch (error) {
//     console.error('❌ Erreur lors de l\'initialisation Firebase:', error);
// }

// // ============================================
// // CONFIGURATION DE L'AUTHENTIFICATION
// // ============================================

// // Configurer la persistance de session
// auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
//     .then(() => {
//         console.log('✅ Persistance de session configurée');
//     })
//     .catch((error) => {
//         console.error('❌ Erreur de configuration de persistance:', error);
//     });

// // ============================================
// // PROVIDERS D'AUTHENTIFICATION
// // ============================================

// // Google Provider
// const googleProvider = new firebase.auth.GoogleAuthProvider();
// googleProvider.addScope('profile');
// googleProvider.addScope('email');
// googleProvider.setCustomParameters({
//     prompt: 'select_account'
// });

// // Microsoft Provider
// const microsoftProvider = new firebase.auth.OAuthProvider('microsoft.com');
// microsoftProvider.setCustomParameters({
//     tenant: 'common',
//     prompt: 'select_account'
// });

// // Apple Provider
// const appleProvider = new firebase.auth.OAuthProvider('apple.com');
// appleProvider.addScope('email');
// appleProvider.addScope('name');

// // ============================================
// // VARIABLES GLOBALES
// // ============================================

// window.currentUserData = null;

// // ============================================
// // ✅ INSCRIPTION AUTOMATIQUE À LA NEWSLETTER
// // ============================================

// /**
//  * Inscrire un utilisateur à la newsletter via le Worker Cloudflare
//  */
// async function subscribeToNewsletter(email, userName = '') {
//     try {
//         console.log('📧 Inscription automatique à la newsletter pour:', email);
        
//         const response = await fetch('https://newsletter-worker.raphnardone.workers.dev/subscribe', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 email: email,
//                 name: userName || email.split('@')[0],
//                 source: 'auto_signup',
//                 timestamp: new Date().toISOString()
//             })
//         });

//         if (!response.ok) {
//             console.warn('⚠ Réponse Worker non-OK:', response.status);
//             const errorText = await response.text();
//             console.warn('⚠ Erreur détaillée:', errorText);
//             return false;
//         }

//         const data = await response.json();
        
//         if (data.success) {
//             console.log('✅ Inscription newsletter réussie dans le KV Cloudflare');
//             return true;
//         } else {
//             console.warn('⚠ Inscription newsletter échouée:', data.error || 'Erreur inconnue');
//             return false;
//         }
        
//     } catch (error) {
//         console.error('❌ Erreur inscription newsletter:', error);
//         // Ne pas bloquer la création du compte si la newsletter échoue
//         return false;
//     }
// }

// // ============================================
// // ✅ MIGRATION AUTOMATIQUE DES COMPTES EXISTANTS
// // ============================================

// /**
//  * Vérifier et migrer automatiquement les comptes sans champs newsletter
//  */
// async function autoMigrateNewsletterFields(user) {
//     try {
//         if (!user) return;
        
//         const userRef = db.collection('users').doc(user.uid);
//         const doc = await userRef.get();
        
//         if (!doc.exists) {
//             console.log('⚠ Document utilisateur inexistant, sera créé par loadAndSyncUserData');
//             return;
//         }
        
//         const userData = doc.data();
        
//         // Vérifier si les champs existent déjà
//         if (userData.weeklyNewsletter !== undefined) {
//             console.log('✅ Compte déjà configuré pour la newsletter');
//             return;
//         }
        
//         console.log('🔧 Migration automatique détectée pour:', user.email);
//         console.log('⚙ Ajout des champs newsletter manquants...');
        
//         // Ajouter les champs manquants
//         await userRef.update({
//             weeklyNewsletter: true,
//             newsletterSubscribedAt: new Date().toISOString()
//         });
        
//         console.log('✅ Champs newsletter ajoutés à Firestore');
        
//         // Inscrire à la newsletter dans Cloudflare KV
//         console.log('📧 Inscription à la newsletter Cloudflare...');
//         const subscribed = await subscribeToNewsletter(
//             user.email, 
//             userData.displayName || user.displayName || user.email.split('@')[0]
//         );
        
//         if (subscribed) {
//             console.log('✅ Migration automatique réussie !');
//             console.log('📊 Nouveau statut: Abonné à la newsletter ✅');
//         } else {
//             console.warn('⚠ Champs ajoutés à Firestore mais erreur inscription Cloudflare');
//         }
        
//     } catch (error) {
//         console.error('❌ Erreur lors de la migration automatique:', error);
//         // Ne pas bloquer l'expérience utilisateur
//     }
// }

// // ============================================
// // OBSERVATEUR D'ÉTAT D'AUTHENTIFICATION
// // ============================================

// auth.onAuthStateChanged(async (user) => {
//     if (user) {
//         console.log('✅ Utilisateur connecté:', user.email);
//         console.log('🔑 UID:', user.uid);
        
//         // ✅ MIGRATION AUTOMATIQUE POUR COMPTES EXISTANTS
//         await autoMigrateNewsletterFields(user);
        
//         // ✅ CHARGER ET SYNCHRONISER LES DONNÉES FIRESTORE
//         await loadAndSyncUserData(user);
        
//     } else {
//         console.log('ℹ Aucun utilisateur connecté');
        
//         // Nettoyer les données
//         window.currentUserData = null;
//         localStorage.removeItem('financepro_user');
        
//         // Déclencher un événement personnalisé
//         window.dispatchEvent(new CustomEvent('userLoggedOut'));
//     }
// });

// // ============================================
// // ✅ FONCTION PRINCIPALE : CHARGER ET SYNCHRONISER LES DONNÉES
// // ============================================

// /**
//  * Charger les données utilisateur depuis Firestore
//  * Créer le document s'il n'existe pas
//  * Synchroniser avec Firebase Auth
//  */
// async function loadAndSyncUserData(user) {
//     try {
//         console.log('📥 Chargement des données Firestore pour:', user.uid);
        
//         // Référence au document utilisateur
//         const userDocRef = db.collection('users').doc(user.uid);
//         const userDoc = await userDocRef.get();
        
//         let userData;
//         let isNewUser = false;
        
//         if (userDoc.exists) {
//             // ✅ DOCUMENT EXISTE - Le charger
//             console.log('✅ Document utilisateur trouvé');
            
//             const firestoreData = userDoc.data();
            
//             userData = {
//                 uid: user.uid,
//                 email: user.email,
//                 emailVerified: user.emailVerified,
//                 photoURL: user.photoURL,
//                 displayName: user.displayName,
//                 ...firestoreData
//             };
            
//             // Mettre à jour lastLoginAt
//             await userDocRef.update({
//                 lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
//                 email: user.email, // Synchroniser l'email
//                 emailVerified: user.emailVerified // Synchroniser la vérification
//             });
            
//             console.log('✅ Document mis à jour (lastLoginAt)');
            
//         } else {
//             // ❌ DOCUMENT N'EXISTE PAS - Le créer
//             console.warn('⚠ Document utilisateur inexistant');
//             console.log('🆕 Création du document utilisateur...');
            
//             isNewUser = true;
            
//             // Créer les données initiales
//             const newUserData = {
//                 email: user.email,
//                 emailVerified: user.emailVerified,
//                 photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=2563eb&color=fff`,
//                 displayName: user.displayName || user.email.split('@')[0],
//                 firstName: '',
//                 lastName: '',
//                 company: '',
//                 phone: '',
//                 plan: 'basic', // Plan gratuit par défaut
//                 subscriptionStatus: 'inactive',
//                 weeklyNewsletter: true, // ✅ NEWSLETTER ACTIVÉE PAR DÉFAUT
//                 newsletterSubscribedAt: new Date().toISOString(), // ✅ DATE D'INSCRIPTION
//                 createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//                 lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
//             };
            
//             // Créer le document dans Firestore
//             await userDocRef.set(newUserData);
            
//             console.log('✅ Document utilisateur créé avec succès');
            
//             userData = {
//                 uid: user.uid,
//                 ...newUserData
//             };
            
//             // ✅ INSCRIPTION AUTOMATIQUE À LA NEWSLETTER
//             console.log('📧 Inscription automatique à la newsletter pour nouveau compte...');
//             const subscribed = await subscribeToNewsletter(
//                 user.email, 
//                 user.displayName || user.email.split('@')[0]
//             );
            
//             if (subscribed) {
//                 console.log('🎉 Nouvel utilisateur créé et inscrit à la newsletter !');
//             } else {
//                 console.warn('⚠ Compte créé mais erreur lors de l\'inscription newsletter');
//             }
//         }
        
//         // Stocker les données globalement
//         window.currentUserData = userData;
        
//         // Stocker dans localStorage
//         localStorage.setItem('financepro_user', JSON.stringify(userData));
        
//         // Mettre à jour l'interface utilisateur
//         updateGlobalUserInterface(userData);
        
//         // ✅ DÉCLENCHER L'ÉVÉNEMENT POUR LES AUTRES SCRIPTS
//         window.dispatchEvent(new CustomEvent('userDataLoaded', { 
//             detail: userData 
//         }));
        
//         window.dispatchEvent(new CustomEvent('userAuthenticated', { 
//             detail: userData 
//         }));
        
//         console.log('✅ Données utilisateur chargées et synchronisées');
//         console.log('📊 Données:', userData);
        
//         if (isNewUser) {
//             console.log('🎉 Processus de création de compte terminé !');
//         }
        
//     } catch (error) {
//         console.error('❌ Erreur lors du chargement des données:', error);
        
//         // Créer des données minimales depuis Auth uniquement
//         const minimalUserData = {
//             uid: user.uid,
//             email: user.email,
//             emailVerified: user.emailVerified,
//             photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=2563eb&color=fff`,
//             displayName: user.displayName || user.email.split('@')[0],
//             firstName: '',
//             lastName: '',
//             plan: 'basic',
//             subscriptionStatus: 'inactive',
//             weeklyNewsletter: false
//         };
        
//         window.currentUserData = minimalUserData;
//         localStorage.setItem('financepro_user', JSON.stringify(minimalUserData));
        
//         updateGlobalUserInterface(minimalUserData);
        
//         window.dispatchEvent(new CustomEvent('userDataLoaded', { 
//             detail: minimalUserData 
//         }));
        
//         console.warn('⚠ Données minimales chargées depuis Firebase Auth uniquement');
//     }
// }

// // ============================================
// // ✅ MISE À JOUR GLOBALE DE L'INTERFACE
// // ============================================

// /**
//  * Mettre à jour tous les éléments [data-user-*] sur la page
//  */
// function updateGlobalUserInterface(userData) {
//     console.log('🎨 Mise à jour de l\'interface utilisateur globale');
    
//     try {
//         // Nom d'utilisateur
//         document.querySelectorAll('[data-user-name]').forEach(el => {
//             const name = userData.displayName || 
//                          `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 
//                          userData.email?.split('@')[0] || 
//                          'User';
//             el.textContent = name;
//         });
        
//         // Email
//         document.querySelectorAll('[data-user-email]').forEach(el => {
//             el.textContent = userData.email || 'email@example.com';
//         });
        
//         // Photo de profil
//         document.querySelectorAll('[data-user-photo]').forEach(img => {
//             const photoURL = userData.photoURL || 
//                             `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.email || 'User')}&background=2563eb&color=fff`;
//             img.src = photoURL;
//         });
        
//         // Plan d'abonnement
//         document.querySelectorAll('[data-user-plan]').forEach(el => {
//             const plan = userData.plan || 'basic';
//             el.textContent = capitalizeFirstLetter(plan);
            
//             // Ajouter une classe pour le style
//             el.className = el.className.replace(/plan-\w+/g, '');
//             el.classList.add(`plan-${plan.toLowerCase()}`);
//         });
        
//         console.log('✅ Interface globale mise à jour');
        
//     } catch (error) {
//         console.error('❌ Erreur lors de la mise à jour de l\'interface:', error);
//     }
// }

// // ============================================
// // FONCTIONS UTILITAIRES FIREBASE
// // ============================================

// /**
//  * Vérifier si Firebase est initialisé
//  */
// function isFirebaseInitialized() {
//     return app && auth && db;
// }

// /**
//  * Obtenir l'utilisateur actuel
//  */
// function getCurrentUser() {
//     return auth.currentUser;
// }

// /**
//  * Obtenir les données utilisateur actuelles
//  */
// function getCurrentUserData() {
//     return window.currentUserData;
// }

// /**
//  * Obtenir le token de l'utilisateur
//  */
// async function getUserToken() {
//     const user = getCurrentUser();
//     if (user) {
//         try {
//             return await user.getIdToken();
//         } catch (error) {
//             console.error('Erreur lors de la récupération du token:', error);
//             return null;
//         }
//     }
//     return null;
// }

// /**
//  * Rafraîchir le token
//  */
// async function refreshUserToken() {
//     const user = getCurrentUser();
//     if (user) {
//         try {
//             return await user.getIdToken(true);
//         } catch (error) {
//             console.error('Erreur lors du rafraîchissement du token:', error);
//             return null;
//         }
//     }
//     return null;
// }

// /**
//  * Capitaliser la première lettre
//  */
// function capitalizeFirstLetter(string) {
//     if (!string) return '';
//     return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
// }

// // ============================================
// // GESTION DES ERREURS FIREBASE
// // ============================================

// /**
//  * Traduire les codes d'erreur Firebase en messages français
//  */
// function getFirebaseErrorMessage(errorCode) {
//     const errorMessages = {
//         // Erreurs d'authentification
//         'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
//         'auth/invalid-email': 'Adresse email invalide.',
//         'auth/operation-not-allowed': 'Opération non autorisée.',
//         'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
//         'auth/user-disabled': 'Ce compte a été désactivé.',
//         'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
//         'auth/wrong-password': 'Mot de passe incorrect.',
//         'auth/invalid-credential': 'Identifiants invalides.',
//         'auth/account-exists-with-different-credential': 'Un compte existe déjà avec cette adresse email.',
//         'auth/credential-already-in-use': 'Ces identifiants sont déjà utilisés.',
//         'auth/timeout': 'Délai d\'attente dépassé. Veuillez réessayer.',
//         'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
//         'auth/popup-blocked': 'La fenêtre popup a été bloquée par votre navigateur.',
//         'auth/popup-closed-by-user': 'La fenêtre popup a été fermée.',
//         'auth/cancelled-popup-request': 'Requête popup annulée.',
//         'auth/network-request-failed': 'Erreur de connexion réseau.',
//         'auth/requires-recent-login': 'Cette opération nécessite une connexion récente.',
        
//         // Erreurs Firestore
//         'permission-denied': 'Permission refusée.',
//         'unavailable': 'Service temporairement indisponible.',
//         'unauthenticated': 'Authentification requise.',
//         'not-found': 'Document non trouvé.',
        
//         // Erreur par défaut
//         'default': 'Une erreur s\'est produite. Veuillez réessayer.'
//     };
    
//     return errorMessages[errorCode] || errorMessages['default'];
// }

// // ============================================
// // EXPORT DES VARIABLES ET FONCTIONS
// // ============================================

// window.firebaseApp = app;
// window.firebaseAuth = auth;
// window.firebaseDb = db;
// window.googleProvider = googleProvider;
// window.microsoftProvider = microsoftProvider;
// window.appleProvider = appleProvider;
// window.getFirebaseErrorMessage = getFirebaseErrorMessage;
// window.isFirebaseInitialized = isFirebaseInitialized;
// window.getCurrentUser = getCurrentUser;
// window.getCurrentUserData = getCurrentUserData;
// window.getUserToken = getUserToken;
// window.refreshUserToken = refreshUserToken;
// window.loadAndSyncUserData = loadAndSyncUserData;
// window.subscribeToNewsletter = subscribeToNewsletter; // ✅ EXPORT
// window.autoMigrateNewsletterFields = autoMigrateNewsletterFields; // ✅ EXPORT

// console.log('✅ Configuration Firebase chargée (v2.0 - Auto-sync + Newsletter + Migration)');

/* ============================================
   FIREBASE-CONFIG.JS - FinancePro v2.1
   Configuration Firebase & Gestion Utilisateur Complète
   ✅ INSCRIPTION AUTOMATIQUE À LA NEWSLETTER
   ✅ MIGRATION AUTOMATIQUE DES COMPTES EXISTANTS
   ✅ GESTION PHOTO GOOGLE + CLOUDFLARE R2
   ============================================ */

// ============================================
// CONFIGURATION FIREBASE
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyD9kQ3nyYbYMU--_PsMOtuqtMKlt3gmjRM",
  authDomain: "financepro-220ba.firebaseapp.com",
  projectId: "financepro-220ba",
  storageBucket: "financepro-220ba.firebasestorage.app",
  messagingSenderId: "917725259549",
  appId: "1:917725259549:web:5fd909bb04fcf1e4a763f4",
  measurementId: "G-R9L8JPN5K4"
};

// ============================================
// INITIALISATION FIREBASE
// ============================================

let app;
let auth;
let db;

try {
    // Initialiser Firebase
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    
    console.log('✅ Firebase initialisé avec succès');
} catch (error) {
    console.error('❌ Erreur lors de l\'initialisation Firebase:', error);
}

// ============================================
// CONFIGURATION DE L'AUTHENTIFICATION
// ============================================

// Configurer la persistance de session
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('✅ Persistance de session configurée');
    })
    .catch((error) => {
        console.error('❌ Erreur de configuration de persistance:', error);
    });

// ============================================
// PROVIDERS D'AUTHENTIFICATION
// ============================================

// Google Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Microsoft Provider
const microsoftProvider = new firebase.auth.OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({
    tenant: 'common',
    prompt: 'select_account'
});

// Apple Provider
const appleProvider = new firebase.auth.OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// ============================================
// VARIABLES GLOBALES
// ============================================

window.currentUserData = null;

// ============================================
// ✅ INSCRIPTION AUTOMATIQUE À LA NEWSLETTER
// ============================================

/**
 * Inscrire un utilisateur à la newsletter via le Worker Cloudflare
 */
async function subscribeToNewsletter(email, userName = '') {
    try {
        console.log('📧 Inscription automatique à la newsletter pour:', email);
        
        const response = await fetch('https://newsletter-worker.raphnardone.workers.dev/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                name: userName || email.split('@')[0],
                source: 'auto_signup',
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            console.warn('⚠ Réponse Worker non-OK:', response.status);
            const errorText = await response.text();
            console.warn('⚠ Erreur détaillée:', errorText);
            return false;
        }

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Inscription newsletter réussie dans le KV Cloudflare');
            return true;
        } else {
            console.warn('⚠ Inscription newsletter échouée:', data.error || 'Erreur inconnue');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erreur inscription newsletter:', error);
        // Ne pas bloquer la création du compte si la newsletter échoue
        return false;
    }
}

// ============================================
// ✅ MIGRATION AUTOMATIQUE DES COMPTES EXISTANTS
// ============================================

/**
 * Vérifier et migrer automatiquement les comptes sans champs newsletter
 */
async function autoMigrateNewsletterFields(user) {
    try {
        if (!user) return;
        
        const userRef = db.collection('users').doc(user.uid);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            console.log('⚠ Document utilisateur inexistant, sera créé par loadAndSyncUserData');
            return;
        }
        
        const userData = doc.data();
        
        // Vérifier si les champs existent déjà
        if (userData.weeklyNewsletter !== undefined) {
            console.log('✅ Compte déjà configuré pour la newsletter');
            return;
        }
        
        console.log('🔧 Migration automatique détectée pour:', user.email);
        console.log('⚙ Ajout des champs newsletter manquants...');
        
        // Ajouter les champs manquants
        await userRef.update({
            weeklyNewsletter: true,
            newsletterSubscribedAt: new Date().toISOString()
        });
        
        console.log('✅ Champs newsletter ajoutés à Firestore');
        
        // Inscrire à la newsletter dans Cloudflare KV
        console.log('📧 Inscription à la newsletter Cloudflare...');
        const subscribed = await subscribeToNewsletter(
            user.email, 
            userData.displayName || user.displayName || user.email.split('@')[0]
        );
        
        if (subscribed) {
            console.log('✅ Migration automatique réussie !');
            console.log('📊 Nouveau statut: Abonné à la newsletter ✅');
        } else {
            console.warn('⚠ Champs ajoutés à Firestore mais erreur inscription Cloudflare');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la migration automatique:', error);
        // Ne pas bloquer l'expérience utilisateur
    }
}

// ============================================
// OBSERVATEUR D'ÉTAT D'AUTHENTIFICATION
// ============================================

auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('✅ Utilisateur connecté:', user.email);
        console.log('🔑 UID:', user.uid);
        
        // ✅ MIGRATION AUTOMATIQUE POUR COMPTES EXISTANTS
        await autoMigrateNewsletterFields(user);
        
        // ✅ CHARGER ET SYNCHRONISER LES DONNÉES FIRESTORE
        await loadAndSyncUserData(user);
        
    } else {
        console.log('ℹ Aucun utilisateur connecté');
        
        // Nettoyer les données
        window.currentUserData = null;
        localStorage.removeItem('financepro_user');
        
        // Déclencher un événement personnalisé
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
});

// ============================================
// ✅ FONCTION PRINCIPALE : CHARGER ET SYNCHRONISER LES DONNÉES
// ============================================

/**
 * Charger les données utilisateur depuis Firestore
 * Créer le document s'il n'existe pas
 * Synchroniser avec Firebase Auth
 * ✅ GESTION INTELLIGENTE DE LA PHOTO (Google vs R2)
 */
async function loadAndSyncUserData(user) {
    try {
        console.log('📥 Chargement des données Firestore pour:', user.uid);
        
        // Référence au document utilisateur
        const userDocRef = db.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();
        
        let userData;
        let isNewUser = false;
        
        if (userDoc.exists) {
            // ✅ DOCUMENT EXISTE - Le charger
            console.log('✅ Document utilisateur trouvé');
            
            const firestoreData = userDoc.data();
            
            userData = {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                photoURL: firestoreData.photoURL || user.photoURL, // ✅ Priorité Firestore
                displayName: firestoreData.displayName || user.displayName,
                ...firestoreData
            };
            
            // ✅ LOGIQUE DE SYNCHRONISATION DE LA PHOTO
            const updateData = {
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                email: user.email,
                emailVerified: user.emailVerified
            };
            
            // ✅ DÉCIDER SI ON MET À JOUR LA PHOTO
            const hasR2Photo = firestoreData.photoURL && 
                              (firestoreData.photoURL.includes('workers.dev') || 
                               firestoreData.photoURL.includes('r2.dev'));
            
            const hasGooglePhoto = user.photoURL && 
                                  user.photoURL.includes('googleusercontent.com');
            
            console.log('🖼 Photo status:', {
                hasR2Photo,
                hasGooglePhoto,
                currentPhotoURL: firestoreData.photoURL,
                googlePhotoURL: user.photoURL
            });
            
            if (!hasR2Photo && hasGooglePhoto) {
                // ✅ Pas de photo R2 personnalisée, mais photo Google disponible
                console.log('📸 Mise à jour avec la photo Google');
                updateData.photoURL = user.photoURL;
                userData.photoURL = user.photoURL;
            } else if (!hasR2Photo && !firestoreData.photoURL) {
                // ✅ Aucune photo du tout, générer UI Avatar
                const fallbackPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=667eea&color=fff&size=256`;
                console.log('🎨 Génération UI Avatar:', fallbackPhoto);
                updateData.photoURL = fallbackPhoto;
                userData.photoURL = fallbackPhoto;
            } else if (hasR2Photo) {
                // ✅ Photo R2 personnalisée détectée, on la garde
                console.log('✅ Photo R2 personnalisée conservée:', firestoreData.photoURL);
            }
            
            // Mettre à jour Firestore
            await userDocRef.update(updateData);
            
            console.log('✅ Document mis à jour (lastLoginAt + photo sync)');
            
        } else {
            // ❌ DOCUMENT N'EXISTE PAS - Le créer
            console.warn('⚠ Document utilisateur inexistant');
            console.log('🆕 Création du document utilisateur...');
            
            isNewUser = true;
            
            // ✅ DÉTERMINER LA PHOTO INITIALE
            let initialPhotoURL;
            
            if (user.photoURL && user.photoURL.includes('googleusercontent.com')) {
                // Photo Google disponible
                console.log('📸 Utilisation de la photo Google');
                initialPhotoURL = user.photoURL;
            } else if (user.photoURL) {
                // Autre provider (Microsoft, Apple, etc.)
                console.log('📸 Utilisation de la photo du provider');
                initialPhotoURL = user.photoURL;
            } else {
                // Aucune photo, générer UI Avatar
                console.log('🎨 Génération UI Avatar pour nouveau compte');
                initialPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=667eea&color=fff&size=256`;
            }
            
            // Créer les données initiales
            const newUserData = {
                email: user.email,
                emailVerified: user.emailVerified,
                photoURL: initialPhotoURL,
                displayName: user.displayName || user.email.split('@')[0],
                firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                bio: '',
                company: '',
                phone: '',
                plan: 'basic',
                subscriptionStatus: 'inactive',
                weeklyNewsletter: true,
                newsletterSubscribedAt: new Date().toISOString(),
                followersCount: 0,
                followingCount: 0,
                reputation: 0,
                postCount: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Créer le document dans Firestore
            await userDocRef.set(newUserData);
            
            console.log('✅ Document utilisateur créé avec succès');
            console.log('📸 Photo initiale:', initialPhotoURL);
            
            userData = {
                uid: user.uid,
                ...newUserData
            };
            
            // ✅ INSCRIPTION AUTOMATIQUE À LA NEWSLETTER
            console.log('📧 Inscription automatique à la newsletter pour nouveau compte...');
            const subscribed = await subscribeToNewsletter(
                user.email, 
                user.displayName || user.email.split('@')[0]
            );
            
            if (subscribed) {
                console.log('🎉 Nouvel utilisateur créé et inscrit à la newsletter !');
            } else {
                console.warn('⚠ Compte créé mais erreur lors de l\'inscription newsletter');
            }
        }
        
        // Stocker les données globalement
        window.currentUserData = userData;
        
        // Stocker dans localStorage
        localStorage.setItem('financepro_user', JSON.stringify(userData));
        
        // Mettre à jour l'interface utilisateur
        updateGlobalUserInterface(userData);
        
        // ✅ DÉCLENCHER L'ÉVÉNEMENT POUR LES AUTRES SCRIPTS
        window.dispatchEvent(new CustomEvent('userDataLoaded', { 
            detail: userData 
        }));
        
        window.dispatchEvent(new CustomEvent('userAuthenticated', { 
            detail: userData 
        }));
        
        console.log('✅ Données utilisateur chargées et synchronisées');
        console.log('📊 Données:', userData);
        
        if (isNewUser) {
            console.log('🎉 Processus de création de compte terminé !');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        
        // Créer des données minimales depuis Auth uniquement
        const minimalUserData = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=667eea&color=fff&size=256`,
            displayName: user.displayName || user.email.split('@')[0],
            firstName: '',
            lastName: '',
            plan: 'basic',
            subscriptionStatus: 'inactive',
            weeklyNewsletter: false
        };
        
        window.currentUserData = minimalUserData;
        localStorage.setItem('financepro_user', JSON.stringify(minimalUserData));
        
        updateGlobalUserInterface(minimalUserData);
        
        window.dispatchEvent(new CustomEvent('userDataLoaded', { 
            detail: minimalUserData 
        }));
        
        console.warn('⚠ Données minimales chargées depuis Firebase Auth uniquement');
    }
}

// ============================================
// ✅ MISE À JOUR GLOBALE DE L'INTERFACE
// ============================================

/**
 * Mettre à jour tous les éléments [data-user-*] sur la page
 */
function updateGlobalUserInterface(userData) {
    console.log('🎨 Mise à jour de l\'interface utilisateur globale');
    
    try {
        // Nom d'utilisateur
        document.querySelectorAll('[data-user-name]').forEach(el => {
            const name = userData.displayName || 
                         `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 
                         userData.email?.split('@')[0] || 
                         'User';
            el.textContent = name;
        });
        
        // Email
        document.querySelectorAll('[data-user-email]').forEach(el => {
            el.textContent = userData.email || 'email@example.com';
        });
        
        // Photo de profil
        document.querySelectorAll('[data-user-photo]').forEach(img => {
            // ✅ Utiliser la fonction utilitaire pour la photo
            const photoURL = getUserPhotoURL(userData);
            img.src = photoURL;
            
            // ✅ Fallback en cas d'erreur de chargement
            img.onerror = function() {
                const fallbackURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.displayName || userData.email || 'User')}&background=667eea&color=fff&size=256`;
                if (this.src !== fallbackURL) {
                    console.warn('⚠ Erreur de chargement photo, fallback vers UI Avatar');
                    this.src = fallbackURL;
                }
            };
        });
        
        // Plan d'abonnement
        document.querySelectorAll('[data-user-plan]').forEach(el => {
            const plan = userData.plan || 'basic';
            el.textContent = capitalizeFirstLetter(plan);
            
            // Ajouter une classe pour le style
            el.className = el.className.replace(/plan-\w+/g, '');
            el.classList.add(`plan-${plan.toLowerCase()}`);
        });
        
        console.log('✅ Interface globale mise à jour');
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de l\'interface:', error);
    }
}

// ============================================
// ✅ GESTION DE LA PHOTO DE PROFIL
// ============================================

/**
 * Mettre à jour la photo de profil (appelée par profile.js après upload R2)
 */
async function updateUserPhoto(photoURL) {
    try {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        console.log('📸 Mise à jour de la photo de profil:', photoURL);
        
        // ✅ Mettre à jour Firestore
        await db.collection('users').doc(user.uid).update({
            photoURL: photoURL,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // ✅ Mettre à jour Auth
        await user.updateProfile({
            photoURL: photoURL
        });
        
        // ✅ Mettre à jour les données locales
        if (window.currentUserData) {
            window.currentUserData.photoURL = photoURL;
            localStorage.setItem('financepro_user', JSON.stringify(window.currentUserData));
        }
        
        // ✅ Mettre à jour l'interface
        document.querySelectorAll('[data-user-photo]').forEach(img => {
            img.src = photoURL;
        });
        
        console.log('✅ Photo de profil mise à jour avec succès');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de la photo:', error);
        throw error;
    }
}

/**
 * Récupérer la photo de profil actuelle avec fallbacks intelligents
 */
function getUserPhotoURL(userData) {
    if (!userData) {
        userData = window.currentUserData;
    }
    
    if (!userData) {
        return 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=256';
    }
    
    // 1. Photo R2 personnalisée (priorité max)
    if (userData.photoURL && 
        (userData.photoURL.includes('workers.dev') || 
         userData.photoURL.includes('r2.dev'))) {
        return userData.photoURL;
    }
    
    // 2. Photo Google
    if (userData.photoURL && 
        userData.photoURL.includes('googleusercontent.com')) {
        return userData.photoURL;
    }
    
    // 3. Autre photo du provider (Microsoft, Apple, etc.)
    if (userData.photoURL && 
        !userData.photoURL.includes('ui-avatars.com')) {
        return userData.photoURL;
    }
    
    // 4. UI Avatar (fallback)
    const name = userData.displayName || userData.email || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=256`;
}

// ============================================
// FONCTIONS UTILITAIRES FIREBASE
// ============================================

/**
 * Vérifier si Firebase est initialisé
 */
function isFirebaseInitialized() {
    return app && auth && db;
}

/**
 * Obtenir l'utilisateur actuel
 */
function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Obtenir les données utilisateur actuelles
 */
function getCurrentUserData() {
    return window.currentUserData;
}

/**
 * Obtenir le token de l'utilisateur
 */
async function getUserToken() {
    const user = getCurrentUser();
    if (user) {
        try {
            return await user.getIdToken();
        } catch (error) {
            console.error('Erreur lors de la récupération du token:', error);
            return null;
        }
    }
    return null;
}

/**
 * Rafraîchir le token
 */
async function refreshUserToken() {
    const user = getCurrentUser();
    if (user) {
        try {
            return await user.getIdToken(true);
        } catch (error) {
            console.error('Erreur lors du rafraîchissement du token:', error);
            return null;
        }
    }
    return null;
}

/**
 * Capitaliser la première lettre
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// ============================================
// GESTION DES ERREURS FIREBASE
// ============================================

/**
 * Traduire les codes d'erreur Firebase en messages français
 */
function getFirebaseErrorMessage(errorCode) {
    const errorMessages = {
        // Erreurs d'authentification
        'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
        'auth/invalid-email': 'Adresse email invalide.',
        'auth/operation-not-allowed': 'Opération non autorisée.',
        'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
        'auth/user-disabled': 'Ce compte a été désactivé.',
        'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/invalid-credential': 'Identifiants invalides.',
        'auth/account-exists-with-different-credential': 'Un compte existe déjà avec cette adresse email.',
        'auth/credential-already-in-use': 'Ces identifiants sont déjà utilisés.',
        'auth/timeout': 'Délai d\'attente dépassé. Veuillez réessayer.',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
        'auth/popup-blocked': 'La fenêtre popup a été bloquée par votre navigateur.',
        'auth/popup-closed-by-user': 'La fenêtre popup a été fermée.',
        'auth/cancelled-popup-request': 'Requête popup annulée.',
        'auth/network-request-failed': 'Erreur de connexion réseau.',
        'auth/requires-recent-login': 'Cette opération nécessite une connexion récente.',
        
        // Erreurs Firestore
        'permission-denied': 'Permission refusée.',
        'unavailable': 'Service temporairement indisponible.',
        'unauthenticated': 'Authentification requise.',
        'not-found': 'Document non trouvé.',
        
        // Erreur par défaut
        'default': 'Une erreur s\'est produite. Veuillez réessayer.'
    };
    
    return errorMessages[errorCode] || errorMessages['default'];
}

// ============================================
// EXPORT DES VARIABLES ET FONCTIONS
// ============================================

window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.googleProvider = googleProvider;
window.microsoftProvider = microsoftProvider;
window.appleProvider = appleProvider;
window.getFirebaseErrorMessage = getFirebaseErrorMessage;
window.isFirebaseInitialized = isFirebaseInitialized;
window.getCurrentUser = getCurrentUser;
window.getCurrentUserData = getCurrentUserData;
window.getUserToken = getUserToken;
window.refreshUserToken = refreshUserToken;
window.loadAndSyncUserData = loadAndSyncUserData;
window.subscribeToNewsletter = subscribeToNewsletter;
window.autoMigrateNewsletterFields = autoMigrateNewsletterFields;
window.updateUserPhoto = updateUserPhoto; // ✅ NOUVEAU
window.getUserPhotoURL = getUserPhotoURL; // ✅ NOUVEAU

console.log('✅ Configuration Firebase chargée (v2.1 - Photo Google + R2 Support)');