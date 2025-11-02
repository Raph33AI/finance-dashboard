/* ============================================
   FIREBASE-CONFIG.JS - FinancePro
   Configuration Firebase & Initialisation
   ============================================ */

// ============================================
// CONFIGURATION FIREBASE
// ============================================

// ⚠️ IMPORTANT : Remplacer par vos propres clés Firebase
// Obtenir ces clés sur : https://console.firebase.google.com/

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

// Apple Provider (nécessite configuration additionnelle)
const appleProvider = new firebase.auth.OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

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

// ============================================
// OBSERVATEUR D'ÉTAT D'AUTHENTIFICATION
// ============================================

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('✅ Utilisateur connecté:', user.email);
        
        // Stocker les informations utilisateur dans localStorage
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            lastLoginAt: new Date().toISOString()
        };
        
        localStorage.setItem('financepro_user', JSON.stringify(userData));
        
        // Déclencher un événement personnalisé
        window.dispatchEvent(new CustomEvent('userAuthenticated', { 
            detail: userData 
        }));
        
    } else {
        console.log('ℹ️ Aucun utilisateur connecté');
        
        // Nettoyer localStorage
        localStorage.removeItem('financepro_user');
        
        // Déclencher un événement personnalisé
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
});

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
window.getUserToken = getUserToken;
window.refreshUserToken = refreshUserToken;

console.log('✅ Configuration Firebase chargée');