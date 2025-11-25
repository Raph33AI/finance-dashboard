/* ═══════════════════════════════════════════════════════════════
   AUTH-SYSTEM.JS - FinancePro Navigation Authentication
   VERSION 2.0 - PLAN BASIC PAR DÉFAUT + EMAIL DE BIENVENUE
   ✅ Création de compte → plan "basic" + status "active"
   ✅ Email de confirmation automatique (via Cloudflare Worker)
   ═══════════════════════════════════════════════════════════════ */

// ============================================
// GLOBAL VARIABLES
// ============================================

let currentUser = null;
let userProfileData = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () =&gt; {
    console.log('🚀 Initializing navigation auth system v2.0...');
    
    // Vérifier que Firebase est bien initialisé
    if (typeof firebase === 'undefined' || typeof firebaseAuth === 'undefined') {
        console.error('❌ Firebase not initialized! Make sure firebase-config.js is loaded first.');
        return;
    }
    
    // Initialiser les event listeners du menu
    initializeProfileMenuListeners();
    
    // Écouter les changements d'état d'authentification
    initializeAuthStateListener();
    
    console.log('✅ Navigation auth system v2.0 initialized');
});

// ============================================
// FIREBASE AUTH STATE LISTENER
// ============================================

/**
 * Écouter les changements d'état d'authentification Firebase
 */
function initializeAuthStateListener() {
    firebaseAuth.onAuthStateChanged(async (user) =&gt; {
        if (user) {
            console.log('✅ User authenticated:', user.email);
            currentUser = user;
            
            // ✅ VÉRIFIER SI C'EST UNE NOUVELLE INSCRIPTION
            const isNewUser = await checkIfNewUser(user.uid);
            
            if (isNewUser) {
                console.log('🆕 New user detected - initializing account...');
                await initializeNewUserAccount(user);
            }
            
            // Charger les données du profil depuis Firestore
            await loadUserProfileData(user.uid);
            
            // Mettre à jour l'UI
            updateNavigationUI(true);
            updateUserProfileDisplay();
            
            // Émettre un événement global
            window.dispatchEvent(new CustomEvent('userAuthenticated', { 
                detail: { uid: user.uid, email: user.email } 
            }));
            
        } else {
            console.log('ℹ User not authenticated');
            currentUser = null;
            userProfileData = null;
            
            // Mettre à jour l'UI
            updateNavigationUI(false);
            
            // Émettre un événement global
            window.dispatchEvent(new Event('userLoggedOut'));
        }
    });
}

// ============================================
// ✅ NOUVEAU : VÉRIFIER SI NOUVEL UTILISATEUR
// ============================================

/**
 * Vérifier si l'utilisateur vient de s'inscrire
 */
async function checkIfNewUser(uid) {
    try {
        const userDoc = await firebaseDb.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
            console.log('📝 User document does not exist - this is a new user');
            return true;
        }
        
        const userData = userDoc.data();
        
        // Si le document existe mais n'a pas de plan défini, c'est un nouveau compte
        if (!userData.plan || !userData.subscriptionStatus) {
            console.log('📝 User document incomplete - initializing...');
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Error checking new user status:', error);
        return false;
    }
}

// ============================================
// ✅ NOUVEAU : INITIALISER UN NOUVEAU COMPTE
// ============================================

/**
 * Initialiser un nouveau compte utilisateur avec plan BASIC par défaut
 */
async function initializeNewUserAccount(user) {
    try {
        console.log('🔧 Initializing new user account...');
        
        // ✅ DONNÉES PAR DÉFAUT POUR NOUVEAU COMPTE
        const defaultUserData = {
            // Informations de base
            email: user.email,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ')[1] || '',
            photoURL: user.photoURL || null,
            
            // ✅ PLAN ET ABONNEMENT (VALEURS CORRIGÉES)
            plan: 'basic',                    // ✅ Plan BASIC par défaut
            subscriptionStatus: 'active',     // ✅ Statut ACTIF (accès aux pages basic)
            subscriptionPlan: 'basic',        // ✅ Cohérence avec "plan"
            
            // Dates
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            
            // Codes promo et trial
            promoCode: null,
            trialEndsAt: null,
            
            // Préférences
            emailNotifications: true,
            newsletter: true
        };
        
        // ✅ CRÉER LE DOCUMENT FIRESTORE
        await firebaseDb.collection('users').doc(user.uid).set(defaultUserData, { merge: true });
        
        console.log('✅ User document created in Firestore');
        console.log('📊 Default plan: basic');
        console.log('🔔 Subscription status: active');
        
        // ✅ ENVOYER L'EMAIL DE BIENVENUE (via Cloudflare Worker)
        await sendWelcomeEmail(user.email, defaultUserData.firstName || 'User');
        
        // ✅ MESSAGE DE CONFIRMATION À L'UTILISATEUR
        showNotification('success', 'Welcome!', 'Your account has been created successfully. You now have access to Basic features!');
        
        return defaultUserData;
        
    } catch (error) {
        console.error('❌ Error initializing new user account:', error);
        
        // ✅ FALLBACK : Créer au moins un document minimal
        try {
            await firebaseDb.collection('users').doc(user.uid).set({
                email: user.email,
                plan: 'basic',
                subscriptionStatus: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ Minimal user document created (fallback)');
        } catch (fallbackError) {
            console.error('❌ Fallback user creation failed:', fallbackError);
        }
        
        return null;
    }
}

// ============================================
// ✅ NOUVEAU : ENVOYER L'EMAIL DE BIENVENUE
// ============================================

/**
 * Envoyer un email de bienvenue via le Cloudflare Worker
 */
async function sendWelcomeEmail(email, firstName) {
    try {
        console.log('📧 Sending welcome email to:', email);
        
        // ✅ URL DE TON CLOUDFLARE WORKER (à remplacer)
        const workerURL = 'https://finance-hub-api.raphnardone.workers.dev';
        
        const response = await fetch(workerURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                firstName: firstName
            })
        });
        
        if (response.ok) {
            console.log('✅ Welcome email sent successfully');
            return true;
        } else {
            const errorData = await response.json();
            console.warn('⚠ Welcome email failed:', errorData);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        return false;
    }
}

