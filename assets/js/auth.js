/* ============================================
   AUTH.JS - FinancePro Authentication
   Gestion complète de l'authentification
   ============================================ */

// ============================================
// VARIABLES GLOBALES
// ============================================

let isProcessing = false;

// ============================================
// INITIALISATION AU CHARGEMENT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation du système d\'authentification...');
    
    // Vérifier si Firebase est initialisé
    if (!isFirebaseInitialized()) {
        showToast('error', 'Erreur', 'Impossible de se connecter au service d\'authentification.');
        return;
    }
    
    // Initialiser les gestionnaires d'événements
    initializeEventListeners();
    
    // Vérifier si l'utilisateur est déjà connecté
    checkAuthState();
    
    console.log('✅ Système d\'authentification initialisé');
});

// ============================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================

function initializeEventListeners() {
    // === NAVIGATION ENTRE FORMULAIRES ===
    
    const switchToSignupBtn = document.getElementById('switchToSignup');
    const switchToLoginBtn = document.getElementById('switchToLogin');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginBtn = document.getElementById('backToLogin');
    const backToLoginFromSuccessBtn = document.getElementById('backToLoginFromSuccess');
    
    if (switchToSignupBtn) {
        switchToSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('signup');
        });
    }
    
    if (switchToLoginBtn) {
        switchToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('login');
        });
    }
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('reset');
        });
    }
    
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('login');
        });
    }
    
    if (backToLoginFromSuccessBtn) {
        backToLoginFromSuccessBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('resetSuccess').classList.add('hidden');
            document.getElementById('emailResetForm').classList.remove('hidden');
            showForm('login');
        });
    }
    
    // === FORMULAIRES ===
    
    // Login form
    const loginForm = document.getElementById('emailLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleEmailLogin);
    }
    
    // Signup form
    const signupForm = document.getElementById('emailSignupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleEmailSignup);
    }
    
    // Reset password form
    const resetForm = document.getElementById('emailResetForm');
    if (resetForm) {
        resetForm.addEventListener('submit', handlePasswordReset);
    }
    
    // === BOUTONS SOCIAUX - LOGIN ===
    
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => handleSocialLogin('google'));
    }
    
    const appleLoginBtn = document.getElementById('appleLoginBtn');
    if (appleLoginBtn) {
        appleLoginBtn.addEventListener('click', () => handleSocialLogin('apple'));
    }
    
    const microsoftLoginBtn = document.getElementById('microsoftLoginBtn');
    if (microsoftLoginBtn) {
        microsoftLoginBtn.addEventListener('click', () => handleSocialLogin('microsoft'));
    }
    
    // === BOUTONS SOCIAUX - SIGNUP ===
    
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', () => handleSocialLogin('google'));
    }
    
    const appleSignupBtn = document.getElementById('appleSignupBtn');
    if (appleSignupBtn) {
        appleSignupBtn.addEventListener('click', () => handleSocialLogin('apple'));
    }
    
    const microsoftSignupBtn = document.getElementById('microsoftSignupBtn');
    if (microsoftSignupBtn) {
        microsoftSignupBtn.addEventListener('click', () => handleSocialLogin('microsoft'));
    }
    
    // === TOGGLE PASSWORD VISIBILITY ===
    
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    if (toggleLoginPassword) {
        toggleLoginPassword.addEventListener('click', () => {
            togglePasswordVisibility('loginPassword', toggleLoginPassword);
        });
    }
    
    const toggleSignupPassword = document.getElementById('toggleSignupPassword');
    if (toggleSignupPassword) {
        toggleSignupPassword.addEventListener('click', () => {
            togglePasswordVisibility('signupPassword', toggleSignupPassword);
        });
    }
    
    // === PASSWORD STRENGTH CHECKER ===
    
    const signupPassword = document.getElementById('signupPassword');
    if (signupPassword) {
        signupPassword.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });
    }
}

// ============================================
// NAVIGATION ENTRE FORMULAIRES
// ============================================

function showForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    
    // Cacher tous les formulaires
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    resetPasswordForm.classList.add('hidden');
    
    // Afficher le formulaire demandé
    switch(formType) {
        case 'login':
            loginForm.classList.remove('hidden');
            break;
        case 'signup':
            signupForm.classList.remove('hidden');
            break;
        case 'reset':
            resetPasswordForm.classList.remove('hidden');
            break;
    }
    
    // Réinitialiser les erreurs
    clearAllErrors();
}

// ============================================
// AUTHENTIFICATION PAR EMAIL
// ============================================

