/* ===================================
   AUTHENTICATION PAGE SCRIPT
   Gestion des formulaires de connexion et inscription
   Version 2024
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    initializeAuthPage();
});

/**
 * Initialise la page d'authentification
 */
function initializeAuthPage() {
    // Vérifier si l'utilisateur est déjà connecté
    if (window.authManager && window.authManager.isAuthenticated()) {
        // Rediriger vers la page de profil
        window.location.href = 'profile.html';
        return;
    }

    // Initialiser les toggles
    initializeToggle();
    
    // Initialiser les formulaires
    initializeLoginForm();
    initializeRegisterForm();
    
    // Initialiser les boutons de mot de passe
    initializePasswordToggles();
    
    // Initialiser les validations en temps réel
    initializeRealTimeValidation();
}

/**
 * Initialise le toggle entre connexion et inscription
 */
function initializeToggle() {
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    const showLogin = () => {
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        clearMessages();
    };

    const showRegister = () => {
        registerToggle.classList.add('active');
        loginToggle.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        clearMessages();
    };

    loginToggle.addEventListener('click', showLogin);
    registerToggle.addEventListener('click', showRegister);
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showRegister();
    });
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });
}

/**
 * Initialise le formulaire de connexion
 */
function initializeLoginForm() {
    const form = document.getElementById('loginFormElement');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const messageEl = document.getElementById('loginMessage');
        
        // Récupérer les données
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe') === 'on';
        
        // Désactiver le bouton
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            // Appeler le AuthManager
            const result = await window.authManager.login(email, password, rememberMe);
            
            if (result.success) {
                showMessage(messageEl, result.message, 'success');
                
                // Rediriger après 1 seconde
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage(messageEl, result.message, 'error');
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        } catch (error) {
            showMessage(messageEl, 'Une erreur est survenue. Veuillez réessayer.', 'error');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
}

/**
 * Initialise le formulaire d'inscription
 */
function initializeRegisterForm() {
    const form = document.getElementById('registerFormElement');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const messageEl = document.getElementById('registerMessage');
        
        // Vérifier que les conditions sont acceptées
        const acceptTerms = form.querySelector('#acceptTerms');
        if (!acceptTerms.checked) {
            showMessage(messageEl, 'Vous devez accepter les conditions d\'utilisation', 'error');
            return;
        }
        
        // Récupérer les données
        const formData = new FormData(form);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            company: formData.get('company'),
            rememberMe: true
        };
        
        // Désactiver le bouton
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            // Appeler le AuthManager
            const result = await window.authManager.register(userData);
            
            if (result.success) {
                showMessage(messageEl, result.message, 'success');
                
                // Rediriger après 1.5 secondes
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showMessage(messageEl, result.message, 'error');
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        } catch (error) {
            showMessage(messageEl, 'Une erreur est survenue. Veuillez réessayer.', 'error');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
}

/**
 * Initialise les boutons de toggle des mots de passe
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
 * Initialise la validation en temps réel
 */
function initializeRealTimeValidation() {
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', () => {
            if (confirmPassword.value && registerPassword.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity('Les mots de passe ne correspondent pas');
            } else {
                confirmPassword.setCustomValidity('');
            }
        });
        
        registerPassword.addEventListener('input', () => {
            if (confirmPassword.value && registerPassword.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity('Les mots de passe ne correspondent pas');
            } else {
                confirmPassword.setCustomValidity('');
            }
        });
    }
}

/**
 * Affiche un message
 * @param {HTMLElement} element - Élément message
 * @param {string} message - Message à afficher
 * @param {string} type - Type de message (success, error, info)
 */
function showMessage(element, message, type = 'info') {
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.style.display = 'flex';
    
    // Scroll vers le message
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Efface tous les messages
 */
function clearMessages() {
    const messages = document.querySelectorAll('.form-message');
    messages.forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
        msg.className = 'form-message';
    });
}

/**
 * Gestion du mot de passe oublié
 */
const forgotPasswordLink = document.querySelector('.forgot-password');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        const email = prompt('Entrez votre adresse email pour réinitialiser votre mot de passe:');
        
        if (email && window.authManager.isValidEmail(email)) {
            alert(`Un email de réinitialisation a été envoyé à ${email}`);
            // TODO: Implémenter la logique de réinitialisation
        } else if (email) {
            alert('Adresse email invalide');
        }
    });
}