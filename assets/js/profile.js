/* ===================================
   PROFILE PAGE SCRIPT
   Gestion de la page de profil utilisateur
   Version 2024
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    initializeProfilePage();
});

/**
 * Initialise la page de profil
 */
function initializeProfilePage() {
    // Vérifier si l'utilisateur est connecté
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        // Rediriger vers la page de connexion
        window.location.href = 'auth.html';
        return;
    }

    // Charger les données utilisateur
    loadUserData();
    
    // Initialiser les tabs
    initializeTabs();
    
    // Initialiser le formulaire d'informations
    initializeInfoForm();
    
    // Initialiser le formulaire de mot de passe
    initializePasswordForm();
    
    // Initialiser l'upload d'avatar
    initializeAvatarUpload();
    
    // Initialiser les préférences
    initializePreferences();
    
    // Initialiser les toggles de mot de passe
    initializePasswordToggles();
    
    // Initialiser le bouton de déconnexion
    initializeLogout();
    
    // Initialiser le bouton de suppression de compte
    initializeDeleteAccount();
}

/**
 * Charge les données utilisateur dans la page
 */
function loadUserData() {
    const user = window.authManager.getCurrentUser();
    
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    // Avatar
    const profileAvatar = document.getElementById('profileAvatar');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    
    if (user.avatar) {
        profileAvatar.src = user.avatar;
        profileAvatar.classList.add('active');
        avatarPlaceholder.classList.add('hidden');
    } else {
        const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
        avatarPlaceholder.innerHTML = `<span>${initials}</span>`;
    }

    // Nom et email
    document.getElementById('profileName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profileEmail').textContent = user.email;

    // Date de création
    if (user.createdAt) {
        const createdDate = new Date(user.createdAt);
        const formattedDate = createdDate.toLocaleDateString('fr-FR', { 
            month: 'long', 
            year: 'numeric' 
        });
        document.getElementById('memberSince').innerHTML = `
            <i class="fas fa-calendar"></i>
            Membre depuis ${formattedDate}
        `;
    }

    // Dernière connexion
    document.getElementById('lastLogin').textContent = 'Aujourd\'hui';

    // Remplir le formulaire d'informations
    document.getElementById('editFirstName').value = user.firstName || '';
    document.getElementById('editLastName').value = user.lastName || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editCompany').value = user.company || '';
}

/**
 * Initialise les tabs
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Retirer la classe active de tous les boutons et contenus
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Ajouter la classe active au bouton et contenu sélectionnés
            button.classList.add('active');
            document.getElementById(`${targetTab}Tab`).classList.add('active');
        });
    });
}

/**
 * Initialise le formulaire d'informations
 */
function initializeInfoForm() {
    const form = document.getElementById('profileInfoForm');
    const editBtn = document.getElementById('editInfoBtn');
    const cancelBtn = document.getElementById('cancelInfoBtn');
    const actionsDiv = document.getElementById('infoActions');
    const inputs = form.querySelectorAll('input');
    const messageEl = document.getElementById('infoMessage');

    let isEditing = false;

    // Bouton éditer
    editBtn.addEventListener('click', () => {
        isEditing = true;
        inputs.forEach(input => input.disabled = false);
        actionsDiv.classList.remove('hidden');
        editBtn.style.display = 'none';
        clearMessage(messageEl);
    });

    // Bouton annuler
    cancelBtn.addEventListener('click', () => {
        isEditing = false;
        inputs.forEach(input => input.disabled = true);
        actionsDiv.classList.add('hidden');
        editBtn.style.display = 'inline-flex';
        loadUserData(); // Recharger les données originales
        clearMessage(messageEl);
    });

    // Soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isEditing) return;

        const formData = new FormData(form);
        const updates = {
            firstName: formData.get('firstName') || document.getElementById('editFirstName').value,
            lastName: formData.get('lastName') || document.getElementById('editLastName').value,
            phone: document.getElementById('editPhone').value,
            company: document.getElementById('editCompany').value,
        };

        // Désactiver le bouton submit
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const result = await window.authManager.updateProfile(updates);

            if (result.success) {
                showMessage(messageEl, result.message, 'success');
                
                // Réinitialiser l'interface
                setTimeout(() => {
                    isEditing = false;
                    inputs.forEach(input => input.disabled = true);
                    actionsDiv.classList.add('hidden');
                    editBtn.style.display = 'inline-flex';
                    submitBtn.disabled = false;
                    
                    // Recharger les données
                    loadUserData();
                    
                    // Mettre à jour la sidebar
                    if (window.UserProfileManager) {
                        window.UserProfileManager.updateUserDisplay();
                    }
                }, 2000);
            } else {
                showMessage(messageEl, result.message, 'error');
                submitBtn.disabled = false;
            }
        } catch (error) {
            showMessage(messageEl, 'Une erreur est survenue', 'error');
            submitBtn.disabled = false;
        }
    });
}

/**
 * Initialise le formulaire de changement de mot de passe
 */