/**
 * Gestion de la connexion par email
 */
async function handleEmailLogin(e) {
    e.preventDefault();
    
    if (isProcessing) return;
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validation
    if (!validateEmail(email)) {
        showFieldError('loginEmail', 'Adresse email invalide');
        return;
    }
    
    if (!password) {
        showFieldError('loginPassword', 'Mot de passe requis');
        return;
    }
    
    // Effacer les erreurs précédentes
    clearAllErrors();
    
    // Afficher le loader
    setButtonLoading('loginSubmitBtn', true);
    isProcessing = true;
    
    try {
        // Configurer la persistance
        const persistence = rememberMe 
            ? firebase.auth.Auth.Persistence.LOCAL 
            : firebase.auth.Auth.Persistence.SESSION;
        
        await firebaseAuth.setPersistence(persistence);
        
        // Connexion
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Connexion réussie:', user.email);
        
        // Enregistrer la connexion dans Firestore
        await logUserLogin(user.uid, 'email');
        
        // Afficher un message de succès
        showToast('success', 'Connexion réussie !', `Bienvenue ${user.email}`);
        
        // Rediriger vers le dashboard
        setTimeout(() => {
            window.location.href = 'dashboard-financier.html';
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        
        const errorMessage = getFirebaseErrorMessage(error.code);
        showToast('error', 'Erreur de connexion', errorMessage);
        
        // Afficher l'erreur sur le champ approprié
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
            showFieldError('loginEmail', errorMessage);
        } else {
            showFieldError('loginPassword', errorMessage);
        }
        
    } finally {
        setButtonLoading('loginSubmitBtn', false);
        isProcessing = false;
    }
}

/**
 * Gestion de l'inscription par email
 */
async function handleEmailSignup(e) {
    e.preventDefault();
    
    if (isProcessing) return;
    
    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const company = document.getElementById('signupCompany').value.trim();
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Validation
    let hasError = false;
    
    if (!firstName) {
        showFieldError('signupFirstName', 'Prénom requis');
        hasError = true;
    }
    
    if (!lastName) {
        showFieldError('signupLastName', 'Nom requis');
        hasError = true;
    }
    
    if (!validateEmail(email)) {
        showFieldError('signupEmail', 'Adresse email invalide');
        hasError = true;
    }
    
    if (password.length < 6) {
        showFieldError('signupPassword', 'Le mot de passe doit contenir au moins 6 caractères');
        hasError = true;
    }
    
    if (!acceptTerms) {
        showFieldError('acceptTerms', 'Vous devez accepter les conditions d\'utilisation');
        hasError = true;
    }
    
    if (hasError) return;
    
    // Effacer les erreurs précédentes
    clearAllErrors();
    
    // Afficher le loader
    setButtonLoading('signupSubmitBtn', true);
    isProcessing = true;
    
    try {
        // Créer le compte
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Compte créé:', user.email);
        
        // Mettre à jour le profil
        await user.updateProfile({
            displayName: `${firstName} ${lastName}`
        });
        
        // Envoyer un email de vérification
        await user.sendEmailVerification({
            url: window.location.origin + '/dashboard-financier.html',
            handleCodeInApp: true
        });
        
        // Créer le profil utilisateur dans Firestore
        await createUserProfile(user.uid, {
            firstName,
            lastName,
            email,
            company,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: false,
            plan: 'free',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
            metadata: {
                signupMethod: 'email',
                userAgent: navigator.userAgent,
                language: navigator.language
            }
        });
        
        // Enregistrer la connexion
        await logUserLogin(user.uid, 'email_signup');
        
        // Afficher un message de succès
        showToast('success', 'Compte créé !', 'Un email de vérification vous a été envoyé.');
        
        // Rediriger vers le dashboard
        setTimeout(() => {
            window.location.href = 'dashboard-financier.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erreur d\'inscription:', error);
        
        const errorMessage = getFirebaseErrorMessage(error.code);
        showToast('error', 'Erreur d\'inscription', errorMessage);
        
        if (error.code === 'auth/email-already-in-use') {
            showFieldError('signupEmail', errorMessage);
        } else if (error.code === 'auth/weak-password') {
            showFieldError('signupPassword', errorMessage);
        }
        
    } finally {
        setButtonLoading('signupSubmitBtn', false);
        isProcessing = false;
    }
}

// ============================================
// AUTHENTIFICATION SOCIALE
// ============================================

/**
 * Gestion de la connexion sociale (Google, Apple, Microsoft)
 */
async function handleSocialLogin(providerType) {
    if (isProcessing) return;
    
    isProcessing = true;
    
    let provider;
    let providerName;
    
    switch(providerType) {
        case 'google':
            provider = googleProvider;
            providerName = 'Google';
            break;
        case 'apple':
            provider = appleProvider;
            providerName = 'Apple';
            break;
        case 'microsoft':
            provider = microsoftProvider;
            providerName = 'Microsoft';
            break;
        default:
            console.error('Provider inconnu:', providerType);
            isProcessing = false;
            return;
    }
    
    try {
        console.log(`🔐 Tentative de connexion avec ${providerName}...`);
        
        // Connexion avec popup
        const result = await firebaseAuth.signInWithPopup(provider);
        const user = result.user;
        const isNewUser = result.additionalUserInfo.isNewUser;
        
        console.log('✅ Connexion réussie avec', providerName, ':', user.email);
        
        // Si c'est un nouvel utilisateur, créer son profil
        if (isNewUser) {
            const profile = result.additionalUserInfo.profile;
            
            await createUserProfile(user.uid, {
                firstName: profile.given_name || profile.name?.split(' ')[0] || '',
                lastName: profile.family_name || profile.name?.split(' ')[1] || '',
                email: user.email,
                photoURL: user.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                emailVerified: user.emailVerified,
                plan: 'free',
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                metadata: {
                    signupMethod: providerType,
                    userAgent: navigator.userAgent,
                    language: navigator.language
                }
            });
        }
        
        // Enregistrer la connexion
        await logUserLogin(user.uid, providerType);
        
        // Message de succès
        showToast('success', 'Connexion réussie !', `Bienvenue ${user.displayName || user.email}`);
        
        // Rediriger
        setTimeout(() => {
            window.location.href = 'dashboard-financier.html';
        }, 1000);
        
    } catch (error) {
        console.error(`❌ Erreur de connexion avec ${providerName}:`, error);
        
        // Gestion spécifique des erreurs de popup
        if (error.code === 'auth/popup-closed-by-user') {
            showToast('warning', 'Connexion annulée', 'Vous avez fermé la fenêtre de connexion.');
        } else if (error.code === 'auth/popup-blocked') {
            showToast('error', 'Popup bloquée', 'Veuillez autoriser les popups pour ce site.');
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            showToast('error', 'Compte existant', 'Un compte existe déjà avec cet email. Utilisez une autre méthode de connexion.');
        } else {
            const errorMessage = getFirebaseErrorMessage(error.code);
            showToast('error', 'Erreur de connexion', errorMessage);
        }
        
    } finally {
        isProcessing = false;
    }
}

// ============================================
// RÉINITIALISATION DE MOT DE PASSE
// ============================================

/**
 * Gestion de la réinitialisation de mot de passe
 */
async function handlePasswordReset(e) {
    e.preventDefault();
    
    if (isProcessing) return;
    
    const email = document.getElementById('resetEmail').value.trim();
    
    // Validation
    if (!validateEmail(email)) {
        showFieldError('resetEmail', 'Adresse email invalide');
        return;
    }
    
    // Effacer les erreurs précédentes
    clearAllErrors();
    
    // Afficher le loader
    setButtonLoading('resetSubmitBtn', true);
    isProcessing = true;
    
    try {
        // Envoyer l'email de réinitialisation
        await firebaseAuth.sendPasswordResetEmail(email, {
            url: window.location.origin + '/auth.html',
            handleCodeInApp: true
        });
        
        console.log('✅ Email de réinitialisation envoyé à:', email);
        
        // Masquer le formulaire et afficher le message de succès
        document.getElementById('emailResetForm').classList.add('hidden');
        document.getElementById('resetSuccess').classList.remove('hidden');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
        
        const errorMessage = getFirebaseErrorMessage(error.code);
        showToast('error', 'Erreur', errorMessage);
        showFieldError('resetEmail', errorMessage);
        
    } finally {
        setButtonLoading('resetSubmitBtn', false);
        isProcessing = false;
    }
}

// ============================================
// FIRESTORE - GESTION DES PROFILS
// ============================================

/**
 * Créer un profil utilisateur dans Firestore
 */
async function createUserProfile(uid, profileData) {
    try {
        await firebaseDb.collection('users').doc(uid).set(profileData, { merge: true });
        console.log('✅ Profil utilisateur créé/mis à jour dans Firestore');
    } catch (error) {
        console.error('❌ Erreur lors de la création du profil:', error);
        throw error;
    }
}

/**
 * Enregistrer une connexion utilisateur
 */
async function logUserLogin(uid, method) {
    try {
        await firebaseDb.collection('users').doc(uid).collection('login_history').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            method: method,
            userAgent: navigator.userAgent,
            ip: 'client-side' // L'IP devrait être récupérée côté serveur
        });
        
        // Mettre à jour la dernière connexion
        await firebaseDb.collection('users').doc(uid).update({
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLoginMethod: method
        });
        
        console.log('✅ Connexion enregistrée dans Firestore');
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement de la connexion:', error);
    }
}

