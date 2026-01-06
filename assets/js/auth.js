// /* ============================================
//    AUTH.JS - FinancePro Authentication
//    Complete authentication management
//    🎯 VERSION OPTIMISÉE ET CORRIGÉE
//    ✅ Redirection checkout pour nouveaux comptes
//    ✅ Gestion robuste des erreurs
//    ✅ Toast container auto-créé
//    ============================================ */

// // ============================================
// // GLOBAL VARIABLES
// // ============================================

// let isProcessing = false;

// // ============================================
// // INITIALIZATION ON LOAD
// // ============================================

// document.addEventListener('DOMContentLoaded', () => {
//     console.log('🚀 Initializing authentication system...');
    
//     // Check if Firebase is initialized
//     if (!isFirebaseInitialized()) {
//         showToast('error', 'Error', 'Unable to connect to authentication service.');
//         return;
//     }
    
//     // Initialize event listeners
//     initializeEventListeners();
    
//     // Check if user is already logged in
//     checkAuthState();
    
//     console.log('✅ Authentication system initialized');
// });

// // ============================================
// // EVENT LISTENERS
// // ============================================

// function initializeEventListeners() {
//     // === FORM NAVIGATION ===
    
//     const switchToSignupBtn = document.getElementById('switchToSignup');
//     const switchToLoginBtn = document.getElementById('switchToLogin');
//     const forgotPasswordLink = document.getElementById('forgotPasswordLink');
//     const backToLoginBtn = document.getElementById('backToLogin');
//     const backToLoginFromSuccessBtn = document.getElementById('backToLoginFromSuccess');
    
//     if (switchToSignupBtn) {
//         switchToSignupBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             showForm('signup');
//         });
//     }
    
//     if (switchToLoginBtn) {
//         switchToLoginBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             showForm('login');
//         });
//     }
    
//     if (forgotPasswordLink) {
//         forgotPasswordLink.addEventListener('click', (e) => {
//             e.preventDefault();
//             showForm('reset');
//         });
//     }
    
//     if (backToLoginBtn) {
//         backToLoginBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             showForm('login');
//         });
//     }
    
//     if (backToLoginFromSuccessBtn) {
//         backToLoginFromSuccessBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             document.getElementById('resetSuccess').classList.add('hidden');
//             document.getElementById('emailResetForm').classList.remove('hidden');
//             showForm('login');
//         });
//     }
    
//     // === FORMS ===
    
//     // Login form
//     const loginForm = document.getElementById('emailLoginForm');
//     if (loginForm) {
//         loginForm.addEventListener('submit', handleEmailLogin);
//     }
    
//     // Signup form
//     const signupForm = document.getElementById('emailSignupForm');
//     if (signupForm) {
//         signupForm.addEventListener('submit', handleEmailSignup);
//     }
    
//     // Reset password form
//     const resetForm = document.getElementById('emailResetForm');
//     if (resetForm) {
//         resetForm.addEventListener('submit', handlePasswordReset);
//     }
    
//     // === SOCIAL BUTTONS - LOGIN ===
    
//     const googleLoginBtn = document.getElementById('googleLoginBtn');
//     if (googleLoginBtn) {
//         googleLoginBtn.addEventListener('click', () => handleSocialLogin('google'));
//     }
    
//     // === SOCIAL BUTTONS - SIGNUP ===
    
//     const googleSignupBtn = document.getElementById('googleSignupBtn');
//     if (googleSignupBtn) {
//         googleSignupBtn.addEventListener('click', () => handleSocialLogin('google'));
//     }
    
//     // === TOGGLE PASSWORD VISIBILITY ===
    
//     const toggleLoginPassword = document.getElementById('toggleLoginPassword');
//     if (toggleLoginPassword) {
//         toggleLoginPassword.addEventListener('click', () => {
//             togglePasswordVisibility('loginPassword', toggleLoginPassword);
//         });
//     }
    
//     const toggleSignupPassword = document.getElementById('toggleSignupPassword');
//     if (toggleSignupPassword) {
//         toggleSignupPassword.addEventListener('click', () => {
//             togglePasswordVisibility('signupPassword', toggleSignupPassword);
//         });
//     }
    
//     // === PASSWORD STRENGTH CHECKER ===
    
//     const signupPassword = document.getElementById('signupPassword');
//     if (signupPassword) {
//         signupPassword.addEventListener('input', (e) => {
//             checkPasswordStrength(e.target.value);
//         });
//     }
// }

// // ============================================
// // FORM NAVIGATION
// // ============================================

// function showForm(formType) {
//     const loginForm = document.getElementById('loginForm');
//     const signupForm = document.getElementById('signupForm');
//     const resetPasswordForm = document.getElementById('resetPasswordForm');
    
//     // Hide all forms
//     loginForm.classList.add('hidden');
//     signupForm.classList.add('hidden');
//     resetPasswordForm.classList.add('hidden');
    
//     // Show requested form
//     switch(formType) {
//         case 'login':
//             loginForm.classList.remove('hidden');
//             break;
//         case 'signup':
//             signupForm.classList.remove('hidden');
//             break;
//         case 'reset':
//             resetPasswordForm.classList.remove('hidden');
//             break;
//     }
    
//     // Clear errors
//     clearAllErrors();
// }

// // ============================================
// // EMAIL AUTHENTICATION
// // ============================================

// /**
//  * Handle email login
//  */
// async function handleEmailLogin(e) {
//     e.preventDefault();
    
//     if (isProcessing) return;
    
