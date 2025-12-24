// /* ============================================
//    PROFILE.JS - Gestion de la page profil v2.0
//    ============================================ */

// // Variables globales
// let currentUserData = null;
// let isEditingPersonalInfo = false;

// // ============================================
// // INITIALISATION
// // ============================================

// document.addEventListener('DOMContentLoaded', () => {
//     console.log('🚀 Initialisation de la page profil...');
    
//     // Vérifier si Firebase est initialisé
//     if (typeof firebase === 'undefined') {
//         console.error('❌ Firebase non initialisé !');
//         showToast('error', 'Erreur', 'Impossible de charger Firebase');
//         return;
//     }
    
//     // Initialiser les gestionnaires d'événements
//     initializeEventListeners();
    
//     console.log('✅ Page profil initialisée');
// });

// // ============================================
// // ÉCOUTE DE L'ÉVÉNEMENT userDataLoaded
// // ============================================

// /**
//  * Écouter l'événement déclenché par firebase-config.js
//  * Cet événement contient toutes les données utilisateur
//  */
// window.addEventListener('userDataLoaded', (e) => {
//     currentUserData = e.detail;
//     console.log('✅ Données utilisateur reçues depuis firebase-config.js:', currentUserData);
    
//     // Charger les données dans l'interface
//     loadUserData(currentUserData);
// });

// // ============================================
// // CHARGEMENT DES DONNÉES UTILISATEUR
// // ============================================

// /**
//  * Charger les données utilisateur dans les champs
//  */
// function loadUserData(userData) {
//     console.log('📝 Chargement des données dans les champs...');
    
//     try {
//         // Informations personnelles
//         const firstNameInput = document.getElementById('firstName');
//         const lastNameInput = document.getElementById('lastName');
//         const companyInput = document.getElementById('company');
//         const phoneInput = document.getElementById('phone');
        
//         if (firstNameInput) firstNameInput.value = userData.firstName || '';
//         if (lastNameInput) lastNameInput.value = userData.lastName || '';
//         if (companyInput) companyInput.value = userData.company || '';
//         if (phoneInput) phoneInput.value = userData.phone || '';
        
//         // Badge de vérification email
//         const verifiedBadge = document.getElementById('verifiedBadge');
//         if (verifiedBadge && userData.emailVerified) {
//             verifiedBadge.style.display = 'inline-flex';
//         }
        
//         // Statistiques
//         if (userData.createdAt) {
//             const memberSinceEl = document.getElementById('memberSince');
//             if (memberSinceEl) {
//                 const createdDate = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
//                 memberSinceEl.textContent = formatDate(createdDate);
//             }
//         }
        
//         if (userData.lastLoginAt) {
//             const lastLoginEl = document.getElementById('lastLogin');
//             if (lastLoginEl) {
//                 const lastLoginDate = userData.lastLoginAt.toDate ? userData.lastLoginAt.toDate() : new Date(userData.lastLoginAt);
//                 lastLoginEl.textContent = formatRelativeTime(lastLoginDate);
//             }
//         }
        
//         // Compter les analyses et portfolios
//         if (userData.uid) {
//             loadUserStats(userData.uid);
//         }
        
//         console.log('✅ Données chargées dans les champs');
        
//     } catch (error) {
//         console.error('❌ Erreur lors du chargement des données:', error);
//     }
// }

// /**
//  * Charger les statistiques utilisateur
//  */
// async function loadUserStats(userId) {
//     try {
//         // Compter les analyses
//         const analysesSnapshot = await firebase.firestore()
//             .collection('users')
//             .doc(userId)
//             .collection('analyses')
//             .get();
        
//         const analysesCountEl = document.getElementById('analysesCount');
//         if (analysesCountEl) {
//             analysesCountEl.textContent = analysesSnapshot.size;
//         }
        
//         // Compter les portfolios
//         const portfoliosSnapshot = await firebase.firestore()
//             .collection('users')
//             .doc(userId)
//             .collection('portfolios')
//             .get();
        
//         const portfoliosCountEl = document.getElementById('portfoliosCount');
//         if (portfoliosCountEl) {
//             portfoliosCountEl.textContent = portfoliosSnapshot.size;
//         }
        
//     } catch (error) {
//         console.error('❌ Erreur lors du chargement des stats:', error);
        
//         const analysesCountEl = document.getElementById('analysesCount');
//         const portfoliosCountEl = document.getElementById('portfoliosCount');
        
//         if (analysesCountEl) analysesCountEl.textContent = '—';
//         if (portfoliosCountEl) portfoliosCountEl.textContent = '—';
//     }
// }

// // ============================================
// // GESTIONNAIRES D'ÉVÉNEMENTS
// // ============================================

