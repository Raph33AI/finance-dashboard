/* ============================================
   AUTH.JS - FinancePro Authentication
   Complete authentication management
   🎯 VERSION OPTIMISÉE : Redirection checkout pour nouveaux comptes
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
    
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
        showToast('error', 'Error', 'Unable to connect to authentication service.');
        return;
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Check if user is already logged in
    checkAuthState();
    
    console.log('✅ Authentication system initialized');
});

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
 * ✅ MODIFIÉ : Redirection vers checkout pour nouveaux comptes
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
        // Create account
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Account created:', user.email);
        
        // Update profile
        await user.updateProfile({
            displayName: `${firstName} ${lastName}`
        });
        
        // Send verification email
        await user.sendEmailVerification({
            url: window.location.origin + '/dashboard-financier.html',
            handleCodeInApp: true
        });
        
        // Create user profile in Firestore
        await createUserProfile(user.uid, {
            firstName,
            lastName,
            email,
            company,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: false,
            plan: 'free', // Plan will be updated after checkout
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            metadata: {
                signupMethod: 'email',
                userAgent: navigator.userAgent,
                language: navigator.language
            }
        });
        
        // Log login
        await logUserLogin(user.uid, 'email_signup');
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ✅ NOUVEAU : Stockage des informations pour le checkout
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        sessionStorage.setItem('isNewUser', 'true');
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userDisplayName', `${firstName} ${lastName}`);
        sessionStorage.setItem('userId', user.uid);
        
        console.log('🎉 New account created - Redirecting to checkout...');
        
        // Show success message
        showToast('success', 'Account created!', 'Choose your plan to get started.');
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ✅ REDIRECTION VERS CHECKOUT (au lieu de dashboard)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        setTimeout(() => {
            window.location.href = 'checkout.html';
        }, 1500);
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        
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
 * ✅ MODIFIÉ : Redirection checkout pour nouveaux comptes uniquement
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
                plan: 'free', // Plan will be updated after checkout
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                metadata: {
                    signupMethod: providerType,
                    userAgent: navigator.userAgent,
                    language: navigator.language
                }
            });
            
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ✅ NOUVEAU : Stockage des informations pour le checkout
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            sessionStorage.setItem('isNewUser', 'true');
            sessionStorage.setItem('userEmail', user.email);
            sessionStorage.setItem('userDisplayName', user.displayName || user.email);
            sessionStorage.setItem('userId', user.uid);
            sessionStorage.setItem('userPhotoURL', user.photoURL || '');
            
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
                // Nouveau compte → Checkout
                window.location.href = 'checkout.html';
            } else {
                // Compte existant → Dashboard
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

/**
 * Handle password reset
 */
async function handlePasswordReset(e) {
    e.preventDefault();
    
    if (isProcessing) return;
    
    const email = document.getElementById('resetEmail').value.trim();
    
    // Validation
    if (!validateEmail(email)) {
        showFieldError('resetEmail', 'Invalid email address');
        return;
    }
    
    // Clear previous errors
    clearAllErrors();
    
    // Show loader
    setButtonLoading('resetSubmitBtn', true);
    isProcessing = true;
    
    try {
        // Send reset email
        await firebaseAuth.sendPasswordResetEmail(email, {
            url: window.location.origin + '/auth.html',
            handleCodeInApp: true
        });
        
        console.log('✅ Reset email sent to:', email);
        
        // Hide form and show success message
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

/**
 * Create user profile in Firestore
 */
async function createUserProfile(uid, profileData) {
    try {
        await firebaseDb.collection('users').doc(uid).set(profileData, { merge: true });
        console.log('✅ User profile created/updated in Firestore');
    } catch (error) {
        console.error('❌ Error creating profile:', error);
        throw error;
    }
}

/**
 * Log user login
 */
async function logUserLogin(uid, method) {
    try {
        await firebaseDb.collection('users').doc(uid).collection('login_history').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            method: method,
            userAgent: navigator.userAgent,
            ip: 'client-side' // IP should be retrieved server-side
        });
        
        // Update last login
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

/**
 * Check if user is already logged in
 */
function checkAuthState() {
    const user = getCurrentUser();
    
    if (user) {
        console.log('ℹ User already logged in:', user.email);
        
        // Show notification
        showToast('info', 'Already logged in', 'You are already logged in. Redirecting...');
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
            window.location.href = 'dashboard-financier.html';
        }, 1000);
    }
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate email address
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check password strength
 */
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');
    const strengthBars = document.querySelectorAll('.strength-bar');
    
    if (!strengthIndicator || !strengthText || !strengthBars.length) return;
    
    let strength = 0;
    let strengthLabel = 'Very weak';
    
    // Strength criteria
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    // Update bars
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
    
    // Update text
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

/**
 * Toggle password visibility
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
// FORM ERROR MANAGEMENT
// ============================================

/**
 * Show field error
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
 * Clear all errors
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
// BUTTON MANAGEMENT
// ============================================

/**
 * Enable/disable button loading state
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
// TOAST NOTIFICATIONS
// ============================================

/**
 * Show toast notification
 */
function showToast(type, title, message) {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) return;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
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
        
            <i></i>
        
        
            ${title}
            ${message}
        
        
            <i></i>
        
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Close handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

/**
 * Remove toast notification
 */
function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Exit animation
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
// GLOBAL EVENT LISTENERS
// ============================================

// Detect logout
window.addEventListener('userLoggedOut', () => {
    console.log('ℹ User logged out');
});

// Detect authentication
window.addEventListener('userAuthenticated', (e) => {
    console.log('✅ User authenticated:', e.detail);
});

console.log('✅ Authentication script loaded - Version optimisée checkout');