//     const email = document.getElementById('loginEmail').value.trim();
//     const password = document.getElementById('loginPassword').value;
//     const rememberMe = document.getElementById('rememberMe').checked;
    
//     // Validation
//     if (!validateEmail(email)) {
//         showFieldError('loginEmail', 'Invalid email address');
//         return;
//     }
    
//     if (!password) {
//         showFieldError('loginPassword', 'Password required');
//         return;
//     }
    
//     // Clear previous errors
//     clearAllErrors();
    
//     // Show loader
//     setButtonLoading('loginSubmitBtn', true);
//     isProcessing = true;
    
//     try {
//         // Configure persistence
//         const persistence = rememberMe 
//             ? firebase.auth.Auth.Persistence.LOCAL 
//             : firebase.auth.Auth.Persistence.SESSION;
        
//         await firebaseAuth.setPersistence(persistence);
        
//         // Sign in
//         const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
//         const user = userCredential.user;
        
//         console.log('✅ Login successful:', user.email);
        
//         // Log user login in Firestore
//         await logUserLogin(user.uid, 'email');
        
//         // Show success message
//         showToast('success', 'Login successful!', `Welcome ${user.email}`);
        
//         // Redirect to dashboard
//         setTimeout(() => {
//             window.location.href = 'dashboard-financier.html';
//         }, 1000);
        
//     } catch (error) {
//         console.error('❌ Login error:', error);
        
//         const errorMessage = getFirebaseErrorMessage(error.code);
//         showToast('error', 'Login error', errorMessage);
        
//         // Show error on appropriate field
//         if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
//             showFieldError('loginEmail', errorMessage);
//         } else {
//             showFieldError('loginPassword', errorMessage);
//         }
        
//     } finally {
//         setButtonLoading('loginSubmitBtn', false);
//         isProcessing = false;
//     }
// }

// /**
//  * Handle email signup
//  * ✅ VERSION CORRIGÉE : Gestion robuste des erreurs + Redirection checkout
//  */
// async function handleEmailSignup(e) {
//     e.preventDefault();
    
//     if (isProcessing) return;
    
//     const firstName = document.getElementById('signupFirstName').value.trim();
//     const lastName = document.getElementById('signupLastName').value.trim();
//     const email = document.getElementById('signupEmail').value.trim();
//     const password = document.getElementById('signupPassword').value;
//     const company = document.getElementById('signupCompany').value.trim();
//     const acceptTerms = document.getElementById('acceptTerms').checked;
    
//     // Validation
//     let hasError = false;
    
//     if (!firstName) {
//         showFieldError('signupFirstName', 'First name required');
//         hasError = true;
//     }
    
//     if (!lastName) {
//         showFieldError('signupLastName', 'Last name required');
//         hasError = true;
//     }
    
//     if (!validateEmail(email)) {
//         showFieldError('signupEmail', 'Invalid email address');
//         hasError = true;
//     }
    
//     if (password.length < 6) {
//         showFieldError('signupPassword', 'Password must be at least 6 characters');
//         hasError = true;
//     }
    
//     if (!acceptTerms) {
//         showFieldError('acceptTerms', 'You must accept the terms of service');
//         hasError = true;
//     }
    
//     if (hasError) return;
    
//     // Clear previous errors
//     clearAllErrors();
    
//     // Show loader
//     setButtonLoading('signupSubmitBtn', true);
//     isProcessing = true;
    
//     try {
//         console.log('🔐 Création du compte pour:', email);
        
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         // ÉTAPE 1 : Créer le compte Firebase
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
//         const user = userCredential.user;
        
