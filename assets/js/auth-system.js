/* ═══════════════════════════════════════════════════════════════
   AUTH-SYSTEM.JS - FinancePro Navigation Authentication
   Gestion du menu profil utilisateur dans la navigation
   ═══════════════════════════════════════════════════════════════ */

// ============================================
// GLOBAL VARIABLES
// ============================================

let currentUser = null;
let userProfileData = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing navigation auth system...');
    
    // Vérifier si Firebase est initialisé
    if (!isFirebaseInitialized()) {
        console.warn('⚠️ Firebase not initialized - running in demo mode');
        // En mode démo sans Firebase, on peut simuler un utilisateur
        // ou laisser le système en mode "logged out"
    } else {
        // Écouter les changements d'état d'authentification
        initializeAuthStateListener();
    }
    
    // Initialiser les event listeners du menu
    initializeProfileMenuListeners();
    
    console.log('✅ Navigation auth system initialized');
});

// ============================================
// FIREBASE AUTH STATE LISTENER
// ============================================

/**
 * Écouter les changements d'état d'authentification Firebase
 */
function initializeAuthStateListener() {
    firebaseAuth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('✅ User authenticated:', user.email);
            currentUser = user;
            
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
            console.log('ℹ️ User not authenticated');
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
            console.log('✅ User profile loaded:', userProfileData);
        } else {
            console.warn('⚠️ User profile not found in Firestore');
            
            // Créer un profil basique si inexistant
            userProfileData = {
                firstName: currentUser.displayName?.split(' ')[0] || 'User',
                lastName: currentUser.displayName?.split(' ')[1] || '',
                email: currentUser.email,
                photoURL: currentUser.photoURL || null,
                plan: 'free'
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
            plan: 'free'
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
        console.warn('⚠️ Navigation elements not found');
        return;
    }
    
    if (isAuthenticated) {
        // Masquer les boutons Login/Signup
        navCtaLoggedOut.style.display = 'none';
        
        // Afficher le menu profil
        navCtaLoggedIn.style.display = 'flex';
        
        // Ajouter la classe au body pour le CSS
        document.body.classList.add('user-authenticated');
    } else {
        // Afficher les boutons Login/Signup
        navCtaLoggedOut.style.display = 'flex';
        
        // Masquer le menu profil
        navCtaLoggedIn.style.display = 'none';
        
        // Retirer la classe du body
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
    
    // Nom complet
    const fullName = `${userProfileData.firstName || ''} ${userProfileData.lastName || ''}`.trim() 
                     || currentUser.displayName 
                     || 'User';
    
    // Email
    const email = userProfileData.email || currentUser.email;
    
    // Photo de profil
    const photoURL = userProfileData.photoURL 
                     || currentUser.photoURL 
                     || generateAvatarURL(fullName);
    
    // Plan
    const plan = formatPlanName(userProfileData.plan || 'free');
    
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
    // Bouton du profil (toggle dropdown)
    const userProfileButton = document.getElementById('userProfileButton');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    if (userProfileButton && userDropdownMenu) {
        userProfileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleProfileDropdown();
        });
        
        // Fermer le dropdown en cliquant en dehors
        document.addEventListener('click', (e) => {
            if (!userProfileButton.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                closeProfileDropdown();
            }
        });
        
        // Fermer avec la touche Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && userDropdownMenu.classList.contains('active')) {
                closeProfileDropdown();
                userProfileButton.focus();
            }
        });
    }
    
    // Bouton Logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Bouton Settings
    const settingsLink = document.getElementById('settingsLink');
    if (settingsLink) {
        settingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleSettings();
        });
    }
    
    // Boutons Login/Signup dans la nav
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'auth.html';
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            window.location.href = 'auth.html?mode=signup';
        });
    }
}

// ============================================
// DROPDOWN TOGGLE FUNCTIONS
// ============================================

/**
 * Toggle du dropdown
 */
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

/**
 * Ouvrir le dropdown
 */