// function initializeEventListeners() {
//     // === ÉDITION DES INFORMATIONS PERSONNELLES ===
//     const editPersonalInfoBtn = document.getElementById('editPersonalInfo');
//     const cancelPersonalInfoBtn = document.getElementById('cancelPersonalInfo');
//     const personalInfoForm = document.getElementById('personalInfoForm');
    
//     if (editPersonalInfoBtn) {
//         editPersonalInfoBtn.addEventListener('click', () => {
//             toggleEditPersonalInfo(true);
//         });
//     }
    
//     if (cancelPersonalInfoBtn) {
//         cancelPersonalInfoBtn.addEventListener('click', () => {
//             toggleEditPersonalInfo(false);
//             loadUserData(currentUserData); // Recharger les données originales
//         });
//     }
    
//     if (personalInfoForm) {
//         personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
//     }
    
//     // === CHANGEMENT D'AVATAR ===
//     const avatarOverlay = document.getElementById('avatarOverlay');
//     const avatarInput = document.getElementById('avatarInput');
    
//     if (avatarOverlay) {
//         avatarOverlay.addEventListener('click', () => {
//             avatarInput.click();
//         });
//     }
    
//     if (avatarInput) {
//         avatarInput.addEventListener('change', handleAvatarChange);
//     }
    
//     // === CHANGEMENT DE MOT DE PASSE ===
//     const changePasswordBtn = document.getElementById('changePasswordBtn');
//     const closePasswordModal = document.getElementById('closePasswordModal');
//     const cancelPasswordChange = document.getElementById('cancelPasswordChange');
//     const changePasswordForm = document.getElementById('changePasswordForm');
    
//     if (changePasswordBtn) {
//         changePasswordBtn.addEventListener('click', () => {
//             openModal('changePasswordModal');
//         });
//     }
    
//     if (closePasswordModal) {
//         closePasswordModal.addEventListener('click', () => {
//             closeModal('changePasswordModal');
//         });
//     }
    
//     if (cancelPasswordChange) {
//         cancelPasswordChange.addEventListener('click', () => {
//             closeModal('changePasswordModal');
//         });
//     }
    
//     if (changePasswordForm) {
//         changePasswordForm.addEventListener('submit', handlePasswordChange);
//     }
    
//     // === SUPPRESSION DE COMPTE ===
//     const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    
//     if (deleteAccountBtn) {
//         deleteAccountBtn.addEventListener('click', handleDeleteAccount);
//     }
// }

// // ============================================
// // ÉDITION DES INFORMATIONS PERSONNELLES
// // ============================================

// /**
//  * Activer/désactiver le mode édition
//  */
// function toggleEditPersonalInfo(enable) {
//     isEditingPersonalInfo = enable;
    
//     const inputs = ['firstName', 'lastName', 'company', 'phone'];
//     const editBtn = document.getElementById('editPersonalInfo');
//     const actionsDiv = document.getElementById('personalInfoActions');
    
//     inputs.forEach(inputId => {
//         const input = document.getElementById(inputId);
//         if (input) {
//             input.disabled = !enable;
//         }
//     });
    
//     if (editBtn) {
//         editBtn.style.display = enable ? 'none' : 'inline-flex';
//     }
    
//     if (actionsDiv) {
//         actionsDiv.style.display = enable ? 'flex' : 'none';
//     }
// }

// /**
//  * Sauvegarder les informations personnelles
//  */
// async function handlePersonalInfoSubmit(e) {
//     e.preventDefault();
    
//     if (!currentUserData) {
//         showToast('error', 'Erreur', 'Aucune donnée utilisateur disponible');
//         return;
//     }
    
//     // Récupérer les valeurs
//     const firstName = document.getElementById('firstName').value.trim();
//     const lastName = document.getElementById('lastName').value.trim();
//     const company = document.getElementById('company').value.trim();
//     const phone = document.getElementById('phone').value.trim();
    
//     // Validation
//     if (!firstName || !lastName) {
//         showToast('error', 'Erreur', 'Le prénom et le nom sont obligatoires');
//         return;
//     }
    
//     try {
//         // Mettre à jour dans Firestore
//         await firebase.firestore().collection('users').doc(currentUserData.uid).update({
//             firstName: firstName,
//             lastName: lastName,
//             company: company,
//             phone: phone,
//             updatedAt: firebase.firestore.FieldValue.serverTimestamp()
//         });
        
//         // Mettre à jour le displayName dans Auth
//         const user = firebase.auth().currentUser;
//         if (user) {
//             await user.updateProfile({
//                 displayName: `${firstName} ${lastName}`
//             });
//         }
        
//         // Mettre à jour les données locales
//         currentUserData.firstName = firstName;
//         currentUserData.lastName = lastName;
//         currentUserData.company = company;
//         currentUserData.phone = phone;
        