//         console.log('✅ Compte Firebase créé:', user.email);
        
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         // ÉTAPE 2 : Mettre à jour le profil
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         await user.updateProfile({
//             displayName: `${firstName} ${lastName}`
//         });
//         console.log('✅ Profil mis à jour');
        
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         // ÉTAPE 3 : Envoyer email de vérification (OPTIONNEL)
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         try {
//             await user.sendEmailVerification({
//                 url: window.location.origin + '/dashboard-financier.html',
//                 handleCodeInApp: false // ✅ Évite l'erreur de domaine
//             });
//             console.log('✅ Email de vérification envoyé');
//         } catch (emailError) {
//             // ⚠ On continue même si l'email échoue
//             console.warn('⚠ Email de vérification non envoyé:', emailError.code);
//             console.warn('   → Le compte est quand même créé, pas de blocage');
//         }
        
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         // ÉTAPE 4 : Créer le profil Firestore
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         await createUserProfile(user.uid, {
//             firstName,
//             lastName,
//             email,
//             company,
//             createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//             emailVerified: false,
//             plan: 'free', // Sera mis à jour après le checkout
//             trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
//             metadata: {
//                 signupMethod: 'email',
//                 userAgent: navigator.userAgent,
//                 language: navigator.language
//             }
//         });
//         console.log('✅ Profil Firestore créé');
        
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         // ÉTAPE 5 : Logger la connexion
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         await logUserLogin(user.uid, 'email_signup');
//         console.log('✅ Login enregistré');
        
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         // ÉTAPE 6 : Stocker les informations pour le checkout
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         sessionStorage.setItem('isNewUser', 'true');
//         sessionStorage.setItem('userEmail', email);
//         sessionStorage.setItem('userDisplayName', `${firstName} ${lastName}`);
//         sessionStorage.setItem('userId', user.uid);
//         sessionStorage.setItem('signupTimestamp', Date.now().toString());
        
//         console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981; font-weight: bold;');
//         console.log('%c🎉 COMPTE CRÉÉ AVEC SUCCÈS !', 'color: #10b981; font-weight: bold; font-size: 16px;');
//         console.log('%c📧 Email:', 'color: #3b82f6;', email);
//         console.log('%c👤 Nom:', 'color: #3b82f6;', `${firstName} ${lastName}`);
//         console.log('%c🆔 UID:', 'color: #3b82f6;', user.uid);
//         console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981; font-weight: bold;');
        
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         // ÉTAPE 7 : Message de succès
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         showToast('success', 'Account created!', 'Choose your plan to get started.');
        
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         // ÉTAPE 8 : REDIRECTION VERS CHECKOUT
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         console.log('%c🚀 Redirection vers checkout dans 1.5s...', 'color: #f59e0b; font-weight: bold;');
        
//         setTimeout(() => {
//             console.log('%c➡  REDIRECTION EN COURS...', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
//             window.location.href = 'checkout.html';
//         }, 1500);
        
//     } catch (error) {
//         console.error('%c❌ ERREUR CRÉATION DE COMPTE', 'background: #ef4444; color: white; padding: 5px; font-weight: bold;');
//         console.error('Code:', error.code);
//         console.error('Message:', error.message);
//         console.error('Détails complets:', error);
        
//         const errorMessage = getFirebaseErrorMessage(error.code);
//         showToast('error', 'Signup error', errorMessage);
        
//         if (error.code === 'auth/email-already-in-use') {
//             showFieldError('signupEmail', errorMessage);
//         } else if (error.code === 'auth/weak-password') {
//             showFieldError('signupPassword', errorMessage);
//         }
        
//     } finally {
//         setButtonLoading('signupSubmitBtn', false);
//         isProcessing = false;
//     }
// }

// // ============================================
// // SOCIAL AUTHENTICATION
// // ============================================

// /**
//  * Handle social login (Google, Apple, Microsoft)
//  * ✅ MODIFIÉ : Redirection checkout pour nouveaux comptes uniquement
//  */
// async function handleSocialLogin(providerType) {
//     if (isProcessing) return;
    
//     isProcessing = true;
    
//     let provider;
//     let providerName;
    
//     switch(providerType) {
//         case 'google':
//             provider = googleProvider;
//             providerName = 'Google';
//             break;
//         default:
//             console.error('Unknown provider:', providerType);
//             isProcessing = false;
//             return;
//     }
    
//     try {
//         console.log(`🔐 Attempting login with ${providerName}...`);
        
//         // Sign in with popup
//         const result = await firebaseAuth.signInWithPopup(provider);
//         const user = result.user;
//         const isNewUser = result.additionalUserInfo.isNewUser;
        
//         console.log('✅ Login successful with', providerName, ':', user.email);
//         console.log('📊 Is new user:', isNewUser);
        
//         // If new user, create profile
//         if (isNewUser) {
//             const profile = result.additionalUserInfo.profile;
            
//             await createUserProfile(user.uid, {
//                 firstName: profile.given_name || profile.name?.split(' ')[0] || '',
//                 lastName: profile.family_name || profile.name?.split(' ')[1] || '',
//                 email: user.email,
//                 photoURL: user.photoURL,
//                 createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//                 emailVerified: user.emailVerified,
//                 plan: 'free', // Plan will be updated after checkout
//                 trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
//                 metadata: {
//                     signupMethod: providerType,
//                     userAgent: navigator.userAgent,
//                     language: navigator.language
//                 }
//             });
            
//             // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//             // ✅ NOUVEAU : Stockage des informations pour le checkout
//             // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//             sessionStorage.setItem('isNewUser', 'true');
//             sessionStorage.setItem('userEmail', user.email);
//             sessionStorage.setItem('userDisplayName', user.displayName || user.email);
//             sessionStorage.setItem('userId', user.uid);
//             sessionStorage.setItem('userPhotoURL', user.photoURL || '');
//             sessionStorage.setItem('signupTimestamp', Date.now().toString());
            
//             console.log('🎉 New account via', providerName, '- Redirecting to checkout...');
//         }
        
//         // Log login
//         await logUserLogin(user.uid, providerType);
        
//         // Success message (différent selon nouveau/existant)
//         const successMessage = isNewUser 
//             ? 'Choose your plan to get started.' 
//             : `Welcome back ${user.displayName || user.email}`;
        
//         showToast('success', 'Login successful!', successMessage);
        
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         // ✅ REDIRECTION CONDITIONNELLE
//         // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//         setTimeout(() => {
//             if (isNewUser) {
//                 console.log('%c➡  REDIRECTION VERS CHECKOUT (nouveau compte)', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
//                 window.location.href = 'checkout.html';
//             } else {
//                 console.log('%c➡  REDIRECTION VERS DASHBOARD (compte existant)', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
//                 window.location.href = 'dashboard-financier.html';
//             }
//         }, 1500);
        
//     } catch (error) {
//         console.error(`❌ Login error with ${providerName}:`, error);
        
//         // Handle specific popup errors
//         if (error.code === 'auth/popup-closed-by-user') {
//             showToast('warning', 'Login cancelled', 'You closed the login window.');
//         } else if (error.code === 'auth/popup-blocked') {
//             showToast('error', 'Popup blocked', 'Please allow popups for this site.');
//         } else if (error.code === 'auth/account-exists-with-different-credential') {
//             showToast('error', 'Account exists', 'An account already exists with this email. Use another login method.');
//         } else {
//             const errorMessage = getFirebaseErrorMessage(error.code);
//             showToast('error', 'Login error', errorMessage);
//         }
        
//     } finally {
//         isProcessing = false;
//     }
// }

// // ============================================
// // PASSWORD RESET
// // ============================================

// /**
//  * Handle password reset
//  */
// async function handlePasswordReset(e) {
//     e.preventDefault();
    
//     if (isProcessing) return;
    
//     const email = document.getElementById('resetEmail').value.trim();
    
//     // Validation
//     if (!validateEmail(email)) {
//         showFieldError('resetEmail', 'Invalid email address');
//         return;
//     }
    
//     // Clear previous errors
//     clearAllErrors();
    
//     // Show loader
//     setButtonLoading('resetSubmitBtn', true);
//     isProcessing = true;
    
//     try {
//         // Send reset email
//         await firebaseAuth.sendPasswordResetEmail(email, {
//             url: window.location.origin + '/auth.html',
//             handleCodeInApp: true
//         });
        
//         console.log('✅ Reset email sent to:', email);
        
//         // Hide form and show success message
//         document.getElementById('emailResetForm').classList.add('hidden');
//         document.getElementById('resetSuccess').classList.remove('hidden');
        
//     } catch (error) {
//         console.error('❌ Error sending email:', error);
        
//         const errorMessage = getFirebaseErrorMessage(error.code);
//         showToast('error', 'Error', errorMessage);
//         showFieldError('resetEmail', errorMessage);
        
//     } finally {
//         setButtonLoading('resetSubmitBtn', false);
//         isProcessing = false;
//     }
// }

// // ============================================
// // FIRESTORE - PROFILE MANAGEMENT
// // ============================================

// /**
//  * Create user profile in Firestore
//  */
// async function createUserProfile(uid, profileData) {
//     try {
//         await firebaseDb.collection('users').doc(uid).set(profileData, { merge: true });
//         console.log('✅ User profile created/updated in Firestore');
//     } catch (error) {
//         console.error('❌ Error creating profile:', error);
//         throw error;
//     }
// }

// /**
//  * Log user login
//  */
// async function logUserLogin(uid, method) {
//     try {
//         await firebaseDb.collection('users').doc(uid).collection('login_history').add({
//             timestamp: firebase.firestore.FieldValue.serverTimestamp(),
//             method: method,
//             userAgent: navigator.userAgent,
//             ip: 'client-side' // IP should be retrieved server-side
//         });
        
//         // Update last login
//         await firebaseDb.collection('users').doc(uid).update({
//             lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
//             lastLoginMethod: method
//         });
        
//         console.log('✅ Login recorded in Firestore');
//     } catch (error) {
//         console.error('❌ Error logging login:', error);
//     }
// }

// // ============================================
// // AUTH STATE CHECK
// // ============================================

// /**
//  * Check if user is already logged in
//  */
// function checkAuthState() {
//     const user = getCurrentUser();
    
//     if (user) {
//         console.log('ℹ User already logged in:', user.email);
        
//         // Show notification
//         showToast('info', 'Already logged in', 'You are already logged in. Redirecting...');
        
//         // Redirect to dashboard after 1 second
//         setTimeout(() => {
//             window.location.href = 'dashboard-financier.html';
//         }, 1000);
//     }
// }

// // ============================================
// // VALIDATION UTILITIES
// // ============================================

// /**
//  * Validate email address
//  */
// function validateEmail(email) {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
// }

// /**
//  * Check password strength
//  */
// function checkPasswordStrength(password) {
//     const strengthIndicator = document.getElementById('passwordStrength');
//     const strengthText = document.getElementById('strengthText');
//     const strengthBars = document.querySelectorAll('.strength-bar');
    
//     if (!strengthIndicator || !strengthText || !strengthBars.length) return;
    
//     let strength = 0;
//     let strengthLabel = 'Very weak';
    
//     // Strength criteria
//     if (password.length >= 6) strength++;
//     if (password.length >= 10) strength++;
//     if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
//     if (/[0-9]/.test(password)) strength++;
//     if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
//     // Update bars
//     strengthBars.forEach((bar, index) => {
//         bar.classList.remove('active', 'medium', 'strong');
        
//         if (index < strength) {
//             bar.classList.add('active');
            
//             if (strength >= 3) {
//                 bar.classList.add('medium');
//             }
//             if (strength >= 4) {
//                 bar.classList.remove('medium');
//                 bar.classList.add('strong');
//             }
//         }
//     });
    
//     // Update text
//     switch(strength) {
//         case 0:
//         case 1:
//             strengthLabel = 'Very weak';
//             break;
//         case 2:
//             strengthLabel = 'Weak';
//             break;
//         case 3:
//             strengthLabel = 'Medium';
//             break;
//         case 4:
//             strengthLabel = 'Strong';
//             break;
//         case 5:
//             strengthLabel = 'Very strong';
//             break;
//     }
    
//     strengthText.textContent = strengthLabel;
// }

// /**
//  * Toggle password visibility
//  */
// function togglePasswordVisibility(inputId, toggleButton) {
//     const passwordInput = document.getElementById(inputId);
//     const icon = toggleButton.querySelector('i');
    
//     if (passwordInput.type === 'password') {
//         passwordInput.type = 'text';
//         icon.classList.remove('fa-eye');
//         icon.classList.add('fa-eye-slash');
//     } else {
//         passwordInput.type = 'password';
//         icon.classList.remove('fa-eye-slash');
//         icon.classList.add('fa-eye');
//     }
// }

// // ============================================
// // FORM ERROR MANAGEMENT
// // ============================================

// /**
//  * Show field error
//  */
// function showFieldError(fieldId, message) {
//     const field = document.getElementById(fieldId);
//     const errorElement = document.getElementById(fieldId + 'Error');
    
//     if (field) {
//         field.classList.add('error');
//     }
    
//     if (errorElement) {
//         errorElement.textContent = message;
//         errorElement.classList.add('active');
//     }
// }

// /**
//  * Clear all errors
//  */
// function clearAllErrors() {
//     const errorFields = document.querySelectorAll('.form-input.error');
//     const errorMessages = document.querySelectorAll('.form-error.active');
    
//     errorFields.forEach(field => field.classList.remove('error'));
//     errorMessages.forEach(message => {
//         message.classList.remove('active');
//         message.textContent = '';
//     });
// }

// // ============================================
// // BUTTON MANAGEMENT
// // ============================================

// /**
//  * Enable/disable button loading state (WITHOUT SPINNER)
//  * ✅ VERSION SANS ANIMATION
//  */
// function setButtonLoading(buttonId, isLoading) {
//     const button = document.getElementById(buttonId);
    
//     if (!button) return;
    
//     if (isLoading) {
//         button.disabled = true;
//         button.style.opacity = '0.7'; // Optionnel : effet visuel discret
//         button.style.cursor = 'not-allowed';
//     } else {
//         button.disabled = false;
//         button.style.opacity = '1';
//         button.style.cursor = 'pointer';
//     }
// }

// // ============================================
// // TOAST NOTIFICATIONS
// // ============================================

// /**
//  * Show toast notification
//  * ✅ VERSION CORRIGÉE : Création automatique du conteneur
//  */
// function showToast(type, title, message) {
//     let toastContainer = document.getElementById('toastContainer');
    
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // ✅ CRÉER LE CONTENEUR S'IL N'EXISTE PAS
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     if (!toastContainer) {
//         console.log('📦 Création du conteneur de toasts...');
//         toastContainer = document.createElement('div');
//         toastContainer.id = 'toastContainer';
//         toastContainer.className = 'toast-container';
//         toastContainer.style.cssText = `
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             z-index: 99999;
//             display: flex;
//             flex-direction: column;
//             gap: 12px;
//             pointer-events: none;
//         `;
//         document.body.appendChild(toastContainer);
//         console.log('✅ Conteneur de toasts créé');
//     }
    
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // CRÉER LE TOAST
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     const toast = document.createElement('div');
//     toast.className = `toast ${type}`;
//     toast.style.cssText = `
//         background: white;
//         border-radius: 12px;
//         padding: 16px 20px;
//         box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
//         display: flex;
//         align-items: center;
//         gap: 12px;
//         min-width: 320px;
//         max-width: 480px;
//         pointer-events: auto;
//         animation: slideInRight 0.3s ease forwards;
//         border-left: 4px solid;
//     `;
    
//     // Couleur selon le type
//     let iconClass = 'fa-info-circle';
//     let borderColor = '#3b82f6';
    
//     switch(type) {
//         case 'success':
//             iconClass = 'fa-check-circle';
//             borderColor = '#10b981';
//             break;
//         case 'error':
//             iconClass = 'fa-times-circle';
//             borderColor = '#ef4444';
//             break;
//         case 'warning':
//             iconClass = 'fa-exclamation-triangle';
//             borderColor = '#f59e0b';
//             break;
//     }
    
//     toast.style.borderLeftColor = borderColor;
    
//     toast.innerHTML = `
        
//             <i></i>
        
        
            
//                 ${title}
            
            
//                 ${message}
            
        
        
//             <i></i>
        
//     `;
    
//     // Ajouter au conteneur
//     toastContainer.appendChild(toast);
    
//     console.log(`📢 Toast affiché: [${type.toUpperCase()}] ${title} - ${message}`);
    
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // GESTION DE LA FERMETURE
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     const closeBtn = toast.querySelector('.toast-close');
//     if (closeBtn) {
//         closeBtn.addEventListener('click', () => {
//             removeToast(toast);
//         });
//     }
    
//     // Auto-suppression après 5 secondes
//     setTimeout(() => {
//         removeToast(toast);
//     }, 5000);
// }

// /**
//  * Remove toast notification
//  */
// function removeToast(toast) {
//     if (!toast || !toast.parentNode) return;
    
//     toast.style.animation = 'slideOutRight 0.3s ease forwards';
//     setTimeout(() => {
//         if (toast.parentNode) {
//             toast.parentNode.removeChild(toast);
//         }
//     }, 300);
// }

// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// // ANIMATIONS CSS
// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// const toastStyles = document.createElement('style');
// toastStyles.textContent = `
//     @keyframes slideInRight {
//         from {
//             transform: translateX(100%);
//             opacity: 0;
//         }
//         to {
//             transform: translateX(0);
//             opacity: 1;
//         }
//     }
    
//     @keyframes slideOutRight {
//         from {
//             transform: translateX(0);
//             opacity: 1;
//         }
//         to {
//             transform: translateX(100%);
//             opacity: 0;
//         }
//     }
    
//     .toast-close:hover {
//         color: #1e293b !important;
//     }
// `;
// document.head.appendChild(toastStyles);

// // ============================================
// // GLOBAL EVENT LISTENERS
// // ============================================

// // Detect logout
// window.addEventListener('userLoggedOut', () => {
//     console.log('ℹ User logged out');
// });

// // Detect authentication
// window.addEventListener('userAuthenticated', (e) => {
//     console.log('✅ User authenticated:', e.detail);
// });

// console.log('✅ Authentication script loaded - Version optimisée checkout + Gestion robuste des erreurs');

/* ============================================
   AUTH.JS - FinancePro Authentication
   Complete authentication management
   🎯 VERSION OPTIMISÉE ET CORRIGÉE
   ✅ Redirection checkout pour nouveaux comptes
   ✅ Gestion robuste des erreurs
   ✅ Toast container auto-créé
   ✅ REFERRAL PROGRAM TRACKING ✨ CORRIGÉ
   ============================================ */

// ============================================
// GLOBAL VARIABLES
// ============================================

let isProcessing = false;

// ============================================
// INITIALIZATION ON LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing authentication system...');
    
    // ✅ Attendre que Firebase soit prêt
    const initTimeout = setTimeout(() => {
        console.error('❌ Firebase initialization timeout');
        showToast('error', 'Error', 'Unable to connect to authentication service. Please refresh the page.');
    }, 5000);
    
    const checkFirebase = () => {
        // Vérifier Firebase
        if (typeof window.firebaseAuth === 'undefined' || 
            typeof window.firebaseDb === 'undefined' ||
            typeof window.isFirebaseInitialized !== 'function') {
            console.log('⏳ Waiting for Firebase...');
            return false;
        }
        
        if (!window.isFirebaseInitialized()) {
            console.log('⏳ Firebase not fully initialized...');
            return false;
        }
        
        return true;
    };
    
    // Retry toutes les 100ms pendant max 5 secondes
    const retryInit = setInterval(() => {
        if (checkFirebase()) {
            clearInterval(retryInit);
            clearTimeout(initTimeout);
            
            console.log('✅ Firebase ready - initializing auth...');
            
            // Détecter le code de parrainage
            if (typeof window.detectAndStoreReferralCode === 'function') {
                window.detectAndStoreReferralCode();
            }
            
            // Initialiser l'authentification
            initializeAuth();
        }
    }, 100);
});

// ✅ FONCTION D'INITIALISATION
function initializeAuth() {
    // Initialize event listeners
    initializeEventListeners();
    
    // Check if user is already logged in
    checkAuthState();
    
    console.log('✅ Authentication system initialized');
}

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // === FORM NAVIGATION ===
    
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
    
    // === FORMS ===
    
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
    
    // === SOCIAL BUTTONS - LOGIN ===
    
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => handleSocialLogin('google'));
    }
    
    // === SOCIAL BUTTONS - SIGNUP ===
    
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', () => handleSocialLogin('google'));
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
// FORM NAVIGATION
// ============================================

function showForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    
    // Hide all forms
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    resetPasswordForm.classList.add('hidden');
    
    // Show requested form
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
    
    // Clear errors
    clearAllErrors();
}

// ============================================
// EMAIL AUTHENTICATION
// ============================================

/**
 * Handle email login
 */
async function handleEmailLogin(e) {
    e.preventDefault();
    
    if (isProcessing) return;
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validation
    if (!validateEmail(email)) {
        showFieldError('loginEmail', 'Invalid email address');
        return;
    }
    
    if (!password) {
        showFieldError('loginPassword', 'Password required');
        return;
    }
    
    // Clear previous errors
    clearAllErrors();
    
    // Show loader
    setButtonLoading('loginSubmitBtn', true);
    isProcessing = true;
    
    try {
        // Configure persistence
        const persistence = rememberMe 
            ? firebase.auth.Auth.Persistence.LOCAL 
            : firebase.auth.Auth.Persistence.SESSION;
        
        await firebaseAuth.setPersistence(persistence);
        
        // Sign in
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Login successful:', user.email);
        
        // Log user login in Firestore
        await logUserLogin(user.uid, 'email');
        
        // Show success message
        showToast('success', 'Login successful!', `Welcome ${user.email}`);
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard-financier.html';
        }, 1000);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        
        const errorMessage = getFirebaseErrorMessage(error.code);
        showToast('error', 'Login error', errorMessage);
        
        // Show error on appropriate field
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
 * Handle email signup
 * ✅ VERSION CORRIGÉE : Tracking du parrainage AVANT redirection
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
        showFieldError('signupFirstName', 'First name required');
        hasError = true;
    }
    
    if (!lastName) {
        showFieldError('signupLastName', 'Last name required');
        hasError = true;
    }
    
    if (!validateEmail(email)) {
        showFieldError('signupEmail', 'Invalid email address');
        hasError = true;
    }
    
    if (password.length < 6) {
        showFieldError('signupPassword', 'Password must be at least 6 characters');
        hasError = true;
    }
    
    if (!acceptTerms) {
        showFieldError('acceptTerms', 'You must accept the terms of service');
        hasError = true;
    }
    
    if (hasError) return;
    
    // Clear previous errors
    clearAllErrors();
    
    // Show loader
    setButtonLoading('signupSubmitBtn', true);
    isProcessing = true;
    
    try {
        console.log('🔐 Création du compte pour:', email);
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ÉTAPE 1 : Créer le compte Firebase
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Compte Firebase créé:', user.email);
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ÉTAPE 2 : Mettre à jour le profil
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await user.updateProfile({
            displayName: `${firstName} ${lastName}`
        });
        console.log('✅ Profil mis à jour');
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ÉTAPE 3 : Envoyer email de vérification (OPTIONNEL)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        try {
            await user.sendEmailVerification({
                url: window.location.origin + '/dashboard-financier.html',
                handleCodeInApp: false
            });
            console.log('✅ Email de vérification envoyé');
        } catch (emailError) {
            console.warn('⚠ Email de vérification non envoyé:', emailError.code);
        }
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ÉTAPE 4 : Créer le profil Firestore
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await createUserProfile(user.uid, {
            firstName,
            lastName,
            email,
            company,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: false,
            plan: 'free',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            metadata: {
                signupMethod: 'email',
                userAgent: navigator.userAgent,
                language: navigator.language
            }
        });
        console.log('✅ Profil Firestore créé');
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ✅ ÉTAPE 4.5 : TRACKER LE PARRAINAGE (AVANT REDIRECTION)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (typeof window.trackReferralSignup === 'function') {
            console.log('🎁 Tracking du parrainage...');
            await window.trackReferralSignup(user);
        } else {
            console.warn('⚠ trackReferralSignup non disponible');
        }
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ÉTAPE 5 : Logger la connexion
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await logUserLogin(user.uid, 'email_signup');
        console.log('✅ Login enregistré');
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ÉTAPE 6 : Stocker les informations pour le checkout
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        sessionStorage.setItem('isNewUser', 'true');
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userDisplayName', `${firstName} ${lastName}`);
        sessionStorage.setItem('userId', user.uid);
        sessionStorage.setItem('signupTimestamp', Date.now().toString());
        
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981; font-weight: bold;');
        console.log('%c🎉 COMPTE CRÉÉ AVEC SUCCÈS !', 'color: #10b981; font-weight: bold; font-size: 16px;');
        console.log('%c📧 Email:', 'color: #3b82f6;', email);
        console.log('%c👤 Nom:', 'color: #3b82f6;', `${firstName} ${lastName}`);
        console.log('%c🆔 UID:', 'color: #3b82f6;', user.uid);
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981; font-weight: bold;');
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ÉTAPE 7 : Message de succès
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        showToast('success', 'Account created!', 'Choose your plan to get started.');
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ÉTAPE 8 : REDIRECTION VERS CHECKOUT
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        console.log('%c🚀 Redirection vers checkout dans 1.5s...', 'color: #f59e0b; font-weight: bold;');
        
        setTimeout(() => {
            console.log('%c➡  REDIRECTION EN COURS...', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
            window.location.href = 'checkout.html';
        }, 1500);
        
    } catch (error) {
        console.error('%c❌ ERREUR CRÉATION DE COMPTE', 'background: #ef4444; color: white; padding: 5px; font-weight: bold;');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        
        const errorMessage = getFirebaseErrorMessage(error.code);
        showToast('error', 'Signup error', errorMessage);
        
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
// SOCIAL AUTHENTICATION
// ============================================

/**
 * Handle social login (Google, Apple, Microsoft)
 * ✅ VERSION CORRIGÉE : Tracking du parrainage AVANT redirection
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
        default:
            console.error('Unknown provider:', providerType);
            isProcessing = false;
            return;
    }
    
    try {
        console.log(`🔐 Attempting login with ${providerName}...`);
        
        // Sign in with popup
        const result = await firebaseAuth.signInWithPopup(provider);
        const user = result.user;
        const isNewUser = result.additionalUserInfo.isNewUser;
        
        console.log('✅ Login successful with', providerName, ':', user.email);
        console.log('📊 Is new user:', isNewUser);
        
        // If new user, create profile
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
            
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ✅ TRACKER LE PARRAINAGE POUR SOCIAL AUTH (AVANT REDIRECTION)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            if (typeof window.trackReferralSignup === 'function') {
                console.log('🎁 Tracking du parrainage...');
                await window.trackReferralSignup(user);
            } else {
                console.warn('⚠ trackReferralSignup non disponible');
            }
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            
            // Stockage des informations pour le checkout
            sessionStorage.setItem('isNewUser', 'true');
            sessionStorage.setItem('userEmail', user.email);
            sessionStorage.setItem('userDisplayName', user.displayName || user.email);
            sessionStorage.setItem('userId', user.uid);
            sessionStorage.setItem('userPhotoURL', user.photoURL || '');
            sessionStorage.setItem('signupTimestamp', Date.now().toString());
            
            console.log('🎉 New account via', providerName, '- Redirecting to checkout...');
        }
        
        // Log login
        await logUserLogin(user.uid, providerType);
        
        // Success message (différent selon nouveau/existant)
        const successMessage = isNewUser 
            ? 'Choose your plan to get started.' 
            : `Welcome back ${user.displayName || user.email}`;
        
        showToast('success', 'Login successful!', successMessage);
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ✅ REDIRECTION CONDITIONNELLE
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        setTimeout(() => {
            if (isNewUser) {
                console.log('%c➡  REDIRECTION VERS CHECKOUT (nouveau compte)', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
                window.location.href = 'checkout.html';
            } else {
                console.log('%c➡  REDIRECTION VERS DASHBOARD (compte existant)', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
                window.location.href = 'dashboard-financier.html';
            }
        }, 1500);
        
    } catch (error) {
        console.error(`❌ Login error with ${providerName}:`, error);
        
        // Handle specific popup errors
        if (error.code === 'auth/popup-closed-by-user') {
            showToast('warning', 'Login cancelled', 'You closed the login window.');
        } else if (error.code === 'auth/popup-blocked') {
            showToast('error', 'Popup blocked', 'Please allow popups for this site.');
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            showToast('error', 'Account exists', 'An account already exists with this email. Use another login method.');
        } else {
            const errorMessage = getFirebaseErrorMessage(error.code);
            showToast('error', 'Login error', errorMessage);
        }
        
    } finally {
        isProcessing = false;
    }
}

// ============================================
// PASSWORD RESET
// ============================================

async function handlePasswordReset(e) {
    e.preventDefault();
    
    if (isProcessing) return;
    
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!validateEmail(email)) {
        showFieldError('resetEmail', 'Invalid email address');
        return;
    }
    
    clearAllErrors();
    setButtonLoading('resetSubmitBtn', true);
    isProcessing = true;
    
    try {
        await firebaseAuth.sendPasswordResetEmail(email, {
            url: window.location.origin + '/auth.html',
            handleCodeInApp: true
        });
        
        console.log('✅ Reset email sent to:', email);
        
        document.getElementById('emailResetForm').classList.add('hidden');
        document.getElementById('resetSuccess').classList.remove('hidden');
        
    } catch (error) {
        console.error('❌ Error sending email:', error);
        
        const errorMessage = getFirebaseErrorMessage(error.code);
        showToast('error', 'Error', errorMessage);
        showFieldError('resetEmail', errorMessage);
        
    } finally {
        setButtonLoading('resetSubmitBtn', false);
        isProcessing = false;
    }
}

// ============================================
// FIRESTORE - PROFILE MANAGEMENT
// ============================================

async function createUserProfile(uid, profileData) {
    try {
        await firebaseDb.collection('users').doc(uid).set(profileData, { merge: true });
        console.log('✅ User profile created/updated in Firestore');
    } catch (error) {
        console.error('❌ Error creating profile:', error);
        throw error;
    }
}

async function logUserLogin(uid, method) {
    try {
        await firebaseDb.collection('users').doc(uid).collection('login_history').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            method: method,
            userAgent: navigator.userAgent,
            ip: 'client-side'
        });
        
        await firebaseDb.collection('users').doc(uid).update({
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLoginMethod: method
        });
        
        console.log('✅ Login recorded in Firestore');
    } catch (error) {
        console.error('❌ Error logging login:', error);
    }
}

// ============================================
// AUTH STATE CHECK
// ============================================

function checkAuthState() {
    const user = getCurrentUser();
    
    if (user) {
        console.log('ℹ User already logged in:', user.email);
        showToast('info', 'Already logged in', 'You are already logged in. Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'dashboard-financier.html';
        }, 1000);
    }
}

// ============================================
// VALIDATION UTILITIES
// ============================================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');
    const strengthBars = document.querySelectorAll('.strength-bar');
    
    if (!strengthIndicator || !strengthText || !strengthBars.length) return;
    
    let strength = 0;
    let strengthLabel = 'Very weak';
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
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
    
    switch(strength) {
        case 0:
        case 1:
            strengthLabel = 'Very weak';
            break;
        case 2:
            strengthLabel = 'Weak';
            break;
        case 3:
            strengthLabel = 'Medium';
            break;
        case 4:
            strengthLabel = 'Strong';
            break;
        case 5:
            strengthLabel = 'Very strong';
            break;
    }
    
    strengthText.textContent = strengthLabel;
}

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
// FORM ERROR MANAGEMENT
// ============================================

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
// BUTTON MANAGEMENT
// ============================================

function setButtonLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.style.opacity = '0.7';
        button.style.cursor = 'not-allowed';
    } else {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(type, title, message) {
    let toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        console.log('📦 Création du conteneur de toasts...');
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
        console.log('✅ Conteneur de toasts créé');
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 320px;
        max-width: 480px;
        pointer-events: auto;
        animation: slideInRight 0.3s ease forwards;
        border-left: 4px solid;
    `;
    
    let iconClass = 'fa-info-circle';
    let borderColor = '#3b82f6';
    
    switch(type) {
        case 'success':
            iconClass = 'fa-check-circle';
            borderColor = '#10b981';
            break;
        case 'error':
            iconClass = 'fa-times-circle';
            borderColor = '#ef4444';
            break;
        case 'warning':
            iconClass = 'fa-exclamation-triangle';
            borderColor = '#f59e0b';
            break;
    }
    
    toast.style.borderLeftColor = borderColor;
    
    toast.innerHTML = `
        <div style="color: ${borderColor}; font-size: 24px; flex-shrink: 0;">
            <i class="fas ${iconClass}"></i>
        </div>
        <div style="flex: 1;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px; font-size: 14px;">
                ${title}
            </div>
            <div style="color: #64748b; font-size: 13px; line-height: 1.4;">
                ${message}
            </div>
        </div>
        <button class="toast-close" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 18px; padding: 4px; flex-shrink: 0;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    console.log(`📢 Toast affiché: [${type.toUpperCase()}] ${title} - ${message}`);
    
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
        });
    }
    
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
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
    
    .toast-close:hover {
        color: #1e293b !important;
    }
`;
document.head.appendChild(toastStyles);

// ============================================
// GLOBAL EVENT LISTENERS
// ============================================

window.addEventListener('userLoggedOut', () => {
    console.log('ℹ User logged out');
});

window.addEventListener('userAuthenticated', (e) => {
    console.log('✅ User authenticated:', e.detail);
});

console.log('✅ Authentication script loaded - Version avec REFERRAL TRACKING corrigé');