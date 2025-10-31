/* ===================================
   AUTHENTICATION MANAGER
   Système centralisé de gestion des utilisateurs
   Version 2024 - Support Backend ready
   =================================== */

class AuthManager {
    constructor() {
        this.STORAGE_KEY = 'user_session';
        this.USER_DATA_KEY = 'user_data';
        this.currentUser = null;
        this.listeners = [];
        
        // Charger la session au démarrage
        this.loadSession();
    }

    /**
     * Charge la session utilisateur depuis localStorage
     */
    loadSession() {
        try {
            const sessionData = localStorage.getItem(this.STORAGE_KEY);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                
                // Vérifier si la session n'est pas expirée
                if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
                    this.currentUser = session.user;
                    this.notifyListeners('login', this.currentUser);
                } else {
                    // Session expirée
                    this.logout();
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la session:', error);
            this.logout();
        }
    }

    /**
     * Sauvegarde la session utilisateur
     * @param {Object} user - Données utilisateur
     * @param {boolean} rememberMe - Se souvenir de moi
     */
    saveSession(user, rememberMe = false) {
        const expiresAt = rememberMe 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
            : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

        const session = {
            user: user,
            expiresAt: expiresAt.toISOString(),
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        this.currentUser = user;
        this.notifyListeners('login', user);
    }

    /**
     * Inscription d'un nouvel utilisateur
     * @param {Object} userData - Données d'inscription
     * @returns {Promise<Object>} - Résultat de l'inscription
     */
    async register(userData) {
        try {
            // Validation des données
            this.validateRegistrationData(userData);

            // Vérifier si l'email existe déjà (localStorage pour version simple)
            const users = this.getAllUsers();
            const emailExists = users.some(u => u.email === userData.email);
            
            if (emailExists) {
                throw new Error('Cet email est déjà utilisé');
            }

            // Créer l'utilisateur
            const newUser = {
                id: this.generateUserId(),
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone || '',
                company: userData.company || '',
                avatar: userData.avatar || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Ne JAMAIS stocker le mot de passe en clair en production !
                // Ceci est une version simplifiée pour démo
                passwordHash: this.simpleHash(userData.password)
            };

            // Sauvegarder l'utilisateur
            users.push(newUser);
            localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(users));

            // Créer la session
            const userSession = this.sanitizeUserData(newUser);
            this.saveSession(userSession, userData.rememberMe);

            return {
                success: true,
                user: userSession,
                message: 'Inscription réussie !'
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Connexion d'un utilisateur
     * @param {string} email - Email
     * @param {string} password - Mot de passe
     * @param {boolean} rememberMe - Se souvenir de moi
     * @returns {Promise<Object>} - Résultat de la connexion
     */
    async login(email, password, rememberMe = false) {
        try {
            const users = this.getAllUsers();
            const user = users.find(u => 
                u.email === email && 
                u.passwordHash === this.simpleHash(password)
            );

            if (!user) {
                throw new Error('Email ou mot de passe incorrect');
            }

            // Créer la session
            const userSession = this.sanitizeUserData(user);
            this.saveSession(userSession, rememberMe);

            return {
                success: true,
                user: userSession,
                message: 'Connexion réussie !'
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Déconnexion
     */
    logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.currentUser = null;
        this.notifyListeners('logout');
    }

    /**
     * Mise à jour du profil utilisateur
     * @param {Object} updates - Données à mettre à jour
     * @returns {Promise<Object>} - Résultat de la mise à jour
     */
    async updateProfile(updates) {
        if (!this.currentUser) {
            return {
                success: false,
                message: 'Vous devez être connecté'
            };
        }

        try {
            const users = this.getAllUsers();
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);

            if (userIndex === -1) {
                throw new Error('Utilisateur introuvable');
            }

            // Mettre à jour les données
            users[userIndex] = {
                ...users[userIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            // Sauvegarder
            localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(users));

            // Mettre à jour la session
            const updatedUser = this.sanitizeUserData(users[userIndex]);
            this.currentUser = updatedUser;
            
            // Mettre à jour la session dans localStorage
            const session = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            session.user = updatedUser;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

            this.notifyListeners('update', updatedUser);

            return {
                success: true,
                user: updatedUser,
                message: 'Profil mis à jour avec succès'
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Upload d'avatar
     * @param {File} file - Fichier image
     * @returns {Promise<string>} - URL de l'image
     */
    async uploadAvatar(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Le fichier doit être une image'));
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                reject(new Error('L\'image ne doit pas dépasser 5 Mo'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Erreur lors de la lecture du fichier'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Vérifier si l'utilisateur est connecté
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Obtenir l'utilisateur actuel
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Obtenir tous les utilisateurs (pour gestion admin)
     * @returns {Array}
     */
    getAllUsers() {
        try {
            const users = localStorage.getItem(this.USER_DATA_KEY);
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            return [];
        }
    }

    /**
     * Validation des données d'inscription
     * @param {Object} data - Données à valider
     */
    validateRegistrationData(data) {
        const errors = [];

        // Email
        if (!data.email || !this.isValidEmail(data.email)) {
            errors.push('Email invalide');
        }

        // Mot de passe
        if (!data.password || data.password.length < 8) {
            errors.push('Le mot de passe doit contenir au moins 8 caractères');
        }

        // Confirmation mot de passe
        if (data.password !== data.confirmPassword) {
            errors.push('Les mots de passe ne correspondent pas');
        }

        // Nom
        if (!data.firstName || data.firstName.trim().length < 2) {
            errors.push('Le prénom doit contenir au moins 2 caractères');
        }

        if (!data.lastName || data.lastName.trim().length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }

    /**
     * Valider un email
     * @param {string} email - Email à valider
     * @returns {boolean}
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Hash simple (UNIQUEMENT POUR DÉMO - Utiliser bcrypt en production)
     * @param {string} str - Chaîne à hasher
     * @returns {string}
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    /**
     * Nettoyer les données utilisateur (enlever le mot de passe)
     * @param {Object} user - Utilisateur
     * @returns {Object}
     */
    sanitizeUserData(user) {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }

    /**
     * Générer un ID utilisateur unique
     * @returns {string}
     */
    generateUserId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Ajouter un listener pour les événements d'auth
     * @param {Function} callback - Fonction à appeler
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Retirer un listener
     * @param {Function} callback - Fonction à retirer
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * Notifier tous les listeners
     * @param {string} event - Type d'événement
     * @param {Object} data - Données à passer
     */
    notifyListeners(event, data = null) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Erreur dans le listener:', error);
            }
        });
    }
}

// Instance globale
window.authManager = new AuthManager();

// Export pour modules ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}