// ============================================
// VÉRIFICATION DE L'ÉTAT D'AUTHENTIFICATION
// ============================================

/**
 * Vérifier si l'utilisateur est déjà connecté
 */
function checkAuthState() {
    const user = getCurrentUser();
    
    if (user) {
        console.log('ℹ️ Utilisateur déjà connecté:', user.email);
        
        // Afficher une notification
        showToast('info', 'Déjà connecté', 'Vous êtes déjà connecté. Redirection...');
        
        // Rediriger vers le dashboard après 1 seconde
        setTimeout(() => {
            window.location.href = 'dashboard-financier.html';
        }, 1000);
    }
}

// ============================================
// UTILITAIRES DE VALIDATION
// ============================================

/**
 * Valider une adresse email
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Vérifier la force du mot de passe
 */
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');
    const strengthBars = document.querySelectorAll('.strength-bar');
    
    if (!strengthIndicator || !strengthText || !strengthBars.length) return;
    
    let strength = 0;
    let strengthLabel = 'Très faible';
    
    // Critères de force
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    // Mettre à jour les barres
    strengthBars.forEach((bar, index) => {
        bar.classList.remove('active', 'medium', 'strong');
        
        if (index < strength) {
            bar.classList.add('active');
            
            if (strength >= 3) {
                bar.classList.add('medium');
            }
            if (strength >= 4) {
                bar.classList.remove('medium');
                bar.classList.add('strong');
            }
        }
    });
    
    // Mettre à jour le texte
    switch(strength) {
        case 0:
        case 1:
            strengthLabel = 'Très faible';
            break;
        case 2:
            strengthLabel = 'Faible';
            break;
        case 3:
            strengthLabel = 'Moyen';
            break;
        case 4:
            strengthLabel = 'Fort';
            break;
        case 5:
            strengthLabel = 'Très fort';
            break;
    }
    
    strengthText.textContent = strengthLabel;
}