//         // Mettre à jour tous les éléments [data-user-name]
//         document.querySelectorAll('[data-user-name]').forEach(el => {
//             el.textContent = `${firstName} ${lastName}`;
//         });
        
//         // Désactiver le mode édition
//         toggleEditPersonalInfo(false);
        
//         showToast('success', 'Succès !', 'Vos informations ont été mises à jour');
        
//         console.log('✅ Informations personnelles mises à jour');
        
//     } catch (error) {
//         console.error('❌ Erreur lors de la mise à jour:', error);
//         showToast('error', 'Erreur', 'Impossible de mettre à jour vos informations');
//     }
// }

// // ============================================
// // CHANGEMENT D'AVATAR
// // ============================================

// /**
//  * Gérer le changement d'avatar
//  */
// async function handleAvatarChange(e) {
//     const file = e.target.files[0];
    
//     if (!file) return;
    
//     // Vérifier le type de fichier
//     if (!file.type.startsWith('image/')) {
//         showToast('error', 'Erreur', 'Veuillez sélectionner une image');
//         return;
//     }
    
//     // Vérifier la taille (max 5 Mo)
//     if (file.size > 5 * 1024 * 1024) {
//         showToast('error', 'Erreur', 'L\'image ne doit pas dépasser 5 Mo');
//         return;
//     }
    
//     try {
//         showToast('info', 'Upload en cours...', 'Téléchargement de votre photo');
        
//         // Créer une référence Firebase Storage
//         const storage = firebase.storage();
//         const storageRef = storage.ref();
//         const avatarRef = storageRef.child(`users/${currentUserData.uid}/profile/${file.name}`);
        
//         // Upload du fichier
//         const uploadTask = await avatarRef.put(file);
        
//         // Récupérer l'URL de téléchargement
//         const downloadURL = await uploadTask.ref.getDownloadURL();
        
//         // Mettre à jour Firestore
//         await firebase.firestore().collection('users').doc(currentUserData.uid).update({
//             photoURL: downloadURL,
//             updatedAt: firebase.firestore.FieldValue.serverTimestamp()
//         });
        
//         // Mettre à jour Auth
//         const user = firebase.auth().currentUser;
//         if (user) {
//             await user.updateProfile({
//                 photoURL: downloadURL
//             });
//         }
        
//         // Mettre à jour toutes les images [data-user-photo]
//         document.querySelectorAll('[data-user-photo]').forEach(img => {
//             img.src = downloadURL;
//         });
        
//         showToast('success', 'Succès !', 'Votre photo de profil a été mise à jour');
        
//         console.log('✅ Avatar mis à jour:', downloadURL);
        
//     } catch (error) {
//         console.error('❌ Erreur lors de l\'upload:', error);
//         showToast('error', 'Erreur', 'Impossible de télécharger la photo');
//     }
// }

// // ============================================
// // CHANGEMENT DE MOT DE PASSE
// // ============================================

// /**
//  * Changer le mot de passe
//  */
// async function handlePasswordChange(e) {
//     e.preventDefault();
    
//     const newPassword = document.getElementById('newPassword').value;
//     const confirmPassword = document.getElementById('confirmPassword').value;
    
//     // Validation
//     if (newPassword.length < 6) {
//         showToast('error', 'Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
//         return;
//     }
    
//     if (newPassword !== confirmPassword) {
//         showToast('error', 'Erreur', 'Les mots de passe ne correspondent pas');
//         return;
//     }
    
//     try {
//         const user = firebase.auth().currentUser;
        
//         if (!user) {
//             showToast('error', 'Erreur', 'Utilisateur non connecté');
//             return;
//         }
        
//         // Mettre à jour le mot de passe
//         await user.updatePassword(newPassword);
        
//         // Fermer le modal
//         closeModal('changePasswordModal');
        
//         // Réinitialiser le formulaire
//         document.getElementById('changePasswordForm').reset();
        
//         showToast('success', 'Succès !', 'Votre mot de passe a été modifié');
        
//         console.log('✅ Mot de passe modifié');
        
//     } catch (error) {
//         console.error('❌ Erreur lors du changement de mot de passe:', error);
        
//         // Si l'erreur nécessite une ré-authentification
//         if (error.code === 'auth/requires-recent-login') {
//             showToast('error', 'Ré-authentification requise', 'Veuillez vous reconnecter pour modifier votre mot de passe');
            
//             // Déconnecter l'utilisateur
//             setTimeout(() => {
//                 logout();
//             }, 2000);
//         } else {
//             const errorMessage = getFirebaseErrorMessage(error.code);
//             showToast('error', 'Erreur', errorMessage);
//         }
//     }
// }

// // ============================================
// // SUPPRESSION DE COMPTE
// // ============================================