// ============================================
// LOAD USER PROFILE DATA
// ============================================

/**
 * Charger les données utilisateur depuis Firestore
 */
async function loadUserProfileData(uid) {
    try {
        const userDoc = await firebaseDb.collection('users').doc(uid).get();
        
        if (userDoc.exists) {
            userProfileData = userDoc.data();
            console.log('✅ User profile loaded from Firestore');
            console.log('📊 User plan:', userProfileData.plan);
            console.log('🔔 Subscription status:', userProfileData.subscriptionStatus);
        } else {
            console.warn('⚠ User profile not found in Firestore');
            
            // Créer un profil basique si inexistant
            userProfileData = {
                firstName: currentUser.displayName?.split(' ')[0] || 'User',
                lastName: currentUser.displayName?.split(' ')[1] || '',
                email: currentUser.email,
                photoURL: currentUser.photoURL || null,
                plan: 'basic',
                subscriptionStatus: 'active'
            };
        }
    } catch (error) {
        console.error('❌ Error loading user profile:', error);
        
        // Fallback sur les données Firebase Auth
        userProfileData = {
            firstName: currentUser.displayName?.split(' ')[0] || 'User',
            lastName: currentUser.displayName?.split(' ')[1] || '',
            email: currentUser.email,
            photoURL: currentUser.photoURL || null,
            plan: 'basic',
            subscriptionStatus: 'active'
        };
    }
}

// ============================================
// UPDATE NAVIGATION UI
// ============================================

/**
 * Mettre à jour l'affichage de la navigation selon l'état d'authentification
 */
function updateNavigationUI(isAuthenticated) {
    const navCtaLoggedOut = document.getElementById('navCtaLoggedOut');
    const navCtaLoggedIn = document.getElementById('navCtaLoggedIn');
    
    if (!navCtaLoggedOut || !navCtaLoggedIn) {
        console.warn('⚠ Navigation elements not found on this page');
        return;
    }
    
    if (isAuthenticated) {
        navCtaLoggedOut.style.display = 'none';
        navCtaLoggedIn.style.display = 'flex';
        document.body.classList.add('user-authenticated');
    } else {
        navCtaLoggedOut.style.display = 'flex';
        navCtaLoggedIn.style.display = 'none';
        document.body.classList.remove('user-authenticated');
    }
}

// ============================================
// UPDATE USER PROFILE DISPLAY
// ============================================

/**
 * Mettre à jour les informations utilisateur affichées
 */
function updateUserProfileDisplay() {
    if (!currentUser || !userProfileData) return;
    
    const fullName = `${userProfileData.firstName || ''} ${userProfileData.lastName || ''}`.trim() 
                     || currentUser.displayName 
                     || 'User';
    
    const email = userProfileData.email || currentUser.email;
    
    const photoURL = userProfileData.photoURL 
                     || currentUser.photoURL 
                     || generateAvatarURL(fullName);
    
    const plan = formatPlanName(userProfileData.plan || 'basic');
    
    // === Mettre à jour le bouton profil ===
    
    const userAvatarImg = document.getElementById('userAvatarImg');
    if (userAvatarImg) {
        userAvatarImg.src = photoURL;
        userAvatarImg.alt = fullName;
    }
    
    const userDisplayName = document.getElementById('userDisplayName');
    if (userDisplayName) {
        userDisplayName.textContent = fullName;
    }
    
    const userPlanBadge = document.getElementById('userPlanBadge');
    if (userPlanBadge) {
        userPlanBadge.textContent = plan;
    }
    
    // === Mettre à jour le dropdown ===
    
    const dropdownAvatarImg = document.getElementById('dropdownAvatarImg');
    if (dropdownAvatarImg) {
        dropdownAvatarImg.src = photoURL;
        dropdownAvatarImg.alt = fullName;
    }
    
    const dropdownUserName = document.getElementById('dropdownUserName');
    if (dropdownUserName) {
        dropdownUserName.textContent = fullName;
    }
    
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    if (dropdownUserEmail) {
        dropdownUserEmail.textContent = email;
    }
    
    const dropdownUserPlan = document.getElementById('dropdownUserPlan');
    if (dropdownUserPlan) {
        dropdownUserPlan.textContent = plan;
    }
    
    console.log('✅ User profile display updated');
}