/**
 * Basculer la visibilité du mot de passe
 */
function togglePasswordVisibility(inputId, toggleButton) {
    const passwordInput = document.getElementById(inputId);
    const icon = toggleButton.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ============================================
// GESTION DES ERREURS DE FORMULAIRE
// ============================================

/**
 * Afficher une erreur sur un champ
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (field) {
        field.classList.add('error');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('active');
    }
}

/**
 * Effacer toutes les erreurs
 */
function clearAllErrors() {
    const errorFields = document.querySelectorAll('.form-input.error');
    const errorMessages = document.querySelectorAll('.form-error.active');
    
    errorFields.forEach(field => field.classList.remove('error'));
    errorMessages.forEach(message => {
        message.classList.remove('active');
        message.textContent = '';
    });
}

// ============================================
// GESTION DES BOUTONS
// ============================================

/**
 * Activer/désactiver l'état de chargement d'un bouton
 */
function setButtonLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    
    if (!button) return;
    
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// ============================================
// NOTIFICATIONS TOAST
// ============================================

/**
 * Afficher une notification toast
 */
function showToast(type, title, message) {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) return;
    
    // Créer l'élément toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icône en fonction du type
    let iconClass = 'fa-info-circle';
    switch(type) {
        case 'success':
            iconClass = 'fa-check-circle';
            break;
        case 'error':
            iconClass = 'fa-times-circle';
            break;
        case 'warning':
            iconClass = 'fa-exclamation-triangle';
            break;
    }
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Ajouter au conteneur
    toastContainer.appendChild(toast);
    
    // Gestionnaire de fermeture
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

/**
 * Supprimer une notification toast
 */
function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Animation de sortie
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// ÉCOUTEURS D'ÉVÉNEMENTS GLOBAUX
// ============================================

// Détecter la déconnexion
window.addEventListener('userLoggedOut', () => {
    console.log('ℹ️ Utilisateur déconnecté');
});

// Détecter l'authentification
window.addEventListener('userAuthenticated', (e) => {
    console.log('✅ Utilisateur authentifié:', e.detail);
});

console.log('✅ Script d\'authentification chargé');