// /**
//  * Supprimer le compte utilisateur
//  */
// async function handleDeleteAccount() {
//     // Confirmation
//     const confirmed = confirm(
//         '⚠️ CAREFUL ⚠️\n\n' +
//         'Are you sure you want to delete your account ?\n\n' +
//         'This action is irreversible and will generate :\n' +
//         '• Deletion of all your data\n' +
//         '• Deletion of all your portfolios\n' +
//         '• Deletion of all your analyses\n' +
//         '• Definitive loss of your history\n\n' +
//         'Press OK to validate the deletion.'
//     );
    
//     if (!confirmed) return;
    
//     // Double confirmation
//     const doubleConfirmed = confirm(
//         '🔴 LAST CONFIRMATION 🔴\n\n' +
//         'Do you REALLY want to delete your account ?\n\n'
//     );
    
//     if (!doubleConfirmed) return;
    
//     try {
//         const user = firebase.auth().currentUser;
        
//         if (!user) {
//             showToast('error', 'Error', 'User not connected');
//             return;
//         }
        
//         showToast('info', 'Deletion on going...', 'Please wait');
        
//         // Supprimer les données Firestore
//         await firebase.firestore().collection('users').doc(user.uid).delete();
        
//         // Supprimer le compte Auth
//         await user.delete();
        
//         showToast('success', 'Account deleted', 'Your account has definitely been deleted');
        
//         console.log('✅ Account deleted');
        
//         // Rediriger vers la page d'accueil
//         setTimeout(() => {
//             window.location.href = 'index.html';
//         }, 2000);
        
//     } catch (error) {
//         console.error('❌ Erreur lors de la suppression:', error);
        
//         // Si l'erreur nécessite une ré-authentification
//         if (error.code === 'auth/requires-recent-login') {
//             showToast('error', 'Ré-authentification requise', 'Veuillez vous reconnecter pour supprimer votre compte');
            
//             setTimeout(() => {
//                 logout();
//             }, 2000);
//         } else {
//             const errorMessage = getFirebaseErrorMessage(error.code);
//             showToast('error', 'Erreur', errorMessage);
//         }
//     }
// }

// // ============================================
// // UTILITAIRES
// // ============================================

// /**
//  * Ouvrir un modal
//  */
// function openModal(modalId) {
//     const modal = document.getElementById(modalId);
//     if (modal) {
//         modal.classList.add('active');
//     }
// }

// /**
//  * Fermer un modal
//  */
// function closeModal(modalId) {
//     const modal = document.getElementById(modalId);
//     if (modal) {
//         modal.classList.remove('active');
//     }
// }

// /**
//  * Formater une date
//  */
// function formatDate(date) {
//     const options = { year: 'numeric', month: 'long', day: 'numeric' };
//     return date.toLocaleDateString('fr-FR', options);
// }

// /**
//  * Formater un temps relatif
//  */
// function formatRelativeTime(date) {
//     const now = new Date();
//     const diff = now - date;
    
//     const seconds = Math.floor(diff / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const hours = Math.floor(minutes / 60);
//     const days = Math.floor(hours / 24);
    
//     if (seconds < 60) {
//         return 'Il y a quelques secondes';
//     } else if (minutes < 60) {
//         return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
//     } else if (hours < 24) {
//         return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
//     } else if (days < 7) {
//         return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
//     } else {
//         return formatDate(date);
//     }
// }

// /**
//  * Afficher une notification toast
//  */
// function showToast(type, title, message) {
//     const toastContainer = document.getElementById('toastContainer');
    
//     if (!toastContainer) return;
    
//     const toast = document.createElement('div');
//     toast.className = `toast ${type}`;
    
//     let iconClass = 'fa-info-circle';
//     switch(type) {
//         case 'success':
//             iconClass = 'fa-check-circle';
//             break;
//         case 'error':
//             iconClass = 'fa-times-circle';
//             break;
//         case 'warning':
//             iconClass = 'fa-exclamation-triangle';
//             break;
//     }
    
//     toast.innerHTML = `
//         <div class="toast-icon">
//             <i class="fas ${iconClass}"></i>
//         </div>
//         <div class="toast-content">
//             <div class="toast-title">${title}</div>
//             <div class="toast-message">${message}</div>
//         </div>
//         <button class="toast-close">
//             <i class="fas fa-times"></i>
//         </button>
//     `;
    
//     toastContainer.appendChild(toast);
    
//     const closeBtn = toast.querySelector('.toast-close');
//     closeBtn.addEventListener('click', () => {
//         removeToast(toast);
//     });
    
//     setTimeout(() => {
//         removeToast(toast);
//     }, 5000);
// }