// ============================================
// PROFILE MENU LISTENERS
// ============================================

/**
 * Initialiser les event listeners du menu profil
 */
function initializeProfileMenuListeners() {
    const userProfileButton = document.getElementById('userProfileButton');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    if (userProfileButton &amp;&amp; userDropdownMenu) {
        userProfileButton.addEventListener('click', (e) =&gt; {
            e.stopPropagation();
            toggleProfileDropdown();
        });
        
        document.addEventListener('click', (e) =&gt; {
            if (!userProfileButton.contains(e.target) &amp;&amp; !userDropdownMenu.contains(e.target)) {
                closeProfileDropdown();
            }
        });
        
        document.addEventListener('keydown', (e) =&gt; {
            if (e.key === 'Escape' &amp;&amp; userDropdownMenu.classList.contains('active')) {
                closeProfileDropdown();
                userProfileButton.focus();
            }
        });
    }
    
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    const settingsLink = document.getElementById('settingsLink');
    if (settingsLink) {
        settingsLink.addEventListener('click', (e) =&gt; {
            e.preventDefault();
            handleSettings();
        });
    }
    
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () =&gt; {
            window.location.href = 'auth.html';
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', () =&gt; {
            window.location.href = 'auth.html?mode=signup';
        });
    }
}

// ============================================
// DROPDOWN TOGGLE FUNCTIONS
// ============================================

function toggleProfileDropdown() {
    const userProfileButton = document.getElementById('userProfileButton');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    if (!userProfileButton || !userDropdownMenu) return;
    
    const isExpanded = userProfileButton.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
        closeProfileDropdown();
    } else {
        openProfileDropdown();
    }
}

function openProfileDropdown() {
    const userProfileButton = document.getElementById('userProfileButton');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    if (!userProfileButton || !userDropdownMenu) return;
    
    userProfileButton.setAttribute('aria-expanded', 'true');
    userDropdownMenu.classList.add('active');
}

function closeProfileDropdown() {
    const userProfileButton = document.getElementById('userProfileButton');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    if (!userProfileButton || !userDropdownMenu) return;
    
    userProfileButton.setAttribute('aria-expanded', 'false');
    userDropdownMenu.classList.remove('active');
}

// ============================================
// LOGOUT HANDLER
// ============================================

async function handleLogout() {
    console.log('🔐 Logout initiated...');
    
    closeProfileDropdown();
    
    try {
        await firebaseAuth.signOut();
        console.log('✅ Logout successful');
        
        showNotification('success', 'Logged out successfully', 'You have been logged out.');
        
        setTimeout(() =&gt; {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        showNotification('error', 'Logout failed', 'An error occurred while logging out.');
    }
}

// ============================================
// SETTINGS HANDLER
// ============================================

function handleSettings() {
    console.log('⚙ Settings clicked');
    closeProfileDropdown();
    
    const profilePageExists = true;
    
    if (profilePageExists) {
        window.location.href = 'settings.html';
    } else {
        showNotification('info', 'Settings', 'Settings page coming soon!');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateAvatarURL(name) {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&amp;background=3B82F6&amp;color=fff&amp;bold=true&amp;size=128`;
}

function formatPlanName(plan) {
    const planNames = {
        'free': 'Free',
        'basic': 'Basic',
        'pro': 'Pro',
        'platinum': 'Platinum',
        'trial': 'Trial'
    };
    
    return planNames[plan.toLowerCase()] || 'Basic';
}

function showNotification(type, title, message) {
    const notification = document.createElement('div');
    notification.className = `toast-notification ${type}`;
    
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
    
    notification.innerHTML = `
        
            <i></i>
            
                <strong>${title}</strong>: ${message}
            
        
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() =&gt; {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() =&gt; {
        notification.classList.remove('show');
        setTimeout(() =&gt; {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// ============================================
// PUBLIC API
// ============================================

window.authSystem = {
    getCurrentUser: () =&gt; currentUser,
    getUserProfile: () =&gt; userProfileData,
    logout: handleLogout,
    isAuthenticated: () =&gt; currentUser !== null,
    refreshProfile: async () =&gt; {
        if (currentUser) {
            await loadUserProfileData(currentUser.uid);
            updateUserProfileDisplay();
            console.log('✅ Profile refreshed');
        }
    }
};

console.log('✅ Auth system v2.0 script loaded');
console.log('🆕 New users will be assigned plan: basic (status: active)');
console.log('📧 Welcome emails enabled (via Cloudflare Worker)');