/* ============================================
   PRIVATE-CHAT-SYSTEM.JS - Chat Navigation v1.0
   🔗 Redirection intelligente vers le chat
   ============================================ */

class PrivateChatSystem {
    constructor() {
        this.initialized = false;
    }

    async initialize() {
        console.log('💬 Initializing Private Chat System...');
        this.initialized = true;
    }

    /**
     * Ouvrir une conversation avec un utilisateur
     * Redirige vers messages.html avec les infos de la conversation
     */
    async openChatWith(userId, userData = null) {
        try {
            console.log('💬 Redirecting to chat with:', userId);

            // ✅ Vérifier l'authentification
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                alert('Please log in to send messages');
                window.location.href = 'login.html';
                return;
            }

            // ✅ Vérifier qu'on n'essaie pas de s'envoyer un message à soi-même
            if (userId === currentUser.uid) {
                alert('You cannot send messages to yourself');
                return;
            }

            // ✅ Stocker les informations dans sessionStorage
            const chatData = {
                userId: userId,
                userData: userData,
                timestamp: Date.now()
            };

            sessionStorage.setItem('openChat', JSON.stringify(chatData));

            console.log('✅ Redirecting to messages.html...');

            // ✅ Rediriger vers la page de messages
            window.location.href = 'messages.html';

        } catch (error) {
            console.error('❌ Error opening chat:', error);
            alert('Failed to open chat. Please try again.');
        }
    }
}

// ✅ Initialiser globalement
document.addEventListener('DOMContentLoaded', () => {
    window.privateChatSystem = new PrivateChatSystem();
    window.privateChatSystem.initialize();
});

console.log('✅ private-chat-system.js loaded (v1.0)');