// /**
//  * Supprimer un toast
//  */
// function removeToast(toast) {
//     toast.style.animation = 'slideOutRight 0.3s ease forwards';
//     setTimeout(() => {
//         if (toast.parentNode) {
//             toast.parentNode.removeChild(toast);
//         }
//     }, 300);
// }

// /**
//  * Traduire les codes d'erreur Firebase
//  */
// function getFirebaseErrorMessage(errorCode) {
//     if (typeof window.getFirebaseErrorMessage === 'function') {
//         return window.getFirebaseErrorMessage(errorCode);
//     }
    
//     return `Erreur: ${errorCode}`;
// }

// /**
//  * Déconnexion
//  */
// async function logout() {
//     try {
//         console.log('🚪 Déconnexion...');
        
//         await firebase.auth().signOut();
        
//         console.log('✅ Déconnexion réussie');
        
//         // Rediriger vers la page de connexion
//         window.location.href = 'login.html';
        
//     } catch (error) {
//         console.error('❌ Erreur lors de la déconnexion:', error);
//         alert('Erreur lors de la déconnexion');
//     }
// }

// // Animation de sortie pour les toasts
// const style = document.createElement('style');
// style.textContent = `
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
// `;
// document.head.appendChild(style);

// console.log('✅ Script de profil chargé (v2.0)');

/* ============================================
   PROFILE.JS - Gestion de la page profil v3.0
   ✅ Avec gestion Bio + Following
   ============================================ */

// Variables globales
let currentUserData = null;
let isEditingPersonalInfo = false;

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation de la page profil...');
    
    // Vérifier si Firebase est initialisé
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase non initialisé !');
        showToast('error', 'Erreur', 'Impossible de charger Firebase');
        return;
    }
    
    // Initialiser les gestionnaires d'événements
    initializeEventListeners();
    
    console.log('✅ Page profil initialisée');
});

// ============================================
// ÉCOUTE DE L'ÉVÉNEMENT userDataLoaded
// ============================================

window.addEventListener('userDataLoaded', (e) => {
    currentUserData = e.detail;
    console.log('✅ Données utilisateur reçues depuis firebase-config.js:', currentUserData);
    
    // Charger les données dans l'interface
    loadUserData(currentUserData);
    
    // ✅ Charger la liste des abonnements
    loadFollowingList();
});

// ============================================
// CHARGEMENT DES DONNÉES UTILISATEUR
// ============================================

function loadUserData(userData) {
    console.log('📝 Chargement des données dans les champs...');
    
    try {
        // Informations personnelles
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const bioInput = document.getElementById('bio');
        const companyInput = document.getElementById('company');
        const phoneInput = document.getElementById('phone');
        
        if (firstNameInput) firstNameInput.value = userData.firstName || '';
        if (lastNameInput) lastNameInput.value = userData.lastName || '';
        if (bioInput) {
            bioInput.value = userData.bio || '';
            updateBioCharCount();
        }
        if (companyInput) companyInput.value = userData.company || '';
        if (phoneInput) phoneInput.value = userData.phone || '';
        
        // Badge de vérification email
        const verifiedBadge = document.getElementById('verifiedBadge');
        if (verifiedBadge && userData.emailVerified) {
            verifiedBadge.style.display = 'inline-flex';
        }
        
        // Statistiques
        if (userData.createdAt) {
            const memberSinceEl = document.getElementById('memberSince');
            if (memberSinceEl) {
                const createdDate = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
                memberSinceEl.textContent = formatDate(createdDate);
            }
        }
        
        if (userData.lastLoginAt) {
            const lastLoginEl = document.getElementById('lastLogin');
            if (lastLoginEl) {
                const lastLoginDate = userData.lastLoginAt.toDate ? userData.lastLoginAt.toDate() : new Date(userData.lastLoginAt);
                lastLoginEl.textContent = formatRelativeTime(lastLoginDate);
            }
        }
        
        // Compter les analyses et portfolios
        if (userData.uid) {
            loadUserStats(userData.uid);
        }
        
        console.log('✅ Données chargées dans les champs');
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
    }
}