function openProfileDropdown() {
    const userProfileButton = document.getElementById('userProfileButton');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    if (!userProfileButton || !userDropdownMenu) return;
    
    userProfileButton.setAttribute('aria-expanded', 'true');
    userDropdownMenu.classList.add('active');
}

/**
 * Fermer le dropdown
 */
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

/**
 * Gérer la déconnexion
 */
async function handleLogout() {
    console.log('🔐 Logout initiated...');
    
    // Fermer le dropdown
    closeProfileDropdown();
    
    try {
        // Déconnexion Firebase
        if (isFirebaseInitialized()) {
            await firebaseAuth.signOut();
            console.log('✅ Logout successful');
        }
        
        // Message de confirmation
        showNotification('success', 'Logged out successfully', 'You have been logged out.');
        
        // Rediriger vers la page d'accueil après 1 seconde
        setTimeout(() => {
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

/**
 * Gérer l'accès aux paramètres
 */
function handleSettings() {
    console.log('⚙️ Settings clicked');
    closeProfileDropdown();
    
    // TODO: Rediriger vers la page de paramètres
    showNotification('info', 'Settings', 'Settings page coming soon!');
    
    // Décommenter quand la page sera prête :
    // window.location.href = 'settings.html';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Générer une URL d'avatar avec UI Avatars
 */
function generateAvatarURL(name) {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=3B82F6&color=fff&bold=true&size=128`;
}

/**
 * Formater le nom du plan
 */
function formatPlanName(plan) {
    const planNames = {
        'free': 'Free',
        'starter': 'Starter',
        'professional': 'Professional',
        'enterprise': 'Enterprise'
    };
    
    return planNames[plan.toLowerCase()] || 'Free';
}

/**
 * Vérifier si Firebase est initialisé
 */
function isFirebaseInitialized() {
    return typeof firebase !== 'undefined' 
        && typeof firebaseAuth !== 'undefined' 
        && typeof firebaseDb !== 'undefined';
}

/**
 * Afficher une notification toast
 */
function showNotification(type, title, message) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `toast-notification ${type}`;
    
    // Icône selon le type
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
        <div class="toast-notification-content">
            <i class="fas ${iconClass}"></i>
            <span><strong>${title}:</strong> ${message}</span>
        </div>
    `;
    
    // Ajouter au body
    document.body.appendChild(notification);
    
    // Afficher avec animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Retirer après 4 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// ============================================
// DEMO MODE (si Firebase non disponible)
// ============================================

/**
 * Mode démo pour tester sans Firebase
 * À utiliser uniquement en développement
 */
window.enableDemoMode = function() {
    console.log('🎭 Demo mode enabled');
    
    // Simuler un utilisateur
    currentUser = {
        uid: 'demo-user-123',
        email: 'demo@financepro.com',
        displayName: 'Demo User',
        photoURL: null
    };
    
    userProfileData = {
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@financepro.com',
        photoURL: null,
        plan: 'professional',
        company: 'FinancePro Inc.'
    };
    
    updateNavigationUI(true);
    updateUserProfileDisplay();
    
    console.log('✅ Demo mode activated - User logged in');
};

/**
 * Désactiver le mode démo
 */
window.disableDemoMode = function() {
    console.log('🎭 Demo mode disabled');
    
    currentUser = null;
    userProfileData = null;
    
    updateNavigationUI(false);
    
    console.log('✅ Demo mode deactivated - User logged out');
};

// ============================================
// PUBLIC API (accessible globalement)
// ============================================

window.authSystem = {
    getCurrentUser: () => currentUser,
    getUserProfile: () => userProfileData,
    logout: handleLogout,
    isAuthenticated: () => currentUser !== null,
    refreshProfile: () => {
        if (currentUser) {
            return loadUserProfileData(currentUser.uid).then(() => {
                updateUserProfileDisplay();
            });
        }
    }
};

console.log('✅ Auth system script loaded');