function initializePasswordForm() {
    const form = document.getElementById('passwordForm');
    const messageEl = document.getElementById('passwordMessage');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;

        // Validation
        if (newPassword.length < 8) {
            showMessage(messageEl, 'Le nouveau mot de passe doit contenir au moins 8 caractères', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage(messageEl, 'Les mots de passe ne correspondent pas', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        // Simuler la vérification du mot de passe actuel
        // En production, ceci devrait être fait côté serveur
        showMessage(messageEl, 'Mot de passe mis à jour avec succès !', 'success');
        
        setTimeout(() => {
            form.reset();
            clearMessage(messageEl);
            submitBtn.disabled = false;
        }, 2000);
    });
}

/**
 * Initialise l'upload d'avatar
 */
function initializeAvatarUpload() {
    const avatarUploadBtn = document.getElementById('avatarUploadBtn');
    const avatarInput = document.getElementById('avatarInput');
    const profileAvatar = document.getElementById('profileAvatar');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');

    avatarUploadBtn.addEventListener('click', () => {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        
        if (!file) return;

        try {
            // Upload de l'avatar
            const avatarUrl = await window.authManager.uploadAvatar(file);

            // Mettre à jour le profil
            const result = await window.authManager.updateProfile({ avatar: avatarUrl });

            if (result.success) {
                // Afficher le nouvel avatar
                profileAvatar.src = avatarUrl;
                profileAvatar.classList.add('active');
                avatarPlaceholder.classList.add('hidden');

                // Mettre à jour la sidebar
                if (window.UserProfileManager) {
                    window.UserProfileManager.updateUserDisplay();
                }

                showNotification('Avatar mis à jour avec succès !', 'success');
            } else {
                showNotification('Erreur lors de la mise à jour de l\'avatar', 'error');
            }
        } catch (error) {
            showNotification(error.message || 'Erreur lors de l\'upload', 'error');
        }
    });
}

/**
 * Initialise les préférences
 */
function initializePreferences() {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Charger la préférence sauvegardée
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    darkModeToggle.checked = isDarkMode;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        
        if (isChecked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        }

        showNotification(
            isChecked ? 'Mode sombre activé' : 'Mode clair activé',
            'success'
        );
    });

    // Autres préférences (email, newsletter)
    const emailNotifications = document.getElementById('emailNotifications');
    const newsletter = document.getElementById('newsletter');

    [emailNotifications, newsletter].forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const preference = e.target.id;
            const isChecked = e.target.checked;
            
            localStorage.setItem(preference, isChecked);
            showNotification('Préférence mise à jour', 'success');
        });
    });

    // Charger les préférences
    emailNotifications.checked = localStorage.getItem('emailNotifications') !== 'false';
    newsletter.checked = localStorage.getItem('newsletter') !== 'false';
}

/**
 * Initialise les toggles de mot de passe
 */
function initializePasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                btn.classList.add('active');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                btn.classList.remove('active');
            }
        });
    });
}

/**
 * Initialise le bouton de déconnexion
 */
function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            window.authManager.logout();
            showNotification('Déconnexion réussie', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    });
}

/**
 * Initialise le bouton de suppression de compte
 */
function initializeDeleteAccount() {
    const deleteBtn = document.getElementById('deleteAccountBtn');
    
    deleteBtn.addEventListener('click', () => {
        const confirmation = prompt(
            'Cette action est irréversible. Pour confirmer, tapez "SUPPRIMER" en majuscules :'
        );

        if (confirmation === 'SUPPRIMER') {
            const user = window.authManager.getCurrentUser();
            
            // Supprimer l'utilisateur du localStorage
            const users = window.authManager.getAllUsers();
            const updatedUsers = users.filter(u => u.id !== user.id);
            localStorage.setItem('user_data', JSON.stringify(updatedUsers));
            
            // Déconnecter
            window.authManager.logout();
            
            alert('Votre compte a été supprimé avec succès.');
            window.location.href = 'index.html';
        } else if (confirmation !== null) {
            alert('Suppression annulée. Le texte de confirmation ne correspond pas.');
        }
    });
}

/**
 * Affiche un message dans un élément
 * @param {HTMLElement} element - Élément message
 * @param {string} message - Message à afficher
 * @param {string} type - Type (success, error, info)
 */
function showMessage(element, message, type = 'info') {
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.style.display = 'flex';
    
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Efface un message
 * @param {HTMLElement} element - Élément message
 */
function clearMessage(element) {
    element.style.display = 'none';
    element.textContent = '';
    element.className = 'form-message';
}

/**
 * Affiche une notification toast
 * @param {string} message - Message à afficher
 * @param {string} type - Type (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification toast-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Ajouter les styles inline si pas de CSS dédié
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#4A74F3',
        color: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '15px',
        fontWeight: '500',
        animation: 'slideInRight 0.3s ease-out'
    });

    document.body.appendChild(notification);

    // Retirer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Ajouter les animations pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);