async function loadUserStats(userId) {
    try {
        // Compter les analyses
        const analysesSnapshot = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('analyses')
            .get();
        
        const analysesCountEl = document.getElementById('analysesCount');
        if (analysesCountEl) {
            analysesCountEl.textContent = analysesSnapshot.size;
        }
        
        // Compter les portfolios
        const portfoliosSnapshot = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('portfolios')
            .get();
        
        const portfoliosCountEl = document.getElementById('portfoliosCount');
        if (portfoliosCountEl) {
            portfoliosCountEl.textContent = portfoliosSnapshot.size;
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des stats:', error);
        
        const analysesCountEl = document.getElementById('analysesCount');
        const portfoliosCountEl = document.getElementById('portfoliosCount');
        
        if (analysesCountEl) analysesCountEl.textContent = '—';
        if (portfoliosCountEl) portfoliosCountEl.textContent = '—';
    }
}

// ============================================
// ✅ GESTION DE LA LISTE DES ABONNEMENTS
// ============================================

async function loadFollowingList() {
    const followingList = document.getElementById('followingList');
    const followingCountEl = document.getElementById('followingCount');
    
    if (!currentUserData || !currentUserData.uid) return;
    
    try {
        const followingSnapshot = await firebase.firestore()
            .collection('users')
            .doc(currentUserData.uid)
            .collection('following')
            .orderBy('followedAt', 'desc')
            .get();
        
        if (followingCountEl) {
            followingCountEl.textContent = followingSnapshot.size;
        }
        
        if (followingSnapshot.empty) {
            followingList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-user-friends" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem; font-weight: 700;">You're not following anyone yet</p>
                    <p style="font-size: 0.9rem; margin-top: 8px;">Discover interesting profiles in the Community!</p>
                    <a href="community-hub.html" class="btn-save" style="margin-top: 20px; display: inline-flex; text-decoration: none;">
                        <i class="fas fa-users"></i>
                        Explore Community
                    </a>
                </div>
            `;
            return;
        }
        
        // Charger les données de chaque utilisateur suivi
        const followingUsers = await Promise.all(
            followingSnapshot.docs.map(async (doc) => {
                const followedUserId = doc.id;
                const followedAt = doc.data().followedAt;
                
                const userDoc = await firebase.firestore()
                    .collection('users')
                    .doc(followedUserId)
                    .get();
                
                if (!userDoc.exists) return null;
                
                return {
                    uid: followedUserId,
                    ...userDoc.data(),
                    followedAt: followedAt
                };
            })
        );
        
        // Filtrer les utilisateurs null (supprimés)
        const validUsers = followingUsers.filter(user => user !== null);
        
        // Afficher la liste
        const followingHTML = validUsers.map(user => {
            const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Unknown User';
            const avatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128`;
            const bio = user.bio || 'No biography';
            
            return `
                <div class="following-item" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 12px; transition: all 0.3s ease;">
                    <img 
                        src="${avatar}" 
                        alt="${escapeHtml(displayName)}" 
                        style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(59, 130, 246, 0.3); cursor: pointer;"
                        onclick="window.location.href='public-profile.html?uid=${user.uid}'"
                        onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128'"
                    >
                    <div style="flex: 1; min-width: 0; cursor: pointer;" onclick="window.location.href='public-profile.html?uid=${user.uid}'">
                        <h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 4px; color: var(--text-primary);">
                            ${escapeHtml(displayName)}
                        </h4>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${escapeHtml(bio)}
                        </p>
                        <div style="display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-secondary);">
                            <span><i class="fas fa-file-alt"></i> ${user.postCount || 0} posts</span>
                            <span><i class="fas fa-users"></i> ${user.followersCount || 0} followers</span>
                        </div>
                    </div>
                    <button 
                        class="btn-danger" 
                        onclick="unfollowUser('${user.uid}')"
                        style="padding: 10px 20px; white-space: nowrap;"
                    >
                        <i class="fas fa-user-minus"></i>
                        Unfollow
                    </button>
                </div>
            `;
        }).join('');
        
        followingList.innerHTML = followingHTML;
        
        console.log(`✅ ${validUsers.length} abonnements chargés`);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des abonnements:', error);
        followingList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #EF4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 12px;"></i>
                <p>Failed to load following list</p>
            </div>
        `;
    }
}

async function unfollowUser(userId) {
    if (!confirm('Are you sure you want to unfollow this user?')) return;
    
    try {
        if (!currentUserData || !currentUserData.uid) {
            throw new Error('User not authenticated');
        }
        
        const db = firebase.firestore();
        const batch = db.batch();
        
        // Supprimer de la collection following
        const followingRef = db.collection('users').doc(currentUserData.uid).collection('following').doc(userId);
        batch.delete(followingRef);
        
        // Supprimer de la collection followers de l'autre utilisateur
        const followerRef = db.collection('users').doc(userId).collection('followers').doc(currentUserData.uid);
        batch.delete(followerRef);
        
        // Décrémenter followingCount
        const currentUserRef = db.collection('users').doc(currentUserData.uid);
        batch.update(currentUserRef, {
            followingCount: firebase.firestore.FieldValue.increment(-1)
        });
        
        // Décrémenter followersCount
        const followedUserRef = db.collection('users').doc(userId);
        batch.update(followedUserRef, {
            followersCount: firebase.firestore.FieldValue.increment(-1)
        });
        
        await batch.commit();
        
        showToast('success', 'Success', 'User unfollowed successfully');
        
        // Recharger la liste
        loadFollowingList();
        
        console.log('✅ Utilisateur désuivi');
        
    } catch (error) {
        console.error('❌ Erreur lors du désabonnement:', error);
        showToast('error', 'Error', 'Failed to unfollow user');
    }
}

// ============================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================

function initializeEventListeners() {
    // === ÉDITION DES INFORMATIONS PERSONNELLES ===
    const editPersonalInfoBtn = document.getElementById('editPersonalInfo');
    const cancelPersonalInfoBtn = document.getElementById('cancelPersonalInfo');
    const personalInfoForm = document.getElementById('personalInfoForm');
    
    if (editPersonalInfoBtn) {
        editPersonalInfoBtn.addEventListener('click', () => {
            toggleEditPersonalInfo(true);
        });
    }
    
    if (cancelPersonalInfoBtn) {
        cancelPersonalInfoBtn.addEventListener('click', () => {
            toggleEditPersonalInfo(false);
            loadUserData(currentUserData);
        });
    }
    
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
    }
    
    // ✅ Compteur de caractères pour la bio
    const bioInput = document.getElementById('bio');
    if (bioInput) {
        bioInput.addEventListener('input', updateBioCharCount);
    }
    
    // === CHANGEMENT D'AVATAR ===
    const avatarOverlay = document.getElementById('avatarOverlay');
    const avatarInput = document.getElementById('avatarInput');
    
    if (avatarOverlay) {
        avatarOverlay.addEventListener('click', () => {
            avatarInput.click();
        });
    }
    
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarChange);
    }
    
    // === CHANGEMENT DE MOT DE PASSE ===
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelPasswordChange = document.getElementById('cancelPasswordChange');
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            openModal('changePasswordModal');
        });
    }
    
    if (closePasswordModal) {
        closePasswordModal.addEventListener('click', () => {
            closeModal('changePasswordModal');
        });
    }
    
    if (cancelPasswordChange) {
        cancelPasswordChange.addEventListener('click', () => {
            closeModal('changePasswordModal');
        });
    }
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // === SUPPRESSION DE COMPTE ===
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }
}

// ✅ Mettre à jour le compteur de caractères de la bio
function updateBioCharCount() {
    const bioInput = document.getElementById('bio');
    const bioCharCount = document.getElementById('bioCharCount');
    
    if (bioInput && bioCharCount) {
        bioCharCount.textContent = bioInput.value.length;
    }
}

// ============================================
// ÉDITION DES INFORMATIONS PERSONNELLES
// ============================================

function toggleEditPersonalInfo(enable) {
    isEditingPersonalInfo = enable;
    
    const inputs = ['firstName', 'lastName', 'bio', 'company', 'phone'];
    const editBtn = document.getElementById('editPersonalInfo');
    const actionsDiv = document.getElementById('personalInfoActions');
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.disabled = !enable;
        }
    });
    
    if (editBtn) {
        editBtn.style.display = enable ? 'none' : 'inline-flex';
    }
    
    if (actionsDiv) {
        actionsDiv.style.display = enable ? 'flex' : 'none';
    }
}

async function handlePersonalInfoSubmit(e) {
    e.preventDefault();
    
    if (!currentUserData) {
        showToast('error', 'Erreur', 'Aucune donnée utilisateur disponible');
        return;
    }
    
    // Récupérer les valeurs
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const bio = document.getElementById('bio').value.trim();
    const company = document.getElementById('company').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // Validation
    if (!firstName || !lastName) {
        showToast('error', 'Erreur', 'Le prénom et le nom sont obligatoires');
        return;
    }
    
    try {
        // ✅ Mettre à jour dans Firestore (avec bio)
        await firebase.firestore().collection('users').doc(currentUserData.uid).update({
            firstName: firstName,
            lastName: lastName,
            bio: bio,
            company: company,
            phone: phone,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Mettre à jour le displayName dans Auth
        const user = firebase.auth().currentUser;
        if (user) {
            await user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });
        }
        
        // Mettre à jour les données locales
        currentUserData.firstName = firstName;
        currentUserData.lastName = lastName;
        currentUserData.bio = bio;
        currentUserData.company = company;
        currentUserData.phone = phone;
        
        // Mettre à jour tous les éléments [data-user-name]
        document.querySelectorAll('[data-user-name]').forEach(el => {
            el.textContent = `${firstName} ${lastName}`;
        });
        
        // Désactiver le mode édition
        toggleEditPersonalInfo(false);
        
        showToast('success', 'Succès !', 'Vos informations ont été mises à jour');
        
        console.log('✅ Informations personnelles mises à jour');
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        showToast('error', 'Erreur', 'Impossible de mettre à jour vos informations');
    }
}

// ============================================
// CHANGEMENT D'AVATAR
// ============================================

async function handleAvatarChange(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('error', 'Erreur', 'Veuillez sélectionner une image');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Erreur', "L'image ne doit pas dépasser 5 Mo");
        return;
    }
    
    try {
        showToast('info', 'Upload en cours...', 'Téléchargement de votre photo');
        
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const avatarRef = storageRef.child(`users/${currentUserData.uid}/profile/${file.name}`);
        
        const uploadTask = await avatarRef.put(file);
        const downloadURL = await uploadTask.ref.getDownloadURL();
        
        // ✅ Mettre à jour Firestore
        await firebase.firestore().collection('users').doc(currentUserData.uid).update({
            photoURL: downloadURL,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Mettre à jour Auth
        const user = firebase.auth().currentUser;
        if (user) {
            await user.updateProfile({
                photoURL: downloadURL
            });
        }
        
        // Mettre à jour toutes les images [data-user-photo]
        document.querySelectorAll('[data-user-photo]').forEach(img => {
            img.src = downloadURL;
        });
        
        showToast('success', 'Succès !', 'Votre photo de profil a été mise à jour');
        
        console.log('✅ Avatar mis à jour:', downloadURL);
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'upload:', error);
        showToast('error', 'Erreur', 'Impossible de télécharger la photo');
    }
}

// ============================================
// CHANGEMENT DE MOT DE PASSE
// ============================================

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword.length < 6) {
        showToast('error', 'Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('error', 'Erreur', 'Les mots de passe ne correspondent pas');
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        
        if (!user) {
            showToast('error', 'Erreur', 'Utilisateur non connecté');
            return;
        }
        
        await user.updatePassword(newPassword);
        closeModal('changePasswordModal');
        document.getElementById('changePasswordForm').reset();
        
        showToast('success', 'Succès !', 'Votre mot de passe a été modifié');
        
        console.log('✅ Mot de passe modifié');
        
    } catch (error) {
        console.error('❌ Erreur lors du changement de mot de passe:', error);
        
        if (error.code === 'auth/requires-recent-login') {
            showToast('error', 'Ré-authentification requise', 'Veuillez vous reconnecter pour modifier votre mot de passe');
            setTimeout(() => logout(), 2000);
        } else {
            const errorMessage = getFirebaseErrorMessage(error.code);
            showToast('error', 'Erreur', errorMessage);
        }
    }
}

// ============================================
// SUPPRESSION DE COMPTE
// ============================================

async function handleDeleteAccount() {
    const confirmed = confirm(
        '⚠ CAREFUL ⚠\n\n' +
        'Are you sure you want to delete your account ?\n\n' +
        'This action is irreversible and will generate :\n' +
        '• Deletion of all your data\n' +
        '• Deletion of all your portfolios\n' +
        '• Deletion of all your analyses\n' +
        '• Definitive loss of your history\n\n' +
        'Press OK to validate the deletion.'
    );
    
    if (!confirmed) return;
    
    const doubleConfirmed = confirm(
        '🔴 LAST CONFIRMATION 🔴\n\n' +
        'Do you REALLY want to delete your account ?\n\n'
    );
    
    if (!doubleConfirmed) return;
    
    try {
        const user = firebase.auth().currentUser;
        
        if (!user) {
            showToast('error', 'Error', 'User not connected');
            return;
        }
        
        showToast('info', 'Deletion on going...', 'Please wait');
        
        await firebase.firestore().collection('users').doc(user.uid).delete();
        await user.delete();
        
        showToast('success', 'Account deleted', 'Your account has definitely been deleted');
        
        console.log('✅ Account deleted');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        
        if (error.code === 'auth/requires-recent-login') {
            showToast('error', 'Ré-authentification requise', 'Veuillez vous reconnecter pour supprimer votre compte');
            setTimeout(() => logout(), 2000);
        } else {
            const errorMessage = getFirebaseErrorMessage(error.code);
            showToast('error', 'Erreur', errorMessage);
        }
    }
}

// ============================================
// UTILITAIRES
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) {
        return 'Il y a quelques secondes';
    } else if (minutes < 60) {
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (hours < 24) {
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (days < 7) {
        return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
        return formatDate(date);
    }
}

function showToast(type, title, message) {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
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
    
    toastContainer.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });
    
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

function getFirebaseErrorMessage(errorCode) {
    if (typeof window.getFirebaseErrorMessage === 'function') {
        return window.getFirebaseErrorMessage(errorCode);
    }
    
    return `Erreur: ${errorCode}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function logout() {
    try {
        console.log('🚪 Déconnexion...');
        
        await firebase.auth().signOut();
        
        console.log('✅ Déconnexion réussie');
        
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
        alert('Erreur lors de la déconnexion');
    }
}

// Animation de sortie pour les toasts
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

console.log('✅ Script de profil chargé (v3.0 - avec Bio + Following)');